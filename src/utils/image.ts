const PLACEHOLDER = '/placeholder.svg';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const DEFAULT_BUCKET = 'auction-media';

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'origin';
}

/**
 * Normalizuje URL zdjęcia aukcji, wspiera stare wpisy przechowujące tylko ścieżkę w bucket
 * oraz opcjonalną optymalizację obrazu (WebP, szerokość, jakość).
 */
export function resolveAuctionImage(
  image?: string,
  options?: ImageTransformOptions,
): string {
  if (!image) return PLACEHOLDER;
  const trimmed = image.trim();
  if (!trimmed) return PLACEHOLDER;

  let url = '';
  if (/^https?:\/\//i.test(trimmed)) {
    url = trimmed;
  } else if (SUPABASE_URL) {
    const normalizedPath = trimmed.replace(/^\/+/, '');
    if (options && (options.width || options.quality || options.format)) {
      url = `${SUPABASE_URL}/storage/v1/render/image/public/${DEFAULT_BUCKET}/${normalizedPath}`;
    } else {
      url = `${SUPABASE_URL}/storage/v1/object/public/${DEFAULT_BUCKET}/${normalizedPath}`;
    }
  } else {
    return PLACEHOLDER;
  }

  if (options) {
    try {
      const parsed = new URL(url);
      if (options.width) parsed.searchParams.set('width', String(options.width));
      if (options.height) parsed.searchParams.set('height', String(options.height));
      if (options.quality) parsed.searchParams.set('quality', String(options.quality));
      if (options.format) parsed.searchParams.set('format', options.format);
      return parsed.toString();
    } catch {
      // Fallback if URL parsing fails on relative strings
      const params = new URLSearchParams();
      if (options.width) params.set('width', String(options.width));
      if (options.height) params.set('height', String(options.height));
      if (options.quality) params.set('quality', String(options.quality));
      if (options.format) params.set('format', options.format);
      const qs = params.toString();
      return qs ? `${url}${url.includes('?') ? '&' : '?'}${qs}` : url;
    }
  }

  return url;
}

export const AUCTION_PLACEHOLDER_SRC = PLACEHOLDER;
