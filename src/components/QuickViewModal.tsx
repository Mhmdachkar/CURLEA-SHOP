import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal = ({ product, onClose }: QuickViewModalProps) => {
  const { addToCart, openCart, state: cartState } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (product) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Disable body scroll
      document.body.style.overflow = 'hidden';
      // Prevent touch scrolling on mobile
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Cleanup function to restore scroll position
      return () => {
        // Re-enable body scroll when modal is closed
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Calculate current cart total
    const currentCartTotal = cartState.items.reduce((total, item) => {
      const price = parseFloat(item.price.replace('€', ''));
      return total + (price * item.quantity);
    }, 0);
    
    // Add multiple quantities to cart
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    
    // Track add to cart event
    if (typeof window !== 'undefined' && (window as any).analytics) {
      const priceNumber = parseFloat(product.price.replace('€', ''));
      const newCartTotal = currentCartTotal + (priceNumber * quantity);
      
      (window as any).analytics.trackCart('add', {
        product_id: product.id,
        title: product.name,
        price: priceNumber,
        quantity: quantity,
        variant_id: undefined,
        variant_title: undefined,
        total_value: priceNumber * quantity,
        cart_total: newCartTotal,
      });
    }
    
    setIsAdded(true);
    openCart(); // Open cart drawer to show the added items
    
    setTimeout(() => {
      setIsAdded(false);
      onClose();
      setQuantity(1);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-background rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="max-h-[90vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                {/* Left: Image */}
                <motion.div
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Right: Details */}
                <motion.div
                  className="flex flex-col"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 bg-accent/20 text-accent-foreground text-xs font-medium rounded-full">
                      {product.category}
                    </span>
                    <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
                      {product.hairType}
                    </span>
                  </div>

                  <h2 className="text-3xl font-bold mb-4">{product.name}</h2>

                  <p className="text-3xl text-muted-foreground font-light mb-6">
                    {product.price}
                  </p>

                  <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-1">
                    {product.description.length > 0 ? (
                      <>
                        {product.description.slice(0, 4).map((desc, index) => (
                          <div key={index} className="flex items-start gap-2 sm:gap-3">
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-accent mt-1.5 sm:mt-2 flex-shrink-0" />
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                              {desc}
                            </p>
                          </div>
                        ))}
                        {product.description.length > 4 && (
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-accent mt-1.5 sm:mt-2 flex-shrink-0" />
                            <p className="text-sm sm:text-base text-muted-foreground italic leading-relaxed">
                              ... and {product.description.length - 4} more features
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-accent mt-1.5 sm:mt-2 flex-shrink-0" />
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                          Premium quality product with excellent features
                        </p>
                      </div>
                    )}
                  </div>

                  {/* View Full Details Link */}
                  {product.description.length > 4 && (
                    <motion.button
                      onClick={() => {
                        onClose();
                        // Navigate to full product page
                        window.location.href = `/product/${product.id}`;
                      }}
                      className="text-sm text-primary hover:text-primary/80 underline mb-4 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      View Full Details →
                    </motion.button>
                  )}

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4 mb-6">
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
                  </div>

                  {/* Add to Cart Button */}
                  <motion.button
                    onClick={handleAddToCart}
                    className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={isAdded ? { scale: [1, 1.05, 1] } : {}}
                  >
                    {isAdded ? "Added to Cart ✓" : "Add to Cart"}
                  </motion.button>
                </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
