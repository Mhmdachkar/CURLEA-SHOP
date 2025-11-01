/**
 * Stripe Checkout Utility
 * Handles Stripe Hosted Checkout integration
 */

import { CartItem } from '@/contexts/CartContext';

export interface StripeCheckoutRequest {
  cartItems: CartItem[];
  currency?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface StripeCheckoutResponse {
  sessionId: string;
  url: string;
}

/**
 * Parse price string to number
 * Handles formats like "$22.99", "€15.50", "14.799,00 TL", etc.
 */
export const parsePriceToNumber = (rawPrice: string | number): number => {
  if (typeof rawPrice === 'number') return rawPrice;
  if (!rawPrice) return 0;
  
  const trimmed = String(rawPrice).trim();
  
  // Handle European format: "14.799,00 TL"
  const hasCommaDecimal = /\d,\d{1,2}$/.test(trimmed);
  
  let normalized = trimmed.replace(/[^0-9,.-]/g, '');
  
  if (hasCommaDecimal) {
    // Remove thousand separators (.) and convert comma to dot
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else {
    // Remove thousand separators (,)
    const parts = normalized.split('.');
    if (parts.length > 2) normalized = normalized.replace(/,/g, '');
  }
  
  const numeric = parseFloat(normalized);
  return Number.isFinite(numeric) ? numeric : 0;
};

/**
 * Convert cart items to format expected by backend
 */
export const formatCartItemsForCheckout = (items: CartItem[]) => {
  return items.map(item => ({
    id: item.id,
    product_name: item.name,
    variant: item.selectedSize || item.selectedColor || 'Default',
    quantity: item.quantity,
    price: item.price,
    currency: item.currency || 'USD',
    image_url: item.image || (item.images?.[0] || ''),
  }));
};

/**
 * Create Stripe checkout session
 * @param request Checkout request with cart items
 * @returns Checkout session URL or error
 */
export const createStripeCheckout = async (
  request: StripeCheckoutRequest
): Promise<StripeCheckoutResponse> => {
  const { cartItems, currency = 'USD' } = request;
  
  // Determine API endpoint - use production Supabase
  // Note: If you want to use local Supabase, start it with: supabase start
  const apiEndpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`;
  
  console.log('🚀 Creating Stripe checkout session...');
  console.log('API Endpoint:', apiEndpoint);
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Supabase Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
  
  const formattedItems = formatCartItemsForCheckout(cartItems);
  console.log('📦 Cart items with images:', formattedItems.map(item => ({
    name: item.product_name,
    image_url: item.image_url
  })));
  
  // Get session ID from analytics if available
  const sessionId = (window as any).analytics?.getSessionId?.();
  
  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
      },
      body: JSON.stringify({
        cartItems: formattedItems,
        currency,
        sessionId,
        successUrl: request.successUrl || `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: request.cancelUrl || `${window.location.origin}/`,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Checkout API error:', errorData);
      throw new Error(errorData.error || 'Failed to create checkout session');
    }
    
    const data = await response.json();
    console.log('✅ Checkout session created:', data);
    
    if (!data.url) {
      throw new Error('No checkout URL received from server');
    }
    
    return {
      sessionId: data.sessionId,
      url: data.url,
    };
  } catch (error) {
    console.error('❌ Stripe checkout error:', error);
    throw error;
  }
};

/**
 * Calculate cart total
 */
export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const price = parsePriceToNumber(item.price);
    return total + (price * item.quantity);
  }, 0);
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currency = 'USD'): string => {
  switch (currency) {
    case 'USD': return '$';
    case 'GBP': return '£';
    case 'EUR': return '€';
    case 'TRY': return '₺';
    default: return currency;
  }
};

/**
 * Format price with currency symbol
 */
export const formatPrice = (price: number, currency = 'USD'): string => {
  return `${getCurrencySymbol(currency)}${price.toFixed(2)}`;
};

