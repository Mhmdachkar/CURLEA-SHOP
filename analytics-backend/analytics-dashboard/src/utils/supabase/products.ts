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

/**
 * Update product price in Supabase (PROFESSIONAL PRICING MANAGEMENT)
 */
export async function updateProductPrice(
  productId: string,
  price: number,
  compareAtPrice?: number | null,
  cost?: number | null
): Promise<{ success: boolean; error?: string }> {
  try {
    if (price < 0) {
      return { success: false, error: 'Price must be a positive number' };
    }

    const updateData: Partial<SupabaseProduct> = {
      price: price,
    };

    if (compareAtPrice !== undefined) {
      updateData.compare_at_price = compareAtPrice && compareAtPrice > price ? compareAtPrice : null;
    }

    if (cost !== undefined) {
      updateData.cost = cost && cost >= 0 ? cost : null;
    }

    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('product_id', productId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Batch update product prices
 */
export async function batchUpdateProductPrices(
  updates: Array<{
    productId: string;
    price: number;
    compareAtPrice?: number | null;
    cost?: number | null;
  }>
): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const update of updates) {
    const result = await updateProductPrice(
      update.productId,
      update.price,
      update.compareAtPrice,
      update.cost
    );

    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push(`${update.productId}: ${result.error}`);
    }
  }

  return results;
}

/**
 * Merge Supabase prices with local product data
 * This is the SOURCE OF TRUTH for prices - Supabase prices override local prices
 */
export function mergeProductWithSupabasePrice(
  localProduct: Product,
  supabaseProduct: SupabaseProduct | null
): Product {
  if (!supabaseProduct) {
    return localProduct;
  }

  // Format price from Supabase (numeric) to display format (string with currency)
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  // Use Supabase price if available, otherwise fall back to local price
  const realPrice = supabaseProduct.price > 0
    ? formatPrice(supabaseProduct.price)
    : localProduct.price;

  // Handle original/compare at price
  const originalPrice = supabaseProduct.compare_at_price && supabaseProduct.compare_at_price > supabaseProduct.price
    ? formatPrice(supabaseProduct.compare_at_price)
    : undefined;

  return {
    ...localProduct,
    price: realPrice,
    originalPrice: originalPrice,
    // Store the numeric price for calculations
    numericPrice: supabaseProduct.price > 0 ? supabaseProduct.price : parseFloat(localProduct.price.replace(/[^0-9.]/g, '')) || 0,
  };
}

/**
 * Get all products with real prices from Supabase
 * Returns merged products where Supabase prices override local prices
 */
export async function getProductsWithRealPrices(): Promise<{
  products: Product[];
  errors: string[];
}> {
  const { products: localProducts } = await import('@/data/products');
  const { data: supabaseProducts, error } = await getSupabaseProducts();

  if (error) {
    console.warn('Could not fetch Supabase prices, using local prices:', error);
    return {
      products: localProducts,
      errors: [error],
    };
  }

  // Create a map of Supabase products by product_id for quick lookup
  const supabaseProductMap = new Map<string, SupabaseProduct>();
  if (supabaseProducts) {
    supabaseProducts.forEach((sp) => {
      supabaseProductMap.set(sp.product_id, sp);
    });
  }

  // Merge each local product with its Supabase price
  const mergedProducts = localProducts.map((localProduct) => {
    const supabaseProduct = supabaseProductMap.get(localProduct.id);
    return mergeProductWithSupabasePrice(localProduct, supabaseProduct || null);
  });

  return {
    products: mergedProducts,
    errors: [],
  };
}

/**
 * Get a single product with real price from Supabase
 */
export async function getProductWithRealPrice(productId: string): Promise<{
  product: Product | null;
  error: string | null;
}> {
  try {
    const { getProductById } = await import('@/data/products');
    const localProduct = getProductById(productId);

    if (!localProduct) {
      return { product: null, error: 'Product not found' };
    }

    const { data: supabaseProduct, error } = await getSupabaseProductById(productId);

    if (error && error !== 'PGRST116') {
      // PGRST116 = no rows returned, which is acceptable (use local price)
      console.warn('Could not fetch Supabase price, using local price:', error);
    }

    const mergedProduct = mergeProductWithSupabasePrice(localProduct, supabaseProduct || null);

    return { product: mergedProduct, error: null };
  } catch (error: any) {
    return { product: null, error: error.message };
  }
}
