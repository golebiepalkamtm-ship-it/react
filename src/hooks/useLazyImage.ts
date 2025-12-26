import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyImageOptions {
  threshold?: number;
  rootMargin?: string;
  placeholder?: string;
}

export const useLazyImage = (
  imageSrc: string,
  options: UseLazyImageOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    placeholder = '/placeholder.svg'
  } = options;

  const [src, setSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const loadImage = useCallback(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    
    img.onload = () => {
      setSrc(imageSrc);
      setIsLoaded(true);
      setIsError(false);
    };
    
    img.onerror = () => {
      setIsError(true);
      setIsLoaded(false);
    };
  }, [imageSrc]);

  useEffect(() => {
    const currentImgRef = imgRef.current;
    if (!currentImgRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(currentImgRef);

    return () => {
      if (currentImgRef) {
        observer.unobserve(currentImgRef);
      }
    };
  }, [loadImage, threshold, rootMargin]);

  return {
    src: src || placeholder,
    isLoaded,
    isError,
    imgRef,
  };
};
