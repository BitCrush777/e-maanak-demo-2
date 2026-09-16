import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { authLimiter } from '../middleware/errorHandler';
import { z } from 'zod';
import { findUserBySupabaseId } from '../services/userService';

const router = Router();

// Schema for profile request
const profileSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(100),
});

/**
 * POST /api/v1/auth/profile
 * Get or create user profile after Supabase Auth login
 */
router.post('/profile', authLimiter, validate(profileSchema), async (req, res) => {
  try {
    const { email, fullName } = req.body;
    const supabaseAuthId = req.headers['x-supabase-user-id'] as string;

    if (!supabaseAuthId) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Missing Supabase user ID header.',
        },
      });
    }

    // Check if user exists
    let user = await findUserBySupabaseId(supabaseAuthId);

    if (!user) {
      // This endpoint should only be called by the frontend after successful Supabase Auth login
      // The user should already exist in the application database (provisioned by admin)
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found. Please contact administrator to provision your account.',
        },
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve profile.',
      },
    });
  }
});

/**
 * GET /api/v1/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user!.id,
      email: req.user!.email,
      fullName: req.user!.fullName,
      role: req.user!.role,
      status: req.user!.status,
    },
  });
});

/**
 * POST /api/v1/auth/logout
 * Logout (client-side Supabase logout is primary, this is for audit)
 */
router.post('/logout', authenticate, async (req, res) => {
  // Log out action for audit trail
  // Actual session invalidation happens on Supabase side
  
  res.json({
    message: 'Logged out successfully',
  });
});

export default router;
