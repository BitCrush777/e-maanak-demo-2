import { Request, Response, NextFunction } from 'express';
import { verifySupabaseToken, SupabaseUser } from '../utils/jwt';
import { findUserBySupabaseId, AuthenticatedUser } from '../services/userService';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      supabaseUser?: SupabaseUser;
    }
  }
}

/**
 * Authentication middleware
 * Validates Supabase JWT token and resolves application user
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
      });
      return;
    }

    const token = authHeader.substring(7);

    // Verify Supabase token
    const supabaseUser = await verifySupabaseToken(token);
    req.supabaseUser = supabaseUser;

    // Find application user
    const appUser = await findUserBySupabaseId(supabaseUser.sub);

    if (!appUser) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Application user not found. Please contact administrator.',
        },
      });
      return;
    }

    // Check user status
    if (appUser.status !== 'ACTIVE') {
      res.status(403).json({
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Account is not active. Please contact administrator.',
        },
      });
      return;
    }

    req.user = appUser;
    next();
  } catch (error) {
    if (error instanceof Error && error.message === 'Token expired') {
      res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Session expired. Please login again.',
        },
      });
      return;
    }

    if (error instanceof Error && error.message === 'Invalid token') {
      res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token.',
        },
      });
      return;
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed.',
      },
    });
  }
}

/**
 * Role-based access control middleware
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient privileges for this operation.',
        },
      });
      return;
    }

    next();
  };
}

/**
 * Optional authentication - attaches user if token present but doesn't require it
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const supabaseUser = await verifySupabaseToken(token);
      const appUser = await findUserBySupabaseId(supabaseUser.sub);

      if (appUser && appUser.status === 'ACTIVE') {
        req.user = appUser;
        req.supabaseUser = supabaseUser;
      }
    }
  } catch (error) {
    // Silently ignore auth errors for optional auth
  }

  next();
}
