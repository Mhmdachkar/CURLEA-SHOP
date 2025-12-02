import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback, useMemo } from 'react';
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
  maxAvailable?: number | null;
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
  | { type: 'CLOSE_CART' }
  | { type: 'SET_ITEMS'; payload: CartItem[] };

// Helper function to calculate promotional discount: Buy 2, Get 50% Off 3rd Item
export const calculatePromoDiscount = (items: CartItem[]): number => {
  // Count total items across all cart entries
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Only apply discount if there are exactly 3 or more items (but only to the 3rd item)
  if (totalItems < 3) return 0;

  // Sort items by price (highest first) to maximize discount value
  const sortedItems = [...items].sort((a, b) => {
    const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
    const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
    return priceB - priceA;
  });

  // Apply 50% discount to ONLY the most expensive item (since user has 3+)
  const mostExpensiveItem = sortedItems[0];
  const itemPrice = parseFloat(mostExpensiveItem.price.replace(/[^0-9.]/g, ''));

  // 50% off the most expensive item (this represents the "3rd item" discount)
  const discount = itemPrice * 0.5;

  return discount;
};

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
  promoDiscount: number;
  refreshInventory: () => Promise<void>;
} | null>(null);

const clampQuantityToAvailability = (quantity: number, maxAvailable?: number | null) => {
  if (typeof maxAvailable === 'number' && maxAvailable >= 0) {
    return Math.max(0, Math.min(quantity, maxAvailable));
  }
  return quantity;
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item =>
        item.id === action.payload.id &&
        item.selectedColor === action.payload.selectedColor &&
        item.selectedSize === action.payload.selectedSize
      );

      const payloadQuantity = action.payload.quantity ?? 1;
      const payloadMax = action.payload.maxAvailable ?? null;

      if (existingItem) {
        const maxAvailable = payloadMax ?? existingItem.maxAvailable ?? null;
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id && item.selectedColor === action.payload.selectedColor && item.selectedSize === action.payload.selectedSize
              ? {
                ...item,
                quantity: clampQuantityToAvailability(item.quantity + payloadQuantity, maxAvailable),
                maxAvailable: maxAvailable
              }
              : item
          ),
        };
      }

      const initialQuantity = clampQuantityToAvailability(payloadQuantity, payloadMax);
      if (initialQuantity <= 0 && typeof payloadMax === 'number') {
        return state;
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: initialQuantity }],
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
            ? {
              ...item,
              quantity: clampQuantityToAvailability(action.payload.quantity, item.maxAvailable)
            }
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

    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload,
      };

    default:
      return state;
  }
};

// Load cart from localStorage
const parsePriceValue = (value: string | number | undefined | null): number => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (!isNaN(numeric)) {
      return numeric;
    }
  }

  return 0;
};

const formatPriceString = (value: string | number | undefined | null): string => {
  const numeric = parsePriceValue(value);
  return `$${numeric.toFixed(2)}`;
};

const normalizeCartItem = (item: any): CartItem | null => {
  if (!item || !item.id || !item.name) {
    return null;
  }

  const quantity =
    typeof item.quantity === 'number' && item.quantity > 0 ? Math.floor(item.quantity) : 1;

  return {
    ...item,
    id: String(item.id),
    name: String(item.name),
    price: formatPriceString(item.price),
    image: item.image || '/placeholder.svg',
    quantity,
  };
};

const loadCartFromStorage = (): CartState => {
  if (typeof window === 'undefined') {
    return { items: [], isOpen: false };
  }

  try {
    const savedCart = localStorage.getItem('curlea-cart');
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
      const sanitizedItems = rawItems
        .map(normalizeCartItem)
        .filter((item): item is CartItem => Boolean(item));

      return {
        items: sanitizedItems,
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
    const normalizedItem: CartItem = {
      ...item,
      price: formatPriceString(item.price),
      quantity: 1,
    };

    dispatch({
      type: 'ADD_TO_CART',
      payload: normalizedItem,
    });

    // Track analytics - ensure ALL add to cart events are tracked
    if (typeof window !== 'undefined' && (window as any).analytics) {
      const priceNumber = parsePriceValue(item.price);
      const currentItems = loadCartFromStorage().items;
      const newCartTotal = [...currentItems, normalizedItem].reduce(
        (sum, cartItem) => sum + parsePriceValue(cartItem.price) * cartItem.quantity,
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
    const priceNumber = parsePriceValue(item.price);
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
    const currentState = loadCartFromStorage();
    const item = currentState.items.find(
      (i) => i.id === id && i.selectedColor === selectedColor && i.selectedSize === selectedSize
    );

    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: { id, selectedColor, selectedSize },
    });

    // Track analytics
    if (item && typeof window !== 'undefined' && (window as any).analytics) {
      const priceNumber = parsePriceValue(item.price);
      const newCartTotal = currentState.items
        .filter((i) => !(i.id === id && i.selectedColor === selectedColor && i.selectedSize === selectedSize))
        .reduce((sum, cartItem) => sum + parsePriceValue(cartItem.price) * cartItem.quantity, 0);

      (window as any).analytics.trackCart('remove', {
        product_id: id,
        title: item.name,
        price: priceNumber,
        quantity: item.quantity,
        variant_id: selectedSize || selectedColor || undefined,
        variant_title: selectedSize || selectedColor || undefined,
        total_value: priceNumber * item.quantity,
        cart_total: newCartTotal,
      });
    }
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
      const priceNumber = parsePriceValue(item.price);
      const newCartTotal = currentState.items
        .map((i) =>
          i.id === id && i.selectedColor === selectedColor && i.selectedSize === selectedSize
            ? { ...i, quantity }
            : i
        )
        .filter((i) => i.quantity > 0)
        .reduce((sum, cartItem) => sum + parsePriceValue(cartItem.price) * cartItem.quantity, 0);

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

  const refreshInventory = useCallback(async () => {
    if (state.items.length === 0) return;

    const updatedItems = await Promise.all(
      state.items.map(async (item) => {
        try {
          const { available } = await fetchVariantAvailability(
            item.id,
            item.selectedSize,
            item.selectedColor
          );

          if (typeof available !== 'number') {
            return item;
          }

          const clampedQuantity = clampQuantityToAvailability(item.quantity, available);
          return {
            ...item,
            quantity: clampedQuantity,
            maxAvailable: available,
          };
        } catch (error) {
          console.warn('[Cart] Failed to refresh inventory for item', item.id, error);
          return item;
        }
      })
    );

    const sanitized = updatedItems.filter((item) => item.quantity > 0);
    dispatch({ type: 'SET_ITEMS', payload: sanitized });
  }, [state.items]);

  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const promoDiscount = calculatePromoDiscount(state.items);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      state,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleCart,
      openCart,
      closeCart,
      itemCount,
      promoDiscount,
      refreshInventory,
    }),
    [state, addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, openCart, closeCart, itemCount, promoDiscount, refreshInventory]
  );

  return (
    <CartContext.Provider value={value}>
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