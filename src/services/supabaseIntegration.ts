/**
 * Comprehensive Supabase Integration Service
 * Ensures ALL tables are actively used and connected
 */

import { supabase } from '@/lib/supabase';
import { products } from '@/data/products';
import { syncProductToSupabase } from '@/utils/supabase/products';

/**
 * Initialize comprehensive tracking on app load
 */
export async function initializeSupabaseIntegration() {
  console.log('[Supabase Integration] Initializing comprehensive tracking...');

  // 1. Sync products to Supabase (if needed)
  await syncProductsIfNeeded();

  // 2. Track app initialization
  trackAppInitialization();

  // 3. Set up periodic product sync
  setupPeriodicProductSync();
}

/**
 * Sync products if they don't exist in Supabase
 */
async function syncProductsIfNeeded() {
  try {
    // Check if products table has any active products
    const { data: existingProducts, error } = await supabase
      .from('products')
      .select('product_id')
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.warn('[Supabase Integration] Error checking products:', error);
      return;
    }

    // If no products, sync them
    if (!existingProducts || existingProducts.length === 0) {
      console.log('[Supabase Integration] No products found, syncing...');
      await syncAllProducts();
    } else {
      console.log('[Supabase Integration] Products already synced');
    }
  } catch (error) {
    console.error('[Supabase Integration] Error in product sync check:', error);
  }
}

/**
 * Sync all products from codebase to Supabase
 */
async function syncAllProducts() {
  let success = 0;
  let failed = 0;

  for (const product of products) {
    try {
      const result = await syncProductToSupabase(product);
      if (result.success) {
        success++;
      } else {
        failed++;
        console.warn(`Failed to sync ${product.name}:`, result.error);
      }
    } catch (error: any) {
      failed++;
      console.error(`Error syncing ${product.name}:`, error);
    }
  }

  console.log(`[Supabase Integration] Product sync complete: ${success} success, ${failed} failed`);
  return { success, failed };
}

/**
 * Track app initialization event
 */
function trackAppInitialization() {
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track('AppInitialized', {
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
    });
  }
}

/**
 * Setup periodic product sync (daily)
 */
function setupPeriodicProductSync() {
  // Sync products once per day
  const oneDay = 24 * 60 * 60 * 1000;
  
  setInterval(() => {
    console.log('[Supabase Integration] Running daily product sync...');
    syncAllProducts().catch(console.error);
  }, oneDay);
}

/**
 * Track cart view event (when cart drawer opens)
 */
export function trackCartView(cartItems: any[], cartTotal: number) {
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.trackCart('view', {
      cart_total: cartTotal,
      items_count: cartItems.length,
    });

    // Track each product in cart as a view event
    cartItems.forEach((item) => {
      (window as any).analytics.track('CartProductViewed', {
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price.replace(/[^0-9.]/g, '')),
      });
    });
  }
}

/**
 * Create Stripe order and order items in Supabase
 * Uses REST API to ensure we're inserting into the correct public.orders table
 */
export async function createStripeOrderAndItems(
  orderNumber: string,
  stripeSessionId: string,
  stripePaymentIntentId: string | null,
  customerEmail: string,
  totalAmount: number,
  currency: string,
  items: Array<{
    product_name: string;
    variant?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    image_url?: string;
    product_metadata?: any;
  }>,
  billingAddress?: any,
  shippingAddress?: any,
  userId?: string
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vfhxwzcbjdlfmizakvqc.supabase.co';
    // SECURITY: Use anon key for client-side operations
    // Service role key operations should be done via Edge Functions/Netlify Functions
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      const errorMsg = 'Supabase credentials not configured';
      console.error('[Supabase Integration]', errorMsg);
      return { success: false, error: errorMsg };
    }

    // Prepare billing and shipping addresses
    const formattedBillingAddress = billingAddress ? {
      line1: billingAddress.address || billingAddress.line1 || '',
      line2: billingAddress.address2 || billingAddress.line2 || null,
      city: billingAddress.city || '',
      state: billingAddress.state || '',
      postal_code: billingAddress.postalCode || billingAddress.postal_code || '',
      country: billingAddress.country || '',
      phone: billingAddress.phone || null,
      name: billingAddress.name || null,
    } : null;

    const formattedShippingAddress = shippingAddress ? {
      line1: shippingAddress.address || shippingAddress.line1 || '',
      line2: shippingAddress.address2 || shippingAddress.line2 || null,
      city: shippingAddress.city || '',
      state: shippingAddress.state || '',
      postal_code: shippingAddress.postalCode || shippingAddress.postal_code || '',
      country: shippingAddress.country || '',
      phone: shippingAddress.phone || null,
      name: shippingAddress.name || null,
    } : formattedBillingAddress;

    // 1. Create order in public.orders table using REST API
    const orderPayload = {
      order_number: orderNumber,
      user_id: userId || null,
      total_amount: totalAmount,
      currency: currency || 'USD',
      status: 'completed',
      customer_email: customerEmail,
      is_guest: !userId,
      stripe_session_id: stripeSessionId === 'COD' ? null : stripeSessionId, // Don't store 'COD' placeholder
      stripe_payment_intent_id: stripePaymentIntentId,
      billing_address: formattedBillingAddress,
      shipping_address: formattedShippingAddress,
    };

    console.log('[Supabase Integration] Creating order in public.orders:', orderPayload);

    // SECURITY: Use anon key with RLS policies for client-side operations
    // For order creation, we rely on RLS policies to allow inserts
    // NOTE: Using 'orders' table for all order types (COD and Stripe)
    const orderResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(orderPayload),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('[Supabase Integration] Error creating order:', errorText);
      console.error('[Supabase Integration] Response status:', orderResponse.status);
      return { success: false, error: `Failed to create order: ${errorText}` };
    }

    const orderData = await orderResponse.json();
    const order = Array.isArray(orderData) ? orderData[0] : orderData;
    const orderId = order.id;

    console.log('[Supabase Integration] Order created successfully:', orderId);

    // 2. Create order items with full variant details for inventory tracking
    const orderItems = items.map((item) => {
      // Extract variant details from product_metadata or parse from variant string
      const metadata = item.product_metadata || {};
      const variantStr = item.variant || '';
      
      // Extract size and color from metadata first (most reliable)
      let size = metadata.size || metadata.selectedSize || null;
      let color = metadata.color || metadata.selectedColor || null;
      let productId = metadata.product_id || null;
      let sku = metadata.sku || null;
      
      // Map UI sizes to database sizes
      if (size) {
        const sizeMap: Record<string, string> = {
          'Original': 'Large',
          'Large': 'Large',
          'Mini': 'Mini',
          'Midi': 'Midi',
          'Jumbo': 'Jumbo',
          'Standard': 'Standard',
          '9-piece-complete': 'Standard',
          '4-piece-type1': 'Standard',
          '4-piece-type2': 'Standard',
          '4-piece-type3': 'Standard'
        };
        size = sizeMap[size] || size;
      }
      
      // Normalize color names to database format
      if (color) {
        const colorMap: Record<string, string> = {
          'MULBERRY': 'Mulberry',
          'Mulberry': 'Mulberry',
          'PURPLE': 'Mulberry',
          'Purple': 'Mulberry',
          'CANDY': 'CANDY',
          'Candy': 'CANDY',
          'LATTE': 'Latte',
          'Latte': 'Latte',
          'OLIVE': 'Olive',
          'Olive': 'Olive',
          'Royal Purple': 'Royal Purple',
          'Rose Gold': 'Rose Gold',
          'Earl Grey': 'Earl Grey',
          'Olive Lux': 'Olive Lux'
        };
        color = colorMap[color] || color;
      }
      
      // Extract from variant string if not in metadata
      if (!size && variantStr) {
        const sizePatterns = /\b(Large|Jumbo|Midi|Small|Mini|Original|One Size|Standard)\b/i;
        const sizeMatch = variantStr.match(sizePatterns);
        if (sizeMatch) {
          const matchedSize = sizeMatch[1];
          const sizeMap: Record<string, string> = {
            'Original': 'Large',
            'Large': 'Large',
            'Mini': 'Mini',
            'Midi': 'Midi',
            'Jumbo': 'Jumbo',
            'Standard': 'Standard'
          };
          size = sizeMap[matchedSize] || matchedSize;
        }
      }
      
      if (!color && variantStr) {
        const colorPatterns = /\b(Purple|Pink|Brown|Green|Candy|Latte|Mulberry|Olive|Blue|Red|Black|White|Gold|Print)\b/i;
        const colorMatch = variantStr.match(colorPatterns);
        if (colorMatch) {
          const matchedColor = colorMatch[1];
        const colorMap: Record<string, string> = {
          'Purple': 'Mulberry',
          'Pink': 'CANDY',
          'Brown': 'Latte',    // Legacy CSV color - converts to Latte
          'Green': 'Olive'
        };
        color = colorMap[matchedColor] || matchedColor;
        }
      }
      
      // For products without size/color, default to Standard/null
      if (!size) {
        // Check if product is an accessory (no size/color variants)
        const accessoryProducts = [
          'curly-clip-1', 'curly-scarf-1', 'satin-scrunchies-french-5pc',
          'curly-claw-1', 'korean-clips-10set', 'bow-tie-7set'
        ];
        if (productId && accessoryProducts.includes(productId)) {
          size = 'Standard';
          color = null;
        }
      }
      
      // Try to match product_id from product_name or use from metadata
      if (!productId && item.product_name) {
        const name = item.product_name.toLowerCase();
        // Full Sets
        if (name.includes('dreamcurl') && name.includes('jumbo')) productId = 'dreamcurl-jumbo';
        else if (name.includes('dreamcurl') && name.includes('midi')) productId = 'dreamcurl-midi';
        else if (name.includes('dreamcurl') && (name.includes('original') || name.includes('large'))) productId = 'dreamcurl-original';
        else if (name.includes('zero heat') || (name.includes('mini') && name.includes('set'))) productId = 'zero-heat-mini';
        else if (name.includes('dreamcurl') && name.includes('short')) productId = 'dreamcurl-short-set';
        // Heatless Tools
        else if (name.includes('bonnet') || name.includes('bun bon') || name.includes('heatless curling')) productId = 'heatless-5';
        // Curly Hair Collection - Accessories
        else if (name.includes('satin scrunchies') || name.includes('french 5')) productId = 'satin-scrunchies-french-5pc';
        else if (name.includes('korean') && (name.includes('clip') || name.includes('10'))) productId = 'korean-clips-10set';
        else if ((name.includes('curved resin') || name.includes('duckbill') || name.includes('flat clip')) && name.includes('9')) productId = 'curly-clip-1';
        else if (name.includes('geometric flower') || name.includes('claw clip') || name.includes('10 piece')) productId = 'curly-claw-1';
        else if (name.includes('luxe alloy') || name.includes('songmay')) productId = 'songmay-hair-clips';
        else if (name.includes('bow tie') || name.includes('7 set')) productId = 'bow-tie-7set';
        else if (name.includes('satin scarf') || name.includes('scrunchies set')) productId = 'curly-scarf-1';
      }
      
      // Use product_id from metadata if available (most reliable)
      if (!productId && metadata.product_id) {
        productId = metadata.product_id;
      }
      
      // Build variant_details JSONB
      const variantDetails = {
        product_id: productId,
        size,
        color,
        sku,
        variant_name: variantStr,
        original_metadata: metadata
      };
      
      return {
        order_id: orderId,
        product_name: item.product_name,
        variant: variantStr || null,
        product_id: productId,
        size: size,
        color: color,
        sku: sku,
        variant_details: variantDetails,
        variant_id: null, // Will be matched by trigger function
        quantity: item.quantity,
        unit_price: typeof item.unit_price === 'string' ? parseFloat(item.unit_price.replace(/[^0-9.]/g, '')) : item.unit_price,
        total_price: typeof item.total_price === 'string' ? parseFloat(item.total_price.replace(/[^0-9.]/g, '')) : item.total_price,
        image_url: item.image_url || null,
        product_metadata: item.product_metadata || null,
      };
    });

    console.log('[Supabase Integration] Creating order items:', orderItems.length, 'items');

    // SECURITY: Use anon key with RLS policies
    const itemsResponse = await fetch(`${supabaseUrl}/rest/v1/order_items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(orderItems),
    });

    if (!itemsResponse.ok) {
      const errorText = await itemsResponse.text();
      console.error('[Supabase Integration] Error creating order items:', errorText);
      console.error('[Supabase Integration] Items response status:', itemsResponse.status);
      // Order was created, but items failed - still return success but log error
      console.warn('[Supabase Integration] Order created but items failed:', errorText);
    } else {
      console.log('[Supabase Integration] Order items created successfully');
    }

    console.log('[Supabase Integration] Order and items creation complete:', orderId);
    return { success: true, orderId: orderId };
  } catch (error: any) {
    console.error('[Supabase Integration] Error in createStripeOrderAndItems:', error);
    console.error('[Supabase Integration] Error stack:', error.stack);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Update order status in both orders tables
 */
export async function updateOrderStatus(
  orderId: string,
  status: string,
  isStripeOrder: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    const tableName = isStripeOrder ? 'orders' : 'orders'; // Same table name but different context
    // For now, we'll update the analytics orders table
    
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Track conversion funnel event
 */
export function trackConversionFunnelStep(step: string, data?: any) {
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track('ConversionFunnel', {
      step,
      ...data,
    });
  }
}

/**
 * Track product interaction
 */
export function trackProductInteraction(
  productId: string,
  interactionType: 'view' | 'click' | 'hover' | 'share' | 'wishlist',
  data?: any
) {
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track('ProductInteraction', {
      product_id: productId,
      interaction_type: interactionType,
      ...data,
    });
  }
}

/**
 * Get current campaign info from URL and track it
 */
export function trackCampaignFromUrl() {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const utmCampaign = urlParams.get('utm_campaign');

  if (utmCampaign && (window as any).analytics) {
    (window as any).analytics.track('CampaignVisit', {
      utm_campaign: utmCampaign,
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_term: urlParams.get('utm_term'),
      utm_content: urlParams.get('utm_content'),
    });
  }
}

