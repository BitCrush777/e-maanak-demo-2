import { Router } from 'express';
import { PrismaClient, CertificateStatus } from '@prisma/client';
import { verificationLimiter } from '../middleware/errorHandler';

const prisma = new PrismaClient();
const router = Router();

/**
 * GET /api/v1/public/verify/:token
 * Public certificate verification via QR token
 * No authentication required
 */
router.get('/verify/:token', verificationLimiter, async (req, res): Promise<any> => {
  try {
    const token = req.params.token as string;

    const certificate = await prisma.certificate.findUnique({
      where: { qrToken: token },
      include: {
        verificationInspection: {
          include: {
            rule: {
              select: {
                ruleCode: true,
                ruleVersion: true,
                description: true,
              },
            },
            application: {
              include: {
                instrument: {
                  select: {
                    type: true,
                    manufacturer: true,
                    model: true,
                    serialNumber: true,
                    ratedCapacity: true,
                  },
                },
              },
            },
            officer: {
              select: {
                fullName: true,
              },
            },
            readings: {
              select: {
                pointName: true,
                referenceLoad: true,
                observedValue: true,
                error: true,
                percentageError: true,
                result: true,
              },
            },
          },
        },
      },
    });

    if (!certificate) {
      return res.json({
        status: 'INVALID',
        message: 'Certificate not found.',
      });
    }

    const cert: any = certificate;

    // Determine current status dynamically
    let status = cert.status;
    let message = '';

    if (status === CertificateStatus.REVOKED) {
      message = 'This certificate has been revoked.';
    } else if (new Date() > cert.expiryDate) {
      // Update expired status
      if (status === CertificateStatus.VALID) {
        await prisma.certificate.update({
          where: { id: cert.id },
          data: { status: CertificateStatus.EXPIRED },
        });
        status = CertificateStatus.EXPIRED;
      }
      message = 'This certificate has expired.';
    } else if (status === CertificateStatus.VALID) {
      message = 'This certificate is valid.';
    } else {
      message = 'Certificate status is invalid.';
    }

    // Return sanitized public data only
    return res.json({
      status,
      message,
      certificate: {
        certificateNumber: cert.certificateNumber,
        qrToken: cert.qrToken,
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate,
        ruleCode: cert.verificationInspection?.rule?.ruleCode,
        ruleVersion: cert.verificationInspection?.rule?.ruleVersion,
        ruleDescription: cert.verificationInspection?.rule?.description,
        instrument: {
          type: cert.verificationInspection?.application?.instrument?.type,
          manufacturer: cert.verificationInspection?.application?.instrument?.manufacturer,
          model: cert.verificationInspection?.application?.instrument?.model,
          serialNumber: cert.verificationInspection?.application?.instrument?.serialNumber,
          ratedCapacity: cert.verificationInspection?.application?.instrument?.ratedCapacity,
        },
        verificationOfficer: cert.verificationInspection?.officer?.fullName,
        result: cert.verificationInspection?.result,
        readings: cert.verificationInspection?.readings,
      },
    });
  } catch (error) {
    console.error('Public verification error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Verification failed.',
      },
    });
  }
});

export default router;
