import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType, useCart } from '@/contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
      className="flex items-center gap-4 p-4 border-b border-border/50"
    >
      {/* Product Image */}
      <motion.div
        className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted/20"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm text-foreground truncate">
          {item.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {item.category} • {item.hairType}
        </p>
        {item.selectedSize && (
          <p className="text-xs text-muted-foreground mt-1">
            Size: <span className="font-medium text-primary">{item.size}</span>
          </p>
        )}
        <p className="text-sm font-semibold text-primary mt-1">
          {item.price}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <motion.button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted transition-colors flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Minus className="w-3 h-3" />
        </motion.button>
        
        <span className="w-8 text-center text-sm font-medium">
          {item.quantity}
        </span>
        
        <motion.button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted transition-colors flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-3 h-3" />
        </motion.button>
      </div>

      {/* Remove Button */}
      <motion.button
        onClick={handleRemove}
        className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Trash2 className="w-3 h-3" />
      </motion.button>
    </motion.div>
  );
};
