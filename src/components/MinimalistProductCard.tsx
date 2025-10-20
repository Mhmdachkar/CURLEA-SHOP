import { useState, useRef } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { ShoppingBag, Eye } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { ProductImage } from "./ProductImage";
import { useBreakpoint } from "@/hooks/useBreakpoint";

/* ============================================
   MINIMALIST PRODUCT CARD - GYMSHARK INSPIRED
   ============================================ */

const Card = styled(motion.div)`
  position: relative;
  background-color: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 0;
  overflow: hidden;
  cursor: pointer;
  box-shadow: none;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  will-change: transform;
  transform-style: preserve-3d;
  perspective: 1000px;
  
  /* Sharp, clean texture */
  background-image: 
    linear-gradient(90deg, transparent 98%, rgba(0,0,0,0.02) 100%),
    linear-gradient(0deg, transparent 98%, rgba(0,0,0,0.02) 100%);
  background-size: 20px 20px;

  &:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border-color: #e0e0e0;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    &:hover {
      transform: translateY(-1px);
    }
  }
`;

const ImageContainer = styled(motion.div)`
  position: relative;
  aspect-ratio: 3 / 4;
  margin-bottom: 0;
  overflow: hidden;
  background-color: #ffffff;
  
  /* Pure white background with subtle texture */
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(0,0,0,0.01) 1px, transparent 1px),
    radial-gradient(circle at 75% 75%, rgba(0,0,0,0.01) 1px, transparent 1px);
  background-size: 30px 30px;
  background-position: 0 0, 15px 15px;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    aspect-ratio: 1 / 1;
  }
`;

const ImageWrapper = styled(motion.div)`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  
  /* Ensure product is well-lit and centrally placed */
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(1.02) contrast(1.05);
  }
`;

const Overlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.95) 0%,
    rgba(255,255,255,0.85) 50%,
    rgba(255,255,255,0.95) 100%
  );
  backdrop-filter: blur(1px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

const ActionButton = styled(motion.button)<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px;
  background-color: ${({ $variant }) => 
    $variant === 'primary' ? '#000000' : '#ffffff'};
  color: ${({ $variant }) => 
    $variant === 'primary' ? '#ffffff' : '#000000'};
  border: 1px solid ${({ $variant }) => 
    $variant === 'primary' ? '#000000' : '#e0e0e0'};
  border-radius: 0;
  cursor: pointer;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  font-weight: 500;
  letter-spacing: 0.5px;
  
  /* Sharp, clean button design */
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);

  &:hover {
    background-color: ${({ $variant }) => 
      $variant === 'primary' ? '#333333' : '#f8f8f8'};
    border-color: ${({ $variant }) => 
      $variant === 'primary' ? '#333333' : '#d0d0d0'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  svg {
    width: 16px;
    height: 16px;
    stroke-width: 1.5;
  }
`;

const ContentContainer = styled.div`
  padding: 20px;
  background-color: #ffffff;
`;

const ProductTitle = styled.h3`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  color: #000000;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
  text-transform: none;
  
  /* Gymshark-style typography */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const BrandName = styled.p`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #666666;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  line-height: 1.2;
`;

const Price = styled.p`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #000000;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

/* ============================================
   COMPONENT INTERFACE
   ============================================ */

interface MinimalistProductCardProps extends Product {
  onQuickView?: (product: Product) => void;
  className?: string;
}

export const MinimalistProductCard = ({
  id,
  name,
  price,
  image,
  onQuickView,
  className = "",
}: MinimalistProductCardProps) => {
  const { addToCart, openCart } = useCart();
  const { isMobile } = useBreakpoint();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id,
      name,
      price,
      image,
    });
    openCart();
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView({ id, name, price, image, category: "", hairType: "", description: [] });
    }
  };

  return (
    <Card
      ref={cardRef}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.43, 0.13, 0.23, 0.96] 
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <ImageContainer>
        <ImageWrapper>
          <ProductImage
            src={image}
            alt={name}
            className="w-full h-full object-contain"
            priority={false}
          />
        </ImageWrapper>
        
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <ActionButton
            $variant="secondary"
            onClick={handleQuickView}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye />
          </ActionButton>
          
          <ActionButton
            $variant="primary"
            onClick={handleAddToCart}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingBag />
          </ActionButton>
        </Overlay>
      </ImageContainer>

      <ContentContainer>
        <ProductTitle>{name}</ProductTitle>
        <BrandName>CURLEA</BrandName>
        <Price>{price}</Price>
      </ContentContainer>
    </Card>
  );
};

/* ============================================
   CARD VARIANTS FOR DIFFERENT SIZES
   ============================================ */

export const MinimalistProductCardSmall = styled(MinimalistProductCard)`
  .product-title {
    font-size: 16px;
  }
  
  .price {
    font-size: 16px;
  }
  
  .brand-name {
    font-size: 11px;
  }
`;

export const MinimalistProductCardLarge = styled(MinimalistProductCard)`
  .product-title {
    font-size: 20px;
  }
  
  .price {
    font-size: 20px;
  }
  
  .brand-name {
    font-size: 13px;
  }
`;
