/**
 * Analytics Dashboard - Inventory Service
 * Mirrors the main frontend inventory service with database integration
 */

import { supabase } from '@/lib/supabase';

export interface VariantStock {
    id: string;
    product_id: string;
    variant_name: string;
    size: string;
    color: string | null;
    stock_quantity: number;
    reserved_quantity: number;
    available_quantity: number;
    price: number | null;
    is_active: boolean;
}

/**
 * Get stock for a specific product variant
 */
export async function getVariantStock(
    productId: string,
    size: string = 'Standard',
    color: string | null = null
): Promise<VariantStock | null> {
    try {
        let query = supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', productId)
            .eq('size', size)
            .eq('is_active', true);

        if (color) {
            query = query.eq('color', color);
        } else {
            query = query.is('color', null);
        }

        const { data, error } = await query.limit(1).maybeSingle();

        if (error) {
            if (error.code !== 'PGRST116') {
                console.error('Error fetching variant stock:', error);
            }
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in getVariantStock:', error);
        return null;
    }
}

/**
 * Get all variants for a product
 */
export async function getAllVariantsForProduct(
    productId: string
): Promise<VariantStock[]> {
    try {
        const { data, error } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', productId)
            .eq('is_active', true)
            .order('size')
            .order('color');

        if (error) {
            console.error('Error fetching product variants:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getAllVariantsForProduct:', error);
        return [];
    }
}

/**
 * Check if a variant is in stock
 */
export async function isVariantInStock(
    productId: string,
    size: string = 'Standard',
    color: string | null = null
): Promise<boolean> {
    const variant = await getVariantStock(productId, size, color);
    return variant ? variant.available_quantity > 0 : false;
}

/**
 * Get stock status for a variant
 */
export async function getStockStatus(
    productId: string,
    size: string = 'Standard',
    color: string | null = null
): Promise<'in_stock' | 'low_stock' | 'out_of_stock'> {
    const variant = await getVariantStock(productId, size, color);

    if (!variant || variant.available_quantity === 0) {
        return 'out_of_stock';
    }

    if (variant.available_quantity <= 3) {
        return 'low_stock';
    }

    return 'in_stock';
}

/**
 * Get total stock across all variants for a product
 */
export async function getTotalProductStock(productId: string): Promise<number> {
    try {
        const { data, error } = await supabase
            .from('product_variants')
            .select('stock_quantity')
            .eq('product_id', productId)
            .eq('is_active', true);

        if (error) {
            console.error('Error fetching total stock:', error);
            return 0;
        }

        return data?.reduce((sum, v) => sum + (v.stock_quantity || 0), 0) || 0;
    } catch (error) {
        console.error('Error in getTotalProductStock:', error);
        return 0;
    }
}

/**
 * Check if any variant of a product is available
 */
export async function hasAnyVariantInStock(productId: string): Promise<boolean> {
    const totalStock = await getTotalProductStock(productId);
    return totalStock > 0;
}

/**
 * Normalize color names for matching
 * Maps CSV/UI color names to database color names
 */
export function normalizeColorName(color: string | null): string | null {
    if (!color) return null;

    const normalized = color.trim();

    const colorMap: Record<string, string> = {
        // CSV/Legacy color names → Database color names
        'purple': 'Mulberry',
        'pink': 'CANDY',
        'brown': 'Latte',    // CSV legacy - converts to Latte
        'green': 'Olive',

        // UI color names (various cases) → Database color names
        'MULBERRY': 'Mulberry',
        'Mulberry': 'Mulberry',
        'mulberry': 'Mulberry',
        'PURPLE': 'Mulberry',
        'Purple': 'Mulberry',
        
        'CANDY': 'CANDY',
        'Candy': 'CANDY',
        'candy': 'CANDY',
        'PINK': 'CANDY',
        'Pink': 'CANDY',
        
        'LATTE': 'Latte',
        'Latte': 'Latte',
        'latte': 'Latte',
        'BROWN': 'Latte',    // Legacy - converts to Latte
        'Brown': 'Latte',    // Legacy - converts to Latte
        
        'OLIVE': 'Olive',
        'Olive': 'Olive',
        'olive': 'Olive',
        'GREEN': 'Olive',
        'Green': 'Olive',

        // Single Sets mapping (special case)
        'Royal Purple': 'Royal Purple',
        'Rose Gold': 'Rose Gold',
        'Earl Grey': 'Earl Grey',
        'Olive Lux': 'Olive Lux',
    };

    return colorMap[normalized] || color;
}

/**
 * Normalize size names for matching
 * Maps UI size names to database size names
 */
export function normalizeSizeName(size: string | null): string | null {
    if (!size) return null;

    const sizeMap: Record<string, string> = {
        'Original': 'Large',
        'original': 'Large',
        'ORIGINAL': 'Large',
        'Large': 'Large',
        'large': 'Large',
        'LARGE': 'Large',
        'Mini': 'Mini',
        'mini': 'Mini',
        'MINI': 'Mini',
        'Midi': 'Midi',
        'midi': 'Midi',
        'MIDI': 'Midi',
        'Jumbo': 'Jumbo',
        'jumbo': 'Jumbo',
        'JUMBO': 'Jumbo',
        'Standard': 'Standard',
        'standard': 'Standard',
        'STANDARD': 'Standard',
    };

    return sizeMap[size] || size;
}

/**
 * Get variant stock with color/size normalization
 */
export async function getVariantStockNormalized(
    productId: string,
    size: string | null = 'Standard',
    color: string | null = null
): Promise<VariantStock | null> {
    const normalizedColor = normalizeColorName(color);
    const normalizedSize = normalizeSizeName(size);
    return getVariantStock(productId, normalizedSize || 'Standard', normalizedColor);
}

