import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

// Image cache to prevent re-downloading
const imageCache = new Map<string, boolean>();

export const OptimizedImage = ({
  src,
  alt,
  className = '',
  placeholderSrc,
  onError,
  priority = false,
  objectFit = 'cover'
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(imageCache.has(src));
  const [isInView, setIsInView] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState(priority || imageCache.has(src) ? src : '');
  const imgRef = useRef<HTMLImageElement>(null);

  // Aggressive Intersection Observer for faster loading
  useEffect(() => {
    if (priority || !imgRef.current || imageCache.has(src)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Start loading 200px before (increased from 50px)
        threshold: 0.01, // Trigger as soon as 1% is visible
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority, src]);

  // Preload image immediately when in view
  useEffect(() => {
    if (!isInView || currentSrc === src || imageCache.has(src)) {
      if (imageCache.has(src)) {
        setIsLoaded(true);
        setCurrentSrc(src);
      }
      return;
    }

    // Use link preload for faster loading
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);

    const img = new Image();
    img.src = src;
    
    // Set image immediately, don't wait for full load
    setCurrentSrc(src);
    
    img.onload = () => {
      imageCache.set(src, true); // Cache the loaded image
      setIsLoaded(true);
      document.head.removeChild(link);
    };

    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      document.head.removeChild(link);
      if (onError && imgRef.current) {
        const syntheticEvent = {
          currentTarget: imgRef.current,
        } as React.SyntheticEvent<HTMLImageElement>;
        onError(syntheticEvent);
      }
    };

    return () => {
      if (link.parentNode) {
        document.head.removeChild(link);
      }
    };
  }, [isInView, src, currentSrc, onError]);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* Minimal placeholder while loading */}
      {!isLoaded && !imageCache.has(src) && (
        <div className="absolute inset-0 bg-muted/30" />
      )}
      
      {/* Actual image */}
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full ${className}`}
          style={{ objectFit }}
          onLoad={() => {
            setIsLoaded(true);
            imageCache.set(src, true);
          }}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
        />
      )}
    </div>
  );
};
