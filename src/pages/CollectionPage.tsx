import { motion, AnimatePresence, useMotionValue, useTransform, useScroll } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Plus, ArrowRight } from "lucide-react";
import { QuickViewModal } from "@/components/QuickViewModal";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Navbar } from "@/components/Navbar";
import getTheWavyLook from "@/assets/getthewavylook.png";
import { products as allProducts, Product } from "@/data/products";


export const CollectionPage = () => {
  const navigate = useNavigate();
  const [showLoader, setShowLoader] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedHairType, setSelectedHairType] = useState("All Types");
  const [visibleCount, setVisibleCount] = useState(6);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory = selectedFilter === "All" || product.category === selectedFilter;
    const matchesHairType = selectedHairType === "All Types" || product.hairType === selectedHairType;
    return matchesCategory && matchesHairType;
  });

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

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

        {/* Interactive Filter Bar */}
        <InteractiveFilterBar
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          selectedHairType={selectedHairType}
          setSelectedHairType={setSelectedHairType}
        />

        {/* Dynamic Product Grid with Cursor Follower */}
        <ProductGridWithCursorFollower
          displayedProducts={displayedProducts}
          setQuickViewProduct={setQuickViewProduct}
          navigate={navigate}
          loadMore={loadMore}
          visibleCount={visibleCount}
          filteredProductsLength={filteredProducts.length}
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

// Shop the Look Section Component
const ShopTheLookSection = () => {
  const lookProducts = [
    {
      id: "2",
      name: "Curl Defining Cream",
      price: "€38.00",
      image: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=600&h=600&fit=crop",
    },
    {
      id: "7",
      name: "Repair & Shine Oil",
      price: "€48.00",
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop",
    },
    {
      id: "6",
      name: "Volume Boost Spray",
      price: "€29.00",
      image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&h=600&fit=crop",
    },
  ];

  return (
    <motion.section
      className="py-32 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden"
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
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
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
                width={800}
                height={600}
                quality={85}
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
                className="text-5xl md:text-6xl font-bold mb-6"
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
                className="text-xl text-muted-foreground leading-relaxed max-w-lg"
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
                  className="flex items-center gap-6 p-6 bg-card/50 backdrop-blur-sm rounded-2xl hover:bg-card/80 transition-all duration-500 cursor-pointer group relative overflow-hidden border border-border/20"
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
                    className="w-20 h-20 rounded-xl overflow-hidden bg-muted relative"
                    whileHover={{ rotateY: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.4 }}
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
                      className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors"
                      whileHover={{ x: 2 }}
                    >
                      {product.name}
                    </motion.h4>
                    <motion.p 
                      className="text-muted-foreground text-sm"
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
              className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
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
  const categories = ["All", "Shampoo", "Conditioner", "Serum", "Styling", "Treatment"];
  const hairTypes = ["All Types", "Straight", "Wavy", "Curly"];

  return (
        <motion.div
          className="max-w-7xl mx-auto px-6 py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.6 }}
        >
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
        {/* Category Filters */}
        <div className="flex flex-col items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
          <div className="flex flex-wrap gap-2 relative">
            {categories.map((filter) => (
                <motion.button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
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
                className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
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
  loadMore,
  visibleCount,
  filteredProductsLength
}: {
  displayedProducts: Product[];
  setQuickViewProduct: (product: Product | null) => void;
  navigate: (path: string) => void;
  loadMore: () => void;
  visibleCount: number;
  filteredProductsLength: number;
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
    <div className="max-w-7xl mx-auto px-6 pb-16 relative">
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Load More Button */}
      {visibleCount < filteredProductsLength && (
        <motion.div
          className="flex justify-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.button
            onClick={loadMore}
            className="px-12 py-4 bg-foreground text-background font-semibold rounded-md hover:bg-foreground/90 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Load More Products
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

// 3D Product Card Component
const ProductCard3D = ({ 
  product, 
  index, 
  setQuickViewProduct, 
  navigate, 
  onHover 
}: {
  product: Product;
  index: number;
  setQuickViewProduct: (product: Product | null) => void;
  navigate: (path: string) => void;
  onHover: (isHovering: boolean) => void;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
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
      ref={cardRef}
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
                    product.featured ? "md:col-span-2" : ""
                  }`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${mousePosition.y * -5}deg) rotateY(${mousePosition.x * 5}deg) translateZ(0)`,
        transformStyle: "preserve-3d",
      }}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Overlay Buttons */}
                    <motion.div
                      className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.button
                        onClick={() => setQuickViewProduct(product)}
                        className="px-6 py-3 bg-white text-black font-medium rounded-md flex items-center gap-2 hover:bg-white/90 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Eye className="w-4 h-4" />
                        Quick View
                      </motion.button>
                      <motion.button
                        className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="w-4 h-4" />
                        Add to Cart
                      </motion.button>
                    </motion.div>
                  </div>

                  <div className="p-6">
                    <h3
                      className="font-semibold text-xl mb-2 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.name}
                    </h3>
                    <p className="text-2xl font-light text-muted-foreground">
                      {product.price}
                    </p>
                  </div>
                </motion.div>
  );
};

// Hero Title Component with Word-by-Word Animation
const HeroTitle = ({ text }: { text: string }) => {
  const words = text.split(" ");

  return (
    <div className="mb-8">
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white drop-shadow-2xl inline-block mr-4"
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
      className="text-xl md:text-2xl lg:text-3xl text-white/95 mb-12 font-light leading-relaxed"
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

// Enhanced Hero CTA Button Component
const HeroCTAButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <motion.button
      ref={buttonRef}
      className="relative px-16 py-6 bg-white text-primary font-bold tracking-widest overflow-hidden group shadow-2xl text-lg md:text-xl"
      animate={{ 
        x: mousePosition.x, 
        y: mousePosition.y,
        scale: isHovered ? 1.05 : 1,
        opacity: 1
      }}
      transition={{ 
        type: "spring", 
        stiffness: 150, 
        damping: 15, 
        mass: 0.1,
        delay: 3.8, 
        duration: 1.0, 
        ease: "backOut"
      }}
      whileHover={{ 
        boxShadow: "0 25px 70px rgba(0,0,0,0.4)"
      }}
      whileTap={{ scale: 0.95 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 40, scale: 0.8 }}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-accent via-[hsl(35,80%,65%)] to-accent"
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "0%" : "-100%" }}
        transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
      />
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "100%" : "-100%" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      
      <span className="relative z-10 group-hover:text-white transition-colors duration-300 flex items-center gap-3">
        START THE QUIZ
        <motion.span
          animate={{ x: isHovered ? 8 : 0, rotate: isHovered ? 5 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl"
        >
          →
        </motion.span>
      </span>
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl bg-white/20"
        animate={{
          scale: isHovered ? [1, 1.2, 1] : 1,
          opacity: isHovered ? [0.3, 0.6, 0.3] : 0,
        }}
        transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
      />
    </motion.button>
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

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000); // 4 seconds rotation
    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <motion.section 
      ref={heroRef} 
      className="relative h-screen w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.8, duration: 0.6 }}
    >
      {/* Background Image Layer with Elegant Crossfade & Parallax */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="absolute inset-0"
          style={{ y }}
        >
          <div className="absolute inset-0 w-full h-full">
            <motion.img
              src={heroImages[currentImageIndex]}
              alt={`Curlea Collection Hero ${currentImageIndex + 1}`}
              className="w-full h-full object-cover object-center"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center'
              }}
              initial={{ scale: 1 }}
              animate={{ scale: 1.05 }}
              transition={{ duration: 8, ease: "easeOut" }}
            />
          </div>

          {/* Enhanced Multi-layer Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content with Subtle Parallax */}
      <motion.div 
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
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
          
          {/* Enhanced CTA Button */}
          <HeroCTAButton />
        </motion.div>
      </motion.div>

      {/* Enhanced Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {heroImages.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`h-1 rounded-full transition-all duration-500 ${
              index === currentImageIndex ? "w-12 bg-white" : "w-8 bg-white/40 hover:bg-white/60"
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </motion.section>
  );
};
