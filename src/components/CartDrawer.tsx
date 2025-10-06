import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart, CartItem } from '@/contexts/CartContext';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';

export const CartDrawer = () => {
  const { state, updateQuantity, removeFromCart, clearCart, closeCart } = useCart();

  const calculateTotal = () => {
    return state.items.reduce((total, item) => {
      const price = parseFloat(item.price.replace('€', ''));
      return total + (price * item.quantity);
    }, 0);
  };

  const formatPrice = (price: number) => {
    return `€${price.toFixed(2)}`;
  };

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Shopping Cart</h2>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {state.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500">Add some products to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.selectedColor || 'default'}`}
                      className="flex gap-4 p-4 border rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                        {item.selectedColor && (
                          <p className="text-xs text-gray-600 mt-1">Color: {item.selectedColor}</p>
                        )}
                        {item.size && (
                          <p className="text-xs text-gray-600">Size: {item.size}</p>
                        )}
                        <p className="text-sm font-medium text-gray-900 mt-1">{item.price}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-red-600 hover:text-red-800 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="border-t p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-semibold">{formatPrice(calculateTotal())}</span>
                </div>
                
                <div className="space-y-2">
                  <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Checkout
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full text-gray-600 py-2 rounded-lg font-medium hover:text-gray-800 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};