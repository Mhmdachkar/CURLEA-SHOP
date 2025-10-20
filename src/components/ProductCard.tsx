import { useState, useRef } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { ProductImage } from "./ProductImage";
import { useBreakpoint } from "@/hooks/useBreakpoint";

/* ============================================
   STYLED COMPONENTS - MOBILE FIRST
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
  
  /* High-resolution product display */
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    filter: brightness(1.03) contrast(1.08) saturate(1.05);
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
`;

const Overlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.95) 0%,
    rgba(255,255,255,0.90) 50%,
    rgba(255,255,255,0.95) 100%
  );
  backdrop-filter: none;
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

    @media ${({ theme }) => theme.mediaQueries.tablet} {
      width: 1rem;
      height: 1rem;
    }
  }

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: ${({ theme }) => theme.spacing.sm};
    min-width: 2.5rem;
    min-height: 2.5rem;
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    padding: ${({ theme }) => theme.spacing.md};
  }

  &:hover {
    box-shadow: 0 10px 24px rgba(0,0,0,0.18);
  }
`;

const ShimmerEffect = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 100%
  );
  pointer-events: none;
`;

const InfoContainer = styled(motion.div)`
  padding: 16px 20px 20px 20px;
  background-color: #ffffff;
  text-align: center;
`;

const ProductName = styled(motion.h3)`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.4;
  color: #000000;
  margin: 0 0 8px 0;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  
  /* Reference image typography style */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: color 0.2s ease;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;

  ${Card}:hover & {
    color: #000000;
  }

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

const ProductPrice = styled(motion.p)`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #000000;
  margin: 0;
  letter-spacing: 0.01em;
  line-height: 1.3;
  
  /* Reference image typography style */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const BrandName = styled(motion.p)`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: #666666;
  margin: 0 0 6px 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  line-height: 1.2;
  
  /* Reference image typography style */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const HoverShadow = styled(motion.div)`
  position: absolute;
  inset: 0;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  pointer-events: none;
  z-index: -1;
`;

/* ============================================
   PRODUCT CARD COMPONENT
   ============================================ */

interface ProductCardProps extends Product {
  onClick?: () => void;
}

export const ProductCard = ({ 
  id, 
  name, 
  price, 
  image, 
  onClick, 
  ...product 
}: ProductCardProps) => {
  const { addToCart, openCart } = useCart();
  const { isMobile, isTablet } = useBreakpoint();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Disable 3D effects on mobile/tablet for performance
  const is3DEnabled = !isMobile && !isTablet;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!is3DEnabled || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePosition({ x: x * 0.15, y: y * 0.15 });
  };

  const handleMouseLeave = () => {
    if (!is3DEnabled) return;
    setMousePosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ id, name, price, image, ...product });
    openCart();
  };

  return (
    <Card
      ref={cardRef}
      className="product-card"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <ImageContainer layoutId={`product-image-${id}`}>
        <ImageWrapper
          layoutId={`product-img-${id}`}
          animate={{
            scale: isHovered ? 1.03 : 1,
          }}
          transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          <ProductImage
            src={image}
            alt={name}
            className="w-full h-full"
            productId={id}
          />
        </ImageWrapper>
        
        {/* Overlay Actions */}
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <ActionButton
            $variant="primary"
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            aria-label={`Add ${name} to cart`}
          >
            <ShoppingBag />
          </ActionButton>
        </Overlay>

        {/* Shimmer Effect */}
        <ShimmerEffect
          initial={{ x: "-100%" }}
          animate={{ x: isHovered ? "100%" : "-100%" }}
          transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
        />
      </ImageContainer>

      <InfoContainer layoutId={`product-info-${id}`}>
        <BrandName>ZERO HEAT SET</BrandName>
        <ProductName layoutId={`product-name-${id}`}>
          {name}
        </ProductName>
        <ProductPrice layoutId={`product-price-${id}`}>
          {price}
        </ProductPrice>
      </InfoContainer>

      {/* Enhanced Hover Shadow with Black Glow */}
      <HoverShadow
        initial={{ boxShadow: "0 0 0 rgba(0,0,0,0)" }}
        animate={{
          boxShadow: isHovered
            ? "0 8px 30px rgba(0,0,0,0.12)"
            : "0 0 0 rgba(0,0,0,0)",
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </Card>
  );
};
