import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Enhanced Elegant ScrollToTop Component
 * Provides sophisticated scroll-to-top with elegant animations
 */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const previousPathname = useRef(pathname);

  // Apple-style heavy scroll with physics
  const smoothScrollToTop = () => {
    const startPosition = window.pageYOffset;
    const duration = 1400; // Apple-style longer duration for heavy feel
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Apple-style easing with heavy momentum and subtle bounce
      let easeProgress;
      
      if (progress < 0.3) {
        // Heavy initial acceleration
        easeProgress = 8 * progress * progress * progress;
      } else if (progress < 0.7) {
        // Smooth middle section
        const t = (progress - 0.3) / 0.4;
        easeProgress = 0.216 + (1 - Math.pow(1 - t, 2)) * 0.6;
      } else {
        // Subtle bounce at the end (Apple signature)
        const t = (progress - 0.7) / 0.3;
        easeProgress = 0.816 + (1 - Math.pow(1 - t, 3)) * 0.15;
      }

      const currentPosition = startPosition * (1 - easeProgress);
      window.scrollTo(0, currentPosition);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  useEffect(() => {
    // Only scroll to top if the pathname actually changed
    if (previousPathname.current !== pathname) {
      // CRITICAL: Skip scroll-to-top if there's a hash in the URL
      // This allows hash navigation (like #black-friday-section) to work properly
      if (hash) {
        previousPathname.current = pathname;
        return; // Don't scroll to top, let the page handle hash navigation
      }
      
      // Don't interfere with CollectionPage animation
      // Skip scroll animation when navigating TO collection/shop pages
      if (pathname === '/collection' || pathname === '/shop') {
        // For collection/shop pages, let the page handle its own animation
        // Just scroll to top instantly without animation
        window.scrollTo(0, 0);
        previousPathname.current = pathname;
        return;
      }
      
      // Skip scroll animation when navigating FROM product detail TO collection/shop
      if (previousPathname.current.startsWith('/product/') && (pathname === '/collection' || pathname === '/shop')) {
        window.scrollTo(0, 0);
        previousPathname.current = pathname;
        return;
      }
      
      // Add loading class to prevent scroll conflicts for other pages
      document.documentElement.classList.add('page-loading');
      
      // Prevent all scroll events during transition
      const preventScroll = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      
      window.addEventListener('scroll', preventScroll, { passive: false });
      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });
      
      // Elegant delay for page transition
      const timeoutId = setTimeout(() => {
        smoothScrollToTop();
        // Remove loading class and event listeners after scroll starts
        setTimeout(() => {
          window.removeEventListener('scroll', preventScroll);
          window.removeEventListener('wheel', preventScroll);
          window.removeEventListener('touchmove', preventScroll);
          document.documentElement.classList.remove('page-loading');
        }, 300);
      }, 150);

      previousPathname.current = pathname;

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('scroll', preventScroll);
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
        document.documentElement.classList.remove('page-loading');
      };
    }
  }, [pathname, hash]); // Include hash in dependencies

  // Enhanced browser back/forward handling
  useEffect(() => {
    const handlePopState = () => {
      setTimeout(() => {
        smoothScrollToTop();
      }, 150);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return null;
};
