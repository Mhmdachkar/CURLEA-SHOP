import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, Truck, Mail } from 'lucide-react';
import '../styles/checkout-styles.css';
import { createStripeOrderAndItems } from '@/services/supabaseIntegration';

export default function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const [countdown, setCountdown] = useState(5);
  const [emailSent, setEmailSent] = useState(false);

  // Handle Stripe order completion - create order in Supabase and send email
  useEffect(() => {
    const handleStripeOrderCompletion = async () => {
      if (!sessionId || emailSent) return;

      try {
        // Get order details from Stripe session
        const orderResponse = await fetch('/.netlify/functions/get-stripe-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!orderResponse.ok) {
          console.error('Failed to get order details');
          return;
        }

        const { order } = await orderResponse.json();

        // 0. Update analytics orders table with customer email and shipping info from Stripe
        // The order was created as 'pending' in create-checkout, now update it with complete info
        try {
          const updateResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
            },
            body: JSON.stringify({
              type: 'order_update',
              data: {
                order_id: order.orderId, // Use the order_number to find the order
                customer_email: order.customerEmail,
                shipping_method: 'standard',
                status: 'completed',
                // Include shipping address if available
                shipping_address: order.delivery,
              },
            }),
          });
          if (updateResponse.ok) {
            console.log('[Success Page] Analytics order updated with customer info');
          }
        } catch (updateError) {
          console.warn('[Success Page] Failed to update analytics order:', updateError);
        }

        // 1. Create Stripe order and order_items in Supabase
        const items = order.cart.map((item: any) => {
          // Handle price - could be number or string
          const unitPrice = typeof item.price === 'number' 
            ? item.price 
            : parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
          
          return {
            product_name: item.name,
            variant: item.selectedColor || item.selectedSize || undefined,
            quantity: item.quantity,
            unit_price: unitPrice,
            total_price: unitPrice * item.quantity,
            image_url: item.image || undefined,
            product_metadata: {
              product_id: item.id,
              selectedColor: item.selectedColor,
              selectedSize: item.selectedSize,
            },
          };
        });

        const orderResult = await createStripeOrderAndItems(
          order.orderId,
          sessionId,
          null, // payment_intent_id - can be retrieved from Stripe if needed
          order.customerEmail,
          order.total,
          'USD',
          items,
          order.delivery, // billing address
          order.delivery, // shipping address
          undefined // user_id - can be added if you have user authentication
        );

        if (orderResult.success) {
          console.log('[Success Page] Stripe order created in Supabase:', orderResult.orderId);
        } else {
          console.warn('[Success Page] Failed to create Stripe order in Supabase:', orderResult.error);
        }

        // 2. Track order completion in analytics (update existing order or create new one)
        if ((window as any).analytics) {
          (window as any).analytics.trackCart('checkout_complete', {
            order_id: order.orderId,
            cart_total: order.total,
            items_count: order.cart.length,
          });

          // Get UTM parameters if available
          const urlParams = new URLSearchParams(window.location.search);
          const utmSource = urlParams.get('utm_source') || sessionStorage.getItem('utm_source');
          const utmMedium = urlParams.get('utm_medium') || sessionStorage.getItem('utm_medium');
          const utmCampaign = urlParams.get('utm_campaign') || sessionStorage.getItem('utm_campaign');

          (window as any).analytics.trackPurchase({
            order_id: order.orderId,
            customer_email: order.customerEmail,
            subtotal: order.subtotal,
            shipping_total: order.deliveryFee || 0,
            discount_total: order.discountAmount || order.stripeDiscount || 0,
            tax_total: 0,
            total_value: order.total,
            currency: order.currency || 'USD',
            payment_method: 'stripe',
            shipping_method: 'standard', // Stripe checkout uses standard shipping
            source: (window as any).analytics?.determineSource?.() || 'direct',
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            items: order.cart.map((item: any) => ({
              product_id: item.id || item.product_id,
              title: item.name,
              quantity: item.quantity,
              price: typeof item.price === 'number' ? item.price : (parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0),
            })),
            status: 'completed',
          });
        }

        // 3. Send email (same as COD orders)
        try {
          const emailResponse = await fetch('/.netlify/functions/send-order-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: order.orderId,
              paymentMethod: 'stripe',
              customerEmail: order.customerEmail,
              delivery: order.delivery,
              cart: order.cart,
              deliveryFee: order.deliveryFee || 0,
              subtotal: order.subtotal,
              discountAmount: order.discountAmount || order.stripeDiscount || 0,
              total: order.total,
            }),
          });

          if (emailResponse.ok) {
            setEmailSent(true);
            console.log('[Success Page] Stripe order email sent successfully');
          } else {
            const errorData = await emailResponse.json().catch(() => ({}));
            console.error('[Success Page] Failed to send Stripe order email:', errorData);
          }
        } catch (emailError) {
          // Log error but don't block - email failure shouldn't affect user experience
          console.error('[Success Page] Error sending Stripe order email:', emailError);
        }
      } catch (error) {
        console.error('[Success Page] Error handling Stripe order completion:', error);
        // Don't block the success page - failures shouldn't affect user experience
      } finally {
        // Mark email as sent even if there was an error, to prevent retries
        setEmailSent(true);
      }
    };

    // Only handle for Stripe payments (session_id present)
    // COD orders already handled in CheckoutPage
    if (sessionId && !orderId && !emailSent) {
      handleStripeOrderCompletion();
    }
  }, [sessionId, orderId, emailSent]);

  // Countdown to redirect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#FDF8F4] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="cart-container max-w-md text-center animate-fade-in-up"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            delay: 0.2 
          }}
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ 
            background: 'linear-gradient(135deg, #A4193D, #D4AF37)',
            boxShadow: '0 10px 40px -10px rgba(212, 175, 55, 0.3)'
          }}
        >
          <CheckCircle className="w-10 h-10" color="white" />
        </motion.div>

        {/* Heading */}
        <h1 
          className="text-3xl font-bold mb-4 gradient-text"
          style={{
            background: 'linear-gradient(135deg, #A4193D, #D4AF37)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Payment Successful! 🎉
        </h1>

        {/* Description */}
        <p className="text-muted mb-6" style={{ color: '#666666' }}>
          Thank you for your purchase. Your order is being processed and you'll receive a confirmation email shortly.
        </p>

        {/* Session ID (if available) */}
        {sessionId && (
          <div 
            className="bg-[#F5E6D3] border border-[#D4AF37] rounded-lg p-4 mb-6"
          >
            <p className="text-sm font-semibold mb-2" style={{ color: '#A4193D' }}>
              Order Confirmation
            </p>
            <p className="text-xs font-mono" style={{ color: '#666666' }}>
              {sessionId}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center justify-center gap-3 text-sm" style={{ color: '#666666' }}>
            <Mail className="w-4 h-4" />
            <span>Email confirmation sent</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-sm" style={{ color: '#666666' }}>
            <Truck className="w-4 h-4" />
            <span>Free shipping included</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-sm" style={{ color: '#666666' }}>
            <CheckCircle className="w-4 h-4" />
            <span>30-day money-back guarantee</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/')}
            className="checkout-btn flex-1"
            style={{
              background: 'linear-gradient(135deg, #A4193D, #D4AF37)',
              color: 'white',
              borderRadius: '9999px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(164, 25, 61, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 40px -10px rgba(212, 175, 55, 0.3)';
            }}
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </button>
        </div>

        {/* Countdown */}
        {countdown > 0 && (
          <p className="text-xs mt-4" style={{ color: '#666666' }}>
            Redirecting in {countdown} seconds...
          </p>
        )}
      </motion.div>
    </div>
  );
}

