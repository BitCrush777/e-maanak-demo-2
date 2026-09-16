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
router.get('/verify/:token', verificationLimiter, async (req, res) => {
  try {
    const { token } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: { qrToken: token },
      include: {
        verificationInspection: {
          include: {
            application: {
              include: {
                instrument: {
                  select: {
                    type: true,
                    manufacturer: true,
                    model: true,
                    serialNumber: true,
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

    // Determine current status dynamically
    let status = certificate.status;
    let message = '';

    if (status === CertificateStatus.REVOKED) {
      message = 'This certificate has been revoked.';
    } else if (new Date() > certificate.expiryDate) {
      // Update expired status
      if (status === CertificateStatus.VALID) {
        await prisma.certificate.update({
          where: { id: certificate.id },
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
    res.json({
      status,
      message,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        issueDate: certificate.issueDate,
        expiryDate: certificate.expiryDate,
        instrument: {
          type: certificate.verificationInspection.application.instrument.type,
          manufacturer: certificate.verificationInspection.application.instrument.manufacturer,
          model: certificate.verificationInspection.application.instrument.model,
          serialNumber: certificate.verificationInspection.application.instrument.serialNumber,
        },
        verificationOfficer: certificate.verificationInspection.officer.fullName,
        result: certificate.verificationInspection.result,
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
