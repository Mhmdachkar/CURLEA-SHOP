import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { CartItem } from './CartItem';

export const CartDrawer: React.FC = () => {
  const { 
    cartItems, 
    isCartOpen, 
    closeCart, 
    cartTotal, 
    itemCount 
  } = useCart();

  const handleOverlayClick = () => {
    closeCart();
  };

  const handleCheckout = () => {
    // Here you would typically redirect to checkout
    console.log('Proceeding to checkout with items:', cartItems);
    // For now, we'll just close the cart
    closeCart();
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleOverlayClick}
          />

          {/* Cart Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between p-6 border-b border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Your Cart</h2>
                  <p className="text-sm text-muted-foreground">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              
              <motion.button
                onClick={closeCart}
                className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted transition-colors flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>

            {/* Cart Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {cartItems.length === 0 ? (
                /* Empty Cart State */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex-1 flex flex-col items-center justify-center p-6 text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                  <p className="text-muted-foreground mb-6 max-w-xs">
                    Looks like you haven't added any items to your cart yet.
                  </p>
                  <motion.button
                    onClick={closeCart}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Continue Shopping
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  {/* Cart Items */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 overflow-y-auto"
                  >
                    <AnimatePresence mode="popLayout">
                      {cartItems.map((item) => (
                        <CartItem key={item.id} item={item} />
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {/* Footer */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="border-t border-border p-6 bg-background/95 backdrop-blur-sm"
                  >
                    {/* Subtotal */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-medium">Subtotal</span>
                      <span className="text-xl font-bold text-primary">
                        €{cartTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Tax Notice */}
                    <p className="text-xs text-muted-foreground mb-4">
                      Tax and shipping calculated at checkout
                    </p>

                    {/* Checkout Button */}
                    <motion.button
                      onClick={handleCheckout}
                      className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
