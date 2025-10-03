import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Automatically scrolls to the top of the page when the route changes
 * This ensures users always start at the top when navigating between pages
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    // Only scroll to top if the pathname actually changed
    // This prevents unnecessary scrolling on initial page load
    if (previousPathname.current !== pathname) {
      // Small delay to ensure the new page has started rendering
      const timeoutId = setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth' // Smooth scroll animation
        });
      }, 100);

      // Update the previous pathname
      previousPathname.current = pathname;

      // Cleanup timeout on unmount or pathname change
      return () => clearTimeout(timeoutId);
    }
  }, [pathname]);

  // Also handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return null; // This component doesn't render anything
};
