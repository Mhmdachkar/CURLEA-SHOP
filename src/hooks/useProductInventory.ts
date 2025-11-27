import { useEffect, useState, useCallback } from 'react';
import { VariantAvailability, fetchProductVariants } from '@/utils/supabase/inventory';

interface UseProductInventoryResult {
  variants: VariantAvailability[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useProductInventory(productId?: string | null): UseProductInventoryResult {
  const [variants, setVariants] = useState<VariantAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVariants = useCallback(async () => {
    if (!productId) {
      setVariants([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchProductVariants(productId);
      setVariants(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load inventory');
      setVariants([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    let active = true;
    if (!active) return;
    loadVariants();
    return () => {
      active = false;
    };
  }, [loadVariants]);

  return {
    variants,
    loading,
    error,
    reload: loadVariants,
  };
}


