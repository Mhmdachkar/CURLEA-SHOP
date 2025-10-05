/**
 * Performance Optimization Utilities
 * This file contains utilities for optimizing app performance
 */

// Debounce function for search and input handling
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll and resize events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Image lazy loading with intersection observer
export const createLazyImageObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) => {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Performance monitoring
export const performanceMonitor = {
  startTime: (label: string): void => {
    performance.mark(`${label}-start`);
  },

  endTime: (label: string): number => {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = performance.getEntriesByName(label)[0];
    const duration = measure.duration;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  },

  clearMarks: (label?: string): void => {
    if (label) {
      performance.clearMarks(`${label}-start`);
      performance.clearMarks(`${label}-end`);
      performance.clearMeasures(label);
    } else {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
};

// Memory usage monitoring
export const memoryMonitor = {
  getMemoryInfo: (): any => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
    return null;
  },

  logMemoryUsage: (): void => {
    if (process.env.NODE_ENV === 'development') {
      const memory = memoryMonitor.getMemoryInfo();
      if (memory) {
        console.log('🧠 Memory Usage:', {
          used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
          total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
          limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
        });
      }
    }
  }
};

// Bundle size optimization
export const bundleOptimizer = {
  // Preload critical resources
  preloadCriticalResources: (): void => {
    const criticalResources = [
      '/src/assets/hero-1.png',
      '/src/assets/hero-2.png',
      '/src/assets/hero-3.png'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = resource;
      document.head.appendChild(link);
    });
  },

  // Prefetch next likely resources
  prefetchResources: (resources: string[]): void => {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  }
};

// Animation performance optimization
export const animationOptimizer = {
  // Use transform and opacity for better performance
  optimizedTransition: {
    duration: 0.3,
    ease: [0.43, 0.13, 0.23, 0.96],
    type: 'tween'
  },

  // Will-change optimization
  setWillChange: (element: HTMLElement, properties: string[]): void => {
    element.style.willChange = properties.join(', ');
  },

  clearWillChange: (element: HTMLElement): void => {
    element.style.willChange = 'auto';
  },

  // Reduced motion support
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
};

// Network optimization
export const networkOptimizer = {
  // Connection type detection
  getConnectionInfo: (): any => {
    if ('connection' in navigator) {
      return (navigator as any).connection;
    }
    return null;
  },

  // Adaptive loading based on connection
  shouldLoadHighQualityImages: (): boolean => {
    const connection = networkOptimizer.getConnectionInfo();
    if (connection) {
      return connection.effectiveType === '4g' && !connection.saveData;
    }
    return true; // Default to high quality
  }
};

// Resource loading optimization
export const resourceLoader = {
  // Load images with error handling
  loadImage: (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  },

  // Batch load images
  loadImages: async (sources: string[]): Promise<HTMLImageElement[]> => {
    const promises = sources.map(src => resourceLoader.loadImage(src));
    return Promise.all(promises);
  }
};

// Cleanup utilities
export const cleanup = {
  // Remove event listeners
  removeEventListeners: (element: HTMLElement, events: string[]): void => {
    events.forEach(event => {
      element.removeEventListener(event, () => {});
    });
  },

  // Clear timeouts and intervals
  clearTimers: (timers: (NodeJS.Timeout | number)[]): void => {
    timers.forEach(timer => {
      clearTimeout(timer as NodeJS.Timeout);
      clearInterval(timer as NodeJS.Timeout);
    });
  },

  // Dispose of resources
  dispose: (resources: { dispose?: () => void }[]): void => {
    resources.forEach(resource => {
      if (resource.dispose) {
        resource.dispose();
      }
    });
  }
};

// Performance budget monitoring
export const performanceBudget = {
  limits: {
    bundleSize: 500 * 1024, // 500KB
    imageSize: 200 * 1024, // 200KB per image
    animationDuration: 300, // 300ms max
    apiResponseTime: 1000 // 1s max
  },

  checkBundleSize: (size: number): boolean => {
    return size <= performanceBudget.limits.bundleSize;
  },

  checkImageSize: (size: number): boolean => {
    return size <= performanceBudget.limits.imageSize;
  },

  checkAnimationDuration: (duration: number): boolean => {
    return duration <= performanceBudget.limits.animationDuration;
  }
};
