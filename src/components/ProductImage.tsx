import { motion } from 'framer-motion';
import { OptimizedImage } from './OptimizedImage';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  productId?: string;
}

export const ProductImage = ({ 
  src, 
  alt, 
  className = '', 
  priority = false, 
  productId 
}: ProductImageProps) => {
  // Check if this image needs black border removal
  const needsBlackBorderRemoval = productId === 'heatless-4' || src.includes('product-4.webp');
  
  return (
    <div className={`relative ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        className="w-full h-full"
        priority={priority}
        removeBlackBorders={needsBlackBorderRemoval}
      />
      
      {/* Additional overlay for product-4.webp to ensure black borders are completely removed */}
      {needsBlackBorderRemoval && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-br from-transparent via-transparent to-transparent rounded-lg overflow-hidden" 
               style={{
                 background: 'linear-gradient(135deg, transparent 3%, transparent 97%)',
                 filter: 'contrast(1.05) brightness(1.02)'
               }} />
        </div>
      )}
    </div>
  );
};
