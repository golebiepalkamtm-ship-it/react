// src/hooks/useProfile.tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useProfile = () => {
  const { user, profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateUserProfile = async (updates: {
    username?: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    street?: string;
    postal_code?: string;
    city?: string;
    country?: string;
    avatar_url?: string;
    role?: 'USER_REGISTERED' | 'USER_EMAIL_VERIFIED' | 'USER_FULL_VERIFIED' | 'ADMIN';
  }) => {
    if (!user) {
      const message = 'Brak aktywnej sesji użytkownika';
      setError(message);
      throw new Error(message);
    }

    setLoading(true);
    setError('');

    try {
      await updateProfile(updates);
    } catch (err: any) {
      const message = err?.message || err?.error || err?.statusText || JSON.stringify(err);
      setError(message);
      // Log full error for debugging
      
      console.error('Failed to update user profile:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async (name: string, phone: string) => {
    // This is for level 3, but phone verification is separate
    // Here we can update name, and phone will be updated during verification
    await updateUserProfile({ name });
  };

  return {
    profile,
    updateUserProfile,
    completeProfile,
    loading,
    error,
  };
};
