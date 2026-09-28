import { Router } from 'express';
import { PrismaClient, InstrumentStatus } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

// Schemas
const createInstrumentSchema = z.object({
  type: z.string().min(1).max(50),
  manufacturer: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  serialNumber: z.string().min(1).max(100),
  ratedCapacity: z.string().optional(),
  verificationInterval: z.number().int().positive().default(12),
});

const updateInstrumentSchema = z.object({
  type: z.string().min(1).max(50).optional(),
  manufacturer: z.string().min(1).max(100).optional(),
  model: z.string().min(1).max(100).optional(),
  ratedCapacity: z.string().optional(),
  verificationInterval: z.number().int().positive().optional(),
});

/**
 * GET /api/v1/instruments
 * Get all instruments for authenticated owner
 */
router.get('/', authenticate, requireRole('OWNER', 'OFFICER', 'ADMIN'), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;
    const search = req.query.search as string | undefined;

    const skip = (page - 1) * pageSize;

    const where: any = {};

    // Owner isolation: Owners can only see their own instruments
    if (req.user!.role === 'OWNER') {
      where.ownerId = req.user!.id;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [instruments, total] = await Promise.all([
      prisma.instrument.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.instrument.count({ where }),
    ]);

    res.json({
      instruments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Get instruments error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve instruments.',
      },
    });
  }
});

/**
 * GET /api/v1/instruments/:id
 * Get single instrument by ID
 */
router.get('/:id', authenticate, async (req, res): Promise<any> => {
  try {
    const id = req.params.id as string;

    const instrument = await prisma.instrument.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        applications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!instrument) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Instrument not found.',
        },
      });
    }

    // Owner isolation check
    if (req.user!.role === 'OWNER' && instrument.ownerId !== req.user!.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own instruments.',
        },
      });
    }

    res.json({ instrument });
  } catch (error) {
    console.error('Get instrument error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve instrument.',
      },
    });
  }
});

/**
 * POST /api/v1/instruments
 * Create new instrument (Owner only)
 */
router.post('/', authenticate, requireRole('OWNER'), validate(createInstrumentSchema), async (req, res): Promise<any> => {
  try {
    const { type, manufacturer, model, serialNumber, ratedCapacity, verificationInterval } = req.body;

    // Check for duplicate serial number for this owner
    const existing = await prisma.instrument.findUnique({
      where: {
        ownerId_serialNumber: {
          ownerId: req.user!.id,
          serialNumber,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: 'An instrument with this serial number already exists for your account.',
        },
      });
    }

    const instrument = await prisma.instrument.create({
      data: {
        ownerId: req.user!.id,
        type,
        manufacturer,
        model,
        serialNumber,
        ratedCapacity: ratedCapacity || null,
        verificationInterval,
        status: InstrumentStatus.REGISTERED,
      },
    });

    return res.status(201).json({ instrument });
  } catch (error) {
    console.error('Create instrument error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create instrument.',
      },
    });
  }
});

/**
 * PUT /api/v1/instruments/:id
 * Update instrument
 */
router.put('/:id', authenticate, requireRole('OWNER'), validate(updateInstrumentSchema), async (req, res): Promise<any> => {
  try {
    const id = req.params.id as string;
    const updateData = req.body;

    const instrument = await prisma.instrument.findUnique({
      where: { id },
    });

    if (!instrument) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Instrument not found.',
        },
      });
    }

    // Owner isolation check
    if (instrument.ownerId !== req.user!.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only modify your own instruments.',
        },
      });
    }

    // Don't allow changing status directly through update
    const { status, ...allowedUpdates } = updateData;

    const updated = await prisma.instrument.update({
      where: { id: id as string },
      data: allowedUpdates,
    });

    return res.json({ instrument: updated });
  } catch (error) {
    console.error('Update instrument error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update instrument.',
      },
    });
  }
});

export default router;
