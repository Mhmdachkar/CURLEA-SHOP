import { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Product } from "@/data/products";
import { ProductImage } from "./ProductImage";

/* ============================================
   ELEGANT PRODUCT CARD - SIMPLE & CLEAN
   ============================================ */

const Card = styled(motion.div)`
  position: relative;
  background-color: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 0;
  overflow: hidden;
  cursor: pointer;
  box-shadow: none;
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
  will-change: auto;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translateZ(0);
  
  /* Sharp, clean texture */
  background-image: 
    linear-gradient(90deg, transparent 98%, rgba(0,0,0,0.02) 100%),
    linear-gradient(0deg, transparent 98%, rgba(0,0,0,0.02) 100%);
  background-size: 20px 20px;

  &:hover {
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    border-color: #e0e0e0;
    transform: translateY(-4px) translateZ(0);
  }

  @media (max-width: 768px) {
    &:hover {
      transform: translateY(-2px) translateZ(0);
    }
  }
`;

const ImageContainer = styled(motion.div)`
  position: relative;
  aspect-ratio: 3 / 4;
  margin-bottom: 0;
  overflow: hidden;
  background-color: #ffffff;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translateZ(0);

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
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translateZ(0);
  
  /* High-resolution product display - OPTIMIZED */
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    filter: brightness(1.03) contrast(1.08) saturate(1.05);
    transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transform: translateZ(0);
    will-change: auto;
  }
`;

const InfoContainer = styled(motion.div)`
  padding: 16px 20px 20px 20px;
  background-color: #ffffff;
  text-align: center;
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
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: color 0.3s ease;
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
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: color 0.3s ease;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

const ProductPrice = styled(motion.p)`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #000000;
  margin: 0;
  letter-spacing: 0.01em;
  line-height: 1.3;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

/* ============================================
   COMPONENT INTERFACE
   ============================================ */

interface ElegantProductCardProps extends Product {
  onClick?: () => void;
  className?: string;
}

export const ElegantProductCard = ({
  id,
  name,
  price,
  image,
  onClick,
  className = "",
}: ElegantProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.43, 0.13, 0.23, 0.96] 
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
      }}
      whileTap={{ scale: 0.98 }}
      style={{
        backfaceVisibility: "hidden",
        transform: "translateZ(0)"
      }}
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
      </ImageContainer>

      <InfoContainer>
        <BrandName>ZERO HEAT SET</BrandName>
        <ProductName>
          {name}
        </ProductName>
        <ProductPrice>
          {price}
        </ProductPrice>
      </InfoContainer>
    </Card>
  );
};

export default ElegantProductCard;

