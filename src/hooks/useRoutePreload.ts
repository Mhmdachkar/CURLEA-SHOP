import { useEffect } from 'react';

/**
 * Hook to preload route chunks for instant navigation
 * This dramatically improves perceived performance by loading route code before navigation
 */
export const useRoutePreload = () => {
  useEffect(() => {
    // Preload critical routes after initial page load
    const preloadRoutes = async () => {
      // Wait for page to be idle before preloading
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          // Preload common routes that users are likely to visit
          Promise.all([
            import('../pages/CollectionPage'),
            import('../pages/ProductDetailPage'),
            import('../pages/CheckoutPage'),
          ]).catch(() => {
            // Silently fail - preloading is an optimization, not critical
          });
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          Promise.all([
            import('../pages/CollectionPage'),
            import('../pages/ProductDetailPage'),
            import('../pages/CheckoutPage'),
          ]).catch(() => {
            // Silently fail
          });
        }, 2000);
      }
    };

    preloadRoutes();
  }, []);
};

/**
 * Preload a specific route on hover for instant navigation
 */
export const preloadRoute = (routeName: string) => {
  const routeMap: Record<string, () => Promise<any>> = {
    collection: () => import('../pages/CollectionPage'),
    product: () => import('../pages/ProductDetailPage'),
    checkout: () => import('../pages/CheckoutPage'),
    category: () => import('../pages/CategoryPage'),
    success: () => import('../pages/SuccessPage'),
  };

  const preloader = routeMap[routeName];
  if (preloader) {
    preloader().catch(() => {
      // Silently fail - preloading is an optimization
    });
  }
};

