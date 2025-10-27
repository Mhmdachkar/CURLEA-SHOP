import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { CartDrawer } from "@/components/CartDrawer";
import { RealtimeSync } from "@/components/RealtimeSync";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { registerServiceWorker } from "@/utils/serviceWorker";
import Index from "./pages/Index";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CollectionPage } from "./pages/CollectionPage";
import { CategoryPage } from "./pages/CategoryPage";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  // Register Service Worker for offline support
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker();
    }
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
              <RealtimeSync />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<CollectionPage />} />
                <Route path="/collection" element={<CollectionPage />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <CartDrawer />
            </BrowserRouter>
            </CartProvider>
          </RealtimeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
