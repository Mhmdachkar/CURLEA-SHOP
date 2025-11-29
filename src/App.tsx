import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { CartDrawer } from "@/components/CartDrawer";
import { RealtimeSync } from "@/components/RealtimeSync";
import { ScrollToTop } from "@/components/ScrollToTop";
import RouteAnalytics from "@/components/RouteAnalytics";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { registerServiceWorker } from "@/utils/serviceWorker";
import BlackFridayPopup from "@/components/BlackFridayPopup";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import Index from "./pages/Index";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CollectionPage } from "./pages/CollectionPage";
import CheckoutPage from "./pages/CheckoutPage";
import SuccessPage from "./pages/SuccessPage";
import { CategoryPage } from "./pages/CategoryPage";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { initializeSupabaseIntegration, trackCampaignFromUrl } from "@/services/supabaseIntegration";

const queryClient = new QueryClient();

const App = () => {
  // Initialize smooth scroll
  useSmoothScroll();

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
                toastOptions={{
                  style: {
                    background: '#000',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '14px',
                    padding: '16px',
                  },
                  duration: 3000,
                }}
                closeButton
              />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true
                }}
              >
                <ScrollToTop />
                <RouteAnalytics />
                <RealtimeSync />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/shop" element={<CollectionPage />} />
                  <Route path="/collection" element={<CollectionPage />} />
                  <Route path="/category/:category" element={<CategoryPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/success" element={<SuccessPage />} />
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <CartDrawer />
                <BlackFridayPopup />
              </BrowserRouter>
            </CartProvider>
          </RealtimeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
