import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '@/services/api';

describe('API client alternate base fallback', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:5174' },
      writable: true,
    });
    (apiClient as any).baseUrl = 'http://localhost:8001/api';
  });

  it('switches to alternate base on request error', async () => {
    const firstResponse = new Response(JSON.stringify({ message: 'Proxy error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
    const secondResponse = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(firstResponse)
      .mockResolvedValueOnce(secondResponse);
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiClient.get('/test');
    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const firstUrl = new URL((fetchMock.mock.calls[0] as any[])[0]);
    const secondUrl = new URL((fetchMock.mock.calls[1] as any[])[0]);
    expect(firstUrl.origin).toBe('http://localhost:8001');
    expect(secondUrl.origin).toBe('http://localhost:8002');
  });
});
