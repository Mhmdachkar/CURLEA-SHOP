/**
 * Supabase Edge Function: Stripe Webhook Handler
 * 
 * This function handles Stripe webhook events and updates order status
 * in both the public.orders table and analytics orders table.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // Get Stripe signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing Stripe-Signature header' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get webhook secret
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not found');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY not found');
      return new Response(
        JSON.stringify({ error: 'Stripe not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get raw body
    const body = await req.text();

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not found');
      return new Response(
        JSON.stringify({ error: 'Supabase not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('Processing checkout.session.completed:', session.id);

      // Get order metadata
      const orderId = session.metadata?.order_id || session.metadata?.order_number;
      const orderNumber = session.metadata?.order_number || orderId;
      
      if (!orderId && !orderNumber) {
        console.warn('No order_id or order_number in session metadata');
        return new Response(
          JSON.stringify({ received: true, warning: 'No order metadata found' }),
          { status: 200, headers: corsHeaders }
        );
      }

      // Retrieve full session details with line items
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['payment_intent', 'line_items'],
      });

      // Get payment intent ID
      const paymentIntentId = typeof fullSession.payment_intent === 'string'
        ? fullSession.payment_intent
        : (fullSession.payment_intent as Stripe.PaymentIntent)?.id || null;

      // Calculate totals from line items
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
      
      let subtotal = 0;
      let discountAmount = 0;
      let deliveryFee = 0.00; // No delivery fee for Stripe payments
      const cartItems: any[] = [];

      for (const item of lineItems.data) {
        const unitAmount = (item.price && typeof item.price.unit_amount === 'number') 
          ? item.price.unit_amount 
          : 0;
        const price = unitAmount / 100;
        const quantity = item.quantity || 1;
        const itemName = item.description || (item.price && item.price.nickname) || 'Product';

        // Check if this is a discount (negative amount)
        if (unitAmount < 0) {
          discountAmount += Math.abs(price * quantity);
          continue;
        }

        // Check if this is a delivery fee
        if (itemName.toLowerCase().includes('delivery fee')) {
          deliveryFee = price;
          continue;
        }

        subtotal += price * quantity;
        
        // Parse variant information from item metadata or description
        const metadata = item.price?.product?.metadata || {};
        const variantStr = item.description || itemName;
        
        // Extract size and color from variant string
        let size = metadata.size || null;
        let color = metadata.color || null;
        let productId = metadata.product_id || null;
        let sku = metadata.sku || null;
        
        if (!size && variantStr) {
          const sizePatterns = /\b(Large|Jumbo|Midi|Small|Mini|Original|One Size)\b/i;
          const sizeMatch = variantStr.match(sizePatterns);
          if (sizeMatch) size = sizeMatch[1];
        }
        
        if (!color && variantStr) {
          const colorPatterns = /\b(Purple|Pink|Brown|Green|Candy|Latte|Mulberry|Olive|Blue|Red|Black|White)\b/i;
          const colorMatch = variantStr.match(colorPatterns);
          if (colorMatch) color = colorMatch[1];
        }
        
        // Try to match product_id from product name
        if (!productId && itemName) {
          const name = itemName.toLowerCase();
          if (name.includes('dreamcurl') && name.includes('jumbo')) productId = 'dreamcurl-jumbo';
          else if (name.includes('dreamcurl') && name.includes('midi')) productId = 'dreamcurl-midi';
          else if (name.includes('dreamcurl') && (name.includes('original') || name.includes('large'))) productId = 'dreamcurl-original';
          else if (name.includes('zero heat') || name.includes('mini')) productId = 'zero-heat-mini';
          else if (name.includes('bonnet') || name.includes('bun bon')) productId = 'peau-de-soie-bonnet';
          else if (name.includes('scrunchie')) productId = 'scrunchies-7pc';
          else if (name.includes('korean') && name.includes('claw')) productId = 'curly-clip-2';
          else if (name.includes('flat') && name.includes('claw')) productId = 'curly-clip-1';
          else if (name.includes('bow tie')) productId = 'bow-tie-scrunchies';
        }
        
        cartItems.push({
          name: itemName,
          price,
          quantity,
          product_id: productId,
          size,
          color,
          sku,
          variant: variantStr,
          metadata,
        });
      }

      const total = session.amount_total ? session.amount_total / 100 : subtotal - discountAmount + deliveryFee;

      // Prepare billing and shipping addresses
      const billingAddress = session.customer_details?.address ? {
        line1: session.customer_details.address.line1 || '',
        line2: session.customer_details.address.line2 || null,
        city: session.customer_details.address.city || '',
        state: session.customer_details.address.state || '',
        postal_code: session.customer_details.address.postal_code || '',
        country: session.customer_details.address.country || '',
      } : null;

      const shippingAddress = session.shipping_details?.address ? {
        line1: session.shipping_details.address.line1 || '',
        line2: session.shipping_details.address.line2 || null,
        city: session.shipping_details.address.city || '',
        state: session.shipping_details.address.state || '',
        postal_code: session.shipping_details.address.postal_code || '',
        country: session.shipping_details.address.country || '',
      } : billingAddress;

      const customerEmail = session.customer_details?.email || session.customer_email || null;
      const customerName = session.customer_details?.name || null;
      const customerPhone = session.customer_details?.phone || null;

      // Update analytics orders table (orders table)
      // Find order by order_id (order_number)
      const { data: analyticsOrder, error: findError } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('order_id', orderNumber || orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!findError && analyticsOrder) {
        const updateData: any = {
          status: 'completed',
          customer_email: customerEmail,
          customer_id: session.customer || null,
          shipping_method: 'standard',
          shipping_total: deliveryFee,
          discount_total: discountAmount,
          total_value: total,
          payment_method: 'stripe',
          fulfillment_status: 'unfulfilled',
          updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update(updateData)
          .eq('id', analyticsOrder.id);

        if (updateError) {
          console.error('Error updating analytics order:', updateError);
        } else {
          console.log('Analytics order updated:', analyticsOrder.id);
        }
      } else {
        console.warn('Analytics order not found for update:', orderNumber || orderId);
      }

      // Update or create order in public.orders table
      // Try to find by stripe_session_id first
      const { data: publicOrder, error: findPublicError } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('stripe_session_id', session.id)
        .single();

      if (!findPublicError && publicOrder) {
        // Update existing order
        const updateData: any = {
          status: 'completed',
          customer_email: customerEmail,
          stripe_payment_intent_id: paymentIntentId,
          billing_address: billingAddress,
          shipping_address: shippingAddress,
          total_amount: total,
          updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update(updateData)
          .eq('id', publicOrder.id);

        if (updateError) {
          console.error('Error updating public order:', updateError);
        } else {
          console.log('Public order updated:', publicOrder.id);
        }
      } else {
        // Create new order in public.orders if not found
        // This handles cases where order wasn't created during checkout
        const newOrderData: any = {
          order_number: orderNumber || `STRIPE-${session.id}`,
          total_amount: total,
          currency: session.currency?.toUpperCase() || 'USD',
          status: 'completed',
          customer_email: customerEmail,
          is_guest: !session.customer,
          stripe_session_id: session.id,
          stripe_payment_intent_id: paymentIntentId,
          billing_address: billingAddress,
          shipping_address: shippingAddress,
        };

        const { data: newOrder, error: createError } = await supabaseAdmin
          .from('orders')
          .insert(newOrderData)
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating public order:', createError);
        } else {
          console.log('Public order created:', newOrder.id);

          // Create order items if we have cart items
          if (cartItems.length > 0 && newOrder.id) {
            const orderItems = cartItems.map((item) => {
              // Build variant_details JSONB
              const variantDetails = {
                product_id: item.product_id,
                size: item.size,
                color: item.color,
                sku: item.sku,
                variant_name: item.variant,
                original_metadata: item.metadata
              };
              
              return {
                order_id: newOrder.id,
                product_name: item.name,
                variant: item.variant || null,
                product_id: item.product_id || null,
                size: item.size || null,
                color: item.color || null,
                sku: item.sku || null,
                variant_details: variantDetails,
                variant_id: null, // Will be matched by trigger function
                quantity: item.quantity,
                unit_price: item.price,
                total_price: item.price * item.quantity,
                image_url: null,
                product_metadata: item.metadata || null,
              };
            });

            const { error: itemsError } = await supabaseAdmin
              .from('order_items')
              .insert(orderItems);

            if (itemsError) {
              console.error('Error creating order items:', itemsError);
            } else {
              console.log('Order items created with full variant details:', orderItems.length);
            }
          }
        }
      }

      console.log('Webhook processed successfully:', session.id);
    }

    // Return success response
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});





