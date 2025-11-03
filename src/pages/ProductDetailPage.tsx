import { motion, useInView, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { OptimizedImage } from "@/components/OptimizedImage";
import { ProductImage } from "@/components/ProductImage";
import { MediaShowcaseSection } from "@/components/MediaShowcaseSection";
import { ArrowLeft, Minus, Plus, Play, Pause, CheckCircle, Leaf, Users, Heart, ChevronLeft, ChevronRight, ShoppingBag, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { getProductById, getCurlyHairCollectionProductById, getCurlyHairCollectionProducts, products, Product } from "@/data/products";
import { getHeatlessCurlingRodProducts } from "./CategoryPage";
import { useCart } from "@/contexts/CartContext";
import { validateProductId } from "@/utils/validation";
import { preloadImagesWithPriority } from "@/utils/imagePreloader";
import { useRealtimeState } from "@/hooks/useRealtimeState";
import { useEventProduct, useEventUI, EVENTS } from "@/hooks/useEventSystem";
import { useRealtimeContext } from "@/contexts/RealtimeContext";
import { useAdvancedScroll, useScrollToTop } from "@/hooks/useAdvancedScroll";
import { toast } from "sonner";
import { fbTrack, gaTrack } from "@/utils/tracking";

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, openCart, state: cartState } = useCart();
  
  // Track where user came from for proper back navigation
  // First check location.state, then fallback to document.referrer
  const referrerPath = (location.state as { from?: string })?.from || (() => {
    const referrer = document.referrer;
    if (referrer && (referrer.includes('/shop') || referrer.includes('/collection'))) {
      return '/shop';
    } else if (referrer && referrer.includes('/category/')) {
      const match = referrer.match(/\/category\/([^/?]+)/);
      if (match) {
        return `/category/${match[1]}`;
      }
    }
    return '';
  })();
  
  // Initialize advanced scroll system
  useAdvancedScroll();
  
  // Ensure page loads at top when product changes
  useScrollToTop([id]);
  
  // Real-time context for global state
  const { setCurrentProduct, setSelectedColor: setGlobalColor, setSelectedQuantity: setGlobalQuantity } = useRealtimeContext();
  
  // Event system for instant updates
  const { selectProduct, selectColor, selectQuantity } = useEventProduct();
  const { showError, hideError } = useEventUI();
  
  // State management - using regular useState for color to avoid conflicts
  const [quantity, setQuantity] = useRealtimeState(`product-${id}-quantity`, 1);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [error, setError] = useState<string>("");


  // Validate product ID
  if (!id || !validateProductId(id)) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-500">Invalid Product ID</h1>
          <p className="text-muted-foreground mb-8">The product ID contains invalid characters.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Get product by ID - try main products first, then specialized collections
  let product = getProductById(id);
  if (!product && id?.startsWith('curly-')) {
    product = getCurlyHairCollectionProductById(id);
  }
  if (!product && (id?.startsWith('heatless-') || id?.startsWith('dreamcurl-'))) {
    product = getHeatlessCurlingRodProductById(id);
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Set default selectedSize for hair clip product
  useEffect(() => {
    if (product?.id === 'curly-clip-1' && !selectedSize) {
      setSelectedSize('9-piece-complete');
    }
  }, [product?.id, selectedSize]);

  // Track product view events
  useEffect(() => {
    if (!product) return;

    const priceNumber = typeof product.price === 'string'
      ? parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0
      : Number(product.price) || 0;

    fbTrack('ViewContent', {
      content_name: product.name,
      content_ids: [product.id],
      value: priceNumber,
      currency: 'USD',
    });

    gaTrack('view_item', {
      currency: 'USD',
      value: priceNumber,
      items: [{ id: product.id, name: product.name }],
    });
  }, [product?.id]);

  // Scroll to top instantly when page loads
  useEffect(() => {
    // Add loading class to prevent scroll conflicts
    document.documentElement.classList.add('page-loading');
    
    // Prevent all scroll events during loading
    const preventScroll = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    // Add event listeners to prevent scrolling
    window.addEventListener('scroll', preventScroll, { passive: false });
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    
    // Force immediate scroll to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior
    });
    
    // Remove loading class and event listeners after scroll is complete
    const timeout = setTimeout(() => {
      window.removeEventListener('scroll', preventScroll);
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
      document.documentElement.classList.remove('page-loading');
    }, 200);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', preventScroll);
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
      document.documentElement.classList.remove('page-loading');
    };
  }, []);

  // Reset all state when product ID changes (navigating between products)
  useEffect(() => {
    // Reset quantity
    setQuantity(1);
    setGlobalQuantity(1);
    
    // Reset error
    setError('');
    hideError();
    
    // Reset selected color only when product changes
    if (product && product.colors && product.colors.length > 0) {
      const defaultColor = product.colors[0];
      setSelectedColor(defaultColor);
      setGlobalColor(defaultColor);
    } else {
      setSelectedColor('');
      setGlobalColor('');
    }
    
    // Reset selected size for DreamCurl Short Set
    if (product && product.id === 'dreamcurl-short-set') {
      setSelectedSize('Original'); // Default size
    } else {
      setSelectedSize('');
    }
    
    // Update global product state
    if (product) {
      setCurrentProduct(product);
      selectProduct(product);
    }
    
    // Add loading class and scroll to top when product changes
    document.documentElement.classList.add('page-loading');
    
    window.scrollTo({ 
      top: 0, 
      left: 0,
      behavior: 'instant' as ScrollBehavior 
    });
    
    // Remove loading class after scroll is complete
    setTimeout(() => {
      document.documentElement.classList.remove('page-loading');
    }, 100);
  }, [product?.id]); // Only depend on product.id to prevent unnecessary resets

  // Aggressive image preloading for instant display
  useEffect(() => {
    if (!product) return;

    const highPriorityImages: string[] = [];
    const lowPriorityImages: string[] = [];

    // High priority: Main image and first 2 images
    if (product.image) {
      highPriorityImages.push(product.image);
    }

    if (product.images && product.images.length > 0) {
      // First 2 images are high priority (visible immediately)
      highPriorityImages.push(...product.images.slice(0, 2));
      // Rest are low priority (preload in background)
      lowPriorityImages.push(...product.images.slice(2));
    }

    // Preload with priority
    preloadImagesWithPriority(highPriorityImages, lowPriorityImages);

    // Video preloading is handled by the RitualInMotionSection component
    // Removed separate video preload to prevent errors
  }, [product]);

  // Track product view when product loads
  useEffect(() => {
    if (product && typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('ProductViewed', {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        category: product.category,
        page: 'ProductDetail'
      });
    }
  }, [product]);

  // Handle add to cart with real-time updates
  const handleAddToCart = () => {
    if (!product) return;

    // For products with colors, require color selection
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      const errorMsg = 'Please select a color';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    // For DreamCurl Short Set, require size selection
    if (product.id === 'dreamcurl-short-set' && !selectedSize) {
      const errorMsg = 'Please select a size';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    // For BUN BONS - Heatless Curling System, require size selection (excluding sold out Original)
    if (product.id === 'heatless-5' && (!selectedSize || selectedSize === 'Original')) {
      const errorMsg = selectedSize === 'Original' ? 'Original size is currently sold out. Please select another size.' : 'Please select a size';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    // For Hair Clip product, require size selection
    if (product.id === 'curly-clip-1' && !selectedSize) {
      const errorMsg = 'Please select a set size';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    // Clear any previous errors
    setError('');
    hideError();

    // Validate required selections
    if (product.id === 'curly-clip-1' && !selectedSize) {
      setError("Please select a size option");
      showError("Please select a size option");
      return;
    }

    // Prepare the product for cart
    let finalPrice = product.price;
    let finalImage = product.image;
    let finalName = product.name;
    
    // Handle size options for hair clip product
    if (product.id === 'curly-clip-1' && selectedSize && product.sizeOptions && product.sizeOptions[selectedSize]) {
      const sizeOption = product.sizeOptions[selectedSize];
      finalPrice = sizeOption.price;
      finalImage = sizeOption.image;
      finalName = `${product.name} - ${selectedSize.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
    }
    
    // Add size to product name for DreamCurl Short Set and BUN BONS
    if ((product.id === 'dreamcurl-short-set' || product.id === 'heatless-5') && selectedSize) {
      finalName = `${product.name} - ${selectedSize} Size`;
    }
    
    // Use color-specific image if a color is selected
    let cartColor = selectedColor; // Default to the selected color
    if (selectedColor) {
      const colorImageMap: Record<string, Record<string, string>> = {
        'dreamcurl-short-set': {
          'Rose Gold': new URL('../assets/Heatless Hair Curling Rod/product-1.webp', import.meta.url).href,
          'Royal Purple': new URL('../assets/Heatless Hair Curling Rod/product-2.webp', import.meta.url).href,
          'Olive Lux': new URL('../assets/Heatless Hair Curling Rod/product-3.webp', import.meta.url).href,
          'Earl Grey': new URL('../assets/Heatless Hair Curling Rod/product-4.webp', import.meta.url).href
        },
        'dreamcurl-midi': {
          'CANDY': new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_candy.webp', import.meta.url).href,
          'LATTE': new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_latte.webp', import.meta.url).href,
          'MULBERRY': new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_purple.webp', import.meta.url).href,
          'OLIVE': new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_olive.webp', import.meta.url).href
        },
        'dreamcurl-jumbo': {
          'LATTE': new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/latte_jumbo.webp', import.meta.url).href,
          'CANDY': new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/candy_jumbo.webp', import.meta.url).href,
          'OLIVE': new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/olive_jumbo.webp4.webp', import.meta.url).href,
          'MULBERRY': new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/purple_jumbo.webp', import.meta.url).href
        },
        'dreamcurl-original': {
          'Mulberry': new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/CFE0DE6D-F7E6-42F3-91A4-16C049F5ADA9.webp', import.meta.url).href,
          'Candy': new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_3b575993-8e6a-413e-9f88-d95395c19980.webp', import.meta.url).href,
          'Latte': new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_686ff861-b01d-41ef-9c4c-0684df944cd6.webp', import.meta.url).href,
          'Olive': new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_bf658774-aed4-4c4a-be42-ef9707a47f3e.webp', import.meta.url).href
        },
        'songmay-hair-clips': {
          'Gold': new URL('../assets/curly hair collection/product4/gold2.jpg', import.meta.url).href,
          'Print': new URL('../assets/curly hair collection/product4/print.jpg', import.meta.url).href
        },
        'heatless-5': {
          'MULBERRY': new URL('../assets/Heatless Hair Curling Rod/product5/pppp4.webp', import.meta.url).href,
          'CANDY': new URL('../assets/Heatless Hair Curling Rod/product5/pppp2.webp', import.meta.url).href,
          'LATTE': new URL('../assets/Heatless Hair Curling Rod/product5/pppp1.webp', import.meta.url).href,
          'OLIVE': new URL('../assets/Heatless Hair Curling Rod/product5/pppp3.webp', import.meta.url).href,
          'BUTTERMILK': new URL('../assets/Heatless Hair Curling Rod/product5/pppp5.webp', import.meta.url).href
        }
      };

      const productColorMap = colorImageMap[product.id];
      if (productColorMap && productColorMap[selectedColor]) {
        finalImage = productColorMap[selectedColor];
      }

      // SongMay special handling
      if (product.id === 'songmay-hair-clips') {
        finalName = `${product.name} - ${selectedColor}`;
        cartColor = 'Gold & Print';
      }
    }
    
    // Get the size description for cart display
    const getSizeDescription = () => {
      if (product.id === 'curly-clip-1' && selectedSize) {
        switch (selectedSize) {
          case '9-piece-complete': return '9-Piece Complete Set';
          case '4-piece-type1': return '4-Piece Type 1 Set';
          case '4-piece-type2': return '4-Piece Type 2 Set';
          case '4-piece-type3': return '4-Piece Type 3 Set';
          default: return selectedSize.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
      }
      // For DreamCurl Short Set and BUN BONS, show the selected size
      if ((product.id === 'dreamcurl-short-set' || product.id === 'heatless-5') && selectedSize) {
        return selectedSize;
      }
      // For SongMay clips, ensure "Set of 2 Clips" is shown in cart
      if (product.id === 'songmay-hair-clips') {
        return 'Set of 2 Clips';
      }
      return product.size || 'Standard';
    };

    const productToAdd = {
      id: product.id,
      name: finalName,
      price: finalPrice,
      image: finalImage,
      selectedColor: cartColor || undefined,
      selectedSize: selectedSize || undefined,
      size: getSizeDescription(),
      category: product.category,
      hairType: product.hairType,
    };

    // Calculate current cart total
    const currentCartTotal = cartState.items.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      return total + (price * item.quantity);
    }, 0);
    
    // Add multiple quantities to cart
    for (let i = 0; i < quantity; i++) {
      addToCart(productToAdd);
    }
    
    // Emit real-time events for instant updates
    selectQuantity(quantity);
    if (selectedColor) {
      selectColor(selectedColor);
    }

    // Track add to cart event
    if (typeof window !== 'undefined' && (window as any).analytics) {
      const priceNumber = parseFloat(finalPrice.replace('', ''));
      const newCartTotal = currentCartTotal + (priceNumber * quantity);
      
      (window as any).analytics.trackCart('add', {
        product_id: product.id,
        title: finalName,
        price: priceNumber,
        quantity: quantity,
        variant_id: selectedSize || selectedColor || undefined,
        variant_title: selectedSize || selectedColor || undefined,
        total_value: priceNumber * quantity,
        cart_total: newCartTotal,
      });
    }
    
    // Show toast notification
    toast('Added to Cart', {
      description: `${quantity} ${quantity === 1 ? 'item' : 'items'} added to your cart`,
      duration: 4000,
      icon: '???',
      style: {
        backgroundColor: '#000',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        fontSize: '14px',
        padding: '16px',
      },
    });
    
    // Open cart drawer
    openCart();
    // Ensure cart drawer/panel always opens scrolled to top
    const forceCartTop = () => {
      // Also move the page scroll to top so the cart viewport starts at top
      try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch {}
      const selectors = [
        '.cart-drawer', '.cart-panel', '[data-cart-panel]', '#cart',
        '.shopping-cart', '.drawer-content', '[role="dialog"]',
        '[data-state="open"] .overflow-y-auto', '.overflow-y-auto'
      ];
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((node) => {
          (node as HTMLElement).scrollTop = 0;
        });
      });
    };
    // Run across a few frames to catch mount/animation timing
    setTimeout(forceCartTop, 0);
    requestAnimationFrame(forceCartTop);
    setTimeout(forceCartTop, 150);
  };

  // Shuffle array helper function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get related products - always show exactly 3 products with smart cross-collection recommendations
  const getRelatedProducts = () => {
    // Get all available products from different collections
      const heatlessProducts = getHeatlessCurlingRodProducts().filter(p => p.id !== product.id);
    const curlyProducts = getCurlyHairCollectionProducts().filter(p => p.id !== product.id);
    const regularProducts = products.filter(p => 
      p.id !== product.id && 
      !p.id.startsWith('heatless-') && 
      !p.id.startsWith('dreamcurl-') && 
      !p.id.startsWith('curly-')
    );

    // Shuffle each collection
    const shuffledHeatless = shuffleArray(heatlessProducts);
    const shuffledCurly = shuffleArray(curlyProducts);
    const shuffledRegular = shuffleArray(regularProducts);

    // Build recommendations based on current product type
    let recommendations: Product[] = [];

    if (product.id.startsWith('heatless-') || product.id.startsWith('dreamcurl-')) {
      // For heatless/dreamcurl products: show 2 heatless + 1 curly
      // Add first 2 heatless products (excluding current)
      if (shuffledHeatless.length > 0) recommendations.push(shuffledHeatless[0]);
      if (shuffledHeatless.length > 1) recommendations.push(shuffledHeatless[1]);
      // Add 1 curly product
      if (shuffledCurly.length > 0) recommendations.push(shuffledCurly[0]);
    } else if (product.id.startsWith('curly-')) {
      // For curly products: show 2 heatless + 1 curly (excluding current)
      // Add 2 heatless products
      if (shuffledHeatless.length > 0) recommendations.push(shuffledHeatless[0]);
      if (shuffledHeatless.length > 1) recommendations.push(shuffledHeatless[1]);
      // Add 1 curly product (different from current)
      if (shuffledCurly.length > 0) recommendations.push(shuffledCurly[0]);
    } else {
      // For regular products: mix from all categories
      if (shuffledRegular.length > 0) recommendations.push(shuffledRegular[0]);
      if (shuffledHeatless.length > 0) recommendations.push(shuffledHeatless[0]);
      if (shuffledCurly.length > 0) recommendations.push(shuffledCurly[0]);
    }

    // Ensure we always have exactly 3 recommendations and no duplicates
    // If we don't have enough from the preferred mix, fill from all available
    if (recommendations.length < 3) {
      const allOtherProducts = shuffleArray([
        ...heatlessProducts,
        ...curlyProducts,
        ...regularProducts
      ].filter(p => !recommendations.find(r => r.id === p.id)));
      
      while (recommendations.length < 3 && allOtherProducts.length > 0) {
        recommendations.push(allOtherProducts.shift()!);
      }
    }

    // Final check: ensure no duplicates and return exactly 3 unique products
    const uniqueRecommendations = recommendations.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    );

    // If we still don't have 3 unique products, fill with any remaining products
    if (uniqueRecommendations.length < 3) {
      const allProducts = [...heatlessProducts, ...curlyProducts, ...regularProducts];
      const remainingProducts = allProducts.filter(p => 
        !uniqueRecommendations.find(r => r.id === p.id)
      );
      
      while (uniqueRecommendations.length < 3 && remainingProducts.length > 0) {
        uniqueRecommendations.push(remainingProducts.shift()!);
      }
    }

    // Return exactly 3 unique recommendations without shuffling to maintain the order
    return uniqueRecommendations.slice(0, 3);
  };

  const relatedProducts = getRelatedProducts();


  const handleQuickAdd = (relatedProduct: Product) => {
    try {
      setError('');
      addToCart(relatedProduct);
      openCart();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add to cart');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Background Effect - Matching Product Photo Style */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        {/* Floating geometric shapes for depth */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large floating circles */}
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-3/4 -right-32 w-80 h-80 bg-gradient-to-br from-accent/5 to-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-muted/10 to-background/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Subtle grid pattern for texture */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Ambient lighting effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/3 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-accent/3 to-transparent rounded-full blur-2xl" />
      </div>
      
      <Navbar />
      <div className="pt-24 pb-16 relative z-10" style={{ scrollBehavior: 'smooth' }}>
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <motion.button
          onClick={() => {
            // Prefer native history for an instantaneous back with no re-render
            if (document.referrer && window.history.length > 1) {
              window.history.back();
              return;
            }
            // Fallbacks
            if (referrerPath) {
              navigate(referrerPath, { replace: true });
              return;
            }
            navigate('/', { replace: true });
          }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors relative z-[40] px-4 py-2 -ml-4"
          whileHover={{ x: -5 }}
          style={{
            position: 'relative',
            left: 0,
            marginTop: '1rem',
            minHeight: '44px',
            minWidth: '100px',
            touchAction: 'manipulation'
          }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="select-none">Back</span>
        </motion.button>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-6" key={product.id}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          {/* Left: Product Info */}
          <motion.div
            key={`product-info-${product.id}`}
            className="order-2 md:order-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.h1
              key={`product-name-${product.id}`}
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {product.name}
            </motion.h1>

            <motion.p
              key={`product-price-${product.id}`}
              className="text-3xl text-muted-foreground font-light mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {product.id === 'curly-clip-1' && selectedSize && product.sizeOptions && product.sizeOptions[selectedSize] 
                ? product.sizeOptions[selectedSize].price 
                : product.price}
            </motion.p>

            {/* Pre-Order Notice for CURLEA Comb and SongMay Hair Clips */}
            {(product.id === 'curlea-comb' || product.id === 'songmay-hair-clips') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mb-6 sm:mb-8 p-3 sm:p-4 md:p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-400/30 rounded-lg sm:rounded-xl shadow-lg relative overflow-hidden"
              >
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
                  }} />
                </div>
                
                <div className="relative z-10">
                  {/* Icon and Title */}
                  <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-amber-500 rounded-full flex items-center justify-center"
                      >
                        <span className="text-white text-sm sm:text-base md:text-lg font-bold"></span>
                      </motion.div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-amber-900 mb-1 sm:mb-2 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                        <span className="px-1.5 sm:px-2 py-0.5 bg-amber-500 text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-wider rounded inline-block">
                          PRE-ORDER
                        </span>
                        <span className="text-xs sm:text-sm md:text-base">Available Now for Pre-Order</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-amber-800 font-semibold leading-relaxed">
                        Estimated delivery time: <span className="text-amber-900 font-extrabold text-sm sm:text-base md:text-lg">28 days</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-amber-300/50">
                    <p className="text-[10px] sm:text-xs text-amber-700 leading-relaxed">
                      This item is currently available for pre-order. Your order will be processed and shipped within approximately 28 days from the date of purchase. You will receive shipping confirmation once your order is ready.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 lg:mb-12">
              {product.description.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 sm:gap-3"
                >
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-accent mt-1.5 sm:mt-2 flex-shrink-0" />
                  <p className={`text-sm sm:text-base lg:text-lg leading-relaxed ${item.includes('Sold as complete set') ? 'font-bold text-foreground' : 'text-black'}`}>
                    {item.includes('**') ? (
                      <>
                        {item.split('**').map((part, partIndex) => 
                          partIndex % 2 === 1 ? (
                            <strong key={partIndex} className="font-bold text-foreground">{part}</strong>
                          ) : (
                            <span key={partIndex}>{part}</span>
                          )
                        )}
                      </>
                    ) : (
                      item
                    )}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Enhanced Quantity Selector with Bundle Discount */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Quantity:</span>
                {quantity >= 2 && product.id === 'curlea-comb' && (
                  <motion.span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-600 dark:text-green-400 text-xs font-semibold border border-green-500/20"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Save 10% - Buy 2 or more!
                  </motion.span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </motion.button>
                <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
                
                {/* Quick quantity buttons for bundles */}
                {product.id === 'curlea-comb' && (
                  <div className="flex items-center gap-2 ml-4 border-l border-border pl-4">
                    <button
                      onClick={() => setQuantity(2)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        quantity === 2 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      Buy 2
                    </button>
                    <button
                      onClick={() => setQuantity(3)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        quantity === 3 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      Buy 3
                    </button>
                  </div>
                )}
              </div>
              
              {/* Price Breakdown */}
              {quantity >= 2 && product.id === 'curlea-comb' && (
                <motion.div
                  className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Regular price:</span>
                    <span className="line-through text-muted-foreground">{(12.99 * quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                    <span>Bundle price:</span>
                    <span>{(12.99 * quantity * 0.9).toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                    You save {(12.99 * quantity * 0.1).toFixed(2)}!
                  </div>
                </motion.div>
              )}
              
              {/* Pieces Total Display - hide for curly-clip-5 and curly-clip-6 */}
              {product.id.startsWith('curly-') && product.id !== 'curly-clip-5' && product.id !== 'curly-clip-6' && product.id !== 'curlea-comb' && (
                <motion.div
                  className="mt-3 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full inline-block"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-sm font-medium text-primary">
                    {(() => {
                      if (product.id === 'curly-clip-1') {
                        // Get piece count from selected size
                        const pieceCount = selectedSize && product.sizeOptions && product.sizeOptions[selectedSize] 
                          ? (selectedSize.toLowerCase().includes('9-piece') ? 9 : 4)
                          : 9;
                        return pieceCount * quantity;
                      }
                      return product.id === 'curly-scarf-1' ? 7 * quantity : 16 * quantity;
                    })()} pieces in total
                  </span>
                </motion.div>
              )}
            </div>

    {/* Enhanced Color Selection for BUN BONS */}
    {product.id === 'heatless-5' && product.colors && product.colors.length > 0 && (
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">COLOUR</span>
          {selectedColor && (
            <span className="ml-2 text-sm text-primary font-medium">
              Selected: {selectedColor}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {product.colors.map((color, index) => (
            <motion.button
              key={color}
              onClick={() => {
                setSelectedColor(color);
                setGlobalColor(color);
                selectColor(color);
              }}
              className={`relative px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 border-2 ${
                selectedColor === color
                  ? 'bg-gray-800 text-white border-gray-800 shadow-lg'
                  : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400 hover:shadow-md'
              }`}
              whileHover={{ 
                scale: 1.02,
                y: -1,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.1 }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              {color}
              {/* Selected indicator */}
              {selectedColor === color && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    )}

    {/* Enhanced Color Selection for DreamCurl Short Set */}
    {product.id === 'dreamcurl-short-set' && product.colors && product.colors.length > 0 && (
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">COLOUR</span>
          {selectedColor && (
            <span className="ml-2 text-sm text-primary font-medium">
              Selected: {selectedColor}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {product.colors.map((color, index) => (
            <motion.button
              key={color}
              onClick={() => {
                setSelectedColor(color);
                setGlobalColor(color);
                selectColor(color);
              }}
              className={`relative px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 border-2 ${
                selectedColor === color
                  ? 'bg-gray-800 text-white border-gray-800 shadow-lg'
                  : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400 hover:shadow-md'
              }`}
              whileHover={{ 
                scale: 1.02,
                y: -1,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.1 }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              {color}
              {/* Selected indicator */}
              {selectedColor === color && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    )}

    {/* Size Selection for Curved Resin Hair Clip */}
    {product.id === 'curly-clip-1' && product.sizeOptions && (
      <motion.div 
        className="mb-8 p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-4 lg:mb-5">
          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 tracking-tight" style={{ fontFamily: 'Georgia, Cambria, Times New Roman, Times, serif' }}>Choose Your Set</h3>
          <p className="text-xs sm:text-sm text-gray-600">Select the perfect set size for your styling needs</p>
        </div>
        
        <div
          className="flex flex-col gap-3 lg:gap-4"
          role="radiogroup"
          aria-label="Choose Hair Clip Set Size"
        >
          {Object.entries(product.sizeOptions).map(([sizeKey, sizeOption], index) => (
            <motion.button
              key={sizeKey}
              onClick={() => setSelectedSize(sizeKey)}
              className={`group relative w-full text-left rounded-xl border p-4 sm:p-5 lg:p-6 transition-all duration-200 ${
                selectedSize === sizeKey
                  ? 'border-gray-900 bg-gray-900/5 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-md'
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * index }}
              role="radio"
              aria-checked={selectedSize === sizeKey}
            >
              <div className="flex items-center gap-4 sm:gap-5 lg:gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 rounded-lg overflow-hidden bg-gray-50 ring-1 ring-gray-100 flex-shrink-0">
                  <img
                    src={sizeOption.image}
                    alt={`${product.name} - ${sizeKey}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-2">
                      <h4 className="text-base sm:text-lg lg:text-xl font-semibold tracking-wide uppercase text-gray-900 leading-snug" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
                        {sizeKey.replace(/-/g, ' ')}
                      </h4>
                      <span className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 whitespace-nowrap">
                        {sizeOption.price}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                      {sizeOption.description[0]}
                    </p>
                  </div>
                  {selectedSize === sizeKey ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 text-white px-3 py-1.5 text-xs sm:text-sm font-semibold whitespace-nowrap">
                      Selected
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-3 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap">
                      Tap to select
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    )}

    {/* Enhanced Size Selection for DreamCurl Short Set */}
    {product.id === 'dreamcurl-short-set' && (
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">SIZE</span>
          {selectedSize && (
            <span className="ml-2 text-sm text-primary font-medium">
              Selected: {selectedSize}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['Mini', 'Midi', 'Original', 'Jumbo'].map((size, index) => (
            <motion.button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`relative px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 border-2 ${
                selectedSize === size
                  ? 'bg-gray-800 text-white border-gray-800 shadow-lg'
                  : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400 hover:shadow-md'
              }`}
              whileHover={{ 
                scale: 1.02,
                y: -1,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.1 }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              {size}
              {/* Selected indicator */}
              {selectedSize === size && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    )}

    {/* Enhanced Size Selection for BUN BONS - Heatless Curling System */}
    {product.id === 'heatless-5' && (
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">SIZE</span>
          {selectedSize && (
            <span className="ml-2 text-sm text-primary font-medium">
              Selected: {selectedSize}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['Mini', 'Midi', 'Original', 'Jumbo'].map((size, index) => {
            const isSoldOut = size === 'Original';
            const isSelected = selectedSize === size;
            
            return (
              <motion.button
                key={size}
                onClick={() => !isSoldOut && setSelectedSize(size)}
                disabled={isSoldOut}
                className={`relative px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 border-2 ${
                  isSoldOut
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                    : isSelected
                    ? 'bg-gray-800 text-white border-gray-800 shadow-lg'
                    : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400 hover:shadow-md'
                }`}
                whileHover={!isSoldOut ? { 
                  scale: 1.02,
                  y: -1,
                  transition: { duration: 0.2 }
                } : {}}
                whileTap={!isSoldOut ? { 
                  scale: 0.98,
                  transition: { duration: 0.1 }
                } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                {size}
                {/* Sold Out Badge */}
                {isSoldOut && (
                  <motion.span
                    className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-red-500 text-white rounded-full shadow-md"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                  >
                    SOLD OUT
                  </motion.span>
                )}
                {/* Selected indicator */}
                {isSelected && !isSoldOut && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                )}
                {/* Sold out overlay effect */}
                {isSoldOut && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-300/20 to-gray-400/20 rounded pointer-events-none" />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    )}

    {/* Enhanced Color Selection for DreamCurl Midi */}
    {product.id === 'dreamcurl-midi' && product.colors && product.colors.length > 0 && (
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">COLOUR</span>
          {selectedColor && (
            <span className="ml-2 text-sm text-primary font-medium">
              Selected: {selectedColor}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {product.colors.map((color, index) => (
            <motion.button
              key={color}
              onClick={() => {
                setSelectedColor(color);
                setGlobalColor(color);
                selectColor(color);
              }}
              className={`relative px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 border-2 ${
                selectedColor === color
                  ? 'bg-gray-800 text-white border-gray-800 shadow-lg'
                  : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400 hover:shadow-md'
              }`}
              whileHover={{ 
                scale: 1.02,
                y: -1,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.1 }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              {color}
              {/* Selected indicator */}
              {selectedColor === color && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    )}

    {/* Enhanced Color Selection for Bonnet */}
    {product.id === 'heatless-6' && product.colors && product.colors.length > 0 && (
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">COLOUR</span>
          {selectedColor && (
            <span className="ml-2 text-sm text-primary font-medium">
              Selected: {selectedColor}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {product.colors.map((color, index) => (
            <motion.button
              key={color}
              onClick={() => {
                setSelectedColor(color);
                setGlobalColor(color);
                selectColor(color);
              }}
              className={`relative px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 border-2 ${
                selectedColor === color
                  ? 'bg-gray-800 text-white border-gray-800 shadow-lg'
                  : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400 hover:shadow-md'
              }`}
              whileHover={{ 
                scale: 1.02,
                y: -1,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.1 }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              {color}
              {/* Selected indicator */}
              {selectedColor === color && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    )}

    {/* Enhanced Color Selection for DreamCurl JUMBO */}
    {product.id === 'dreamcurl-jumbo' && product.colors && product.colors.length > 0 && (
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">COLOUR</span>
          {selectedColor && (
            <span className="ml-2 text-sm text-primary font-medium">
              Selected: {selectedColor}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {product.colors.map((color, index) => (
            <motion.button
              key={color}
              onClick={() => {
                setSelectedColor(color);
                setGlobalColor(color);
                selectColor(color);
              }}
              className={`relative px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 border-2 ${
                selectedColor === color
                  ? 'bg-gray-800 text-white border-gray-800 shadow-lg'
                  : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400 hover:shadow-md'
              }`}
              whileHover={{ 
                scale: 1.02,
                y: -1,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.1 }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              {color}
              {/* Selected indicator */}
              {selectedColor === color && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    )}

    {/* Enhanced Color Selection for Zero Heat Mini */}
    {product.id === 'zero-heat-mini' && product.colors && product.colors.length > 0 && (
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">COLOUR</span>
          {selectedColor && (
            <span className="ml-2 text-sm text-primary font-medium">
              Selected: {selectedColor}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {product.colors.map((color, index) => (
            <motion.button
              key={color}
              onClick={() => {
                setSelectedColor(color);
                setGlobalColor(color);
                selectColor(color);
              }}
              className={`relative px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 border-2 ${
                selectedColor === color
                  ? 'bg-gray-800 text-white border-gray-800 shadow-lg'
                  : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400 hover:shadow-md'
              }`}
              whileHover={{ 
                scale: 1.02,
                y: -1,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.1 }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              {color}
              {/* Selected indicator */}
              {selectedColor === color && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    )}

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Pre-Order Notice - Second Location (Right Above Add to Cart Button) */}
            {(product.id === 'curlea-comb' || product.id === 'songmay-hair-clips') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 border-2 border-amber-500/40 rounded-lg shadow-md relative"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm font-bold"></span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-amber-900 leading-tight">
                      <span className="uppercase tracking-wide">PRE-ORDER:</span> <span className="whitespace-nowrap sm:whitespace-normal">Estimated delivery time is <span className="font-extrabold">28 days</span></span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Add to Cart Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              initial="rest"
              animate="rest"
              whileHover="hover"
              onClick={handleAddToCart}
              className="group relative w-full md:w-auto px-16 py-4 rounded-full font-semibold tracking-wide overflow-hidden focus:outline-none"
            >
              {/* Base layer (black to subtle white tint) */}
              <motion.span
                className="absolute inset-0 rounded-full bg-black"
                variants={{
                  rest: { backgroundColor: "#000000" },
                  hover: { backgroundColor: "#ffffff" },
                }}
                transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              />
              {/* Left-to-right liquid sweep overlay */}
              <motion.span
                className="absolute left-0 top-0 h-full rounded-full bg-white/95 backdrop-blur-[1px]"
                style={{ width: '0%', filter: 'drop-shadow(0 6px 14px rgba(255,255,255,0.35))' }}
                variants={{
                  rest: { width: '0%' },
                  hover: { width: '105%' },
                }}
                transition={{ duration: 1.25, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Radial reveal pulse for unique hover */}
              <motion.span
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white pointer-events-none"
                style={{ width: 0, height: 0, filter: 'blur(2px)' }}
                variants={{
                  rest: { opacity: 0, scale: 0 },
                  hover: { opacity: 1, scale: 2.2 },
                }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Soft outer glow on hover */}
              <motion.span
                className="absolute -inset-2 rounded-full bg-white/30 blur-xl pointer-events-none"
                variants={{ rest: { opacity: 0 }, hover: { opacity: 0.6 } }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
              {/* Text color invert */}
              <motion.span
                className="relative z-10"
                variants={{ rest: { color: '#ffffff' }, hover: { color: '#000000' } }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                Add to Cart
              </motion.span>
            </motion.button>

            {/* (Removed duplicate color section under Add to Cart) */}

            {/* Color Selection for curly-clip-5 - Right after Add to Cart */}
            {product.id === 'curly-clip-5' && product.colors && product.colors.length > 0 && (
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">COLOUR</span>
                  {selectedColor && (
                    <span className="ml-2 text-sm text-primary font-medium">
                      Selected: {selectedColor.replace(/&/g, ' & ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, index) => (
                    <motion.button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setGlobalColor(color);
                        selectColor(color);
                      }}
                      className={`relative px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 border-2 ${
                        selectedColor === color
                          ? 'bg-gray-800 text-white border-gray-800 shadow-lg'
                          : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400 hover:shadow-md'
                      }`}
                      whileHover={{ 
                        scale: 1.02,
                        y: -1,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ 
                        scale: 0.98,
                        transition: { duration: 0.1 }
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      {color.replace(/&/g, ' & ').replace(/\b\w/g, l => l.toUpperCase())}
                      {/* Selected indicator */}
                      {selectedColor === color && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Enhanced Color Selection for DreamCurl - Placed after Add to Cart */}
            {product.id === 'dreamcurl-original' && product.colors && product.colors.length > 0 && (
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="mb-4">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Available Colors</span>
                  {selectedColor && (
                    <span className="ml-2 text-sm text-primary font-medium">
                      Selected: {selectedColor}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {product.colors.map((color, index) => (
                    <motion.button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setGlobalColor(color);
                        selectColor(color);
                      }}
                      className={`relative px-4 py-2 text-xs sm:text-sm font-medium uppercase tracking-wide transition-all duration-300 rounded-full touch-manipulation border-2 ${
                        selectedColor === color
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                          : 'bg-muted text-foreground hover:bg-muted/80 active:bg-muted/60 border-muted hover:border-primary/50'
                      }`}
                      whileHover={{ 
                        scale: 1.05,
                        y: -2,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ 
                        scale: 0.95,
                        transition: { duration: 0.1 }
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      {color}
                      {/* Selected indicator */}
                      {selectedColor === color && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
                
              </motion.div>
            )}

            {/* Color Selection for SongMay - Right after Add to Cart */}
            {product.id === 'songmay-hair-clips' && product.colors && product.colors.length > 0 && (
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">COLOUR</span>
                  {selectedColor && (
                    <span className="ml-2 text-sm text-primary font-medium">
                      Selected: {selectedColor}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, index) => (
                    <motion.button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setGlobalColor(color);
                        selectColor(color);
                      }}
                      className={`relative px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all duration-300 border-2 ${
                        selectedColor === color
                          ? 'bg-gray-800 text-white border-gray-800 shadow-lg'
                          : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400 hover:shadow-md'
                      }`}
                      whileHover={{ scale: 1.02, y: -1, transition: { duration: 0.2 } }}
                      whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      {color}
                      {selectedColor === color && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right: Product Image Gallery */}
          <motion.div
            key={`product-image-${product.id}`}
            className="order-1 md:order-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {product.id === 'curly-clip-5' ? (
              <CurlyClip5ImageGallery 
                key={`curly-clip-5-gallery-${product.id}`} 
                product={product}
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
              />
            ) : product.id.startsWith('curly-') ? (
              <CurlyHairCollectionImageGallery key={`curly-gallery-${product.id}`} product={product} />
            ) : product.id === 'dreamcurl-original' ? (
              <DreamCurlImageGallery 
                key={`dreamcurl-gallery-${product.id}`}
                product={product} 
                selectedColor={selectedColor} 
                onColorSelect={setSelectedColor}
              />
            ) : product.id === 'dreamcurl-short-set' ? (
              <ShortSetImageGallery 
                key={`shortset-gallery-${product.id}`}
                product={product} 
                selectedColor={selectedColor} 
                onColorSelect={setSelectedColor}
              />
            ) : product.id === 'dreamcurl-midi' ? (
              <MidiImageGallery 
                key={`midi-gallery-${product.id}`}
                product={product} 
                selectedColor={selectedColor} 
                onColorSelect={setSelectedColor}
              />
            ) : product.id === 'dreamcurl-jumbo' ? (
              <JumboImageGallery 
                key={`jumbo-gallery-${product.id}`}
                product={product} 
                selectedColor={selectedColor} 
                onColorSelect={setSelectedColor}
              />
            ) : product.id === 'heatless-5' ? (
              <BunBonsImageGallery 
                key={`bunbons-gallery-${product.id}`}
                product={product} 
                selectedColor={selectedColor} 
                onColorSelect={setSelectedColor}
              />
            ) : product.id === 'zero-heat-mini' ? (
              <ZeroHeatMiniImageGallery
                key={`zeroheatmini-gallery-${product.id}`}
                product={product}
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
              />
            ) : product.id === 'heatless-6' ? (
              <BonnetImageGallery 
                key={`bonnet-gallery-${product.id}`}
                product={product} 
                selectedColor={selectedColor} 
                onColorSelect={setSelectedColor}
              />
            ) : product.id === 'curly-clip-1' || product.id === 'curly-clip-6' || product.id === 'satin-scrunchies-french-5pc' ? (
              <CurlyHairCollectionImageGallery 
                key={`hairclip-gallery-${product.id}`}
                product={product}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
              />
            ) : product.id === 'songmay-hair-clips' ? (
              <SongMayImageGallery 
                key={`songmay-gallery-${product.id}`}
                product={product} 
                selectedColor={selectedColor} 
                onColorSelect={setSelectedColor}
              />
            ) : (
            <motion.div
              key={`product-img-${product.id}`}
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Cleaner container for products without custom galleries */}
              <div className="relative rounded-3xl">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  className={`w-full ${product.id === 'curlea-comb' ? 'h-[520px]' : 'h-auto'} object-contain rounded-2xl`}
                  priority={true}
                  productId={product.id}
                />
              </div>
            </motion.div>
            )}
          </motion.div>
        </div>

        {/* 1. The "Media Showcase" Section - Elegant 3-column layout */}
        {product.id !== 'curly-claw-1' && product.id !== 'songmay-hair-clips' && (
          <MediaShowcaseSection key={`media-${product.id}`} product={product} />
        )}

        {/* Usage Steps Section - for all products with usageSteps */}
        {product.usageSteps && (
          <UsageStepsSection key={`usage-${product.id}`} product={product} />
        )}

        {/* 3. The "Science & Soul" Ingredient Spotlight - Only for specific products */}
        {!product.id.startsWith('heatless-') && !product.id.startsWith('dreamcurl-') && !product.id.startsWith('curly-') && product.id !== 'curlea-comb' && product.id !== 'songmay-hair-clips' && product.id !== 'zero-heat-mini' && product.id !== 'satin-scrunchies-french-5pc' && (
          <ScienceAndSoulSection key={`science-${product.id}`} product={product} />
        )}

        {/* 5. Frequently Bought Together (LIMITED TIME OFFER | STARTER KIT) - All Pages */}
        <FrequentlyBoughtTogetherSection key={`fbt-${product.id}`} product={product} />


        {/* Size Guide Section - Only for DreamCurl Short Set */}
        {product.id === 'dreamcurl-short-set' && (
          <motion.section
            className="py-24 px-6 bg-gradient-to-b from-muted/20 to-background"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Choose Your Perfect Size
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Find the ideal DreamCurl size for your hair length and desired curl style
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Short Set */}
                <motion.div
                  className="relative p-8 bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl border-2 border-primary shadow-lg overflow-hidden group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                    YOU'RE HERE
                  </div>
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">S</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Short Set</h3>
                    <p className="text-sm text-muted-foreground">Compact & Versatile</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-sm mb-2">? Best For:</p>
                      <p className="text-sm text-muted-foreground">Short to medium hair (shoulder length and above)</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-2">? Curl Type:</p>
                      <p className="text-sm text-muted-foreground">Tighter, bouncier curls with more definition</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-2">? Ideal Time:</p>
                      <p className="text-sm text-muted-foreground">4-6 hours or overnight</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-2">? Perfect If You:</p>
                      <p className="text-sm text-muted-foreground">Want long-lasting, defined curls with maximum hold</p>
                    </div>
                  </div>
                </motion.div>

                {/* Original/Midi Set */}
                <motion.div
                  className="relative p-8 bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">M</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Midi Set</h3>
                    <p className="text-sm text-muted-foreground">Balanced & Popular</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-sm mb-2">? Best For:</p>
                      <p className="text-sm text-muted-foreground">Medium to long hair (shoulder to mid-back)</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-2">? Curl Type:</p>
                      <p className="text-sm text-muted-foreground">Medium curls with beautiful bounce and volume</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-2">? Ideal Time:</p>
                      <p className="text-sm text-muted-foreground">6-8 hours for best results</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-2">? Perfect If You:</p>
                      <p className="text-sm text-muted-foreground">Want versatile curls that last all day</p>
                    </div>
                  </div>
                </motion.div>

                {/* Original Set */}
                <motion.div
                  className="relative p-8 bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">O</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Original Set</h3>
                    <p className="text-sm text-muted-foreground">Soft & Voluminous</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-sm mb-2">? Best For:</p>
                      <p className="text-sm text-muted-foreground">Long to very long hair (mid-back and beyond)</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-2">? Curl Type:</p>
                      <p className="text-sm text-muted-foreground">Soft, loose waves with natural flow</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-2">? Ideal Time:</p>
                      <p className="text-sm text-muted-foreground">6-8 hours or overnight</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-2">? Perfect If You:</p>
                      <p className="text-sm text-muted-foreground">Want effortless, beachy waves with volume</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="text-center mt-12 p-6 bg-primary/10 rounded-2xl border border-primary/20"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <p className="text-sm text-muted-foreground mb-2">
                  ?? <strong>Pro Tip:</strong> For tighter curls on longer hair, choose the Short Set. For looser waves on shorter hair, go with the Midi or Original Set.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Still unsure? The Short Set offers the most versatility for all hair types and lengths!
                </p>
              </motion.div>
            </div>
          </motion.section>
        )}
        
        </div>


        {/* Complete Your Routine Section */}
        {relatedProducts.length > 0 && (
          <motion.section 
            className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                  Complete Your Routine
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {product.id.startsWith('heatless-') || product.id === 'dreamcurl-original'
                    ? "Enhance your heatless styling with complementary products from our collections"
                    : product.id.startsWith('curly-')
                    ? "Complete your curly hair care routine with our premium styling tools"
                    : "Discover products that work perfectly together"
                  }
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <AnimatePresence mode="popLayout">
            {relatedProducts.slice(0, 3).map((relatedProduct, index) => (
              <motion.div
                key={relatedProduct.id}
                      className="w-full min-w-0"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      viewport={{ once: true }}
                      layout
                    >
                      <ProductCard
                        {...relatedProduct}
                        onClick={() => navigate(`/product/${relatedProduct.id}`)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

// Function to get heatless curling rod product by ID
const getHeatlessCurlingRodProductById = (id: string): Product | undefined => {
  // Import the images
  const product1Image = new URL('../assets/Heatless Hair Curling Rod/product-1.webp', import.meta.url).href;
  const product2Image = new URL('../assets/Heatless Hair Curling Rod/product-2.webp', import.meta.url).href;
  const product3Image = new URL('../assets/Heatless Hair Curling Rod/product-3.webp', import.meta.url).href;
  const product4Image = new URL('../assets/Heatless Hair Curling Rod/product-4.webp', import.meta.url).href;
  const product6Image = new URL('../assets/Heatless Hair Curling Rod/product6/candy&marchmello.webp', import.meta.url).href;

  const heatlessProducts: Product[] = [
    {
      id: "dreamcurl-original",
      name: "DreamCurl Original Set",
      price: "$22.99",
      image: new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/CFE0DE6D-F7E6-42F3-91A4-16C049F5ADA9.webp', import.meta.url).href,
      category: "DreamCurl Collection",
      hairType: "Medium to Long",
      featured: true,
      description: [
        "The Original Heatless Curler - by CURLEA",
        "For bouncy, voluminous curls overnight. Designed for medium to long hair.",
        "This isn't just a heatless curler. It's the one that redefined the category.",
        "We invented the first curlers by size and engineered tools for how people actually sleep.",
        "Developed with elongated, structured fibres that hold shape through the night without wires, foam or tension.",
        "Exclusive vegan Peau de Soie fabric reduces friction and protects against overnight breakage.",
        "No bunching. No pressure. No stiffness behind your ears.",
        "Available in 4 colors: Mulberry, Candy, Latte, Olive",
        "The curler that makes people say, 'What did you use?'"
      ],
      ingredients: ["Vegan Peau de Soie Fabric", "Elongated Structured Fibres", "Glide-Safe Material"],
      size: "Original Size",
      inStock: true,
      colors: ["Mulberry", "Candy", "Latte", "Olive"],
      video: new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/Screen Recording 2025-10-11 005227.mp4', import.meta.url).href,
      usageSteps: [
        "Start with clean, slightly damp hair (70-80% dry works best)",
        "Part your hair down the middle and divide into two sections",
        "Place the curler at the top of your head like a headband",
        "Take one section and wrap it around the curler, working from top to ends",
        "Secure the end with the attached scrunchie or hair tie",
        "Repeat with the other section on the opposite side",
        "Sleep comfortably or leave in for 6-8 hours",
        "Gently unwind your hair and enjoy gorgeous, heat-free curls"
      ],
      images: [
        new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/CFE0DE6D-F7E6-42F3-91A4-16C049F5ADA9.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_3b575993-8e6a-413e-9f88-d95395c19980.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_686ff861-b01d-41ef-9c4c-0684df944cd6.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_bf658774-aed4-4c4a-be42-ef9707a47f3e.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/IMG-3641.webp', import.meta.url).href
      ]
    },
    {
      id: "dreamcurl-short-set",
      name: "DreamCurl Short Set",
      price: "$16.99",
      image: product1Image,
      category: "DreamCurl Collection",
      hairType: "All Types",
      featured: true,
      description: [
        "The Short Set Collection - Perfect for every hair type and style",
        "Create beautiful curls without heat damage",
        "Professional heatless curling system designed for versatility",
        "Soft, flexible material that's gentle on your hair",
        "Easy to use and comfortable for overnight styling",
        "Each set includes different sized rods for various curl patterns",
        "Available in 4 luxurious colors: Rose Gold, Royal Purple, Olive Lux, Earl Grey",
        "Reusable, easy to clean, and built to last",
        "The perfect addition to your heat-free styling routine"
      ],
      ingredients: ["Premium Silicon", "Non-toxic Coating", "Flexible Material"],
      size: "Set of 4",
      inStock: true,
      colors: ["Rose Gold", "Royal Purple", "Olive Lux", "Earl Grey"],
      usageSteps: [
        "Wash and partially dry your hair (60-70% dry recommended)",
        "Divide hair into small sections based on desired curl tightness",
        "Wrap each section around the appropriate rod size",
        "Secure rods in place with the included clips or bands",
        "Leave in for 4-6 hours or overnight for best results",
        "Remove rods carefully by unwrapping in reverse order",
        "Gently separate curls with fingers for natural definition",
        "Set with light hairspray if desired for longer-lasting curls"
      ],
      images: [
        product1Image, // Rose Gold
        product2Image, // Royal Purple
        product3Image, // Olive Lux
        product4Image  // Earl Grey
      ]
    },
    {
      id: "dreamcurl-midi",
      name: "DreamCurl Midi",
      price: "$22.99",
      image: new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_purple.webp', import.meta.url).href,
      category: "DreamCurl Collection",
      hairType: "Short to Long",
      featured: true,
      description: [
        "**Midi Size** - Perfect for tighter curls with extended longevity",
        "**100% Vegan Peau De Soie Fabric** - Ultra-soft, friction-free material",
        "**Suitable for Short to Long Hair** - Versatile sizing for all lengths",
        "**Zero Heat Technology** - Sleep comfortably without damage",
        "**Sustainable & Eco-Friendly** - Made with responsibly sourced materials",
        "**Complete Set Includes:** 2 Hair Ties, 1 Midi Curler, 1 Hair Clip",
        "**Overnight Results** - Wake up to bouncy, defined curls",
        "**Luxury Comfort** - Designed for peaceful sleep experience"
      ],
      ingredients: ["100% Vegan Peau De Soie Fabric", "Sustainably Sourced Ultra-Soft Fibres", "Glide-Safe Material"],
      size: "Midi Size",
      inStock: true,
      colors: ["CANDY", "LATTE", "MULBERRY", "OLIVE"],
      video: new URL('../assets/Heatless Hair Curling Rod/midi_size/Screen Recording 2025-10-13 135516.mp4', import.meta.url).href,
      usageSteps: [
        "Begin with clean, lightly damp hair (70-75% dry is ideal)",
        "Create a center part and separate hair into two equal sections",
        "Position the Midi curler at the crown like a headband",
        "Wrap one section tightly around the curler from roots to ends",
        "Fasten securely with the included hair tie",
        "Repeat on the other side for balanced curls",
        "Sleep peacefully or wait 6-8 hours for perfect curls",
        "Carefully unwind and enjoy bouncy, defined curls"
      ],
      images: [
        new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_candy.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_latte.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_purple.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_olive.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_guide.webp', import.meta.url).href
      ]
    },
    {
      id: "dreamcurl-jumbo",
      name: "DreamCurl JUMBO SIZE",
      price: "$22.99",
      image: new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/latte_jumbo.webp', import.meta.url).href,
      category: "DreamCurl Collection",
      hairType: "All Types",
      featured: true,
      description: [
        "**Jumbo Size** - Creates soft, voluminous waves with looser curl shape",
        "**Premium Vegan Peau De Soie Fabric** - High-grade, glide-safe material",
        "**Elongated Structured Fibres** - Holds shape without wires or tension",
        "**Perfect for All Hair Types** - Thickness-based sizing, not length-based",
        "**Blown-Out Wave Style** - More body at root, softer finish at ends",
        "**Zero Bunching Technology** - No pressure or stiffness behind ears",
        "**Complete Set Includes:** 1 Jumbo Curler, 2 Hair Ties, 1 Hair Clip",
        "**Invented by CURLEA** - The original brand that perfected heatless curls"
      ],
      ingredients: ["100% Vegan Peau De Soie Fabric", "Elongated Structured Fibres", "Premium Memory Foam"],
      size: "Jumbo Size",
      inStock: true,
      colors: ["LATTE", "CANDY", "OLIVE", "MULBERRY"],
      usageSteps: [
        "Start with slightly damp hair (60-70% dry) for best curl formation",
        "Place the jumbo curler on top of your head at the crown",
        "Divide hair into two even sections",
        "Wrap each section around the curler in opposite directions",
        "Secure with the matching hair ties at the bottom",
        "Clip sections in place using the included hair clip",
        "Sleep comfortably or leave in for 6-8 hours minimum",
        "Gently unwrap and finger-comb for soft, voluminous waves"
      ],
      video: new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/guide (1).mp4', import.meta.url).href,
      images: [
        new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/latte_jumbo.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/candy_jumbo.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/olive_jumbo.webp4.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/purple_jumbo.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/guide.webp', import.meta.url).href
      ]
    },
    {
      id: "zero-heat-mini",
      name: "ZERO HEAT SET MINI SIZE",
      price: "$22.99",
      image: new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-olive.webp', import.meta.url).href,
      category: "DreamCurl Collection",
      hairType: "Short to Medium",
      featured: true,
      description: [
        "Our 'Zero Heat' Curling Rod is made out of the finest Peau De Soie fabric to help you achieve frizz-free shiny curls.",
        "The Zero Heat set includes:",
        " 2 Scrunchies",
        " 1 Curling Rod",
        " 1 Hair Claw Clip",
        "We use sustainably grown materials to fill our Curling Rod which means that not only does it make our product extremely comfortable to sleep with, but it also takes us all a step closer to a cleaner and safer environment - now that's what I call a Win-Win!",
        "*Please note, we do our best to match the curler sets with our claw clips that we have in stock. If you wish to receive a specific colour please leave a note with your order and we'll do our best to accommodate",
        "Perfect for shorter hair or those who want tighter, more defined curls",
        "Compact design ideal for travel and everyday styling"
      ],
      ingredients: ["Finest Peau De Soie Fabric", "Sustainably Grown Materials", "Premium Fill"],
      size: "Mini Size",
      inStock: true,
      colors: ["OLIVE", "LATTE", "CANDY"],
      images: [
        new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-olive.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-latte.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-candy.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-guide.webp', import.meta.url).href
      ]
    },
    {
      id: "heatless-6",
      name: "PEAU DE SOIE | XL OVERNIGHT BONNET",
      price: "$39.99",
      image: product6Image,
      category: "Heatless Tools",
      hairType: "All Types",
      featured: true,
      description: [
        "For all overnight heatless styling enthusiasts, the CURLEA Reversible Bonnet is a must-have addition to your bedtime routine",
        "This XL Overnight Bonnet fits even over our largest size JUMBO heatless curler and provides a protective barrier against breakage and frizz",
        "Retains your hair's natural oils, resulting in healthy, shiny, and frizz-free hair each morning",
        "Crafted from the finest vegan silk alternative french fabric known as Peau De Soie",
        "This luxurious sleep cap ensures maximum comfort all night long",
        "Fights frizz, infuses hair with moisture, preserves hairstyles, prevents bed head, and leaves your hair with a glossy shine",
        "Suitable for all hair types, but especially beneficial for curly hair, thick hair, natural hair, or hair extensions",
        "Wearing the Peau De Soie Bonnet overnight is a natural conditioning treatment that nourishes your hair",
        "Upgrade your hair care regimen with the CURLEA Reversible Bonnet - an elegant addition to your bedtime attire"
      ],
      ingredients: ["Peau De Soie", "Vegan Silk Alternative", "French Fabric"],
      size: "XL Size",
      colors: ["CANDY & MARSHMALLOW", "LATTE & MARSHMALLOW", "OLIVE & LATTE"],
      usageSteps: [
        "Style your hair in your preferred heatless curls or protective style",
        "Gather all hair and ensure curlers or styles are secure",
        "Place the bonnet over your head, covering all hair completely",
        "Adjust the elastic band for a comfortable, secure fit",
        "Sleep peacefully - the bonnet protects your style overnight",
        "Remove bonnet gently in the morning",
        "Unwrap curlers if applicable and style as desired",
        "Enjoy preserved, frizz-free hair with enhanced shine"
      ],
      video: new URL('../assets/Heatless Hair Curling Rod/product6/Screen Recording 2025-10-06 223323.mp4', import.meta.url).href,
      images: [
        new URL('../assets/Heatless Hair Curling Rod/product6/candy&marchmello.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/product6/latte&marchmello.webp4.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/product6/olive&latte.webp4.webp', import.meta.url).href,
      ],
      inStock: true,
    }
  ];

  return heatlessProducts.find(product => product.id === id);
};

// 1. The "Ritual in Motion" Video Section
const RitualInMotionSection = ({ product }: { product: Product }) => {
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-200px" }); // Changed to false and increased margin for earlier loading
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);

  // Reset video state when product changes with robust initialization
  useEffect(() => {
    setIsVideoPlaying(false);
    setIsVideoLoading(true);
    setVideoError(false);
    setVideoLoaded(false);
    setLoadAttempted(false);
    
    if (videoRef.current) {
      // Pause and reset
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      
      // Ensure DreamCurl Midi is always muted
      if (product.id === 'dreamcurl-midi') {
        videoRef.current.muted = true;
        videoRef.current.volume = 0;
      }
      
      // Don't force load immediately - let intersection observer handle it
      videoRef.current.preload = 'none';
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load(); // Clear the video
      }
    };
  }, [product.id]);

  // Check if it's a special product type
  const isHeatlessProduct = product.id.startsWith('heatless-');
  const isDreamCurlProduct = product.id.startsWith('dreamcurl-');
  const isCurlyHairProduct = product.id.startsWith('curly-') || product.id === 'curlea-comb';
  
  // Video event handlers with robust error handling
  const handleVideoLoad = () => {
    setIsVideoLoading(false);
    setVideoLoaded(true);
    setVideoError(false);
  };


  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    if (!(e.target instanceof HTMLVideoElement)) return;
    
    // Clear loading state and set error
    setIsVideoLoading(false);
    setVideoError(true);
    setVideoLoaded(false);

    const videoElement = e.target;
    console.warn(`Video loading error for ${product.name}:`, {
      error: e,
      src: videoElement.currentSrc,
      networkState: videoElement.networkState,
      readyState: videoElement.readyState
    });
    
    // Multiple retry attempts with exponential backoff
    const retryVideo = (attempt: number = 1, maxAttempts: number = 3) => {
      if (attempt > maxAttempts) {
        console.error(`Failed to load video after ${maxAttempts} attempts for ${product.name}`);
        return;
      }
      
      // Exponential backoff delay
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      
      setTimeout(() => {
        if (!videoRef.current || !specialVideo) return;
        
        console.log(`Retry attempt ${attempt}/${maxAttempts} for ${product.name}`);
        
        // Full reset of video element
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
        
        // Try to preload first
        const preloadVideo = new Image();
        preloadVideo.src = specialVideo;
        preloadVideo.onload = () => {
          if (!videoRef.current) return;
          
          // Set source and reload
          const source = videoRef.current.querySelector('source');
          if (source) {
            source.src = specialVideo;
            videoRef.current.load();
            
            // Only set error handler for actual failures
            videoRef.current.onerror = () => {
              // Use a different source URL pattern on failure
              const fallbackUrl = specialVideo.replace('/videos/', '/fallback-videos/');
              source.src = fallbackUrl;
              videoRef.current?.load();
              
              // If still fails, try next attempt
              videoRef.current.onerror = () => retryVideo(attempt + 1, maxAttempts);
            };
          }
        };
        
        preloadVideo.onerror = () => retryVideo(attempt + 1, maxAttempts);
      }, delay);
    };
    
    // Start retry process
    retryVideo();
  };

  const handleVideoCanPlay = () => {
    setIsVideoLoading(false);
    setVideoLoaded(true);
    setVideoError(false);
    
    // Auto-play when video is ready (with error handling)
    if (videoRef.current && isInView) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoPlaying(true);
            console.log('Video autoplay successful for:', product.name);
          })
          .catch((error) => {
            console.warn('Autoplay prevented for:', product.name, error);
            setIsVideoPlaying(false);
            // Autoplay was prevented, but video is still loaded and playable
          });
      }
    }
  };

  const handleVideoLoadStart = () => {
    setIsVideoLoading(true);
    setVideoError(false);
  };

  const handleVideoPlay = () => {
    if (videoRef.current) {
      // Ensure DreamCurl Midi is always muted when played
      if (product.id === 'dreamcurl-midi') {
        videoRef.current.muted = true;
        videoRef.current.volume = 0;
      }
      videoRef.current.play().catch((error) => {
        console.error('Video play error:', error);
        setVideoError(true);
      });
    }
  };
  
  // Use product.video if available, otherwise use fallback video logic
  const specialVideo = product.video ? product.video : 
    (isHeatlessProduct || isDreamCurlProduct || isCurlyHairProduct) 
      ? product.id === 'dreamcurl-original'
        ? '/videos/dreamcurl-original-guide.mp4'
        : product.id === 'dreamcurl-midi'
        ? '/videos/dreamcurl-midi-guide.mp4'
        : product.id === 'dreamcurl-jumbo'
        ? '/videos/dreamcurl-jumbo-guide.mp4'
        : product.id === 'heatless-5'
        ? '/videos/bun-bons-guide.mp4'
        : product.id === 'heatless-6'
        ? '/videos/bonnet-guide.mp4'
        : '/videos/heatless-guide.mp4'
      : product.id === 'curly-clip-1'
        ? '/videos/hair-clips-guide.mp4'
        : product.id === 'curly-scarf-1'
        ? '/videos/satin-scarves-guide.mp4'
        : product.id === 'curly-claw-1'
        ? '/videos/claw-clips-guide.mp4'
        : product.id === 'curlea-comb'
        ? '/videos/curlea-comb-guide.mp4'
        : null;

  // Simplified video loading when section comes into view
  useEffect(() => {
    if (isInView && videoRef.current && specialVideo && !loadAttempted) {
      setLoadAttempted(true);
      
      const video = videoRef.current;
      
      // Ensure DreamCurl Midi is always muted
      if (product.id === 'dreamcurl-midi') {
        video.muted = true;
        video.volume = 0;
      }
      
      // Simple and reliable loading strategy
      video.preload = 'auto';
      video.load();
      
      // Wait for video to be ready
      const handleCanPlayThrough = () => {
        setIsVideoLoading(false);
        setVideoLoaded(true);
        
        // Try to play the video
        video.play()
          .then(() => {
            setIsVideoPlaying(true);
            console.log('Video autoplay successful for:', product.name);
          })
          .catch((error) => {
        if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
              console.warn('Autoplay prevented for:', product.name, error);
            }
            setIsVideoPlaying(false);
            setIsVideoLoading(false);
          });
      };
      
      // Set a timeout to hide loading state even if video doesn't fully load
      const loadingTimeout = setTimeout(() => {
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA or better
          setIsVideoLoading(false);
        }
      }, 3000); // Hide loading after 3 seconds max
      
      video.addEventListener('canplaythrough', handleCanPlayThrough);
      
      return () => {
        video.removeEventListener('canplaythrough', handleCanPlayThrough);
        clearTimeout(loadingTimeout);
      };
    }
  }, [isInView, specialVideo, loadAttempted, product.id, product.name]);


  return (
    <motion.section
      ref={ref}
      className="relative py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-background to-muted/20"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-8 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                {isHeatlessProduct 
                  ? product.id === 'heatless-5' ? "BUN BONS in Motion" 
                    : product.id === 'heatless-6' ? "Peau de Soie Bonnet in Action"
                    : "Heatless Curling in Motion"
                  : isCurlyHairProduct
                  ? product.id === 'curly-clip-1' ? "Hair Clips in Action" 
                    : product.id === 'curly-scarf-1' ? "Satin Scarves in Action"
                    : product.id === 'curly-claw-1' ? "Hair Claw Clips in Action"
                    : "Hair Accessories in Action"
                  : "The Curlea Ritual in Motion"
                }
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                {isHeatlessProduct 
                  ? product.id === 'heatless-5'
                    ? "Experience the revolutionary BUN BONS system - the innovation that transformed heatless hairstyling. Watch how our unique curling system creates overnight blowout-style volume with exceptional comfort."
                    : product.id === 'heatless-6'
                    ? "Discover the luxurious comfort and protection of our Peau de Soie XL Overnight Bonnet. Watch how this premium sleep cap preserves your hairstyle while providing ultimate comfort throughout the night."
                    : "Watch how to achieve beautiful, damage-free curls with our innovative heatless curling rod."
                  : isCurlyHairProduct
                  ? product.id === 'curly-clip-1' 
                    ? "See how our comfortable curved resin hair clips work their magic for secure and stylish hair styling."
                    : product.id === 'curly-scarf-1'
                    ? "Discover how our elegant satin hair bands and scrunchies protect and style your hair beautifully."
                    : product.id === 'curly-claw-1'
                    ? "Watch how our fashion-forward geometric hair claw clips provide secure hold with elegant style."
                    : "Experience how our premium hair accessories transform your styling routine."
                  : "Experience the transformative power of our products as they work their magic on your hair."
                }
              </p>
        </motion.div>

            <motion.div
              className={`relative rounded-2xl overflow-hidden shadow-2xl w-full ${
                (isHeatlessProduct || isDreamCurlProduct || isCurlyHairProduct) && specialVideo 
                  ? "aspect-[16/10] sm:aspect-[16/10] min-h-[250px] sm:min-h-[400px] md:min-h-[500px]" 
                  : "aspect-video"
              }`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {(isHeatlessProduct || isDreamCurlProduct || isCurlyHairProduct) && specialVideo ? (
                <>
                  {/* Actual Video for Special Products */}
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover sm:object-contain bg-gray-900"
                    preload="none"
                    playsInline
                    webkit-playsinline="true"
                    x5-playsinline="true"
                    disablePictureInPicture
                    controlsList="nodownload noplaybackrate"
                    controls={product.id === 'dreamcurl-midi' ? false : isVideoPlaying}
                    muted
                    loop
                    onLoadStart={handleVideoLoadStart}
                    onLoadedData={handleVideoLoad}
                    onCanPlay={handleVideoCanPlay}
                    onError={handleVideoError}
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    onVolumeChange={(e) => {
                      // Force mute for DreamCurl Midi
                      if (product.id === 'dreamcurl-midi' && e.currentTarget) {
                        e.currentTarget.muted = true;
                        e.currentTarget.volume = 0;
                      }
                    }}
                  >
                    <source src={specialVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Loading Overlay */}
                  {isVideoLoading && (
                    <motion.div
                      className="absolute inset-0 bg-black/50 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="flex flex-col items-center gap-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full" />
                        <p className="text-white text-sm">Loading video...</p>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Error Overlay */}
                  {videoError && (
                    <motion.div
                      className="absolute inset-0 bg-black/70 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-center text-white">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <p className="text-sm mb-4">Video failed to load</p>
                        <button
                          onClick={() => {
                            setVideoError(false);
                            setIsVideoLoading(true);
                            if (videoRef.current) {
                              videoRef.current.load();
                            }
                          }}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Play Button Overlay (when not playing and video is loaded) */}
                  {!isVideoPlaying && !isVideoLoading && !videoError && videoLoaded && (
                    <motion.div
                      className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer"
                      onClick={handleVideoPlay}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play className="w-8 h-8 text-white ml-1" />
                      </motion.div>
                    </motion.div>
                  )}
                  
                  {/* Video controls overlay */}
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-sm opacity-80">
                      {isHeatlessProduct 
                        ? "Watch the heatless curling technique"
                        : isCurlyHairProduct
                        ? product.id === 'curly-clip-1' ? "See the hair clips in action" : "See the satin scarves in action"
                        : "Experience the product"
                      }
                    </p>
                  </div>
                </>
              ) : (
            <>
              {/* Placeholder for other products */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/30 to-primary/20 flex items-center justify-center">
                <motion.div
                  className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-8 h-8 text-white ml-1" />
                </motion.div>
              </div>
              
              {/* Video overlay with product application scene */}
              <div className="absolute inset-0 bg-black/20" />
              
              {/* Video controls overlay */}
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-sm opacity-80">Experience the Curlea ritual</p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
};

// 2. The Interactive Step-by-Step Guide
const InteractiveStepGuide = ({ product }: { product: Product }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeStep, setActiveStep] = useState(0);

  // Check if it's a heatless curling rod product
  const isHeatlessProduct = product.id.startsWith('heatless-');

  // Import step images for heatless curling rod products
  const stepImages = isHeatlessProduct ? {
    1: new URL('../assets/Heatless Hair Curling Rod/steps/step1.png', import.meta.url).href,
    2: new URL('../assets/Heatless Hair Curling Rod/steps/step2.png', import.meta.url).href,
    3: new URL('../assets/Heatless Hair Curling Rod/steps/step3.png', import.meta.url).href,
    4: new URL('../assets/Heatless Hair Curling Rod/steps/step4.png', import.meta.url).href,
    5: new URL('../assets/Heatless Hair Curling Rod/steps/step5.png', import.meta.url).href,
    6: new URL('../assets/Heatless Hair Curling Rod/steps/step6.png', import.meta.url).href,
    7: new URL('../assets/Heatless Hair Curling Rod/steps/step7.png', import.meta.url).href,
    8: new URL('../assets/hero-luxury-1.jpg', import.meta.url).href, // Using hero-luxury-1.jpg for step 8
  } : {};

  const steps = isHeatlessProduct ? [
    {
      number: 1,
      title: "Prepare Your Hair",
      description: "Start with slightly damp hair (80-90% dry). Apply styling mousse or curl-enhancing cream for better hold. Brush to remove tangles.",
      image: stepImages[1] || product.image
    },
    {
      number: 2,
      title: "Position and Secure",
      description: "Part your hair down the middle. Place the curling rod on top of your head like a headband and secure with the fastening strap.",
      image: stepImages[2] || product.image
    },
    {
      number: 3,
      title: "Wrap the First Side",
      description: "Take a small section from the front and wrap away from your face. Add new sections as you wrap, similar to French braiding technique.",
      image: stepImages[3] || product.image
    },
    {
      number: 4,
      title: "Continue Wrapping",
      description: "Keep wrapping tightly for defined curls or looser for soft waves. Maintain clean, flat sections against the rod for smooth results.",
      image: stepImages[4] || product.image
    },
    {
      number: 5,
      title: "Secure the End",
      description: "Once all hair on one side is wrapped, secure the ends with the provided satin scrunchie to prevent kinks.",
      image: stepImages[5] || product.image
    },
    {
      number: 6,
      title: "Repeat on Other Side",
      description: "Do the exact same wrapping process on the other side. Secure the end with the second scrunchie.",
      image: stepImages[6] || product.image
    },
    {
      number: 7,
      title: "Wait and Let It Set",
      description: "Remove the top fastener and optionally tie the ends together at the nape. Leave in for 4-6 hours or overnight for best results.",
      image: stepImages[7] || product.image
    },
    {
      number: 8,
      title: "Style and Finish",
      description: "Separate curls with fingers (avoid brushes). Shake from roots for volume. Finish with hairspray or anti-frizz serum.",
      image: stepImages[8] || product.image
    }
  ] : product.id.startsWith('curly-') ? [] : [
      {
        number: 1,
        title: "Emulsify",
        description: "Warm a small amount between your palms to activate the luxurious texture.",
        image: product.image
      },
      {
        number: 2,
        title: "Apply",
        description: "Gently work through damp hair, focusing on mid-lengths to ends for optimal absorption.",
        image: product.image
      },
      {
        number: 3,
        title: "Define",
        description: "Use your fingers or a wide-tooth comb to shape and define your natural pattern.",
        image: product.image
      },
      {
        number: 4,
        title: "Air Dry",
        description: "Allow to dry naturally for the most beautiful, defined results that last all day.",
        image: product.image
      }
    ];

  // Don't render if there are no steps
  if (steps.length === 0) {
    return null;
  }

  return (
    <motion.section
      ref={ref}
      className="relative py-24 px-6"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Enhanced 3D section background */}
      <div className="absolute inset-0 bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl" />
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            {isHeatlessProduct ? "How to Use It: Step-by-Step Guide" : "Your Perfect Ritual"}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {isHeatlessProduct 
              ? "Here is a detailed guide on how to use the heatless curling rod for the best results."
              : `Follow these simple steps to unlock the full potential of your ${product.name}.`
            }
          </p>
        </motion.div>

        {/* Elegant Interactive Digital Guide */}
        {isHeatlessProduct ? (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
              {/* Fixed Step Grid - Left Side (Desktop) / Top (Mobile) */}
              <motion.div 
                className="lg:col-span-2 space-y-4 order-2 lg:order-1"
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <div className="lg:sticky lg:top-8">
                  <h3 className="text-2xl font-semibold text-muted-foreground mb-8 tracking-wide">
                    Step Guide
                  </h3>
                  
                  {/* Step Navigation Grid */}
                  <div className="space-y-2 sm:space-y-3">
                    {steps.map((step, index) => (
                      <motion.button
                        key={step.number}
                        className={`w-full text-left p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-500 group ${
                          activeStep === index
                            ? "border-primary bg-primary/5 shadow-lg"
                            : "border-muted/30 bg-background hover:border-primary/50 hover:bg-primary/2"
                        }`}
                        onClick={() => setActiveStep(index)}
                        whileHover={{ x: 8, transition: { duration: 0.2 } }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                          {/* Step Number Circle */}
                          <motion.div
                            className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 ${
                              activeStep === index
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                            animate={{
                              scale: activeStep === index ? 1.1 : 1,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            {step.number}
                          </motion.div>
                          
                          {/* Step Title */}
                          <div className="flex-1">
                            <h4 className={`text-sm sm:text-base lg:text-lg font-semibold transition-colors duration-300 ${
                              activeStep === index ? "text-primary" : "text-foreground"
                            }`}>
                              {step.title}
                            </h4>
                          </div>

                          {/* Active Indicator */}
                          {activeStep === index && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.1, duration: 0.3 }}
                              className="w-2 h-2 bg-primary rounded-full"
                            />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Dynamic Content Reveal Area - Right Side (Desktop) / Top (Mobile) */}
              <motion.div 
                className="lg:col-span-3 order-1 lg:order-2"
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <div className="lg:sticky lg:top-8">
                  {/* Step Header */}
                  <motion.div
                    key={`header-${activeStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <motion.div
                        className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-2xl shadow-lg"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.6, ease: "backOut" }}
                      >
                        {steps[activeStep].number}
                      </motion.div>
                      <h2 className="text-2xl lg:text-4xl font-bold text-foreground">
                        {steps[activeStep].title}
                      </h2>
                    </div>
                  </motion.div>

                  {/* Dynamic Image Display */}
                  <motion.div
                    key={`image-${activeStep}`}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="mb-8"
                  >
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-muted/20 to-muted/5">
                  <motion.img
                        src={steps[activeStep].image}
                        alt={`Step ${steps[activeStep].number}: ${steps[activeStep].title}`}
                        className="w-full h-full object-cover"
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                      
                      {/* Elegant Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
                  </motion.div>

                  {/* Dynamic Text Content */}
                  <motion.div
                    key={`content-${activeStep}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="prose prose-lg max-w-none"
                  >
                    <p className="text-lg leading-relaxed text-muted-foreground mb-8">
                      {steps[activeStep].description}
                    </p>
                  </motion.div>

                  {/* Navigation Arrows */}
                  <motion.div
                    className="flex flex-col sm:flex-row items-center justify-between gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <motion.button
                      className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all duration-300 ${
                        activeStep === 0
                          ? "border-muted/30 text-muted-foreground cursor-not-allowed"
                          : "border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary"
                      }`}
                      onClick={() => activeStep > 0 && setActiveStep(activeStep - 1)}
                      disabled={activeStep === 0}
                      whileHover={activeStep > 0 ? { scale: 1.05 } : {}}
                      whileTap={activeStep > 0 ? { scale: 0.95 } : {}}
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Previous Step
                    </motion.button>

                    <span className="text-sm text-muted-foreground">
                      Step {activeStep + 1} of {steps.length}
                    </span>

                    <motion.button
                      className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all duration-300 ${
                        activeStep === steps.length - 1
                          ? "border-muted/30 text-muted-foreground cursor-not-allowed"
                          : "border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary"
                      }`}
                      onClick={() => activeStep < steps.length - 1 && setActiveStep(activeStep + 1)}
                      disabled={activeStep === steps.length - 1}
                      whileHover={activeStep < steps.length - 1 ? { scale: 1.05 } : {}}
                      whileTap={activeStep < steps.length - 1 ? { scale: 0.95 } : {}}
                    >
                      Next Step
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          // Regular Products - 2 Column Layout with Visual
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Visual */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <motion.img
                  src={steps[activeStep].image}
                  alt={`Step ${activeStep + 1}`}
                  className="w-full h-full object-cover"
                  key={activeStep}
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
              
              {/* Floating step indicator */}
              <motion.div
                className="absolute -top-6 -right-6 w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl shadow-lg"
                initial={{ scale: 0, rotate: -180 }}
                animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                transition={{ delay: 0.6, duration: 0.8, ease: "backOut" }}
              >
                {activeStep + 1}
              </motion.div>
            </motion.div>

            {/* Right: Steps */}
            <div className="space-y-4 sm:space-y-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-500 cursor-pointer ${
                    activeStep === index
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-border/50 bg-background hover:border-primary/50'
                  }`}
                  onClick={() => setActiveStep(index)}
                  initial={{ opacity: 0, x: 50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <motion.div
                      className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 ${
                        activeStep === index
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                      animate={{
                        scale: activeStep === index ? 1.1 : 1,
                        rotate: activeStep === index ? 360 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {step.number}
                    </motion.div>
                    
                    <div className="flex-1">
                      <h3 className={`text-base sm:text-lg lg:text-xl font-semibold mb-2 transition-colors duration-300 ${
                        activeStep === index ? 'text-primary' : 'text-foreground'
                      }`}>
                        {step.title}
                  </h3>
                      <p className={`text-sm sm:text-base transition-colors duration-300 ${
                        activeStep === index ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.description}
                      </p>
                    </div>

                    {activeStep === index && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        <CheckCircle className="w-6 h-6 text-primary" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </motion.section>
  );
};

// 3. The "Science & Soul" Ingredient Spotlight
const ScienceAndSoulSection = ({ product }: { product: Product }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState<'science' | 'soul'>('science');

  // Get primary ingredient based on product
  const getPrimaryIngredient = (product: Product) => {
    const ingredientMap: { [key: string]: any } = {
      '1': {
        name: 'Argan Oil',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
        science: 'Argan oil\'s unique fatty acid profile penetrates the hair shaft, creating a protective barrier that reduces moisture loss and enhances shine. Rich in vitamin E and antioxidants, it repairs damage while preventing future breakage.',
        soul: 'Sustainably sourced from women\'s cooperatives in Morocco, each drop of argan oil represents generations of traditional knowledge and community empowerment. The oil is cold-pressed from nuts harvested by hand in the Atlas Mountains.'
      },
      '2': {
        name: 'Shea Butter',
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
        science: 'Shea butter contains high levels of fatty acids and vitamins A and E, which deeply moisturize and nourish hair from within. Its anti-inflammatory properties help soothe the scalp while creating flexible, manageable strands.',
        soul: 'Harvested by women in West Africa using traditional methods passed down through generations, shea butter embodies the spirit of community and natural wisdom. Each tree takes 20 years to mature, making it a truly precious resource.'
      },
      '3': {
        name: 'Keratin',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
        science: 'Keratin is the primary structural protein in hair. Our advanced keratin complex helps rebuild damaged hair cuticles, restoring strength, elasticity, and natural shine while protecting against environmental stressors.',
        soul: 'Nature\'s own building block for strong, healthy hair. Our keratin is derived from sustainable sources and processed using gentle methods that preserve its natural integrity and effectiveness.'
      },
    };
    
    return ingredientMap[product.id] || ingredientMap['1'];
  };

  const ingredient = getPrimaryIngredient(product);

  return (
    <motion.section
      ref={ref}
      className="relative py-24 px-6 bg-gradient-to-b from-muted/20 to-background"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Powered by Nature, Perfected by Science
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the extraordinary {ingredient.name} that makes your {product.name} truly exceptional.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Ingredient Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={ingredient.image}
                alt={ingredient.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Floating ingredient name */}
            <motion.div
              className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold text-foreground">{ingredient.name}</h3>
              <p className="text-muted-foreground">Premium Ingredient</p>
            </motion.div>
          </motion.div>

          {/* Right: Tabbed Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {/* Tab Navigation */}
            <div className="flex gap-2 p-2 bg-muted/30 rounded-xl">
                  <motion.button
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'science'
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('science')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Leaf className="w-5 h-5" />
                  The Science
                </div>
                  </motion.button>
              <motion.button
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === 'soul'
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('soul')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5" />
                  The Soul
                </div>
              </motion.button>
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="min-h-[200px] flex items-center"
            >
              <div className="prose prose-lg max-w-none">
                <p className="text-lg leading-relaxed text-foreground">
                  {activeTab === 'science' ? ingredient.science : ingredient.soul}
                </p>
                </div>
              </motion.div>
          </motion.div>
        </div>
        </div>
    </motion.section>
  );
};

// Curly Hair Collection Image Gallery Component
const CurlyHairCollectionImageGallery = ({ 
  product, 
  selectedSize, 
  setSelectedSize 
}: { 
  product: Product; 
  selectedSize?: string; 
  setSelectedSize?: (size: string) => void;
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);


  // Import images based on product type
  const curlyHairImages = product.id === 'curly-clip-1' ? [
    new URL('../assets/curly hair collection/product1/p1.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product1/p2.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product1/p3.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product1/p4.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product1/p5.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product1/p6.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product1/p7.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product1/p8.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product1/p9.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product1/p10.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product1/p11.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product1/p12.avif', import.meta.url).href,
  ] : product.id === 'curly-scarf-1' ? [
    new URL('../assets/curly hair collection/product2/pp1.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product2/pp2.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product2/pp3.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product2/pp4.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product2/pp5.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product2/pp6.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product2/pp7.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product2/pp8.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product2/pp9.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product2/pp10.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product2/pp11.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product2/pp12.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product2/pp13.avif', import.meta.url).href,
  ] : product.id === 'songmay-hair-clips' ? [
    // Images for SongMay hair clips product
    new URL('../assets/curly hair collection/product4/SongMay Woman Hair Clips.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product4/gold.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product4/print.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product4/gol2.jpg', import.meta.url).href,
  ] : product.id === 'curly-clip-5' ? [
    // Only show the 2 specified images in main gallery
    new URL('../assets/curly hair collection/product5/candy&marchmello.webp', import.meta.url).href,
    new URL('../assets/curly hair collection/product5/olive&latte.webp4.webp', import.meta.url).href,
    ] : product.id === 'curly-clip-6' ? [
      // Images for Cream Coffee Hair Scrunchies Vintage from product6 folder only
      new URL('../assets/curly hair collection/product6/placeholder.webp', import.meta.url).href,
      new URL('../assets/curly hair collection/product6/H2a4a1357fa684cb9b8e88b438e1511e8X.webp', import.meta.url).href,
      new URL('../assets/curly hair collection/product6/H49b2b312a2804aa492a955afc061a94cF.webp', import.meta.url).href,
      new URL('../assets/curly hair collection/product6/information.webp', import.meta.url).href,
      new URL('../assets/curly hair collection/product6/information1.webp', import.meta.url).href,
    ] : product.id === 'curlea-comb' ? [
      // Images for CURLEA Comb from product7 folder
      new URL('../assets/curly hair collection/product7/product7.webp', import.meta.url).href,
      new URL('../assets/curly hair collection/product7/Gemini_Generated_Image_vpzo3jvpzo3jvpzo.png', import.meta.url).href,
  ] : product.id === 'satin-scrunchies-french-5pc' ? [
      // Images for Satin Scrunchies Luxury French 5 Piece
      new URL('../assets/curly hair collection/scrunchies/scrunchies.webp', import.meta.url).href,
      new URL('../assets/curly hair collection/scrunchies/scrunchiess.webp', import.meta.url).href,
      new URL('../assets/curly hair collection/scrunchies/scrunchiesss.webp', import.meta.url).href,
      new URL('../assets/curly hair collection/scrunchies/guide-scrunchies.webp', import.meta.url).href,
  ] : [
    // Images for claw clips product
    new URL('../assets/curly hair collection/product3/ppp1.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp2.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp3.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp4.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp5.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp6.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp7.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp8.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp9.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp10.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp11.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp12.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp13.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp14.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp15.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp16.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp17.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp18.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp19.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp20.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp21.avif', import.meta.url).href,
  ];

  const placeholderImage = new URL('../assets/placeholder.svg', import.meta.url).href;

  // Map size selections to image indices for hair clip product
  const getImageIndexFromSize = (size: string): number => {
    if (product.id === 'curly-clip-1') {
      switch (size) {
        case '9-piece-complete': return 0; // p1.jpg
        case '4-piece-type1': return 1;    // p2.jpg
        case '4-piece-type2': return 2;    // p3.jpg
        case '4-piece-type3': return 3;    // p4.jpg
        default: return 0;
      }
    }
    return 0;
  };


  // Initialize and update image based on size selection
  useEffect(() => {
    if (product.id === 'curly-clip-1') {
      let imageIndex = 0; // default to 9-piece
      
      if (selectedSize) {
        imageIndex = getImageIndexFromSize(selectedSize);
      }
      
      setSelectedImageIndex(imageIndex);
    }
  }, [selectedSize, product.id]);

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <motion.div
        className={`relative overflow-hidden ${
          product.id === 'curlea-comb' 
            ? 'aspect-[4/3] rounded-xl bg-transparent' 
            : 'aspect-square rounded-lg bg-muted'
        }`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <OptimizedImage
          src={curlyHairImages[selectedImageIndex]}
          alt={`${product.name} - View ${selectedImageIndex + 1}`}
          className={product.id === 'curlea-comb' ? 'w-full h-[520px] object-contain' : 'object-cover'}
          priority={true}
        />
        
        {/* Navigation Arrows */}
        {curlyHairImages.length > 1 && (
          <>
            <button
              onClick={() => setSelectedImageIndex((prev) => 
                prev > 0 ? prev - 1 : curlyHairImages.length - 1
              )}
              className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full transition-colors touch-manipulation ${
                product.id === 'curlea-comb'
                  ? 'bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white shadow-lg'
                  : 'bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 active:bg-black/80'
              }`}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedImageIndex((prev) => 
                prev < curlyHairImages.length - 1 ? prev + 1 : 0
              )}
              className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full transition-colors touch-manipulation ${
                product.id === 'curlea-comb'
                  ? 'bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white shadow-lg'
                  : 'bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 active:bg-black/80'
              }`}
              aria-label="Next image">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        
        {/* Image Counter */}
        <div className={`absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs sm:text-sm ${
          product.id === 'curlea-comb'
            ? 'bg-white/90 backdrop-blur-sm text-gray-800 shadow-lg'
            : 'bg-black/50 backdrop-blur-sm text-white'
        }`}>
          {selectedImageIndex + 1} / {curlyHairImages.length}
      </div>
      </motion.div>

      {/* Thumbnail Gallery for curly-clip-6 and scrunchies - Always show thumbnails */}
      {(product.id === 'curly-clip-6' || product.id === 'satin-scrunchies-french-5pc') && curlyHairImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {curlyHairImages.map((imgSrc, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative aspect-square rounded-xl overflow-hidden border transition-all duration-200 shadow-sm ${
                selectedImageIndex === index
                  ? 'border-primary/80 ring-1 ring-primary/20'
                  : 'border-gray-200 hover:border-primary/40'
              }`}
            >
              <OptimizedImage
                src={imgSrc}
                alt={`${product.name} thumbnail ${index + 1}`}
                className="object-cover"
                placeholderSrc={placeholderImage}
              />
            </button>
          ))}
        </div>
      )}

      {/* Thumbnail Gallery with Pagination - for other products with many images */}
      {product.id !== 'curly-clip-6' && product.id !== 'satin-scrunchies-french-5pc' && curlyHairImages.length > 6 && (
        <div className="flex flex-col gap-2">
        <div className="grid grid-cols-6 gap-2">
            {curlyHairImages.slice(thumbnailStartIndex, thumbnailStartIndex + 6).map((imgSrc, index) => {
            const actualIndex = thumbnailStartIndex + index;
            return (
                <button
                key={actualIndex}
                  onClick={() => {
                    setSelectedImageIndex(actualIndex);
                    // Update size selection for hair clip product
                    if (product.id === 'curly-clip-1' && setSelectedSize) {
                      let newSize = '9-piece-complete'; // default
                      switch (actualIndex) {
                        case 0: newSize = '9-piece-complete'; break;
                        case 1: newSize = '4-piece-type1'; break;
                        case 2: newSize = '4-piece-type2'; break;
                        case 3: newSize = '4-piece-type3'; break;
                      }
                      setSelectedSize(newSize);
                    }
                  }}
                  className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 touch-manipulation ${
                  selectedImageIndex === actualIndex
                      ? 'ring-2 ring-primary scale-105'
                      : 'hover:scale-105 opacity-70 hover:opacity-100 active:scale-95'
                  }`}
                >
                  <OptimizedImage
                    src={imgSrc}
                    alt={`Thumbnail ${actualIndex + 1}`}
                    className="object-cover"
                    // placeholderSrc={placeholderImage}
                    priority={false}
                  onError={(e) => {
                      console.error(`Failed to load thumbnail: ${imgSrc}`);
                      if (e.currentTarget) {
                        e.currentTarget.src = product.images?.[0] || '';
                      }
                    }}
                  />
                </button>
            );
          })}
        </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between">
            <motion.button
              onClick={() => {
                const newStart = thumbnailStartIndex > 0 ? thumbnailStartIndex - 6 : Math.max(0, curlyHairImages.length - 6);
                setThumbnailStartIndex(newStart);
              }}
              className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-4 h-4 inline mr-1" /> Previous Set
            </motion.button>

            <div className="text-xs text-muted-foreground">
              Showing {thumbnailStartIndex + 1}-{Math.min(thumbnailStartIndex + 6, curlyHairImages.length)} of {curlyHairImages.length}
            </div>

            <motion.button
              onClick={() => {
                const newStart = thumbnailStartIndex + 6 < curlyHairImages.length ? thumbnailStartIndex + 6 : 0;
                setThumbnailStartIndex(newStart);
              }}
              className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next Set <ChevronRight className="w-4 h-4 inline ml-1" />
            </motion.button>
          </div>
          </div>
        )}
    </div>
  );
};

// BUN BONS Image Gallery Component - Simplified
const BunBonsImageGallery = ({ product, selectedColor, onColorSelect }: { product: Product; selectedColor: string; onColorSelect: (color: string) => void }) => {
  // Import images for BUN BONS product (5 images mapped to 5 colors)
  const bunBonsImages = [
    new URL('../assets/Heatless Hair Curling Rod/product5/pppp1.webp', import.meta.url).href,
    new URL('../assets/Heatless Hair Curling Rod/product5/pppp2.webp', import.meta.url).href,
    new URL('../assets/Heatless Hair Curling Rod/product5/pppp3.webp', import.meta.url).href,
    new URL('../assets/Heatless Hair Curling Rod/product5/pppp4.webp', import.meta.url).href,
    new URL('../assets/Heatless Hair Curling Rod/product5/pppp5.webp', import.meta.url).href,
  ];

  // Color-specific image mapping - corrected mapping
  const getColorSpecificImage = (color: string) => {
    const colorImageMap = {
      'MULBERRY': bunBonsImages[3], // pppp4.webp
      'CANDY': bunBonsImages[1],    // pppp2.webp
      'LATTE': bunBonsImages[0],    // pppp1.webp
      'OLIVE': bunBonsImages[2],    // pppp3.webp
    };
    return colorImageMap[color as keyof typeof colorImageMap] || bunBonsImages[0];
  };

  // Get the current main image based on selected color
  const currentMainImage = selectedColor ? getColorSpecificImage(selectedColor) : getColorSpecificImage('CANDY');

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <motion.div
        className="relative aspect-square rounded-lg overflow-hidden bg-muted"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ProductImage
          key={`${selectedColor}-${currentMainImage}`}
          src={currentMainImage}
          alt={`${product.name} - ${selectedColor} Color`}
          className="w-full h-full"
          priority={true}
          productId={product.id}
        />
      </motion.div>

      {/* Thumbnail Gallery - show all color images */}
      {product.colors && product.colors.length > 0 && (
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {product.colors.map((color, index) => (
            <button
              key={color}
              onClick={() => onColorSelect(color)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                selectedColor === color
                  ? 'border-primary shadow-lg'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
            >
              <img
                src={getColorSpecificImage(color)}
                alt={`${product.name} - ${color} color preview`}
                className="w-full h-full object-cover"
              />
              
              {selectedColor === color && (
                <div className="absolute inset-0 bg-primary/20" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Zero Heat Mini Image Gallery Component - color-to-image mapping
const ZeroHeatMiniImageGallery = ({ product, selectedColor, onColorSelect }: { product: Product; selectedColor: string; onColorSelect: (color: string) => void }) => {
  // Import images for Zero Heat Mini (3 colors + guide)
  const miniImages = {
    OLIVE: new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-olive.webp', import.meta.url).href,
    LATTE: new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-latte.webp', import.meta.url).href,
    CANDY: new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-candy.webp', import.meta.url).href,
    GUIDE: new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-guide.webp', import.meta.url).href,
  } as const;

  const getColorSpecificImage = (color: string) => {
    const key = (color || 'OLIVE').toUpperCase() as keyof typeof miniImages;
    return miniImages[key] || miniImages.OLIVE;
  };

  const [isViewingGuide, setIsViewingGuide] = useState(false);

  const currentMainImage = isViewingGuide
    ? miniImages.GUIDE
    : selectedColor
      ? getColorSpecificImage(selectedColor)
      : miniImages.OLIVE;

  const handleGuideClick = () => {
    setIsViewingGuide(true);
  };

  const handleColorClick = (color: string) => {
    setIsViewingGuide(false);
    onColorSelect(color);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <motion.div
        className="relative aspect-square rounded-lg overflow-hidden bg-muted"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ProductImage
          key={`${selectedColor || 'OLIVE'}-${currentMainImage}`}
          src={currentMainImage}
          alt={`${product.name} - ${selectedColor || 'OLIVE'} Color`}
          className="w-full h-full"
          priority={true}
          productId={product.id}
        />
      </motion.div>

      {/* Thumbnails: colors + guide */}
      <div className="flex flex-col gap-3">
        <div className="text-center">
          <span className="text-sm text-muted-foreground">Product Gallery</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {product.colors?.map((color) => (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 touch-manipulation ${
                selectedColor === color ? 'ring-2 ring-primary scale-105' : 'hover:scale-105 opacity-70 hover:opacity-100 active:scale-95'
              }`}
            >
              <ProductImage
                src={getColorSpecificImage(color)}
                alt={`${product.name} - ${color} Color`}
                className="object-cover"
                productId={product.id}
              />
            </button>
          ))}

          {/* Guide thumbnail */}
          <button
            onClick={handleGuideClick}
            className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 touch-manipulation ${
              isViewingGuide ? 'ring-2 ring-primary scale-105' : 'hover:scale-105 opacity-70 hover:opacity-100 active:scale-95'
            }`}
          >
            <ProductImage
              src={miniImages.GUIDE}
              alt={`${product.name} - Usage Guide`}
              className="object-cover"
              productId={product.id}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

// Bonnet Image Gallery Component - Simplified
const BonnetImageGallery = ({ product, selectedColor, onColorSelect }: { product: Product; selectedColor: string; onColorSelect: (color: string) => void }) => {
  // Import images for Bonnet product
  const bonnetImages = [
    new URL('../assets/Heatless Hair Curling Rod/product6/candy&marchmello.webp', import.meta.url).href,
    new URL('../assets/Heatless Hair Curling Rod/product6/latte&marchmello.webp4.webp', import.meta.url).href,
    new URL('../assets/Heatless Hair Curling Rod/product6/olive&latte.webp4.webp', import.meta.url).href,
  ];

  // Color-specific image mapping
  const getColorSpecificImage = (color: string) => {
    const colorImageMap = {
      'CANDY & MARSHMALLOW': bonnetImages[0],
      'LATTE & MARSHMALLOW': bonnetImages[1],
      'OLIVE & LATTE': bonnetImages[2],
    };
    return colorImageMap[color as keyof typeof colorImageMap] || bonnetImages[0];
  };

  // Get the current main image based on selected color
  const currentMainImage = selectedColor ? getColorSpecificImage(selectedColor) : bonnetImages[0];

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <motion.div
        className="relative aspect-square rounded-lg overflow-hidden bg-muted"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ProductImage
          key={`${selectedColor}-${currentMainImage}`}
          src={currentMainImage}
          alt={`${product.name} - ${selectedColor} Color`}
          className="w-full h-full"
          priority={true}
          productId={product.id}
        />
      </motion.div>

      {/* Thumbnail Gallery - show all color images */}
      {product.colors && product.colors.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {product.colors.map((color, index) => (
            <button
              key={color}
              onClick={() => onColorSelect(color)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                selectedColor === color
                  ? 'border-primary shadow-lg'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
            >
              <img
                src={getColorSpecificImage(color)}
                alt={`${product.name} - ${color} color preview`}
          className="w-full h-full object-cover"
              />
              
              {selectedColor === color && (
                <div className="absolute inset-0 bg-primary/20" />
              )}
            </button>
          ))}
        </div>
      )}

    </div>
  );
};

// Short Set Image Gallery Component - for DreamCurl Short Set
const ShortSetImageGallery = ({ product, selectedColor, onColorSelect }: { product: Product; selectedColor: string; onColorSelect: (color: string) => void }) => {
  // Import images for Short Set product (4 images mapped to 4 colors)
  const shortSetImages = [
    new URL('../assets/Heatless Hair Curling Rod/product-1.webp', import.meta.url).href, // Rose Gold
    new URL('../assets/Heatless Hair Curling Rod/product-2.webp', import.meta.url).href, // Royal Purple
    new URL('../assets/Heatless Hair Curling Rod/product-3.webp', import.meta.url).href, // Olive Lux
    new URL('../assets/Heatless Hair Curling Rod/product-4.webp', import.meta.url).href, // Earl Grey
  ];

  // Color-specific image mapping
  const getColorSpecificImage = (color: string) => {
    const colorImageMap = {
      'Rose Gold': shortSetImages[0],     // product-1.webp
      'Royal Purple': shortSetImages[1],  // product-2.webp
      'Olive Lux': shortSetImages[2],     // product-3.webp
      'Earl Grey': shortSetImages[3],     // product-4.webp
    };
    return colorImageMap[color as keyof typeof colorImageMap] || shortSetImages[0];
  };

  // Get the current main image based on selected color
  const currentMainImage = selectedColor ? getColorSpecificImage(selectedColor) : getColorSpecificImage('Rose Gold');

  return (
    <div className="space-y-4">
      {/* Simple Main Image Display */}
      <motion.div
        className="relative aspect-square rounded-lg overflow-hidden bg-muted"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ProductImage
          key={`${selectedColor}-${currentMainImage}`}
          src={currentMainImage}
          alt={`${product.name} - ${selectedColor} Color`}
          className="w-full h-full"
          priority={true}
          productId={product.id}
        />
      </motion.div>

      {/* Thumbnail Gallery (original photos) */}
      {product.colors && product.colors.length > 0 && (
      <div className="space-y-4">
        <div className="text-center">
          <span className="text-sm text-muted-foreground">Available Colors</span>
        </div>
          <div className="grid grid-cols-4 gap-2">
            {product.colors.map((color, index) => (
            <motion.button
              key={color}
              onClick={() => onColorSelect(color)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                selectedColor === color
                  ? 'border-primary shadow-lg'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
                <ProductImage
                src={getColorSpecificImage(color)}
                alt={`${product.name} - ${color} color preview`}
                  className="w-full h-full"
                  productId={product.id}
                />
              {selectedColor === color && (
                <div className="absolute inset-0 bg-primary/20" />
              )}
            </motion.button>
          ))}
        </div>
      </div>
      )}
    </div>
  );
};

// Curly-clip-5 Image Gallery with Short Set style color boxes
const CurlyClip5ImageGallery = ({ product, selectedColor, onColorSelect }: { product: Product; selectedColor: string; onColorSelect: (color: string) => void }) => {
  // Map exact option keys to images
  const colorToImage: Record<string, string> = {
    'candy&marchmello': new URL('../assets/curly hair collection/product5/candy&marchmello.webp', import.meta.url).href,
    'olive&latte': new URL('../assets/curly hair collection/product5/olive&latte.webp4.webp', import.meta.url).href,
  };

  const availableColors = ['candy&marchmello', 'olive&latte'];
  const current = selectedColor && colorToImage[selectedColor] ? selectedColor : availableColors[0];
  const currentImage = colorToImage[current];

  // Ensure a default selection is visible in the UI
  useEffect(() => {
    if (!selectedColor) {
      onColorSelect(current);
    }
  }, [selectedColor, current, onColorSelect]);

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <motion.div
        className="relative aspect-square rounded-lg overflow-hidden bg-muted"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ProductImage
          key={`${current}-${currentImage}`}
          src={currentImage}
          alt={`${product.name} - ${current}`}
          className="w-full h-full"
          priority={true}
          productId={product.id}
        />
      </motion.div>

      {/* Color Boxes - styled like Short Set */}
      <div className="space-y-4">
        <div className="text-center">
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">COLOUR</span>
          {current && (
            <span className="ml-2 text-sm text-primary font-medium">Selected: {current}</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {availableColors.map((color, index) => (
            <motion.button
              key={color}
              onClick={() => onColorSelect(color)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                current === color ? 'border-primary shadow-lg' : 'border-gray-200 hover:border-primary/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <img
                src={colorToImage[color]}
                alt={`${product.name} - ${color}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/placeholder-thumbnail.jpg';
                }}
              />
              {current === color && (
                <div className="absolute inset-0 bg-primary/20" />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Midi Image Gallery Component - for DreamCurl Midi
const MidiImageGallery = ({ product, selectedColor, onColorSelect }: { product: Product; selectedColor: string; onColorSelect: (color: string) => void }) => {
  // State to track if guide image is being viewed
  const [isViewingGuide, setIsViewingGuide] = useState(false);

  // Import images for Midi product (4 color images + 1 guide image)
  const midiColorImages = [
    new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_candy.webp', import.meta.url).href,        // CANDY
    new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_latte.webp', import.meta.url).href,        // LATTE
    new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_purple.webp', import.meta.url).href,       // MULBERRY
    new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_olive.webp', import.meta.url).href,        // OLIVE
  ];

  const guideImage = new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_guide.webp', import.meta.url).href;

  // Color-specific image mapping
  const getColorSpecificImage = (color: string) => {
    const colorImageMap = {
      'CANDY': midiColorImages[0],         // midi_candy.webp
      'LATTE': midiColorImages[1],         // midi_latte.webp
      'MULBERRY': midiColorImages[2],      // midi_purple.webp
      'OLIVE': midiColorImages[3],         // midi_olive.webp
    };
    return colorImageMap[color as keyof typeof colorImageMap] || midiColorImages[2]; // Default to MULBERRY
  };

  // Get the current main image based on selected color or guide view
  const currentMainImage = isViewingGuide 
    ? guideImage 
    : selectedColor 
      ? getColorSpecificImage(selectedColor) 
      : getColorSpecificImage('MULBERRY');

  // Handle clicking on guide image
  const handleGuideClick = () => {
    setIsViewingGuide(true);
  };

  // Handle clicking on color image
  const handleColorClick = (color: string) => {
    setIsViewingGuide(false);
    onColorSelect(color);
  };

  return (
    <div className="space-y-4">
      {/* Simple Main Image Display */}
      <motion.div
        className="relative aspect-square rounded-lg overflow-hidden bg-muted"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ProductImage
          key={`${isViewingGuide ? 'guide' : selectedColor}-${currentMainImage}`}
          src={currentMainImage}
          alt={isViewingGuide ? `${product.name} - Usage Guide` : `${product.name} - ${selectedColor} Color`}
          className="w-full h-full"
          priority={true}
          productId={product.id}
        />
      </motion.div>

      {/* Thumbnail Gallery - show all images (colors + guide) */}
      <div className="flex flex-col gap-3">
        <div className="text-center">
          <span className="text-sm text-muted-foreground">Product Gallery</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {/* Color thumbnails */}
          {product.colors && product.colors.map((color, index) => (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 touch-manipulation ${
                selectedColor === color 
                  ? 'ring-2 ring-primary scale-105' 
                  : 'hover:scale-105 opacity-70 hover:opacity-100 active:scale-95'
              }`}
            >
              <ProductImage
                src={getColorSpecificImage(color)}
                alt={`${product.name} - ${color} Color`}
                className="object-cover"
                productId={product.id}
              />
            </button>
          ))}
          
          {/* Guide image */}
          <button
            onClick={handleGuideClick}
            className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 touch-manipulation ${
              isViewingGuide
                ? 'ring-2 ring-primary scale-105'
                : 'hover:scale-105 opacity-70 hover:opacity-100 active:scale-95'
            }`}
          >
            <ProductImage
              src={guideImage}
              alt={`${product.name} - Usage Guide`}
              className="object-cover"
              productId={product.id}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

// Jumbo Image Gallery Component - for DreamCurl JUMBO SIZE
const JumboImageGallery = ({ product, selectedColor, onColorSelect }: { product: Product; selectedColor: string; onColorSelect: (color: string) => void }) => {
  // State to track if guide image is being viewed
  const [isViewingGuide, setIsViewingGuide] = useState(false);

  // Import images for Jumbo product (4 color images + 1 guide image)
  const jumboColorImages = [
    new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/latte_jumbo.webp', import.meta.url).href,        // LATTE
    new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/candy_jumbo.webp', import.meta.url).href,        // CANDY
    new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/olive_jumbo.webp4.webp', import.meta.url).href,  // OLIVE
    new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/purple_jumbo.webp', import.meta.url).href,       // MULBERRY
  ];

  const guideImage = new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/guide.webp', import.meta.url).href;

  // Color-specific image mapping
  const getColorSpecificImage = (color: string) => {
    const colorImageMap = {
      'LATTE': jumboColorImages[0],         // latte_jumbo.webp
      'CANDY': jumboColorImages[1],         // candy_jumbo.webp
      'OLIVE': jumboColorImages[2],         // olive_jumbo.webp4.webp
      'MULBERRY': jumboColorImages[3],      // purple_jumbo.webp
    };
    return colorImageMap[color as keyof typeof colorImageMap] || jumboColorImages[0]; // Default to LATTE
  };

  // Get the current main image based on selected color or guide view
  const currentMainImage = isViewingGuide 
    ? guideImage 
    : selectedColor 
      ? getColorSpecificImage(selectedColor) 
      : getColorSpecificImage('LATTE');

  // Handle clicking on guide image
  const handleGuideClick = () => {
    setIsViewingGuide(true);
  };

  // Handle clicking on color image
  const handleColorClick = (color: string) => {
    setIsViewingGuide(false);
    onColorSelect(color);
  };

  return (
    <div className="space-y-4">
      {/* Simple Main Image Display */}
      <motion.div
        className="relative aspect-square rounded-lg overflow-hidden bg-muted"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ProductImage
          key={`${isViewingGuide ? 'guide' : selectedColor}-${currentMainImage}`}
          src={currentMainImage}
          alt={isViewingGuide ? `${product.name} - Usage Guide` : `${product.name} - ${selectedColor} Color`}
          className="w-full h-full"
          priority={true}
          productId={product.id}
        />
      </motion.div>

      {/* Thumbnail Gallery - show all images (colors + guide) */}
      <div className="flex flex-col gap-3">
        <div className="text-center">
          <span className="text-sm text-muted-foreground">Product Gallery</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {/* Color thumbnails */}
          {product.colors && product.colors.map((color, index) => (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 touch-manipulation ${
                selectedColor === color 
                  ? 'ring-2 ring-primary scale-105' 
                  : 'hover:scale-105 opacity-70 hover:opacity-100 active:scale-95'
              }`}
            >
              <ProductImage
                src={getColorSpecificImage(color)}
                alt={`${product.name} - ${color} Color`}
                className="object-cover"
                productId={product.id}
              />
            </button>
          ))}
          
          {/* Guide image */}
          <button
            onClick={() => setIsViewingGuide(true)}
            className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 touch-manipulation ${
            isViewingGuide
                ? 'ring-2 ring-primary scale-105'
                : 'hover:scale-105 opacity-70 hover:opacity-100 active:scale-95'
            }`}
          >
            <ProductImage
            src={guideImage}
              alt={`${product.name} - Usage Guide`}
              className="object-cover"
              productId={product.id}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

// SongMay Hair Clips Image Gallery Component
const SongMayImageGallery = ({ product, selectedColor, onColorSelect }: { product: Product; selectedColor: string; onColorSelect: (color: string) => void }) => {
  // Import all images for SongMay Hair Clips
  const songMayImages = [
    new URL('../assets/curly hair collection/product4/SongMay Woman Hair Clips.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product4/gold.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product4/print.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product4/clip.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product4/gold2.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/product4/placeholder.jpg', import.meta.url).href,
  ];

  // Track which image is currently shown in the big container
  const [songMayMainIndex, setSongMayMainIndex] = useState(0);

  // When a color is selected, auto-switch the main image to that color's photo
  useEffect(() => {
    if (!selectedColor) return;
    const target = selectedColor.toLowerCase() === 'gold' ? 'gold2.jpg' : 'print.jpg';
    const idx = songMayImages.findIndex(src => src.includes(target));
    if (idx >= 0) setSongMayMainIndex(idx);
  }, [selectedColor]);

  // Get the current main image based on selected index
  const currentMainImage = songMayImages[songMayMainIndex];

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <motion.div
        className="relative aspect-square rounded-lg overflow-hidden bg-muted"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ProductImage
          key={`${songMayMainIndex}-${currentMainImage}`}
          src={currentMainImage}
          alt={`${product.name} - ${selectedColor || 'Default'} Color`}
          className="w-full h-full object-contain"
          priority={true}
          productId={product.id}
        />
      </motion.div>

      {/* Thumbnail Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-base font-semibold">More Photos</h4>
          <span className="text-sm text-muted-foreground">Product Gallery</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
          {songMayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setSongMayMainIndex(index);
              }}
              className={`relative aspect-square rounded-xl overflow-hidden border transition-all duration-200 shadow-sm ${
                songMayMainIndex === index
                  ? 'border-primary/80 ring-1 ring-primary/20'
                  : 'border-gray-200 hover:border-primary/40'
              }`}
            >
              <ProductImage
                src={image}
                alt={`${product.name} - Image ${index + 1}`}
                className="w-full h-full object-cover"
                productId={product.id}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Frequently Bought Together Section - LIMITED TIME OFFER | STARTER KIT Style
const FrequentlyBoughtTogetherSection = ({ product }: { product: Product }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();
  const [selectedColor, setSelectedColor] = useState("MULBERRY");
  const [selectedProducts, setSelectedProducts] = useState({
    "dreamcurl-short-set": true,
    "curlea-comb": true,
    "curly-clip-1": true
  });
  
  // Define bundle products with real color options
  const bundleProducts = [
    {
      id: "dreamcurl-short-set",
      name: "DREAMCURL SHORT SET - ORIGINAL SIZE",
      price: "$16.99",
      image: new URL('../assets/Heatless Hair Curling Rod/product-1.webp', import.meta.url).href,
      hasColorOptions: true,
      colors: [
        { name: "MULBERRY", image: new URL('../assets/Heatless Hair Curling Rod/product-1.webp', import.meta.url).href },
        { name: "ROSE GOLD", image: new URL('../assets/Heatless Hair Curling Rod/product-2.webp', import.meta.url).href },
        { name: "OLIVE LUX", image: new URL('../assets/Heatless Hair Curling Rod/product-3.webp', import.meta.url).href },
        { name: "EARL GREY", image: new URL('../assets/Heatless Hair Curling Rod/product-4.webp', import.meta.url).href }
      ]
    },
    {
      id: "curlea-comb",
      name: "CURLEA COMB - PROFESSIONAL STYLING",
      price: "$2.99",
      image: new URL('../assets/curly hair collection/product7/product7.webp', import.meta.url).href,
      hasColorOptions: false
    },
    {
      id: "curly-clip-1",
      name: "CURVED RESIN HAIR CLIP - DUCKBILL GRIP",
      price: "$14.99",
      image: new URL('../assets/curly hair collection/product1/p1.jpg', import.meta.url).href,
      hasColorOptions: false
    }
  ];

  // Calculate pricing based on selected products
  const selectedProductIds = Object.keys(selectedProducts).filter(id => selectedProducts[id]);
  const selectedCount = selectedProductIds.length;
  
  // Calculate total price before discount
  const totalPrice = selectedProductIds.reduce((sum, id) => {
    const product = bundleProducts.find(p => p.id === id);
    if (!product) return sum;
    // Remove $ and parse price
    const priceValue = parseFloat(product.price.replace('$', ''));
    return sum + priceValue;
  }, 0);
  
  // Apply tiered discounts: 3 products = 25%, 2 products = 10%, 1 product = 0%
  let discountPercent = 0;
  if (selectedCount === 3) {
    discountPercent = 25;
  } else if (selectedCount === 2) {
    discountPercent = 10;
  }
  
  const discountMultiplier = 1 - (discountPercent / 100);
  const bundlePrice = totalPrice * discountMultiplier;
  const savings = totalPrice - bundlePrice;

  // Get selected product image based on color
  const getSelectedProductImage = (productId: string) => {
    if (productId === "dreamcurl-short-set") {
      const product = bundleProducts.find(p => p.id === productId);
      const colorOption = product?.colors?.find(c => c.name === selectedColor);
      return colorOption?.image || product?.image;
    }
    const product = bundleProducts.find(p => p.id === productId);
    return product?.image;
  };

  // Handle checkbox toggle
  const handleCheckboxToggle = (productId: string) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Handle add to cart
  const handleAddToCart = () => {
    selectedProductIds.forEach(productId => {
      const product = bundleProducts.find(p => p.id === productId);
      if (product) {
        // no-op: replaced below with bundle item
      }
    });
    // Add a single bundle item to cart with 3 images and USD pricing
    const images = selectedProductIds.map(pid => getSelectedProductImage(pid)).slice(0, 3);
    addToCart({
      id: `limited-offer-bundle`,
      name: 'Limited Time Offer  Starter Kit',
      price: `$${bundlePrice.toFixed(2)}`,
      originalPrice: `$${totalPrice.toFixed(2)}`,
      image: images[0] || bundleProducts[0].image,
      images,
      isBundle: true,
      selectedColor: selectedColor, // differentiate bundles by DreamCurl color
    });
    openCart();
  };

  return (
    <motion.section
      ref={ref}
      className="py-16 px-6 bg-gradient-to-b from-amber-50/40 via-background to-background"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
    >
      <motion.div
        className="max-w-3xl mx-auto p-6 bg-white/95 backdrop-blur rounded-2xl text-center font-sans shadow-[0_20px_60px_-20px_rgba(255,165,0,0.45)] ring-1 ring-amber-200 relative overflow-hidden"
        initial={{ y: 32, scale: 0.96, opacity: 0 }}
        animate={isInView ? { y: 0, scale: 1, opacity: 1 } : {}}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        whileHover={{ y: -2 }}
      >
        {/* subtle animated glow */}
        <motion.div
          className="pointer-events-none absolute -inset-1 rounded-[1.25rem]"
          style={{ background: 'radial-gradient(1200px 300px at 50% 0%, rgba(251,191,36,0.15), transparent 60%)' }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        {/* Title */}
        <motion.h2 
          className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 700 }}
        >
          LIMITED TIME OFFER  STARTER KIT
        </motion.h2>
        <div className="flex items-center justify-center gap-2 mb-6">
          {selectedCount > 1 && (
            <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 ring-1 ring-amber-200">
              Save {discountPercent}% today
            </span>
          )}
          <span className="inline-flex items-center rounded-full bg-rose-100 text-rose-700 text-xs font-medium px-3 py-1 ring-1 ring-rose-200">
            While supplies last
          </span>
        </div>

        {/* Color selector for DreamCurl Short Set */}
        {selectedProducts['dreamcurl-short-set'] && (
          <motion.div
            className="mb-5 flex items-center justify-center gap-2 flex-wrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            {(bundleProducts.find(p => p.id === 'dreamcurl-short-set')?.colors || []).map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedColor(c.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedColor === c.name ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-900 border-gray-300 hover:border-gray-500'
                }`}
              >
                {c.name.replace(/_/g, ' ')}
              </button>
            ))}
          </motion.div>
        )}

        {/* Images row */}
        <motion.div 
          className="flex items-center justify-center gap-6 mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {selectedProductIds.map((productId, index) => {
            const product = bundleProducts.find(p => p.id === productId);
            if (!product) return null;
            
            return (
              <div key={productId} className="flex items-center">
                <img 
                  src={getSelectedProductImage(productId)} 
                  alt={product.name} 
                  className="w-20 md:w-24 rounded-lg shadow-sm border border-gray-100" 
                />
                {index < selectedProductIds.length - 1 && (
                  <span className="text-2xl font-bold text-gray-500 ml-6">+</span>
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Pricing */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <p className="text-lg font-semibold text-gray-900">
            Bundle Today:{" "}
            <span className="text-rose-600 font-extrabold text-2xl">${bundlePrice.toFixed(2)}</span>
            {selectedCount > 1 && (
              <>
                {" "}
                <span className="line-through text-gray-400 text-base align-middle">${totalPrice.toFixed(2)}</span>
              </>
            )}
          </p>
          {selectedCount > 1 && (
            <p className="text-amber-700 text-sm font-semibold">
              You save ${savings.toFixed(2)} ({discountPercent}% off) with this bundle
            </p>
          )}
          {selectedCount === 1 && (
            <p className="text-gray-600 text-sm">Add more products to unlock bundle savings!</p>
          )}
        </motion.div>

        {/* Add to Cart */}
        <motion.button 
          className="group relative inline-flex items-center justify-center px-10 py-3 mb-8 rounded-full font-extrabold tracking-wide uppercase text-sm text-white focus:outline-none"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAddToCart}
          disabled={selectedProductIds.length === 0}
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 700 }}
        >
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
          <span className="absolute -inset-[2px] rounded-full bg-gradient-to-r from-amber-400/40 to-rose-400/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative z-10 flex items-center gap-2">
            Add to Cart
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
          </span>
        </motion.button>

        {/* Items breakdown */}
        <motion.div 
          className="mt-8 text-left space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          {bundleProducts.map((product, index) => (
            <div key={product.id}>
              {/* Item */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-t border-gray-200 pt-4">
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    checked={selectedProducts[product.id]}
                    onChange={() => handleCheckboxToggle(product.id)}
                    className="w-5 h-5 accent-gray-900 cursor-pointer" 
                  />
                  <span className="font-semibold text-gray-900 text-sm md:text-base" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>
                    {product.name}
                  </span>
                </div>
                <span className="text-gray-700 font-medium text-sm md:text-base" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 500 }}>
                  {product.price}
                </span>
              </div>
              
              {/* Color options for DreamCurl Short Set */}
              {product.hasColorOptions && selectedProducts[product.id] && (
                <div className="ml-8 mt-3">
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="border-2 border-gray-300 rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 500 }}
                  >
                    {product.colors?.map(color => (
                      <option key={color.name} value={color.name}>{color.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

// Real Results Community Section - REMOVED
const RealResultsSection = ({ product }: { product: Product }) => {
};

// Universal Usage Steps Component
const UsageStepsSection = ({ product }: { product: Product }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (!product.usageSteps) return null;

  // Get appropriate title and subtitle based on product
  const getTitle = () => {
    if (product.id === 'heatless-5') return "How to Use BUN BONS";
    if (product.id === 'heatless-6') return "How to Use Your Bonnet";
    if (product.id.startsWith('dreamcurl-')) return `How to Use ${product.name}`;
    if (product.id.startsWith('curly-')) return `How to Use ${product.name}`;
    return `How to Use ${product.name}`;
  };

  const getSubtitle = () => {
    if (product.id === 'heatless-5') return "Follow these simple steps to achieve beautiful, blowout-style waves with your BUN BONS heatless curling system.";
    if (product.id === 'heatless-6') return "Follow these simple steps to protect and preserve your hairstyle overnight with maximum comfort.";
    if (product.id.startsWith('dreamcurl-')) return "Follow these simple steps to achieve gorgeous, heat-free curls overnight.";
    return "Follow these simple steps to get the best results from your product.";
  };

  return (
    <motion.section
      ref={ref}
      className="relative py-24 px-6 bg-gradient-to-b from-muted/20 to-background"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            {getTitle()}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {getSubtitle()}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {product.usageSteps.map((step, index) => (
            <motion.div
              key={index}
              className="relative p-4 sm:p-6 bg-white/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <motion.div
                  className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm sm:text-base lg:text-lg shadow-lg"
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ delay: 0.1 * index + 0.2, type: "spring", stiffness: 200 }}
                >
                  {index + 1}
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm sm:text-base leading-relaxed text-foreground/90">{step}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p className="text-sm text-muted-foreground">
            ?? Tip: For best results, always follow the recommended wait time and handle your hair gently
          </p>
        </motion.div>
                </div>
    </motion.section>
  );
};

// DreamCurl Image Gallery Component
const DreamCurlImageGallery = ({ 
  product, 
  selectedColor, 
  onColorSelect 
}: { 
  product: Product; 
  selectedColor: string; 
  onColorSelect: (color: string) => void;
}) => {
  const [isViewingExtra, setIsViewingExtra] = useState(false);
  
  // Reset extra view when selectedColor changes (from color buttons)
  useEffect(() => {
    if (selectedColor) {
      setIsViewingExtra(false);
    }
  }, [selectedColor]);
  
  // All images for DreamCurl Original
  const dreamCurlImages = [
    new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/CFE0DE6D-F7E6-42F3-91A4-16C049F5ADA9.webp', import.meta.url).href,
    new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_3b575993-8e6a-413e-9f88-d95395c19980.webp', import.meta.url).href,
    new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_686ff861-b01d-41ef-9c4c-0684df944cd6.webp', import.meta.url).href,
    new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_bf658774-aed4-4c4a-be42-ef9707a47f3e.webp', import.meta.url).href,
    new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/IMG-3641.webp', import.meta.url).href,
  ];

  // Color-specific image mapping
  const getColorSpecificImage = (color: string) => {
    const colorImageMap = {
      'Mulberry': dreamCurlImages[1],
      'Candy': dreamCurlImages[2],
      'Latte': dreamCurlImages[3],
      'Olive': dreamCurlImages[0],
    };
    return colorImageMap[color as keyof typeof colorImageMap] || dreamCurlImages[0];
  };

  // Get the current main image based on selected color or extra image toggle
  const currentMainImage = isViewingExtra
    ? dreamCurlImages[4]
    : (selectedColor ? getColorSpecificImage(selectedColor) : dreamCurlImages[0]);

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <motion.div
        className="relative aspect-square rounded-lg overflow-hidden bg-muted"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ProductImage
          key={`${selectedColor}-${currentMainImage}`}
          src={currentMainImage}
          alt={`${product.name} - ${selectedColor || 'View'} Color`}
          className="w-full h-full object-contain"
          priority={true}
          productId={product.id}
        />
        
        {/* Navigation Arrows - always available */}
        {product.colors && product.colors.length > 1 && (
          <>
            <button
              onClick={() => {
                setIsViewingExtra(false);
                const currentIndex = selectedColor 
                  ? product.colors!.indexOf(selectedColor)
                  : 0;
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : product.colors!.length - 1;
                const prevColor = product.colors![prevIndex];
                onColorSelect(prevColor);
                // setSelectedImageIndex(prevIndex);
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-black/70 active:bg-black/80 transition-colors touch-manipulation"
              aria-label="Previous color"
            >
              <span className="text-lg sm:text-xl"></span>
            </button>
            <button
              onClick={() => {
                setIsViewingExtra(false);
                const currentIndex = selectedColor 
                  ? product.colors!.indexOf(selectedColor)
                  : 0;
                const nextIndex = currentIndex < product.colors!.length - 1 ? currentIndex + 1 : 0;
                const nextColor = product.colors![nextIndex];
                onColorSelect(nextColor);
                // setSelectedImageIndex(nextIndex);
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-black/70 active:bg-black/80 transition-colors touch-manipulation"
              aria-label="Next color"
            >
              <span className="text-lg sm:text-xl"></span>
            </button>
          </>
        )}
      </motion.div>

      {/* Thumbnail Gallery - show all color-specific images + guide image */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {/* Color thumbnails */}
        {product.colors && product.colors.map((color, index) => (
          <button
            key={color}
            onClick={() => {
              // Update both color selection and image index when clicking thumbnail
              setIsViewingExtra(false);
              onColorSelect(color);
            }}
            className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 touch-manipulation ${
              selectedColor === color 
                ? 'ring-2 ring-primary scale-105' 
                : 'hover:scale-105 opacity-70 hover:opacity-100 active:scale-95'
            }`}
          >
            <OptimizedImage
              src={getColorSpecificImage(color)}
              alt={`${product.name} - ${color} Color`}
              className="object-cover"
              // placeholderSrc={placeholderImage}
              priority={index < 2}
              onError={(e) => {
                console.error(`Failed to load color image: ${color}`);
                if (e.currentTarget) {
                  e.currentTarget.src = dreamCurlImages[0];
                }
              }}
            />
          </button>
        ))}
        
        {/* Guide image */}
          <button
            onClick={() => setIsViewingExtra(true)}
            className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 touch-manipulation ${
              isViewingExtra
                ? 'ring-2 ring-primary scale-105'
                : 'hover:scale-105 opacity-70 hover:opacity-100 active:scale-95'
            }`}
        >
          <OptimizedImage
            src={dreamCurlImages[4]}
            alt={`${product.name} - Usage Guide`}
            className="object-cover"
            // placeholderSrc={placeholderImage}
            priority={false}
            onError={(e) => {
              console.error(`Failed to load guide image`);
              if (e.currentTarget) {
                e.currentTarget.src = product.images?.[0] || '';
              }
            }}
          />
        </button>
              </div>
                </div>
  );
};

// Hair Clip Image Gallery Component - for Curved Resin Hair Clip
const HairClipImageGallery = ({ product, selectedSize, setSelectedSize }: { product: Product; selectedSize: string; setSelectedSize: (size: string) => void }) => {
  // Get the current image based on selected size
  const getCurrentImage = () => {
    if (selectedSize && product.sizeOptions && product.sizeOptions[selectedSize]) {
      return product.sizeOptions[selectedSize].image;
    }
    return product.image; // Default to main product image
  };

  // Get the current piece count based on selected size
  const getCurrentPieceCount = () => {
    if (selectedSize && product.sizeOptions && product.sizeOptions[selectedSize]) {
      const sizeKey = selectedSize.toLowerCase();
      if (sizeKey.includes('9-piece')) return '9';
      if (sizeKey.includes('4-piece')) return '4';
    }
    return '9'; // Default to 9 pieces
  };

  return (
    <div className="relative">
      <motion.div
        key={`hairclip-main-${selectedSize || 'default'}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <ProductImage
          src={getCurrentImage()}
          alt={product.name}
          className="w-full h-auto rounded-lg"
          priority={true}
          productId={product.id}
        />
      </motion.div>
      
      {/* Size Options Thumbnails */}
      {product.sizeOptions && (
        <div className="mt-4">
          <span className="text-xs text-muted-foreground mb-2 block">Select Set</span>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(product.sizeOptions).map(([sizeKey, sizeOption]) => (
              <motion.button
                key={sizeKey}
                onClick={() => setSelectedSize(sizeKey)}
                className={`relative aspect-square rounded-md overflow-hidden border transition-all duration-150 ${
                  selectedSize === sizeKey
                    ? 'border-primary ring-1 ring-primary/30'
                    : 'border-gray-200 hover:border-primary/40'
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <img
                  src={sizeOption.image}
                  alt={`${product.name} - ${sizeKey}`}
                  className="w-full h-full object-cover"
                />
                {selectedSize === sizeKey && (
                  <div className="absolute inset-0 bg-primary/15" />
                )}
              </motion.button>
            ))}
              </div>
                </div>
      )}
              </div>
  );
};

// Hair Accessories in Action Section - for curly-clip-5 product
const HairAccessoriesInActionSection = ({ product }: { product: Product }) => {
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-200px" }); // Improved loading margin
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);

  // Video event handlers
  const handleVideoLoad = () => {
    setIsVideoLoading(false);
    setVideoLoaded(true);
    setVideoError(false);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    // Only log if it's an actual video element error, not source element error
    if (e.target instanceof HTMLVideoElement) {
      console.warn('Video loading error:', e);
      setIsVideoLoading(false);
      setVideoError(true);
      setVideoLoaded(false);
      
      // Multiple retry attempts with increasing delays
      const retryVideo = (attempt: number = 1, maxAttempts: number = 3) => {
        if (attempt > maxAttempts) {
          console.error(`Failed to load video after ${maxAttempts} attempts`);
          return;
        }
        
        const delay = attempt * 1500; // Increase delay with each attempt
        setTimeout(() => {
          if (videoRef.current) {
            console.log(`Retry attempt ${attempt}/${maxAttempts} for Hair Accessories video`);
            
            // Reset video element
            videoRef.current.pause();
            videoRef.current.removeAttribute('src');
            videoRef.current.load();
            
            // Set source again
            const sources = videoRef.current.querySelectorAll('source');
            sources.forEach((source, index) => {
              if (index === 0) {
                source.src = new URL('../assets/curly hair collection/product5/Screen Recording 2025-10-06 223323.mp4', import.meta.url).href;
              }
            });
            videoRef.current.load();
            
            // If still fails, try next attempt
            videoRef.current.onerror = () => retryVideo(attempt + 1, maxAttempts);
          }
        }, delay);
      };
      
      retryVideo();
    }
    // Silently ignore source element errors as they're handled by fallback sources
  };

  const handleVideoCanPlay = () => {
    setIsVideoLoading(false);
    setVideoLoaded(true);
  };

  const handleVideoLoadStart = () => {
    setIsVideoLoading(true);
    setVideoError(false);
  };

  const handleVideoPlay = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
      setIsVideoPlaying(true);
    }
  };

  const handleVideoPause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  // Simplified video loading when section comes into view
  useEffect(() => {
    if (isInView && videoRef.current && !loadAttempted) {
      setLoadAttempted(true);
      
      const video = videoRef.current;
      
      // Simple and reliable loading strategy
      video.preload = 'auto';
      video.load();
      
      // Wait for video to be ready
      const handleCanPlayThrough = () => {
        setIsVideoLoading(false);
        setVideoLoaded(true);
        
        // Try to play the video
        video.play()
          .then(() => {
            setIsVideoPlaying(true);
            console.log('Hair Accessories video autoplay successful');
          })
          .catch((error) => {
            if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
              console.warn('Autoplay prevented for Hair Accessories video:', error);
            }
            setIsVideoPlaying(false);
            setIsVideoLoading(false);
          });
      };
      
      // Set a timeout to hide loading state even if video doesn't fully load
      const loadingTimeout = setTimeout(() => {
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA or better
          setIsVideoLoading(false);
        }
      }, 3000); // Hide loading after 3 seconds max
      
      video.addEventListener('canplaythrough', handleCanPlayThrough);
      
      return () => {
        video.removeEventListener('canplaythrough', handleCanPlayThrough);
        clearTimeout(loadingTimeout);
      };
    }
  }, [isInView, loadAttempted]);

  return (
    <motion.section
      ref={ref}
      className="py-24 px-6 bg-gradient-to-b from-background to-muted/20"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Hair Accessories in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Watch how our premium hair claw clips transform your styling routine with effortless elegance and secure hold.
          </p>
        </motion.div>

        <motion.div
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-white/90 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="relative aspect-[16/10] min-h-[300px] sm:min-h-[400px] md:min-h-[500px]">
            {/* Video Element */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              preload="none"
              playsInline
              webkit-playsinline="true"
              x5-playsinline="true"
              disablePictureInPicture
              controlsList="nodownload noplaybackrate"
              muted
              loop
              onLoadStart={handleVideoLoadStart}
              onLoadedData={handleVideoLoad}
              onCanPlay={handleVideoCanPlay}
              onError={handleVideoError}
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
            >
              <source src={new URL('../assets/curly hair collection/product5/Screen Recording 2025-10-06 223323.mp4', import.meta.url).href} type="video/mp4" />
              <source src={new URL('../assets/curly hair collection/product5/Screen Recording 2025-10-06 223323.mp4', import.meta.url).href} type="video/webm" />
              <source src={new URL('../assets/curly hair collection/product5/Screen Recording 2025-10-06 223323.mp4', import.meta.url).href} type="video/ogg" />
              Your browser does not support the video tag.
            </video>

            {/* Loading Overlay */}
            {isVideoLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-lg">Loading video...</p>
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {videoError && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-center">
                  <p className="text-lg mb-4">Video failed to load</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Play Button Overlay */}
            {!isVideoPlaying && videoLoaded && !videoError && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <motion.button
                  onClick={handleVideoPlay}
                  className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-8 h-8 text-white ml-1" />
                </motion.button>
              </div>
            )}

            {/* Video Controls */}
            {videoLoaded && !videoError && (
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <p className="text-sm font-medium">Hair Accessories in Action</p>
                    <p className="text-xs opacity-80">Premium styling demonstration</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={isVideoPlaying ? handleVideoPause : handleVideoPlay}
                      className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
                    >
                      {isVideoPlaying ? (
                        <Pause className="w-4 h-4 text-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Experience the effortless styling power of our premium hair claw clips. 
            Perfect for securing hair in elegant updos, half-styles, and everyday looks with comfort and style.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ProductDetailPage;

