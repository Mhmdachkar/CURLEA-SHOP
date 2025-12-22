import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { getProductsByHairType, getCurlyHairCollectionProducts, Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useScrollToTop } from "@/hooks/useAdvancedScroll";
import { OptimizedImage } from "@/components/OptimizedImage";

// Import hero images for different categories
import heatlessHeroImage from "@/assets/hero-4.png";
import curlyHeroImage from "@/assets/curly hair collection/hero.png";
import curlyHeroImage1 from "@/assets/curly hair collection/hero1.png";
import curlyHeroImage2 from "@/assets/curly hair collection/hero2.png";
import curlyHeroImage3 from "@/assets/curly hair collection/hero3.png";

// Curly hair collection hero images array - using new images or fallback to original
const curlyHeroImages = [curlyHeroImage1, curlyHeroImage2, curlyHeroImage3];

// Placeholder requested path
const CURLY_PLACEHOLDER = new URL('../assets/curly hair collection/product4/placeholder.jpg', import.meta.url).href;

import { sanitizeCategory } from '@/utils/securityEnhanced';

export const CategoryPage = () => {
  const { category: rawCategory } = useParams();
  // Sanitize category from URL to prevent injection
  const category = rawCategory ? sanitizeCategory(rawCategory) : null;
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [curlyHeroIndex, setCurlyHeroIndex] = useState(0);

  // Validate and normalize category
  const validCategories = ['wavy', 'curly', 'straight'];
  const normalizedCategory = category?.toLowerCase();

  // Ensure page loads at top without scroll rendering
  useScrollToTop([category]);

  // Auto-advance curly hair hero images
  useEffect(() => {
    if (normalizedCategory === 'curly') {
      const interval = setInterval(() => {
        setCurlyHeroIndex((prevIndex) => (prevIndex + 1) % curlyHeroImages.length);
      }, 4000); // Change image every 4 seconds

      return () => clearInterval(interval);
    }
  }, [normalizedCategory]);

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
      subtitle: "",
      description: "Discover our curated collection of premium hair accessories specifically designed for curly hair. From comfortable hair clips to styling tools, each piece is crafted to enhance your natural curl pattern while providing comfort and style.",
      gradient: "from-amber-500/10 via-orange-500/20 to-red-500/10",
      accentColor: "text-amber-600"
    },
    straight: {
      title: "Curlea® Satin Rituals™ Collection",
      subtitle: "Coming Soon - Achieve smooth, sleek perfection",
      description: "Transform your straight hair with our premium collection designed for smoothness and shine. From smoothing treatments to lightweight styling products, achieve the sleek look you desire.",
      gradient: "from-slate-500/10 via-gray-500/20 to-zinc-500/10",
      accentColor: "text-slate-600",
      comingSoon: true
    }
  };

  // Handle Coming Soon category
  if (normalizedCategory === 'straight') {
    const config = categoryConfig[normalizedCategory as keyof typeof categoryConfig];
    return (
      <div className="min-h-screen bg-white relative">
        <Navbar />

        {/* Hero Section with Coming Soon */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background with gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`} />

          {/* Content */}
          <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-full px-8 py-4 border border-white/30 mb-8"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <span className="text-white font-semibold text-lg">Coming Soon</span>
                <motion.div
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.3
                  }}
                />
              </motion.div>

              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 ${config.accentColor}`}>
                {config.title}
              </h1>

              <p className="text-xl sm:text-2xl text-black mb-8 max-w-2xl mx-auto">
                {config.subtitle}
              </p>

              <p className="text-base sm:text-lg text-black mb-12 max-w-3xl mx-auto leading-relaxed">
                {config.description}
              </p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <button
                  onClick={() => navigate("/collection")}
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  Explore Available Collections
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-8 py-4 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-semibold"
                >
                  Back to Home
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>
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
        className={`relative overflow-hidden ${(normalizedCategory === 'wavy' || normalizedCategory === 'curly')
          ? 'bg-center bg-no-repeat'
          : `bg-gradient-to-br ${config.gradient} py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8`
          }`}
        style={{
          minHeight: (normalizedCategory === 'wavy' || normalizedCategory === 'curly') ? '100vh' : 'auto',
          width: '100%',
          imageRendering: '-webkit-optimize-contrast',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden'
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
      >
        {/* Hero Background Images with Smooth Transitions */}
        {(normalizedCategory === 'wavy' || normalizedCategory === 'curly') && (
          <AnimatePresence mode="wait">
            {/* For Curly Hair Collection - Multiple hero images with carousel */}
            {normalizedCategory === 'curly' ? (
              <motion.div
                key={`curly-hero-${curlyHeroIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.2,
                  ease: [0.43, 0.13, 0.23, 0.96]
                }}
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${curlyHeroImages[curlyHeroIndex]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            ) : (
              /* For Wavy Category - Single hero image */
              <motion.div
                key="wavy-hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${heatlessHeroImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            )}
          </AnimatePresence>
        )}

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

        <div className={`max-w-7xl mx-auto text-center relative z-10 ${(normalizedCategory === 'wavy' || normalizedCategory === 'curly')
          ? 'h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8'
          : ''
          }`}>
          {/* Animated Title with Word-by-Word Reveal - Sharp & Elegant */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.h1
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight leading-tight ${(normalizedCategory === 'wavy' || normalizedCategory === 'curly')
                ? 'text-white'
                : 'bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent'
                }`}
              style={{
                textShadow: (normalizedCategory === 'wavy' || normalizedCategory === 'curly')
                  ? '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)'
                  : 'none',
                fontFamily: "'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
                fontWeight: 900,
                letterSpacing: '-0.04em',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                filter: 'contrast(1.1) brightness(1.05)'
              }}
              initial={{ opacity: 0, y: 60, scale: 0.85, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{
                duration: 1.5,
                delay: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "spring",
                stiffness: 120,
                damping: 12
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

          {/* Animated Subtitle with Elegant Transition */}
          {config.subtitle && (
            <motion.p
              className={`text-lg sm:text-xl md:text-2xl mb-4 max-w-3xl mx-auto leading-relaxed px-4 font-normal ${(normalizedCategory === 'wavy' || normalizedCategory === 'curly')
                ? 'text-white'
                : 'text-gray-800'
                }`}
              style={{
                textShadow: (normalizedCategory === 'wavy' || normalizedCategory === 'curly')
                  ? '0 2px 15px rgba(0,0,0,0.4)'
                  : 'none',
                fontFamily: "'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                letterSpacing: '-0.02em'
              }}
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                duration: 1.2,
                delay: 1.2,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              {config.subtitle.split('').map((char, index) => (
                <motion.span
                  key={index}
                  className="inline-block"
                  initial={{ opacity: 0, y: 20, rotateY: -90 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 1.3 + index * 0.025,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{
                    scale: 1.15,
                    color: (normalizedCategory === 'wavy' || normalizedCategory === 'curly') ? '#fbbf24' : undefined,
                    textShadow: (normalizedCategory === 'wavy' || normalizedCategory === 'curly')
                      ? '0 0 20px rgba(251,191,36,0.8)'
                      : 'none',
                    transition: { duration: 0.25 }
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.p>
          )}

          {/* Animated Description with Staggered Lines - Sharp & Clean */}
          <motion.p
            className={`text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-6 px-4 font-light ${(normalizedCategory === 'wavy' || normalizedCategory === 'curly')
              ? 'text-white'
              : 'text-gray-700'
              }`}
            style={{
              textShadow: (normalizedCategory === 'wavy' || normalizedCategory === 'curly')
                ? '0 1px 8px rgba(0,0,0,0.3)'
                : 'none',
              fontFamily: "'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              lineHeight: '1.7',
              letterSpacing: '-0.01em'
            }}
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{
              duration: 1.0,
              delay: 1.8,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            {config.description.split('.').map((sentence, sentenceIndex) => (
              <motion.span
                key={sentenceIndex}
                className="block mb-2"
                initial={{ opacity: 0, x: -40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{
                  duration: 0.8,
                  delay: 1.9 + sentenceIndex * 0.15,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              >
                {sentence}{sentenceIndex < config.description.split('.').length - 1 ? '.' : ''}
              </motion.span>
            ))}
          </motion.p>

          {/* Animated Category Stats - Sharp & Professional */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Stat 1: Products Count */}
            <motion.div
              className="text-center relative group"
              initial={{ opacity: 0, y: 40, scale: 0.85, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{
                duration: 0.9,
                delay: 2.3,
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "spring",
                stiffness: 100,
                damping: 10
              }}
              whileHover={{
                scale: 1.15,
                y: -8,
                transition: { duration: 0.4, ease: "easeOut" }
              }}
            >
              <motion.div
                className={`text-4xl sm:text-5xl md:text-6xl font-black relative tracking-tight ${(normalizedCategory === 'wavy' || normalizedCategory === 'curly') ? 'text-white' : 'text-primary'
                  }`}
                style={{
                  textShadow: (normalizedCategory === 'wavy' || normalizedCategory === 'curly')
                    ? '0 4px 20px rgba(0,0,0,0.5), 0 0 30px rgba(0,0,0,0.3)'
                    : 'none',
                  fontFamily: "'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
                  fontWeight: 900,
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  letterSpacing: '-0.05em'
                }}
                initial={{ scale: 0, rotateY: -180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 2.4,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  type: "spring",
                  stiffness: 150,
                  damping: 12
                }}
              >
                {categoryProducts.length}
              </motion.div>
              <motion.div
                className={`text-xs sm:text-sm font-semibold uppercase tracking-wider mt-2 ${(normalizedCategory === 'wavy' || normalizedCategory === 'curly') ? 'text-white' : 'text-gray-600'
                  }`}
                style={{
                  textShadow: (normalizedCategory === 'wavy' || normalizedCategory === 'curly')
                    ? '0 1px 8px rgba(0,0,0,0.4)'
                    : 'none',
                  fontFamily: "'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  letterSpacing: '0.1em'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.5 }}
              >
                Products
              </motion.div>
            </motion.div>

            {/* Stat 2: 100% Natural */}
            <motion.div
              className="text-center relative group"
              initial={{ opacity: 0, y: 40, scale: 0.85, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{
                duration: 0.9,
                delay: 2.4,
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "spring",
                stiffness: 100,
                damping: 10
              }}
              whileHover={{
                scale: 1.15,
                y: -8,
                transition: { duration: 0.4, ease: "easeOut" }
              }}
            >
              <motion.div
                className={`text-4xl sm:text-5xl md:text-6xl font-black relative tracking-tight ${(normalizedCategory === 'wavy' || normalizedCategory === 'curly') ? 'text-white' : 'text-primary'
                  }`}
                style={{
                  textShadow: (normalizedCategory === 'wavy' || normalizedCategory === 'curly')
                    ? '0 4px 20px rgba(0,0,0,0.5), 0 0 30px rgba(0,0,0,0.3)'
                    : 'none',
                  fontFamily: "'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
                  fontWeight: 900,
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  letterSpacing: '-0.05em'
                }}
                initial={{ scale: 0, rotateY: -180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 2.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  type: "spring",
                  stiffness: 150,
                  damping: 12
                }}
              >
                100%
              </motion.div>
              <motion.div
                className={`text-xs sm:text-sm font-semibold uppercase tracking-wider mt-2 ${(normalizedCategory === 'wavy' || normalizedCategory === 'curly') ? 'text-white' : 'text-gray-600'
                  }`}
                style={{
                  textShadow: (normalizedCategory === 'wavy' || normalizedCategory === 'curly')
                    ? '0 1px 8px rgba(0,0,0,0.4)'
                    : 'none',
                  fontFamily: "'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  letterSpacing: '0.1em'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.6 }}
              >
                Natural
              </motion.div>
            </motion.div>

            {/* Stat 3: Premium Quality */}
            <motion.div
              className="text-center relative group"
              initial={{ opacity: 0, y: 40, scale: 0.85, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{
                duration: 0.9,
                delay: 2.5,
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "spring",
                stiffness: 100,
                damping: 10
              }}
              whileHover={{
                scale: 1.15,
                y: -8,
                transition: { duration: 0.4, ease: "easeOut" }
              }}
            >
              <motion.div
                className={`text-4xl sm:text-5xl md:text-6xl font-black relative tracking-tight ${(normalizedCategory === 'wavy' || normalizedCategory === 'curly') ? 'text-white' : 'text-primary'
                  }`}
                style={{
                  textShadow: (normalizedCategory === 'wavy' || normalizedCategory === 'curly')
                    ? '0 4px 20px rgba(0,0,0,0.5), 0 0 30px rgba(0,0,0,0.3)'
                    : 'none',
                  fontFamily: "'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
                  fontWeight: 900,
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  letterSpacing: '-0.05em'
                }}
                initial={{ scale: 0, rotateY: -180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 2.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  type: "spring",
                  stiffness: 150,
                  damping: 12
                }}
              >
                Premium
              </motion.div>
              <motion.div
                className={`text-xs sm:text-sm font-semibold uppercase tracking-wider mt-2 ${(normalizedCategory === 'wavy' || normalizedCategory === 'curly') ? 'text-white' : 'text-gray-600'
                  }`}
                style={{
                  textShadow: (normalizedCategory === 'wavy' || normalizedCategory === 'curly')
                    ? '0 1px 8px rgba(0,0,0,0.4)'
                    : 'none',
                  fontFamily: "'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  letterSpacing: '0.1em'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.7 }}
              >
                Quality
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Navigation Dots for Curly Hair Collection Hero Images */}
        {normalizedCategory === 'curly' && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
            {curlyHeroImages.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurlyHeroIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${curlyHeroIndex === index
                  ? 'bg-white w-8'
                  : 'bg-white/40 hover:bg-white/60'
                  }`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        )}
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
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
                    className={`group bg-transparent flex flex-col items-center text-center ${product.comingSoon ? 'pointer-events-none' : 'cursor-pointer'}`}
                    onClick={product.comingSoon ? undefined : () => navigate(`/product/${product.id}`)}
                    whileHover={product.comingSoon ? {} : {
                      y: -8,
                      scale: 1.02,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    whileTap={product.comingSoon ? {} : { scale: 0.98 }}
                  >
                    {/* Floating Product Image */}
                    <div className="relative mb-3 sm:mb-6 w-full">
                      <motion.div
                        className="relative w-full mx-auto overflow-hidden aspect-square"
                        style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.02))',
                        }}
                        whileHover={{
                          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.04))',
                          transition: { duration: 0.3 }
                        }}
                      >
                        <OptimizedImage
                          src={product.image}
                          alt={product.name}
                          className={`w-full h-full object-cover ${product.comingSoon ? 'blur-sm grayscale' : ''}`}
                          onError={(e) => {
                            try { (e.currentTarget as HTMLImageElement).src = CURLY_PLACEHOLDER; } catch { }
                          }}
                        />

                        {/* Ultra-Premium Coming Soon Overlay */}
                        {product.comingSoon && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute inset-0 flex items-center justify-center z-10 overflow-hidden"
                            style={{
                              background: 'linear-gradient(135deg, rgba(250, 250, 250, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
                              backdropFilter: 'blur(20px) saturate(180%)',
                              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            }}
                          >
                            {/* Floating Gold Particles */}
                            {[...Array(8)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-1 h-1 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F2D06B]"
                                style={{
                                  left: `${Math.random() * 100}%`,
                                  top: `${Math.random() * 100}%`,
                                  boxShadow: '0 0 8px rgba(212, 175, 55, 0.6)',
                                }}
                                animate={{
                                  y: [0, -25, 0],
                                  x: [0, Math.random() * 15 - 7.5, 0],
                                  opacity: [0.3, 0.8, 0.3],
                                  scale: [1, 1.4, 1],
                                }}
                                transition={{
                                  duration: 2.5 + Math.random() * 1.5,
                                  repeat: Infinity,
                                  delay: Math.random() * 2,
                                  ease: "easeInOut"
                                }}
                              />
                            ))}

                            {/* Elegant shine effect */}
                            <motion.div
                              className="absolute inset-0"
                              animate={{
                                background: [
                                  'linear-gradient(120deg, transparent 30%, rgba(212, 175, 55, 0.08) 50%, transparent 70%)',
                                  'linear-gradient(120deg, transparent 30%, rgba(212, 175, 55, 0.08) 50%, transparent 70%)',
                                ],
                                backgroundPosition: ['-100% 0', '200% 0'],
                              }}
                              transition={{
                                duration: 3.5,
                                repeat: Infinity,
                                ease: "linear"
                              }}
                              style={{
                                backgroundSize: '200% 100%',
                              }}
                            />

                            {/* Premium borders */}
                            <div className="absolute inset-0">
                              <motion.div
                                className="absolute inset-0 rounded-lg"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, transparent 50%, rgba(212, 175, 55, 0.12) 100%)',
                                  backgroundSize: '200% 200%',
                                }}
                                animate={{
                                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                                }}
                                transition={{
                                  duration: 8,
                                  repeat: Infinity,
                                  ease: "linear"
                                }}
                              />
                              <div className="absolute inset-0 border border-[#D4AF37]/10" />
                              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
                            </div>

                            {/* Content */}
                            <div className="relative z-20 text-center px-2 sm:px-3 md:px-4 lg:px-6">
                              {/* Luxury Icon */}
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                  delay: 0.3,
                                  type: "spring",
                                  stiffness: 200,
                                  damping: 15
                                }}
                                className="mb-1.5 sm:mb-2 md:mb-3 lg:mb-4"
                              >
                                <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 mx-auto">
                                  <motion.div
                                    className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/20"
                                    animate={{ rotate: 360 }}
                                    transition={{
                                      duration: 20,
                                      repeat: Infinity,
                                      ease: "linear"
                                    }}
                                  />
                                  <div className="absolute inset-1.5 sm:inset-2 rounded-full bg-gradient-to-br from-[#D4AF37]/5 to-[#B5952F]/10 border border-[#D4AF37]/20 flex items-center justify-center backdrop-blur-sm">
                                    <motion.div
                                      animate={{ scale: [1, 1.15, 1] }}
                                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                      </svg>
                                    </motion.div>
                                  </div>
                                </div>
                              </motion.div>

                              {/* Exclusive Typography */}
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="space-y-1.5 sm:space-y-2"
                              >
                                <motion.div
                                  className="inline-block"
                                  animate={{
                                    boxShadow: [
                                      '0 0 0 0 rgba(212, 175, 55, 0)',
                                      '0 0 0 8px rgba(212, 175, 55, 0.1)',
                                      '0 0 0 0 rgba(212, 175, 55, 0)',
                                    ]
                                  }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 bg-gradient-to-r from-[#D4AF37]/10 via-[#F2D06B]/10 to-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] font-medium tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] uppercase text-[#B5952F] backdrop-blur-sm">
                                    Exclusive Launch
                                  </span>
                                </motion.div>

                                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-serif text-gray-900 tracking-tight" style={{ fontWeight: 300, letterSpacing: '0.02em' }}>
                                  Unveiling Soon
                                </h3>

                                <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-0.5 sm:py-1">
                                  <motion.div
                                    className="h-[1px] w-6 sm:w-8 md:w-10 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  />
                                  <motion.div
                                    className="w-0.5 h-0.5 sm:w-1 sm:h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#D4AF37]/60"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  />
                                  <motion.div
                                    className="h-[1px] w-6 sm:w-8 md:w-10 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                  />
                                </div>

                                <p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-500 font-light tracking-[0.08em] sm:tracking-[0.1em] md:tracking-[0.15em] uppercase px-1 sm:px-2">
                                  A New Addition to Our Collection
                                </p>
                              </motion.div>
                            </div>
                          </motion.div>
                        )}

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

                      {/* Floating Category Badge - Hidden on mobile for cleaner look */}
                      <div className="absolute -top-2 -left-2 hidden sm:block">
                        <span className="px-3 py-1 bg-white/40 backdrop-blur-sm text-xs font-semibold text-gray-700 rounded-full shadow-sm border border-white/20">
                          {product.category}
                        </span>
                      </div>
                    </div>

                    {/* Product Info - Hidden for Coming Soon */}
                    {!product.comingSoon && (
                      <div className="space-y-2 sm:space-y-4 w-full px-1 sm:px-0">
                        <h3 className="font-semibold text-xs sm:text-lg tracking-wide uppercase text-black transition-colors line-clamp-2 font-sharp-serif">
                          {product.name}
                        </h3>
                        <p className="text-[10px] sm:text-sm font-light leading-relaxed text-black line-clamp-2 sm:line-clamp-3 hidden sm:block">
                          {product.description[0]}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 pt-1 sm:pt-2">
                          <span className="text-sm sm:text-2xl font-semibold text-black font-sharp-serif">
                            {product.price}
                          </span>
                          <span className="text-[10px] sm:text-sm text-muted-foreground font-light">
                            {product.size}
                          </span>
                        </div>

                        {/* Color Options Display - Simplified on mobile */}
                        {product.colors && product.colors.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-1 sm:gap-2 pt-1 sm:pt-2">
                            {product.colors.slice(0, 2).map((color, index) => (
                              <span key={index} className="text-[9px] sm:text-xs bg-muted/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-muted-foreground">
                                {color}
                              </span>
                            ))}
                            {product.colors.length > 2 && (
                              <span className="text-[9px] sm:text-xs text-muted-foreground">
                                +{product.colors.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
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
    // DreamCurl™ Original Set - First in the collection
    {
      id: "dreamcurl-original",
      name: "DreamCurl™ Original Set",
      price: "$22.99",
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
    // DreamCurl™ Short Set - Second in the collection
    {
      id: "dreamcurl-short-set",
      name: "DreamCurl™ Single Set",
      price: "$16.99",
      image: product1Image,
      category: "DreamCurl™ Collection",
      hairType: "All Types",
      featured: true,
      description: [
        "The Single Set Collection - Perfect for every hair type and style",
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
    // DreamCurl™ Midi - Third in the collection
    {
      id: "dreamcurl-midi",
      name: "DreamCurl™ Midi",
      price: "$22.99",
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
      colors: ["CANDY", "LATTE", "MULBERRY", "OLIVE"],
      video: new URL('../assets/Heatless Hair Curling Rod/midi_size/Screen Recording 2025-10-13 135516.mp4', import.meta.url).href,
      images: [
        new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_candy.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_latte.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_purple.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_olive.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/midi_size/midi_guide.webp', import.meta.url).href
      ]
    },
    // DreamCurl™ JUMBO SIZE - Fourth in the collection
    {
      id: "dreamcurl-jumbo",
      name: "DreamCurl™ JUMBO SIZE",
      price: "$22.99",
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
    // ZERO HEAT SET MINI SIZE - Fifth product
    {
      id: "zero-heat-mini",
      name: "ZERO HEAT SET MINI SIZE",
      price: "$22.99",
      image: new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-olive.webp', import.meta.url).href,
      category: "DreamCurl™ Collection",
      hairType: "Short to Medium",
      featured: true,
      description: [
        "Our 'Zero Heat' Curling Rod is made out of the finest Peau De Soie fabric to help you achieve frizz-free shiny curls.",
        "The Zero Heat set includes:",
        "• 2 Scrunchies",
        "• 1 Curling Rod",
        "• 1 Hair Claw Clip",
        "We use sustainably grown materials to fill our Curling Rod which means that not only does it make our product extremely comfortable to sleep with, but it also takes us all a step closer to a cleaner and safer environment - now that's what I call a Win-Win!",
        "*Please note, we do our best to match the curler sets with our claw clips that we have in stock. If you wish to receive a specific colour please leave a note with your order and we'll do our best to accommodate",
        "Perfect for shorter hair or those who want tighter, more defined curls",
        "Compact design ideal for travel and everyday styling"
      ],
      ingredients: ["Finest Peau De Soie Fabric", "Sustainably Grown Materials", "Premium Fill"],
      size: "Mini Size",
      inStock: true,
      colors: ["OLIVE", "LATTE", "CANDY", "PURPLE"],
      images: [
        new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-olive.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-latte.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-candy.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-purple.webp', import.meta.url).href,
        new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-guide.webp', import.meta.url).href
      ]
    },
    // BUN BONS - Heatless Curling System - Sixth and final product
    {
      id: "heatless-5",
      name: "BUN BONS - Heatless Curling System",
      price: "$19.99",
      image: new URL('../assets/Heatless Hair Curling Rod/product5/pppp2.webp', import.meta.url).href,
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
      colors: ["MULBERRY", "CANDY", "LATTE", "OLIVE"],
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
    }
  ];
};

// Helper function to get heatless curling rod product by ID
export const getHeatlessCurlingRodProductById = (id: string): Product | undefined => {
  return getHeatlessCurlingRodProducts().find(product => product.id === id);
};
