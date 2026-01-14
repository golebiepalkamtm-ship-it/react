import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface SmartImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fitMode?: 'cover' | 'contain' | 'fill';
  aspectRatio?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const SmartImageInner: React.FC<SmartImageProps> = ({
  src,
  alt,
  width = 300,
  height = 200,
  fitMode = 'cover',
  aspectRatio = '16/9',
  className = '',
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(Boolean(src));
  const [hasError, setHasError] = useState(!src);

  const getFitClass = () => {
    switch (fitMode) {
      case 'cover': return 'object-cover';
      case 'contain': return 'object-contain';
      case 'fill': return 'object-fill';
      default: return 'object-cover';
    }
  };

  const getAspectRatioClass = () => {
    if (!aspectRatio) return '';
    const [widthRatio, heightRatio] = aspectRatio.split('/').map(Number);
    return `aspect-[${widthRatio}/${heightRatio}]`;
  };

  if (hasError) {
    return (
      <div
        className={`relative overflow-hidden bg-gray-200 dark:bg-gray-800 rounded-xl ${getAspectRatioClass()} ${className}`}
        style={{ width, height }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <span className="text-sm">Image failed to load</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-gray-200 dark:bg-gray-800 rounded-xl ${getAspectRatioClass()} ${className}`}
      style={{ width, height }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-gold animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full transition-opacity duration-300 ${getFitClass()} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        loading="lazy"
        decoding="async"
        onLoad={() => {
          setIsLoading(false);
          setHasError(false);
          onLoad?.();
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
          onError?.();
        }}
      />
    </div>
  );
};

export const SmartImage: React.FC<SmartImageProps> = (props) => {
  return <SmartImageInner key={props.src || 'empty'} {...props} />;
};
