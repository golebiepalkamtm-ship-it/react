import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Walidacja zmiennych środowiskowych
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase environment variables are missing: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

// Klient Supabase dla operacji serwerowych
const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey);

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

  constructor(args: { status: number; body: any; rawText: string }) {
    super(args.body?.message || `Supabase request failed (${args.status})`);
    this.name = 'SupabaseRestError';
    this.status = args.status;
    this.code = args.body?.code;
    this.details = args.body?.details;
    this.hint = args.body?.hint;
    this.rawText = args.rawText;
  }
}

export async function supabaseRestJson<T>(
  url: string,
  init: RequestInit & { headers?: Record<string, string> }
): Promise<T> {
  const response = await fetch(url, init);
  const rawText = await response.text().catch(() => '');
  if (!response.ok) {
    const errorBody = parseErrorBody(rawText);
    throw new SupabaseRestError({ status: response.status, body: errorBody, rawText });
  }
  return JSON.parse(rawText) as T;
}

const parseErrorBody = (rawText: string): any => {
  try {
    return JSON.parse(rawText);
  } catch {
    return null;
  }
};

export { supabaseServer };

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

