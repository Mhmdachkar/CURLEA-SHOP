/**
 * Supabase Edge Function: Track Analytics Events
 * Receives events from the frontend SDK and inserts into database
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackRequest {
  type: 'visit' | 'page_view' | 'event' | 'cart_event' | 'order' | 'order_update';
  data: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Supabase credentials from environment
    // Supabase automatically provides SUPABASE_URL and SUPABASE_ANON_KEY
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? 'https://vfhxwzcbjdlfmizakvqc.supabase.co';
    
    // Try Service Role first (bypasses RLS), fall back to Anon Key
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseKey) {
      console.error('No Supabase key found in environment');
      console.error('Available env vars:', Object.keys(Deno.env.toObject()));
      return new Response(
        JSON.stringify({ error: 'Server configuration error - no API key' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log('Using Supabase URL:', supabaseUrl);
    console.log('API key type:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'Service Role' : 'Anon');
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Parse request body
    const { type, data }: TrackRequest = await req.json();

    // Validate request
    if (!type || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Route to appropriate handler
    let result;
    switch (type) {
      case 'visit':
        result = await handleVisit(supabase, data);
        break;
      case 'page_view':
        result = await handlePageView(supabase, data);
        break;
      case 'event':
        result = await handleEvent(supabase, data);
        break;
      case 'cart_event':
        result = await handleCartEvent(supabase, data);
        break;
      case 'order':
        result = await handleOrder(supabase, data);
        break;
      case 'order_update':
        result = await handleOrderUpdate(supabase, data);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown event type: ${type}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        type,
        ...result 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/**
 * Handle visit tracking
 */
async function handleVisit(supabase: any, data: any) {
  const { data: visit, error } = await supabase
    .from('visits')
    .insert({
      session_id: data.session_id,
      ip_address: data.ip_address,
      device: data.device,
      browser: data.browser,
      os: data.os,
      country: data.country,
      city: data.city,
      region: data.region,
      referrer: data.referrer,
      landing_page: data.landing_page,
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
      utm_term: data.utm_term,
      utm_content: data.utm_content,
      is_mobile: data.is_mobile,
      is_tablet: data.is_tablet,
      is_desktop: data.is_desktop,
      screen_width: data.screen_width,
      screen_height: data.screen_height,
      language: data.language,
      timezone: data.timezone,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error inserting visit:', error);
    throw error;
  }

  return { visit_id: visit.id };
}

/**
 * Handle page view tracking
 */
async function handlePageView(supabase: any, data: any) {
  // Get visit_id from session_id if not provided
  let visitId = data.visit_id;
  
  if (!visitId && data.session_id) {
    const { data: visit } = await supabase
      .from('visits')
      .select('id')
      .eq('session_id', data.session_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (visit) {
      visitId = visit.id;
    }
  }

  const { data: pageView, error } = await supabase
    .from('page_views')
    .insert({
      session_id: data.session_id,
      visit_id: visitId,
      url: data.url,
      path: data.path,
      title: data.title,
      referrer: data.referrer,
      scroll_depth: data.scroll_depth || 0,
      time_on_page: data.time_on_page || 0,
      engaged: (data.scroll_depth || 0) > 50 || (data.time_on_page || 0) > 30,
      bounce: data.bounce !== undefined ? data.bounce : false,
      exit: data.exit !== undefined ? data.exit : false,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error inserting page view:', error);
    throw error;
  }

  return { page_view_id: pageView.id };
}

/**
 * Handle custom event tracking
 */
async function handleEvent(supabase: any, data: any) {
  // Get visit_id from session_id if not provided
  let visitId = data.visit_id;
  
  if (!visitId && data.session_id) {
    const { data: visit } = await supabase
      .from('visits')
      .select('id')
      .eq('session_id', data.session_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (visit) {
      visitId = visit.id;
    }
  }

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      session_id: data.session_id,
      visit_id: visitId,
      event_name: data.event_name,
      event_category: data.event_category,
      event_label: data.event_label,
      event_value: data.event_value,
      payload: data.payload || {},
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error inserting event:', error);
    throw error;
  }

  return { event_id: event.id };
}

/**
 * Handle cart event tracking
 */
async function handleCartEvent(supabase: any, data: any) {
  // Get visit_id from session_id if not provided
  let visitId = data.visit_id;
  
  if (!visitId && data.session_id) {
    const { data: visit } = await supabase
      .from('visits')
      .select('id')
      .eq('session_id', data.session_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (visit) {
      visitId = visit.id;
    }
  }

  // Try to find product by external_product_id
  let productId = null;
  if (data.external_product_id) {
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('product_id', data.external_product_id)
      .single();
    
    if (product) {
      productId = product.id;
    }
  }

  const { data: cartEvent, error } = await supabase
    .from('cart_events')
    .insert({
      session_id: data.session_id,
      visit_id: visitId,
      event_type: data.event_type,
      product_id: productId,
      external_product_id: data.external_product_id,
      product_title: data.product_title,
      variant_id: data.variant_id,
      variant_title: data.variant_title,
      quantity: data.quantity || 1,
      price: data.price,
      total_value: data.total_value,
      cart_total: data.cart_total,
      discount_code: data.discount_code,
      discount_amount: data.discount_amount,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error inserting cart event:', error);
    throw error;
  }

  return { cart_event_id: cartEvent.id };
}

/**
 * Handle order/purchase tracking
 */
async function handleOrder(supabase: any, data: any) {
  // Get visit_id from session_id if not provided
  let visitId = data.visit_id;
  
  if (!visitId && data.session_id) {
    const { data: visit } = await supabase
      .from('visits')
      .select('id')
      .eq('session_id', data.session_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (visit) {
      visitId = visit.id;
    }
  }

  // Calculate profit if total_cost is provided
  let profit = null;
  if (data.total_cost) {
    profit = data.total_value - data.total_cost;
  }

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      order_id: data.order_id,
      session_id: data.session_id,
      visit_id: visitId,
      customer_email: data.customer_email,
      customer_id: data.customer_id,
      subtotal: data.subtotal,
      discount_total: data.discount_total || 0,
      shipping_total: data.shipping_total || 0,
      tax_total: data.tax_total || 0,
      total_value: data.total_value,
      total_cost: data.total_cost,
      profit: profit,
      currency: data.currency || 'USD',
      payment_method: data.payment_method,
      shipping_method: data.shipping_method,
      source: data.source,
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
      discount_codes: data.discount_codes,
      items: data.items,
      status: data.status || 'completed',
      fulfillment_status: data.fulfillment_status || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error inserting order:', error);
    throw error;
  }

  return { order_id: order.id };
}

/**
 * Handle order update (update existing order with customer info after payment)
 */
async function handleOrderUpdate(supabase: any, data: any) {
  // Find order by order_id (order_number)
  const { data: existingOrder, error: findError } = await supabase
    .from('orders')
    .select('id')
    .eq('order_id', data.order_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (findError || !existingOrder) {
    console.error('Order not found for update:', data.order_id);
    // If order not found, this is okay - it might be a new order being created
    return { success: false, message: 'Order not found' };
  }

  // Build update object with only provided fields
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (data.customer_email !== undefined) updateData.customer_email = data.customer_email;
  if (data.customer_id !== undefined) updateData.customer_id = data.customer_id;
  if (data.shipping_method !== undefined) updateData.shipping_method = data.shipping_method;
  if (data.shipping_total !== undefined) updateData.shipping_total = data.shipping_total;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.fulfillment_status !== undefined) updateData.fulfillment_status = data.fulfillment_status;
  if (data.discount_total !== undefined) updateData.discount_total = data.discount_total;
  if (data.total_value !== undefined) updateData.total_value = data.total_value;
  if (data.payment_method !== undefined) updateData.payment_method = data.payment_method;

  // Update the order
  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', existingOrder.id)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating order:', updateError);
    throw updateError;
  }

  return { success: true, order_id: updatedOrder.id };
}

console.log('Track Edge Function ready!');

