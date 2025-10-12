// Real-time synchronization component for automatic updates
import { useEffect } from 'react';
import { useEvent, EVENTS } from '@/hooks/useEventSystem';
import { useRealtimeContext } from '@/contexts/RealtimeContext';
import { useCart } from '@/contexts/CartContext';

/**
 * Component that handles real-time synchronization between different parts of the app
 * This ensures all components stay in sync automatically without manual refreshes
 */
export const RealtimeSync = () => {
  const { state: globalState, setCurrentProduct, setSelectedColor, setSelectedQuantity } = useRealtimeContext();
  const { addToCart: addToCartContext, removeFromCart: removeFromCartContext } = useCart();

  // Listen for product selection events
  useEvent(EVENTS.PRODUCT_SELECT, (product) => {
    if (product) {
      setCurrentProduct(product);
    }
  });

  // Listen for color selection events
  useEvent(EVENTS.PRODUCT_COLOR_SELECT, (color) => {
    setSelectedColor(color);
  });

  // Listen for quantity selection events
  useEvent(EVENTS.PRODUCT_QUANTITY_SELECT, (quantity) => {
    setSelectedQuantity(quantity);
  });

  // Listen for cart add events
  useEvent(EVENTS.CART_ADD, (item) => {
    if (item) {
      addToCartContext(item);
    }
  });

  // Listen for cart remove events
  useEvent(EVENTS.CART_REMOVE, (itemId) => {
    if (itemId) {
      removeFromCartContext(itemId);
    }
  });

  // Listen for UI state events
  useEvent(EVENTS.UI_LOADING_SHOW, () => {
    // Handle loading state if needed
  });

  useEvent(EVENTS.UI_LOADING_HIDE, () => {
    // Handle loading state if needed
  });

  // Listen for navigation events
  useEvent(EVENTS.NAVIGATION_NAVIGATE, ({ path, state }) => {
    // Handle navigation if needed
    if (typeof window !== 'undefined') {
      window.history.pushState(state, '', path);
    }
  });

  // Listen for data sync events
  useEvent(EVENTS.DATA_SYNC, (data) => {
    // Handle data synchronization
    console.log('Data sync event received:', data);
  });

  // Auto-sync cart state to global state
  useEffect(() => {
    // This effect runs whenever the global state changes
    // It can be used to sync with external systems or trigger other updates
    console.log('Global state updated:', {
      currentProduct: globalState.currentProduct?.name,
      selectedColor: globalState.selectedColor,
      selectedQuantity: globalState.selectedQuantity,
      cartItems: globalState.cartItems.length,
      lastUpdated: globalState.lastUpdated
    });
  }, [globalState]);

  // This component doesn't render anything - it just handles synchronization
  return null;
};

/**
 * Hook for components that need to stay in sync with real-time updates
 */
export const useRealtimeSync = (syncKey: string) => {
  const { state } = useRealtimeContext();

  // Listen for specific sync events
  useEvent(`${EVENTS.DATA_SYNC}:${syncKey}`, (data) => {
    // Handle specific sync data
    console.log(`Sync event for ${syncKey}:`, data);
  });

  return state;
};

/**
 * Hook for automatic form synchronization
 */
export const useFormSync = (formId: string) => {
  const [formData, setFormData] = React.useState({});

  // Listen for form update events
  useEvent(`${EVENTS.FORM_UPDATE}:${formId}`, ({ fieldName, value }) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  });

  // Listen for form reset events
  useEvent(`${EVENTS.FORM_RESET}:${formId}`, () => {
    setFormData({});
  });

  return formData;
};
