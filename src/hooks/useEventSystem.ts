// Custom event system for cross-component communication
import { useEffect, useCallback, useRef } from 'react';

// Event system implementation
class EventSystem {
  private events: Map<string, Set<(data?: any) => void>> = new Map();

  // Subscribe to an event
  subscribe(eventName: string, callback: (data?: any) => void): () => void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    
    this.events.get(eventName)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.events.get(eventName)?.delete(callback);
    };
  }

  // Emit an event
  emit(eventName: string, data?: any): void {
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${eventName}:`, error);
        }
      });
    }
  }

  // Remove all listeners for an event
  removeAllListeners(eventName: string): void {
    this.events.delete(eventName);
  }

  // Get all event names
  getEventNames(): string[] {
    return Array.from(this.events.keys());
  }

  // Check if event has listeners
  hasListeners(eventName: string): boolean {
    return this.events.has(eventName) && this.events.get(eventName)!.size > 0;
  }
}

// Global event system instance
const eventSystem = new EventSystem();

/**
 * Hook for subscribing to custom events
 */
export const useEvent = (
  eventName: string,
  callback: (data?: any) => void,
  deps: React.DependencyList = []
) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const wrappedCallback = (data?: any) => {
      callbackRef.current(data);
    };

    const unsubscribe = eventSystem.subscribe(eventName, wrappedCallback);

    return unsubscribe;
  }, [eventName, ...deps]);
};

/**
 * Hook for emitting events
 */
export const useEmit = () => {
  return useCallback((eventName: string, data?: any) => {
    eventSystem.emit(eventName, data);
  }, []);
};

/**
 * Hook for event-based state synchronization
 */
export const useEventSync = <T>(
  eventName: string,
  initialValue: T,
  transformFn?: (data: any) => T
) => {
  const [value, setValue] = React.useState<T>(initialValue);

  useEvent(eventName, (data) => {
    if (transformFn) {
      setValue(transformFn(data));
    } else {
      setValue(data);
    }
  });

  return value;
};

/**
 * Hook for event-based actions
 */
export const useEventAction = () => {
  const emit = useEmit();

  const triggerAction = useCallback((actionName: string, payload?: any) => {
    emit(`action:${actionName}`, payload);
  }, [emit]);

  const onAction = useCallback((
    actionName: string,
    handler: (payload?: any) => void,
    deps: React.DependencyList = []
  ) => {
    useEvent(`action:${actionName}`, handler, deps);
  }, []);

  return { triggerAction, onAction };
};

/**
 * Hook for event-based navigation
 */
export const useEventNavigation = () => {
  const emit = useEmit();

  const navigateTo = useCallback((path: string, state?: any) => {
    emit('navigation:navigate', { path, state });
  }, [emit]);

  const goBack = useCallback(() => {
    emit('navigation:back');
  }, [emit]);

  const goForward = useCallback(() => {
    emit('navigation:forward');
  }, [emit]);

  return { navigateTo, goBack, goForward };
};

/**
 * Hook for event-based form synchronization
 */
export const useEventForm = (formId: string) => {
  const emit = useEmit();

  const updateField = useCallback((fieldName: string, value: any) => {
    emit(`form:${formId}:update`, { fieldName, value });
  }, [emit, formId]);

  const submitForm = useCallback((data: any) => {
    emit(`form:${formId}:submit`, data);
  }, [emit, formId]);

  const resetForm = useCallback(() => {
    emit(`form:${formId}:reset`);
  }, [emit, formId]);

  return { updateField, submitForm, resetForm };
};

/**
 * Hook for event-based product updates
 */
export const useEventProduct = () => {
  const emit = useEmit();

  const selectProduct = useCallback((product: any) => {
    emit('product:select', product);
  }, [emit]);

  const selectColor = useCallback((color: string) => {
    emit('product:color:select', color);
  }, [emit]);

  const selectQuantity = useCallback((quantity: number) => {
    emit('product:quantity:select', quantity);
  }, [emit]);

  const addToCart = useCallback((item: any) => {
    emit('cart:add', item);
  }, [emit]);

  const removeFromCart = useCallback((itemId: string) => {
    emit('cart:remove', itemId);
  }, [emit]);

  return {
    selectProduct,
    selectColor,
    selectQuantity,
    addToCart,
    removeFromCart
  };
};

/**
 * Hook for event-based UI updates
 */
export const useEventUI = () => {
  const emit = useEmit();

  const showLoading = useCallback((message?: string) => {
    emit('ui:loading:show', message);
  }, [emit]);

  const hideLoading = useCallback(() => {
    emit('ui:loading:hide');
  }, [emit]);

  const showError = useCallback((message: string) => {
    emit('ui:error:show', message);
  }, [emit]);

  const hideError = useCallback(() => {
    emit('ui:error:hide');
  }, [emit]);

  const showSuccess = useCallback((message: string) => {
    emit('ui:success:show', message);
  }, [emit]);

  const toggleTheme = useCallback(() => {
    emit('ui:theme:toggle');
  }, [emit]);

  return {
    showLoading,
    hideLoading,
    showError,
    hideError,
    showSuccess,
    toggleTheme
  };
};

// Event constants for type safety
export const EVENTS = {
  // Product events
  PRODUCT_SELECT: 'product:select',
  PRODUCT_COLOR_SELECT: 'product:color:select',
  PRODUCT_QUANTITY_SELECT: 'product:quantity:select',
  
  // Cart events
  CART_ADD: 'cart:add',
  CART_REMOVE: 'cart:remove',
  CART_CLEAR: 'cart:clear',
  CART_UPDATE: 'cart:update',
  
  // Navigation events
  NAVIGATION_NAVIGATE: 'navigation:navigate',
  NAVIGATION_BACK: 'navigation:back',
  NAVIGATION_FORWARD: 'navigation:forward',
  
  // UI events
  UI_LOADING_SHOW: 'ui:loading:show',
  UI_LOADING_HIDE: 'ui:loading:hide',
  UI_ERROR_SHOW: 'ui:error:show',
  UI_ERROR_HIDE: 'ui:error:hide',
  UI_SUCCESS_SHOW: 'ui:success:show',
  UI_THEME_TOGGLE: 'ui:theme:toggle',
  
  // Form events
  FORM_UPDATE: 'form:update',
  FORM_SUBMIT: 'form:submit',
  FORM_RESET: 'form:reset',
  
  // Data sync events
  DATA_SYNC: 'data:sync',
  DATA_UPDATE: 'data:update',
  DATA_REFRESH: 'data:refresh'
} as const;

// Export the event system instance for direct access if needed
export { eventSystem };
