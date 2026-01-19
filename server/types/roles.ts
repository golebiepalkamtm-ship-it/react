export type UserRole = 'USER_REGISTERED' | 'USER_EMAIL_VERIFIED' | 'USER_FULL_VERIFIED' | 'ADMIN';

export interface UserWithVerifications {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  phone?: string;
  phone_confirmed_at?: string | null;
  role?: UserRole;
}

export function calculateRole(user: UserWithVerifications): UserRole {
  // Admin check based on explicit role only - NO MAGIC EMAIL CHECK
  if (user.role === 'ADMIN') {
    return 'ADMIN';
  }
  
  // Full verification - email and phone confirmed
  if (user.email_confirmed_at && user.phone_confirmed_at) {
    return 'USER_FULL_VERIFIED';
  }
  
  // Email verified only
  if (user.email_confirmed_at) {
    return 'USER_EMAIL_VERIFIED';
  }
  
  // Default to registered
  return 'USER_REGISTERED';
}

export type Role = UserRole;
export type LegacyRole = UserRole;

export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    'USER_REGISTERED': 0,
    'USER_EMAIL_VERIFIED': 1,
    'USER_FULL_VERIFIED': 2,
    'ADMIN': 3
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[minimumRole];
}

// Role constants for use as values
export const Role = {
  USER_REGISTERED: 'USER_REGISTERED' as const,
  USER_EMAIL_VERIFIED: 'USER_EMAIL_VERIFIED' as const,
  USER_FULL_VERIFIED: 'USER_FULL_VERIFIED' as const,
  ADMIN: 'ADMIN' as const,
  // Additional role aliases for compatibility
  SELLER: 'USER_FULL_VERIFIED' as const,
  BUYER: 'USER_REGISTERED' as const,
};
