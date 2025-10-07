import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { ShoppingBag, Eye } from "lucide-react";

import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { OptimizedImage } from "./OptimizedImage";

interface ProductCardProps extends Product {
  onClick?: () => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard = ({ id, name, price, image, onClick, onQuickView, ...product }: ProductCardProps) => {
  const { addToCart, openCart } = useCart();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePosition({ x: x * 0.15, y: y * 0.15 });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ id, name, price, image, ...product });
    openCart();
  };

  return (
    <motion.div
      ref={cardRef}
      layoutId={`product-${id}`}
      className="group cursor-pointer bg-card relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
      animate={{ 
        x: mousePosition.x, 
        y: mousePosition.y,
        rotateX: mousePosition.y * 0.05,
        rotateY: mousePosition.x * 0.05,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 150, 
        damping: 15,
        mass: 0.1 
      }}
      whileHover={{ 
        y: -12,
        transition: { duration: 0.3 }
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      <motion.div
        className="relative aspect-[4/3] sm:aspect-square mb-3 sm:mb-4 overflow-hidden bg-muted"
        layoutId={`product-image-${id}`}
      >
        <motion.div
          layoutId={`product-img-${id}`}
          animate={{
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="w-full h-full"
        >
          <OptimizedImage
            src={image}
            alt={name}
            width={600}
            height={600}
            quality={85}
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        {/* Overlay Actions */}
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-2 sm:gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            className="p-2 sm:p-3 lg:p-4 bg-white rounded-full hover:bg-accent hover:text-white transition-colors touch-target flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 360 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickView) {
                onQuickView({ id, name, price, image, ...product });
              }
            }}
            aria-label={`Quick view ${name}`}
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
          
          <motion.button
            className="p-2 sm:p-3 lg:p-4 bg-accent text-white rounded-full hover:bg-primary transition-colors touch-target flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: -360 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={handleAddToCart}
            aria-label={`Add ${name} to cart`}
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </motion.div>

        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: isHovered ? "100%" : "-100%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div layoutId={`product-info-${id}`} className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">
        <motion.h3
          layoutId={`product-name-${id}`}
          className="font-medium fluid-text-sm sm:fluid-text-base lg:fluid-text-lg mb-1 sm:mb-2 tracking-wide group-hover:text-accent transition-colors line-clamp-2"
        >
          {name}
        </motion.h3>
        <motion.p
          layoutId={`product-price-${id}`}
          className="text-muted-foreground font-light tracking-wider fluid-text-sm sm:fluid-text-base"
        >
          {price}
        </motion.p>
      </motion.div>

      {/* Enhanced Hover Shadow with Glow */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none -z-10"
        initial={{ boxShadow: "0 0 0 rgba(0,0,0,0)" }}
        animate={{
          boxShadow: isHovered
            ? "0 25px 50px -12px rgba(0,0,0,0.25), 0 0 30px rgba(201, 139, 95, 0.3)"
            : "0 0 0 rgba(0,0,0,0)",
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};
