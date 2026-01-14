import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useProfileVerification = () => {
  const { user, profile, loading } = useAuth();
  
  const isVerified = useMemo(() => {
    if (loading) return false;
    if (!user || !profile) return false;
    return profile.role === 'USER_FULL_VERIFIED' || profile.role === 'ADMIN';
  }, [loading, profile, user]);

  const canBid = useMemo(() => {
    if (loading) return false;
    if (!user || !profile) return false;
    // Allow bidding for verified users and admins
    return profile.role === 'USER_FULL_VERIFIED' || profile.role === 'ADMIN' || profile.role === 'USER_EMAIL_VERIFIED';
  }, [loading, profile, user]);

  const missingFields = useMemo(() => {
    if (!profile) return ['profil'];
    const missing: string[] = [];
    if (!profile.first_name) missing.push('imię');
    if (!profile.last_name) missing.push('nazwisko');
    if (!profile.phone) missing.push('telefon');
    if (!profile.city) missing.push('miasto');
    return missing;
  }, [profile]);

  return { isVerified, canBid, missingFields };
};
