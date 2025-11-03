import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { fbTrack, gaTrack } from '@/utils/tracking';

export interface CartItem {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  size?: string;
  category?: string;
  hairType?: string;
  // Bundle support
  isBundle?: boolean;
  images?: string[]; // for showing multiple images (e.g., 3 in a row)
  originalPrice?: string; // strikethrough original combined price
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: { id: string; selectedColor?: string; selectedSize?: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; selectedColor?: string; selectedSize?: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' };

const CartContext = createContext<{
  state: CartState;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string, selectedColor?: string, selectedSize?: string) => void;
  updateQuantity: (id: string, quantity: number, selectedColor?: string, selectedSize?: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  itemCount: number;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => 
        item.id === action.payload.id && 
        item.selectedColor === action.payload.selectedColor &&
        item.selectedSize === action.payload.selectedSize
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id && item.selectedColor === action.payload.selectedColor && item.selectedSize === action.payload.selectedSize
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }

      return {
        ...state,
        items: [...state.items, action.payload],
      };
    }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => 
          !(item.id === action.payload.id && 
            item.selectedColor === action.payload.selectedColor &&
            item.selectedSize === action.payload.selectedSize)
        ),
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          (item.id === action.payload.id &&
           item.selectedColor === action.payload.selectedColor &&
           item.selectedSize === action.payload.selectedSize)
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case 'OPEN_CART':
      return {
        ...state,
        isOpen: true,
      };

    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false,
      };

    default:
      return state;
  }
};

// Load cart from localStorage
const loadCartFromStorage = (): CartState => {
  if (typeof window === 'undefined') {
    return { items: [], isOpen: false };
  }
  
  try {
    const savedCart = localStorage.getItem('curlea-cart');
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      return {
        items: parsed.items || [],
        isOpen: false, // Always start with cart closed
      };
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  
  return { items: [], isOpen: false };
};

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('curlea-cart', JSON.stringify({ items }));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, loadCartFromStorage());

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(state.items);
  }, [state.items]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { ...item, quantity: 1 },
    });

    // Track analytics - ensure ALL add to cart events are tracked
    if (typeof window !== 'undefined' && (window as any).analytics) {
      const priceNumber = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
      const currentItems = loadCartFromStorage().items;
      const newCartTotal = [...currentItems, { ...item, quantity: 1 }].reduce(
        (sum, cartItem) => sum + parseFloat(cartItem.price.replace(/[^0-9.]/g, '')) * cartItem.quantity,
        0
      );

      (window as any).analytics.trackCart('add', {
        product_id: item.id,
        title: item.name,
        price: priceNumber,
        quantity: 1,
        variant_id: item.selectedSize || item.selectedColor || undefined,
        variant_title: item.selectedSize || item.selectedColor || undefined,
        total_value: priceNumber,
        cart_total: newCartTotal,
      });
    }

    // Meta + GA tracking
    const priceNumber = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
    fbTrack('AddToCart', {
      content_name: item.name,
      content_ids: [item.id],
      value: priceNumber,
      currency: 'USD',
    });
    gaTrack('add_to_cart', {
      currency: 'USD',
      value: priceNumber,
      items: [{ id: item.id, name: item.name }],
    });
  };

  const removeFromCart = (id: string, selectedColor?: string, selectedSize?: string) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: { id, selectedColor, selectedSize },
    });
  };

  const updateQuantity = (id: string, quantity: number, selectedColor?: string, selectedSize?: string) => {
    const currentState = loadCartFromStorage();
    const item = currentState.items.find(
      (i) => i.id === id && i.selectedColor === selectedColor && i.selectedSize === selectedSize
    );

    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id, quantity, selectedColor, selectedSize },
    });

    // Track analytics
    if (item && typeof window !== 'undefined' && (window as any).analytics) {
      const priceNumber = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
      const newCartTotal = currentState.items
        .map((i) =>
          i.id === id && i.selectedColor === selectedColor && i.selectedSize === selectedSize
            ? { ...i, quantity }
            : i
        )
        .filter((i) => i.quantity > 0)
        .reduce((sum, cartItem) => sum + parseFloat(cartItem.price.replace(/[^0-9.]/g, '')) * cartItem.quantity, 0);

      (window as any).analytics.trackCart('update', {
        product_id: id,
        title: item.name,
        price: priceNumber,
        quantity: quantity,
        variant_id: selectedSize || selectedColor || undefined,
        variant_title: selectedSize || selectedColor || undefined,
        total_value: priceNumber * quantity,
        cart_total: newCartTotal,
      });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};