
/**
 * Helper to generate Supabase Storage image URLs with transformations.
 * This utilizes Supabase's image transformation features (resizing, format conversion).
 * 
 * @param path - The path to the image in storage (e.g. "pigeons/123.jpg")
 * @param bucket - The storage bucket name (default: "auction-images")
 * @param options - Transformation options
 * @returns The optimized image URL
 */

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  resize?: 'cover' | 'contain' | 'fill';
  quality?: number; // 0-100
  format?: 'origin' | 'webp' | 'avif';
}

export function getOptimizedImageUrl(
  path: string,
  bucket: string = 'auction-images',
  options: ImageTransformOptions = {}
): string {
  if (!path) return '';
  if (path.startsWith('http')) return path; // Already a full URL

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) return path;

  // If path is just a filename, assume it's in the bucket root? 
  // Or path should include folder? Usually path is what's stored in DB.
  
  // Construct the base public URL
  // Pattern: https://<project_ref>.supabase.co/storage/v1/render/image/public/<bucket>/<path>
  // Note: 'render/image' is for the image transformation service (Supabase Pro/Team feature usually, or requires setup).
  // If not enabled, fallback to standard public URL.
  
  // For this implementation, we assume the standard transformation URL structure.
  
  const baseUrl = `${supabaseUrl}/storage/v1/render/image/public/${bucket}/${path}`;
  
  const params = new URLSearchParams();
  if (options.width) params.set('width', String(options.width));
  if (options.height) params.set('height', String(options.height));
  if (options.resize) params.set('resize', options.resize);
  if (options.quality) params.set('quality', String(options.quality));
  if (options.format) params.set('format', options.format);
  else params.set('format', 'origin'); // Default to origin or auto

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Standard presets for the application
 */
export const ImagePresets = {
  thumbnail: { width: 300, height: 300, resize: 'cover', quality: 80, format: 'webp' } as ImageTransformOptions,
  card: { width: 600, height: 400, resize: 'cover', quality: 85, format: 'webp' } as ImageTransformOptions,
  full: { width: 1200, quality: 90, format: 'webp' } as ImageTransformOptions,
};
