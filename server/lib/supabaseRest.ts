import { z } from 'zod';

export type PostgrestErrorBody = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

export class SupabaseRestError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: string;
  readonly hint?: string;
  readonly rawText: string;

  constructor(args: { status: number; body: PostgrestErrorBody | null; rawText: string }) {
    super(args.body?.message || `Supabase request failed (${args.status})`);
    this.name = 'SupabaseRestError';
    this.status = args.status;
    this.code = args.body?.code;
    this.details = args.body?.details;
    this.hint = args.body?.hint;
    this.rawText = args.rawText;
  }
}

const parseErrorBody = (rawText: string): PostgrestErrorBody | null => {
  if (!rawText) return null;
  try {
    const parsed: unknown = JSON.parse(rawText);
    if (!parsed || typeof parsed !== 'object') return null;
    const obj = parsed as Record<string, unknown>;
    return {
      code: typeof obj.code === 'string' ? obj.code : undefined,
      message: typeof obj.message === 'string' ? obj.message : undefined,
      details: typeof obj.details === 'string' ? obj.details : undefined,
      hint: typeof obj.hint === 'string' ? obj.hint : undefined,
    };
  } catch {
    return null;
  }
};

export async function supabaseRestJson<T>(
  url: string,
  init: RequestInit & { headers?: Record<string, string> }
): Promise<T> {
  const response = await fetch(url, init);
  const rawText = await response.text().catch(() => '');
  if (!response.ok) {
    throw new SupabaseRestError({ status: response.status, body: parseErrorBody(rawText), rawText });
  }
  if (!rawText) return undefined as T;
  return JSON.parse(rawText) as T;
}

export async function supabaseRpc<T>(
  url: string,
  body: unknown,
  schema: z.ZodSchema<T>,
  headers: Record<string, string>
): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const rawText = await response.text().catch(() => '');
  if (!response.ok) {
    throw new SupabaseRestError({ status: response.status, body: parseErrorBody(rawText), rawText });
  }

  const data = rawText ? JSON.parse(rawText) : null;
  return schema.parse(data);
}

