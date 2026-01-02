import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type UserRole = 'USER_REGISTERED' | 'USER_EMAIL_VERIFIED' | 'USER_FULL_VERIFIED' | 'ADMIN';

export interface Profile {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  display_name?: string;
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  pendingEmailVerification: string | null;
  clearPendingEmailVerification: () => void;
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signInWithGoogle: () => Promise<{ user: User | null; error: any }>;
  signInWithFacebook: () => Promise<{ user: User | null; error: any }>;
  sendPhoneVerification: (phone: string) => Promise<{ error: any }>;
  verifyPhone: (phone: string, token: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingEmailVerification, setPendingEmailVerification] = useState<string | null>(() => {
    try {
      return localStorage.getItem('pendingEmailVerification');
    } catch {
      return null;
    }
  });

  const clearPendingEmailVerification = () => {
    setPendingEmailVerification(null);
    try {
      localStorage.removeItem('pendingEmailVerification');
    } catch {
      // ignore
    }
  };

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) => {
        setTimeout(() => resolve({ data: null, error: { message: 'Profile fetch timeout' } }), 8000);
      });

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        const maybeNotFound =
          (error as any)?.status === 404 ||
          (error as any)?.code === 'PGRST116' ||
          (typeof (error as any)?.message === 'string' &&
            (error as any).message.toLowerCase().includes('not found'));
        if (maybeNotFound && session?.user?.id === userId) {
          try {
            const { error: upsertError } = await supabase
              .from('users')
              .upsert(
                {
                  id: userId,
                  email: session?.user?.email ?? null,
                  role: 'USER_REGISTERED',
                },
                { onConflict: 'id' }
              );
            if (!upsertError) {
              const { data: data2, error: error2 } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
              if (!error2) {
                setProfile(data2);
                return;
              }
            }
          } catch (uErr) {
            logger.warn('Failed to upsert missing profile row', uErr);
          }
        }
        logger.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        const provider = session?.user?.app_metadata?.provider || session?.user?.identities?.[0]?.provider || null;
        let nextProfile = data;

        if (data?.role === 'USER_REGISTERED' && provider && (provider === 'google' || provider === 'facebook')) {
          try {
            const { error: updateError } = await supabase
              .from('users')
              .update({ role: 'USER_EMAIL_VERIFIED' })
              .eq('id', userId);

            if (!updateError) {
              nextProfile = { ...data, role: 'USER_EMAIL_VERIFIED' };
            }
          } catch (err) {
            logger.warn('Failed to auto-upgrade role for OAuth user', err);
          }
        }

        setProfile(nextProfile);
      }
    } catch (error) {
      logger.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        logger.error('Error getting initial session:', err);
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          clearPendingEmailVerification();
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async (email: string, password: string) => {
    if (!supabase) return { user: null, error: 'Supabase not configured' };

    const configuredRedirect = import.meta.env.VITE_AUTH_REDIRECT_URL as string | undefined;
    const configuredSiteUrl = import.meta.env.VITE_SITE_URL as string | undefined;
    const baseUrl = (configuredSiteUrl || window.location.origin).replace(/\/$/, '');
    const emailRedirectTo = configuredRedirect || `${baseUrl}/verify-email`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
      },
    });

    if (!error) {
      setPendingEmailVerification(email);
      try {
        localStorage.setItem('pendingEmailVerification', email);
      } catch {
        // ignore
      }
    }
    return { user: data.user, error };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { user: null, error: 'Supabase not configured' };
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { user: data.user, error };
  };

  const signInWithGoogle = async () => {
    if (!supabase) return { user: null, error: 'Supabase not configured' };

    const configuredRedirect = import.meta.env.VITE_AUTH_REDIRECT_URL as string | undefined;
    const configuredSiteUrl = import.meta.env.VITE_SITE_URL as string | undefined;
    const baseUrl = (configuredSiteUrl || window.location.origin).replace(/\/$/, '');
    const redirectTo = configuredRedirect || `${baseUrl}/verify-email`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
    return { user: data.user, error };
  };

  const signInWithFacebook = async () => {
    if (!supabase) return { user: null, error: 'Supabase not configured' };

    const configuredRedirect = import.meta.env.VITE_AUTH_REDIRECT_URL as string | undefined;
    const configuredSiteUrl = import.meta.env.VITE_SITE_URL as string | undefined;
    const baseUrl = (configuredSiteUrl || window.location.origin).replace(/\/$/, '');
    const redirectTo = configuredRedirect || `${baseUrl}/verify-email`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo,
      },
    });
    return { user: data.user, error };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    clearPendingEmailVerification();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      throw error;
    }

    // Refetch profile
    await fetchProfile(user.id);
  };

  const sendPhoneVerification = async (phone: string) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    return { error };
  };

  const verifyPhone = async (phone: string, token: string) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    return { error };
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    pendingEmailVerification,
    clearPendingEmailVerification,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    sendPhoneVerification,
    verifyPhone,
    signOut,
    updateProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
