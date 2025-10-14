import { useState, useEffect } from 'react';
import { breakpoints } from '@/theme/theme';

/**
 * Mobile-First Breakpoint Detection Hook
 * Provides current breakpoint and responsive utilities
 */

export type Breakpoint = 'mobile' | 'mobileLarge' | 'tablet' | 'desktop' | 'desktopLarge' | 'desktopXL';

interface BreakpointState {
  current: Breakpoint;
  isMobile: boolean;
  isMobileLarge: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isDesktopLarge: boolean;
  isDesktopXL: boolean;
  width: number;
  height: number;
}

const getBreakpoint = (width: number): Breakpoint => {
  if (width >= breakpoints.desktopXL) return 'desktopXL';
  if (width >= breakpoints.desktopLarge) return 'desktopLarge';
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  if (width >= breakpoints.mobileLarge) return 'mobileLarge';
  return 'mobile';
};

const getBreakpointState = (): BreakpointState => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 0;
  const height = typeof window !== 'undefined' ? window.innerHeight : 0;
  const current = getBreakpoint(width);

  return {
    current,
    isMobile: width < breakpoints.mobileLarge,
    isMobileLarge: width >= breakpoints.mobileLarge && width < breakpoints.tablet,
    isTablet: width >= breakpoints.tablet && width < breakpoints.desktop,
    isDesktop: width >= breakpoints.desktop && width < breakpoints.desktopLarge,
    isDesktopLarge: width >= breakpoints.desktopLarge && width < breakpoints.desktopXL,
    isDesktopXL: width >= breakpoints.desktopXL,
    width,
    height,
  };
};

/**
 * Hook to detect and respond to viewport breakpoints
 * @returns Current breakpoint state with responsive utilities
 */
export const useBreakpoint = (): BreakpointState => {
  const [breakpointState, setBreakpointState] = useState<BreakpointState>(getBreakpointState);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events for performance
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setBreakpointState(getBreakpointState());
      }, 150);
    };

    // Use ResizeObserver for better performance if available
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(document.documentElement);

      return () => {
        clearTimeout(timeoutId);
        resizeObserver.disconnect();
      };
    } else {
      // Fallback to resize event listener
      window.addEventListener('resize', handleResize);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return breakpointState;
};

/**
 * Hook to check if viewport is at or above a specific breakpoint
 * @param breakpoint - The breakpoint to check against
 * @returns Boolean indicating if viewport is at or above the breakpoint
 */
export const useMediaQuery = (breakpoint: keyof typeof breakpoints): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= breakpoints[breakpoint];
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(`(min-width: ${breakpoints[breakpoint]}px)`);
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      handleChange(mediaQuery); // Set initial value
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    } 
    // Legacy browsers
    else {
      mediaQuery.addListener(handleChange);
      handleChange(mediaQuery); // Set initial value
      
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [breakpoint]);

  return matches;
};

export default useBreakpoint;



