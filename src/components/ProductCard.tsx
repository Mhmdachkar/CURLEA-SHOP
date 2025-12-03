import { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { OptimizedImage } from "./OptimizedImage";
import { Check } from "lucide-react";
import { toast } from "sonner";

// Shopping Bag Icon (from Heroicons)
const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
    />
  </svg>
);

interface ColorOption {
  name: string;
  bgClass: string;
}

interface ProductCardProps extends Product {
  onClick?: () => void;
  onAddToCart?: (product: { id: string; name: string; price: string; image: string; activeColor: ColorOption | null }) => void;
}

// Helper function to format color names for display
const formatColorName = (color: string): string => {
  const displayMap: Record<string, string> = {
    'CANDY': 'Candy',
    'LATTE': 'Latte',
    'MULBERRY': 'Mulberry',
    'OLIVE': 'Olive',
    'BUTTERMILK': 'Buttermilk',
    'GOLD': 'Gold',
    'PRINT': 'Print',
    'ROSE GOLD': 'Rose Gold',
    'ROYAL PURPLE': 'Royal Purple',
    'OLIVE LUX': 'Olive Lux',
    'EARL GREY': 'Earl Grey',
    'CANDY&MARCHMELLO': 'Candy & Marshmallow',
    'OLIVE&LATTE': 'Olive & Latte',
    'candy&marchmello': 'Candy & Marshmallow',
    'olive&latte': 'Olive & Latte'
  };

  return displayMap[color.toUpperCase()] || color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
};

// Helper function to convert product colors to color options
const getColorOptions = (colors?: string[]): ColorOption[] => {
  if (!colors || colors.length === 0) return [];

  const colorMap: Record<string, string> = {
    'grey': 'bg-gray-400',
    'gray': 'bg-gray-400',
    'black': 'bg-black',
    'white': 'bg-white',
    'mulberry': 'bg-purple-700',
    'candy': 'bg-pink-400',
    'latte': 'bg-amber-200',
    'olive': 'bg-green-700',
    'rose gold': 'bg-rose-300',
    'royal purple': 'bg-purple-600',
    'olive lux': 'bg-green-800',
    'earl grey': 'bg-gray-500',
    'candy&marchmello': 'bg-pink-200',
    'olive&latte': 'bg-green-600',
    'gold': 'bg-yellow-500',
    'print': 'bg-gray-300'
  };

  return colors.map(color => ({
    name: color,
    bgClass: colorMap[color.toLowerCase()] || 'bg-gray-400'
  }));
};

// Helper function to get color-specific image based on product ID and color
const getColorVariantImage = (productId: string, colorName: string, defaultImage: string, images?: string[]): string => {
  // Color to image mapping for specific products
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
      'Mulberry': new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_3b575993-8e6a-413e-9f88-d95395c19980.webp', import.meta.url).href,
      'Candy': new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_686ff861-b01d-41ef-9c4c-0684df944cd6.webp', import.meta.url).href,
      'Latte': new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/FullSizeRender_bf658774-aed4-4c4a-be42-ef9707a47f3e.webp', import.meta.url).href,
      'Olive': new URL('../assets/Heatless Hair Curling Rod/PRODUCT7/CFE0DE6D-F7E6-42F3-91A4-16C049F5ADA9.webp', import.meta.url).href
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
    },
    'zero-heat-mini': {
      'OLIVE': new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-olive.webp', import.meta.url).href,
      'LATTE': new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-latte.webp', import.meta.url).href,
      'CANDY': new URL('../assets/Heatless Hair Curling Rod/mini-size/mini-candy.webp', import.meta.url).href
    }
  };

  // Return color-specific image if available, otherwise return default
  const productColorMap = colorImageMap[productId];
  if (productColorMap && productColorMap[colorName]) {
    return productColorMap[colorName];
  }

  // Fallback: try to map by color index if images array is available
  if (images && images.length > 0) {
    const colorIndex = ['Rose Gold', 'Royal Purple', 'Olive Lux', 'Earl Grey', 'Candy', 'Latte', 'Mulberry', 'Olive', 'Purple'].indexOf(colorName);
    if (colorIndex >= 0 && colorIndex < images.length) {
      return images[colorIndex];
    }
  }

  return defaultImage;
};

const ProductCardComponent = ({
  id,
  name,
  price,
  image,
  colors,
  images,
  comingSoon,
  onClick,
  onAddToCart
}: ProductCardProps) => {
  const { addToCart, openCart } = useCart();

  const colorOptions = getColorOptions(colors);

  // Set default active color (special cases for Trending section cards)
  const getInitialColor = (): ColorOption | null => {
    if (colorOptions.length === 0) return null;
    if (id === 'dreamcurl-short-set') {
      const royalPurple = colorOptions.find(c => c.name.toLowerCase() === 'royal purple');
      if (royalPurple) return royalPurple;
    }
    if (id === 'dreamcurl-midi') {
      const candy = colorOptions.find(c => c.name.toUpperCase() === 'CANDY');
      if (candy) return candy;
    }
    return colorOptions[0];
  };

  const [activeColor, setActiveColor] = useState<ColorOption | null>(getInitialColor());

  // Track which color swatch is being hovered for tooltip
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  // Get the current image based on selected color
  const currentImage = activeColor
    ? getColorVariantImage(id, activeColor.name, image, images)
    : image;

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    // Call the onAddToCart prop if provided
    if (onAddToCart) {
      onAddToCart({
        id,
        name,
        price,
        image: currentImage,
        activeColor
      });
    } else {
      // Fallback to default cart behavior
      addToCart({
        id,
        name,
        price,
        image: currentImage,
        selectedColor: activeColor?.name
      });
    }

    // Automatically open cart dashboard
    openCart();

    // Show elegant success toast with larger product image
    toast.success(
      name,
      {
        description: `Added to your shopping cart${activeColor ? ` • ${formatColorName(activeColor.name)}` : ''}`,
        duration: 3000,
        icon: (
          <img
            src={currentImage}
            alt={name}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              objectFit: 'cover',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
            }}
          />
        ),
        style: {
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.1)',
          padding: '20px 24px',
          borderRadius: '12px',
          color: '#ffffff',
          minWidth: '380px',
        },
        className: 'elegant-toast',
      }
    );

    // Automatically open cart dashboard
    openCart();
  }, [id, name, price, currentImage, activeColor, onAddToCart, addToCart, openCart]);

  const handleColorSelect = useCallback((e: React.MouseEvent, color: ColorOption) => {
    e.stopPropagation();
    setActiveColor(color);
  }, []);

  const handleColorHover = useCallback((colorName: string) => {
    setHoveredColor(colorName);
  }, []);

  const handleColorLeave = useCallback(() => {
    setHoveredColor(null);
  }, []);

  return (
    <motion.div
      className={`w-full bg-white rounded-lg shadow-md overflow-hidden flex flex-col ${comingSoon ? 'pointer-events-none' : 'cursor-pointer hover:shadow-xl'} transition-shadow duration-300 relative`}
      whileHover={comingSoon ? {} : { y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={comingSoon ? undefined : onClick}
    >

      {/* 1. Product Image - 1:1 Aspect Ratio */}
      <div className="relative w-full aspect-square">
        <OptimizedImage
          src={currentImage}
          alt={name}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${comingSoon ? 'blur-sm grayscale' : ''}`}
        />

        {/* Ultra-Premium Coming Soon Overlay */}
        {comingSoon && (
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
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F2D06B]"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  boxShadow: '0 0 8px rgba(212, 175, 55, 0.6)',
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
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
                duration: 4,
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
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, transparent 50%, rgba(212, 175, 55, 0.15) 100%)',
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
              <div className="absolute inset-0 border-2 border-[#D4AF37]/10 rounded-lg" />
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-20 text-center px-2 sm:px-4 md:px-6 lg:px-8">
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
                className="mb-2 sm:mb-3 md:mb-4 lg:mb-6"
              >
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 mx-auto">
                  {/* Rotating outer ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/20"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  {/* Inner circle with icon */}
                  <div className="absolute inset-1.5 sm:inset-2 rounded-full bg-gradient-to-br from-[#D4AF37]/5 to-[#B5952F]/10 border border-[#D4AF37]/20 flex items-center justify-center backdrop-blur-sm">
                    <motion.div
                      animate={{
                        scale: [1, 1.15, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
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
                className="space-y-2 sm:space-y-2.5 md:space-y-3"
              >
                {/* Badge */}
                <motion.div
                  className="inline-block"
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(212, 175, 55, 0)',
                      '0 0 0 8px rgba(212, 175, 55, 0.1)',
                      '0 0 0 0 rgba(212, 175, 55, 0)',
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5 lg:px-4 bg-gradient-to-r from-[#D4AF37]/10 via-[#F2D06B]/10 to-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] font-medium tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] uppercase text-[#B5952F] backdrop-blur-sm">
                    Exclusive Launch
                  </span>
                </motion.div>

                {/* Main Title */}
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-serif text-gray-900 tracking-tight" style={{
                  fontWeight: 300,
                  letterSpacing: '0.02em'
                }}>
                  Unveiling Soon
                </h3>

                {/* Decorative divider */}
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 py-0.5 sm:py-1 md:py-1.5 lg:py-2">
                  <motion.div
                    className="h-[1px] w-6 sm:w-8 md:w-10 lg:w-12 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-0.5 h-0.5 sm:w-1 sm:h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#D4AF37]/60"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="h-[1px] w-6 sm:w-8 md:w-10 lg:w-12 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  />
                </div>

                {/* Subtitle */}
                <p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-500 font-light tracking-[0.08em] sm:tracking-[0.1em] md:tracking-[0.15em] uppercase px-1 sm:px-2">
                  A New Addition to Our Collection
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* 2. Product Details - Hidden for Coming Soon */}
      {!comingSoon && (
        <div className="p-4 flex justify-between items-start">

          {/* Left Side: Title, Price, Colors */}
          <div className="flex-1 pr-2">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-1 font-sharp-serif">
              {name}
            </h3>
            <p className="text-lg font-semibold text-gray-900 mt-1 font-sharp-serif">{price}</p>

            {/* 3. Enhanced Color Swatches */}
            {colorOptions.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap relative">
                {colorOptions.map((color) => {
                  const isSelected = activeColor?.name === color.name;
                  const isHovered = hoveredColor === color.name;

                  return (
                    <div key={color.name} className="relative">
                      <motion.button
                        type="button"
                        onClick={(e) => handleColorSelect(e, color)}
                        onMouseEnter={() => handleColorHover(color.name)}
                        onMouseLeave={handleColorLeave}
                        className={`
                        relative w-8 h-8 rounded-full flex-shrink-0
                        transition-all duration-200 ease-in-out
                        cursor-pointer
                        border-2 border-gray-200
                        ${color.bgClass}
                        ${isSelected
                            ? 'ring-2 ring-blue-600 ring-offset-2 shadow-lg'
                            : 'hover:scale-110 hover:shadow-md focus:ring-2 focus:ring-blue-600 focus:ring-offset-2'
                          }
                      `}
                        whileHover={{ scale: isSelected ? 1 : 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Select color ${color.name}`}
                        aria-pressed={isSelected}
                      >
                        {/* Checkmark for selected state */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "backOut" }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <Check
                                className={`w-4 h-4 ${color.bgClass === 'bg-white' ||
                                  color.bgClass === 'bg-amber-200' ||
                                  color.bgClass === 'bg-yellow-500'
                                  ? 'text-gray-900'
                                  : 'text-white'
                                  } stroke-[3]`}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>

                      {/* Tooltip - positioned absolutely relative to the wrapper */}
                      {isHovered && !isSelected && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            transition={{ duration: 0.15 }}
                            className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                          >
                            {formatColorName(color.name)}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                          </motion.div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Right Side: Add to Cart Button */}
          <div className="flex items-end">
            <motion.button
              type="button"
              className={`group relative flex items-center justify-center w-10 h-10 rounded-xl bg-white text-black shadow-md transition-all duration-300 flex-shrink-0 overflow-hidden ${comingSoon ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-xl cursor-pointer'}`}
              aria-label="Add to cart"
              disabled={comingSoon}
              whileHover={comingSoon ? {} : {
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
              whileTap={comingSoon ? {} : {
                scale: 0.95,
                transition: { duration: 0.1 }
              }}
              onClick={comingSoon ? undefined : handleAddToCart}
            >
              {/* Hover background effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Icon with enhanced hover effects */}
              <motion.div
                className="relative z-10 text-black group-hover:text-white transition-colors duration-300"
                whileHover={{
                  rotate: 360,
                  transition: { duration: 0.6, ease: "easeInOut" }
                }}
              >
                <CartIcon />
              </motion.div>

              {/* Subtle glow effect on hover */}
              <motion.div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))',
                  filter: 'blur(8px)',
                  zIndex: -1
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders
export const ProductCard = memo(ProductCardComponent);
