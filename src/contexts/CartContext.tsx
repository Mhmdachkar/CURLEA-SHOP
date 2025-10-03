import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Product } from '@/data/products';
import { validateProduct, cartRateLimiter, RateLimitError } from '@/utils/validation';

// Cart Item Interface
export interface CartItem extends Product {
  quantity: number;
}

// Cart State Interface
interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

// Cart Action Types
type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'CLEAR_CART' };

// Cart Context Interface
interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  cartTotal: number;
  itemCount: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
}

// Initial State
const initialState: CartState = {
  items: [],
  isOpen: false,
};

// Cart Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }

    case 'REMOVE_FROM_CART': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== id),
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        ),
      };
    }

    case 'OPEN_CART':
      return { ...state, isOpen: true };

    case 'CLOSE_CART':
      return { ...state, isOpen: false };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
};

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider Component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Calculate cart total
  const cartTotal = state.items.reduce((total, item) => {
    const price = parseFloat(item.price.replace('€', '').replace(',', '.'));
    return total + (price * item.quantity);
  }, 0);

  // Calculate item count
  const itemCount = state.items.reduce((count, item) => count + item.quantity, 0);

  // Cart Actions with validation and rate limiting
  const addToCart = (product: Product) => {
    // Rate limiting check
    const userId = 'user-' + (Math.random().toString(36).substr(2, 9)); // In production, use actual user ID
    if (!cartRateLimiter.isAllowed(userId)) {
      throw new RateLimitError('Too many cart operations. Please wait a moment.');
    }

    // Input validation
    if (!validateProduct(product)) {
      throw new Error('Invalid product data');
    }

    // Quantity validation
    const totalItems = state.items.reduce((count, item) => count + item.quantity, 0);
    if (totalItems >= 50) { // Maximum cart size
      throw new Error('Cart is full. Maximum 50 items allowed.');
    }

    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId: string) => {
    // Rate limiting check
    const userId = 'user-' + (Math.random().toString(36).substr(2, 9));
    if (!cartRateLimiter.isAllowed(userId)) {
      throw new RateLimitError('Too many cart operations. Please wait a moment.');
    }

    // Input validation
    if (!productId || typeof productId !== 'string' || productId.length > 50) {
      throw new Error('Invalid product ID');
    }

    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    // Rate limiting check
    const userId = 'user-' + (Math.random().toString(36).substr(2, 9));
    if (!cartRateLimiter.isAllowed(userId)) {
      throw new RateLimitError('Too many cart operations. Please wait a moment.');
    }

    // Input validation
    if (!productId || typeof productId !== 'string' || productId.length > 50) {
      throw new Error('Invalid product ID');
    }

    if (!Number.isInteger(newQuantity) || newQuantity < 0 || newQuantity > 99) {
      throw new Error('Invalid quantity. Must be between 0 and 99.');
    }

    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity: newQuantity } });
  };

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const contextValue: CartContextType = {
    cartItems: state.items,
    isCartOpen: state.isOpen,
    cartTotal,
    itemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    openCart,
    closeCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom Hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
