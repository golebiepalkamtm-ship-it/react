interface SmartImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fitMode?: 'cover' | 'contain';
  aspectRatio?: 'square' | '16/9' | '4/3';
}

// Enkoduje ścieżkę URL zachowując slashe
const encodeImagePath = (path: string): string => {
  if (!path) return path;
  // Jeśli to pełny URL, nie zmieniaj
  // Jeśli to pełny URL lub inny schemat (blob:, data:, itp.), nie zmieniaj
  // Pozwala to zachować blob: URL (podglądy), data: oraz wszelkie schematy protokołów
  if (/^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('//')) {
    return path;
  }
  // Podziel ścieżkę po slashach i zakoduj każdy segment
  return path.split('/').map(segment => encodeURIComponent(segment)).join('/');
};

export const SmartImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  fitMode = 'cover',
  aspectRatio
}: SmartImageProps) => {
  const aspectRatioClass = aspectRatio === 'square' ? 'aspect-square' : 
                          aspectRatio === '16/9' ? 'aspect-video' :
                          aspectRatio === '4/3' ? 'aspect-[4/3]' : '';

  const encodedSrc = encodeImagePath(src);

  return (
    <img
      src={encodedSrc}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={`${aspectRatioClass} ${fitMode === 'cover' ? 'object-cover' : 'object-contain'} ${className}`}
      onError={(e) => {
        (e.target as HTMLImageElement).src = '/placeholder.svg';
      }}
    />
  );
};
