/**
 * React Hook for Products with Real Prices from Supabase
 * This hook merges local product data with Supabase prices (source of truth)
 */

import { useState, useEffect } from 'react';
import { getProductsWithRealPrices, getProductWithRealPrice } from '@/utils/supabase/products';
import { Product } from '@/data/products';

/**
 * Hook to get all products with real prices from Supabase
 */
export function useProductsWithRealPrices() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getProductsWithRealPrices();
      
      if (result.errors.length > 0) {
        console.warn('Some errors occurred while loading prices:', result.errors);
        // Still use the products even if there were errors
      }
      
      setProducts(result.products);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading products with real prices:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    reload: loadProducts,
  };
}

/**
 * Hook to get a single product with real price from Supabase
 */
export function useProductWithRealPrice(productId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getProductWithRealPrice(productId);
        
        if (result.error) {
          setError(result.error);
        } else {
          setProduct(result.product);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error loading product with real price:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  return {
    product,
    loading,
    error,
  };
}

