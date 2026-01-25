const PLACEHOLDER = '/placeholder.svg';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const DEFAULT_BUCKET = 'auction-media';

/**
 * Normalizuje URL zdjęcia aukcji, wspiera stare wpisy przechowujące tylko ścieżkę w bucket.
 */
export function resolveAuctionImage(image?: string): string {
  if (!image) return PLACEHOLDER;
  const trimmed = image.trim();
  if (!trimmed) return PLACEHOLDER;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (!SUPABASE_URL) return PLACEHOLDER;

  const normalizedPath = trimmed.replace(/^\/+/, '');
  return `${SUPABASE_URL}/storage/v1/object/public/${DEFAULT_BUCKET}/${normalizedPath}`;
}

export const AUCTION_PLACEHOLDER_SRC = PLACEHOLDER;
