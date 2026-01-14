import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { Role, hasMinimumRole, LegacyRole } from '../types/roles.js';

/**
 * Middleware to check if user has minimum required role
 */
export function requireRole(minimumRole: Role) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.role) {
        return res.status(401).json({ error: 'User role not found' });
      }

      if (!hasMinimumRole(req.user.role as LegacyRole, minimumRole)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: minimumRole,
          current: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Role verification failed' });
    }
  };
}

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole(Role.ADMIN);

/**
 * Middleware to check if user can sell (seller or admin)
 */
export const requireSeller = requireRole(Role.SELLER);

/**
 * Middleware to check if user can buy (any authenticated user)
 */
export const requireBuyer = requireRole(Role.BUYER);

/**
 * Helper function to check role without middleware
 */
export function checkUserRole(userRole: LegacyRole, minimumRole: Role): boolean {
  return hasMinimumRole(userRole, minimumRole);
}
