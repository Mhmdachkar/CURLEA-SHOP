/**
 * React Hook for Supabase Products
 * Easy access to product sync and retrieval
 */

import { useState, useEffect } from 'react';
import { getSupabaseProducts, getSupabaseProductById, syncAllProductsToSupabase, SupabaseProduct } from '@/utils/supabase';
import { products } from '@/data/products';

export function useSupabaseProducts() {
  const [supabaseProducts, setSupabaseProducts] = useState<SupabaseProduct[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await getSupabaseProducts();
      if (result.error) {
        setError(result.error);
      } else {
        setSupabaseProducts(result.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const syncProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await syncAllProductsToSupabase(products);
      
      if (result.failed > 0) {
        setError(`Failed to sync ${result.failed} products. Errors: ${result.errors.join(', ')}`);
      }
      
      // Reload products after sync
      await loadProducts();
      
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    products: supabaseProducts,
    loading,
    error,
    reload: loadProducts,
    syncProducts,
  };
}

export function useSupabaseProduct(productId: string) {
  const [product, setProduct] = useState<SupabaseProduct | null>(null);
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
        const result = await getSupabaseProductById(productId);
        if (result.error) {
          setError(result.error);
        } else {
          setProduct(result.data || null);
        }
      } catch (err: any) {
        setError(err.message);
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

