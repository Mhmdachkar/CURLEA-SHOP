import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QuickViewModal } from "@/components/QuickViewModal";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { getProductsByHairType, getCurlyHairCollectionProducts, Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";

// Import hero images for different categories
import heatlessHeroImage from "@/assets/Heatless Hair Curling Rod/hero.png";
import curlyHeroImage from "@/assets/curly hair collection/hero.png";

export const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Validate and normalize category
  const validCategories = ['wavy', 'curly', 'straight'];
  const normalizedCategory = category?.toLowerCase();
  
  if (!normalizedCategory || !validCategories.includes(normalizedCategory)) {
    return (
      <div className="min-h-screen bg-white relative pt-24 pb-16 flex items-center justify-center">
        {/* Seamless background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/20 to-white opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent" />
        <div className="text-center relative z-10">
          <h1 className="text-4xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">The category you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/collection")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Collection
          </button>
        </div>
      </div>
    );
  }

  // Get products for this category
  const categoryProducts = normalizedCategory === 'wavy' 
    ? getHeatlessCurlingRodProducts() // Special products for heatless curling rods
    : normalizedCategory === 'curly'
    ? getCurlyHairCollectionProducts() // Special products for curly hair collection
    : getProductsByHairType(
        normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1)
      );

  // Category configuration
  const categoryConfig = {
    wavy: {
      title: "Heatless Hair Curling Rod",
      subtitle: "Achieve beautiful curls without heat damage",
      description: "Discover our innovative heatless curling rods that create stunning curls while protecting your hair from heat damage. Perfect for all hair types and lengths.",
      gradient: "from-blue-500/10 via-purple-500/20 to-pink-500/10",
      accentColor: "text-blue-600"
    },
    curly: {
      title: "Curly Hair Collection", 
      subtitle: "Stylish accessories designed for your beautiful curls",
      description: "Discover our curated collection of premium hair accessories specifically designed for curly hair. From comfortable hair clips to styling tools, each piece is crafted to enhance your natural curl pattern while providing comfort and style.",
      gradient: "from-amber-500/10 via-orange-500/20 to-red-500/10",
      accentColor: "text-amber-600"
    },
    straight: {
      title: "Straight Hair Collection",
      subtitle: "Achieve smooth, sleek perfection with our straight hair essentials",
      description: "Transform your straight hair with our premium collection designed for smoothness and shine. From smoothing treatments to lightweight styling products, achieve the sleek look you desire.",
      gradient: "from-slate-500/10 via-gray-500/20 to-zinc-500/10", 
      accentColor: "text-slate-600"
    }
  };

  const config = categoryConfig[normalizedCategory as keyof typeof categoryConfig];

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const handleAddToCart = (product: Product) => {
    try {
      addToCart(product);
      openCart();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Seamless background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/20 to-white opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent" />
      <Navbar />
      {/* Hero Section */}
      <motion.section
        className={`relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden ${
          (normalizedCategory === 'wavy' || normalizedCategory === 'curly')
            ? 'bg-center bg-no-repeat' 
            : `bg-gradient-to-br ${config.gradient}`
        }`}
        style={(normalizedCategory === 'wavy' || normalizedCategory === 'curly') ? {
          backgroundImage: normalizedCategory === 'wavy' 
            ? `url(${heatlessHeroImage})`
            : `url(${curlyHeroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          minHeight: '70vh',
          width: '100%',
          objectFit: 'contain'
        } : {}}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
      >
        {/* Floating Particles Effect for Hero Image */}
        {(normalizedCategory === 'wavy' || normalizedCategory === 'curly') && (
          <>
            <motion.div
              className="absolute top-20 left-10 w-2 h-2 bg-white/30 rounded-full"
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0
              }}
            />
            <motion.div
              className="absolute top-40 right-20 w-1 h-1 bg-white/40 rounded-full"
              animate={{
                y: [0, -15, 0],
                opacity: [0.4, 0.9, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
            <motion.div
              className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-white/20 rounded-full"
              animate={{
                y: [0, -25, 0],
                opacity: [0.2, 0.7, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
            <motion.div
              className="absolute top-60 right-40 w-1 h-1 bg-white/50 rounded-full"
              animate={{
                y: [0, -18, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
          </>
        )}
        {/* Overlay for text readability on hero image */}
        {(normalizedCategory === 'wavy' || normalizedCategory === 'curly') && (
          <div className="absolute inset-0 bg-black/30" />
        )}
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Animated Title with Word-by-Word Reveal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
              <motion.h1 
                className={`fluid-text-5xl lg:fluid-text-6xl xl:fluid-text-7xl font-bold mb-6 ${
                  (normalizedCategory === 'wavy' || normalizedCategory === 'curly')
                    ? 'text-white drop-shadow-lg' 
                    : 'bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent'
                }`}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 1.2, 
                delay: 0.4, 
                ease: [0.43, 0.13, 0.23, 0.96],
                type: "spring",
                stiffness: 100
              }}
            >
              {config.title.split(' ').map((word, index) => (
                <motion.span
                  key={word}
                  className="inline-block mr-4"
                  initial={{ opacity: 0, y: 30, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.5 + index * 0.15,
                    ease: [0.43, 0.13, 0.23, 0.96]
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    transition: { duration: 0.3 } 
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>
          </motion.div>

            {/* Animated Subtitle with Character Reveal */}
            <motion.p 
              className={`fluid-text-lg lg:fluid-text-xl xl:fluid-text-2xl mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4 ${
                (normalizedCategory === 'wavy' || normalizedCategory === 'curly')
                  ? 'text-white/90 drop-shadow-md' 
                  : 'text-muted-foreground'
              }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1.0, 
              delay: 1.2, 
              ease: [0.43, 0.13, 0.23, 0.96] 
            }}
          >
            {config.subtitle.split('').map((char, index) => (
              <motion.span
                key={index}
                className="inline-block"
                initial={{ opacity: 0, y: 10, rotateY: -90 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 1.3 + index * 0.03,
                  ease: [0.43, 0.13, 0.23, 0.96]
                }}
                whileHover={{ 
                  scale: 1.1, 
                  color: (normalizedCategory === 'wavy' || normalizedCategory === 'curly') ? '#fbbf24' : undefined,
                  transition: { duration: 0.2 } 
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.p>

            {/* Animated Description with Staggered Lines */}
            <motion.p 
              className={`fluid-text-base lg:fluid-text-lg max-w-3xl mx-auto mb-8 sm:mb-12 px-4 ${
                (normalizedCategory === 'wavy' || normalizedCategory === 'curly')
                  ? 'text-white/80 drop-shadow-sm' 
                  : 'text-muted-foreground'
              }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.8, 
              delay: 1.8, 
              ease: [0.43, 0.13, 0.23, 0.96] 
            }}
          >
            {config.description.split('.').map((sentence, sentenceIndex) => (
              <motion.span
                key={sentenceIndex}
                className="block"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 1.9 + sentenceIndex * 0.2,
                  ease: [0.43, 0.13, 0.23, 0.96]
                }}
              >
                {sentence}{sentenceIndex < config.description.split('.').length - 1 ? '.' : ''}
              </motion.span>
            ))}
          </motion.p>

            {/* Animated Category Stats */}
            <motion.div
              className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.2 }}
          >
            {/* Stat 1: Products Count */}
            <motion.div 
              className="text-center relative"
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 2.3,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
              whileHover={{ 
                scale: 1.1, 
                transition: { duration: 0.3 } 
              }}
            >
              <motion.div 
                className={`text-3xl font-bold relative ${
                  (normalizedCategory === 'wavy' || normalizedCategory === 'curly') ? 'text-white drop-shadow-md' : 'text-primary'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 2.4,
                  ease: [0.43, 0.13, 0.23, 0.96]
                }}
              >
                {categoryProducts.length}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg opacity-0"
                  whileHover={{ opacity: 0.2 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              <motion.div 
                className={`text-sm ${
                  (normalizedCategory === 'wavy' || normalizedCategory === 'curly') ? 'text-white/80 drop-shadow-sm' : 'text-muted-foreground'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2.5 }}
              >
                Products
              </motion.div>
            </motion.div>

            {/* Stat 2: 100% Natural */}
            <motion.div 
              className="text-center relative"
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 2.4,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
              whileHover={{ 
                scale: 1.1, 
                transition: { duration: 0.3 } 
              }}
            >
              <motion.div 
                className={`text-3xl font-bold relative ${
                  (normalizedCategory === 'wavy' || normalizedCategory === 'curly') ? 'text-white drop-shadow-md' : 'text-primary'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 2.5,
                  ease: [0.43, 0.13, 0.23, 0.96]
                }}
              >
                100%
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg opacity-0"
                  whileHover={{ opacity: 0.2 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              <motion.div 
                className={`text-sm ${
                  (normalizedCategory === 'wavy' || normalizedCategory === 'curly') ? 'text-white/80 drop-shadow-sm' : 'text-muted-foreground'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2.6 }}
              >
                Natural
              </motion.div>
            </motion.div>

            {/* Stat 3: Premium Quality */}
            <motion.div 
              className="text-center relative"
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 2.5,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
              whileHover={{ 
                scale: 1.1, 
                transition: { duration: 0.3 } 
              }}
            >
              <motion.div 
                className={`text-3xl font-bold relative ${
                  (normalizedCategory === 'wavy' || normalizedCategory === 'curly') ? 'text-white drop-shadow-md' : 'text-primary'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 2.6,
                  ease: [0.43, 0.13, 0.23, 0.96]
                }}
              >
                Premium
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg opacity-0"
                  whileHover={{ opacity: 0.2 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              <motion.div 
                className={`text-sm ${
                  (normalizedCategory === 'wavy' || normalizedCategory === 'curly') ? 'text-white/80 drop-shadow-sm' : 'text-muted-foreground'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2.7 }}
              >
                Quality
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Products Grid */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white relative">
        {/* Seamless background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/20 to-white opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
             <h2 className="fluid-text-3xl lg:fluid-text-4xl font-bold mb-4">
               {normalizedCategory === 'wavy' 
                 ? 'Heatless Curling Rod Collection'
                 : `Products for Your ${normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1)} Hair`
               }
             </h2>
            <p className="fluid-text-base lg:fluid-text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              {normalizedCategory === 'wavy' 
                ? 'Professional heatless curling rods for beautiful, damage-free curls'
                : 'Carefully selected products to enhance your natural hair texture'
              }
            </p>
          </motion.div>

          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <AnimatePresence mode="popLayout">
                {categoryProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                    transition={{ 
                      delay: index * 0.1, 
                      duration: 0.6,
                      ease: [0.43, 0.13, 0.23, 0.96]
                    }}
                    className="group bg-transparent cursor-pointer flex flex-col items-center text-center"
                    onClick={() => navigate(`/product/${product.id}`)}
                    whileHover={{ 
                      y: -8,
                      scale: 1.02,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Floating Product Image */}
                    <div className="relative mb-6">
                      <motion.div
                        className="relative w-full max-w-xs mx-auto overflow-hidden"
                        style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.02))',
                        }}
                        whileHover={{
                          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.04))',
                          transition: { duration: 0.3 }
                        }}
                      >
                        <motion.img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-auto object-contain"
                          style={{
                            filter: 'contrast(1.1) brightness(1.05) saturate(1.1)',
                            mixBlendMode: 'normal',
                            backgroundColor: 'transparent',
                            backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)',
                          }}
                          whileHover={{
                            filter: 'contrast(1.15) brightness(1.08) saturate(1.15)',
                            transition: { duration: 0.3 }
                          }}
                        />
                        
                        {/* Advanced background masking system */}
                        <div className="absolute inset-0 pointer-events-none">
                          {/* Gradient overlay to blend white edges */}
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/3 to-transparent" />
                          {/* Edge softening */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/2 to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/2 to-transparent" />
                        </div>
                        
                        {/* Soft vignette effect to mask edges */}
                        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/10 pointer-events-none" />
                      </motion.div>

                      {/* Floating Category Badge */}
                      <div className="absolute -top-2 -left-2">
                        <span className="px-3 py-1 bg-white/40 backdrop-blur-sm text-xs font-semibold text-gray-700 rounded-full shadow-sm border border-white/20">
                          {product.category}
                        </span>
                      </div>

                      {/* Floating Featured Badge */}
                      {product.featured && (
                        <div className="absolute -top-2 -right-2">
                          <span className="px-3 py-1 bg-primary/80 backdrop-blur-sm text-primary-foreground text-xs font-semibold rounded-full shadow-sm border border-primary/15">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Minimalist Product Info */}
                    <div className="space-y-4 max-w-xs">
                      <h3 className="font-bold text-lg tracking-wide uppercase group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-muted-foreground text-sm font-light leading-relaxed">
                        {product.description[0]}
                      </p>
                      <div className="flex items-center justify-center gap-4 pt-2">
                        <span className="text-2xl font-bold text-primary">
                          {product.price}
                        </span>
                        <span className="text-sm text-muted-foreground font-light">
                          {product.size}
                        </span>
                      </div>
                      
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-6xl mb-4">💫</div>
              <h3 className="text-2xl font-semibold mb-4">Coming Soon</h3>
              <p className="text-muted-foreground mb-8">
                We're working on adding more products for {normalizedCategory} hair. Stay tuned!
              </p>
              <button
                onClick={() => navigate("/collection")}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                View All Products
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

// Special function to get heatless curling rod products
const getHeatlessCurlingRodProducts = (): Product[] => {
  // Import the images
  const product1Image = new URL('../assets/Heatless Hair Curling Rod/product-1.webp', import.meta.url).href;
  const product2Image = new URL('../assets/Heatless Hair Curling Rod/product-2.webp', import.meta.url).href;
  const product3Image = new URL('../assets/Heatless Hair Curling Rod/product-3.webp', import.meta.url).href;
  const product4Image = new URL('../assets/Heatless Hair Curling Rod/product-4.webp', import.meta.url).href;

  return [
    {
      id: "heatless-1",
      name: "Premium Heatless Curling Rod - Set of 4",
      price: "€29.99",
      image: product1Image,
      category: "Heatless Tools",
      hairType: "All Types",
      featured: true,
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
      name: "Deluxe Heatless Curling Rod - Large",
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
      name: "Professional Heatless Curling Rod - Medium",
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
      name: "Compact Heatless Curling Rod - Small",
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
    }
  ];
};
