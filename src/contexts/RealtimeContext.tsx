// Real-time context for global state management
import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

// Global state interface
interface GlobalState {
  // Product data
  currentProduct: any | null;
  selectedColor: string;
  selectedQuantity: number;
  cartItems: any[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date;
  
  // Navigation state
  currentPath: string;
  previousPath: string;
  
  // User preferences
  theme: 'light' | 'dark';
  language: string;
}

// Action types
type GlobalAction =
  | { type: 'SET_CURRENT_PRODUCT'; payload: any }
  | { type: 'SET_SELECTED_COLOR'; payload: string }
  | { type: 'SET_SELECTED_QUANTITY'; payload: number }
  | { type: 'ADD_TO_CART'; payload: any }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_TIMESTAMP' }
  | { type: 'SET_CURRENT_PATH'; payload: string }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: GlobalState = {
  currentProduct: null,
  selectedColor: '',
  selectedQuantity: 1,
  cartItems: [],
  isLoading: false,
  error: null,
  lastUpdated: new Date(),
  currentPath: '/',
  previousPath: '/',
  theme: 'light',
  language: 'en'
};

// Reducer function
const globalReducer = (state: GlobalState, action: GlobalAction): GlobalState => {
  switch (action.type) {
    case 'SET_CURRENT_PRODUCT':
      return {
        ...state,
        currentProduct: action.payload,
        lastUpdated: new Date()
      };
    
    case 'SET_SELECTED_COLOR':
      return {
        ...state,
        selectedColor: action.payload,
        lastUpdated: new Date()
      };
    
    case 'SET_SELECTED_QUANTITY':
      return {
        ...state,
        selectedQuantity: action.payload,
        lastUpdated: new Date()
      };
    
    case 'ADD_TO_CART':
      const existingItem = state.cartItems.find(
        item => item.id === action.payload.id && item.selectedColor === action.payload.selectedColor
      );
      
      if (existingItem) {
        return {
          ...state,
          cartItems: state.cartItems.map(item =>
            item.id === action.payload.id && item.selectedColor === action.payload.selectedColor
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
          lastUpdated: new Date()
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, action.payload],
          lastUpdated: new Date()
        };
      }
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter(item => item.id !== action.payload),
        lastUpdated: new Date()
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        cartItems: [],
        lastUpdated: new Date()
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    
    case 'UPDATE_TIMESTAMP':
      return {
        ...state,
        lastUpdated: new Date()
      };
    
    case 'SET_CURRENT_PATH':
      return {
        ...state,
        previousPath: state.currentPath,
        currentPath: action.payload
      };
    
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
        lastUpdated: new Date()
      };
    
    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.payload,
        lastUpdated: new Date()
      };
    
    case 'RESET_STATE':
      return {
        ...initialState,
        theme: state.theme, // Preserve theme
        language: state.language // Preserve language
      };
    
    default:
      return state;
  }
};

// Context interface
interface RealtimeContextType {
  state: GlobalState;
  dispatch: React.Dispatch<GlobalAction>;
  
  // Convenience methods
  setCurrentProduct: (product: any) => void;
  setSelectedColor: (color: string) => void;
  setSelectedQuantity: (quantity: number) => void;
  addToCart: (item: any) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPath: (path: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
  resetState: () => void;
}

// Create context
const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

// Provider component
export const RealtimeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  // Convenience methods
  const setCurrentProduct = useCallback((product: any) => {
    dispatch({ type: 'SET_CURRENT_PRODUCT', payload: product });
  }, []);

  const setSelectedColor = useCallback((color: string) => {
    dispatch({ type: 'SET_SELECTED_COLOR', payload: color });
  }, []);

  const setSelectedQuantity = useCallback((quantity: number) => {
    dispatch({ type: 'SET_SELECTED_QUANTITY', payload: quantity });
  }, []);

  const addToCart = useCallback((item: any) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setCurrentPath = useCallback((path: string) => {
    dispatch({ type: 'SET_CURRENT_PATH', payload: path });
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const setLanguage = useCallback((language: string) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  const contextValue: RealtimeContextType = {
    state,
    dispatch,
    setCurrentProduct,
    setSelectedColor,
    setSelectedQuantity,
    addToCart,
    removeFromCart,
    clearCart,
    setLoading,
    setError,
    setCurrentPath,
    setTheme,
    setLanguage,
    resetState
  };

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
};

// Hook to use the context
export const useRealtimeContext = (): RealtimeContextType => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtimeContext must be used within a RealtimeProvider');
  }
  return context;
};

// Selector hooks for specific state slices
export const useCurrentProduct = () => {
  const { state } = useRealtimeContext();
  return state.currentProduct;
};

export const useSelectedColor = () => {
  const { state, setSelectedColor } = useRealtimeContext();
  return [state.selectedColor, setSelectedColor] as const;
};

export const useSelectedQuantity = () => {
  const { state, setSelectedQuantity } = useRealtimeContext();
  return [state.selectedQuantity, setSelectedQuantity] as const;
};

export const useCart = () => {
  const { state, addToCart, removeFromCart, clearCart } = useRealtimeContext();
  return {
    items: state.cartItems,
    addItem: addToCart,
    removeItem: removeFromCart,
    clearCart
  };
};

export const useLoadingState = () => {
  const { state, setLoading } = useRealtimeContext();
  return [state.isLoading, setLoading] as const;
};

export const useErrorState = () => {
  const { state, setError } = useRealtimeContext();
  return [state.error, setError] as const;
};
