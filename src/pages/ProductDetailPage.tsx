import { motion, useInView, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { QuickViewModal } from "@/components/QuickViewModal";
import { OptimizedImage } from "@/components/OptimizedImage";
import { ArrowLeft, Minus, Plus, Play, CheckCircle, Leaf, Users, Heart } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { getProductById, getCurlyHairCollectionProductById, getCurlyHairCollectionProducts, products, Product } from "@/data/products";
import { getHeatlessCurlingRodProducts } from "./CategoryPage";
import { useCart } from "@/contexts/CartContext";
import { validateProductId } from "@/utils/validation";
import { preloadImagesWithPriority } from "@/utils/imagePreloader";
import { useRealtimeState } from "@/hooks/useRealtimeState";
import { useEventProduct, useEventUI, EVENTS } from "@/hooks/useEventSystem";
import { useRealtimeContext } from "@/contexts/RealtimeContext";

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();
  
  // Real-time context for global state
  const { setCurrentProduct, setSelectedColor: setGlobalColor, setSelectedQuantity: setGlobalQuantity } = useRealtimeContext();
  
  // Event system for instant updates
  const { selectProduct, selectColor, selectQuantity } = useEventProduct();
  const { showError, hideError } = useEventUI();
  
  // State management - using regular useState for color to avoid conflicts
  const [quantity, setQuantity] = useRealtimeState(`product-${id}-quantity`, 1);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

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
    product = getHeatlessCurlingRodProducts().find(p => p.id === id);
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
    
    // Update global product state
    if (product) {
      setCurrentProduct(product);
      selectProduct(product);
    }
    
    // Scroll to top when product changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // Preload video metadata for faster playback
    if (product.video) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = product.video;
    }
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

    // Clear any previous errors
    setError('');
    hideError();

    // Prepare the product for cart
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      selectedColor: selectedColor || undefined,
      size: product.size,
    };

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
      const priceNumber = parseFloat(product.price.replace('€', ''));
      (window as any).analytics.trackCart('add', {
        product_id: product.id,
        title: product.name,
        price: priceNumber,
        quantity: quantity,
        variant_id: selectedColor || undefined,
        variant_title: selectedColor || undefined,
        total_value: priceNumber * quantity,
      });
    }
    
    // Open cart drawer
    openCart();
  };

  // Get related products based on current product's collection
  const getRelatedProducts = () => {
    if (product.id.startsWith('heatless-') || product.id === 'dreamcurl-original') {
      // If user is viewing a Heatless Hair Curling Rod or DreamCurl product:
      // Show 1 from Heatless collection + 2 from Curly Hair Collection
      const heatlessProducts = getHeatlessCurlingRodProducts().filter(p => p.id !== product.id);
      const curlyProducts = getCurlyHairCollectionProducts();
      
      const oneHeatless = heatlessProducts.slice(0, 1);
      const twoCurly = curlyProducts.slice(0, 2);
      
      return [...oneHeatless, ...twoCurly];
    } else if (product.id.startsWith('curly-')) {
      // If user is viewing a Curly Hair Collection product:
      // Show 1 from Curly collection + 2 from Heatless Hair Curling Rod
      const curlyProducts = getCurlyHairCollectionProducts().filter(p => p.id !== product.id);
      const heatlessProducts = getHeatlessCurlingRodProducts();
      
      const oneCurly = curlyProducts.slice(0, 1);
      const twoHeatless = heatlessProducts.slice(0, 2);
      
      return [...oneCurly, ...twoHeatless];
    } else {
      // For other products, show products from the same category
      return products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 3);
    }
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <motion.button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          whileHover={{ x: -5 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Shop
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
              {product.price}
            </motion.p>

            <div className="space-y-3 mb-12">
              {product.description.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                  <p className={`text-lg ${item.includes('Sold as complete set') ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
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

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </motion.button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
              
              {/* Pieces Total Display */}
              {product.id.startsWith('curly-') && (
                <motion.div
                  className="ml-4 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-sm font-medium text-primary">
                    × {product.id === 'curly-clip-1' ? 9 * quantity : product.id === 'curly-scarf-1' ? 7 * quantity : 16 * quantity} pieces in total
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
          </motion.div>

          {/* Right: Product Image Gallery */}
          <motion.div
            key={`product-image-${product.id}`}
            className="order-1 md:order-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {product.id.startsWith('curly-') ? (
              <CurlyHairCollectionImageGallery key={`curly-gallery-${product.id}`} product={product} />
            ) : product.id === 'dreamcurl-original' ? (
              <DreamCurlImageGallery 
                key={`dreamcurl-gallery-${product.id}`}
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
            ) : product.id === 'heatless-6' ? (
              <BonnetImageGallery 
                key={`bonnet-gallery-${product.id}`}
                product={product} 
                selectedColor={selectedColor} 
                onColorSelect={setSelectedColor}
              />
            ) : (
            <motion.img
              key={`product-img-${product.id}`}
              src={product.image}
              alt={product.name}
              className="w-full h-auto rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            />
            )}
          </motion.div>
        </div>

        {/* 1. The "Ritual in Motion" Video Section */}
        <RitualInMotionSection key={`ritual-${product.id}`} product={product} />

        {/* BUN BONS Usage Steps Section */}
        {product.id === 'heatless-5' && product.usageSteps && (
          <BunBonsUsageSteps key={`bunbons-${product.id}`} product={product} />
        )}

        {/* 3. The "Science & Soul" Ingredient Spotlight - Only for specific products */}
        {!product.id.startsWith('heatless-') && !product.id.startsWith('dreamcurl-') && !product.id.startsWith('curly-') && (
          <ScienceAndSoulSection key={`science-${product.id}`} product={product} />
        )}

        {/* 4. The "From Our Community" Showcase */}
        <CommunityShowcase key={`community-${product.id}`} product={product} />

        
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                <AnimatePresence mode="popLayout">
            {relatedProducts.map((relatedProduct, index) => (
              <motion.div
                key={relatedProduct.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      viewport={{ once: true }}
                      layout
                    >
                      <ProductCard
                        {...relatedProduct}
                        onClick={() => navigate(`/product/${relatedProduct.id}`)}
                        onQuickView={() => setQuickViewProduct(relatedProduct)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.section>
        )}

        {/* Quick View Modal */}
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
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
  const product5Image = new URL('../assets/Heatless Hair Curling Rod/product5/pppp1.webp', import.meta.url).href;
  const product6Image = new URL('../assets/Heatless Hair Curling Rod/product6/candy&marchmello.webp', import.meta.url).href;

  const heatlessProducts: Product[] = [
    {
      id: "dreamcurl-original",
      name: "DreamCurl™ Original Set",
      price: "€39.99",
      image: new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/CFE0DE6D-F7E6-42F3-91A4-16C049F5ADA9.webp', import.meta.url).href,
      category: "DreamCurl™ Collection",
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
      images: [
        new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/CFE0DE6D-F7E6-42F3-91A4-16C049F5ADA9.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_3b575993-8e6a-413e-9f88-d95395c19980.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_686ff861-b01d-41ef-9c4c-0684df944cd6.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_bf658774-aed4-4c4a-be42-ef9707a47f3e.webp', import.meta.url).href
      ]
    },
    {
      id: "heatless-1",
      name: "DreamCurl™ Short Set – Rose Gold Edition",
      price: "€29.99",
      image: product1Image,
      category: "Heatless Tools",
      hairType: "All Types",
      featured: false,
      description: [
        "Create beautiful curls without heat damage",
        "Set of 4 different sized rods for various curl patterns",
        "Soft, flexible material that's gentle on hair",
        "Easy to use and remove",
        "Perfect for overnight styling"
      ],
      ingredients: ["Silicon Material", "Non-toxic Coating"],
      size: "Set of 4",
      inStock: true,
    },
    {
      id: "heatless-2", 
      name: "DreamCurl™ Short Set – Royal Purple Edition",
      price: "€24.99",
      image: product2Image,
      category: "Heatless Tools",
      hairType: "All Types",
      featured: false,
      description: [
        "Extra large size for loose, beachy waves",
        "Soft silicone material prevents hair damage",
        "Comfortable to sleep in overnight",
        "Creates natural-looking waves",
        "Reusable and easy to clean"
      ],
      ingredients: ["Premium Silicon", "Anti-slip Coating"],
      size: "Large",
      inStock: true,
    },
    {
      id: "heatless-3",
      name: "DreamCurl™ Short Set – Olive Lux Edition",
      price: "€19.99", 
      image: product3Image,
      category: "Heatless Tools",
      hairType: "All Types",
      featured: false,
      description: [
        "Medium size for versatile curl options",
        "Professional-grade silicone construction",
        "Creates defined, long-lasting curls",
        "Suitable for all hair lengths",
        "Heat-free styling solution"
      ],
      ingredients: ["Medical-grade Silicon", "Smooth Finish"],
      size: "Medium",
      inStock: true,
    },
    {
      id: "heatless-4",
      name: "DreamCurl™ Short Set – Earl Grey Edition",
      price: "€16.99",
      image: product4Image,
      category: "Heatless Tools", 
      hairType: "All Types",
      featured: false,
      description: [
        "Small size for tight, defined curls",
        "Perfect for short to medium length hair",
        "Lightweight and comfortable",
        "Creates bouncy, springy curls",
        "Ideal for quick styling"
      ],
      ingredients: ["Flexible Silicon", "Gentle Texture"],
      size: "Small",
      inStock: true,
    },
    {
      id: "heatless-5",
      name: "BUN BONS - Heatless Curling System",
      price: "€89.99",
      image: product5Image,
      category: "Heatless Tools",
      hairType: "All Types",
      featured: true,
      description: [
        "Experience overnight blowout-style volume with exceptional comfort and secure sleep",
        "Innovation that transformed heatless hairstyling - created by CURLEA, named by our community",
        "Unique curling system encased within a protective capsule",
        "Thoughtfully designed to reduce friction, preserve shape, and leave hair smoother and shinier",
        "Layered design creates curls while safeguarding hair from damage and friction",
        "Inner elongated fiber fill holds form without applying pressure",
        "Outer vegan Peau de Soie layer allows strands to glide smoothly, minimizing friction",
        "Lightweight, refined, and luxurious styling experience with subtle gold-accent buttons",
        "Perfect for those who love wrapping sections to achieve lift at the crown",
        "Available in Original Size (fine to medium hair) and Jumbo Size (thick hair)"
      ],
      ingredients: ["Vegan Peau de Soie", "Elongated Fiber Fill", "Gold-accent Buttons"],
      size: "3 Heatless Curlers + 3 Matching Mini Bonnets",
      colors: ["MULBERRY", "CANDY", "LATTE", "OLIVE", "BUTTERMILK"],
      usageSteps: [
        "Start with clean, dry hair (80-90% dry for best results)",
        "Divide your hair into 3-4 sections at the crown area",
        "Take one BUN BONS curler and place it at the base of a section",
        "Wrap your hair around the curler in a spiral motion, working from roots to ends",
        "Secure the wrapped hair with the elegant gold-accent buttons",
        "Repeat the process for all sections, using different sized curlers if needed",
        "Cover everything with the coordinating Peau de Soie bonnet for protection",
        "Sleep comfortably overnight or leave in for 4-6 hours during the day",
        "Remove the bonnet and carefully unwind each curler in reverse order",
        "Gently separate the curls with your fingers and enjoy your beautiful blowout-style waves"
      ],
      inStock: true,
    },
    {
      id: "heatless-6",
      name: "PEAU DE SOIE | XL OVERNIGHT BONNET",
      price: "€39.99",
      image: product6Image,
      category: "Heatless Tools",
      hairType: "All Types",
      featured: true,
      description: [
        "For all overnight heatless styling enthusiasts, the Eternal Muse Reversible Bonnet is a must-have addition to your bedtime routine",
        "This XL Overnight Bonnet fits even over our largest size JUMBO heatless curler and provides a protective barrier against breakage and frizz",
        "Retains your hair's natural oils, resulting in healthy, shiny, and frizz-free hair each morning",
        "Crafted from the finest vegan silk alternative french fabric known as Peau De Soie",
        "This luxurious sleep cap ensures maximum comfort all night long",
        "Fights frizz, infuses hair with moisture, preserves hairstyles, prevents bed head, and leaves your hair with a glossy shine",
        "Suitable for all hair types, but especially beneficial for curly hair, thick hair, natural hair, or hair extensions",
        "Wearing the Peau De Soie Bonnet overnight is a natural conditioning treatment that nourishes your hair",
        "Upgrade your hair care regimen with the Eternal Muse Reversible Bonnet - an elegant addition to your bedtime attire"
      ],
      ingredients: ["Peau De Soie", "Vegan Silk Alternative", "French Fabric"],
      size: "XL Size",
      colors: ["CANDY & MARSHMALLOW", "LATTE & MARSHMALLOW", "OLIVE & LATTE"],
      inStock: true,
    }
  ];

  return heatlessProducts.find(product => product.id === id);
};

// 1. The "Ritual in Motion" Video Section
const RitualInMotionSection = ({ product }: { product: Product }) => {
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Reset video state when product changes
  useEffect(() => {
    setIsVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [product.id]);

  // Auto-play video when section comes into view
  useEffect(() => {
    if (isInView && videoRef.current && !isVideoPlaying) {
      videoRef.current.play().catch(() => {
        // Handle autoplay failure gracefully
        console.log('Autoplay prevented by browser');
      });
    }
  }, [isInView, isVideoPlaying, product.id]);

      // Check if it's a special product type
      const isHeatlessProduct = product.id.startsWith('heatless-');
      const isDreamCurlProduct = product.id.startsWith('dreamcurl-');
      const isCurlyHairProduct = product.id.startsWith('curly-');
      
      // Import the appropriate video for special products
    const specialVideo = isHeatlessProduct || isDreamCurlProduct
      ? product.id === 'dreamcurl-original'
        ? new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/Screen Recording 2025-10-11 005227.mp4', import.meta.url).href
        : product.id === 'heatless-5'
        ? new URL('../assets/Heatless Hair Curling Rod/product5/Screen Recording 2025-10-07 143110.mp4', import.meta.url).href
        : product.id === 'heatless-6'
        ? new URL('../assets/Heatless Hair Curling Rod/product6/Screen Recording 2025-10-06 223323.mp4', import.meta.url).href
        : new URL('../assets/Heatless Hair Curling Rod/69fb9b50593547f3899618d65d85cec5.HD-1080p-7.2Mbps-11546034.mp4', import.meta.url).href
      : isCurlyHairProduct
        ? product.id === 'curly-clip-1'
          ? new URL('../assets/curly hair collection/Download (3).mp4', import.meta.url).href
          : product.id === 'curly-scarf-1'
          ? new URL('../assets/curly hair collection/product2/Screen Recording 2025-10-04 143847.mp4', import.meta.url).href
          : product.id === 'curly-claw-1'
          ? new URL('../assets/curly hair collection/product3/Screen Recording 2025-10-05 155052.mp4', import.meta.url).href
          : null
        : null;

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
  };

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
                    className="w-full h-full object-cover sm:object-contain"
                    controls={isVideoPlaying}
                    muted
                    loop
                    playsInline
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                  >
                    <source src={specialVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Play Button Overlay (when not playing) */}
                  {!isVideoPlaying && (
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
      className="relative py-24 px-6 bg-background"
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
                  <div className="space-y-3">
                    {steps.map((step, index) => (
                      <motion.button
                        key={step.number}
                        className={`w-full text-left p-4 lg:p-6 rounded-2xl border-2 transition-all duration-500 group ${
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
                        <div className="flex items-center gap-4">
                          {/* Step Number Circle */}
                          <motion.div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
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
                            <h4 className={`text-lg font-semibold transition-colors duration-300 ${
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
            <div className="space-y-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  className={`p-6 rounded-xl border-2 transition-all duration-500 cursor-pointer ${
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
                  <div className="flex items-start gap-4">
                    <motion.div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
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
                      <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                        activeStep === index ? 'text-primary' : 'text-foreground'
                      }`}>
                        {step.title}
                  </h3>
                      <p className={`transition-colors duration-300 ${
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

// 4. The "From Our Community" Showcase
const CommunityShowcase = ({ product }: { product: Product }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Mock community content - in production, this would come from an API
      const communityPosts = product.id.startsWith('curly-') ? [
        // Different photos for different curly hair products
        ...(product.id === 'curly-clip-1' ? [
          {
            id: 1,
            image: new URL('../assets/curly hair collection/product1/real result.png', import.meta.url).href,
            username: '@curlygirl_maria',
            caption: 'These hair clips are absolutely amazing! Perfect hold and so comfortable.',
            likes: 1247
          },
          {
            id: 2,
            image: new URL('../assets/curly hair collection/product1/real result2.png', import.meta.url).href,
            username: '@wavyhairdaily',
            caption: 'Love how secure these clips hold my hair! Perfect for any occasion.',
            likes: 892
          },
          {
            id: 3,
            image: new URL('../assets/curly hair collection/product1/real result3.png', import.meta.url).href,
            username: '@naturalbeauty_sofia',
            caption: 'Amazing quality and comfort. These clips are a game changer!',
            likes: 2156
          }
        ] : product.id === 'curly-scarf-1' ? [
          // Photos for satin scarf product
          {
            id: 1,
            image: new URL('../assets/curly hair collection/product2/result.png', import.meta.url).href,
            username: '@satinhair_grace',
            caption: 'These satin hair bands are so elegant! Perfect for protecting my curls while sleeping.',
            likes: 1834
          },
          {
            id: 2,
            image: new URL('../assets/curly hair collection/product2/result1.png', import.meta.url).href,
            username: '@curlyprotect_lisa',
            caption: 'Love how soft and gentle these are on my hair. No more breakage!',
            likes: 1298
          },
          {
            id: 3,
            image: new URL('../assets/curly hair collection/product2/result2.png', import.meta.url).href,
            username: '@haircare_queen',
            caption: 'The turban wrap style is my favorite! So fashionable and comfortable.',
            likes: 2156
          },
          {
            id: 4,
            image: new URL('../assets/curly hair collection/product2/result3.png', import.meta.url).href,
            username: '@satinlover_emma',
            caption: 'These scarves have transformed my hair routine. Highly recommend!',
            likes: 1673
          },
          {
            id: 5,
            image: new URL('../assets/curly hair collection/product2/result4.png', import.meta.url).href,
            username: '@curlystyle_anna',
            caption: 'Amazing results! My hair looks so healthy and styled beautifully with these scarves.',
            likes: 1923
          },
          {
            id: 6,
            image: new URL('../assets/curly hair collection/product2/result5.png', import.meta.url).href,
            username: '@hairgoals_sarah',
            caption: 'Perfect for both styling and protection. These scarves are a must-have!',
            likes: 1547
          }
        ] : product.id === 'curly-claw-1' ? [
          // Photos for claw clips product
          {
            id: 1,
            image: new URL('../assets/curly hair collection/product3/result.png', import.meta.url).href,
            username: '@geometric_hair_anna',
            caption: 'These geometric claw clips are so stylish! Perfect for creating elegant updos.',
            likes: 1456
          },
          {
            id: 2,
            image: new URL('../assets/curly hair collection/product3/result2.png', import.meta.url).href,
            username: '@fashion_clips_jenny',
            caption: 'Love the neutral color and matte finish. So sophisticated!',
            likes: 1189
          },
          {
            id: 3,
            image: new URL('../assets/curly hair collection/product3/result.png', import.meta.url).href,
            username: '@hair_accessories_luna',
            caption: 'The 16-piece set gives me so many styling options. Absolutely love them!',
            likes: 2034
          },
          {
            id: 4,
            image: new URL('../assets/curly hair collection/product3/result2.png', import.meta.url).href,
            username: '@style_queen_emma',
            caption: 'Perfect for thick hair! These clips hold everything in place beautifully.',
            likes: 1678
          },
          {
            id: 5,
            image: new URL('../assets/curly hair collection/product3/result1.png', import.meta.url).href,
            username: '@claw_clips_lover',
            caption: 'The geometric design is so unique! Love how they add a modern touch to any hairstyle.',
            likes: 1423
          },
          {
            id: 6,
            image: new URL('../assets/curly hair collection/product3/result3.png', import.meta.url).href,
            username: '@hair_styling_pro',
            caption: 'These clips are perfect for creating professional-looking updos. Highly recommend!',
            likes: 1891
          },
          {
            id: 7,
            image: new URL('../assets/curly hair collection/product3/result4.png', import.meta.url).href,
            username: '@beauty_enthusiast_rose',
            caption: 'The matte finish looks so elegant! Perfect for both casual and formal occasions.',
            likes: 1567
          },
          {
            id: 8,
            image: new URL('../assets/curly hair collection/product3/result5.png', import.meta.url).href,
            username: '@hair_accessories_queen',
            caption: 'With 16 pieces in the set, I can create so many different styles. Amazing value!',
            likes: 2134
          }
        ] : [])
      ] : product.id === 'heatless-5' ? [
        // BUN BONS community posts
        {
          id: 1,
          image: new URL('../assets/Heatless Hair Curling Rod/product5/result1.webp', import.meta.url).href,
          username: '@bunbons_lover',
          caption: 'Beautiful overnight curls with BUN BONS! Slept so comfortably and woke up with perfect waves.',
          likes: 1247
        },
        {
          id: 2,
          image: new URL('../assets/Heatless Hair Curling Rod/product5/result2.webp', import.meta.url).href,
          username: '@heatless_queen',
          caption: 'The revolutionary curling system works like magic! No heat damage, just gorgeous curls.',
          likes: 892
        },
        {
          id: 3,
          image: new URL('../assets/Heatless Hair Curling Rod/product5/result3.jpg', import.meta.url).href,
          username: '@curlea_community',
          caption: 'BUN BONS transformed my styling routine. The Peau de Soie layer is so luxurious!',
          likes: 2156
        },
        {
          id: 4,
          image: new URL('../assets/Heatless Hair Curling Rod/product5/result4.jpg', import.meta.url).href,
          username: '@blowout_style',
          caption: 'Achieved salon-quality blowout waves overnight! This system is absolutely incredible.',
          likes: 1834
        }
      ] : product.id === 'heatless-6' ? [
        // Bonnet community posts
        {
          id: 1,
          image: new URL('../assets/Heatless Hair Curling Rod/product6/Gemini_Generated_Image_gseekhgseekhgsee.png', import.meta.url).href,
          username: '@luxury_sleep_stylist',
          caption: 'This is THE bonnet that changed everything! The Peau de Soie fabric is incredibly soft and my hair has never looked better in the morning.',
          likes: 2156
        },
        {
          id: 2,
          image: new URL('../assets/Heatless Hair Curling Rod/product6/Gemini_Generated_Image_2u8z0f2u8z0f2u8z.png', import.meta.url).href,
          username: '@bonnet_lover',
          caption: 'The Peau de Soie bonnet is pure luxury! Slept so comfortably and woke up with perfectly preserved curls.',
          likes: 1456
        },
        {
          id: 3,
          image: new URL('../assets/Heatless Hair Curling Rod/product6/Gemini_Generated_Image_syu8posyu8posyu8.png', import.meta.url).href,
          username: '@silk_sleep_queen',
          caption: 'This XL bonnet fits over everything! No more bed head or frizz - just beautiful, protected hair every morning.',
          likes: 1234
        },
        {
          id: 4,
          image: new URL('../assets/Heatless Hair Curling Rod/product6/Gemini_Generated_Image_x4i4fxx4i4fxx4i4.png', import.meta.url).href,
          username: '@curlea_community',
          caption: 'The reversible design is genius! Love how it protects my heatless curls while keeping me comfortable all night.',
          likes: 1678
        }
      ] : product.id === 'dreamcurl-original' ? [
        // DreamCurl™ Original Set community posts
        {
          id: 1,
          image: new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/result.png', import.meta.url).href,
          username: '@dreamcurl_original',
          caption: 'The original that started it all! These overnight curls are absolutely stunning. No heat, no damage, just beautiful results.',
          likes: 3247
        },
        {
          id: 2,
          image: new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/result1.png', import.meta.url).href,
          username: '@heatless_curl_queen',
          caption: 'DreamCurl™ Original Set delivers exactly what it promises. Woke up with salon-quality curls that lasted all day!',
          likes: 2892
        },
        {
          id: 3,
          image: new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/result2.png', import.meta.url).href,
          username: '@curlea_community_original',
          caption: 'This is the curler that redefined the category! The vegan Peau de Soie fabric feels incredible and the results speak for themselves.',
          likes: 4156
        },
        {
          id: 4,
          image: new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/result3.png', import.meta.url).href,
          username: '@original_curler_lover',
          caption: 'Medium to long hair? This is your perfect match! The elongated structured fibres hold shape through the night beautifully.',
          likes: 3834
        }
      ] : [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&h=400&fit=crop',
      username: '@curlygirl_maria',
      caption: 'The definition is incredible! My curls have never looked this good.',
      likes: 1247
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop',
      username: '@wavyhairdaily',
      caption: 'Finally found my holy grail product. The shine is everything!',
      likes: 892
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop',
      username: '@naturalbeauty_sofia',
      caption: 'My hair has never felt so healthy. This product changed everything!',
      likes: 2156
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop',
      username: '@curlyqueen_anna',
      caption: 'The texture is perfect and the scent is divine. Obsessed!',
      likes: 743
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop',
      username: '@hairgoals_sarah',
      caption: 'Game changer! My routine is so much easier now.',
      likes: 1834
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop',
      username: '@curlyjourney_lisa',
      caption: 'The results speak for themselves. Thank you Curlea!',
      likes: 967
    }
  ];

  return (
    <motion.section
      ref={ref}
      className="relative py-24 px-6 bg-background"
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
            Real Results from the Curlea Community
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how our community is transforming their hair with {product.name}.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {communityPosts.map((post, index) => (
            <motion.div
              key={post.id}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.6, ease: "easeOut" }}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('#', '_blank')} // In production, link to actual post
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden">
                <img
                  src={post.image}
                  alt={post.username}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-sm font-medium mb-2">{post.username}</p>
                <p className="text-sm opacity-90 mb-3 line-clamp-2">{post.caption}</p>
                <div className="flex items-center gap-2 text-sm opacity-80">
                  <Heart className="w-4 h-4" />
                  <span>{post.likes.toLocaleString()} likes</span>
                </div>
              </div>

              {/* Floating users icon */}
              <motion.div
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
              >
                <Users className="w-5 h-5 text-white" />
              </motion.div>
            </motion.div>
            ))}
          </div>

        {/* Call to action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <p className="text-lg text-muted-foreground mb-6">
            Join thousands of satisfied customers and share your own transformation.
          </p>
          <motion.button
            className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Share Your Results
          </motion.button>
        </motion.div>
        </div>
    </motion.section>
  );
};

// Curly Hair Collection Image Gallery Component
const CurlyHairCollectionImageGallery = ({ product }: { product: Product }) => {
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
    new URL('../assets/curly hair collection/product3/ppp22.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp23.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp24.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/product3/ppp25.avif', import.meta.url).href,
  ];


  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <motion.div
        className="relative aspect-square rounded-lg overflow-hidden bg-muted"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.img
          key={selectedImageIndex}
          src={curlyHairImages[selectedImageIndex]}
          alt={`${product.name} - View ${selectedImageIndex + 1}`}
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onError={(e) => {
            console.error(`Failed to load image: ${curlyHairImages[selectedImageIndex]}`);
            e.currentTarget.src = '/placeholder-image.jpg'; // Fallback image
          }}
        />
        
        {/* Image Counter */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
          {selectedImageIndex + 1} / {curlyHairImages.length}
      </div>
      </motion.div>

      {/* Enhanced Image Gallery with Smart Pagination */}
      <div className="space-y-4">
        {/* Main Navigation Controls */}
        <div className="flex items-center justify-between">
          <motion.button
            onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : curlyHairImages.length - 1)}
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </motion.button>

          <div className="text-sm text-muted-foreground font-medium">
            {selectedImageIndex + 1} of {curlyHairImages.length}
    </div>

          <motion.button
            onClick={() => setSelectedImageIndex(prev => prev < curlyHairImages.length - 1 ? prev + 1 : 0)}
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>

        {/* Smart Thumbnail Display - Show 6 images with pagination */}
        <div className="grid grid-cols-6 gap-2">
          {curlyHairImages.slice(thumbnailStartIndex, thumbnailStartIndex + 6).map((image, index) => {
            const actualIndex = thumbnailStartIndex + index;
            return (
              <motion.button
                key={actualIndex}
                onClick={() => setSelectedImageIndex(actualIndex)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                  selectedImageIndex === actualIndex
                    ? 'border-primary shadow-lg scale-105'
                    : 'border-transparent hover:border-primary/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <img
                  src={image}
                  alt={`${product.name} thumbnail ${actualIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error(`Failed to load thumbnail: ${image}`);
                    e.currentTarget.src = '/placeholder-thumbnail.jpg';
                  }}
                />
                {selectedImageIndex === actualIndex && (
                  <motion.div
                    className="absolute inset-0 bg-primary/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Thumbnail Pagination Controls */}
        {curlyHairImages.length > 6 && (
          <div className="flex items-center justify-center gap-4">
            <motion.button
              onClick={() => {
                const newStart = thumbnailStartIndex > 0 ? thumbnailStartIndex - 6 : Math.max(0, curlyHairImages.length - 6);
                setThumbnailStartIndex(newStart);
              }}
              className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ← Previous Set
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
              Next Set →
            </motion.button>
          </div>
        )}
      </div>

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
      'BUTTERMILK': bunBonsImages[4], // pppp5.webp
    };
    return colorImageMap[color as keyof typeof colorImageMap] || bunBonsImages[0];
  };

  // Get the current main image based on selected color
  const currentMainImage = selectedColor ? getColorSpecificImage(selectedColor) : getColorSpecificImage('MULBERRY');
  

  return (
    <div className="space-y-4">
      {/* Simple Main Image Display */}
      <motion.div
        className="relative aspect-square rounded-lg overflow-hidden bg-muted"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img
          key={`${selectedColor}-${currentMainImage}`}
          src={currentMainImage}
          alt={`${product.name} - ${selectedColor} Color`}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error(`Failed to load image: ${currentMainImage}`);
            e.currentTarget.src = '/placeholder-image.jpg';
          }}
        />
        
      </motion.div>

      {/* Simple Color Thumbnail Grid */}
      <div className="space-y-4">
        <div className="text-center">
          <span className="text-sm text-muted-foreground">Available Colors</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {product.colors?.map((color, index) => (
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
              <img
                src={getColorSpecificImage(color)}
                alt={`${product.name} - ${color} color preview`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error(`Failed to load color preview: ${color}`);
                  e.currentTarget.src = '/placeholder-thumbnail.jpg';
                }}
              />
              
              {selectedColor === color && (
                <div className="absolute inset-0 bg-primary/20" />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Bonnet Image Gallery Component - Simplified
const BonnetImageGallery = ({ product, selectedColor, onColorSelect }: { product: Product; selectedColor: string; onColorSelect: (color: string) => void }) => {
  // Import images for Bonnet product (3 images mapped to 3 colors)
  const bonnetImages = [
    new URL('../assets/Heatless Hair Curling Rod/product6/candy&marchmello.webp', import.meta.url).href,
    new URL('../assets/Heatless Hair Curling Rod/product6/latte&marchmello.webp4.webp', import.meta.url).href,
    new URL('../assets/Heatless Hair Curling Rod/product6/olive&latte.webp4.webp', import.meta.url).href,
  ];

  // Color-specific image mapping - simple and clean
  const getColorSpecificImage = (color: string) => {
    const colorImageMap = {
      'CANDY & MARSHMALLOW': bonnetImages[0], // candy&marchmello.webp
      'LATTE & MARSHMALLOW': bonnetImages[1], // latte&marchmello.webp4.webp
      'OLIVE & LATTE': bonnetImages[2], // olive&latte.webp4.webp
    };
    return colorImageMap[color as keyof typeof colorImageMap] || bonnetImages[0];
  };

  // Get the current main image based on selected color
  const currentMainImage = selectedColor ? getColorSpecificImage(selectedColor) : getColorSpecificImage('CANDY & MARSHMALLOW');

  return (
    <div className="space-y-4">
      {/* Simple Main Image Display */}
      <motion.div
        className="relative aspect-square rounded-lg overflow-hidden bg-muted"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img
          key={`${selectedColor}-${currentMainImage}`}
          src={currentMainImage}
          alt={`${product.name} - ${selectedColor} Color`}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error(`Failed to load image: ${currentMainImage}`);
            e.currentTarget.src = '/placeholder-image.jpg';
          }}
        />
      </motion.div>

      {/* Simple Color Thumbnail Grid */}
      <div className="space-y-4">
        <div className="text-center">
          <span className="text-sm text-muted-foreground">Available Colors</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {product.colors?.map((color, index) => (
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
              <img
                src={getColorSpecificImage(color)}
                alt={`${product.name} - ${color} color preview`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error(`Failed to load color preview: ${color}`);
                  e.currentTarget.src = '/placeholder-thumbnail.jpg';
                }}
              />
              
              {selectedColor === color && (
                <div className="absolute inset-0 bg-primary/20" />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

// BUN BONS Usage Steps Component
const BunBonsUsageSteps = ({ product }: { product: Product }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  if (!product.usageSteps) return null;

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
            How to Use BUN BONS
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Follow these simple steps to achieve beautiful, blowout-style waves with your BUN BONS heatless curling system.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {product.usageSteps.map((step, index) => (
            <motion.div
              key={index}
              className="relative p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-start gap-4">
                <motion.div
                  className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg"
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ delay: 0.1 * index + 0.2, type: "spring", stiffness: 200 }}
                >
                  {index + 1}
                </motion.div>
                
                <div className="flex-1">
                  <p className="text-foreground leading-relaxed">
                    {step}
                  </p>
                </div>
              </div>
              
              {/* Decorative element */}
              <motion.div
                className="absolute top-4 right-4 w-8 h-8 bg-primary/10 rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ delay: 0.1 * index + 0.4, duration: 0.3 }}
              />
            </motion.div>
          ))}
        </div>

        {/* Pro Tips Section */}
        <motion.div
          className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-primary">Pro Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                  <Leaf className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Best Results</h4>
                <p className="text-sm text-muted-foreground">Use on 80-90% dry hair for optimal curl formation</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Comfort</h4>
                <p className="text-sm text-muted-foreground">Sleep comfortably with the protective Peau de Soie bonnet</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Long-lasting</h4>
                <p className="text-sm text-muted-foreground">Enjoy beautiful waves that last for days</p>
              </div>
            </div>
          </div>
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Placeholder image for DreamCurl
  const placeholderImage = new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_3b575993-8e6a-413e-9f88-d95395c19980.webp', import.meta.url).href;

  // Color-specific image mapping for DreamCurl™ Original Set
  const getColorSpecificImage = (color: string) => {
    const colorImageMap = {
      'Mulberry': new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_3b575993-8e6a-413e-9f88-d95395c19980.webp', import.meta.url).href,
      'Olive': new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/CFE0DE6D-F7E6-42F3-91A4-16C049F5ADA9.webp', import.meta.url).href,
      'Candy': new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_686ff861-b01d-41ef-9c4c-0684df944cd6.webp', import.meta.url).href,
      'Latte': new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_bf658774-aed4-4c4a-be42-ef9707a47f3e.webp', import.meta.url).href,
    };
    return colorImageMap[color as keyof typeof colorImageMap] || colorImageMap['Mulberry'];
  };

  // Get the current main image based on selected color or selected image index
  const getCurrentMainImage = () => {
    if (selectedColor) {
      return getColorSpecificImage(selectedColor);
    }
    // Fallback to product's images array
    const productImages = product.images && product.images.length > 0 
      ? product.images 
      : [product.image];
    return productImages[selectedImageIndex];
  };

  // Get color from image index
  const getColorFromIndex = (index: number) => {
    const colorOrder = ['Mulberry', 'Olive', 'Candy', 'Latte'];
    return colorOrder[index] || colorOrder[0];
  };

  const currentMainImage = getCurrentMainImage();

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <motion.div
        className="relative aspect-square rounded-lg overflow-hidden bg-muted"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <OptimizedImage
          key={`${selectedColor}-${currentMainImage}`}
          src={currentMainImage}
          alt={`${product.name} - ${selectedColor || 'View'} ${selectedImageIndex + 1}`}
          className="object-cover"
          placeholderSrc={placeholderImage}
          priority={true}
          onError={(e) => {
            console.error(`Failed to load image: ${currentMainImage}`);
            if (e.currentTarget) {
              e.currentTarget.src = placeholderImage;
            }
          }}
        />
        
        {/* Navigation Arrows - always available */}
        {product.colors && product.colors.length > 1 && (
          <>
            <button
              onClick={() => {
                const currentIndex = selectedColor 
                  ? product.colors!.indexOf(selectedColor)
                  : selectedImageIndex;
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : product.colors!.length - 1;
                const prevColor = product.colors![prevIndex];
                onColorSelect(prevColor);
                setSelectedImageIndex(prevIndex);
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-black/70 active:bg-black/80 transition-colors touch-manipulation"
              aria-label="Previous color"
            >
              <span className="text-lg sm:text-xl">←</span>
            </button>
            <button
              onClick={() => {
                const currentIndex = selectedColor 
                  ? product.colors!.indexOf(selectedColor)
                  : selectedImageIndex;
                const nextIndex = currentIndex < product.colors!.length - 1 ? currentIndex + 1 : 0;
                const nextColor = product.colors![nextIndex];
                onColorSelect(nextColor);
                setSelectedImageIndex(nextIndex);
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-black/70 active:bg-black/80 transition-colors touch-manipulation"
              aria-label="Next color"
            >
              <span className="text-lg sm:text-xl">→</span>
            </button>
          </>
        )}
      </motion.div>

      {/* Thumbnail Gallery - show all color-specific images so customers can see available colors */}
      {product.colors && product.colors.length > 0 && (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {product.colors.map((color, index) => (
            <button
              key={color}
              onClick={() => {
                // Update both color selection and image index when clicking thumbnail
                onColorSelect(color);
                setSelectedImageIndex(index);
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
                placeholderSrc={placeholderImage}
                priority={index < 2}
                onError={(e) => {
                  console.error(`Failed to load color image: ${color}`);
                  if (e.currentTarget) {
                    e.currentTarget.src = placeholderImage;
                  }
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
