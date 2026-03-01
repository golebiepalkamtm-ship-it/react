type MetricScope = "SITE" | "AUCTION" | "GALLERY_IMAGE";

const alreadySent = new Set<string>();

const key = (scope: MetricScope, targetId?: string, path?: string) =>
  `${scope}:${targetId ?? "global"}:${path ?? ""}`;

const sanitizeEnvValue = (value: string | undefined) => {
  if (!value) return value;
  const trimmed = value.trim();
  const wrapped =
    (trimmed.startsWith("`") && trimmed.endsWith("`")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"));
  return wrapped ? trimmed.slice(1, -1).trim() : trimmed;
};

const normalizeApiBase = (raw?: string) => {
  if (!raw) return "";
  const trimmed = raw.trim().replace(/\/+$/, "");
  // Remove www subdomain to match CSP configuration
  const normalized = trimmed.replace(/^https?:\/\/www\./, "https://");
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

const appendAlternateLocalhost = (base: string) => {
  try {
    const url = new URL(base);
    if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1")
      return [base];
    const port = url.port || (url.protocol === "https:" ? "443" : "80");
    const nextPort = port === "8001" ? "8002" : port === "8002" ? "8001" : null;
    if (!nextPort) return [base];
    url.port = nextPort;
    const alternate = url.toString().replace(/\/$/, "");
    return [base, alternate];
  } catch {
    return [base];
  }
};

const resolveBaseUrls = () => {
  const envBase =
    normalizeApiBase(sanitizeEnvValue(import.meta.env.VITE_API_BASE_URL)) ||
    normalizeApiBase(sanitizeEnvValue(import.meta.env.VITE_API_URL));
  if (envBase) return appendAlternateLocalhost(envBase);
  if (typeof window !== "undefined" && window.location?.origin) {
    return appendAlternateLocalhost(`${window.location.origin}/api`);
  }
  return [];
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let isServerAvailable = true;
let lastCheck = 0;
const serverCheckInterval = 5000; // 5 seconds

let preferredBaseUrl: string | null = null;
const lastFailedAt: Record<string, number> = {};

const probeHealth = async (baseUrl: string): Promise<boolean> => {
  const lastFail = lastFailedAt[baseUrl] || 0;
  const now = Date.now();
  if (now - lastFail < serverCheckInterval) {
    return false;
  }
  try {
    const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/health`, {
      method: "GET",
    });
    return res.ok;
  } catch {
    lastFailedAt[baseUrl] = now;
    return false;
  }
};

export async function trackMetric(
  scope: MetricScope,
  targetId?: string,
  customPath?: string,
) {
  const path =
    customPath ||
    (typeof window !== "undefined" ? window.location.pathname : undefined);

  const memoKey = key(scope, targetId, path);
  if (alreadySent.has(memoKey)) return;

  const now = Date.now();
  const baseUrls = resolveBaseUrls();
  if (baseUrls.length === 0) return;
  if (!isServerAvailable && now - lastCheck < serverCheckInterval) {
    return;
  }

  alreadySent.add(memoKey);

  const send = async (baseUrl: string, attempt: number): Promise<void> => {
    try {
      const res = await fetch(`${baseUrl}/metrics/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scope, targetId, path }),
        credentials: "include",
        keepalive: true,
      });

      if (res.ok) {
        isServerAvailable = true;
        lastCheck = now;
        await res.json();
      } else {
        if (attempt < 1 && import.meta.env.DEV) {
          await delay(800);
          return send(baseUrl, attempt + 1);
        }
        isServerAvailable = false;
        lastCheck = now;
        if (import.meta.env.DEV) {
          console.warn("Metrics track error:", res.status);
        }
      }
    } catch (error) {
      if (attempt < 1 && import.meta.env.DEV) {
        await delay(800);
        return send(baseUrl, attempt + 1);
      }
      lastFailedAt[baseUrl] = Date.now();
      isServerAvailable = false;
      lastCheck = now;
      if (import.meta.env.DEV) {
        console.warn("Metrics track error", error);
      }
    }
  };

  // Prefer previously successful base
  const candidates = preferredBaseUrl
    ? [preferredBaseUrl, ...baseUrls.filter((b) => b !== preferredBaseUrl)]
    : baseUrls;
  // Quick health probe to choose a working base
  let workingBase: string | null = null;
  for (const baseUrl of candidates) {
    const healthy = await probeHealth(baseUrl.replace(/\/metrics\/?$/, ""));
    if (healthy) {
      workingBase = baseUrl;
      break;
    }
  }
  const targetBase = workingBase ?? candidates[0];
  if (!targetBase) return;
  await send(targetBase, 0);
  if (isServerAvailable) {
    preferredBaseUrl = targetBase;
  }
}
