/**
 * Netlify Function: Get Stripe Order Details
 * Retrieves order details from Stripe session and Supabase for email sending
 */

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { sessionId } = JSON.parse(event.body);

    if (!sessionId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'Session ID is required' }),
      };
    }

    // Get Stripe secret key from environment
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = require('stripe')(stripeSecretKey);

    // Retrieve Stripe session with expanded line items
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'line_items.data.price.product'],
    });

    // Extract order details
    const orderData = {
      orderId: session.metadata?.order_number || session.id,
      paymentMethod: 'stripe',
      customerEmail: session.customer_details?.email || session.customer_email,
      total: (session.amount_total / 100).toFixed(2), // Convert cents to dollars
      currency: session.currency?.toUpperCase() || 'USD',
      delivery: {
        name: session.customer_details?.name || session.shipping_details?.name || 'N/A',
        email: session.customer_details?.email || 'N/A',
        phone: session.customer_details?.phone || session.customer_details?.phone_number || 'N/A',
        address: session.shipping_details?.address
          ? `${session.shipping_details.address.line1 || ''} ${session.shipping_details.address.line2 || ''}`.trim()
          : 'N/A',
        city: session.shipping_details?.address?.city || 'N/A',
        zipCode: session.shipping_details?.address?.postal_code || 'N/A',
        country: session.shipping_details?.address?.country || 'N/A',
      },
      cart: [],
      subtotal: 0,
      deliveryFee: 0,
    };

    // Format line items
    if (session.line_items?.data) {
      let subtotal = 0;
      session.line_items.data.forEach((item) => {
        const price = (item.price.unit_amount / 100).toFixed(2);
        const quantity = item.quantity || 1;
        subtotal += parseFloat(price) * quantity;

        // Extract color/size from description or metadata if available
        const description = item.description || '';
        const colorMatch = description.match(/color[:\s]+(\w+)/i);
        const sizeMatch = description.match(/size[:\s]+(\w+)/i);

        orderData.cart.push({
          name: item.description || item.price.nickname || 'Product',
          price: parseFloat(price),
          quantity: quantity,
          selectedColor: colorMatch ? colorMatch[1] : null,
          selectedSize: sizeMatch ? sizeMatch[1] : null,
        });
      });

      orderData.subtotal = subtotal;
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        success: true,
        order: orderData,
      }),
    };
  } catch (error) {
    console.error('Error retrieving Stripe order:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        error: 'Failed to retrieve order details',
        message: error.message,
      }),
    };
  }
};

