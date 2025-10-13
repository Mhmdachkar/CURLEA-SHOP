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
      title: "Curlea® DreamCurl™ Collection",
      subtitle: "Effortless curls, no heat, no damage",
      description: "Professional curls made easy — protect your hair while you style.",
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
                  {word === "Curlea®" ? (
                    <motion.span
                      className="relative inline-block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                      initial={{ 
                        opacity: 0, 
                        scale: 0.8, 
                        rotateY: -180,
                        filter: "blur(10px)"
                      }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        rotateY: 0,
                        filter: "blur(0px)"
                      }}
                      transition={{
                        duration: 1.5,
                        delay: 0.5 + index * 0.15,
                        ease: [0.43, 0.13, 0.23, 0.96],
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        scale: 1.1, 
                        rotateY: 10,
                        transition: { duration: 0.4, ease: "easeOut" } 
                      }}
                      style={{
                        textShadow: "0 0 30px rgba(0,0,0,0.3)",
                        transformStyle: "preserve-3d"
                      }}
                    >
                      Curlea®
                      {/* Animated background glow */}
                      <motion.div
                        className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-accent/30 to-primary/20 rounded-lg blur-lg -z-10"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 1.2,
                          delay: 0.8 + index * 0.15,
                          ease: "easeOut"
                        }}
                        whileHover={{ 
                          scale: 1.2, 
                          opacity: 0.8,
                          transition: { duration: 0.3 }
                        }}
                      />
                      {/* Floating particles around Curlea */}
                      <motion.div
                        className="absolute -inset-4 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 + index * 0.15, duration: 0.8 }}
                      >
                        {[...Array(4)].map((_, particleIndex) => (
                          <motion.div
                            key={particleIndex}
                            className="absolute w-1 h-1 bg-accent/60 rounded-full"
                            style={{
                              left: `${20 + particleIndex * 20}%`,
                              top: `${30 + (particleIndex % 2) * 40}%`,
                            }}
                            animate={{
                              y: [0, -15, 0],
                              x: [0, 5, 0],
                              opacity: [0.6, 1, 0.6],
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 3 + particleIndex * 0.5,
                              repeat: Infinity,
                              delay: particleIndex * 0.2,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </motion.div>
                    </motion.span>
                  ) : (
                    word
                  )}
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
                 ? 'Effortless curls, no heat, no damage'
                 : `Products for Your ${normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1)} Hair`
               }
             </h2>
            <p className="fluid-text-base lg:fluid-text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              {normalizedCategory === 'wavy' 
                ? 'Professional curls made easy — protect your hair while you style.'
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
export const getHeatlessCurlingRodProducts = (): Product[] => {
  // Import the images
  const product1Image = new URL('../assets/Heatless Hair Curling Rod/product-1.webp', import.meta.url).href;
  const product2Image = new URL('../assets/Heatless Hair Curling Rod/product-2.webp', import.meta.url).href;
  const product3Image = new URL('../assets/Heatless Hair Curling Rod/product-3.webp', import.meta.url).href;
  const product4Image = new URL('../assets/Heatless Hair Curling Rod/product-4.webp', import.meta.url).href;
  const product5Image = new URL('../assets/Heatless Hair Curling Rod/product5/pppp1.webp', import.meta.url).href;
  const product6Image = new URL('../assets/Heatless Hair Curling Rod/product6/candy&marchmello.webp', import.meta.url).href;

  return [
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
             new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_bf658774-aed4-4c4a-be42-ef9707a47f3e.webp', import.meta.url).href,
             new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/IMG-3641.webp', import.meta.url).href
           ]
         },
    {
      id: "dreamcurl-short-set",
      name: "DreamCurl™ Short Set",
      price: "€24.99",
      image: product1Image,
      category: "DreamCurl™ Collection",
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
      images: [
        product1Image, // Rose Gold
        product2Image, // Royal Purple
        product3Image, // Olive Lux
        product4Image  // Earl Grey
      ]
    },
    {
      id: "dreamcurl-midi",
      name: "DreamCurl™ Midi",
      price: "€34.99",
      image: new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_purple.webp', import.meta.url).href,
      category: "DreamCurl™ Collection",
      hairType: "Short to Long",
      featured: true,
      description: [
        "Immerse yourself in the ultimate blend of luxury and comfort with CURLEA, the undisputed leader in the world of heatless curlers, where every night's sleep feels like resting on a cloud.",
        "Experience a new level of heatless hair styling with our 'Zero Heat' Heatless Curlers. At CURLEA, we get that your beauty sleep is crucial, especially when it comes to heatless overnight curls.",
        "That's why each of our handcrafted curlers is made to be extra soft, using the finest fabrics to keep your hair safe from friction as you snooze peacefully.",
        "You can count on us to prioritise your hair's health and your comfort all the way. With a wide-reaching influence in the social media community, CURLEA shines brightest among its imitators.",
        "Crafted from the finest 100% vegan Peau De Soie fabric, CURLEA's iconic heatless curler helps you create bouncy and voluminous heatless overnight curls.",
        "Tailored for short to long hair. Providing a tighter curl, our Midi size is the perfect choice for those in search of extended curl longevity.",
        "Crafted with sustainably sourced, ultra-soft fibres, our heatless curlers provide a night of sheer luxury and hair protection while championing a greener, brighter future.",
        "Elevate your hairstyle to new heights with CURLEA - your go-to for unmatched comfort, style, and luxury all in one.",
        "This set will include: 2 Hair Ties, 1 Midi Heatless Curler, 1 Hair Clip"
      ],
      ingredients: ["100% Vegan Peau De Soie Fabric", "Sustainably Sourced Ultra-Soft Fibres", "Glide-Safe Material"],
      size: "Midi Size",
      inStock: true,
      colors: ["CANDY", "LATTE", "MARSHMALLOW", "MULBERRY", "OLIVE"],
      video: new URL('../assets/Heatless Hair Curling Rod/midi_size/Screen Recording 2025-10-13 135516.mp4', import.meta.url).href,
      images: [
        new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_candy.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_latte.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_marshmello.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_purple.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_olive.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_guide.webp', import.meta.url).href
      ]
    },
    {
      id: "dreamcurl-jumbo",
      name: "DreamCurl™ JUMBO SIZE",
      price: "€39.99",
      image: new URL('../assets/Heatless Hair Curling Rod/Jumbo_size/latte_jumbo.webp', import.meta.url).href,
      category: "DreamCurl™ Collection",
      hairType: "All Types",
      featured: true,
      description: [
        "Jumbo Heatless Curler - by CURLEA",
        "For soft, voluminous waves with a looser curl shape. Designed for hair below the shoulders.",
        "It's easy to assume Jumbo means it's made for longer hair. But in reality, Jumbo refers to the thickness of the curler - not the length of your hair.",
        "This size was created for those who prefer a looser, more open curl shape, with soft volume and gentle movement instead of tight definition. Think less structure, more flow.",
        "At CURLEA, we were the first to design curlers by size.",
        "This is the curler that makes people say, 'What did you use?' And the one you'll feel proud to answer with: 'CURLEA.'",
        "Each set includes: 1 Jumbo Size Heatless Curler, 2 Matching Hair Ties, 1 Hair Clip for easy wrapping"
      ],
      ingredients: ["100% Vegan Peau De Soie Fabric", "Elongated Structured Fibres", "Premium Memory Foam"],
      size: "Jumbo Size",
      inStock: true,
      colors: ["LATTE", "CANDY", "OLIVE", "MULBERRY"],
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
};

// Helper function to get heatless curling rod product by ID
export const getHeatlessCurlingRodProductById = (id: string): Product | undefined => {
  return getHeatlessCurlingRodProducts().find(product => product.id === id);
};
