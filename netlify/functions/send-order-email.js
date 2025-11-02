/**
 * Netlify Function: Send Order Email via Resend
 * Sends order confirmation email when COD order is placed
 * 
 * Environment Variables Required:
 * - RESEND_API_KEY: Your Resend API key (starts with re_)
 * - ORDER_EMAIL_FROM: Sender email (e.g., orders@curlea.beauty)
 * - ORDER_EMAIL_TO: Recipient email (e.g., hello@curlea.beauty)
 */

const { Resend } = require('resend');

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// CORS headers for browser requests
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event, context) => {
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
    // Parse request body
    const orderData = JSON.parse(event.body);

    // Validate required fields
    if (!orderData.orderId || !orderData.customerEmail || !orderData.cart || !orderData.delivery) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required order information' }),
      };
    }

    // Get email addresses from environment
    const fromEmail = process.env.ORDER_EMAIL_FROM || 'onboarding@resend.dev';
    const toEmail = process.env.ORDER_EMAIL_TO || fromEmail;

    // Format order items for email
    const formatOrderItems = (items) => {
      return items
        .map(
          (item, index) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${item.name || 'Product'}
            ${item.selectedColor ? `<br><small style="color: #6b7280;">Color: ${item.selectedColor}</small>` : ''}
            ${item.selectedSize ? `<br><small style="color: #6b7280;">Size: ${item.selectedSize}</small>` : ''}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity || 1}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(
            (item.price || 0) * (item.quantity || 1)
          ).toFixed(2)}</td>
        </tr>
      `
        )
        .join('');
    };

    // Calculate totals
    const subtotal = orderData.cart.reduce(
      (sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1),
      0
    );
    const deliveryFee = orderData.deliveryFee || 0;
    const total = subtotal + deliveryFee;

    // Create HTML email template
    const htmlEmail = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Order Confirmation - ${orderData.orderId}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #A4193D 0%, #D4AF37 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                New Order Received! 🎉
              </h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0; font-size: 16px;">
                Order ID: <strong>${orderData.orderId}</strong>
              </p>
            </div>

            <!-- Order Details -->
            <div style="padding: 40px 30px;">
              
              <!-- Payment Method -->
              <div style="margin-bottom: 30px;">
                <h2 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">
                  Payment Information
                </h2>
                <p style="color: #4b5563; margin: 0; font-size: 15px;">
                  <strong>Method:</strong> ${orderData.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment'}<br>
                  ${orderData.paymentMethod === 'cod' ? '<span style="color: #dc2626; font-weight: 600;">⚠️ Delivery Fee: $4.00</span>' : ''}
                </p>
              </div>

              <!-- Customer Information -->
              <div style="margin-bottom: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                <h2 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 16px;">
                  Customer Details
                </h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; width: 120px; font-size: 14px;"><strong>Name:</strong></td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px;">${orderData.delivery.name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Email:</strong></td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px;">${orderData.customerEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Phone:</strong></td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px;">${orderData.delivery.phone || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Address:</strong></td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px;">
                      ${orderData.delivery.address || ''}<br>
                      ${orderData.delivery.city || ''} ${orderData.delivery.zipCode || ''}<br>
                      ${orderData.delivery.country || ''}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Order Items -->
              <div style="margin-bottom: 30px;">
                <h2 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">
                  Order Items
                </h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #f9fafb;">
                      <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 13px; font-weight: 600;">#</th>
                      <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 13px; font-weight: 600;">Product</th>
                      <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 13px; font-weight: 600;">Qty</th>
                      <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 13px; font-weight: 600;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${formatOrderItems(orderData.cart)}
                  </tbody>
                </table>
              </div>

              <!-- Order Summary -->
              <div style="padding: 20px; background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%); border-radius: 8px; border: 1px solid #e5e7eb;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 15px;">Subtotal:</td>
                    <td style="padding: 10px 0; text-align: right; color: #111827; font-size: 15px; font-weight: 500;">$${subtotal.toFixed(2)}</td>
                  </tr>
                  ${deliveryFee > 0 ? `
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 15px;">Delivery Fee:</td>
                    <td style="padding: 10px 0; text-align: right; color: #111827; font-size: 15px; font-weight: 500;">$${deliveryFee.toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  <tr style="border-top: 2px solid #e5e7eb;">
                    <td style="padding: 16px 0 0; color: #111827; font-size: 18px; font-weight: 700;">Total:</td>
                    <td style="padding: 16px 0 0; text-align: right; color: #111827; font-size: 20px; font-weight: 700;">$${total.toFixed(2)}</td>
                  </tr>
                </table>
              </div>

            </div>

            <!-- Footer -->
            <div style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 13px;">
                This is an automated email from <strong>Curlea Beauty</strong><br>
                <a href="https://curlea.beauty" style="color: #A4193D; text-decoration: none;">curlea.beauty</a>
              </p>
              <p style="color: #9ca3af; margin: 12px 0 0; font-size: 12px;">
                Order placed on ${new Date().toLocaleString('en-US', { 
                  dateStyle: 'long', 
                  timeStyle: 'short' 
                })}
              </p>
            </div>

          </div>
        </body>
      </html>
    `;

    // Plain text version for email clients that don't support HTML
    const textEmail = `
New Order Received! 🎉

Order ID: ${orderData.orderId}
Payment Method: ${orderData.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment'}

Customer Details:
- Name: ${orderData.delivery.name || 'N/A'}
- Email: ${orderData.customerEmail}
- Phone: ${orderData.delivery.phone || 'N/A'}
- Address: ${orderData.delivery.address || ''}, ${orderData.delivery.city || ''} ${orderData.delivery.zipCode || ''}, ${orderData.delivery.country || ''}

Order Items:
${orderData.cart
  .map(
    (item, index) =>
      `${index + 1}. ${item.name} ${item.selectedColor ? `(${item.selectedColor})` : ''} - Qty: ${item.quantity || 1} - $${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`
  )
  .join('\n')}

Order Summary:
Subtotal: $${subtotal.toFixed(2)}
${deliveryFee > 0 ? `Delivery Fee: $${deliveryFee.toFixed(2)}\n` : ''}Total: $${total.toFixed(2)}

Order placed on ${new Date().toLocaleString()}
    `.trim();

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: orderData.customerEmail,
      subject: `New Order #${orderData.orderId} - ${orderData.paymentMethod === 'cod' ? 'COD' : 'Online Payment'}`,
      html: htmlEmail,
      text: textEmail,
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to send email', details: error }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Order email sent successfully',
        emailId: data?.id,
      }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};

