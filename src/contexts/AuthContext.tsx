import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { logger } from '@/lib/logger';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { toast } from '@/components/ui/sonner';
import { apiClient } from '@/services/api';
import { calculateRole, UserWithVerifications } from '../types/roles.js';

export type UserRole = 'USER_REGISTERED' | 'USER_EMAIL_VERIFIED' | 'USER_FULL_VERIFIED' | 'ADMIN';

const USERNAME_MAX_LENGTH = 32;

const sanitizeUsername = (input: string) => {
  if (!input) return '';
  const normalized = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return normalized.slice(0, USERNAME_MAX_LENGTH);
};

const generateUsername = (authUser: User) => {
  const emailBase = authUser.email?.split('@')[0] ?? '';
  const sanitizedBase = sanitizeUsername(emailBase) || `user-${authUser.id.slice(0, 6)}`;
  const suffix = authUser.id.replace(/-/g, '').slice(0, 4);
  const combined = `${sanitizedBase}-${suffix}`;
  return sanitizeUsername(combined) || `user-${suffix}`;
};

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
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  loading: boolean;
  showUserPanel: () => void;
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

  const isEmailConfirmed = useCallback((authUser: User) => {
    const u = authUser as any;
    return Boolean(u?.email_confirmed_at || u?.confirmed_at);
  }, []);

  const isPhoneConfirmed = useCallback((authUser: User) => {
    const u = authUser as any;
    return Boolean(u?.phone_confirmed_at);
  }, []);

  const computeRole = useCallback((authUser: User, existingProfile?: Profile | null) => {
    const supabaseRole = (authUser as any).app_metadata?.role || (authUser as any).user_metadata?.role;
    const inferredRole = supabaseRole === 'ADMIN' ? 'ADMIN' : existingProfile?.role;

    const userWithVerifications: UserWithVerifications = {
      id: authUser.id,
      email: authUser.email,
      email_confirmed_at: (authUser as any).email_confirmed_at || (authUser as any).confirmed_at,
      phone: authUser.phone,
      phone_confirmed_at: (authUser as any).phone_confirmed_at,
      role: inferredRole
    };
    
    return calculateRole(userWithVerifications);
  }, []);

  const ensureProfile = useCallback(async (authUser: User, existingProfile: Profile | null) => {
    // Rely on DB triggers for profile creation.
    // Check if existing profile needs synchronization with Auth state
    if (existingProfile) {
      const appMeta = (authUser as any).app_metadata;
      const isEmailVerified = Boolean((authUser as any).email_confirmed_at || (authUser as any).confirmed_at);
      const isPhoneVerified = Boolean((authUser as any).phone_confirmed_at);
      
      let newRole: UserRole | null = null;

      // 1. Sync ADMIN role from Auth metadata
      if (appMeta?.role === 'ADMIN' || existingProfile.role === 'ADMIN') {
        newRole = 'ADMIN';
      }
      // 2. Fix users stuck in USER_REGISTERED despite verification
      else if (existingProfile.role === 'USER_REGISTERED' && isEmailVerified) {
        newRole = isPhoneVerified ? 'USER_FULL_VERIFIED' : 'USER_EMAIL_VERIFIED';
      }

      if (newRole && newRole !== existingProfile.role) {
        logger.info(`Auto-upgrading user role from ${existingProfile.role} to ${newRole}`);
        
        // Return upgraded profile immediately for UI responsiveness
        const upgradedProfile = { ...existingProfile, role: newRole };
        
        // Trigger DB update in background
        supabase.from('users')
          .update({ role: newRole })
          .eq('id', authUser.id)
          .then(({ error }) => {
            if (error) logger.error('Failed to sync user role to DB:', error);
          });
          
        return upgradedProfile;
      }

      return existingProfile;
    }

    const supabaseRole = (authUser as any).app_metadata?.role || (authUser as any).user_metadata?.role;
    const roleOverride = supabaseRole === 'ADMIN' ? 'ADMIN' : undefined;

    // If missing (race condition), return temp read-only object
    const userWithVerifications: UserWithVerifications = {
      id: authUser.id,
      email: authUser.email,
      email_confirmed_at: (authUser as any).email_confirmed_at || (authUser as any).confirmed_at,
      phone: authUser.phone,
      phone_confirmed_at: (authUser as any).phone_confirmed_at,
      role: roleOverride ?? 'USER_REGISTERED'
    };
    
    const role = calculateRole(userWithVerifications);

    return {
      id: authUser.id,
      email: authUser.email,
      phone: authUser.phone,
      username: generateUsername(authUser),
      role: role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name: authUser.user_metadata?.full_name,
      avatar_url: authUser.user_metadata?.avatar_url
    } as Profile;
  }, []);

  const clearPendingEmailVerification = useCallback(() => {
    setPendingEmailVerification(null);
    try {
      localStorage.removeItem('pendingEmailVerification');
    } catch {
      // ignore
    }
  }, []);

  const getBaseUrl = useCallback(() => {
    const configuredSiteUrl = import.meta.env.VITE_SITE_URL as string | undefined;
    const origin = window.location.origin;
    const normalizedOrigin = origin.replace(/\/$/, '');
    const normalizedConfigured = configuredSiteUrl?.replace(/\/$/, '');
    return normalizedConfigured && normalizedConfigured === normalizedOrigin
      ? normalizedConfigured
      : normalizedOrigin;
  }, []);

  const fetchProfile = useCallback(async (authUser: User) => {
    const client = supabase;
    if (!client) {
      setLoading(false);
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
    } finally {
      setLoading(false);
    }
  }, [ensureProfile]);

  const initCSRFToken = useCallback(async () => {
    try {
      await apiClient.getCSRFToken();
      logger.debug('CSRF token initialized');
    } catch (error) {
      logger.error('Failed to initialize CSRF token:', error);
    }
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setLoading(false);
      return;
    }
    
    let isInitialized = false;
    
    const init = async () => {
      try {
        // Inicjalizuj CSRF token na starcie
        await initCSRFToken();
        const currentUrl = new URL(window.location.href);
        const code = currentUrl.searchParams.get('code');
        const tokenHash = currentUrl.searchParams.get('token_hash');
        const type = currentUrl.searchParams.get('type');
        const errorParam = currentUrl.searchParams.get('error');
        const errorDescription = currentUrl.searchParams.get('error_description');
        const errorCode = currentUrl.searchParams.get('error_code');

        // Handle email verification callback (token_hash + type=email)
        if (tokenHash && type === 'email') {
          logger.info('Email verification callback detected');
          const { data, error } = await client.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'email',
          });
          
          if (error) {
            logger.error('Email verification failed:', error);
            // Redirect to verify-email with error
            const verifyUrl = new URL('/verify-email', window.location.origin);
            verifyUrl.searchParams.set('error', 'verification_failed');
            verifyUrl.searchParams.set('error_description', error.message || 'Weryfikacja emaila nie powiodła się');
            window.location.href = verifyUrl.toString();
            return;
          }
          
          logger.info('Email verified successfully', { user: data.session?.user?.email });
          
          // Clean up URL params
          currentUrl.searchParams.delete('token_hash');
          currentUrl.searchParams.delete('type');
          window.history.replaceState({}, document.title, currentUrl.toString());
          
          isInitialized = true;
          if (data.session) {
            setSession(data.session);
            setUser(data.session.user);
            clearPendingEmailVerification();
            void fetchProfile(data.session.user);
            return;
          }
        }
        
        // Handle OAuth errors
        if (errorParam) {
          logger.error('OAuth error detected:', { 
            error: errorParam, 
            errorCode,
            description: errorDescription,
            url: currentUrl.toString()
          });
          
          if (errorCode === 'unexpected_failure' || errorParam === 'server_error') {
            logger.error('OAuth exchange failed - likely configuration issue', {
              error: errorParam,
              description: errorDescription,
              hint: 'Check Google OAuth configuration in Supabase Dashboard and Google Cloud Console'
            });
          }
          
          // Clean up error params
          currentUrl.searchParams.delete('error');
          currentUrl.searchParams.delete('error_description');
          currentUrl.searchParams.delete('error_code');
          window.history.replaceState({}, document.title, currentUrl.toString());
        }
        
        // If OAuth code is present, Supabase will automatically exchange it for a session
        // due to detectSessionInUrl: true in supabase config
        // Clean up OAuth params after Supabase processes them
        if (code) {
          logger.info('OAuth code detected, Supabase will handle exchange automatically');
          
          // Give Supabase a moment to process the code
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Clean up OAuth params
          currentUrl.searchParams.delete('code');
          currentUrl.searchParams.delete('state');
          window.history.replaceState({}, document.title, currentUrl.toString());
        }

        const { data: { session } } = await client.auth.getSession();
        isInitialized = true;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          void fetchProfile(session.user);
        } else {
          setLoading(false);
        }
      } catch (err: unknown) {
        logger.error('Error getting initial session:', err);
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    };

    // Listen for auth changes - set up BEFORE init to catch OAuth callback
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('🔄 Auth state change:', { event, hasSession: !!session, isInitialized });
        
        // Skip duplicate processing during initial OAuth exchange
        if (!isInitialized && event === 'INITIAL_SESSION') {
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          clearPendingEmailVerification();
          // Odśwież CSRF token po zalogowaniu
          await initCSRFToken();
          void fetchProfile(session.user);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    init();

    return () => subscription.unsubscribe();
  }, [clearPendingEmailVerification, fetchProfile, initCSRFToken]);

  const signUp = async (email: string, password: string) => {
    const client = supabase;
    if (!client) return { user: null, error: 'Supabase not configured' };

    const configuredRedirect = import.meta.env.VITE_AUTH_REDIRECT_URL as string | undefined;
    const baseUrl = getBaseUrl();
    const emailRedirectTo = configuredRedirect || `${baseUrl}/verify-email`;

    const { data, error } = await client.auth.signUp({
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
    const client = supabase;
    if (!client) return { user: null, error: 'Supabase not configured' };
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    return { user: data.user, error };
  };

  const signInWithGoogle = async () => {
    const client = supabase;
    if (!client) return { user: null, error: 'Supabase not configured' };

    const configuredRedirect = import.meta.env.VITE_AUTH_REDIRECT_URL as string | undefined;
    const baseUrl = getBaseUrl();
    const redirectTo = configuredRedirect || `${baseUrl}/auth`;

    try {
      logger.info('Initiating Google OAuth', { 
        redirectTo, 
        baseUrl, 
        configuredRedirect,
        flowType: 'pkce',
        detectSessionInUrl: true 
      });
      
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: false,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        logger.error('Google OAuth error:', error);
        return { user: null, error };
      }
      
      logger.info('Google OAuth URL generated, redirecting...', { url: data.url });
      // OAuth redirect will happen, so we don't return user here
      return { user: null, error: null };
    } catch (err) {
      logger.error('Google OAuth exception:', err);
      return { 
        user: null, 
        error: err instanceof Error ? err : new Error('Failed to initiate Google OAuth') 
      };
    }
  };

  const signInWithFacebook = async () => {
    const client = supabase;
    if (!client) return { user: null, error: 'Supabase not configured' };

    const configuredRedirect = import.meta.env.VITE_AUTH_REDIRECT_URL as string | undefined;
    const baseUrl = getBaseUrl();
    const redirectTo = configuredRedirect || `${baseUrl}/auth`;

    try {
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo,
        },
      });
      
      if (error) {
        logger.error('Facebook OAuth error:', error);
        return { user: null, error };
      }
      
      // OAuth redirect will happen, so we don't return user here
      return { user: null, error: null };
    } catch (err) {
      logger.error('Facebook OAuth exception:', err);
      return { 
        user: null, 
        error: err instanceof Error ? err : new Error('Failed to initiate Facebook OAuth') 
      };
    }
  };

  const signOut = async () => {
    const client = supabase;
    if (!client) return;
    await client.auth.signOut();
    clearPendingEmailVerification();
  };

  const refreshSession = async () => {
    const client = supabase;
    if (!client) return;
    
    // Fetch latest user data from server
    const { data: { user: updatedUser }, error } = await client.auth.getUser();
    
    if (error) {
      logger.error('Error refreshing user:', error);
      return;
    }
    
    if (updatedUser) {
      setUser(updatedUser);
      // Also refresh the session to get a new token if needed, though getUser doesn't always rotate token
      const { data: { session: updatedSession } } = await client.auth.getSession();
      if (updatedSession) {
        setSession(updatedSession);
      }
      
      // Now fetch profile with the updated user
      await fetchProfile(updatedUser);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      throw new Error('Brak aktywnej sesji użytkownika');
    }
    const client = supabase;
    if (!client) {
      throw new Error('Brak połączenia z bazą danych');
    }

    // Strip protected fields to avoid trigger rejection
    const safeUpdates = { ...updates };
    delete (safeUpdates as any).role;
    delete (safeUpdates as any).id;
    delete (safeUpdates as any).email;

    const payload: Partial<Profile> & { id: string } = { id: user.id, ...safeUpdates };
    
    if (payload.username) {
      payload.username = sanitizeUsername(payload.username);
      if (!payload.username || payload.username.length < 3) {
        throw new Error('Nazwa użytkownika jest nieprawidłowa (min. 3 znaki, tylko litery/cyfry i myślniki).');
      }
    }

    const { data, error } = await client
      .from('users')
      .update(safeUpdates) // Use update, not upsert
      .eq('id', user.id)
      .select('*')
      .maybeSingle();

    if (!error && !data) {
      logger.warn('User profile missing during update, attempting to create...', { userId: user.id });
      
      // Calculate correct initial role based on verification status
      const userWithVerifications: UserWithVerifications = {
        id: user.id,
        email: user.email,
        email_confirmed_at: (user as any).email_confirmed_at || (user as any).confirmed_at,
        phone: user.phone,
        phone_confirmed_at: (user as any).phone_confirmed_at,
        role: 'USER_REGISTERED'
      };
      const calculatedRole = calculateRole(userWithVerifications);
      
      // Prepare insert payload
      const insertPayload = {
        id: user.id,
        email: user.email,
        role: calculatedRole,
        ...safeUpdates
      };
      
      const insertResult = await client
        .from('users')
        .insert(insertPayload)
        .select('*')
        .single();
        
      if (insertResult.error) {
        logger.error('Error creating missing profile:', insertResult.error);
        throw insertResult.error;
      }
      
      // Success
      await refreshSession();
      return;
    }

    if (error) {
      logger.error('Error updating profile:', { error, payload });
      // Re-throw so callers can show a friendly message
      throw error;
    }

    if (!data) {
      throw new Error('Nie udało się zapisać profilu');
    }

    // Refetch user and profile to ensure we have the latest state (including triggers)
    await refreshSession();
  };

  const showUserPanel = () => {
    // This will be handled by the Header component through a custom event
    window.dispatchEvent(new CustomEvent('showUserPanel'));
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
    signOut,
    updateProfile,
    loading,
    showUserPanel,
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
