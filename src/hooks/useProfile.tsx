// src/hooks/useProfile.tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useProfile = () => {
  const { user, profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateUserProfile = async (updates: {
    name?: string;
    phone?: string;
    role?: 'USER_REGISTERED' | 'USER_EMAIL_VERIFIED' | 'USER_FULL_VERIFIED' | 'ADMIN';
  }) => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      await updateProfile(updates);
    } catch (err: any) {
      setError(err.message);
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