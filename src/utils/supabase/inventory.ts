import { supabase } from '@/lib/supabase';

export interface VariantAvailability {
  id: string;
  product_id: string;
  variant_name: string;
  size: string;
  color: string | null;
  sku: string | null;
  stock_quantity: number | null;
  reserved_quantity: number | null;
  available_quantity: number | null;
  price: number | null;
  is_active: boolean | null;
  updated_at: string | null;
}

const normalize = (value?: string | null) =>
  (value ?? '')
    .toString()
    .trim()
    .toLowerCase();

export function resolveAvailableQuantity(variant?: Partial<VariantAvailability> | null) {
  if (!variant) return null;
  if (typeof variant.available_quantity === 'number') return variant.available_quantity;
  if (typeof variant.stock_quantity === 'number') {
    const reserved = typeof variant.reserved_quantity === 'number' ? variant.reserved_quantity : 0;
    return Math.max(variant.stock_quantity - reserved, 0);
  }
  return null;
}

function matchVariant(
  variants: VariantAvailability[],
  size?: string,
  color?: string
): VariantAvailability | null {
  if (!variants || variants.length === 0) return null;

  const sizeNorm = normalize(size);
  const colorNorm = normalize(color);

  const exactMatch = variants.find((variant) => {
    const variantSize = normalize(variant.size);
    const variantColor = normalize(variant.color);
    const sizeMatches = !sizeNorm || variantSize === sizeNorm;
    const colorMatches = !colorNorm || variantColor === colorNorm;
    return sizeMatches && colorMatches;
  });
  if (exactMatch) return exactMatch;

  // Try matching variant_name
  if (sizeNorm || colorNorm) {
    const fuzzy = variants.find((variant) => {
      const variantName = normalize(variant.variant_name);
      return (
        (!!sizeNorm && variantName.includes(sizeNorm)) ||
        (!!colorNorm && variantName.includes(colorNorm))
      );
    });
    if (fuzzy) return fuzzy;
  }

  return variants[0];
}

export async function fetchProductVariants(productId: string) {
  const { data, error } = await supabase
    .from<VariantAvailability>('product_variants')
    .select('*')
    .eq('product_id', productId)
    .eq('is_active', true);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function fetchProductInventoryCount(productId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('inventory_count')
    .eq('product_id', productId)
    .single();

  if (error) {
    console.warn('[Inventory] Failed to fetch product inventory count:', error.message);
    return null;
  }

  return typeof data?.inventory_count === 'number' ? data.inventory_count : null;
}

export async function fetchVariantAvailability(
  productId: string,
  size?: string,
  color?: string
): Promise<{
  available: number | null;
  variant: VariantAvailability | null;
}> {
  if (!productId) {
    return { available: null, variant: null };
  }

  try {
    const variants = await fetchProductVariants(productId);
    if (variants.length === 0) {
      const fallback = await fetchProductInventoryCount(productId);
      return { available: fallback, variant: null };
    }

    const matched = matchVariant(variants, size, color);
    return {
      available: resolveAvailableQuantity(matched),
      variant: matched,
    };
  } catch (error) {
    console.error('[Inventory] Failed to fetch variant availability:', error);
    const fallback = await fetchProductInventoryCount(productId);
    return { available: fallback, variant: null };
  }
}

export function sumAvailableInventory(variants: VariantAvailability[]) {
  return variants.reduce((sum, variant) => {
    const available = resolveAvailableQuantity(variant);
    return sum + (available ?? 0);
  }, 0);
}


