// Minimal Stripe Webhook handler for Netlify Functions
// - Verifies signature using STRIPE_WEBHOOK_SECRET
// - Safely handles base64-encoded bodies
// - Responds 200 for supported events so Stripe marks delivery successful

const Stripe = require('stripe');

// Node.js 18+ has native fetch support (Netlify Functions use Node 18+)

// Secret key (live or test depending on your Stripe dashboard context)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

// CORS headers
// PRODUCTION: Restrict to your domain only for better security
// For development, you can use '*' or your dev URL
const headers = {
  'Access-Control-Allow-Origin': process.env.DEPLOY_PRIME_URL || process.env.URL || 'https://curlea.beauty',
  'Access-Control-Allow-Headers': 'Content-Type,Stripe-Signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers }; 
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const signature = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  if (!signature) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing Stripe-Signature header' }) };
  }

  try {
    // Netlify may base64-encode the body depending on content-type
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET is not set');
    }

    // Verify the event came from Stripe
    const stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    // Minimal logging for observability in Netlify function logs
    try {
      console.log('[stripe-webhook] received', {
        id: stripeEvent.id,
        type: stripeEvent.type,
        api_version: stripeEvent.api_version,
      });
    } catch (_) {}

    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        // Fulfillment: build order and invoke email function
        const session = stripeEvent.data.object;
        const sessionId = session.id;

        // Retrieve line items
        const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100 });

        let subtotal = 0;
        let discountAmount = 0;
        let deliveryFee = 0.00; // No delivery fee for Stripe payments
        const cart = [];

        for (const item of lineItems.data) {
          const unitAmount = (item.price && typeof item.price.unit_amount === 'number') ? item.price.unit_amount : 0;
          const price = unitAmount / 100;
          const quantity = item.quantity || 1;
          const itemName = item.description || (item.price && item.price.nickname) || 'Product';

          // Check if this is a discount line item (negative amount)
          if (unitAmount < 0) {
            discountAmount += Math.abs(price * quantity);
            continue;
          }

          // Check if this is a delivery fee line item
          if (itemName.toLowerCase().includes('delivery fee')) {
            deliveryFee = price;
            continue;
          }

          subtotal += price * quantity;
          
          // Parse variant information from item metadata or description
          const metadata = (item.price && item.price.product && item.price.product.metadata) || {};
          const variantStr = item.description || itemName;
          
          // Extract size and color from variant string
          let size = metadata.size || null;
          let color = metadata.color || null;
          let productId = metadata.product_id || null;
          let sku = metadata.sku || null;
          
          if (!size && variantStr) {
            const sizeMatch = variantStr.match(/\b(Large|Jumbo|Midi|Small|Mini|Original|One Size)\b/i);
            if (sizeMatch) size = sizeMatch[1];
          }
          
          if (!color && variantStr) {
            const colorMatch = variantStr.match(/\b(Purple|Pink|Brown|Green|Candy|Latte|Mulberry|Olive|Blue|Red|Black|White)\b/i);
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
          
          cart.push({
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

        const total = (typeof session.amount_total === 'number') ? session.amount_total / 100 : Math.max(0, subtotal - discountAmount + deliveryFee);

        const delivery = {
          name: session.customer_details?.name || '',
          email: session.customer_details?.email || '',
          phone: session.customer_details?.phone || '',
          address: [
            session.customer_details?.address?.line1,
            session.customer_details?.address?.line2,
            session.customer_details?.address?.city,
            session.customer_details?.address?.state,
            session.customer_details?.address?.postal_code,
            session.customer_details?.address?.country,
          ].filter(Boolean).join(', '),
        };

        const orderPayload = {
          orderId: session.metadata?.orderId || session.metadata?.order_number || `STRIPE-${sessionId}`,
          paymentMethod: 'stripe',
          customerEmail: delivery.email,
          delivery,
          cart,
          deliveryFee,
          subtotal,
          discountAmount,
          total,
        };

        // Update Supabase orders directly
        try {
          const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
          const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          
          if (supabaseUrl && supabaseServiceKey) {
            // Use Supabase REST API to update orders
            const orderNumber = session.metadata?.order_number || session.metadata?.orderId || `STRIPE-${sessionId}`;
            
            // Get payment intent ID
            const paymentIntentId = typeof session.payment_intent === 'string'
              ? session.payment_intent
              : (session.payment_intent?.id || null);

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

            // Update analytics orders table (orders table)
            // Use order_id field to find the order
            const updateAnalyticsOrder = await fetch(`${supabaseUrl}/rest/v1/orders?order_id=eq.${encodeURIComponent(orderNumber)}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Prefer': 'return=representation',
              },
              body: JSON.stringify({
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
              }),
            });

            if (!updateAnalyticsOrder.ok) {
              const errorText = await updateAnalyticsOrder.text();
              console.warn('Failed to update analytics order:', errorText);
            } else {
              console.log('Analytics order updated successfully');
            }

            // Update public.orders table (Stripe orders table)
            // Use stripe_session_id to find the order
            const updatePublicOrder = await fetch(`${supabaseUrl}/rest/v1/orders?stripe_session_id=eq.${sessionId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Prefer': 'return=representation',
              },
              body: JSON.stringify({
                status: 'completed',
                customer_email: customerEmail,
                stripe_payment_intent_id: paymentIntentId,
                billing_address: billingAddress,
                shipping_address: shippingAddress,
                total_amount: total,
                is_guest: !session.customer,
                updated_at: new Date().toISOString(),
              }),
            });

            if (!updatePublicOrder.ok) {
              const errorText = await updatePublicOrder.text();
              console.warn('Failed to update public order:', errorText);
            } else {
              console.log('Public order updated successfully');
            }
          } else {
            console.warn('Supabase credentials not configured; skipping order update');
          }
        } catch (supabaseErr) {
          console.error('Failed to update Supabase orders:', supabaseErr);
        }

        // Send email
        try {
          const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL;
          if (siteUrl) {
            // Use native fetch (available in Node.js 18+)
            await fetch(`${siteUrl}/.netlify/functions/send-order-email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderPayload),
            });
          } else {
            console.warn('Missing Netlify URL env; skipping email call');
          }
        } catch (emailErr) {
          console.error('Failed to invoke send-order-email from webhook:', emailErr);
        }
        break;
      }
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
      case 'checkout.session.expired':
      default: {
        // No-op for now; we acknowledge receipt to stop retries
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('Stripe webhook error:', err);
    return { statusCode: 400, headers, body: JSON.stringify({ error: `Webhook Error: ${err.message}` }) };
  }
};


