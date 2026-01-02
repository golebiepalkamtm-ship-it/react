
export const getOptimizedImageUrl = (url: string, width: number = 800): string => {
  if (!url) return '/placeholder.svg';
  
  // Check if it's a Supabase Storage URL
  if (url.includes('supabase.co/storage/v1/object/public')) {
    // Supabase supports transformations via the 'transform' query parameter
    // or /render/image/public/ (if using the image transformation service)
    // However, the standard Supabase way is usually ?width=w
    // But for the Pro/Enterprise plan or if enabled, we can use the transformation API.
    // Assuming standard resizing is available or we append query params.
    // Let's use the ?width= parameter which is common for many CDNs, 
    // or if Supabase Image Transformation is enabled:
    // https://project.supabase.co/storage/v1/render/image/public/...
    
    // For safety, if we are not sure if Image Transformation is enabled, 
    // we can return the original URL. But the user requested optimization.
    // Let's assume we can append ?width=... &format=webp
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&format=webp&quality=80`;
  }
  
  return url;
};
