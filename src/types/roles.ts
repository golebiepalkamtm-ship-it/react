export enum Role {
  BUYER = 'BUYER',
  SELLER = 'SELLER', 
  ADMIN = 'ADMIN'
}

export type LegacyRole = 'USER_REGISTERED' | 'USER_EMAIL_VERIFIED' | 'USER_FULL_VERIFIED' | 'ADMIN';

export interface UserWithVerifications {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  phone?: string;
  phone_confirmed_at?: string | null;
  role?: LegacyRole;
}

/**
 * Calculate user role based on verification status and existing role
 * Single source of truth for role calculation logic
 */
export function calculateRole(user: UserWithVerifications): LegacyRole {
  // If DB indicates ADMIN, respect it (no heuristics)
  if (user.role === 'ADMIN') return 'ADMIN';
  
  // NOTE: We do NOT promote to ADMIN based on email here.
  // Admin role must be granted explicitly in the database.

  if (user.role === 'USER_FULL_VERIFIED') return 'USER_FULL_VERIFIED';

  const isEmailConfirmed = Boolean(user.email_confirmed_at);
  const isPhoneConfirmed = Boolean(user.phone_confirmed_at);

  if (isPhoneConfirmed && isEmailConfirmed) {
    return 'USER_FULL_VERIFIED';
  }
  
  return isEmailConfirmed ? 'USER_EMAIL_VERIFIED' : 'USER_REGISTERED';
}

/**
 * Map legacy role to new role system
 */
export function mapLegacyToNewRole(legacyRole: LegacyRole): Role {
  switch (legacyRole) {
    case 'ADMIN':
      return Role.ADMIN;
    case 'USER_FULL_VERIFIED':
      return Role.SELLER; // Full verified users can sell
    case 'USER_EMAIL_VERIFIED':
    case 'USER_REGISTERED':
      return Role.BUYER; // Basic users can buy
    default:
      return Role.BUYER;
  }
}

/**
 * Check if user has minimum required role
 */
export function hasMinimumRole(userRole: LegacyRole, minimumRole: Role): boolean {
  const newRole = mapLegacyToNewRole(userRole);
  
  const roleHierarchy = {
    [Role.BUYER]: 0,
    [Role.SELLER]: 1,
    [Role.ADMIN]: 2
  };
  
  return roleHierarchy[newRole] >= roleHierarchy[minimumRole];
}

/**
 * Check if user can perform seller actions
 */
export function canSell(userRole: LegacyRole): boolean {
  return hasMinimumRole(userRole, Role.SELLER);
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: LegacyRole): boolean {
  return userRole === 'ADMIN';
}

/** Licytacja i buy-now wymagają pełnej weryfikacji (email + SMS) */
export function canBid(userRole: LegacyRole | undefined): boolean {
  if (!userRole) return false;
  return userRole === 'USER_FULL_VERIFIED' || userRole === 'ADMIN';
}

/** Wystawianie aukcji wymaga pełnej weryfikacji */
export function canCreateAuction(userRole: LegacyRole | undefined): boolean {
  return canBid(userRole);
}
