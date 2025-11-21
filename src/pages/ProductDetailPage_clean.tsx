import { motion, useInView, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { OptimizedImage } from "@/components/OptimizedImage";
import { ProductImage } from "@/components/ProductImage";
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
          'MULBERRY': new URL('../assets/Heatless Hair Curling Rod/product5/pppp1.webp', import.meta.url).href,
          'CANDY': new URL('../assets/Heatless Hair Curling Rod/product5/pppp2.webp', import.meta.url).href,
          'LATTE': new URL('../assets/Heatless Hair Curling Rod/product5/pppp3.webp', import.meta.url).href,
          'OLIVE': new URL('../assets/Heatless Hair Curling Rod/product5/pppp4.webp', import.meta.url).href,
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
      const price = parseFloat(item.price.replace('�', ''));
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
      const priceNumber = parseFloat(finalPrice.replace(/[^0-9.]/g, '')) || 0;
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
            if (document.referrer && window.history.length > 1) {
              window.history.back();
              return;
            }
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
                    <span className="line-through text-muted-foreground">�{(12.99 * quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                    <span>Bundle price:</span>
                    <span>�{(12.99 * quantity * 0.9).toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                    You save �{(12.99 * quantity * 0.1).toFixed(2)}!
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
                    � {(() => {
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
        className="mb-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Set</h3>
          <p className="text-sm text-gray-600">Select the perfect set size for your styling needs</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(product.sizeOptions).map(([sizeKey, sizeOption], index) => (
            <motion.button
              key={sizeKey}
              onClick={() => setSelectedSize(sizeKey)}
              className={`relative p-3 rounded-lg border transition-all duration-200 ${
                selectedSize === sizeKey
                  ? 'border-primary bg-primary/5 shadow'
                  : 'border-gray-200 bg-white hover:border-primary/40 hover:shadow-sm'
              }`}
              whileHover={{ 
                scale: 1.01,
                y: -1,
                transition: { duration: 0.15 }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.08 }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * index }}
            >
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={sizeOption.image}
                    alt={`${product.name} - ${sizeKey}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 capitalize">
                      {sizeKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <span className="text-base font-semibold text-primary">{sizeOption.price}</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-0.5">
                    {sizeOption.description.slice(0, 2).map((desc, idx) => (
                      <p key={idx}>{desc}</p>
                    ))}
                  </div>
                </div>
              </div>
              {/* Selected indicator */}
              {selectedSize === sizeKey && (
                <motion.div
                  className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
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

            {/* Add to Cart Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              className="w-full md:w-auto px-16 py-4 bg-primary text-primary-foreground font-semibold tracking-wide hover:bg-primary/90 transition-colors"
            >
              Add to Cart
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
            ) : product.id === 'curly-clip-1' || product.id === 'curly-clip-6' ? (
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

        {/* 1. The "Media Showcase" Section - Elegant video and image display */}
        <MediaShowcaseSection key={`media-${product.id}`} product={product} />

        {/* Usage Steps Section - for all products with usageSteps */}
        {product.usageSteps && (
          <UsageStepsSection key={`usage-${product.id}`} product={product} />
        )}

        {/* 3. The "Science & Soul" Ingredient Spotlight - Only for specific products */}
        {!product.id.startsWith('heatless-') && !product.id.startsWith('dreamcurl-') && !product.id.startsWith('curly-') && product.id !== 'curlea-comb' && product.id !== 'songmay-hair-clips' && product.id !== 'zero-heat-mini' && (
          <ScienceAndSoulSection key={`science-${product.id}`} product={product} />
        )}

        {/* 4. Real Results Community Section - using actual result photos */}
        <RealResultsSection key={`results-${product.id}`} product={product} />

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
                  Find the ideal DreamCurl� size for your hair length and desired curl style
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
      name: "DreamCurl� Original Set",
      price: "�39.99",
      image: new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/CFE0DE6D-F7E6-42F3-91A4-16C049F5ADA9.webp', import.meta.url).href,
      category: "DreamCurl� Collection",
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
      name: "DreamCurl� Short Set",
      price: "�24.99",
      image: product1Image,
      category: "DreamCurl� Collection",
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
      name: "DreamCurl� Midi",
      price: "�34.99",
      image: new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_purple.webp', import.meta.url).href,
      category: "DreamCurl� Collection",
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
      name: "DreamCurl� JUMBO SIZE",
      price: "�39.99",
      image: new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/latte_jumbo.webp', import.meta.url).href,
      category: "DreamCurl� Collection",
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
      price: "�24.99",
      image: new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-olive.webp', import.meta.url).href,
      category: "DreamCurl� Collection",
      hairType: "Short to Medium",
      featured: true,
      description: [
        "Our 'Zero Heat' Curling Rod is made out of the finest Peau De Soie fabric to help you achieve frizz-free shiny curls.",
        "The Zero Heat set includes:",
        "� 2 Scrunchies",
        "� 1 Curling Rod",
        "� 1 Hair Claw Clip",
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
      price: "�39.99",
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

// 1. The "Media Showcase" Section - Elegant video and image display
const MediaShowcaseSection = ({ product }: { product: Product }) => {
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<'left' | 'center' | 'right' | null>(null);

  // Get the video and images based on product
  const getMediaData = () => {
    const isHeatlessProduct = product.id.startsWith('heatless-');
    const isDreamCurlProduct = product.id.startsWith('dreamcurl-');
    const isCurlyHairProduct = product.id.startsWith('curly-') || product.id === 'curlea-comb';

    const specialVideo = product.video ? product.video :
      (isHeatlessProduct || isDreamCurlProduct || isCurlyHairProduct)
        ? product.id === 'dreamcurl-original' ? '/videos/dreamcurl-original-guide.mp4'
          : product.id === 'dreamcurl-midi' ? '/videos/dreamcurl-midi-guide.mp4'
          : product.id === 'dreamcurl-jumbo' ? '/videos/dreamcurl-jumbo-guide.mp4'
          : product.id === 'heatless-5' ? '/videos/bun-bons-guide.mp4'
          : product.id === 'heatless-6' ? '/videos/bonnet-guide.mp4'
          : '/videos/heatless-guide.mp4'
        : product.id === 'curly-clip-1' ? '/videos/hair-clips-guide.mp4'
          : product.id === 'curly-scarf-1' ? '/videos/satin-scarves-guide.mp4'
          : product.id === 'curly-claw-1' ? '/videos/claw-clips-guide.mp4'
          : product.id === 'curlea-comb' ? '/videos/curlea-comb-guide.mp4'
          : null;

    // Get images from product.images array
    const images = product.images || [product.image];
    const leftImage = images[0] || product.image;
    const rightImage = images[1] || images[0] || product.image;

    return { video: specialVideo, leftImage, rightImage };
  };

  const { video, leftImage, rightImage } = getMediaData();

  // Reset video state when product changes
  useEffect(() => {
    setIsVideoPlaying(false);
    setIsVideoLoading(true);
    setVideoError(false);
    setSelectedMedia(null);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.preload = 'none';
    }
  }, [product.id]);

  // Handle video loading when in view
  useEffect(() => {
    if (isInView && videoRef.current && video && selectedMedia === 'center') {
      videoRef.current.preload = 'auto';
      videoRef.current.load();
    }
  }, [isInView, video, selectedMedia]);

  const handleVideoLoad = () => {
    setIsVideoLoading(false);
    setVideoError(false);
  };

  const handleVideoError = () => {
    setIsVideoLoading(false);
    setVideoError(true);
  };

  const handleVideoPlay = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setIsVideoPlaying(true);
      } catch (error) {
        console.warn('Autoplay prevented:', error);
      }
    }
  };

  // If product has no video, show placeholder layout
  if (!video) {
    return (
      <motion.section
        ref={ref}
        className="relative py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-background via-muted/10 to-background"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Two images side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Left Image */}
            <motion.div
              className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
              onClick={() => setSelectedMedia('left')}
            >
              <OptimizedImage
                src={leftImage}
                alt={`${product.name} - View 1`}
                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                priority={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-sm font-medium">View Details</p>
                </div>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
              onClick={() => setSelectedMedia('right')}
            >
              <OptimizedImage
                src={rightImage}
                alt={`${product.name} - View 2`}
                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                priority={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-sm font-medium">View Details</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    );
  }

  // Video with two flanking images
  return (
    <motion.section
      ref={ref}
      className="relative py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-background via-muted/10 to-background"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Elegant 3-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Left Image */}
          <motion.div
            className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl group cursor-pointer order-3 md:order-1"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 30 }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.43, 0.13, 0.23, 0.96] }}
            onClick={() => setSelectedMedia('left')}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <OptimizedImage
              src={leftImage}
              alt={`${product.name} - View 1`}
              className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
              priority={true}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 text-white text-sm font-medium">
                Click to view
              </div>
            </div>
            <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </div>
          </motion.div>

          {/* Center Video */}
          <motion.div
            className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl group order-1 md:order-2"
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 40 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
            onMouseEnter={() => setSelectedMedia('center')}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              preload="none"
              playsInline
              muted
              loop
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
            >
              <source src={video} type="video/mp4" />
            </video>

            {/* Loading Overlay */}
            {isVideoLoading && (
              <motion.div
                className="absolute inset-0 bg-black/60 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full"
                />
              </motion.div>
            )}

            {/* Error Overlay */}
            {videoError && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="text-center text-white text-sm">
                  <p>Video unavailable</p>
                </div>
              </div>
            )}

            {/* Play Button */}
            {!isVideoPlaying && !isVideoLoading && !videoError && selectedMedia === 'center' && (
              <motion.div
                className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer"
                onClick={handleVideoPlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Play className="w-8 h-8 text-gray-900 ml-1" />
                </motion.div>
              </motion.div>
            )}

            {/* Video indicator */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white text-xs font-medium">Video</span>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl group cursor-pointer order-2 md:order-3"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 30 }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0.43, 0.13, 0.23, 0.96] }}
            onClick={() => setSelectedMedia('right')}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <OptimizedImage
              src={rightImage}
              alt={`${product.name} - View 2`}
              className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
              priority={true}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 text-white text-sm font-medium">
                Click to view
              </div>
            </div>
            <div className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </div>
          </motion.div>
        </div>
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
    8: new URL('../assets/hero-luxury-1.jpg', import.meta.url).href,
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
  ] : [];

  if (!isHeatlessProduct) {
    return null;
  }

  return (
    <motion.section
      ref={ref}
      className="py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-background to-muted/10"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How to Use Your {product.name}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Follow these simple steps to achieve beautiful, heat-free curls
          </p>
        </motion.div>

        <div className="grid gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className={`flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-card border ${
                activeStep === index ? 'border-primary shadow-lg' : 'border-border'
              }`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              onClick={() => setActiveStep(index)}
              style={{ cursor: 'pointer' }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    activeStep === index ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{step.description}</p>
              </div>
              <div className="md:w-64">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                  <OptimizedImage
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover"
                    productId={product.id}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

// 3. UsageStepsSection - for products with usage steps  
const UsageStepsSection = ({ product }: { product: Product }) => {
  if (!product.usageSteps || product.usageSteps.length === 0) {
    return null;
  }

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeStep, setActiveStep] = useState(0);

  return (
    <motion.section
      ref={ref}
      className="py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-muted/10 to-background"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How to Use Your {product.name}</h2>
          <p className="text-muted-foreground">Follow these simple steps for best results</p>
        </motion.div>

        <div className="space-y-4">
          {product.usageSteps.map((step, index) => (
            <motion.div
              key={index}
              className={`p-6 rounded-lg border-2 transition-all ${
                activeStep === index ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              onClick={() => setActiveStep(index)}
              style={{ cursor: 'pointer' }}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  activeStep === index ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {index + 1}
                </div>
                <p className="flex-1 text-muted-foreground">{step}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

// Helper sections - placeholder sections
const ScienceAndSoulSection = ({ product }: { product: Product }) => {
  return null;
};

const RealResultsSection = ({ product }: { product: Product }) => {
  return null;
};

const FrequentlyBoughtTogetherSection = ({ product }: { product: Product }) => {
  return null;
};

// End of component definitions

// End of file
