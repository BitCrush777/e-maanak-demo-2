import { Router } from 'express';
import { PrismaClient, ApplicationStatus, InspectionResult, CertificateStatus, InstrumentStatus } from '@prisma/client';
import Decimal from 'decimal.js';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const router = Router();

// Schemas
const createApplicationSchema = z.object({
  instrumentId: z.string().uuid(),
});

const submitReadingSchema = z.object({
  pointName: z.string(),
  referenceLoad: z.string(), // Decimal as string for precision
  observedValue: z.string(),
});

/**
 * GET /api/v1/applications
 * Get verification applications
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const status = req.query.status as string | undefined;

    const skip = (page - 1) * pageSize;
    const where: any = {};

    // Owner isolation
    if (req.user!.role === 'OWNER') {
      where.applicantId = req.user!.id;
    }

    // Officer sees assigned applications
    if (req.user!.role === 'OFFICER') {
      where.assignedOfficerId = req.user!.id;
    }

    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.verificationApplication.findMany({
        where,
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
          assignedOfficer: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          inspection: {
            select: {
              id: true,
              result: true,
              performedAt: true,
            },
          },
        },
      }),
      prisma.verificationApplication.count({ where }),
    ]);

    res.json({
      applications,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve applications.',
      },
    });
  }
});

/**
 * GET /api/v1/applications/:id
 * Get single application
 */
router.get('/:id', authenticate, async (req, res): Promise<any> => {
  try {
    const id = req.params.id as string;

    const application = await prisma.verificationApplication.findUnique({
      where: { id },
      include: {
        instrument: {
          select: {
            id: true,
            type: true,
            manufacturer: true,
            model: true,
            serialNumber: true,
            status: true,
          },
        },
        applicant: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        assignedOfficer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        inspection: {
          include: {
            readings: true,
            certificate: true,
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Application not found.',
        },
      });
    }

    // Authorization check
    if (req.user!.role === 'OWNER' && application.applicantId !== req.user!.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own applications.',
        },
      });
    }

    res.json({ application });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve application.',
      },
    });
  }
});

/**
 * POST /api/v1/applications
 * Create verification application (Owner only)
 */
router.post('/', authenticate, requireRole('OWNER'), validate(createApplicationSchema), async (req, res) => {
  try {
    const { instrumentId } = req.body;

    // Verify instrument ownership
    const instrument = await prisma.instrument.findUnique({
      where: { id: instrumentId },
    });

    if (!instrument) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Instrument not found.',
        },
      });
    }

    if (instrument.ownerId !== req.user!.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only create applications for your own instruments.',
        },
      });
    }

    const application = await prisma.verificationApplication.create({
      data: {
        instrumentId,
        applicantId: req.user!.id,
        status: ApplicationStatus.SUBMITTED,
      },
      include: {
        instrument: true,
      },
    });

    // Update instrument status
    await prisma.instrument.update({
      where: { id: instrumentId },
      data: { status: InstrumentStatus.PENDING_VERIFICATION },
    });

    res.status(201).json({ application });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create application.',
      },
    });
  }
});

export default router;
