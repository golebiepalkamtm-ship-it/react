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

  const ensureProfile = useCallback(async (authUser: User, existingProfile: Profile | null) => {
    // Completely rely on DB triggers. Do not write to DB from client on load.
    if (existingProfile) return existingProfile;

    // If profile is missing (race condition), return a temporary read-only object
    // derived from Auth User to allow UI to render.
    const userWithVerifications: UserWithVerifications = {
      id: authUser.id,
      email: authUser.email,
      email_confirmed_at: (authUser as any).email_confirmed_at || (authUser as any).confirmed_at,
      phone: authUser.phone,
      phone_confirmed_at: (authUser as any).phone_confirmed_at,
      role: 'USER_REGISTERED'
    };
    
    const role = calculateRole(userWithVerifications);

    return {
      id: authUser.id,
      email: authUser.email,
      phone: authUser.phone,
      username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'User',
      role: role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name: authUser.user_metadata?.full_name,
      avatar_url: authUser.user_metadata?.avatar_url
    } as Profile;
  }, []);

  const fetchProfile = useCallback(async (authUser: User) => {
    const client = supabase;
    if (!client) return;

    try {
      const { data, error } = await client
        .from('users')
        .select()
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        logger.error('Error fetching profile:', error);
        setProfile(await ensureProfile(authUser, null));
      } else {
        setProfile(await ensureProfile(authUser, (data as Profile | null) ?? null));
      }
    } catch (error) {
      logger.error('Error fetching profile:', error);
      setProfile(await ensureProfile(authUser, null));
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

    // Strip protected fields to avoid trigger rejection or constraint violations
    const safeUpdates = { ...updates };
    delete (safeUpdates as any).role;
    delete (safeUpdates as any).id;
    delete (safeUpdates as any).email;
    delete (safeUpdates as any).created_at;
    delete (safeUpdates as any).updated_at;
    delete (safeUpdates as any).createdAt;
    delete (safeUpdates as any).updatedAt;
    
    // Perform update
    const { data, error } = await client
      .from('users')
      .update(safeUpdates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating profile:', { error, updates: safeUpdates });
      throw error;
    }

    if (!data) {
      throw new Error('Nie udało się zaktualizować profilu');
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
