import { useEffect } from 'react';

/**
 * Advanced Elegant Scrolling System
 * Provides smooth, professional scrolling with momentum and easing
 * Prevents scroll rendering issues and provides elegant user experience
 * ENHANCED: Prevents scroll conflicts during page load
 */
export const useAdvancedScroll = () => {
  useEffect(() => {
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;
    let isPageLoading = true;
    
    // Prevent scroll conflicts during initial page load
    const handlePageLoad = () => {
      isPageLoading = false;
      // Remove loading class after page is fully loaded
      document.documentElement.classList.remove('page-loading');
    };
    
    // Check if page is already loaded
    if (document.readyState === 'complete') {
      isPageLoading = false;
    } else {
      document.documentElement.classList.add('page-loading');
      window.addEventListener('load', handlePageLoad, { once: true });
    }
    
    // Enhanced smooth scroll with momentum
    const handleScroll = (event: Event) => {
      // Skip scroll handling during page load to prevent conflicts
      if (isPageLoading || document.documentElement.classList.contains('page-loading')) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }

      // Additional check for hero sections during page loading
      const heroSections = document.querySelectorAll('.hero-section.page-loading-hero');
      if (heroSections.length > 0) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
      
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Add scrolling class for visual feedback
      if (!isScrolling) {
        document.documentElement.classList.add('is-scrolling');
        isScrolling = true;
      }
      
      // Remove class after scrolling stops
      scrollTimeout = setTimeout(() => {
        document.documentElement.classList.remove('is-scrolling');
        isScrolling = false;
      }, 150);
    };
    
    // Add scroll listener with slight delay to prevent initial conflicts
    const timeoutId = setTimeout(() => {
      window.addEventListener('scroll', handleScroll, { passive: false });
    }, 100);
    
    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('load', handlePageLoad);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);
  
  // Utility function to scroll to top smoothly
  const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior
    });
  };
  
  // Utility function to scroll to element
  const scrollToElement = (elementId: string, offset: number = 80) => {
    const element = document.getElementById(elementId);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    }
  };
  
  return { scrollToTop, scrollToElement };
};

/**
 * Hook to ensure page loads at top
 * Prevents scroll restoration issues
 * ENHANCED: Immediate scroll access without conflicts
 */
export const useScrollToTop = (dependencies: any[] = []) => {
  useEffect(() => {
    // Prevent scroll restoration
    window.history.scrollRestoration = 'manual';
    
    // Add loading class to prevent scroll conflicts
    document.documentElement.classList.add('page-loading');
    
    // Force scroll to top IMMEDIATELY - single reliable method
    const scrollToTopImmediately = () => {
      window.scrollTo(0, 0);
    };
    
    // Execute immediately
    scrollToTopImmediately();
    
    // Execute once more after DOM is ready with slight delay
    const timeout = setTimeout(() => {
      scrollToTopImmediately();
      // Remove loading class after scroll is complete
      document.documentElement.classList.remove('page-loading');
    }, 50);
    
    // Cleanup
    return () => {
      clearTimeout(timeout);
      document.documentElement.classList.remove('page-loading');
      window.history.scrollRestoration = 'auto';
    };
  }, dependencies);
};

