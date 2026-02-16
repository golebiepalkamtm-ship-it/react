import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { logger } from "@/lib/logger";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { toast } from "@/components/ui/sonner";
import { apiClient } from "@/services/api";
import { calculateRole, UserWithVerifications } from "../types/roles.js";

export type UserRole =
  | "USER_REGISTERED"
  | "USER_EMAIL_VERIFIED"
  | "USER_FULL_VERIFIED"
  | "ADMIN";

const USERNAME_MAX_LENGTH = 32;

const sanitizeUsername = (input: string) => {
  if (!input) return "";
  const normalized = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return normalized.slice(0, USERNAME_MAX_LENGTH);
};

const generateUsername = (authUser: User) => {
  const emailBase = authUser.email?.split("@")[0] ?? "";
  const sanitizedBase =
    sanitizeUsername(emailBase) || `user-${authUser.id.slice(0, 6)}`;
  const suffix = authUser.id.replace(/-/g, "").slice(0, 4);
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
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ user: User | null; error: any }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ user: User | null; error: any }>;
  signInWithGoogle: (
    redirectTo?: string,
  ) => Promise<{ user: User | null; error: any }>;
  signInWithFacebook: (
    redirectTo?: string,
  ) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  sendEmailVerification: (email: string) => Promise<{ error: any }>;
  loading: boolean;
  showUserPanel: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingEmailVerification, setPendingEmailVerification] = useState<
    string | null
  >(() => {
    try {
      return localStorage.getItem("pendingEmailVerification");
    } catch {
      return null;
    }
  });
  const hasSentOAuthVerification = useRef(false);

  const isEmailConfirmed = useCallback((authUser: User) => {
    const u = authUser as any;
    return Boolean(u?.email_confirmed_at || u?.confirmed_at);
  }, []);

  const isPhoneConfirmed = useCallback((authUser: User) => {
    const u = authUser as any;
    return Boolean(u?.phone_confirmed_at);
  }, []);

  const computeRole = useCallback(
    (authUser: User, existingProfile?: Profile | null) => {
      const supabaseRole =
        (authUser as any).app_metadata?.role ||
        (authUser as any).user_metadata?.role;
      const inferredRole =
        supabaseRole === "ADMIN" ? "ADMIN" : existingProfile?.role;

      const userWithVerifications: UserWithVerifications = {
        id: authUser.id,
        email: authUser.email,
        email_confirmed_at:
          (authUser as any).email_confirmed_at ||
          (authUser as any).confirmed_at,
        phone: authUser.phone,
        phone_confirmed_at: (authUser as any).phone_confirmed_at,
        role: inferredRole,
      };

      return calculateRole(userWithVerifications);
    },
    [],
  );

  const ensureProfile = useCallback(
    async (authUser: User, existingProfile: Profile | null) => {
      // Rely on DB triggers for profile creation.
      // Check if existing profile needs synchronization with Auth state
      if (existingProfile) {
        const appMeta = (authUser as any).app_metadata;
        const isEmailVerified = Boolean(
          (authUser as any).email_confirmed_at ||
          (authUser as any).confirmed_at,
        );
        const isPhoneVerified = Boolean((authUser as any).phone_confirmed_at);

        let newRole: UserRole | null = null;

        // 1. Sync ADMIN role from Auth metadata
        if (appMeta?.role === "ADMIN" || existingProfile.role === "ADMIN") {
          newRole = "ADMIN";
        }
        // 2. Fix users stuck in USER_REGISTERED despite verification OR upgrade to FULL_VERIFIED
        else if (isEmailVerified) {
          if (
            isPhoneVerified &&
            existingProfile.role !== "USER_FULL_VERIFIED"
          ) {
            newRole = "USER_FULL_VERIFIED";
          } else if (existingProfile.role === "USER_REGISTERED") {
            newRole = "USER_EMAIL_VERIFIED";
          }
        }

        if (newRole && newRole !== existingProfile.role) {
          logger.info(
            `Auto-upgrading user role from ${existingProfile.role} to ${newRole}`,
          );

          // Return upgraded profile immediately for UI responsiveness
          return { ...existingProfile, role: newRole };
        }

        return existingProfile;
      }

      const supabaseRole =
        (authUser as any).app_metadata?.role ||
        (authUser as any).user_metadata?.role;
      const roleOverride = supabaseRole === "ADMIN" ? "ADMIN" : undefined;

      // If missing (race condition), return temp read-only object
      const userWithVerifications: UserWithVerifications = {
        id: authUser.id,
        email: authUser.email,
        email_confirmed_at:
          (authUser as any).email_confirmed_at ||
          (authUser as any).confirmed_at,
        phone: authUser.phone,
        phone_confirmed_at: (authUser as any).phone_confirmed_at,
        role: roleOverride ?? "USER_REGISTERED",
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
        avatar_url: authUser.user_metadata?.avatar_url,
      } as Profile;
    },
    [],
  );

  const clearPendingEmailVerification = useCallback(() => {
    setPendingEmailVerification(null);
    try {
      localStorage.removeItem("pendingEmailVerification");
    } catch {
      // ignore
    }
  }, []);

  const getBaseUrl = useCallback(() => {
    const rawSiteUrl = import.meta.env.VITE_SITE_URL as string | undefined;
    const configuredSiteUrl = rawSiteUrl
      ? rawSiteUrl
          .trim()
          .replace(/^`|`$/g, "")
          .replace(/^"|"$/g, "")
          .replace(/^'|'$/g, "")
      : undefined;
    const origin = window.location.origin;
    const normalizedOrigin = origin.replace(/\/$/, "");
    const normalizedConfigured = configuredSiteUrl?.replace(/\/$/, "");
    return normalizedConfigured && normalizedConfigured === normalizedOrigin
      ? normalizedConfigured
      : normalizedOrigin;
  }, []);

  const sendEmailVerification = useCallback(
    async (email: string) => {
      const client = supabase;
      if (!client) return { error: "Supabase not configured" };
      const baseUrl = getBaseUrl();
      const emailRedirectTo =
        (import.meta.env.VITE_AUTH_REDIRECT_URL as string | undefined) ||
        `${baseUrl}/verify-email`;

      const { error } = await client.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo,
        },
      });

      return { error };
    },
    [getBaseUrl],
  );

  const fetchProfile = useCallback(
    async (authUser: User) => {
      const client = supabase;
      if (!client) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await client
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        if (error) {
          logger.error("Error fetching profile:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          const ensured = await ensureProfile(authUser, null);
          setProfile(ensured);
        } else {
          const ensured = await ensureProfile(
            authUser,
            (data as Profile | null) ?? null,
          );
          setProfile(ensured);
        }
      } catch (error) {
        logger.error("Error fetching profile:", error);
        const ensured = await ensureProfile(authUser, null);
        setProfile(ensured);
      } finally {
        setLoading(false);
      }
    },
    [ensureProfile],
  );

  const initCSRFToken = useCallback(async () => {
    try {
      await apiClient.getCSRFToken();
      logger.debug("CSRF token initialized");
    } catch (error) {
      logger.error("Failed to initialize CSRF token:", error);
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

        // Helper to parse params from Search OR Hash
        const getParams = () => {
          const url = new URL(window.location.href);
          const searchParams = url.searchParams;
          const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));

          return {
            tokenHash:
              searchParams.get("token_hash") || hashParams.get("token_hash"),
            type: searchParams.get("type") || hashParams.get("type"),
            code: searchParams.get("code") || hashParams.get("code"),
            errorParam: searchParams.get("error") || hashParams.get("error"),
            errorDescription:
              searchParams.get("error_description") ||
              hashParams.get("error_description"),
            errorCode:
              searchParams.get("error_code") || hashParams.get("error_code"),
          };
        };

        const {
          tokenHash,
          type,
          code,
          errorParam,
          errorDescription,
          errorCode,
        } = getParams();
        const currentUrl = new URL(window.location.href);

        // Handle email verification callback (token_hash + type=email)
        if (tokenHash && type === "email") {
          logger.info("Email verification callback detected");
          const { error } = await client.auth.verifyOtp({
            token_hash: tokenHash,
            type: "email",
          });

          if (error) {
            logger.error("Email verification failed:", error);
            // Redirect to verify-email with error
            const verifyUrl = new URL("/verify-email", window.location.origin);
            verifyUrl.searchParams.set("error", "verification_failed");
            verifyUrl.searchParams.set(
              "error_description",
              error.message || "Weryfikacja emaila nie powiodła się",
            );
            window.location.href = verifyUrl.toString();
            return;
          } else {
            logger.info("Email verification successful");
            // Force refresh session to ensure user data is up to date
            await client.auth.refreshSession();

            // Redirect to verify-email with success flag
            const verifyUrl = new URL("/verify-email", window.location.origin);
            verifyUrl.searchParams.set("verified", "true");
            window.location.href = verifyUrl.toString();
            return;
          }
        }

        // Handle OAuth errors
        if (errorParam) {
          logger.error("OAuth error detected:", {
            error: errorParam,
            errorCode,
            description: errorDescription,
            url: currentUrl.toString(),
          });

          if (
            errorCode === "unexpected_failure" ||
            errorParam === "server_error"
          ) {
            logger.error("OAuth exchange failed - likely configuration issue", {
              error: errorParam,
              description: errorDescription,
              hint: "Check Google OAuth configuration in Supabase Dashboard and Google Cloud Console",
            });
          }

          // Clean up error params
          currentUrl.searchParams.delete("error");
          currentUrl.searchParams.delete("error_description");
          currentUrl.searchParams.delete("error_code");
          window.history.replaceState(
            {},
            document.title,
            currentUrl.toString(),
          );
        }

        // If OAuth code is present, Supabase will automatically exchange it for a session
        // due to detectSessionInUrl: true in supabase config
        // Clean up OAuth params after Supabase processes them
        if (code) {
          logger.info(
            "OAuth code detected, Supabase will handle exchange automatically",
          );

          // Give Supabase a moment to process the code
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Clean up OAuth params
          currentUrl.searchParams.delete("code");
          currentUrl.searchParams.delete("state");
          window.history.replaceState(
            {},
            document.title,
            currentUrl.toString(),
          );
        }

        const {
          data: { session },
          error: sessionError,
        } = await client.auth.getSession();

        if (sessionError) {
          if (sessionError.message.includes("Refresh Token Not Found")) {
            logger.warn("Refresh token missing, clearing session");
            await client.auth.signOut();
            setSession(null);
            setUser(null);
            setProfile(null);
            setLoading(false);
            return;
          }
          throw sessionError;
        }

        isInitialized = true;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          void fetchProfile(session.user);
        } else {
          setLoading(false);
        }
      } catch (err: unknown) {
        logger.error("Error getting initial session:", err);
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    };

    // Listen for auth changes - set up BEFORE init to catch OAuth callback
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (logger.debug) {
          logger.debug("Auth state change", {
            event,
            hasSession: !!session,
            isInitialized,
          });
        }

        // Skip duplicate processing during initial OAuth exchange
        if (!isInitialized && event === "INITIAL_SESSION") {
          return;
        }
        if (event === "PASSWORD_RECOVERY") {
          // Supabase recovery flow: enforce reset screen
          const resetUrl = new URL("/auth?mode=reset", window.location.origin);
          window.history.replaceState({}, document.title, resetUrl.toString());
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
      },
    );

    init();

    return () => subscription.unsubscribe();
  }, [
    clearPendingEmailVerification,
    fetchProfile,
    initCSRFToken,
    sendEmailVerification,
  ]);

  const signUp = async (email: string, password: string) => {
    const client = supabase;
    if (!client) return { user: null, error: "Supabase not configured" };

    const configuredRedirect = import.meta.env.VITE_AUTH_REDIRECT_URL as
      | string
      | undefined;
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
        localStorage.setItem("pendingEmailVerification", email);
      } catch {
        // ignore
      }
    }
    return { user: data.user, error };
  };

  const signIn = async (email: string, password: string) => {
    const client = supabase;
    if (!client) return { user: null, error: "Supabase not configured" };
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    return { user: data.user, error };
  };

  const signInWithGoogle = async (customRedirect?: string) => {
    const client = supabase;
    if (!client) return { user: null, error: "Supabase not configured" };

    const configuredRedirect = import.meta.env.VITE_AUTH_REDIRECT_URL as
      | string
      | undefined;
    const baseUrl = getBaseUrl();
    const redirectTo =
      customRedirect || configuredRedirect || `${baseUrl}/auth`;

    try {
      logger.info("Initiating Google OAuth", {
        redirectTo,
        baseUrl,
        configuredRedirect,
        flowType: "pkce",
        detectSessionInUrl: true,
      });

      const { data, error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: false,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        logger.error("Google OAuth error:", error);
        return { user: null, error };
      }

      logger.info("Google OAuth URL generated, redirecting...", {
        url: data.url,
      });
      // OAuth redirect will happen, so we don't return user here
      return { user: null, error: null };
    } catch (err) {
      logger.error("Google OAuth exception:", err);
      return {
        user: null,
        error:
          err instanceof Error
            ? err
            : new Error("Failed to initiate Google OAuth"),
      };
    }
  };

  const signInWithFacebook = async (customRedirect?: string) => {
    const client = supabase;
    if (!client) return { user: null, error: "Supabase not configured" };

    const configuredRedirect = import.meta.env.VITE_AUTH_REDIRECT_URL as
      | string
      | undefined;
    const baseUrl = getBaseUrl();
    const redirectTo =
      customRedirect || configuredRedirect || `${baseUrl}/auth`;

    try {
      const { data, error } = await client.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo,
        },
      });

      if (error) {
        logger.error("Facebook OAuth error:", error);
        return { user: null, error };
      }

      // OAuth redirect will happen, so we don't return user here
      return { user: null, error: null };
    } catch (err) {
      logger.error("Facebook OAuth exception:", err);
      return {
        user: null,
        error:
          err instanceof Error
            ? err
            : new Error("Failed to initiate Facebook OAuth"),
      };
    }
  };

  const signOut = async () => {
    const client = supabase;
    if (!client) return;
    await client.auth.signOut();
    clearPendingEmailVerification();
  };

  const requestPasswordReset = async (email: string) => {
    const client = supabase;
    if (!client) return { error: "Supabase not configured" };
    const baseUrl = getBaseUrl();
    const redirectTo =
      (import.meta.env.VITE_AUTH_REDIRECT_URL as string | undefined) ||
      `${baseUrl}/auth?mode=reset`;

    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    return { error };
  };

  const updatePassword = async (password: string) => {
    const client = supabase;
    if (!client) return { error: "Supabase not configured" };
    const { error } = await client.auth.updateUser({ password });
    if (!error) {
      await refreshSession();
    }
    return { error };
  };

  const refreshSession = async () => {
    const client = supabase;
    if (!client) return;

    // Fetch latest user data from server
    const {
      data: { user: updatedUser },
      error,
    } = await client.auth.getUser();

    if (error) {
      logger.error("Error refreshing user:", error);
      return;
    }

    if (updatedUser) {
      setUser(updatedUser);
      // Also refresh the session to get a new token if needed, though getUser doesn't always rotate token
      const {
        data: { session: updatedSession },
      } = await client.auth.getSession();
      if (updatedSession) {
        setSession(updatedSession);
      }

      // Now fetch profile with the updated user
      await fetchProfile(updatedUser);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      throw new Error("Brak aktywnej sesji użytkownika");
    }
    const client = supabase;
    if (!client) {
      throw new Error("Brak połączenia z bazą danych");
    }

    // Strip protected fields
    const safeUpdates = { ...updates };
    delete (safeUpdates as any).role;
    delete (safeUpdates as any).id;
    delete (safeUpdates as any).email;

    // Validate username if present in updates
    if ("username" in safeUpdates && safeUpdates.username) {
      safeUpdates.username = sanitizeUsername(safeUpdates.username);
      if (safeUpdates.username.length < 3) {
        throw new Error("Nazwa użytkownika jest nieprawidłowa (min. 3 znaki).");
      }
    }

    try {
      const response = await apiClient.patch<Profile>(
        "/users/profile",
        safeUpdates,
      );

      if (!response) {
        throw new Error("Nie udało się zapisać profilu");
      }

      // Refetch everything to ensure synchronization
      await refreshSession();
    } catch (error: any) {
      logger.error("Error updating profile through API:", error);
      throw error;
    }
  };

  const showUserPanel = () => {
    // This will be handled by the Header component through a custom event
    window.dispatchEvent(new CustomEvent("showUserPanel"));
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
    requestPasswordReset,
    updatePassword,
    sendEmailVerification,
    loading,
    showUserPanel,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
