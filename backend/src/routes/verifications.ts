import { Router } from 'express';
import { PrismaClient, InspectionResult, ApplicationStatus, InstrumentStatus, CertificateStatus } from '@prisma/client';
import Decimal from 'decimal.js';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const router = Router();

// Schemas
const inspectionSchema = z.object({
  applicationId: z.string().uuid(),
  ruleId: z.string().uuid(),
  clientOperationId: z.string().uuid().optional(),
  notes: z.string().optional(),
  readings: z.array(z.object({
    pointName: z.string(),
    referenceLoad: z.string(),
    observedValue: z.string(),
  })),
});

/**
 * GET /api/v1/verifications/rules
 * Get active verification rules
 */
router.get('/rules', authenticate, async (_req, res) => {
  try {
    const rules = await prisma.instrumentTypeRule.findMany({
      where: { isActive: true },
      orderBy: { instrumentType: 'asc' },
    });

    res.json({ rules });
  } catch (error) {
    console.error('Get rules error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve verification rules.',
      },
    });
  }
});

/**
 * GET /api/v1/verifications/queue
 * Get inspection queue for officers
 */
router.get('/queue', authenticate, requireRole('OFFICER', 'ADMIN'), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const skip = (page - 1) * pageSize;

    const applications = await prisma.verificationApplication.findMany({
      where: {
        status: {
          in: [ApplicationStatus.SUBMITTED, ApplicationStatus.ASSIGNED, ApplicationStatus.UNDER_REVIEW],
        },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        instrument: {
          select: {
            id: true,
            type: true,
            manufacturer: true,
            model: true,
            serialNumber: true,
          },
        },
        applicant: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    const total = await prisma.verificationApplication.count({
      where: {
        status: {
          in: [ApplicationStatus.SUBMITTED, ApplicationStatus.ASSIGNED, ApplicationStatus.UNDER_REVIEW],
        },
      },
    });

    res.json({
      applications,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Get queue error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve inspection queue.',
      },
    });
  }
});

/**
 * POST /api/v1/verifications/inspect
 * Perform verification inspection (Officer only)
 */
router.post('/inspect', authenticate, requireRole('OFFICER'), validate(inspectionSchema), async (req, res): Promise<any> => {
  try {
    const { applicationId, ruleId, clientOperationId, notes, readings } = req.body;

    // Idempotency check
    if (clientOperationId) {
      const existingInspection = await prisma.verificationInspection.findUnique({
        where: { clientOperationId },
      });

      if (existingInspection) {
        return res.json({
          inspection: existingInspection,
          message: 'Inspection already processed (idempotent)',
        });
      }
    }

    // Verify application exists and is in correct state
    const application = await prisma.verificationApplication.findUnique({
      where: { id: applicationId },
      include: { instrument: true },
    });

    if (!application) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Application not found.',
        },
      });
    }

    // Get rule
    const rule = await prisma.instrumentTypeRule.findUnique({
      where: { id: ruleId },
    });

    if (!rule) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Verification rule not found.',
        },
      });
    }

    // Process readings with authoritative calculation
    const toleranceConfig = rule.toleranceConfig as any;
    const absoluteTolerance = new Decimal(toleranceConfig.absoluteTolerance || '0');

    let overallResult: InspectionResult = InspectionResult.PASS;
    const processedReadings = [];

    for (const reading of readings) {
      const reference = new Decimal(reading.referenceLoad);
      const observed = new Decimal(reading.observedValue);
      const error = observed.minus(reference);
      
      let percentageError = new Decimal(0);
      if (!reference.isZero()) {
        percentageError = error.dividedBy(reference).times(100);
      }

      // Determine pass/fail using absolute tolerance
      const absError = error.abs();
      const result = absError.lessThanOrEqualTo(absoluteTolerance) 
        ? InspectionResult.PASS 
        : InspectionResult.FAIL;

      if (result === InspectionResult.FAIL) {
        overallResult = InspectionResult.FAIL;
      }

      processedReadings.push({
        pointName: reading.pointName,
        referenceLoad: reference,
        observedValue: observed,
        error,
        percentageError,
        result,
      });
    }

    // Create inspection with readings
    const inspection = await prisma.verificationInspection.create({
      data: {
        applicationId,
        officerId: req.user!.id,
        ruleId,
        result: overallResult,
        clientOperationId,
        notes,
        performedAt: new Date(),
        readings: {
          create: processedReadings.map(r => ({
            pointName: r.pointName,
            referenceLoad: r.referenceLoad,
            observedValue: r.observedValue,
            error: r.error,
            percentageError: r.percentageError,
            result: r.result,
          })),
        },
      },
      include: {
        readings: true,
      },
    });

    // Update application status
    await prisma.verificationApplication.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.INSPECTION_COMPLETED,
      },
    });

    // Update instrument status
    await prisma.instrument.update({
      where: { id: application.instrumentId },
      data: {
        status: overallResult === InspectionResult.PASS 
          ? InstrumentStatus.VERIFIED 
          : InstrumentStatus.FAILED,
      },
    });

    // Generate certificate if PASS
    let certificate = null;
    if (overallResult === InspectionResult.PASS) {
      const certificateNumber = `CERT-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;
      const qrToken = uuidv4();
      const issueDate = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + (application.instrument.verificationInterval || 12));

      certificate = await prisma.certificate.create({
        data: {
          certificateNumber,
          verificationInspectionId: inspection.id,
          qrToken,
          issueDate,
          expiryDate,
          status: CertificateStatus.VALID,
        },
      });

      // Update application status
      await prisma.verificationApplication.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.CERTIFICATE_ISSUED,
        },
      });
    }

    res.status(201).json({
      inspection,
      certificate,
      result: overallResult,
    });
  } catch (error) {
    console.error('Inspection error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to perform inspection.',
      },
    });
  }
});

/**
 * POST /api/v1/verifications/sync
 * Sync offline inspections (Officer only)
 */
router.post('/sync', authenticate, requireRole('OFFICER'), validate(inspectionSchema), async (req, res): Promise<any> => {
  // Reuse inspect logic with idempotency
  return (router as any).handle(req, res, () => {});
});

export default router;
