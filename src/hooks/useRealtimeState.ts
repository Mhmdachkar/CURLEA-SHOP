// Real-time state management hook for instant updates
import { useState, useEffect, useCallback, useRef } from 'react';

// Global state store for cross-component synchronization
const globalState = new Map<string, any>();
const subscribers = new Map<string, Set<(value: any) => void>>();

/**
 * Custom hook for real-time state management
 * Automatically syncs state across all components using the same key
 */
export const useRealtimeState = <T>(key: string, initialValue: T) => {
  const [state, setState] = useState<T>(() => {
    // Initialize from global state if exists
    return globalState.has(key) ? globalState.get(key) : initialValue;
  });

  // Subscribe to global state changes
  useEffect(() => {
    if (!subscribers.has(key)) {
      subscribers.set(key, new Set());
    }

    const updateState = (newValue: T) => {
      setState(newValue);
    };

    subscribers.get(key)!.add(updateState);

    return () => {
      subscribers.get(key)?.delete(updateState);
    };
  }, [key]);

  // Update function that broadcasts to all subscribers
  const updateState = useCallback((newValue: T | ((prev: T) => T)) => {
    const value = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(state) 
      : newValue;
    
    // Update global state
    globalState.set(key, value);
    
    // Broadcast to all subscribers
    subscribers.get(key)?.forEach(callback => {
      callback(value);
    });
  }, [key, state]);

  return [state, updateState] as const;
};

/**
 * Hook for real-time computed values that update automatically
 */
export const useRealtimeComputed = <T>(
  key: string,
  computeFn: () => T,
  deps: React.DependencyList = []
) => {
  const [computedValue, setComputedValue] = useState<T>(computeFn);
  const prevDeps = useRef(deps);

  useEffect(() => {
    // Check if dependencies changed
    const depsChanged = deps.some((dep, index) => dep !== prevDeps.current[index]);
    
    if (depsChanged) {
      const newValue = computeFn();
      setComputedValue(newValue);
      globalState.set(key, newValue);
      
      // Broadcast to subscribers
      subscribers.get(key)?.forEach(callback => {
        callback(newValue);
      });
      
      prevDeps.current = deps;
    }
  }, [key, computeFn, deps]);

  return computedValue;
};

/**
 * Hook for real-time subscriptions to external data
 */
export const useRealtimeSubscription = <T>(
  key: string,
  subscribeFn: (callback: (value: T) => void) => () => void,
  initialValue: T
) => {
  const [data, setData] = useState<T>(initialValue);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Cleanup previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    // Subscribe to new data source
    const unsubscribe = subscribeFn((newValue: T) => {
      setData(newValue);
      globalState.set(key, newValue);
      
      // Broadcast to all subscribers
      subscribers.get(key)?.forEach(callback => {
        callback(newValue);
      });
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [key, subscribeFn]);

  return data;
};

/**
 * Utility to manually trigger global state updates
 */
export const updateGlobalState = <T>(key: string, value: T) => {
  globalState.set(key, value);
  subscribers.get(key)?.forEach(callback => {
    callback(value);
  });
};

/**
 * Utility to get current global state
 */
export const getGlobalState = <T>(key: string): T | undefined => {
  return globalState.get(key);
};

/**
 * Utility to clear global state
 */
export const clearGlobalState = (key: string) => {
  globalState.delete(key);
  subscribers.get(key)?.clear();
};
