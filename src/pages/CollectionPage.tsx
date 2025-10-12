import React from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useScroll } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Plus, ArrowRight } from "lucide-react";
import { QuickViewModal } from "@/components/QuickViewModal";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Navbar } from "@/components/Navbar";
import getTheWavyLook from "@/assets/getthewavylook.png";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";

// Updated Product interface now supports video and images arrays

// Import all real products from both collections
const getAllProducts = (): Product[] => {
  // Heatless Hair Curling Rod products
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
      image: new URL('../assets/Heatless Hair Curling Rod/product-1.webp', import.meta.url).href,
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
      name: "DreamCurl™ Short Set – Earl Grey Edition",
      price: "€24.99",
      image: new URL('../assets/Heatless Hair Curling Rod/product-2.webp', import.meta.url).href,
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
      image: new URL('../assets/Heatless Hair Curling Rod/product-3.webp', import.meta.url).href,
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
      image: new URL('../assets/Heatless Hair Curling Rod/product-4.webp', import.meta.url).href,
      category: "Heatless Tools",
      hairType: "All Types",
      featured: false,
      description: [
        "Small size for tight, defined curls",
        "Perfect for short hair or detailed styling",
        "Lightweight and portable",
        "Creates spiral curls",
        "Easy to store and travel with"
      ],
      ingredients: ["Flexible Silicon", "Travel-friendly Design"],
      size: "Small",
      inStock: true,
    },
    {
      id: "heatless-5",
      name: "BUN BONS",
      price: "€34.99",
      image: new URL('../assets/Heatless Hair Curling Rod/product5/pppp1.webp', import.meta.url).href,
      category: "Heatless Tools",
    hairType: "All Types",
    featured: true,
      description: [
        "Revolutionary heatless curling solution",
        "Creates perfect buns and curls without heat damage",
        "Soft, comfortable material for overnight wear",
        "Easy to use and remove",
        "Suitable for all hair types and lengths"
      ],
      ingredients: ["Premium Silicon", "Hypoallergenic Coating"],
      size: "One Size",
      colors: ["MULBERRY", "CANDY", "LATTE", "OLIVE", "BUTTERMILK"],
      inStock: true,
    },
    {
      id: "heatless-6",
      name: "PEAU DE SOIE | XL OVERNIGHT BONNET",
      price: "€39.99",
      image: new URL('../assets/Heatless Hair Curling Rod/product6/candy&marchmello.webp', import.meta.url).href,
      category: "Heatless Tools",
    hairType: "All Types",
    featured: true,
      description: [
        "Luxurious satin bonnet for overnight hair protection",
        "Extra large size accommodates all hair lengths",
        "Prevents frizz and breakage while sleeping",
        "Soft, breathable satin material",
        "Maintains hairstyles and curl patterns"
      ],
      ingredients: ["Premium Satin", "Silk-like Finish"],
      size: "XL",
      colors: ["CANDY & MARSHMALLOW", "LATTE & MARSHMALLOW", "OLIVE & LATTE"],
      inStock: true,
    }
  ];

  // Curly Hair Collection products
  const curlyHairProducts: Product[] = [
    {
      id: "curly-clip-1",
      name: "Comfortable Curved Resin Hair Clip with Duckbill Grip and Strong Teeth New Flat Circular Hollow Design for Hair Styling",
      price: "€15.99",
      image: new URL('../assets/curly hair collection/product1/p1.jpg', import.meta.url).href,
      category: "Hair Accessories",
    hairType: "Curly",
      featured: true,
      description: [
        "Comfortable curved design with duckbill grip",
        "Strong teeth for secure hold without damage",
        "Flat circular hollow design for better styling",
        "Perfect for curly hair styling and management",
        "**Sold as complete set - includes 9 pieces total**",
        "Durable construction for long-lasting use"
      ],
      ingredients: ["High-Quality Resin", "Non-slip Coating"],
      size: "9-Piece Set",
      inStock: true,
    },
    {
      id: "curly-scarf-1",
      name: "MIO Elegant Scarf Soft Satin Elastic Hair Band Solid Color Fashion Ribbon Bow Hair Scrunchies Headdress Hair Ties for Women",
      price: "€12.99",
      image: new URL('../assets/curly hair collection/product2/pp1.jpg', import.meta.url).href,
      category: "Hair Accessories",
    hairType: "Curly",
      featured: false,
      description: [
        "Elegant satin scarf with soft elastic hair band",
        "Solid color fashion ribbon bow design",
        "Versatile hair scrunchies and headdress",
        "Perfect for women's hair styling",
        "**Comes in 7-piece set (quantity × 7)**",
        "Soft material prevents hair breakage"
      ],
      ingredients: ["Premium Satin", "Elastic Band", "Fashion Ribbon"],
      size: "7-Piece Set",
      inStock: true,
    },
    {
      id: "curly-claw-1",
      name: "HC027D Fashion Solid Elegant Neutral Geometric Flower Hair Claw Clips Large Matte Hair Claw Clamps for Woman Girls Thick Hair",
      price: "€18.99",
      image: new URL('../assets/curly hair collection/product3/ppp1.jpg', import.meta.url).href,
      category: "Hair Accessories",
      hairType: "Curly",
      featured: false,
      description: [
        "Fashion solid elegant neutral geometric flower design",
        "Large matte hair claw clips for thick hair",
        "Perfect for women and girls with thick hair",
        "Strong grip for secure hold",
        "**Comes as complete set - includes 16 pieces total**",
        "Versatile styling for various hair lengths"
      ],
      ingredients: ["High-Quality Plastic", "Matte Finish", "Strong Claw Mechanism"],
      size: "16-Piece Set",
      inStock: true,
    }
  ];

  return [...heatlessProducts, ...curlyHairProducts];
};


export const CollectionPage = () => {
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();
  const [showLoader, setShowLoader] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const allProducts = getAllProducts();

  // Display all products at once
  const displayedProducts = allProducts;

  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Signature Brand Loader */}
      <AnimatePresence>
        {showLoader && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
            <motion.div
              className="absolute inset-0 flex"
              initial={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            >
              <motion.div
                className="w-1/2 bg-foreground"
                exit={{ x: "-100%" }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              />
              <motion.div
                className="w-1/2 bg-foreground"
                exit={{ x: "100%" }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              />
            </motion.div>
            
            {/* Signature Brand Animation */}
            <motion.div
              className="z-10 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <CurleaBrandAnimation />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-background">
        {/* Hero Section with Rotating Images */}
        <HeroSectionWithRotation />

        {/* Shop the Look Section */}
        <ShopTheLookSection />

        {/* Beautiful Animated Title Section */}
        <BeautifulAnimatedTitle />

        {/* Dynamic Product Grid with Cursor Follower */}
        <ProductGridWithCursorFollower
          displayedProducts={displayedProducts}
          setQuickViewProduct={setQuickViewProduct}
          navigate={navigate}
          addToCart={addToCart}
          openCart={openCart}
        />
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

// Signature Brand Animation Component
const CurleaBrandAnimation = () => {
  const brandName = "Curlea";
  
  return (
    <div className="flex items-center justify-center">
      {brandName.split("").map((letter, index) => (
        <motion.span
          key={index}
          className="text-6xl md:text-8xl font-bold text-background drop-shadow-2xl"
          initial={{ 
            opacity: 0, 
            y: 60, 
            filter: "blur(10px)",
            scale: 0.8
          }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            filter: "blur(0px)",
            scale: 1
          }}
          exit={{ 
            opacity: 0, 
            y: -30,
            scale: 0.8
          }}
          transition={{
            duration: 0.8,
            delay: index * 0.15,
            ease: [0.43, 0.13, 0.23, 0.96],
          }}
          style={{
            textShadow: "0 0 30px rgba(0,0,0,0.3)"
          }}
        >
          {letter === "C" ? (
            <motion.span
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
            >
              {letter}
            </motion.span>
          ) : (
            letter
          )}
        </motion.span>
      ))}
    </div>
  );
};

// Shop the Look Section Component - Updated with real products
const ShopTheLookSection = () => {
  const lookProducts = [
    {
      id: "heatless-1",
      name: "DreamCurl™ Short Set – Rose Gold Edition",
      price: "€29.99",
      image: new URL('../assets/Heatless Hair Curling Rod/product-1.webp', import.meta.url).href,
    },
    {
      id: "curly-clip-1",
      name: "Curved Resin Hair Clip - Duckbill Grip & Strong Teeth",
      price: "€15.99",
      image: new URL('../assets/curly hair collection/product1/p1.jpg', import.meta.url).href,
    },
    {
      id: "heatless-5",
      name: "BUN BONS",
      price: "€34.99",
      image: new URL('../assets/Heatless Hair Curling Rod/product5/pppp1.webp', import.meta.url).href,
    },
  ];

  return (
    <motion.section
      className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden"
          initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          {/* Model Image */}
          <motion.div
            className="relative aspect-[4/5] rounded-2xl overflow-hidden group"
            initial={{ opacity: 0, x: -80, rotateY: -15 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2, duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
            whileHover={{ 
              scale: 1.03,
              rotateY: 5,
              transition: { duration: 0.6, ease: "easeOut" }
            }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.div
              className="w-full h-full"
              initial={{ scale: 1.1 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <OptimizedImage
                src={getTheWavyLook}
                alt="Get the wavy look with Curlea"
                priority={true}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            />
            {/* Floating particles effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/30 rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 2) * 40}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            className="space-y-10 relative z-10"
            initial={{ opacity: 0, x: 80, rotateY: 15 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.4, duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
            <motion.h2
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                Get The{" "}
                <motion.span 
                  className="text-gradient-gold relative inline-block"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0, duration: 0.6, ease: "backOut" }}
                >
                  Wavy Look
                  <motion.div
                    className="absolute -inset-2 bg-gradient-to-r from-accent/20 to-[hsl(35,80%,65%)]/20 rounded-lg blur-sm -z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                  />
                </motion.span>
            </motion.h2>
              <motion.p 
                className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                Achieve effortless waves with our signature 3-step routine. 
                Each product is specifically formulated to enhance natural texture 
                and create lasting, beautiful results.
              </motion.p>
            </motion.div>

            {/* Product Cards */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
            >
              {lookProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="flex items-center gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-6 bg-card/50 backdrop-blur-sm rounded-2xl hover:bg-card/80 transition-all duration-500 cursor-pointer group relative overflow-hidden border border-border/20"
                  initial={{ opacity: 0, x: 50, rotateX: -10 }}
                  whileInView={{ opacity: 1, x: 0, rotateX: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    delay: 1.6 + index * 0.2, 
                    duration: 0.8,
                    ease: [0.43, 0.13, 0.23, 0.96]
                  }}
                  whileHover={{ 
                    x: 8, 
                    y: -4,
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                  
                  <motion.div 
                    className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl overflow-hidden relative"
                    whileHover={{ rotateY: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <OptimizedImage
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                  
                  <div className="flex-1 relative z-10">
                    <motion.h4 
                      className="font-semibold text-sm sm:text-base md:text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2"
                      whileHover={{ x: 2 }}
                    >
                      {product.name}
                    </motion.h4>
                    <motion.p 
                      className="text-muted-foreground text-xs sm:text-sm"
                      whileHover={{ x: 2 }}
                    >
                      {product.price}
                    </motion.p>
          </div>
                  
                  <motion.div
                    className="relative z-10"
                    whileHover={{ x: 4, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.div>
                </motion.div>
              ))}
        </motion.div>

            <motion.button
              className="px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base touch-target"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.5, duration: 0.6 }}
            >
              Shop This Look
            </motion.button>
          </motion.div>
        </div>
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
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6"
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
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground font-light max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 1.0, duration: 1.2 }}
            >
              <TypewriterText 
                text="Experience the original heatless curler that redefined the category. Professional curls made easy — protect your hair while you style."
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
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 1.8, duration: 1.0 }}
          >
            <motion.div
              className="text-center"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2"
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
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-accent mb-2"
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
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2"
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

// Product Grid with Cursor Follower Component
const ProductGridWithCursorFollower = ({ 
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

          <motion.div
        ref={gridRef}
            layout
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHoveringGrid(true)}
        onMouseLeave={() => {
          setIsHoveringGrid(false);
          setHoveredProduct(null);
        }}
        style={{ cursor: isHoveringGrid ? 'none' : 'auto' }}
          >
            <AnimatePresence mode="popLayout">
              {displayedProducts.map((product, index) => (
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
        </AnimatePresence>
      </motion.div>

    </div>
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
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    layout: { duration: 0.4 },
                  }}
                  className={`group relative bg-card rounded-lg overflow-hidden ${
                    product.featured ? "col-span-1 md:col-span-2" : ""
                  }`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${mousePosition.y * -5}deg) rotateY(${mousePosition.x * 5}deg) translateZ(0)`,
        transformStyle: "preserve-3d",
      }}
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center center',
                        display: 'block'
                      }}
                    />
                    
                    {/* Overlay Buttons */}
                    <motion.div
                      className="absolute inset-0 bg-black/40 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 p-2 sm:p-0"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.button
                        onClick={() => setQuickViewProduct(product)}
                        className="px-3 py-2 sm:px-6 sm:py-3 bg-white text-black font-medium rounded-md flex items-center gap-1 sm:gap-2 hover:bg-white/90 transition-colors text-xs sm:text-sm touch-target"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Quick View</span>
                        <span className="sm:hidden">View</span>
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
                        className="px-3 py-2 sm:px-6 sm:py-3 bg-primary text-primary-foreground font-medium rounded-md flex items-center gap-1 sm:gap-2 hover:bg-primary/90 transition-colors text-xs sm:text-sm touch-target"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Add to Cart</span>
                        <span className="sm:hidden">Add</span>
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
              transition={{ duration: 0.3 }}
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


// Hero Section with Rotating Images Component (using home page transition technique)
const HeroSectionWithRotation = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  
  // Import the specific hero images you requested
  const heroImages = [
    new URL('../assets/hero-1.png', import.meta.url).href,
    new URL('../assets/hero-2.png', import.meta.url).href,
    new URL('../assets/hero-3.png', import.meta.url).href,
  ];

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8], [1, 0.9, 0]);

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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
          style={{ 
            y,
            willChange: "transform, opacity",
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
                backfaceVisibility: "hidden"
              }}
            />
          </div>

          {/* Optimized Single Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/60" />
        </motion.div>
      </AnimatePresence>

      {/* Content with Optimized Parallax */}
      <motion.div 
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6"
        style={{ 
          opacity,
          willChange: "opacity",
          backfaceVisibility: "hidden",
          transform: "translateZ(0)"
        }}
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
