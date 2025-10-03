import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal = ({ product, onClose }: QuickViewModalProps) => {
  const { addToCart, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Add multiple quantities to cart
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-background rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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

                  <div className="space-y-3 mb-8 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                      <p className="text-muted-foreground">
                        Enhances natural texture and shine
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                      <p className="text-muted-foreground">
                        Lightweight formula with lasting hydration
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                      <p className="text-muted-foreground">
                        Sulfate-free and paraben-free
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                      <p className="text-muted-foreground">
                        Luxurious texture with instant absorption
                      </p>
                    </div>
                  </div>

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
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
