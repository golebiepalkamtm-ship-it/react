import { useState, useEffect } from 'react';

interface AuctionImageProps {
  src: string;
  alt: string;
}

export const AuctionImage = ({ src, alt }: AuctionImageProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (src.includes('placeholder')) {
      setImageSrc(null);
      return;
    }

    const img = new Image();
    img.src = src;
    img.onload = () => setImageSrc(src);
    img.onerror = () => setImageSrc(null);
  }, [src]);

  return (
    <div
      role="img"
      aria-label={alt}
      className="w-full h-full bg-cover bg-center bg-gradient-to-br from-[#2a2a1a] to-[#1a1a0f]"
      style={{ backgroundImage: imageSrc ? `url(${imageSrc})` : undefined }}
    />
  );
};
