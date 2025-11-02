/**
 * Supabase Products Table Utilities
 * Sync and manage products in Supabase database
 */

import { supabase, SupabaseProduct } from '@/lib/supabase';
import { Product } from '@/data/products';

/**
 * Convert website product to Supabase product format
 */
function convertToSupabaseProduct(product: Product): Partial<SupabaseProduct> {
  // Extract numeric price (remove currency symbols)
  const price = parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0;
  // Extract original price if available (for compare_at_price)
  const originalPrice = product.originalPrice
    ? parseFloat(String(product.originalPrice).replace(/[^0-9.]/g, '') || '0')
    : null;

  return {
    product_id: product.id,
    title: product.name,
    description: Array.isArray(product.description)
      ? product.description.join('\n\n')
      : product.description || '',
    price: price,
    compare_at_price: originalPrice && originalPrice > price ? originalPrice : null,
    cost: null, // COGS - set manually if available
    category: product.category || 'Uncategorized',
    subcategory: product.hairType || product.subcategory || '',
    brand: product.brand || 'CURLEA',
    sku: product.sku || product.id,
    image_url: product.image || (product.images && product.images[0]) || '',
    is_active: product.inStock !== false,
    inventory_count: product.inventory_count !== undefined
      ? product.inventory_count
      : product.inStock !== false ? 100 : 0,
  };
}

/**
 * Sync a single product to Supabase
 */
export async function syncProductToSupabase(product: Product): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseProduct = convertToSupabaseProduct(product);

    // Upsert product (insert or update if exists)
    const { error } = await supabase
      .from('products')
      .upsert(supabaseProduct, {
        onConflict: 'product_id',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('Error syncing product to Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error syncing product:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sync all products from website to Supabase
 */
export async function syncAllProductsToSupabase(products: Product[]): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const product of products) {
    const result = await syncProductToSupabase(product);
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push(`${product.name}: ${result.error}`);
    }
  }

  return results;
}

/**
 * Get all active products from Supabase
 */
export async function getSupabaseProducts(): Promise<{
  data: SupabaseProduct[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get product by product_id from Supabase
 */
export async function getSupabaseProductById(productId: string): Promise<{
  data: SupabaseProduct | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Update product inventory in Supabase
 */
export async function updateProductInventory(
  productId: string,
  inventoryCount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('products')
      .update({ inventory_count: inventoryCount })
      .eq('product_id', productId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

