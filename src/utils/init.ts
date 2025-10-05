/**
 * Application Initialization
 * This file handles security, performance, and error monitoring initialization
 */

import { performSecurityAudit } from './security';
import { performanceMonitor, memoryMonitor, bundleOptimizer, animationOptimizer } from './performance';

// Initialize security measures
export const initSecurity = (): void => {
  // Perform security audit in development
  if (process.env.NODE_ENV === 'development') {
    performSecurityAudit();
  }

  // Set up CSP violation reporting
  if (typeof window !== 'undefined') {
    window.addEventListener('securitypolicyviolation', (event) => {
      console.warn('CSP Violation:', {
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        originalPolicy: event.originalPolicy
      });
    });
  }
};

// Initialize performance monitoring
export const initPerformance = (): void => {
  if (process.env.NODE_ENV === 'development') {
    // Monitor memory usage periodically
    setInterval(() => {
      memoryMonitor.logMemoryUsage();
    }, 30000); // Every 30 seconds

    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          console.log('📊 Page Load Performance:', {
            'DOM Content Loaded': `${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`,
            'Load Complete': `${navigation.loadEventEnd - navigation.loadEventStart}ms`,
            'Total Load Time': `${navigation.loadEventEnd - navigation.fetchStart}ms`
          });
        }
      }, 0);
    });
  }

  // Preload critical resources
  bundleOptimizer.preloadCriticalResources();
};

// Initialize error monitoring
export const initErrorMonitoring = (): void => {
  // Global error handler
  window.addEventListener('error', (event) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Global Error:', event.error);
    }
    // In production, send to error reporting service
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Unhandled Promise Rejection:', event.reason);
    }
    // In production, send to error reporting service
  });
};

// Initialize accessibility features
export const initAccessibility = (): void => {
  // Check for reduced motion preference
  if (animationOptimizer.prefersReducedMotion()) {
    document.documentElement.classList.add('reduce-motion');
  }

  // Set up keyboard navigation improvements
  document.addEventListener('keydown', (event) => {
    // ESC key to close modals/drawers
    if (event.key === 'Escape') {
      const modals = document.querySelectorAll('[data-modal="true"]');
      modals.forEach(modal => {
        const closeButton = modal.querySelector('[data-close="true"]') as HTMLElement;
        if (closeButton) {
          closeButton.click();
        }
      });
    }
  });
};

// Initialize all systems
export const initializeApp = (): void => {
  performanceMonitor.startTime('app-initialization');

  try {
    initSecurity();
    initPerformance();
    initErrorMonitoring();
    initAccessibility();

    performanceMonitor.endTime('app-initialization');

    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Application initialized successfully');
      console.log('🔒 Security measures active');
      console.log('⚡ Performance monitoring enabled');
      console.log('♿ Accessibility features loaded');
    }
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
};

// Cleanup function for app unmount
export const cleanupApp = (): void => {
  // Clear performance marks
  performanceMonitor.clearMarks();

  // Remove event listeners
  window.removeEventListener('error', () => {});
  window.removeEventListener('unhandledrejection', () => {});
  window.removeEventListener('securitypolicyviolation', () => {});

  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Application cleanup completed');
  }
};
