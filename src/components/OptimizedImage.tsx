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
  removeBlackBorders?: boolean;
}

// Image cache to prevent re-downloading
const imageCache = new Map<string, boolean>();

// No default placeholder image; avoid swapping to arbitrary photos

export const OptimizedImage = ({
  src,
  alt,
  className = '',
  placeholderSrc,
  onError,
  priority = false,
  objectFit = 'cover',
  removeBlackBorders = false
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

    // Use link preload for faster loading (only for priority images)
    let link: HTMLLinkElement | null = null;
    if (priority) {
      link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    }

    const img = new Image();
    img.src = src;

    // Set image immediately, don't wait for full load
    setCurrentSrc(src);

    img.onload = () => {
      imageCache.set(src, true); // Cache the loaded image
      setIsLoaded(true);
      // Safely remove link if it exists
      if (link && link.parentNode) {
        try {
          document.head.removeChild(link);
        } catch (error) {
          // Link might have been removed already, ignore error
        }
      }
    };

    img.onerror = () => {
      console.error(`Failed to preload image: ${src}`);
      // Do not swap to any placeholder image
      const fallback = placeholderSrc || '';
      setCurrentSrc(fallback);
      setIsLoaded(true);
      // Safely remove link if it exists
      if (link && link.parentNode) {
        try {
          document.head.removeChild(link);
        } catch (error) {
          // Link might have been removed already, ignore error
        }
      }
      if (onError && imgRef.current) {
        const syntheticEvent = {
          currentTarget: imgRef.current,
        } as React.SyntheticEvent<HTMLImageElement>;
        onError(syntheticEvent);
      }
    };

    return () => {
      // Safely remove link if it exists
      if (link && link.parentNode) {
        try {
          document.head.removeChild(link);
        } catch (error) {
          // Link might have been removed already, ignore error
        }
      }
    };
  }, [isInView, src, currentSrc, onError, placeholderSrc]);

  // Check if this is the product-4.webp image that needs black border removal
  const isProduct4Image = src.includes('product-4.webp');
  const shouldRemoveBlackBorders = removeBlackBorders || isProduct4Image;

  return (
    <div ref={imgRef} className={`relative h-full ${className}`}>
      {/* Image placeholder while loading */}
      {!isLoaded && !imageCache.has(src) && (
        <div
          className={`absolute inset-0 w-full h-full ${className} bg-gray-100 dark:bg-gray-800 animate-pulse`}
          aria-hidden
        />
      )}

      {/* Actual image */}
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full ${className} ${shouldRemoveBlackBorders ? 'remove-black-borders' : ''}`}
          style={{
            objectFit,
            ...(shouldRemoveBlackBorders && {
              filter: 'contrast(1.1) brightness(1.05) saturate(1.1)',
              clipPath: 'inset(2% 2% 2% 2%)', // Remove 2% from all edges to crop black borders
            })
          }}
          onLoad={() => {
            setIsLoaded(true);
            imageCache.set(currentSrc, true);
          }}
          onError={(e) => {
            // Do not replace with any image; simply keep skeleton hidden state handled externally
            if (onError) onError(e);
          }}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchpriority={priority ? 'high' : 'auto'}
        />
      )}
    </div>
  );
};
