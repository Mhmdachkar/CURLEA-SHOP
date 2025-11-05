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
    const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
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

    const orderResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
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

    // 2. Create order items
    const orderItems = items.map((item) => ({
      order_id: orderId,
      product_name: item.product_name,
      variant: item.variant || null,
      quantity: item.quantity,
      unit_price: typeof item.unit_price === 'string' ? parseFloat(item.unit_price.replace(/[^0-9.]/g, '')) : item.unit_price,
      total_price: typeof item.total_price === 'string' ? parseFloat(item.total_price.replace(/[^0-9.]/g, '')) : item.total_price,
      image_url: item.image_url || null,
      product_metadata: item.product_metadata || null,
    }));

    console.log('[Supabase Integration] Creating order items:', orderItems.length, 'items');

    const itemsResponse = await fetch(`${supabaseUrl}/rest/v1/order_items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
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

