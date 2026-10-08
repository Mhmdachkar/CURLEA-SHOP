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
  _stripeSessionId: string,
  _stripePaymentIntentId: string | null,
  customerEmail: string,
  _totalAmount: number,
  _currency: string = 'USD',
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
  _userId?: string
): Promise<{ success: boolean; orderId?: string; total?: number; subtotal?: number; deliveryFee?: number; error?: string }> {
  try {
    const response = await fetch('/.netlify/functions/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber,
        customerEmail,
        items,
        billingAddress,
        shippingAddress,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      return { success: false, error: data.error || 'Failed to create order' };
    }
    return { success: true, orderId: data.orderId || orderNumber, total: data.total, subtotal: data.subtotal, deliveryFee: data.deliveryFee };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' };
  }
}

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

