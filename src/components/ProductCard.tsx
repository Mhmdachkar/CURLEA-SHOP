import { useState, useRef } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { ShoppingBag, Eye } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { ProductImage } from "./ProductImage";
import { useBreakpoint } from "@/hooks/useBreakpoint";

/* ============================================
   STYLED COMPONENTS - MOBILE FIRST
   ============================================ */

const Card = styled(motion.div)`
  position: relative;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: ${({ theme }) => theme.transitions.smooth};
  will-change: transform;
  transform-style: preserve-3d;
  perspective: 1000px;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    &:hover {
      box-shadow: ${({ theme }) => theme.shadows.lg};
    }
  }
`;

const ImageContainer = styled(motion.div)`
  position: relative;
  aspect-ratio: 3 / 4;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.muted};

  @media ${({ theme }) => theme.mediaQueries.mobileLarge} {
    aspect-ratio: 4 / 3;
  }

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    aspect-ratio: 1 / 1;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const ImageWrapper = styled(motion.div)`
  width: 100%;
  height: 100%;
`;

const Overlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const ActionButton = styled(motion.button)<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ $variant, theme }) => 
    $variant === 'primary' ? theme.colors.accent : '#ffffff'};
  color: ${({ $variant, theme }) => 
    $variant === 'primary' ? '#ffffff' : theme.colors.foreground};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  cursor: pointer;
  min-width: ${({ theme }) => theme.touchTargets.min};
  min-height: ${({ theme }) => theme.touchTargets.min};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ $variant, theme }) => 
      $variant === 'primary' ? theme.colors.primary : theme.colors.accent};
    color: #ffffff;
  }

  svg {
    width: 1rem;
    height: 1rem;

    @media ${({ theme }) => theme.mediaQueries.tablet} {
      width: 1.25rem;
      height: 1.25rem;
    }
  }

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: ${({ theme }) => theme.spacing.md};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    padding: ${({ theme }) => theme.spacing.lg};
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
  padding: ${({ theme }) => theme.spacing.sm};

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    padding: ${({ theme }) => theme.spacing.md};
  }

  @media ${({ theme }) => theme.mediaQueries.desktop} {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const ProductName = styled(motion.h3)`
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.foreground};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  letter-spacing: 0.025em;
  transition: ${({ theme }) => theme.transitions.fast};
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;

  ${Card}:hover & {
    color: ${({ theme }) => theme.colors.accent};
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
  font-family: ${({ theme }) => theme.typography.fontFamily.sans};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.light};
  color: ${({ theme }) => theme.colors.mutedForeground};
  letter-spacing: 0.05em;

  @media ${({ theme }) => theme.mediaQueries.tablet} {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }
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
  onQuickView?: (product: Product) => void;
}

export const ProductCard = ({ 
  id, 
  name, 
  price, 
  image, 
  onClick, 
  onQuickView, 
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

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView({ id, name, price, image, ...product });
    }
  };

  return (
    <Card
      ref={cardRef}
      layoutId={`product-${id}`}
      className="product-card"
      animate={is3DEnabled ? { 
        x: mousePosition.x, 
        y: mousePosition.y,
        rotateX: mousePosition.y * 0.05,
        rotateY: mousePosition.x * 0.05,
      } : {}}
      transition={{ 
        type: "spring", 
        stiffness: 150, 
        damping: 15,
        mass: 0.1 
      }}
      whileHover={is3DEnabled ? { 
        y: -12,
        transition: { duration: 0.3 }
      } : {
        y: -4,
        transition: { duration: 0.2 }
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <ImageContainer layoutId={`product-image-${id}`}>
        <ImageWrapper
          layoutId={`product-img-${id}`}
          animate={{
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
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
          transition={{ duration: 0.3 }}
        >
          <ActionButton
            $variant="secondary"
            whileHover={{ scale: 1.1, rotate: 360 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={handleQuickView}
            aria-label={`Quick view ${name}`}
          >
            <Eye />
          </ActionButton>
          
          <ActionButton
            $variant="primary"
            whileHover={{ scale: 1.1, rotate: -360 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
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
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </ImageContainer>

      <InfoContainer layoutId={`product-info-${id}`}>
        <ProductName layoutId={`product-name-${id}`}>
          {name}
        </ProductName>
        <ProductPrice layoutId={`product-price-${id}`}>
          {price}
        </ProductPrice>
      </InfoContainer>

      {/* Enhanced Hover Shadow with Glow */}
      <HoverShadow
        initial={{ boxShadow: "0 0 0 rgba(0,0,0,0)" }}
        animate={{
          boxShadow: isHovered
            ? "0 25px 50px -12px rgba(0,0,0,0.25), 0 0 30px rgba(201, 139, 95, 0.3)"
            : "0 0 0 rgba(0,0,0,0)",
        }}
        transition={{ duration: 0.3 }}
      />
    </Card>
  );
};
