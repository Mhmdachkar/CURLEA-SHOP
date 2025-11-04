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

// CORS headers (not strictly necessary for Stripe → server calls, but harmless)
const headers = {
  'Access-Control-Allow-Origin': '*',
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
        const cart = [];

        for (const item of lineItems.data) {
          const unitAmount = (item.price && typeof item.price.unit_amount === 'number') ? item.price.unit_amount : 0;
          const price = unitAmount / 100;
          const quantity = item.quantity || 1;

          if (unitAmount < 0) {
            discountAmount += Math.abs(price * quantity);
            continue;
          }

          subtotal += price * quantity;
          cart.push({
            name: item.description || (item.price && item.price.nickname) || 'Product',
            price,
            quantity,
          });
        }

        const total = (typeof session.amount_total === 'number') ? session.amount_total / 100 : Math.max(0, subtotal - discountAmount);

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
          orderId: session.metadata?.orderId || `STRIPE-${sessionId}`,
          paymentMethod: 'stripe',
          customerEmail: delivery.email,
          delivery,
          cart,
          deliveryFee: 0,
          subtotal,
          discountAmount,
          total,
        };

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


