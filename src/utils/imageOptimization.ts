/**
 * Image optimization utilities for better performance and security
 */

// Image optimization configuration
export const IMAGE_CONFIG = {
  // Maximum file sizes (in bytes)
  maxFileSize: 500 * 1024, // 500KB
  maxDimensions: {
    width: 1200,
    height: 1200
  },
  // Allowed image formats
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
  // Quality settings
  quality: {
    high: 85,
    medium: 75,
    low: 65
  }
} as const;

// Image validation
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > IMAGE_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: `File size too large. Maximum allowed: ${IMAGE_CONFIG.maxFileSize / 1024}KB`
    };
  }

  // Check file type
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !IMAGE_CONFIG.allowedFormats.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file format. Allowed: ${IMAGE_CONFIG.allowedFormats.join(', ')}`
    };
  }

  return { valid: true };
};

// Image URL validation and optimization
export const optimizeImageUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
} = {}): string => {
  try {
    const urlObj = new URL(url);
    
    // For Unsplash images, add optimization parameters
    if (urlObj.hostname === 'images.unsplash.com') {
      const params = new URLSearchParams(urlObj.search);
      
      // Set dimensions
      if (options.width) params.set('w', options.width.toString());
      if (options.height) params.set('h', options.height.toString());
      
      // Set quality (Unsplash supports q parameter)
      if (options.quality) {
        const quality = Math.min(100, Math.max(10, options.quality));
        params.set('q', quality.toString());
      }
      
      // Set format
      if (options.format) {
        params.set('fm', options.format);
      }
      
      // Add auto-optimization
      params.set('auto', 'format');
      params.set('fit', 'crop');
      
      urlObj.search = params.toString();
    }
    
    return urlObj.toString();
  } catch {
    // If URL parsing fails, return original URL
    return url;
  }
};

// Generate responsive image URLs
export const generateResponsiveImageUrls = (baseUrl: string): {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  original: string;
} => {
  return {
    thumbnail: optimizeImageUrl(baseUrl, { width: 150, height: 150, quality: 75 }),
    small: optimizeImageUrl(baseUrl, { width: 400, height: 400, quality: 80 }),
    medium: optimizeImageUrl(baseUrl, { width: 800, height: 800, quality: 85 }),
    large: optimizeImageUrl(baseUrl, { width: 1200, height: 1200, quality: 90 }),
    original: baseUrl
  };
};

// Lazy loading utility
export const createLazyImageObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  if (typeof window === 'undefined') return null;
  
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  });
};

// Image preloading utility
export const preloadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

// Batch image preloading
export const preloadImages = async (urls: string[]): Promise<HTMLImageElement[]> => {
  try {
    const promises = urls.map(url => preloadImage(url));
    return await Promise.all(promises);
  } catch (error) {
    console.warn('Some images failed to preload:', error);
    return [];
  }
};

// Image compression utility (client-side)
export const compressImage = async (
  file: File,
  maxWidth: number = IMAGE_CONFIG.maxDimensions.width,
  maxHeight: number = IMAGE_CONFIG.maxDimensions.height,
  quality: number = IMAGE_CONFIG.quality.medium
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Image compression failed'));
          }
        },
        'image/jpeg',
        quality / 100
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Security: Validate image URLs to prevent malicious content
export const validateImageUrl = (url: string): boolean => {
  try {
    // Handle relative paths (local assets)
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      // Allow relative paths that look like asset paths
      return !url.includes('..') || url.includes('/assets/');
    }
    
    const urlObj = new URL(url);
    const allowedDomains = [
      'images.unsplash.com',
      'localhost',
      '127.0.0.1',
      'lovable.dev'
    ];
    
    // Check if domain is allowed
    if (!allowedDomains.includes(urlObj.hostname)) {
      return false;
    }
    
    // Check protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i,
      /onload/i,
      /onerror/i
    ];
    
    return !suspiciousPatterns.some(pattern => pattern.test(url));
  } catch {
    return false;
  }
};

// Performance monitoring for images
export const trackImageLoad = (url: string, startTime: number) => {
  const loadTime = performance.now() - startTime;
  
  // Log slow-loading images
  if (loadTime > 3000) { // 3 seconds
    console.warn(`Slow image load detected: ${url} (${loadTime.toFixed(2)}ms)`);
  }
  
  // You can integrate with analytics here
  return loadTime;
};
