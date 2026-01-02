import { memo } from 'react';
import { useLazyImage } from '@/hooks/useLazyImage';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  threshold?: number;
  rootMargin?: string;
}

const LazyImage = memo(({
  src,
  alt,
  className,
  placeholder,
  threshold,
  rootMargin,
}: LazyImageProps) => {
  const { imgRef, src: loadedSrc, isLoaded, isError } = useLazyImage(src, {
    placeholder,
    threshold,
    rootMargin,
  });

  return (
    <img
      ref={imgRef}
      src={loadedSrc}
      alt={alt}
      className={cn(
        'transition-opacity duration-500',
        isLoaded ? 'opacity-100' : 'opacity-75',
        isError && 'blur-sm',
        className
      )}
      loading="lazy"
    />
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
