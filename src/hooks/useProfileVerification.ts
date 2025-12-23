import { useAuth } from '@/contexts/AuthContext';

interface VerificationResult {
  canBid: boolean;
  missingFields: string[];
}

export const useProfileVerification = (): VerificationResult => {
  const { user } = useAuth();

  if (!user) {
    return {
      canBid: false,
      missingFields: ['Musisz być zalogowany']
    };
  }

  const missingFields: string[] = [];

  if (!user.phoneNumber) {
    missingFields.push('Numer telefonu');
  }

  if (!user.displayName) {
    missingFields.push('Imię i nazwisko');
  }

  return {
    canBid: missingFields.length === 0,
    missingFields
  };
};
