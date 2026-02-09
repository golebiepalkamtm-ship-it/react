import { useMemo } from 'react';

interface AuctionImageProps {
  src: string;
  alt: string;
}

export const AuctionImage = ({ src, alt }: AuctionImageProps) => {
  const imageSrc = useMemo(() => {
    const trimmed = src?.trim();
    if (!trimmed) return '/placeholder.svg';
    return trimmed.includes('placeholder') ? '/placeholder.svg' : trimmed;
  }, [src]);

  return (
    <div className="relative w-full h-full bg-black">
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover origin-center scale-90 select-none pointer-events-none filter grayscale transition-[filter] duration-300 group-hover:grayscale-0 hover:grayscale-0"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          if (target.src !== '/placeholder.svg') {
            target.src = '/placeholder.svg';
          }
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
    </div>
  );
};
