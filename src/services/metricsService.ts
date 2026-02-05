type MetricScope = 'SITE' | 'AUCTION' | 'GALLERY_IMAGE';

const alreadySent = new Set<string>();

const key = (scope: MetricScope, targetId?: string) => `${scope}:${targetId ?? 'global'}`;

const normalizeApiBase = (raw?: string) => {
  if (!raw) return '';
  const trimmed = raw.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const resolveBaseUrl = () => {
  const envBase = normalizeApiBase(import.meta.env.VITE_API_BASE_URL)
    || normalizeApiBase(import.meta.env.VITE_API_URL);
  if (envBase) return envBase;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api`;
  }
  return '';
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let isServerAvailable = true;
let lastCheck = 0;
const serverCheckInterval = 5000; // 5 seconds

export async function trackMetric(scope: MetricScope, targetId?: string) {
  const memoKey = key(scope, targetId);
  if (alreadySent.has(memoKey)) return;

  const now = Date.now();
  if (!isServerAvailable && now - lastCheck < serverCheckInterval) {
    return;
  }

  alreadySent.add(memoKey);

  const baseUrl = resolveBaseUrl();
  if (!baseUrl) return;

  const send = async (attempt: number): Promise<void> => {
    try {
      const res = await fetch(`${baseUrl}/metrics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scope, targetId }),
        credentials: 'include',
        keepalive: true,
      });

      if (res.ok) {
        isServerAvailable = true;
        lastCheck = now;
        await res.json();
      } else {
        if (attempt < 1 && import.meta.env.DEV) {
          await delay(800);
          return send(attempt + 1);
        }
        isServerAvailable = false;
        lastCheck = now;
        if (import.meta.env.DEV) {
          console.warn('Metrics track error:', res.status);
        }
      }
    } catch (error) {
      if (attempt < 1 && import.meta.env.DEV) {
        await delay(800);
        return send(attempt + 1);
      }
      isServerAvailable = false;
      lastCheck = now;
      if (import.meta.env.DEV) {
        console.warn('Metrics track error', error);
      }
    }
  };

  await send(0);
}
