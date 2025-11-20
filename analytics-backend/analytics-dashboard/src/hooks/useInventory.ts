/**
 * React Hooks for Inventory Management
 * Access to product_variants and inventory_movements tables
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_name: string;
  size: string;
  color: string | null;
  sku: string | null;
  stock_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  price: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryDashboardItem extends ProductVariant {
  product_name: string | null;
  stock_status: 'out_of_stock' | 'low_stock' | 'moderate' | 'in_stock';
  sales_last_30_days: number;
}

export interface InventoryMovement {
  id: string;
  variant_id: string;
  movement_type: 'sale' | 'restock' | 'adjustment' | 'return' | 'damage';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  order_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface LowStockAlert {
  id: string;
  product_id: string;
  product_name: string | null;
  variant_name: string;
  sku: string | null;
  available_quantity: number;
  updated_at: string;
}

/**
 * Hook to fetch all product variants
 */
export function useProductVariants() {
  const [data, setData] = useState<ProductVariant[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: variants, error: err } = await supabase
        .from('product_variants')
        .select('*')
        .order('product_id', { ascending: true })
        .order('size', { ascending: true })
        .order('color', { ascending: true });

      if (err) {
        setError(err.message);
      } else {
        setData(variants || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, reload: loadData };
}

/**
 * Hook to fetch inventory dashboard view
 */
export function useInventoryDashboard() {
  const [data, setData] = useState<InventoryDashboardItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: inventory, error: err } = await supabase
        .from('inventory_dashboard')
        .select('*')
        .order('product_id', { ascending: true })
        .order('size', { ascending: true })
        .order('color', { ascending: true });

      if (err) {
        setError(err.message);
      } else {
        setData(inventory || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, reload: loadData };
}

/**
 * Hook to fetch low stock alerts
 */
export function useLowStockAlerts() {
  const [data, setData] = useState<LowStockAlert[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: alerts, error: err } = await supabase
        .from('low_stock_alerts')
        .select('*')
        .order('available_quantity', { ascending: true })
        .order('updated_at', { ascending: false });

      if (err) {
        setError(err.message);
      } else {
        setData(alerts || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, reload: loadData };
}

/**
 * Hook to fetch inventory movements
 */
export function useInventoryMovements(limit: number = 50) {
  const [data, setData] = useState<InventoryMovement[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [limit]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: movements, error: err } = await supabase
        .from('inventory_movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (err) {
        setError(err.message);
      } else {
        setData(movements || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, reload: loadData };
}

/**
 * Hook to get inventory statistics
 */
export function useInventoryStats() {
  const [stats, setStats] = useState<{
    totalVariants: number;
    totalStock: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: variants, error: err } = await supabase
        .from('product_variants')
        .select('stock_quantity, available_quantity, price, is_active');

      if (err) {
        setError(err.message);
      } else {
        const activeVariants = variants?.filter(v => v.is_active) || [];
        
        const stats = {
          totalVariants: activeVariants.length,
          totalStock: activeVariants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0),
          totalValue: activeVariants.reduce((sum, v) => sum + ((v.stock_quantity || 0) * (v.price || 0)), 0),
          lowStockCount: activeVariants.filter(v => (v.available_quantity || 0) < 5 && (v.available_quantity || 0) > 0).length,
          outOfStockCount: activeVariants.filter(v => (v.available_quantity || 0) === 0).length,
        };
        
        setStats(stats);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, reload: loadStats };
}

/**
 * Function to manually adjust stock
 */
export async function adjustStock(
  variantId: string,
  quantity: number,
  movementType: 'restock' | 'adjustment' | 'damage',
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current stock
    const { data: variant, error: fetchError } = await supabase
      .from('product_variants')
      .select('stock_quantity')
      .eq('id', variantId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    const previousStock = variant.stock_quantity;
    const newStock = previousStock + quantity;

    // Update stock
    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ 
        stock_quantity: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', variantId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Log the movement
    const { error: logError } = await supabase
      .from('inventory_movements')
      .insert({
        variant_id: variantId,
        movement_type: movementType,
        quantity: quantity,
        previous_stock: previousStock,
        new_stock: newStock,
        notes: notes || null,
        created_by: 'admin'
      });

    if (logError) {
      console.error('Failed to log inventory movement:', logError);
      // Don't fail the whole operation if logging fails
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

