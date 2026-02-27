import { z } from "zod";

// Schema walidacji zmiennych środowiskowych frontendu
const envSchema = z.object({
  // API Configuration
  VITE_API_URL: z.string().url("VITE_API_URL must be a valid URL"),
  VITE_WS_URL: z.string().url("VITE_WS_URL must be a valid URL").optional(),

  // Supabase
  VITE_SUPABASE_URL: z.string().url("VITE_SUPABASE_URL must be a valid URL"),
  VITE_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(100, "VITE_SUPABASE_PUBLISHABLE_KEY seems too short"),
  VITE_SUPABASE_ANON_KEY: z
    .string()
    .min(100, "VITE_SUPABASE_ANON_KEY seems too short")
    .optional(),

  // Optional
  VITE_SITE_URL: z.string().url().optional(),
  VITE_AUTH_REDIRECT_URL: z.string().url().optional(),
});

type EnvSchema = z.infer<typeof envSchema>;

// Walidacja zmiennych środowiskowych
function validateEnv(): EnvSchema {
  try {
    const parsed = envSchema.parse(import.meta.env);
    console.log("✅ Frontend environment variables validated");
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Frontend environment validation failed:");
      error.issues.forEach((err: z.ZodIssue) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      throw new Error(
        "Invalid frontend environment configuration. Check console above.",
      );
    }
    throw error;
  }
}

// Zgrupowana konfiguracja frontendu
export interface FrontendConfig {
  api: {
    baseUrl: string;
    wsUrl: string;
  };
  supabase: {
    url: string;
    publishableKey: string;
  };
  auth: {
    siteUrl?: string | undefined;
    redirectUrl?: string | undefined;
  };
}

// Eksport zgrupowanej konfiguracji
export function createFrontendConfig(): FrontendConfig {
  const env = validateEnv();

  // Automatyczne wykrywanie WS URL jeśli nie podano
  const wsUrl =
    env.VITE_WS_URL || (() => {
      const apiUrl = env.VITE_API_URL.replace("/api", "").replace(/\/$/, "");
      // Use ws:// for HTTP APIs and wss:// for HTTPS APIs
      if (apiUrl.startsWith("http://")) {
        return apiUrl.replace("http://", "ws://");
      } else if (apiUrl.startsWith("https://")) {
        return apiUrl.replace("https://", "wss://");
      }
      return apiUrl;
    })();

  return {
    api: {
      baseUrl: env.VITE_API_URL,
      wsUrl,
    },
    supabase: {
      url: env.VITE_SUPABASE_URL,
      publishableKey:
        env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY!,
    },
    auth: {
      siteUrl: env.VITE_SITE_URL,
      redirectUrl: env.VITE_AUTH_REDIRECT_URL,
    },
  };
}

// Singleton instance
let configInstance: FrontendConfig | null = null;

export function getConfig(): FrontendConfig {
  if (!configInstance) {
    configInstance = createFrontendConfig();
  }
  return configInstance;
}

// Export dla łatwego dostępu
export const config = getConfig();
