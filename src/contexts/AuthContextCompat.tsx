import React, { createContext, useContext, useMemo } from 'react';
import { useSession } from './SessionContext';
import { useUser, Profile, UserRole } from './UserContext';
import { User, Session } from '@supabase/supabase-js';

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
  const session = useSession();
  const userCtx = useUser();

  const value = useMemo<AuthContextType>(() => ({
    user: session.user,
    session: session.session,
    profile: userCtx.profile,
    pendingEmailVerification: session.pendingEmailVerification,
    clearPendingEmailVerification: session.clearPendingEmailVerification,
    signUp: session.signUp,
    signIn: session.signIn,
    signInWithGoogle: session.signInWithGoogle,
    signInWithFacebook: session.signInWithFacebook,
    signOut: session.signOut,
    updateProfile: userCtx.updateProfile,
    loading: session.loading,
    showUserPanel: userCtx.showUserPanel,
  }), [session, userCtx]);

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

export type { UserRole, Profile };
