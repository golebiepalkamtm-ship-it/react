import React, { createContext, useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { logger } from '@/lib/logger';
import { calculateRole, UserWithVerifications } from '../types/roles.js';
import { useSession } from './SessionContext';

export type UserRole = 'USER_REGISTERED' | 'USER_EMAIL_VERIFIED' | 'USER_FULL_VERIFIED' | 'ADMIN';

export interface Profile {
  id: string;
  email?: string;
  phone?: string;
  username: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  avatar_url?: string;
  street?: string;
  postal_code?: string;
  country?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

interface UserContextType {
  profile: Profile | null;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  showUserPanel: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, refreshSession } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);

  const isEmailConfirmed = useCallback((authUser: User) => {
    const u = authUser as any;
    return Boolean(u?.email_confirmed_at || u?.confirmed_at);
  }, []);

  const isPhoneConfirmed = useCallback((authUser: User) => {
    const u = authUser as any;
    return Boolean(u?.phone_confirmed_at);
  }, []);

  const computeRole = useCallback((authUser: User, existingProfile?: Profile | null) => {
    const userWithVerifications: UserWithVerifications = {
      id: authUser.id,
      email: authUser.email,
      email_confirmed_at: (authUser as any).email_confirmed_at || (authUser as any).confirmed_at,
      phone: authUser.phone,
      phone_confirmed_at: (authUser as any).phone_confirmed_at,
      role: existingProfile?.role
    };
    
    return calculateRole(userWithVerifications);
  }, []);

  const ensureProfile = useCallback(async (authUser: User, existingProfile: Profile | null) => {
    const client = supabase;
    if (!client) return existingProfile;
    
    const desiredRole = computeRole(authUser, existingProfile);
    
    const payload: Partial<Profile> & { id: string } = {
      id: authUser.id,
    };

    if (!existingProfile) {
      payload.role = desiredRole;
      if (authUser.email) payload.email = authUser.email;
    } else {
      if (existingProfile.email !== authUser.email && authUser.email) {
        payload.email = authUser.email;
      }
      
      if (desiredRole === 'ADMIN' && existingProfile.role !== 'ADMIN') {
         payload.role = desiredRole;
      }
    }

    const needsUpsert =
      !existingProfile ||
      (payload.email && payload.email !== existingProfile.email) ||
      (payload.role && payload.role !== existingProfile.role);

    if (!needsUpsert) return existingProfile;

    const { data, error } = await client
      .from('users')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) {
      logger.error('Error ensuring profile:', error);
      return existingProfile;
    }
    return data as Profile;
  }, [computeRole]);

  const fetchProfile = useCallback(async (authUser: User) => {
    const client = supabase;
    if (!client) {
      return;
    }
    try {
      const queryPromise = client
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) => {
        setTimeout(() => resolve({ data: null, error: { message: 'Profile fetch timeout' } }), 30000);
      });

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        logger.error('Error fetching profile:', error);
        try {
          const ensured = await ensureProfile(authUser, null);
          setProfile(ensured);
        } catch (ensureError) {
          logger.error('Error ensuring profile after fetch error:', ensureError);
          setProfile(null);
        }
      } else {
        try {
          const ensured = await ensureProfile(authUser, (data as Profile | null) ?? null);
          setProfile(ensured);
        } catch (ensureError) {
          logger.error('Error ensuring profile after successful fetch:', ensureError);
          setProfile(null);
        }
      }
    } catch (error) {
      logger.error('Error fetching profile:', error);
      try {
        const ensured = await ensureProfile(authUser, null);
        setProfile(ensured);
      } catch (ensureError) {
        logger.error('Error ensuring profile after catch error:', ensureError);
        setProfile(null);
      }
    }
  }, [ensureProfile]);

  useEffect(() => {
    let isMounted = true;
    
    const loadProfile = async () => {
      if (user && isMounted) {
        await fetchProfile(user);
      } else if (!user && isMounted) {
        setProfile(null);
      }
    };
    
    void loadProfile();
    
    return () => {
      isMounted = false;
    };
  }, [user, fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) {
      throw new Error('Brak aktywnej sesji użytkownika');
    }
    const client = supabase;
    if (!client) {
      throw new Error('Brak połączenia z bazą danych');
    }

    const payload: Partial<Profile> & { id: string } = { id: user.id, ...updates };
    if (user.email && payload.email == null) payload.email = user.email;

    const { data, error } = await client
      .from('users')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) {
      logger.error('Error upserting profile:', { error, payload });
      throw error;
    }

    if (!data) {
      throw new Error('Nie udało się zapisać profilu');
    }

    await refreshSession();
    if (user) {
      await fetchProfile(user);
    }
  }, [user, refreshSession, fetchProfile]);

  const showUserPanel = useCallback(() => {
    window.dispatchEvent(new CustomEvent('showUserPanel'));
  }, []);

  const value = useMemo<UserContextType>(() => ({
    profile,
    updateProfile,
    showUserPanel,
  }), [profile, updateProfile, showUserPanel]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
