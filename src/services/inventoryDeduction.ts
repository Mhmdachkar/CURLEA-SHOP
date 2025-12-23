/**
 * Inventory Deduction Service
 * Handles stock deduction after successful orders
 */

import { supabase } from '@/lib/supabase';
import { normalizeColorName } from './inventoryService';

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  size?: string;
  color?: string;
  variant?: string;
  price: number;
  metadata?: any;
}

export interface InventoryDeductionResult {
  success: boolean;
  deductedItems: Array<{
    product_id: string;
    size: string;
    color: string | null;
    quantity: number;
    variant_id: string;
  }>;
  failedItems: Array<{
    product_id: string;
    size: string;
    color: string | null;
    quantity: number;
    reason: string;
  }>;
  error?: string;
}

/**
 * Map UI size names to database size names
 */
function mapSizeToDatabase(size: string | undefined): string {
  if (!size) return 'Standard';
  
  const sizeMap: Record<string, string> = {
    'Original': 'Large',
    'Large': 'Large',
    'Mini': 'Mini',
    'Midi': 'Midi',
    'Jumbo': 'Jumbo',
    'Small': 'Small',
    'One Size': 'Standard',
    'Standard': 'Standard',
    'Default': 'Standard',
  };
  
  return sizeMap[size] || size;
}

/**
 * Extract size and color from variant string or metadata
 */
function extractVariantInfo(item: OrderItem): { size: string; color: string | null } {
  let size = 'Standard';
  let color: string | null = null;
  
  // Try metadata first (most reliable)
  if (item.metadata) {
    size = item.metadata.selectedSize || item.metadata.size || size;
    color = item.metadata.selectedColor || item.metadata.color || null;
  }
  
  // Try direct properties
  if (item.size) size = item.size;
  if (item.color) color = item.color;
  
  // Try parsing variant string
  if (!color && item.variant) {
    const colorMatch = item.variant.match(/\b(Purple|Pink|Brown|Green|Candy|Latte|Mulberry|Olive|Blue|Red|Black|White|CANDY|LATTE|MULBERRY|OLIVE)\b/i);
    if (colorMatch) color = colorMatch[1];
  }
  
  if (!size || size === 'Standard') {
    if (item.variant) {
      const sizeMatch = item.variant.match(/\b(Large|Jumbo|Midi|Small|Mini|Original|One Size)\b/i);
      if (sizeMatch) size = sizeMatch[1];
    }
  }
  
  // Map size to database format
  size = mapSizeToDatabase(size);
  
  // Normalize color
  if (color) {
    color = normalizeColorName(color);
  }
  
  return { size, color };
}

/**
 * Deduct inventory for a list of order items
 * Uses Supabase RPC function for atomic operations
 */
export async function deductInventoryForOrder(
  orderId: string,
  items: OrderItem[]
): Promise<InventoryDeductionResult> {
  const deductedItems: InventoryDeductionResult['deductedItems'] = [];
  const failedItems: InventoryDeductionResult['failedItems'] = [];
  
  console.log(`[Inventory Deduction] Starting for order ${orderId} with ${items.length} items`);
  
  for (const item of items) {
    try {
      const { size, color } = extractVariantInfo(item);
      
      console.log(`[Inventory Deduction] Processing: ${item.product_id}, Size: ${size}, Color: ${color}, Qty: ${item.quantity}`);
      
      // Find the variant in database
      let query = supabase
        .from('product_variants')
        .select('id, stock_quantity, available_quantity, variant_name')
        .eq('product_id', item.product_id)
        .eq('size', size)
        .eq('is_active', true);
      
      if (color) {
        query = query.eq('color', color);
      } else {
        query = query.is('color', null);
      }
      
      const { data: variant, error: fetchError } = await query.limit(1).maybeSingle();
      
      if (fetchError) {
        console.error(`[Inventory Deduction] Error fetching variant:`, fetchError);
        failedItems.push({
          product_id: item.product_id,
          size,
          color,
          quantity: item.quantity,
          reason: `Database error: ${fetchError.message}`,
        });
        continue;
      }
      
      if (!variant) {
        console.warn(`[Inventory Deduction] Variant not found: ${item.product_id}, Size: ${size}, Color: ${color}`);
        failedItems.push({
          product_id: item.product_id,
          size,
          color,
          quantity: item.quantity,
          reason: 'Variant not found in inventory',
        });
        continue;
      }
      
      // Check if sufficient stock
      if (variant.available_quantity < item.quantity) {
        console.warn(`[Inventory Deduction] Insufficient stock: ${variant.variant_name}, Requested: ${item.quantity}, Available: ${variant.available_quantity}`);
        failedItems.push({
          product_id: item.product_id,
          size,
          color,
          quantity: item.quantity,
          reason: `Insufficient stock (available: ${variant.available_quantity})`,
        });
        continue;
      }
      
      // Deduct stock using atomic update
      const { error: updateError } = await supabase
        .from('product_variants')
        .update({
          stock_quantity: variant.stock_quantity - item.quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', variant.id);
      
      if (updateError) {
        console.error(`[Inventory Deduction] Error updating stock:`, updateError);
        failedItems.push({
          product_id: item.product_id,
          size,
          color,
          quantity: item.quantity,
          reason: `Update failed: ${updateError.message}`,
        });
        continue;
      }
      
      // Log the inventory movement
      try {
        await supabase.from('inventory_movements').insert({
          variant_id: variant.id,
          movement_type: 'sale',
          quantity: -item.quantity,
          previous_stock: variant.stock_quantity,
          new_stock: variant.stock_quantity - item.quantity,
          order_id: orderId,
          notes: `Automatic deduction from order ${orderId}`,
          created_by: 'system',
        });
      } catch (logError) {
        console.warn(`[Inventory Deduction] Failed to log movement (non-critical):`, logError);
        // Don't fail the deduction if logging fails
      }
      
      deductedItems.push({
        product_id: item.product_id,
        size,
        color,
        quantity: item.quantity,
        variant_id: variant.id,
      });
      
      console.log(`[Inventory Deduction] ✅ Successfully deducted ${item.quantity} units of ${variant.variant_name}`);
      
    } catch (error: any) {
      console.error(`[Inventory Deduction] Unexpected error for item:`, error);
      const { size, color } = extractVariantInfo(item);
      failedItems.push({
        product_id: item.product_id,
        size,
        color,
        quantity: item.quantity,
        reason: `Unexpected error: ${error.message}`,
      });
    }
  }
  
  const success = failedItems.length === 0;
  
  console.log(`[Inventory Deduction] Complete for order ${orderId}:`);
  console.log(`  ✅ Deducted: ${deductedItems.length} items`);
  console.log(`  ❌ Failed: ${failedItems.length} items`);
  
  return {
    success,
    deductedItems,
    failedItems,
    error: failedItems.length > 0 ? `Failed to deduct ${failedItems.length} items` : undefined,
  };
}

/**
 * Restore inventory for cancelled/refunded orders
 */
export async function restoreInventoryForOrder(
  orderId: string,
  items: OrderItem[]
): Promise<InventoryDeductionResult> {
  const deductedItems: InventoryDeductionResult['deductedItems'] = [];
  const failedItems: InventoryDeductionResult['failedItems'] = [];
  
  console.log(`[Inventory Restoration] Starting for order ${orderId} with ${items.length} items`);
  
  for (const item of items) {
    try {
      const { size, color } = extractVariantInfo(item);
      
      // Find the variant in database
      let query = supabase
        .from('product_variants')
        .select('id, stock_quantity, variant_name')
        .eq('product_id', item.product_id)
        .eq('size', size)
        .eq('is_active', true);
      
      if (color) {
        query = query.eq('color', color);
      } else {
        query = query.is('color', null);
      }
      
      const { data: variant, error: fetchError } = await query.limit(1).maybeSingle();
      
      if (fetchError || !variant) {
        failedItems.push({
          product_id: item.product_id,
          size,
          color,
          quantity: item.quantity,
          reason: 'Variant not found',
        });
        continue;
      }
      
      // Restore stock
      const { error: updateError } = await supabase
        .from('product_variants')
        .update({
          stock_quantity: variant.stock_quantity + item.quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', variant.id);
      
      if (updateError) {
        failedItems.push({
          product_id: item.product_id,
          size,
          color,
          quantity: item.quantity,
          reason: `Update failed: ${updateError.message}`,
        });
        continue;
      }
      
      // Log the restoration
      try {
        await supabase.from('inventory_movements').insert({
          variant_id: variant.id,
          movement_type: 'return',
          quantity: item.quantity,
          previous_stock: variant.stock_quantity,
          new_stock: variant.stock_quantity + item.quantity,
          order_id: orderId,
          notes: `Stock restored due to order cancellation/refund`,
          created_by: 'system',
        });
      } catch (logError) {
        console.warn(`[Inventory Restoration] Failed to log movement (non-critical):`, logError);
      }
      
      deductedItems.push({
        product_id: item.product_id,
        size,
        color,
        quantity: item.quantity,
        variant_id: variant.id,
      });
      
      console.log(`[Inventory Restoration] ✅ Successfully restored ${item.quantity} units of ${variant.variant_name}`);
      
    } catch (error: any) {
      const { size, color } = extractVariantInfo(item);
      failedItems.push({
        product_id: item.product_id,
        size,
        color,
        quantity: item.quantity,
        reason: `Unexpected error: ${error.message}`,
      });
    }
  }
  
  return {
    success: failedItems.length === 0,
    deductedItems,
    failedItems,
  };
}

