import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/loading-spinner';

// Hierarchia poziomów dostępu (od najniższego do najwyższego)
const ROLE_HIERARCHY: Record<UserRole, number> = {
  'USER_REGISTERED': 1,      // Poziom 1: tylko zalogowany
  'USER_EMAIL_VERIFIED': 2,  // Poziom 2: email zweryfikowany, dostęp do profilu
  'USER_FULL_VERIFIED': 3,   // Poziom 3: pełny dostęp (aukcje, licytacje)
  'ADMIN': 4,                // Poziom 4: administrator
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;        // Dokładna rola (np. tylko ADMIN)
  minRole?: UserRole;             // Minimalna rola (np. USER_FULL_VERIFIED lub wyżej)
  allowUnverified?: boolean;      // Czy pozwolić USER_REGISTERED
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole,
  minRole,
  allowUnverified = false 
}: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/auth?mode=login&callbackUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Jeśli profil jeszcze się nie wczytał:
  // - dla allowUnverified wpuszczamy dalej (np. demo/środowiska bez profilu),
  // - w pozostałych przypadkach czekamy na załadowanie profilu.
  if (!profile) {
    if (allowUnverified) {
      return <>{children}</>;
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const userRoleLevel = ROLE_HIERARCHY[profile.role];

  // If exact role is required (e.g. ADMIN only)
  if (requiredRole) {
    if (!profile || profile.role !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  // If minimum role level is required (e.g. USER_FULL_VERIFIED or higher)
  if (minRole) {
    const minRoleLevel = ROLE_HIERARCHY[minRole];
    if (userRoleLevel < minRoleLevel) {
      // Redirect based on current role
      if (profile?.role === 'USER_REGISTERED') {
        return <Navigate to="/verify-email" replace />;
      } else if (profile?.role === 'USER_EMAIL_VERIFIED') {
        // User needs to complete profile and verify phone
        return <Navigate to="/" state={{ openAccount: true, needsFullVerification: true }} replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  // Logic for unverified users (USER_REGISTERED)
  if (!allowUnverified && profile?.role === 'USER_REGISTERED') {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
};

// Helper function to check if user has required access level
export const hasMinRole = (userRole: UserRole | undefined, minRole: UserRole): boolean => {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
};

// Helper function to check if user can perform auction actions
export const canCreateAuction = (userRole: UserRole | undefined): boolean => {
  return hasMinRole(userRole, 'USER_FULL_VERIFIED');
};

export const canBid = (userRole: UserRole | undefined): boolean => {
  return hasMinRole(userRole, 'USER_FULL_VERIFIED');
};

export const canAccessProfile = (userRole: UserRole | undefined): boolean => {
  return hasMinRole(userRole, 'USER_EMAIL_VERIFIED');
};

export default ProtectedRoute;
