/**
 * Supabase Edge Function: Create Stripe Checkout Session
 * 
 * This function creates a Stripe Checkout session for the user's cart
 * and saves the order to the database with pending status.
 * Compatible with existing Curlea analytics schema.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Step 1: Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 2: Parse request data
    const requestBody = await req.json();
    
    const {
      cartItems,
      currency = 'USD',
      successUrl,
      cancelUrl,
      sessionId, // Analytics session ID from frontend
    } = requestBody;

    // Validate cart items
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart is empty' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Step 3: Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'Server configuration error - Stripe not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Step 4: Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not found');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Step 5: Parse prices to numbers
    const parsePriceToNumber = (rawPrice: string | number): number => {
      if (typeof rawPrice === 'number') return rawPrice;
      if (!rawPrice) return 0;
      
      const trimmed = String(rawPrice).trim();
      const hasCommaDecimal = /\d,\d{1,2}$/.test(trimmed);
      
      let normalized = trimmed.replace(/[^0-9,.-]/g, '');
      
      if (hasCommaDecimal) {
        normalized = normalized.replace(/\./g, '').replace(',', '.');
      } else {
        const parts = normalized.split('.');
        if (parts.length > 2) normalized = normalized.replace(/,/g, '');
      }
      
      const numeric = parseFloat(normalized);
      return Number.isFinite(numeric) ? numeric : 0;
    };

    // Step 6: Calculate subtotal and apply 5% discount for Stripe
    const subtotal = cartItems.reduce((total: number, item: any) => {
      const itemPrice = parsePriceToNumber(item.price);
      return total + (itemPrice * item.quantity);
    }, 0);
    
    // Apply 5% discount for Stripe payments
    const discountAmount = subtotal * 0.05;
    const totalAmount = subtotal - discountAmount;

    console.log('Subtotal:', subtotal);
    console.log('Stripe discount (5%):', discountAmount);
    console.log('Total amount after discount:', totalAmount);

    // Step 7: Create absolute image URLs
    const getBaseOrigin = (): string | null => {
      const headerOrigin = req.headers.get('origin');
      if (headerOrigin && /^https?:\/\//.test(headerOrigin)) {
        return headerOrigin;
      }
      
      const referer = req.headers.get('referer');
      if (referer) {
        try {
          return new URL(referer).origin;
        } catch (_) {
          // Invalid URL
        }
      }
      
      if (successUrl) {
        try {
          return new URL(successUrl).origin;
        } catch (_) {
          // Invalid URL
        }
      }
      
      return null;
    };

    const toAbsoluteUrl = (maybeUrl: string): string | null => {
      if (!maybeUrl) return null;
      const trimmed = String(maybeUrl).trim();
      
      if (/^https?:\/\//.test(trimmed)) return encodeURI(trimmed);
      
      const origin = getBaseOrigin();
      if (!origin) return null;
      
      const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
      return encodeURI(`${origin}${normalizedPath}`);
    };

    // Step 8: Create Stripe line items
    const lineItems = cartItems.map((item: any) => {
      let images: string[] = [];
      try {
        const absoluteImage = toAbsoluteUrl(item.image_url);
        if (absoluteImage) {
          new URL(absoluteImage); // Validate URL
          images = [absoluteImage];
          console.log(`Product image for ${item.product_name}:`, absoluteImage);
        }
      } catch (urlError) {
        console.warn('Invalid image URL:', item.image_url);
      }
      
      return {
        price_data: {
          currency: String(currency || 'USD').toLowerCase(),
          product_data: {
            name: `${item.product_name}${item.variant ? ` - ${item.variant}` : ''}`,
            images,
          },
          unit_amount: Math.round(parsePriceToNumber(item.price) * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });
    
    console.log('Created line items with images:', lineItems.length, 'items');

    // Step 8.5: Add discount line item (5% off)
    if (discountAmount > 0) {
      lineItems.push({
        price_data: {
          currency: String(currency || 'USD').toLowerCase(),
          product_data: {
            name: 'Stripe Payment Discount (5%)',
          },
          unit_amount: -Math.round(discountAmount * 100), // Negative amount for discount
        },
        quantity: 1,
      });
      console.log('Added 5% discount line item:', discountAmount);
    }

    // Step 9: Generate unique order ID
    const generateUniqueOrderId = () => {
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
      const time = Date.now().toString().slice(-6); // Last 6 digits
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 3 digits
      
      return `AU-${date}-${time}${random}`;
    };

    // Step 10: Get visit_id from session_id if provided
    let visitId = null;
    if (sessionId) {
      const { data: visit } = await supabaseAdmin
        .from('visits')
        .select('id')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (visit) {
        visitId = visit.id;
      }
    }

    // Step 11: Create order in database (matching your schema)
    const orderId = generateUniqueOrderId();
    
    // Format items as JSONB
    const itemsData = cartItems.map((item: any) => {
      const unitPrice = parsePriceToNumber(item.price);
      
      return {
        id: item.id,
        name: item.product_name,
        variant: item.variant || 'Default',
        quantity: item.quantity,
        price: unitPrice,
        total: unitPrice * item.quantity,
        image_url: item.image_url,
      };
    });

    const orderData: any = {
      order_id: orderId,
      session_id: sessionId || 'anonymous',
      visit_id: visitId,
      customer_email: null, // Will be filled by Stripe
      subtotal: subtotal,
      discount_total: discountAmount,
      shipping_total: 0,
      tax_total: 0,
      total_value: totalAmount,
      currency: currency,
      payment_method: 'stripe',
      items: itemsData,
      status: 'pending',
    };

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Failed to create order:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Step 12: Create Stripe Checkout Session
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      
      success_url: successUrl || `${getBaseOrigin()}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${getBaseOrigin()}/`,
      
      metadata: {
        order_id: order.id,
        order_number: orderId,
        currency: currency,
        subtotal: subtotal.toString(),
        discount_amount: discountAmount.toString(),
        total_amount: totalAmount.toString(),
        items_count: cartItems.length.toString(),
      },
      
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: [
          'US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'AU', 'NZ',
          'NL', 'BE', 'CH', 'AT', 'DK', 'FI', 'IE', 'LU', 'NO',
          'PL', 'PT', 'SE', 'AE', 'SA', 'QA', 'KW', 'BH', 'OM',
          'JO', 'LB', 'EG', 'MA', 'TN', 'DZ', 'IQ', 'LY', 'YE',
          'SD', 'PS'
        ],
      },
      
      phone_number_collection: {
        enabled: true,
      },
      
      customer_creation: 'always',
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Stripe session created successfully:', session.id);

    // Step 14: Return success response
    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Checkout error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
