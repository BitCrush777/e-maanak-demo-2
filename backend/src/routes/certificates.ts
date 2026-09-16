import { Router } from 'express';
import { PrismaClient, CertificateStatus } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';
import { verificationLimiter } from '../middleware/errorHandler';

const prisma = new PrismaClient();
const router = Router();

/**
 * GET /api/v1/certificates
 * Get certificates
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
      const ownerInstruments = await prisma.instrument.findMany({
        where: { ownerId: req.user!.id },
        select: { id: true },
      });

      where.verificationInspection = {
        application: {
          instrumentId: {
            in: ownerInstruments.map(i => i.id),
          },
        },
      };
    }

    if (status) {
      where.status = status;
    }

    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { issueDate: 'desc' },
        include: {
          verificationInspection: {
            include: {
              application: {
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
                },
              },
            },
          },
        },
      }),
      prisma.certificate.count({ where }),
    ]);

    res.json({
      certificates,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve certificates.',
      },
    });
  }
});

/**
 * GET /api/v1/certificates/:certificateNumber
 * Get certificate by number
 */
router.get('/:certificateNumber', authenticate, async (req, res) => {
  try {
    const { certificateNumber } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: { certificateNumber },
      include: {
        verificationInspection: {
          include: {
            readings: true,
            officer: {
              select: {
                id: true,
                fullName: true,
              },
            },
            application: {
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
              },
            },
          },
        },
      },
    });

    if (!certificate) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Certificate not found.',
        },
      });
    }

    // Authorization check for owners
    if (req.user!.role === 'OWNER') {
      const instrumentId = certificate.verificationInspection.application.instrumentId;
      const instrument = await prisma.instrument.findUnique({
        where: { id: instrumentId },
      });

      if (!instrument || instrument.ownerId !== req.user!.id) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You can only access your own certificates.',
          },
        });
      }
    }

    res.json({ certificate });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve certificate.',
      },
    });
  }
});

/**
 * POST /api/v1/certificates/:certificateNumber/revoke
 * Revoke certificate (Officer/Admin only)
 */
router.post('/:certificateNumber/revoke', authenticate, requireRole('OFFICER', 'ADMIN'), async (req, res) => {
  try {
    const { certificateNumber } = req.params;
    const { revocationReason } = req.body;

    if (!revocationReason) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Revocation reason is required.',
        },
      });
    }

    const certificate = await prisma.certificate.findUnique({
      where: { certificateNumber },
    });

    if (!certificate) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Certificate not found.',
        },
      });
    }

    if (certificate.status !== CertificateStatus.VALID) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Only valid certificates can be revoked.',
        },
      });
    }

    const revoked = await prisma.certificate.update({
      where: { certificateNumber },
      data: {
        status: CertificateStatus.REVOKED,
        revokedAt: new Date(),
        revocationReason,
        revokedById: req.user!.id,
      },
    });

    res.json({
      certificate: revoked,
      message: 'Certificate revoked successfully.',
    });
  } catch (error) {
    console.error('Revoke certificate error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to revoke certificate.',
      },
    });
  }
});

export default router;
