/**
 * Supabase Orders & Order Items Utilities
 * Manage Stripe orders and order items
 */

import { supabase, StripeOrder, OrderItem } from '@/lib/supabase';

/**
 * Get all Stripe orders (from public.orders table)
 */
export async function getStripeOrders(limit: number = 50): Promise<{
  data: StripeOrder[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, user_id, total_amount, currency, status, customer_email, is_guest, stripe_session_id, stripe_payment_intent_id, billing_address, shipping_address, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get order by order number (from public.orders table)
 */
export async function getOrderByOrderNumber(orderNumber: string): Promise<{
  data: StripeOrder | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, user_id, total_amount, currency, status, customer_email, is_guest, stripe_session_id, stripe_payment_intent_id, billing_address, shipping_address, created_at, updated_at')
      .eq('order_number', orderNumber)
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
 * Get order items for an order (from public.order_items table with ALL columns)
 */
export async function getOrderItems(orderId: string): Promise<{
  data: OrderItem[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('id, order_id, product_name, variant, product_id, size, color, sku, variant_details, variant_id, quantity, unit_price, total_price, image_url, product_metadata, created_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Get order with items (joined query)
 */
export async function getOrderWithItems(orderNumber: string): Promise<{
  order: StripeOrder | null;
  items: OrderItem[];
  error: string | null;
}> {
  try {
    // Get order
    const orderResult = await getOrderByOrderNumber(orderNumber);
    if (orderResult.error || !orderResult.data) {
      return { order: null, items: [], error: orderResult.error };
    }

    // Get items
    const itemsResult = await getOrderItems(orderResult.data.id);
    if (itemsResult.error) {
      return { order: orderResult.data, items: [], error: itemsResult.error };
    }

    return {
      order: orderResult.data,
      items: itemsResult.data || [],
      error: null,
    };
  } catch (error: any) {
    return { order: null, items: [], error: error.message };
  }
}

/**
 * Get orders by status (from public.orders table)
 */
export async function getOrdersByStatus(status: string): Promise<{
  data: StripeOrder[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, user_id, total_amount, currency, status, customer_email, is_guest, stripe_session_id, stripe_payment_intent_id, billing_address, shipping_address, created_at, updated_at')
      .eq('status', status)
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
 * Get orders by customer email (from public.orders table)
 */
export async function getOrdersByEmail(email: string): Promise<{
  data: StripeOrder[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, user_id, total_amount, currency, status, customer_email, is_guest, stripe_session_id, stripe_payment_intent_id, billing_address, shipping_address, created_at, updated_at')
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

