// Auto-sync hook for automatic data synchronization
import { useEffect, useCallback, useRef } from 'react';

interface AutoSyncOptions {
  interval?: number;
  enabled?: boolean;
  onSync?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for automatic data synchronization
 * Automatically updates data at specified intervals
 */
export const useAutoSync = <T>(
  syncFn: () => Promise<T> | T,
  options: AutoSyncOptions = {}
) => {
  const {
    interval = 30000, // 30 seconds default
    enabled = true,
    onSync,
    onError
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);

  const performSync = useCallback(async () => {
    if (!enabled || isActiveRef.current) return;

    try {
      isActiveRef.current = true;
      await syncFn();
      onSync?.();
    } catch (error) {
      console.error('Auto-sync error:', error);
      onError?.(error as Error);
    } finally {
      isActiveRef.current = false;
    }
  }, [syncFn, enabled, onSync, onError]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Perform initial sync
    performSync();

    // Set up interval
    intervalRef.current = setInterval(performSync, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, performSync]);

  // Manual sync trigger
  const triggerSync = useCallback(() => {
    performSync();
  }, [performSync]);

  return { triggerSync, isActive: isActiveRef.current };
};

/**
 * Hook for automatic form validation and sync
 */
export const useAutoValidate = (
  validationFn: () => boolean,
  options: AutoSyncOptions = {}
) => {
  const { interval = 1000, enabled = true } = options;

  const validate = useCallback(() => {
    if (!enabled) return false;
    return validationFn();
  }, [validationFn, enabled]);

  const { triggerSync: triggerValidation } = useAutoSync(validate, {
    ...options,
    interval
  });

  return { validate, triggerValidation };
};

/**
 * Hook for automatic scroll position sync
 */
export const useAutoScrollSync = (elementId: string) => {
  const lastScrollPosition = useRef(0);

  useEffect(() => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const handleScroll = () => {
      lastScrollPosition.current = element.scrollTop;
    };

    element.addEventListener('scroll', handleScroll);

    // Restore scroll position when component mounts
    if (lastScrollPosition.current > 0) {
      element.scrollTop = lastScrollPosition.current;
    }

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [elementId]);

  const scrollToTop = useCallback(() => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollTop = 0;
    }
  }, [elementId]);

  const scrollToBottom = useCallback(() => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [elementId]);

  return { scrollToTop, scrollToBottom };
};

/**
 * Hook for automatic focus management
 */
export const useAutoFocus = (shouldFocus: boolean, elementRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (shouldFocus && elementRef.current) {
      elementRef.current.focus();
    }
  }, [shouldFocus, elementRef]);
};

/**
 * Hook for automatic resize handling
 */
export const useAutoResize = (callback: (width: number, height: number) => void) => {
  useEffect(() => {
    const handleResize = () => {
      callback(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    
    // Initial call
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [callback]);
};
