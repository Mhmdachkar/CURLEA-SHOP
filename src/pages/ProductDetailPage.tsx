import { motion, useInView } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { ArrowLeft, Minus, Plus, Play, CheckCircle, Leaf, Users, Heart } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { getProductById, getCurlyHairCollectionProductById, products, Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { validateProductId } from "@/utils/validation";

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

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

  // Check if it's a special product first
  const product = id?.startsWith('heatless-') 
    ? getHeatlessCurlingRodProductById(id)
    : id?.startsWith('curly-')
    ? getCurlyHairCollectionProductById(id)
    : getProductById(id);

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

  // Get related products (same category, excluding current product)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    try {
      setError(null);
      // Add multiple quantities to cart
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      openCart();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add to cart');
    }
  };

  const handleQuickAdd = (relatedProduct: Product) => {
    try {
      setError(null);
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
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          {/* Left: Product Info */}
          <motion.div
            layoutId={`product-info-${id}`}
            className="order-2 md:order-1"
          >
            <motion.h1
              layoutId={`product-name-${id}`}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              {product.name}
            </motion.h1>

            <motion.p
              layoutId={`product-price-${id}`}
              className="text-3xl text-muted-foreground font-light mb-8"
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
                    × {9 * quantity} pieces in total
                  </span>
                </motion.div>
              )}
            </div>

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
          </motion.div>

          {/* Right: Product Image Gallery */}
          <motion.div
            layoutId={`product-image-${id}`}
            className="order-1 md:order-2"
          >
            {product.id.startsWith('curly-') ? (
              <CurlyHairCollectionImageGallery product={product} />
            ) : (
              <motion.img
                layoutId={`product-img-${id}`}
                src={product.image}
                alt={product.name}
                className="w-full h-auto rounded-lg"
              />
            )}
          </motion.div>
        </div>

        {/* 1. The "Ritual in Motion" Video Section */}
        <RitualInMotionSection product={product} />

        {/* 2. The Interactive Step-by-Step Guide */}
        <InteractiveStepGuide product={product} />

        {/* 3. The "Science & Soul" Ingredient Spotlight */}
        <ScienceAndSoulSection product={product} />

        {/* 4. The "From Our Community" Showcase */}
        <CommunityShowcase product={product} />

        {/* Complete Your Routine */}
        <div>
          <h2 className="text-3xl font-bold mb-4">Complete Your Routine</h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-2xl">
            These products work synergistically with your selection to deliver optimal results for your hair.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {relatedProducts.map((relatedProduct, index) => (
              <motion.div
                key={relatedProduct.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-card rounded-lg overflow-hidden border border-border/50 hover:border-border transition-all duration-300"
              >
                <div
                  className="relative aspect-square overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                >
                  <motion.img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                
                <div className="p-6">
                  <h3
                    className="font-semibold text-xl mb-2 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/product/${relatedProduct.id}`)}
                  >
                    {relatedProduct.name}
                  </h3>
                  <p className="text-2xl font-light text-muted-foreground mb-4">
                    {relatedProduct.price}
                  </p>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickAdd(relatedProduct)}
                    className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Quick Add
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
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

  const heatlessProducts: Product[] = [
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

  return heatlessProducts.find(product => product.id === id);
};

// 1. The "Ritual in Motion" Video Section
const RitualInMotionSection = ({ product }: { product: Product }) => {
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Auto-play video when section comes into view
  useEffect(() => {
    if (isInView && videoRef.current && !isVideoPlaying) {
      videoRef.current.play().catch(() => {
        // Handle autoplay failure gracefully
        console.log('Autoplay prevented by browser');
      });
    }
  }, [isInView, isVideoPlaying]);

      // Check if it's a special product type
      const isHeatlessProduct = product.id.startsWith('heatless-');
      const isCurlyHairProduct = product.id.startsWith('curly-');
      
      // Import the appropriate video for special products
      const specialVideo = isHeatlessProduct 
        ? new URL('../assets/Heatless Hair Curling Rod/69fb9b50593547f3899618d65d85cec5.HD-1080p-7.2Mbps-11546034.mp4', import.meta.url).href
        : isCurlyHairProduct
        ? new URL('../assets/curly hair collection/Download (3).mp4', import.meta.url).href
        : null;

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
  };

  return (
    <motion.section
      ref={ref}
      className="py-24 px-6 bg-gradient-to-b from-background to-muted/20"
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
                {isHeatlessProduct 
                  ? "Heatless Curling in Motion" 
                  : isCurlyHairProduct
                  ? "Hair Clips in Action"
                  : "The Curlea Ritual in Motion"
                }
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {isHeatlessProduct 
                  ? "Watch how to achieve beautiful, damage-free curls with our innovative heatless curling rod."
                  : isCurlyHairProduct
                  ? "See how our comfortable curved resin hair clips work their magic for secure and stylish hair styling."
                  : "Experience the transformative power of our products as they work their magic on your hair."
                }
              </p>
        </motion.div>

            <motion.div
              className={`relative rounded-2xl overflow-hidden shadow-2xl ${
                (isHeatlessProduct || isCurlyHairProduct) && specialVideo 
                  ? "aspect-[16/10] min-h-[500px]" 
                  : "aspect-video"
              }`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {(isHeatlessProduct || isCurlyHairProduct) && specialVideo ? (
                <>
                  {/* Actual Video for Special Products */}
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
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
                        ? "See the hair clips in action"
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
  ] : [
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

  return (
    <motion.section
      ref={ref}
      className="py-24 px-6 bg-background"
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
      }
    };
    
    return ingredientMap[product.id] || ingredientMap['1'];
  };

  const ingredient = getPrimaryIngredient(product);

  return (
    <motion.section
      ref={ref}
      className="py-24 px-6 bg-gradient-to-b from-muted/20 to-background"
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
    {
      id: 1,
      image: new URL('../assets/curly hair collection/real result.png', import.meta.url).href,
      username: '@curlygirl_maria',
      caption: 'These hair clips are absolutely amazing! Perfect hold and so comfortable.',
      likes: 1247
    },
    {
      id: 2,
      image: new URL('../assets/curly hair collection/real result2.png', import.meta.url).href,
      username: '@wavyhairdaily',
      caption: 'Love how secure these clips hold my hair! Perfect for any occasion.',
      likes: 892
    },
    {
      id: 3,
      image: new URL('../assets/curly hair collection/real result3.png', import.meta.url).href,
      username: '@naturalbeauty_sofia',
      caption: 'Amazing quality and comfort. These clips are a game changer!',
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
      className="py-24 px-6 bg-background"
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

  // Import all curly hair collection images
  const curlyHairImages = [
    new URL('../assets/curly hair collection/p1.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/p2.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/p3.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/p4.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/p5.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/p6.jpg', import.meta.url).href,
    new URL('../assets/curly hair collection/p7.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/p8.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/p9.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/p10.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/p11.avif', import.meta.url).href,
    new URL('../assets/curly hair collection/p12.avif', import.meta.url).href,
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
        />
        
        {/* Image Counter */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
          {selectedImageIndex + 1} / {curlyHairImages.length}
        </div>
      </motion.div>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-6 gap-2">
        {curlyHairImages.map((image, index) => (
          <motion.button
            key={index}
            onClick={() => setSelectedImageIndex(index)}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
              selectedImageIndex === index
                ? 'border-primary shadow-lg'
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
              alt={`${product.name} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {selectedImageIndex === index && (
              <motion.div
                className="absolute inset-0 bg-primary/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Image Navigation Arrows */}
      <div className="flex justify-center gap-4">
        <motion.button
          onClick={() => setSelectedImageIndex((prev) => 
            prev === 0 ? curlyHairImages.length - 1 : prev - 1
          )}
          className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={curlyHairImages.length <= 1}
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        
        <motion.button
          onClick={() => setSelectedImageIndex((prev) => 
            prev === curlyHairImages.length - 1 ? 0 : prev + 1
          )}
          className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={curlyHairImages.length <= 1}
        >
          <ArrowLeft className="w-5 h-5 rotate-180" />
        </motion.button>
      </div>
    </div>
  );
};
