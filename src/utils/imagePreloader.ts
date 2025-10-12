// Image preloader utility for faster image loading

// Global image cache
const imageCache = new Set<string>();
const preloadedImages = new Map<string, HTMLImageElement>();

/**
 * Preload a single image
 */
export const preloadImage = (src: string): Promise<void> => {
  // Return immediately if already cached
  if (imageCache.has(src)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    // Use link preload for browser optimization
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);

    // Also create Image object for immediate loading
    const img = new Image();
    
    img.onload = () => {
      imageCache.add(src);
      preloadedImages.set(src, img);
      if (link.parentNode) {
        document.head.removeChild(link);
      }
      resolve();
    };

    img.onerror = () => {
      if (link.parentNode) {
        document.head.removeChild(link);
      }
      reject(new Error(`Failed to preload image: ${src}`));
    };

    img.src = src;
  });
};

/**
 * Preload multiple images in parallel
 */
export const preloadImages = async (srcs: string[]): Promise<void> => {
  const promises = srcs.map(src => preloadImage(src).catch(err => {
    console.warn(err);
    return Promise.resolve(); // Don't fail the whole batch
  }));

  await Promise.all(promises);
};

/**
 * Check if an image is cached
 */
export const isImageCached = (src: string): boolean => {
  return imageCache.has(src);
};

/**
 * Get cached image element
 */
export const getCachedImage = (src: string): HTMLImageElement | undefined => {
  return preloadedImages.get(src);
};

/**
 * Clear image cache (useful for memory management)
 */
export const clearImageCache = (): void => {
  imageCache.clear();
  preloadedImages.clear();
};

/**
 * Preload images with priority (high priority images load first)
 */
export const preloadImagesWithPriority = async (
  highPriority: string[],
  lowPriority: string[]
): Promise<void> => {
  // Load high priority images first
  await preloadImages(highPriority);
  
  // Then load low priority images in the background
  preloadImages(lowPriority).catch(err => console.warn(err));
};

