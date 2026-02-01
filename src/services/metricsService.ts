type MetricScope = 'SITE' | 'AUCTION' | 'GALLERY_IMAGE';

const alreadySent = new Set<string>();

const key = (scope: MetricScope, targetId?: string) => `${scope}:${targetId ?? 'global'}`;

const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

export async function trackMetric(scope: MetricScope, targetId?: string) {
  const memoKey = key(scope, targetId);
  if (alreadySent.has(memoKey)) return;
  alreadySent.add(memoKey);

  try {
    const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
    const res = await fetch(`${cleanBaseUrl}/metrics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scope, targetId }),
      credentials: 'include',
    });
    if (!res.ok) {
      // Silently handle metrics errors - don't log to console in production
      if (import.meta.env.DEV) {
        console.warn('Metrics track error:', res.status);
      }
      return;
    }
    return res.json();
  } catch (error) {
    // Silently handle metrics errors - don't log to console in production
    if (import.meta.env.DEV) {
      console.warn('Metrics track error', error);
    }
  }
}
