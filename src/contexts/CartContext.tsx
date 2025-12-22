import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { fbTrack, gaTrack } from '@/utils/tracking';
import { secureStorage, sanitizeInput, sanitizeObject } from '@/utils/securityEnhanced';

// Eligible full-set product IDs for the Christmas offer
export const FULL_SET_PRODUCT_IDS = new Set<string>([
  'dreamcurl-original', // Dream Curl Original Full Set
  'dreamcurl-midi',     // Dream Curl Full Set Midi
  'dreamcurl-jumbo',    // Dream Curl Full Set Jumbo
  'zero-heat-mini',     // Zero Heat Mini Full Set
]);

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

// Helper function to calculate promotional discount:
// Christmas Offer → Buy any 2 eligible FULL SETS, get the 3rd FULL SET FREE
// Logic: For every 2 items purchased, the next item is free
export const calculatePromoDiscount = (items: CartItem[]): number => {
  // Filter down to eligible FULL SET items only and exclude free ($0) items
  const eligiblePaidItems = items.filter(item => {
    if (!FULL_SET_PRODUCT_IDS.has(item.id)) return false;
    const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
    return price > 0;
  });

  // Flatten all items into individual units (respecting quantity) to find free items
  const flattenedItems: Array<{ price: number; item: CartItem }> = [];
  for (const item of eligiblePaidItems) {
    const itemPrice = parseFloat(item.price.replace(/[^0-9.]/g, ''));
    // Add each quantity as a separate unit
    for (let i = 0; i < item.quantity; i++) {
      flattenedItems.push({ price: itemPrice, item });
    }
  }

  // Count total eligible FULL SET units
  const totalPaidItems = flattenedItems.length;
  
  // Only apply discount if there are 2 or more eligible FULL SET items
  // Buy 2, Get 1 Free: minimum 2 items required, only 1 free item (the 3rd one)
  if (totalPaidItems < 2) return 0;

  // Only give 1 free item (the 3rd one) - simple Buy 2, Get 1 Free
  // The 3rd eligible FULL SET item (index 2) gets the discount
  const thirdItem = flattenedItems[2];
  if (!thirdItem) return 0;

  const thirdItemPrice = thirdItem.price;

  // 100% off the 3rd eligible FULL SET item (3rd item is FREE)
  const discount = thirdItemPrice;

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
    // Use secure storage wrapper
    const savedCart = secureStorage.getItem('curlea-cart');
    if (savedCart) {
      // Safe JSON parsing with validation
      const parsed = JSON.parse(savedCart);
      
      // Sanitize parsed object to prevent prototype pollution
      const sanitizedParsed = sanitizeObject(parsed);
      
      const rawItems = Array.isArray(sanitizedParsed.items) ? sanitizedParsed.items : [];
      const sanitizedItems = rawItems
        .map(normalizeCartItem)
        .filter((item): item is CartItem => Boolean(item));

      return {
        items: sanitizedItems,
        isOpen: false, // Always start with cart closed
      };
    }
  } catch (error) {
    console.error('[Security] Error loading cart from localStorage:', error);
  }
  
  return { items: [], isOpen: false };
};

// Save cart to localStorage with security
const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    // Sanitize items before saving
    const sanitizedItems = items.map(item => ({
      ...item,
      id: sanitizeInput(item.id),
      name: sanitizeInput(item.name),
      selectedColor: item.selectedColor ? sanitizeInput(item.selectedColor) : undefined,
      selectedSize: item.selectedSize ? sanitizeInput(item.selectedSize) : undefined,
    }));
    
    // Use secure storage wrapper
    secureStorage.setItem('curlea-cart', JSON.stringify({ items: sanitizedItems }));
  } catch (error) {
    console.error('[Security] Error saving cart to localStorage:', error);
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