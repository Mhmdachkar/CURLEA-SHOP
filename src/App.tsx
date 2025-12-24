import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { CartDrawer } from "@/components/CartDrawer";
import { RealtimeSync } from "@/components/RealtimeSync";
import { ScrollToTop } from "@/components/ScrollToTop";
import RouteAnalytics from "@/components/RouteAnalytics";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { registerServiceWorker } from "@/utils/serviceWorker";

import PromotionalBanner from "@/components/PromotionalBanner";
import { ChristmasOfferModal } from "@/components/ChristmasOfferModal";
import { FloatingGiftIcon } from "@/components/FloatingGiftIcon";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { useRoutePreload } from "@/hooks/useRoutePreload";
import { lazy, Suspense, useEffect } from "react";
import { initializeSupabaseIntegration, trackCampaignFromUrl } from "@/services/supabaseIntegration";

// Lazy load pages for better performance (code splitting)
const Index = lazy(() => import("./pages/Index"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage").then(m => ({ default: m.ProductDetailPage })));
const CollectionPage = lazy(() => import("./pages/CollectionPage").then(m => ({ default: m.CollectionPage })));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const SuccessPage = lazy(() => import("./pages/SuccessPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage").then(m => ({ default: m.CategoryPage })));
const ShopifyHomeDashboard = lazy(() => import("./pages/ShopifyHomeDashboard"));
const ProductVerificationPanel = lazy(() => import("./components/ProductVerificationPanel").then(m => ({ default: m.ProductVerificationPanel })));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
      </div>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  // Initialize smooth scroll
  useSmoothScroll();
  
  // Preload critical routes for instant navigation
  useRoutePreload();

  // Register Service Worker for offline support
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker();

      // Force check for service worker updates on page load
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg) {
            console.log('🔍 Checking for service worker updates...');
            reg.update();
          }
        });
      }
    }
  }, []);

  // Initialize comprehensive Supabase integration
  useEffect(() => {
    // Wait a bit for analytics SDK to initialize
    const timer = setTimeout(() => {
      initializeSupabaseIntegration().catch(console.error);
      trackCampaignFromUrl(); // Track campaign from URL params
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RealtimeProvider>
            <CartProvider>
              <Toaster
                theme="dark"
                position="top-center"
                richColors={false}
                toastOptions={{
                  unstyled: false,
                  classNames: {
                    toast: 'elegant-toast-container',
                  },
                }}
                closeButton
              />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true
                }}
              >
                <PromotionalBanner />
                <ChristmasOfferModal />
                <FloatingGiftIcon />
                <ScrollToTop />
                <RouteAnalytics />
                <RealtimeSync />
                <WhatsAppFloatingButton />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/shop" element={<CollectionPage />} />
                    <Route path="/collection" element={<CollectionPage />} />
                    <Route path="/category/:category" element={<CategoryPage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/success" element={<SuccessPage />} />
                    {/* Analytics Dashboard - Redirect old routes to new dashboard */}
                    <Route path="/analytics" element={<Navigate to="/shopify-home-dashboard" replace />} />
                    <Route path="/shopify-analytics" element={<Navigate to="/shopify-home-dashboard" replace />} />
                    <Route path="/shopify-home-dashboard" element={<ShopifyHomeDashboard />} />
                    <Route path="/verify-products" element={<ProductVerificationPanel />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <CartDrawer />

              </BrowserRouter>
            </CartProvider>
          </RealtimeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary >
  );
};

export default App;
