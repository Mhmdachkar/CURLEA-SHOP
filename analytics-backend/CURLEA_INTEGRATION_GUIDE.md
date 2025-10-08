# 🔗 Curlea Luxe Site Integration Guide

This guide shows you how to integrate the analytics SDK into your existing Curlea Luxe e-commerce site.

---

## 📦 Prerequisites

- ✅ Supabase project created and schema deployed
- ✅ Edge Function deployed
- ✅ Edge Function URL obtained

---

## 🚀 Step 1: Add Analytics SDK to Your Site

### Copy SDK File

```bash
# Copy the analytics SDK to your public folder
cp analytics-backend/sdk/analytics.js curlea-luxe-animation-main/public/analytics.js
```

### Add to index.html

Edit `curlea-luxe-animation-main/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <!-- ... existing head content ... -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    
    <!-- Analytics SDK -->
    <script src="/analytics.js"></script>
    <script>
      // Initialize analytics
      analytics.init({
        endpoint: 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/track',
        debug: true // Set to false in production
      });
    </script>
  </body>
</html>
```

### Using Environment Variables (Recommended)

Create/update `.env`:

```env
VITE_ANALYTICS_ENDPOINT=https://YOUR_PROJECT_REF.supabase.co/functions/v1/track
```

Then update the script:

```html
<script>
  analytics.init({
    endpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT,
    debug: import.meta.env.DEV
  });
</script>
```

---

## 📊 Step 2: Track Product Views

### In ProductDetailPage.tsx

Add this to track when users view products:

```tsx
import { useEffect } from 'react';

export function ProductDetailPage() {
  const { id } = useParams();
  const product = getProductById(id);

  // Track product view
  useEffect(() => {
    if (product && window.analytics) {
      window.analytics.track('ProductViewed', {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        category: product.category,
        page: 'ProductDetail'
      });
    }
  }, [product]);

  return (
    // ... your existing component
  );
}
```

### In CollectionPage.tsx

Track product views from the collection grid:

```tsx
// In ProductCard3D component or wherever product cards are clickable
const handleProductClick = (product) => {
  // Track the view
  window.analytics?.track('ProductViewed', {
    product_id: product.id,
    product_name: product.name,
    price: product.price,
    category: product.category,
    page: 'Collection'
  });
  
  // Navigate to product
  navigate(`/product/${product.id}`);
};
```

---

## 🛒 Step 3: Track Cart Events (When You Implement Cart)

### Add to Cart

```tsx
const handleAddToCart = (product: Product, quantity: number = 1) => {
  // Your cart logic here
  addToCart(product, quantity);
  
  // Track the event
  window.analytics?.trackCart('add', {
    product_id: product.id,
    title: product.name,
    price: product.price,
    quantity: quantity,
    variant_id: product.variant?.id,
    variant_title: product.variant?.title,
    cart_total: calculateCartTotal(), // Your function to get cart total
  });
};
```

### Remove from Cart

```tsx
const handleRemoveFromCart = (product: Product) => {
  // Your cart logic
  removeFromCart(product.id);
  
  // Track the event
  window.analytics?.trackCart('remove', {
    product_id: product.id,
    title: product.name,
    price: product.price,
    quantity: 1,
    cart_total: calculateCartTotal(),
  });
};
```

### Update Cart Quantity

```tsx
const handleUpdateQuantity = (product: Product, newQuantity: number) => {
  // Your cart logic
  updateCartQuantity(product.id, newQuantity);
  
  // Track the event
  window.analytics?.trackCart('update', {
    product_id: product.id,
    title: product.name,
    price: product.price,
    quantity: newQuantity,
    cart_total: calculateCartTotal(),
  });
};
```

### Checkout Started

```tsx
const handleCheckoutClick = () => {
  // Track checkout start
  window.analytics?.trackCart('checkout_start', {
    cart_total: calculateCartTotal(),
    items_count: getCartItems().length,
  });
  
  // Navigate to checkout
  navigate('/checkout');
};
```

---

## 💰 Step 4: Track Purchases (When You Implement Checkout)

### On Successful Order

```tsx
const handleOrderComplete = (orderData) => {
  // Your order completion logic
  
  // Track each product in the order
  orderData.items.forEach((item) => {
    window.analytics?.trackCart('checkout_complete', {
      product_id: item.product_id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      total_value: item.price * item.quantity,
      discount_code: orderData.discount_code,
      discount_amount: orderData.discount_amount,
    });
  });
  
  // Track the complete order
  window.analytics?.trackPurchase({
    order_id: orderData.id,
    customer_email: orderData.email,
    subtotal: orderData.subtotal,
    discount_total: orderData.discount_total || 0,
    shipping_total: orderData.shipping_total || 0,
    tax_total: orderData.tax_total || 0,
    total_value: orderData.total,
    currency: 'USD',
    payment_method: orderData.payment_method,
    items: orderData.items.map(item => ({
      product_id: item.product_id,
      title: item.title,
      quantity: item.quantity,
      price: item.price,
    })),
    status: 'completed',
  });
};
```

---

## 🎯 Step 5: Track Custom Interactions

### Newsletter Signup

```tsx
const handleNewsletterSubmit = (email) => {
  // Your newsletter logic
  
  window.analytics?.track('NewsletterSignup', {
    email_domain: email.split('@')[1],
    source: 'footer',
    category: 'lead_generation',
  });
};
```

### Video Play (if you add videos)

```tsx
const handleVideoPlay = (videoTitle) => {
  window.analytics?.track('VideoPlayed', {
    video_title: videoTitle,
    category: 'engagement',
  });
};
```

### Social Media Clicks

```tsx
const handleSocialClick = (platform) => {
  window.analytics?.track('SocialClick', {
    platform: platform, // 'instagram', 'facebook', etc.
    category: 'social',
  });
};
```

### Quick View Modal

```tsx
const handleQuickView = (product) => {
  window.analytics?.track('QuickViewOpened', {
    product_id: product.id,
    product_name: product.name,
    category: 'engagement',
  });
  
  // Show your modal
  setSelectedProduct(product);
};
```

---

## 🔍 Step 6: Sync Products with Database

You need to sync your products with the Supabase `products` table for accurate reporting.

### Option A: Manual Insert (One-time)

Run this in Supabase SQL Editor:

```sql
-- Insert your actual products
INSERT INTO products (product_id, title, price, cost, category, sku, image_url) VALUES
  ('heatless-1', 'Heatless Hair Curling Rod Set', 29.99, 12.00, 'Hair Tools', 'HCR-001', '/assets/curler.jpg'),
  ('heatless-2', 'Heatless Hair Curling Rod - Pink', 29.99, 12.00, 'Hair Tools', 'HCR-002', '/assets/curler-pink.jpg'),
  ('heatless-3', 'Heatless Hair Curling Rod - Blue', 29.99, 12.00, 'Hair Tools', 'HCR-003', '/assets/curler-blue.jpg'),
  ('heatless-4', 'Heatless Hair Curling Rod - Purple', 29.99, 12.00, 'Hair Tools', 'HCR-004', '/assets/curler-purple.jpg'),
  ('heatless-5', 'Heatless Hair Curling Rod - Black', 29.99, 12.00, 'Hair Tools', 'HCR-005', '/assets/curler-black.jpg'),
  ('heatless-6', 'PEAU DE SOIE Satin Bonnet', 24.99, 10.00, 'Hair Care', 'BONNET-001', '/assets/bonnet.jpg'),
  ('curly-claw-1', 'Curly Hair Claw Clip - Set of 3', 19.99, 8.00, 'Accessories', 'CLAW-001', '/assets/claw.jpg'),
  ('curly-claw-2', 'Curly Hair Claw Clip - Large', 12.99, 5.00, 'Accessories', 'CLAW-002', '/assets/claw-large.jpg'),
  ('curly-claw-3', 'Curly Hair Claw Clip - Medium', 9.99, 4.00, 'Accessories', 'CLAW-003', '/assets/claw-medium.jpg')
ON CONFLICT (product_id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  cost = EXCLUDED.cost,
  category = EXCLUDED.category;
```

### Option B: API Sync (Automated)

Create a simple sync endpoint that you call whenever products change:

```typescript
// In your backend or as a Supabase Edge Function
async function syncProducts(products) {
  const { data, error } = await supabase
    .from('products')
    .upsert(products.map(p => ({
      product_id: p.id,
      title: p.name,
      price: p.price,
      cost: p.cost || null, // You may not have this
      category: p.category,
      sku: p.sku,
      image_url: p.image,
      inventory_count: p.inventory,
    })));
}
```

---

## ✅ Step 7: Test Everything

### 1. Check SDK Initialization

Open your site in a browser with DevTools console open. You should see:

```
[Curlea Analytics] Initializing analytics SDK...
[Curlea Analytics] Session ID: abc-123-def-456
[Curlea Analytics] Analytics SDK initialized successfully
```

### 2. Test Visit Tracking

Refresh the page. In console:

```
[Curlea Analytics] Event queued: {type: "visit", ...}
[Curlea Analytics] Event sent successfully: visit
```

### 3. Test Product View

Click on a product. In console:

```
[Curlea Analytics] Custom event tracked: ProductViewed
[Curlea Analytics] Event queued: {type: "event", ...}
```

### 4. Check Database

In Supabase SQL Editor:

```sql
-- Check visits
SELECT * FROM visits ORDER BY created_at DESC LIMIT 5;

-- Check page views
SELECT * FROM page_views ORDER BY created_at DESC LIMIT 5;

-- Check events
SELECT * FROM events WHERE event_name = 'ProductViewed' ORDER BY created_at DESC LIMIT 5;
```

---

## 🐛 Troubleshooting

### Events not being sent

1. **Check console for errors**
2. **Verify endpoint URL** is correct in init()
3. **Check Edge Function logs**: `supabase functions logs track`
4. **Verify RLS policies** allow inserts

### Products not linking correctly

1. **Check product_id matches** between your site and database
2. **Run sync query** to ensure products exist in database
3. **Check cart_events** table to see if product_id is NULL

### Session tracking issues

1. **Check localStorage** is enabled in browser
2. **Check session_id** is being generated: `analytics.getSessionId()`
3. **Clear localStorage** and test: `analytics.reset()`

---

## 📊 What You'll See in Analytics

Once integrated, you'll have data for:

- **Traffic**: Where visitors come from, device types, locations
- **Engagement**: Which products are viewed most, scroll depth, time on site
- **Conversion**: How many visitors add to cart, start checkout, complete purchase
- **Revenue**: Daily sales, average order value, profit margins
- **Products**: Top sellers, profit by product, inventory movement

---

## 🎨 TypeScript Declarations (Optional)

Add this to `vite-env.d.ts` or create `analytics.d.ts`:

```typescript
interface AnalyticsSDK {
  init(config: { endpoint: string; debug?: boolean }): void;
  track(eventName: string, eventData?: Record<string, any>): void;
  trackCart(eventType: 'add' | 'remove' | 'update' | 'checkout_start' | 'checkout_complete', productData: {
    product_id: string;
    title: string;
    price: number;
    quantity?: number;
    variant_id?: string;
    variant_title?: string;
    cart_total?: number;
    discount_code?: string;
    discount_amount?: number;
  }): void;
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
  analytics: AnalyticsSDK;
}

declare const analytics: AnalyticsSDK;
```

---

## 🚀 Go Live Checklist

Before going to production:

- [ ] Supabase project on Pro plan (if expecting high traffic)
- [ ] Set `debug: false` in analytics.init()
- [ ] All products synced to database
- [ ] Tested visit, page view, and event tracking
- [ ] Tested cart events (if implemented)
- [ ] Tested purchase tracking (if implemented)
- [ ] Edge Function monitoring enabled
- [ ] Analytics dashboard deployed
- [ ] Privacy policy updated (mention analytics)
- [ ] GDPR consent implemented (if EU traffic)

---

## 📈 Next Steps

1. ✅ Complete this integration
2. 📊 Build analytics dashboard (PROJECT 4)
3. 🎯 Set up automated reports
4. 📧 Configure abandoned cart emails
5. 🔔 Set up conversion alerts
6. 📊 A/B test different product pages

---

**You're now tracking like Shopify! 🎉**

