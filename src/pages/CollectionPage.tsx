import React from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useScroll } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Plus, ArrowRight } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Navbar } from "@/components/Navbar";
import { ElegantProductCard } from "@/components/ElegantProductCard";
import getTheWavyLook from "@/assets/getthewavylook.png";
import { Product, products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";


export const CollectionPage = () => {
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();
  
  // Check if coming from product detail page to skip animation
  const [showLoader, setShowLoader] = useState(() => {
    // Check if we're coming from a product detail page
    const isFromProductDetail = window.location.search.includes('from=product') || 
                                document.referrer.includes('/product/');
    return !isFromProductDetail; // Only show loader if NOT coming from product detail
  });
  
  // Elegant section animations with professional timing
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1] as any,
        staggerChildren: 0.1
      }
    }
  };

  // Scroll to top when page loads
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

  useEffect(() => {
    console.log("CollectionPage: Component mounted, showLoader:", showLoader);
    console.log("CollectionPage: Current URL:", window.location.pathname);
    
    // Only show animation if not coming from product detail page
    if (showLoader) {
    const timer = setTimeout(() => {
        console.log("CollectionPage: Hiding loader after 4000ms");
      setShowLoader(false);
      }, 4000);
    return () => clearTimeout(timer);
    }
  }, [showLoader]);

  // Display all products from the products.ts file
  const displayedProducts = products;

  return (
    <div className="min-h-screen bg-white" style={{ scrollBehavior: 'smooth' }}>
      <Navbar />
      {/* Modern Elegant Brand Loader */}
      <AnimatePresence mode="wait">
        {showLoader && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#000000',
              zIndex: 99999,
              width: '100vw',
              height: '100vh',
              overflow: 'hidden'
            }}
            >
              <CurleaBrandAnimation />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="bg-white"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section with Rotating Images */}
        <HeroSectionWithRotation />

        {/* Beautiful Animated Title Section */}
        <BeautifulAnimatedTitle />

        {/* Elegant Product Grid */}
        <ElegantProductGrid
          displayedProducts={displayedProducts}
          navigate={navigate}
        />

        {/* Shop the Look Section - Moved to bottom */}
        <ShopTheLookSection />
      </motion.div>
    </div>
  );
};

// Modern Elegant Brand Animation Component
const CurleaBrandAnimation = () => {
  const brandName = "CURLEA";
  
  return (
    <div 
      style={{ 
        position: 'relative', 
        zIndex: 100000,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'
      }}
    >
      {/* Animated Background Circles */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              borderRadius: '50%',
              border: `2px solid rgba(255,255,255,${0.1 - i * 0.015})`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              rotate: 360
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Main Brand Text */}
      <motion.div
        style={{
          fontSize: 'clamp(4rem, 12vw, 8rem)',
          fontWeight: 300,
          color: '#FFFFFF',
          fontFamily: 'Georgia, serif',
          letterSpacing: '0.3em',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
      >
      {brandName.split("").map((letter, index) => (
        <motion.span
          key={index}
            style={{ 
              display: 'inline-block',
              marginRight: '0.1em',
              position: 'relative'
            }}
          initial={{ 
            opacity: 0, 
              y: 100,
              rotateX: 90
          }}
          animate={{ 
            opacity: 1, 
            y: 0, 
              rotateX: 0
          }}
          transition={{
            duration: 0.8,
              delay: 0.8 + index * 0.15,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            >
              {letter}
            {/* Elegant underline effect */}
            <motion.div
              style={{
                position: 'absolute',
                bottom: '-10px',
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #FFFFFF, transparent)',
                transformOrigin: 'left'
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 0.6,
                delay: 1.2 + index * 0.15,
                ease: "easeOut"
              }}
            />
        </motion.span>
        ))}
      </motion.div>

      {/* Subtitle */}
      <motion.div
        style={{
          fontSize: '1.2rem',
          color: 'rgba(255,255,255,0.7)',
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '0.2em',
          marginTop: '2rem',
          textAlign: 'center'
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2, ease: "easeOut" }}
      >
        LUXURY HAIR CARE
      </motion.div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            background: 'rgba(255,255,255,0.6)',
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            y: [0, -50, -100]
          }}
          transition={{
            duration: 3,
            delay: Math.random() * 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

// Shop the Look Section Component - Updated with main collection products
const ShopTheLookSection = () => {
  const navigate = useNavigate();
  const [hoveredHotspot, setHoveredHotspot] = useState<number | null>(null);

  // Auto-hide mobile overlay after 3 seconds
  useEffect(() => {
    if (hoveredHotspot) {
      const timer = setTimeout(() => {
        setHoveredHotspot(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hoveredHotspot]);

  // Define hotspots with precise positioning for each product
  const hotspots = [
    {
      id: 1,
      name: "CURLEA Comb",
      productId: "curlea-comb",
      top: "68%",   // CURLEA Comb position
      left: "35%",
      description: "Professional Curl Styling"
    },
    {
      id: 2,
      name: "Curved Resin Hair Clip - Duckbill Grip & Strong Teeth",
      productId: "curly-clip-1",
      top: "58%",   // Hair clip position
      left: "45%",
      description: "Curved Resin Design with Duckbill Grip"
    },
    {
      id: 3,
      name: "DreamCurl™ Short Set",
      productId: "dreamcurl-short-set",
      top: "60%",   // Pink curler set on table
      left: "20%",
      description: "Heatless Curl Perfection"
    }
  ];

  return (
    <motion.section
      className="relative w-full py-16 sm:py-20 md:py-24 bg-gradient-to-b from-muted/10 to-white overflow-hidden"
          initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.6, 0.3, 0.6],
          rotate: [360, 180, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        {/* Section Header - Mobile Optimized */}
          <motion.div
          className="text-center mb-8 sm:mb-12 md:mb-16 px-2"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 text-foreground leading-tight">
            Shop the Look
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-2">
            Tap the circles to discover our featured products
          </p>
        </motion.div>

        {/* Interactive Image with Hotspots - Mobile Optimized */}
            <motion.div
          className="relative max-w-4xl sm:max-w-5xl mx-auto rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Base Image */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[4/3] md:aspect-[16/10]">
            <img
                src={getTheWavyLook}
              alt="Shop the Look - Hair Styling"
                className="w-full h-full object-cover"
              />

            {/* Interactive Hotspots */}
            {hotspots.map((hotspot, index) => (
            <motion.div 
                key={hotspot.id}
                className="absolute"
                  style={{
                  top: hotspot.top,
                  left: hotspot.left,
                  transform: "translate(-50%, -50%)"
                }}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.4 + index * 0.2,
                  type: "spring",
                  stiffness: 200
                }}
              >
                {/* Pulsing Ring Animation - Mobile Optimized */}
                <motion.div
                  className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full border-2 border-white"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.8, 0, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Hotspot Circle - Minimal Elegant Style */}
                <motion.button
                  className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group touch-manipulation"
                  onMouseEnter={() => setHoveredHotspot(hotspot.id)}
                  onMouseLeave={() => setHoveredHotspot(null)}
                  onTouchStart={() => setHoveredHotspot(hotspot.id)}
                  onClick={() => {
                    // On mobile, if overlay is showing, navigate to product
                    if (hoveredHotspot === hotspot.id) {
                      navigate(`/product/${hotspot.productId}`);
                    } else {
                      // On desktop hover or first mobile tap, show overlay
                      setHoveredHotspot(hotspot.id);
                    }
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingBag className="w-6 h-6 text-black" strokeWidth={1.6} />
                </motion.button>

                {/* Shop Now Overlay - Desktop */}
                <AnimatePresence>
                  {hoveredHotspot === hotspot.id && (
                  <motion.div 
                      className="hidden md:block absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-4 min-w-[240px] border border-gray-100 z-10"
                      initial={{ opacity: 0, x: -10, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -10, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Arrow pointer */}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent" />
                      
                      <h3 className="font-bold text-sm sm:text-base text-foreground mb-1">
                        {hotspot.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                        {hotspot.description}
                      </p>
                      <div className="bg-foreground text-background px-4 py-2 rounded-md text-center font-semibold text-sm hover:bg-accent transition-colors cursor-pointer">
                        SHOP NOW
          </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                  
                {/* Shop Now Overlay - Mobile Optimized */}
                <AnimatePresence>
                  {hoveredHotspot === hotspot.id && (
                  <motion.div
                      className="md:hidden absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl p-3 sm:p-4 min-w-[160px] sm:min-w-[180px] max-w-[200px] border border-gray-100 z-10"
                      initial={{ opacity: 0, y: -10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="font-bold text-xs sm:text-sm text-foreground mb-2 text-center leading-tight">
                        {hotspot.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3 text-center">
                        {hotspot.description}
                      </p>
                      <div 
                        className="bg-foreground text-background px-3 py-2 rounded-md text-center font-semibold text-xs sm:text-sm hover:bg-accent transition-colors cursor-pointer touch-manipulation"
                        onClick={() => navigate(`/product/${hotspot.productId}`)}
                      >
                        SHOP NOW
                      </div>
                  </motion.div>
                  )}
                </AnimatePresence>
                </motion.div>
              ))}
          </div>
        </motion.div>

        {/* CTA Below Image - Mobile Optimized */}
        <motion.div
          className="text-center mt-8 sm:mt-10 md:mt-12 px-4"
              initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
            >
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            Tap the circles to explore each product
          </p>
          </motion.div>
          </div>
    </motion.section>
  );
};

// Beautiful Animated Title Component
const BeautifulAnimatedTitle = () => {
  return (
    <motion.section
      className="relative py-20 sm:py-24 md:py-32 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
    >
      {/* Animated Background Elements */}
        <motion.div
        className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-l from-accent/10 to-primary/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.7, 0.4],
          rotate: [360, 180, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center">
          {/* Main Title with Staggered Animation */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.2, duration: 1.0, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="mb-8"
          >
            <motion.h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-black"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.4, duration: 1.2 }}
            >
              <AnimatedText text="Curlea® DreamCurl™ Collection" />
            </motion.h1>
          </motion.div>

          {/* Subtitle with Typewriter Effect */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.8, duration: 1.0 }}
            className="mb-12"
          >
              <motion.p
                className="text-sm sm:text-base md:text-lg lg:text-xl text-black font-light max-w-3xl mx-auto leading-relaxed px-4 sm:px-0"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 1.0, duration: 1.2 }}
              >
              <TypewriterText 
                text="Discover our complete collection featuring the original DreamCurl™ heatless curlers and premium curly hair accessories. Professional styling made easy — protect your hair while you style."
                speed={50}
              />
            </motion.p>
          </motion.div>

          {/* Decorative Line with Animation */}
          <motion.div
            className="flex items-center justify-center gap-8 mb-12"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 1.4, duration: 1.0 }}
          >
            <motion.div
              className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent flex-1 max-w-32"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 1.6, duration: 1.2 }}
            />
            <motion.div
              className="w-3 h-3 bg-primary rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="h-px bg-gradient-to-l from-transparent via-primary/50 to-transparent flex-1 max-w-32"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 1.6, duration: 1.2 }}
            />
          </motion.div>

          {/* Stats Section */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 md:gap-12 max-w-2xl mx-auto px-4 sm:px-0"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 1.8, duration: 1.0 }}
          >
            <motion.div
              className="text-center"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
            >
              <motion.div
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 2.0, duration: 0.8, ease: "backOut" }}
              >
                9+
              </motion.div>
              <motion.p
                className="text-sm sm:text-base text-muted-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 2.2, duration: 0.8 }}
              >
                Premium Products
              </motion.p>
            </motion.div>

            <motion.div
              className="text-center"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
            >
              <motion.div
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-accent mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 2.4, duration: 0.8, ease: "backOut" }}
              >
                100%
              </motion.div>
              <motion.p
                className="text-sm sm:text-base text-muted-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 2.6, duration: 0.8 }}
              >
                Heat-Free
              </motion.p>
            </motion.div>

            <motion.div
              className="text-center"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
            >
              <motion.div
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 2.8, duration: 0.8, ease: "backOut" }}
              >
                ∞
              </motion.div>
              <motion.p
                className="text-sm sm:text-base text-muted-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 3.0, duration: 0.8 }}
              >
                Possibilities
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

// Animated Text Component
const AnimatedText = ({ text }: { text: string }) => {
  const words = text.split(" ");

  return (
    <span className="relative">
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="relative inline-block mr-4"
          initial={{ 
            opacity: 0, 
            y: 50, 
            rotateX: -90,
            filter: "blur(10px)"
          }}
          whileInView={{ 
            opacity: 1, 
            y: 0, 
            rotateX: 0,
            filter: "blur(0px)"
          }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            duration: 1.2,
            delay: 0.6 + index * 0.2,
            ease: [0.43, 0.13, 0.23, 0.96],
          }}
          style={{
            textShadow: "0 0 40px rgba(0,0,0,0.1)",
            transformStyle: "preserve-3d",
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
              whileInView={{ 
                opacity: 1, 
                scale: 1, 
                rotateY: 0,
                filter: "blur(0px)"
              }}
              transition={{
                duration: 1.5,
                delay: 0.6 + index * 0.2,
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
              {word}
              {/* Enhanced animated background glow */}
              <motion.div
                className="absolute -inset-3 bg-gradient-to-r from-primary/30 via-accent/40 to-primary/30 rounded-xl blur-xl -z-10"
                initial={{ opacity: 0, scale: 0.3 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.8 + index * 0.2, duration: 1.2, ease: "easeOut" }}
                whileHover={{ 
                  scale: 1.3, 
                  opacity: 0.8,
                  transition: { duration: 0.3 }
                }}
              />
              {/* Floating particles around Curlea® */}
              <motion.div
                className="absolute -inset-6 pointer-events-none"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 1.2 + index * 0.2, duration: 0.8 }}
              >
                {[...Array(6)].map((_, particleIndex) => (
                  <motion.div
                    key={particleIndex}
                    className="absolute w-1.5 h-1.5 bg-accent/70 rounded-full"
                    style={{
                      left: `${15 + particleIndex * 15}%`,
                      top: `${25 + (particleIndex % 2) * 50}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      x: [0, 8, 0],
                      opacity: [0.7, 1, 0.7],
                      scale: [1, 1.3, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 4 + particleIndex * 0.5,
                      repeat: Infinity,
                      delay: particleIndex * 0.3,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </motion.div>
              {/* Pulsing ring effect */}
              <motion.div
                className="absolute -inset-4 border-2 border-primary/30 rounded-full"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  delay: 1.0 + index * 0.2,
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.span>
          ) : (
            word
          )}
        </motion.span>
      ))}
    </span>
  );
};

// Typewriter Text Component
const TypewriterText = ({ text, speed = 50 }: { text: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className="relative">
      {displayedText}
      <motion.span
        className="inline-block w-0.5 h-6 bg-primary ml-1"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </span>
  );
};

// Interactive Filter Bar Component
const InteractiveFilterBar = ({ 
  selectedFilter, 
  setSelectedFilter, 
  selectedHairType, 
  setSelectedHairType 
}: {
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  selectedHairType: string;
  setSelectedHairType: (type: string) => void;
}) => {
  const categories = ["All", "DreamCurl™ Collection", "Heatless Tools", "Hair Accessories"];
  const hairTypes = ["All Types", "Medium to Long", "All Types", "Curly"];

  return (
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.6 }}
        >
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center justify-center">
        {/* Category Filters */}
        <div className="flex flex-col items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
          <div className="flex flex-wrap gap-2 relative">
            {categories.map((filter) => (
                <motion.button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                className={`relative px-3 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 touch-target ${
                    selectedFilter === filter
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                animate={{
                  opacity: selectedFilter === filter ? 1 : 0.7
                }}
                >
                  {filter}
                {selectedFilter === filter && (
                  <motion.div
                    layoutId="category-underline"
                    className="absolute inset-0 bg-primary rounded-full -z-10"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
                </motion.button>
              ))}
            </div>
        </div>

        {/* Hair Type Filters */}
        <div className="flex flex-col items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Hair Type:</span>
          <div className="flex flex-wrap gap-2 relative">
            {hairTypes.map((type) => (
                <motion.button
                  key={type}
                  onClick={() => setSelectedHairType(type)}
                className={`relative px-3 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 touch-target ${
                    selectedHairType === type
                    ? "text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                animate={{
                  opacity: selectedHairType === type ? 1 : 0.7
                }}
                >
                  {type}
                {selectedHairType === type && (
                  <motion.div
                    layoutId="hairtype-underline"
                    className="absolute inset-0 bg-accent rounded-full -z-10"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
                </motion.button>
              ))}
            </div>
            </div>
          </div>
        </motion.div>
  );
};

// Old Product Grid with Cursor Follower Component (keeping for reference)
const ProductGridWithCursorFollowerOld = ({ 
  displayedProducts, 
  setQuickViewProduct, 
  navigate,
  addToCart,
  openCart
}: {
  displayedProducts: Product[];
  setQuickViewProduct: (product: Product | null) => void;
  navigate: (path: string) => void;
  addToCart: (item: any) => void;
  openCart: () => void;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHoveringGrid, setIsHoveringGrid] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Group products into repeating pattern: 1 big + 1 medium + 3 small
  const groupedProducts = [];
  for (let i = 0; i < displayedProducts.length; i += 5) {
    groupedProducts.push(displayedProducts.slice(i, i + 5));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16 relative">
      {/* Custom Cursor */}
      <motion.div
        className="fixed pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
          scale: isHoveringGrid ? 1 : 0,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <motion.div
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
          animate={{
            scale: hoveredProduct ? 1.5 : 1,
          }}
          style={{
            backgroundColor: hoveredProduct ? "hsl(var(--accent))" : "hsl(var(--primary))",
          }}
          transition={{ duration: 0.2 }}
        >
          {hoveredProduct && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <Eye className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Main Product Layout - Repeating Pattern */}
      <div className="space-y-8">
        {groupedProducts.map((group, groupIndex) => (
          <motion.div
            key={groupIndex}
            className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6"
            ref={groupIndex === 0 ? gridRef : undefined}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHoveringGrid(true)}
            onMouseLeave={() => {
              setIsHoveringGrid(false);
              setHoveredProduct(null);
            }}
            style={{ cursor: isHoveringGrid ? 'none' : 'auto' }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: groupIndex * 0.2 }}
          >
            {/* Big Card - 6 columns on large screens */}
            {group[0] && (
              <div className="lg:col-span-6">
                <FeaturedProductCard
                  product={group[0]}
                  setQuickViewProduct={setQuickViewProduct}
                  navigate={navigate}
                  addToCart={addToCart}
                  openCart={openCart}
                  onHover={(isHovering) => setHoveredProduct(isHovering ? group[0].id : null)}
                />
              </div>
            )}

            {/* Right Side - 6 columns */}
            <div className="lg:col-span-6 grid grid-cols-1 gap-4">
              {/* Medium Card - Full width of right side */}
              {group[1] && (
                <div>
                  <MediumProductCard
                    product={group[1]}
                    setQuickViewProduct={setQuickViewProduct}
                    navigate={navigate}
                    addToCart={addToCart}
                    openCart={openCart}
                    onHover={(isHovering) => setHoveredProduct(isHovering ? group[1].id : null)}
                  />
                </div>
              )}

              {/* 3 Small Cards - Grid */}
              {group.slice(2, 5).length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {group.slice(2, 5).map((product, index) => (
                    <ProductCard3D
                      key={product.id}
                      product={product}
                      index={index}
                      setQuickViewProduct={setQuickViewProduct}
                      navigate={navigate}
                      onHover={(isHovering) => setHoveredProduct(isHovering ? product.id : null)}
                      addToCart={addToCart}
                      openCart={openCart}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Featured Product Card Component
const FeaturedProductCard = ({ 
  product, 
  setQuickViewProduct, 
  navigate,
  addToCart,
  openCart,
  onHover
}: {
  product: Product;
  setQuickViewProduct: (product: Product | null) => void;
  navigate: (path: string) => void;
  addToCart: (item: any) => void;
  openCart: () => void;
  onHover: (isHovering: boolean) => void;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    
    setMousePosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    onHover(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="group relative bg-card rounded-lg overflow-hidden h-full shadow-lg hover:shadow-2xl transition-all duration-500"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${mousePosition.y * -1.5}deg) rotateY(${mousePosition.x * 1.5}deg) translateZ(0)`,
        transformStyle: "preserve-3d",
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-card/60 rounded-lg">
        {/* Enhanced Image Container */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-105"
            style={{
              filter: 'contrast(1.05) brightness(1.02) saturate(1.1)',
              imageRendering: 'auto' as const,
            }}
            loading="lazy"
            decoding="async"
          />
        </div>
        
        {/* Subtle Border for Definition */}
        <div className="absolute inset-0 rounded-lg border border-white/10 pointer-events-none" />
        
        {/* Enhanced Overlay Buttons */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 p-4"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          <motion.button
            onClick={() => setQuickViewProduct(product)}
            className="bg-white/95 backdrop-blur-sm text-black font-semibold rounded-xl px-6 py-3 flex items-center gap-2 hover:bg-white transition-all duration-200 shadow-xl group"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            style={{
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            }}
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm sm:text-base">Quick View</span>
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
              
              // Track add to cart event
              if (typeof window !== 'undefined' && (window as any).analytics) {
                const priceNumber = parseFloat(product.price.replace('€', ''));
                (window as any).analytics.trackCart('add', {
                  product_id: product.id,
                  title: product.name,
                  price: priceNumber,
                  quantity: 1,
                  total_value: priceNumber,
                });
              }
              
              openCart();
            }}
            className="bg-primary/95 backdrop-blur-sm text-primary-foreground font-semibold rounded-xl px-6 py-3 flex items-center gap-2 hover:bg-primary transition-all duration-200 shadow-xl group"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            style={{
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            }}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm sm:text-base">Add to Cart</span>
          </motion.button>
        </motion.div>
      </div>

      <div className="p-4 sm:p-6 md:p-8">
        <h3
          className="font-semibold text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3 cursor-pointer hover:text-primary transition-colors line-clamp-2"
          onClick={() => {
            // Track product view
            if (typeof window !== 'undefined' && (window as any).analytics) {
              (window as any).analytics.track('ProductViewed', {
                product_id: product.id,
                product_name: product.name,
                price: product.price,
                category: product.category,
                page: 'Collection'
              });
            }
            navigate(`/product/${product.id}`);
          }}
        >
          {product.name}
        </h3>
        <p className="text-xl sm:text-2xl md:text-3xl font-light text-muted-foreground mb-3">
          {product.price}
        </p>
        <p className="text-sm sm:text-base line-clamp-3 text-black">
          {product.description[0]}
        </p>
        {product.colors && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-muted-foreground">Colors:</span>
            {product.colors.slice(0, 3).map((color, index) => (
              <span key={index} className="text-xs bg-muted px-2 py-1 rounded-full">
                {color}
              </span>
            ))}
            {product.colors.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{product.colors.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Medium Product Card Component
const MediumProductCard = ({ 
  product, 
  setQuickViewProduct, 
  navigate,
  addToCart,
  openCart,
  onHover
}: {
  product: Product;
  setQuickViewProduct: (product: Product | null) => void;
  navigate: (path: string) => void;
  addToCart: (item: any) => void;
  openCart: () => void;
  onHover: (isHovering: boolean) => void;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    
    setMousePosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    onHover(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="group relative bg-card rounded-lg overflow-hidden h-full shadow-lg hover:shadow-2xl transition-all duration-500"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${mousePosition.y * -1}deg) rotateY(${mousePosition.x * 1}deg) translateZ(0)`,
        transformStyle: "preserve-3d",
      }}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-card/60 rounded-lg">
        {/* Enhanced Image Container */}
        <div className="absolute inset-2 rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain object-center transition-all duration-500 ease-out group-hover:scale-102"
            style={{
              filter: 'contrast(1.05) brightness(1.02) saturate(1.1)',
              imageRendering: 'auto' as const,
            }}
            loading="lazy"
            decoding="async"
          />
        </div>
        
        {/* Subtle Border for Definition */}
        <div className="absolute inset-0 rounded-lg border border-white/10 pointer-events-none" />
        
        {/* Enhanced Overlay Buttons */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-3"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          <motion.button
            onClick={() => setQuickViewProduct(product)}
            className="bg-white/95 backdrop-blur-sm text-black font-semibold rounded-lg px-4 py-2 flex items-center gap-1.5 hover:bg-white transition-all duration-200 shadow-lg group"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            }}
          >
            <Eye className="w-3 h-3 group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm">View</span>
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
              
              // Track add to cart event
              if (typeof window !== 'undefined' && (window as any).analytics) {
                const priceNumber = parseFloat(product.price.replace('€', ''));
                (window as any).analytics.trackCart('add', {
                  product_id: product.id,
                  title: product.name,
                  price: priceNumber,
                  quantity: 1,
                  total_value: priceNumber,
                });
              }
              
              openCart();
            }}
            className="bg-primary/95 backdrop-blur-sm text-primary-foreground font-semibold rounded-lg px-4 py-2 flex items-center gap-1.5 hover:bg-primary transition-all duration-200 shadow-lg group"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            }}
          >
            <Plus className="w-3 h-3 group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm">Add</span>
          </motion.button>
        </motion.div>
      </div>

      <div className="p-3 sm:p-4">
        <h3
          className="font-semibold text-sm sm:text-base mb-1 cursor-pointer hover:text-primary transition-colors line-clamp-2"
          onClick={() => {
            // Track product view
            if (typeof window !== 'undefined' && (window as any).analytics) {
              (window as any).analytics.track('ProductViewed', {
                product_id: product.id,
                product_name: product.name,
                price: product.price,
                category: product.category,
                page: 'Collection'
              });
            }
            navigate(`/product/${product.id}`);
          }}
        >
          {product.name}
        </h3>
        <p className="text-base sm:text-lg font-light text-muted-foreground">
          {product.price}
        </p>
      </div>
    </motion.div>
  );
};

// 3D Product Card Component
const ProductCard3D = React.forwardRef<HTMLDivElement, {
  product: Product;
  index: number;
  setQuickViewProduct: (product: Product | null) => void;
  navigate: (path: string) => void;
  onHover: (isHovering: boolean) => void;
  addToCart: (item: any) => void;
  openCart: () => void;
}>(({ product, index, setQuickViewProduct, navigate, onHover, addToCart, openCart }, ref) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ref && typeof ref !== 'function' && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);
      
      setMousePosition({ x: deltaX, y: deltaY });
    }
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    onHover(false);
  };

  return (
                <motion.div
      ref={ref}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    layout: { duration: 0.4 },
                    ease: [0.43, 0.13, 0.23, 0.96],
                  }}
                  className="group relative bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${mousePosition.y * -1}deg) rotateY(${mousePosition.x * 1}deg) translateZ(0)`,
        transformStyle: "preserve-3d",
      }}
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-card/60">
                    {/* Enhanced Image Container */}
                    <div className="absolute inset-1.5 rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain object-center transition-all duration-500 ease-out group-hover:scale-102"
                        style={{
                          filter: 'contrast(1.05) brightness(1.02) saturate(1.1)',
                          imageRendering: 'auto' as const,
                        }}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    
                    {/* Subtle Border for Definition */}
                    <div className="absolute inset-0 rounded-lg border border-white/10 pointer-events-none" />
                    
                    {/* Enhanced Overlay Buttons */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col items-end justify-between p-2"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
                    >
                      {/* Top Row - Quick View Button */}
                      <motion.button
                        onClick={() => setQuickViewProduct(product)}
                        className="bg-white/95 backdrop-blur-sm text-black font-medium rounded-full p-2 shadow-lg hover:bg-white transition-all duration-200 flex items-center gap-1.5 group"
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}
                      >
                        <Eye className="w-3 h-3 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold hidden sm:block">View</span>
                      </motion.button>
                      
                      {/* Bottom Row - Add to Cart Button */}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                          
                          // Track add to cart event
                          if (typeof window !== 'undefined' && (window as any).analytics) {
                            const priceNumber = parseFloat(product.price.replace('€', ''));
                            (window as any).analytics.trackCart('add', {
                              product_id: product.id,
                              title: product.name,
                              price: priceNumber,
                              quantity: 1,
                              total_value: priceNumber,
                            });
                          }
                          
                          openCart();
                        }}
                        className="bg-primary/95 backdrop-blur-sm text-primary-foreground font-medium rounded-full p-2 shadow-lg hover:bg-primary transition-all duration-200 flex items-center gap-1.5 group"
                        whileHover={{ scale: 1.05, rotate: -2 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}
                      >
                        <Plus className="w-3 h-3 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-semibold hidden sm:block">Add</span>
                      </motion.button>
                    </motion.div>
                  </div>

                  <div className="p-3 sm:p-4 md:p-6">
                    <h3
                      className="font-semibold text-sm sm:text-base md:text-xl mb-1 sm:mb-2 cursor-pointer hover:text-primary transition-colors line-clamp-2"
                      onClick={() => {
                        // Track product view
                        if (typeof window !== 'undefined' && (window as any).analytics) {
                          (window as any).analytics.track('ProductViewed', {
                            product_id: product.id,
                            product_name: product.name,
                            price: product.price,
                            category: product.category,
                            page: 'Collection'
                          });
                        }
                        navigate(`/product/${product.id}`);
                      }}
                    >
                      {product.name}
                    </h3>
                    <p className="text-lg sm:text-xl md:text-2xl font-light text-muted-foreground">
                      {product.price}
                    </p>
                  </div>
                </motion.div>
  );
});

ProductCard3D.displayName = 'ProductCard3D';

// Hero Title Component with Word-by-Word Animation
const HeroTitle = ({ text }: { text: string }) => {
  const words = text.split(" ");

  return (
    <div className="mb-8">
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold text-white drop-shadow-2xl inline-block mr-2 sm:mr-4"
          initial={{ 
            opacity: 0, 
            y: 80, 
            rotateX: -90,
            filter: "blur(10px)"
          }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            rotateX: 0,
            filter: "blur(0px)"
          }}
          transition={{
            duration: 1.2,
            delay: 2.4 + index * 0.15,
            ease: [0.43, 0.13, 0.23, 0.96],
          }}
          style={{
            textShadow: "0 0 40px rgba(0,0,0,0.5)",
            transformStyle: "preserve-3d",
          }}
        >
          {word === "Perfect" ? (
            <motion.span
              className="relative inline-block"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
            >
              {word}
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-accent/30 to-[hsl(35,80%,65%)]/30 rounded-lg blur-sm -z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 3.2, duration: 0.8 }}
              />
            </motion.span>
          ) : (
            word
          )}
        </motion.span>
      ))}
        </div>
  );
};

// Hero Subtitle Component with Character-by-Character Reveal
const HeroSubtitle = ({ text }: { text: string }) => {
  const characters = text.split("");

  return (
    <motion.p 
      className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white/95 mb-8 sm:mb-12 font-light leading-relaxed px-4 sm:px-0"
      style={{ textShadow: "0 0 20px rgba(0,0,0,0.3)" }}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          className="inline-block"
          initial={{ 
            opacity: 0, 
            y: 30, 
            scale: 0.8,
            filter: "blur(5px)"
          }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            filter: "blur(0px)"
          }}
          transition={{
            duration: 0.6,
            delay: 3.0 + index * 0.03,
            ease: [0.43, 0.13, 0.23, 0.96],
          }}
          whileHover={{ 
            scale: 1.2, 
            color: "hsl(var(--accent))",
            y: -2,
            transition: { duration: 0.2 }
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.p>
  );
};


// Enhanced Hero Section with Professional Animations
const HeroSectionWithRotation = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  
  // Import the specific hero images you requested
  const heroImages = [
    new URL('../assets/hero-1.png', import.meta.url).href,
    new URL('../assets/hero-2.png', import.meta.url).href,
    new URL('../assets/hero-3.png', import.meta.url).href,
  ];

  // Optimized scroll-based parallax - REDUCED for smooth scrolling
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  // Reduce parallax intensity to prevent rendering issues
  const y = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const opacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.9, 0.5]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000); // 4 seconds rotation
    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <motion.section 
      ref={heroRef} 
      className="relative h-screen-safe sm:h-screen w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.8, duration: 0.6 }}
    >
      {/* Background Image Layer with Optimized Performance */}
      <AnimatePresence mode="sync">
            <motion.div
          key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.8, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="absolute inset-0"
          style={{ 
            y,
            willChange: "auto",
            backfaceVisibility: "hidden",
            transform: "translateZ(0)"
          }}
        >
          <div className="absolute inset-0 w-full h-full">
            <img
              src={heroImages[currentImageIndex]}
              alt={`Curlea Collection Hero ${currentImageIndex + 1}`}
              className="w-full h-full object-cover object-center"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
                willChange: "auto",
                backfaceVisibility: "hidden",
                transform: "translateZ(0)"
              }}
            />
          </div>

          {/* Optimized Single Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/60" />
        </motion.div>
      </AnimatePresence>

      {/* Content with Professional Fade */}
      <motion.div 
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6"
        style={{ opacity }}
      >
        <motion.div
          className="text-center max-w-4xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          {/* Main Title with Word-by-Word Animation */}
          <HeroTitle text="Discover Your Perfect Routine" />
          
          {/* Subtitle with Character-by-Character Reveal */}
          <HeroSubtitle text="Unlock the science of your unique hair" />
            </motion.div>
      </motion.div>

    </motion.section>
  );
};

// Elegant Product Grid Component
const ElegantProductGrid = ({ 
  displayedProducts, 
  navigate 
}: { 
  displayedProducts: Product[]; 
  navigate: (path: string) => void; 
}) => {
  const { addToCart } = useCart();

  const handleAddToCart = (product: { 
    id: string; 
    name: string; 
    price: string; 
    image: string; 
    activeColor: { name: string; bgClass: string } | null 
  }) => {
    console.log('🛒 Product added to cart:', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      image: product.image,
      selectedColor: product.activeColor ? product.activeColor.name : 'No color selected',
      colorClass: product.activeColor ? product.activeColor.bgClass : 'N/A'
    });

    // Add to cart logic
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      selectedColor: product.activeColor?.name
    });

    // Show beautiful success message
    toast.success(
      `Added to your cart! 🎉`,
      {
        duration: 3000,
        style: {
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          border: '2px solid #22c55e',
          boxShadow: '0 10px 40px rgba(34, 197, 94, 0.3), 0 0 20px rgba(34, 197, 94, 0.2)',
          padding: '20px 24px',
          borderRadius: '16px',
          fontSize: '16px',
          fontWeight: '600',
          color: '#065f46',
        },
        icon: '✨',
      }
    );
  };

  return (
    <motion.section
      className="py-8 sm:py-12 md:py-16 bg-white"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Creative Section Title - Mobile Optimized */}
        <motion.div
          className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20 px-2 sm:px-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent">
              Our Complete Collection
            </span>
          </motion.h2>
          
          <motion.p
            className="text-sm sm:text-base md:text-lg lg:text-xl text-black max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed mb-4 sm:mb-6 px-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover premium hair care essentials designed to elevate your styling routine
          </motion.p>

          {/* Decorative Divider - Mobile Optimized */}
          <motion.div
            className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="h-px w-8 sm:w-12 md:w-16 lg:w-20 xl:w-24 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent"></div>
            <div className="h-px w-8 sm:w-12 md:w-16 lg:w-20 xl:w-24 bg-gradient-to-l from-transparent via-accent to-transparent"></div>
          </motion.div>
        </motion.div>

        {/* Mobile-First Product Grid - Fully Responsive */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {displayedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              whileHover={{ y: -3 }}
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <ElegantProductCard
                {...product}
                onClick={() => navigate(`/product/${product.id}`)}
                onAddToCart={handleAddToCart}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};
