/**
 * Netlify Function: Get Stripe Order Details
 * Retrieves order details from Stripe session and Supabase for email sending
 */

exports.handler = async (event, context) => {
  // CORS headers - restrict to your domain in production
  const headers = {
    'Access-Control-Allow-Origin': process.env.DEPLOY_PRIME_URL || process.env.URL || 'https://curlea.beauty',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { sessionId } = JSON.parse(event.body);

    if (!sessionId) {
      return {
        statusCode: 400,
        headers,
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

    // Extract discount and totals from metadata or calculate
    const subtotal = session.metadata?.subtotal ? parseFloat(session.metadata.subtotal) : 0;
    const discountAmount = session.metadata?.discount_amount ? parseFloat(session.metadata.discount_amount) : 0;
    const totalFromMetadata = session.metadata?.total_amount ? parseFloat(session.metadata.total_amount) : null;
    
    // Extract order details
    const orderData = {
      orderId: session.metadata?.order_number || session.id,
      paymentMethod: 'stripe',
      customerEmail: session.customer_details?.email || session.customer_email,
      subtotal: subtotal || 0,
      discountAmount: discountAmount || 0,
      total: totalFromMetadata ? totalFromMetadata : ((session.amount_total / 100)), // Convert cents to dollars
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
      deliveryFee: 4.00, // Default delivery fee
      stripeDiscount: discountAmount || 0,
    };

    // Format line items (excluding discount line items)
    if (session.line_items?.data) {
      let calculatedSubtotal = 0;
      let extractedDeliveryFee = 0.00; // No delivery fee for Stripe payments
      
      session.line_items.data.forEach((item) => {
        // Skip discount line items (negative amounts)
        if (item.price.unit_amount < 0) {
          return;
        }
        
        const price = (item.price.unit_amount / 100);
        const quantity = item.quantity || 1;
        const itemName = item.description || item.price.nickname || 'Product';

        // Check if this is a delivery fee line item
        if (itemName.toLowerCase().includes('delivery fee')) {
          extractedDeliveryFee = price;
          orderData.deliveryFee = extractedDeliveryFee;
          return;
        }

        calculatedSubtotal += price * quantity;

        // Extract color/size from description or metadata if available
        const description = item.description || '';
        const colorMatch = description.match(/color[:\s]+(\w+)/i);
        const sizeMatch = description.match(/size[:\s]+(\w+)/i);

        orderData.cart.push({
          name: itemName,
          price: price,
          quantity: quantity,
          selectedColor: colorMatch ? colorMatch[1] : null,
          selectedSize: sizeMatch ? sizeMatch[1] : null,
        });
      });

      // Use calculated subtotal if metadata doesn't have it
      if (!orderData.subtotal || orderData.subtotal === 0) {
        orderData.subtotal = calculatedSubtotal;
      }
      
      // Update delivery fee
      orderData.deliveryFee = extractedDeliveryFee;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        order: orderData,
      }),
    };
  } catch (error) {
    console.error('Error retrieving Stripe order:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to retrieve order details',
        message: error.message,
      }),
    };
  }
};

