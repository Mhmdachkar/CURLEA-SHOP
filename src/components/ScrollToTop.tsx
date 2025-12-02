import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Standard ScrollToTop Component
 * Provides immediate scroll-to-top on route changes,
 * while respecting hash navigation for specific sections.
 */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    // Only scroll to top if the pathname actually changed
    if (previousPathname.current !== pathname) {
      // CRITICAL: Skip scroll-to-top if there's a hash in the URL
      // This allows hash navigation (like #black-friday-section) to work properly
      if (hash) {
        previousPathname.current = pathname;
        return; // Don't scroll to top, let the page handle hash navigation
      }

      // Immediate scroll to top for all other navigation
      window.scrollTo(0, 0);

      previousPathname.current = pathname;
    }
  }, [pathname, hash]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 50);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return null;
};
