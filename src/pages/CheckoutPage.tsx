import { useMemo, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Truck, ArrowLeft, Check, Lock, MapPin, Phone, Mail, User, ShieldCheck, Loader2 } from 'lucide-react';
import { createStripeCheckout, calculateCartTotal, parsePriceToNumber } from '@/utils/stripeCheckout';
import { toast } from 'sonner';
import { createStripeOrderAndItems } from '@/services/supabaseIntegration';
import '../styles/checkout-styles.css';

type PaymentMethod = 'stripe' | 'cod' | null;

// Refined typography
const typography = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  WebkitFontSmoothing: 'antialiased' as const,
  MozOsxFontSmoothing: 'grayscale' as const,
};

// Mock cart data
// Pull items from CartContext instead of mock data

export default function CheckoutPage() {
  const { state, clearCart, promoDiscount } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    address: '',
    city: '',
    zipCode: '',
    country: 'Lebanon' // Default to Lebanon
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cart = useMemo(() => state.items.map((item: any) => {
    const priceNum = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
    const originalNum = item.originalPrice
      ? parseFloat(String(item.originalPrice).replace(/[^0-9.]/g, ''))
      : undefined;
    return {
      id: item.id,
      name: item.name,
      price: isNaN(priceNum) ? 0 : priceNum,
      originalPrice: originalNum,
      quantity: item.quantity ?? 1,
      image: item.image || (item.images?.[0] ?? ''),
      images: item.images,
      isBundle: item.isBundle,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
    };
  }), [state.items]);

  const subtotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), 
    [cart]
  );
  
  // 5% discount for Stripe payments
  const stripeDiscount = useMemo(() => {
    return paymentMethod === 'stripe' ? subtotal * 0.05 : 0;
  }, [paymentMethod, subtotal]);
  
  // Delivery fee: $0 for Stripe payments (free delivery), $4 for COD
  const deliveryFee = paymentMethod === 'stripe' ? 0 : 4;
  const total = subtotal + deliveryFee - stripeDiscount - promoDiscount;
  const savings = useMemo(() => {
    return cart.reduce((sum, item) => {
      if (typeof item.originalPrice === 'number' && !isNaN(item.originalPrice)) {
        return sum + ((item.originalPrice - item.price) * item.quantity);
      }
      return sum;
    }, 0);
  }, [cart]);

  const validateField = (key: string, value: string): string => {
    switch (key) {
      case 'name':
        return value.trim().length < 2 ? 'Name must be at least 2 characters' : '';
      case 'phone':
        // Accept Lebanese numbers: 81939088, +961 81 939 088, 03 123 456, etc.
        const phoneRegex = /^[\d\s+()-]{7,}$/; // At least 7 digits (Lebanese numbers can be 7-8 digits)
        return !phoneRegex.test(value) ? 'Please enter a valid phone number' : '';
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Please enter a valid email' : '';
      case 'address':
        return value.trim().length < 5 ? 'Please enter a complete address' : '';
      case 'city':
        return value.trim().length < 2 ? 'City is required' : '';
      case 'zipCode':
        return value.trim().length < 3 ? 'Zip code is required' : '';
      case 'country':
        // Country is always Lebanon, no validation needed
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleBlur = (key: string) => {
    const error = validateField(key, formData[key as keyof typeof formData]);
    if (error) {
      setErrors(prev => ({ ...prev, [key]: error }));
    }
  };

  const validateForm = (): boolean => {
    if (paymentMethod !== 'cod') return true;
    
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      // Skip country validation (always Lebanon)
      if (key === 'country') return;
      
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendOrderEmail = async (orderData: any) => {
    try {
      const response = await fetch('/.netlify/functions/send-order-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Email sending error:', error);
      // Don't throw - email failure shouldn't block order completion
      return null;
    }
  };

  const handleCODSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    
    try {
      // Ensure country is always Lebanon
      const deliveryData = { ...formData, country: 'Lebanon' };
      
      // Generate unique order ID
      const orderId = `COD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Format items for analytics
      const items = state.items.map(item => {
        const unitPrice = parsePriceToNumber(item.price);
        return {
          product_id: item.id,
          title: item.name,
          quantity: item.quantity,
          price: unitPrice,
        };
      });
      
      // Track the order in database as completed (COD orders are confirmed on checkout)
      if ((window as any).analytics) {
        console.log('[Checkout] Tracking COD order in analytics:', {
          order_id: orderId,
          customer_email: formData.email,
          total_value: total,
          items_count: items.length,
        });

        try {
          (window as any).analytics.trackPurchase({
            order_id: orderId,
            customer_email: formData.email,
            customer_phone: formData.phone, // Include phone number
            subtotal: subtotal,
            shipping_total: deliveryFee,
            discount_total: 0,
            tax_total: 0,
            total_value: total,
            currency: 'USD',
            payment_method: 'cash_on_delivery',
            shipping_method: 'cash_on_delivery', // COD includes delivery fee
            source: (window as any).analytics?.determineSource?.() || 'direct',
            items: items,
            status: 'completed',
          });
          console.log('[Checkout] Analytics order tracking initiated');
        } catch (analyticsError: any) {
          console.error('[Checkout] Error tracking order in analytics:', analyticsError);
          console.error('[Checkout] Analytics error details:', analyticsError.message, analyticsError.stack);
        }
      } else {
        console.warn('[Checkout] Analytics SDK not available - order not tracked in analytics table');
      }

      // Send order email via Resend (non-blocking)
      sendOrderEmail({
        orderId,
        paymentMethod: 'cod',
        customerEmail: formData.email,
        delivery: deliveryData,
        cart: cart.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
        })),
        deliveryFee,
        subtotal,
        total,
      }).catch(error => {
        // Log error but don't block order completion
        console.error('Email sending failed:', error);
      });

      // Also create an entry in public.orders (Stripe orders table) for COD to store email and phone
      try {
        const orderItems = cart.map((item) => {
          const unitPrice = parsePriceToNumber(item.price);
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

        console.log('[Checkout] Creating COD order in public.orders:', {
          orderId,
          customerEmail: formData.email,
          total,
          itemsCount: orderItems.length,
        });

        const result = await createStripeOrderAndItems(
          orderId,            // orderNumber
          'COD',              // stripeSessionId placeholder (will be set to null)
          null,               // stripePaymentIntentId
          formData.email,     // customerEmail
          total,              // totalAmount
          'USD',              // currency
          orderItems,         // items
          deliveryData,       // billingAddress (contains phone, country always Lebanon)
          deliveryData,       // shippingAddress (contains phone, country always Lebanon)
          undefined           // userId
        );

        if (result.success) {
          console.log('[Checkout] COD order created successfully in public.orders:', result.orderId);
        } else {
          console.error('[Checkout] Failed to create COD order in public.orders:', result.error);
        }
      } catch (err: any) {
        console.error('[Checkout] Error creating COD order in public.orders:', err);
        console.error('[Checkout] Error details:', err.message, err.stack);
      }
      
      // Clear cart immediately
      clearCart();
      
      // Show success message
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Order confirmed! Thank you, ${formData.name}.`);
      
      // Redirect to success page
      setTimeout(() => {
        window.location.href = '/success?order_id=' + orderId;
      }, 2000);
      
    } catch (error: any) {
      console.error('COD order error:', error);
      toast.error('Failed to create order. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleStripeRedirect = async () => {
    if (state.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Track checkout start event
    if ((window as any).analytics) {
      (window as any).analytics.trackCart('checkout_start', {
        cart_total: total,
        items_count: cart.length,
      });
    }

    setIsSubmitting(true);
    try {
      const { url } = await createStripeCheckout({
        cartItems: state.items,
        currency: 'USD',
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/`,
      });
      
      // Redirect to Stripe
      window.location.href = url;
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      toast.error(error.message || 'Failed to create checkout session. Please try again.');
      setIsSubmitting(false);
    }
  };

  const isFormValid = paymentMethod === 'cod' 
    ? Object.keys(formData).every(key => formData[key as keyof typeof formData].trim() !== '') && Object.keys(errors).length === 0
    : paymentMethod === 'stripe';

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Minimal Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => window.history.back()}
            className="group inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            style={{ ...typography, fontWeight: 500 }}
          >
            <motion.div
              whileHover={{ x: -4, transition: { duration: 0.2 } }}
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.div>
            <span className="group-hover:underline underline-offset-2">Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-[1fr_400px] gap-6 sm:gap-8 lg:gap-12">
          
          {/* Left Column */}
          <div className="order-2 lg:order-1 space-y-8">
            {/* Title */}
            <div>
              <h1
                className="text-2xl lg:text-3xl text-gray-900 mb-1"
                style={{ ...typography, fontWeight: 600, letterSpacing: '-0.02em' }}
              >
                Checkout
              </h1>
              <p className="text-sm text-gray-500" style={{ ...typography, fontWeight: 400 }}>
                Complete your order securely
              </p>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-gray-700 mb-3" style={typography}>
                Payment method
              </h2>

              {/* Stripe Card Payment */}
              <motion.div
                whileHover={{ 
                  scale: 1.01,
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMethod('stripe')}
                className={`group cursor-pointer rounded-sm p-4 border transition-all relative overflow-hidden ${
                  paymentMethod === 'stripe'
                    ? 'bg-gradient-to-br from-[#A4193D]/10 to-[#D4AF37]/10 border-[#D4AF37] ring-2 ring-[#D4AF37]/20 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-[#D4AF37] hover:shadow-md'
                }`}
              >
                {/* Animated gradient on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, rgba(164, 25, 61, 0.02) 0%, rgba(212, 175, 55, 0.02) 100%)'
                  }}
                />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        paymentMethod === 'stripe' 
                          ? 'bg-gradient-to-br from-[#A4193D] to-[#D4AF37]' 
                          : 'bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-[#A4193D] group-hover:to-[#D4AF37]'
                      }`}
                    >
                      <CreditCard className={`w-4 h-4 transition-colors duration-300 ${
                        paymentMethod === 'stripe' 
                          ? 'text-white' 
                          : 'text-gray-600 group-hover:text-white'
                      }`} />
                    </motion.div>
                    <div>
                      <p className="text-sm font-medium text-gray-900" style={typography}>
                        Stripe Checkout
                      </p>
                      <p className="text-xs text-gray-500" style={typography}>
                        Secure card payment • PCI compliant
                      </p>
                      <p className="text-xs font-semibold text-green-600 mt-1" style={typography}>
                        🎉 Get 5% discount on total price!
                      </p>
                    </div>
                  </div>
                  <AnimatePresence>
                    {paymentMethod === 'stripe' && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="w-5 h-5 rounded-full bg-gradient-to-br from-[#A4193D] to-[#D4AF37] flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* COD Card */}
              <motion.div
                whileHover={{ 
                  scale: 1.01,
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMethod('cod')}
                className={`group cursor-pointer rounded-sm p-4 border transition-all relative overflow-hidden ${
                  paymentMethod === 'cod'
                    ? 'bg-gray-50 border-gray-900 ring-2 ring-gray-900/10 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-400 hover:shadow-md'
                }`}
              >
                {/* Animated gradient on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, transparent 100%)'
                  }}
                />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      whileHover={{ x: [0, 3, 0], transition: { duration: 0.5, repeat: Infinity } }}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        paymentMethod === 'cod'
                          ? 'bg-gray-900'
                          : 'bg-gray-100 group-hover:bg-gray-900'
                      }`}
                    >
                      <Truck className={`w-4 h-4 transition-colors duration-300 ${
                        paymentMethod === 'cod' 
                          ? 'text-white' 
                          : 'text-gray-600 group-hover:text-white'
                      }`} />
                    </motion.div>
                    <div>
                      <p className="text-sm font-medium text-gray-900" style={typography}>
                        Cash on delivery
                      </p>
                      <p className="text-xs text-gray-500" style={typography}>
                        Pay when you receive • <span className="font-semibold">+$4.00 fee</span>
                      </p>
                    </div>
                  </div>
                  <AnimatePresence>
                    {paymentMethod === 'cod' && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Delivery Form */}
            <AnimatePresence mode="wait">
              {paymentMethod === 'cod' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white rounded-sm p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <h3 className="text-sm font-medium text-gray-900" style={typography}>
                        Delivery information
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5" style={typography}>
                          Full name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          onBlur={() => handleBlur('name')}
                          
                          className={`w-full px-3 py-2 text-sm rounded-sm border transition-all focus:outline-none focus:ring-2 ${
                            errors.name
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                              : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900/10'
                          }`}
                          style={typography}
                        />
                        {errors.name && (
                          <p className="text-xs text-red-600 mt-1" style={typography}>{errors.name}</p>
                        )}
                      </div>

                      {/* Phone & Email */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5" style={typography}>
                            Phone number
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            onBlur={() => handleBlur('phone')}
                            className={`w-full px-3 py-2 text-sm rounded-sm border transition-all focus:outline-none focus:ring-2 ${
                              errors.phone
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900/10'
                            }`}
                            style={typography}
                          />
                          {errors.phone && (
                            <p className="text-xs text-red-600 mt-1" style={typography}>{errors.phone}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5" style={typography}>
                            Email address
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            onBlur={() => handleBlur('email')}
                           
                            className={`w-full px-3 py-2 text-sm rounded-sm border transition-all focus:outline-none focus:ring-2 ${
                              errors.email
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900/10'
                            }`}
                            style={typography}
                          />
                          {errors.email && (
                            <p className="text-xs text-red-600 mt-1" style={typography}>{errors.email}</p>
                          )}
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5" style={typography}>
                          Street address
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          onBlur={() => handleBlur('address')}
                          placeholder="123 Main Street"
                          className={`w-full px-3 py-2 text-sm rounded-sm border transition-all focus:outline-none focus:ring-2 ${
                            errors.address
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                              : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900/10'
                          }`}
                          style={typography}
                        />
                        {errors.address && (
                          <p className="text-xs text-red-600 mt-1" style={typography}>{errors.address}</p>
                        )}
                      </div>

                      {/* City, Zip */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5" style={typography}>
                            City
                          </label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            onBlur={() => handleBlur('city')}
                            placeholder="Beirut"
                            className={`w-full px-3 py-2 text-sm rounded-sm border transition-all focus:outline-none focus:ring-2 ${
                              errors.city
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900/10'
                            }`}
                            style={typography}
                          />
                          {errors.city && (
                            <p className="text-xs text-red-600 mt-1" style={typography}>{errors.city}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5" style={typography}>
                            ZIP
                          </label>
                          <input
                            type="text"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange('zipCode', e.target.value)}
                            onBlur={() => handleBlur('zipCode')}
                            placeholder="1107"
                            className={`w-full px-3 py-2 text-sm rounded-sm border transition-all focus:outline-none focus:ring-2 ${
                              errors.zipCode
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-gray-200 focus:border-gray-900 focus:ring-gray-900/10'
                            }`}
                            style={typography}
                          />
                          {errors.zipCode && (
                            <p className="text-xs text-red-600 mt-1" style={typography}>{errors.zipCode}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-24 h-fit">
            <motion.div 
              whileHover={{ 
                y: -4,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                transition: { duration: 0.3 }
              }}
              className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 transition-all overflow-hidden"
            >
              <h2 className="text-base font-medium text-gray-900 mb-4" style={typography}>
                Order summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-6">
                {cart.map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    className="group flex gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-all"
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  >
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-cover border border-gray-200 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1" style={typography}>
                        {item.name}
                      </p>
                      {(item.selectedColor || item.selectedSize) && (
                        <div className="flex gap-1.5 mt-1">
                          {item.selectedColor && (
                            <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-50 rounded" style={typography}>
                              {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-50 rounded" style={typography}>
                              {item.selectedSize}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-gray-500" style={typography}>Qty: {item.quantity}</span>
                        <div className="text-right">
                          {typeof item.originalPrice === 'number' && (
                            <span className="text-xs text-gray-400 line-through mr-1.5" style={typography}>
                              ${item.originalPrice.toFixed(2)}
                            </span>
                          )}
                          <span className="text-sm font-medium text-gray-900" style={typography}>
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Savings */}
              {savings > 0 && (
                <motion.div 
                  className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 relative overflow-hidden"
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  {/* Animated pulse effect */}
                  <motion.div
                    className="absolute inset-0 bg-green-100/50"
                    animate={{ 
                      opacity: [0, 0.5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <div className="relative flex items-center justify-between">
                    <span className="text-xs font-medium text-green-800" style={typography}>
                      You're saving
                    </span>
                    <span className="text-sm font-semibold text-green-800" style={typography}>
                      ${savings.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Price breakdown */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <motion.div 
                  className="flex justify-between items-center gap-2 text-sm"
                  whileHover={{ x: 2, transition: { duration: 0.2 } }}
                >
                  <span className="text-gray-600 flex-shrink-0" style={typography}>Subtotal</span>
                  <span className="font-medium text-gray-900 flex-shrink-0 whitespace-nowrap" style={typography}>${subtotal.toFixed(2)}</span>
                </motion.div>
                {promoDiscount > 0 && (
                  <motion.div 
                    className="flex justify-between items-center gap-2 text-sm bg-gradient-to-r from-[#A4193D]/5 to-[#D4AF37]/5 -mx-2 px-2 py-1.5 rounded-lg"
                    whileHover={{ x: 2, scale: 1.02, transition: { duration: 0.2 } }}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="text-[#A4193D] font-semibold flex-shrink min-w-0 text-xs sm:text-sm flex items-center gap-1" style={typography}>
                      <span className="text-base">🎉</span> Buy 2 Get 50% Off 3rd
                    </span>
                    <span className="font-bold text-[#A4193D] flex-shrink-0 whitespace-nowrap" style={typography}>
                      -${promoDiscount.toFixed(2)}
                    </span>
                  </motion.div>
                )}
                {stripeDiscount > 0 && (
                  <motion.div 
                    className="flex justify-between items-center gap-2 text-sm"
                    whileHover={{ x: 2, transition: { duration: 0.2 } }}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="text-green-600 font-medium flex-shrink min-w-0 text-xs sm:text-sm" style={typography}>Stripe Discount (5%)</span>
                    <span className="font-semibold text-green-600 flex-shrink-0 whitespace-nowrap" style={typography}>
                      -${stripeDiscount.toFixed(2)}
                    </span>
                  </motion.div>
                )}
                {deliveryFee > 0 && (
                  <motion.div 
                    className="flex justify-between items-center gap-2 text-sm"
                    whileHover={{ x: 2, transition: { duration: 0.2 } }}
                  >
                    <span className="text-gray-600 flex-shrink-0" style={typography}>Delivery</span>
                    <span className="font-medium text-gray-900 flex-shrink-0 whitespace-nowrap" style={typography}>
                      ${deliveryFee.toFixed(2)}
                    </span>
                  </motion.div>
                )}
                <motion.div 
                  className="flex justify-between items-center gap-2 pt-3 border-t border-gray-200"
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <span className="text-sm font-medium text-gray-900 flex-shrink-0" style={typography}>Total</span>
                  <motion.span 
                    className="text-base sm:text-lg font-semibold text-gray-900 flex-shrink-0 whitespace-nowrap" 
                    style={{ ...typography, letterSpacing: '-0.01em' }}
                    whileHover={{ 
                      scale: 1.05,
                      color: '#000',
                      transition: { duration: 0.2 }
                    }}
                  >
                    ${total.toFixed(2)}
                  </motion.span>
                </motion.div>
              </div>

              {/* Checkout Button */}
              {paymentMethod && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={paymentMethod === 'cod' ? handleCODSubmit : handleStripeRedirect}
                  disabled={!isFormValid || isSubmitting}
                  className="checkout-btn group relative w-full mt-6 py-3 px-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all overflow-hidden"
                  style={{ 
                    ...typography,
                    background: 'linear-gradient(135deg, #A4193D, #D4AF37)',
                    color: 'white',
                    borderRadius: '9999px',
                    border: 'none',
                    boxShadow: '0 10px 40px -10px rgba(212, 175, 55, 0.3)',
                  }}
                >
                  {/* Animated shimmer effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                    }}
                  />
                  
                  {/* Button content */}
                  <span className="relative flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Lock className="w-4 h-4" />
                        </motion.div>
                        <span>{paymentMethod === 'cod' ? 'Place order' : 'Continue to payment'}</span>
                        <motion.div
                          className="w-1 h-1 rounded-full bg-white/60"
                          animate={{ 
                            scale: [1, 1.5, 1],
                            opacity: [0.6, 1, 0.6]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </>
                    )}
                  </span>
                </motion.button>
              )}

              {/* Security badge */}
              <motion.div 
                className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-1.5 text-xs text-gray-500"
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </motion.div>
                <span style={typography}>Secure checkout</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}