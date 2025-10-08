/// <reference types="vite/client" />

// Analytics SDK Type Declarations
interface AnalyticsSDK {
  init(config: { endpoint: string; debug?: boolean }): void;
  track(eventName: string, eventData?: Record<string, any>): void;
  trackCart(
    eventType: 'add' | 'remove' | 'update' | 'checkout_start' | 'checkout_complete',
    productData: {
      product_id: string;
      title: string;
      price: number;
      quantity?: number;
      variant_id?: string;
      variant_title?: string;
      cart_total?: number;
      discount_code?: string;
      discount_amount?: number;
      total_value?: number;
    }
  ): void;
  trackPurchase(orderData: {
    order_id: string;
    customer_email?: string;
    subtotal: number;
    discount_total?: number;
    shipping_total?: number;
    tax_total?: number;
    total_value: number;
    currency?: string;
    payment_method?: string;
    items: Array<{
      product_id: string;
      title: string;
      quantity: number;
      price: number;
    }>;
    status?: string;
  }): void;
  getSessionId(): string;
  flush(): void;
  reset(): void;
  version: string;
}

interface Window {
  analytics?: AnalyticsSDK;
}

declare const analytics: AnalyticsSDK;
