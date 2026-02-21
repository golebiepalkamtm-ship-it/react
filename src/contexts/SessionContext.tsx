import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { logger } from "@/lib/logger";
import { apiClient } from "@/services/api";

interface SessionContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
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
  refreshSession: () => Promise<void>;
  pendingEmailVerification: string | null;
  clearPendingEmailVerification: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

const hasSupabaseClient = Boolean(supabase);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(() => hasSupabaseClient);
  const [pendingEmailVerification, setPendingEmailVerification] = useState<
    string | null
  >(() => {
    try {
      return localStorage.getItem("pendingEmailVerification");
    } catch {
      return null;
    }
  });

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
    if (!client) return;

    let isInitialized = false;

    const init = async () => {
      try {
        await initCSRFToken();
        const currentUrl = new URL(window.location.href);
        const code = currentUrl.searchParams.get("code");
        const tokenHash = currentUrl.searchParams.get("token_hash");
        const type = currentUrl.searchParams.get("type");
        const errorParam = currentUrl.searchParams.get("error");
        const errorDescription =
          currentUrl.searchParams.get("error_description");
        const errorCode = currentUrl.searchParams.get("error_code");

        // Handle email verification callback
        if (tokenHash && type === "email") {
          logger.info("Email verification callback detected");
          const { data, error } = await client.auth.verifyOtp({
            token_hash: tokenHash,
            type: "email",
          });

          if (error) {
            logger.error("Email verification failed:", error);
            const verifyUrl = new URL("/verify-email", window.location.origin);
            verifyUrl.searchParams.set("error", "verification_failed");
            verifyUrl.searchParams.set(
              "error_description",
              error.message || "Weryfikacja emaila nie powiodła się",
            );
            window.location.href = verifyUrl.toString();
            return;
          }

          logger.info("Email verified successfully", {
            user: data.session?.user?.email,
          });

          currentUrl.searchParams.delete("token_hash");
          currentUrl.searchParams.delete("type");
          window.history.replaceState(
            {},
            document.title,
            currentUrl.toString(),
          );

          isInitialized = true;
          if (data.session) {
            setSession(data.session);
            setUser(data.session.user);
            clearPendingEmailVerification();
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
        }

        if (code) {
          logger.info("Exchanging OAuth code for session");
          const { data, error } =
            await client.auth.exchangeCodeForSession(code);
          if (error) {
            logger.error("Error exchanging OAuth code for session:", {
              error: error.message,
              code: error.code,
              status: error.status,
              hint: "This usually means OAuth provider configuration is incorrect",
            });

            const authUrl = new URL("/auth", window.location.origin);
            authUrl.searchParams.set("error", "oauth_exchange_failed");
            authUrl.searchParams.set(
              "error_description",
              error.message ||
                "Failed to complete OAuth authentication. Please check OAuth configuration.",
            );
            window.location.href = authUrl.toString();
            return;
          }

          logger.info("OAuth code exchanged successfully", {
            user: data.session?.user?.email,
          });

          currentUrl.searchParams.delete("code");
          currentUrl.searchParams.delete("state");
          currentUrl.searchParams.delete("error");
          currentUrl.searchParams.delete("error_description");
          currentUrl.searchParams.delete("error_code");
          window.history.replaceState(
            {},
            document.title,
            currentUrl.toString(),
          );

          isInitialized = true;
          if (data.session) {
            setSession(data.session);
            setUser(data.session.user);
            clearPendingEmailVerification();
            return;
          }
        }

        const {
          data: { session },
        } = await client.auth.getSession();
        isInitialized = true;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (err: unknown) {
        logger.error("Error getting initial session:", err);
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    };

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        logger.debug("🔄 Auth state change:", {
          event,
          hasSession: !!session,
          isInitialized,
        });

        if (!isInitialized && event === "INITIAL_SESSION") {
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          clearPendingEmailVerification();
          await initCSRFToken();
        } else {
          setLoading(false);
        }
      },
    );

    init();

    return () => subscription.unsubscribe();
  }, [clearPendingEmailVerification, initCSRFToken]);

  const signUp = useCallback(
    async (email: string, password: string) => {
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
    },
    [getBaseUrl],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const client = supabase;
    if (!client) return { user: null, error: "Supabase not configured" };
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    return { user: data.user, error };
  }, []);

  const signInWithGoogle = useCallback(
    async (customRedirect?: string) => {
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
    },
    [getBaseUrl],
  );

  const signInWithFacebook = useCallback(
    async (customRedirect?: string) => {
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
    },
    [getBaseUrl],
  );

  const signOut = useCallback(async () => {
    const client = supabase;
    if (!client) return;
    await client.auth.signOut();
    clearPendingEmailVerification();
  }, [clearPendingEmailVerification]);

  const refreshSession = useCallback(async () => {
    const client = supabase;
    if (!client) return;

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
      const {
        data: { session: updatedSession },
      } = await client.auth.getSession();
      if (updatedSession) {
        setSession(updatedSession);
      }
    }
  }, []);

  const value = useMemo<SessionContextType>(
    () => ({
      user,
      session,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signInWithFacebook,
      signOut,
      refreshSession,
      pendingEmailVerification,
      clearPendingEmailVerification,
    }),
    [
      user,
      session,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signInWithFacebook,
      signOut,
      refreshSession,
      pendingEmailVerification,
      clearPendingEmailVerification,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context)
    throw new Error("useSession must be used within SessionProvider");
  return context;
};
