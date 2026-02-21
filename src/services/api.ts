import { logger } from "@/lib/logger";

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
  if (!raw) return raw;
  const trimmed = raw.replace(/\/+$/, ""); // usuń trailing slash
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const DEFAULT_API_BASE = import.meta.env.PROD
  ? "https://server-production-0e43.up.railway.app/api"
  : "";

export const API_BASE_URL =
  normalizeApiBase(sanitizeEnvValue(import.meta.env.VITE_API_BASE_URL)) ||
  normalizeApiBase(sanitizeEnvValue(import.meta.env.VITE_API_URL)) ||
  normalizeApiBase(DEFAULT_API_BASE) ||
  (typeof window !== "undefined"
    ? `${window.location.origin}/api`
    : "http://localhost:8001/api");

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
}

export interface AbortableRequest<T> {
  promise: Promise<T>;
  cancel: () => void;
  signal: AbortSignal;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAlternateBaseUrl(): string | null {
    try {
      const url = new URL(this.baseUrl);
      if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1")
        return null;
      const port = url.port || (url.protocol === "https:" ? "443" : "80");
      const nextPort =
        port === "8001" ? "8002" : port === "8002" ? "8001" : null;
      if (!nextPort) return null;
      url.port = nextPort;
      return url.toString().replace(/\/$/, "");
    } catch {
      return null;
    }
  }

  private switchToAlternateBaseUrl(): boolean {
    const alternate = this.getAlternateBaseUrl();
    if (!alternate || alternate === this.baseUrl) return false;
    this.baseUrl = alternate;
    return true;
  }

  private async withAlternateBase<T>(runner: () => Promise<T>): Promise<T> {
    try {
      return await runner();
    } catch (error) {
      const alt = this.getAlternateBaseUrl();
      if (alt && alt !== this.baseUrl) {
        this.baseUrl = alt;
        return runner();
      }
      throw error;
    }
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | undefined>,
  ): string {
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.append(key, String(value));
      });
    }
    return url.toString();
  }

  private isSameOrigin(): boolean {
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      return !!origin && new URL(this.baseUrl, origin).origin === origin;
    } catch {
      return false;
    }
  }

  private readCSRFToken(): string | undefined {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "csrf-token") {
        return value;
      }
    }
    return undefined;
  }

  private async ensureCsrfCookie() {
    if (!this.isSameOrigin()) return;
    if (this.readCSRFToken()) return;
    try {
      await fetch(this.buildUrl("/csrf-token"), { credentials: "include" });
    } catch (e) {
      logger.warn("CSRF cookie fetch failed", e);
    }
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<T> {
    const { params, ...fetchConfig } = config;
    return this.withAlternateBase(async () => {
      const url = this.buildUrl(endpoint, params);
      const sameOrigin = this.isSameOrigin();

      logger.debug("API Request:", url);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...((fetchConfig.headers as Record<string, string> | undefined) || {}),
      };
      if (
        fetchConfig.method &&
        ["POST", "PUT", "DELETE", "PATCH"].includes(fetchConfig.method)
      ) {
        await this.ensureCsrfCookie();
        const csrf = this.readCSRFToken();
        if (csrf) headers["X-CSRF-Token"] = csrf;
      }

      const response = await fetch(url, {
        ...fetchConfig,
        headers,
        credentials: sameOrigin ? "include" : "omit",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        // Backend returns { error: 'message', details: ... } usually
        const errorMessage =
          errorData.error || errorData.message || "Błąd serwera";
        const errorDetails = errorData.details
          ? ` (${JSON.stringify(errorData.details)})`
          : "";
        throw new Error(errorMessage + errorDetails);
      }

      return response.json();
    });
  }

  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    token?: string,
  ): Promise<T> {
    return this.withAlternateBase(async () => {
      const url = this.buildUrl(endpoint);
      const sameOrigin = this.isSameOrigin();

      const headers: Record<string, string> = {
        "X-Requested-With": "XMLHttpRequest",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      await this.ensureCsrfCookie();
      const csrf = this.readCSRFToken();
      if (csrf) {
        headers["X-CSRF-Token"] = csrf;
      }

      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers,
        credentials: sameOrigin ? "include" : "omit",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        // Backend returns { error: 'message', details: ... } usually
        const errorMessage =
          errorData.error || errorData.message || "Błąd serwera";
        const errorDetails = errorData.details
          ? ` (${JSON.stringify(errorData.details)})`
          : "";
        throw new Error(errorMessage + errorDetails);
      }

      return response.json();
    });
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | undefined>,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", params, ...(config || {}) });
  }

  async getWithToken<T>(
    endpoint: string,
    params?: Record<string, string | number | undefined>,
    token?: string,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "GET",
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      ...(config || {}),
    });
  }

  async post<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async put<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async patch<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  createAbortableRequest<T>(
    endpoint: string,
    config: RequestConfig = {},
  ): AbortableRequest<T> {
    const controller = new AbortController();
    const promise = this.request<T>(endpoint, {
      ...config,
      signal: controller.signal,
    });
    return {
      promise,
      cancel: () => controller.abort(),
      signal: controller.signal,
    };
  }

  // Metoda do pobierania CSRF token
  async getCSRFToken(): Promise<{ csrfToken: string }> {
    if (!this.isSameOrigin()) {
      logger.debug("Skipping CSRF fetch for cross-origin API");
      return { csrfToken: "" as const };
    }
    return this.get<{ csrfToken: string }>("/csrf-token");
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
