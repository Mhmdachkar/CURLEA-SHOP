import { useState } from "react";
import { motion } from "framer-motion";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { OptimizedImage } from "./OptimizedImage";

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

export const ProductCard = ({ 
  id, 
  name, 
  price, 
  image, 
  colors,
  onClick,
  onAddToCart 
}: ProductCardProps) => {
  const { addToCart } = useCart();
  
  const colorOptions = getColorOptions(colors);
  
  // Set the first color as active, or null if no colors
  const [activeColor, setActiveColor] = useState<ColorOption | null>(
    colorOptions.length > 0 ? colorOptions[0] : null
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Call the onAddToCart prop if provided
    if (onAddToCart) {
      onAddToCart({
        id,
        name,
        price,
        image,
        activeColor
      });
    } else {
      // Fallback to default cart behavior
      addToCart({
        id,
        name,
        price,
        image,
        quantity: 1,
        selectedColor: activeColor?.name
      });
    }
  };

  return (
    <motion.div 
      className="w-full bg-white rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer hover:shadow-xl transition-shadow duration-300"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      
      {/* 1. Product Image - 1:1 Aspect Ratio */}
      <div className="relative w-full aspect-square">
        <OptimizedImage
          src={image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* 2. Product Details */}
      <div className="p-4 flex justify-between items-start">
        
        {/* Left Side: Title, Price, Colors */}
        <div className="flex-1 pr-2">
          <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-1">
            {name}
          </h3>
          <p className="text-lg font-bold text-gray-900 mt-1">{price}</p>
          
          {/* 3. Conditional Color Swatches */}
          {colorOptions.length > 0 && (
            <div className="flex space-x-2 mt-3">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveColor(color);
                  }}
                  className={`
                    w-6 h-6 transition-all duration-150 flex-shrink-0
                    ${color.bgClass}
                    ${color.bgClass === 'bg-white' ? 'border border-gray-400' : ''}
                    ${activeColor && activeColor.name === color.name 
                      ? 'ring-2 ring-black ring-offset-1' 
                      : ''
                    }
                  `}
                  aria-label={`Select color ${color.name}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 4. Right Side: Add to Cart Button */}
        <div className="flex items-end">
          <motion.button
            type="button"
            className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors flex-shrink-0"
            aria-label="Add to cart"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
          >
            <CartIcon />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
