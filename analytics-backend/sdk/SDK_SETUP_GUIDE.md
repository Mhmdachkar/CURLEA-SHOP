# 🌐 Frontend Tracking SDK Setup Guide

This guide shows you how to integrate the Curlea Analytics SDK into your website to start tracking visitor behavior.

---

## 📦 What This SDK Does

The analytics SDK automatically tracks:
- ✅ **Visitor sessions** with device, browser, and location data
- ✅ **Page views** with scroll depth and time on page
- ✅ **Custom events** (button clicks, video plays, etc.)
- ✅ **Cart events** (add to cart, checkout, etc.)
- ✅ **Orders/Purchases** with full revenue tracking
- ✅ **UTM campaign parameters** for attribution
- ✅ **Real-time** and batched event sending

**Bundle Size**: ~8KB minified (~3KB gzipped)

---

## 🚀 Quick Start

### Step 1: Add the SDK to Your Site

Add this code to your HTML `<head>` or at the end of `<body>`:

```html
<!-- Option 1: From your own server -->
<script src="/analytics.js"></script>

<!-- Option 2: Inline (for maximum reliability) -->
<script>
  // Paste contents of analytics.js here
</script>
```

### Step 2: Initialize the SDK

After including the SDK, initialize it:

```html
<script>
  analytics.init({
    endpoint: 'https://YOUR_PROJECT.supabase.co/functions/v1/track',
    debug: false // Set to true for development
  });
</script>
```

**That's it!** The SDK will now automatically track:
- First visit
- Page views
- Scroll depth
- Time on page

---

## 🔧 Configuration Options

```javascript
analytics.init({
  endpoint: 'YOUR_API_ENDPOINT', // Required: Edge Function URL
  debug: false,                  // Optional: Enable console logs
});
```

---

## 📊 Tracking Custom Events

### Basic Event Tracking

```javascript
// Track a button click
analytics.track('ButtonClick', {
  button_name: 'Subscribe',
  page: 'Homepage'
});

// Track video play
analytics.track('VideoPlayed', {
  video_title: 'Product Demo',
  video_duration: 120
});

// Track form submission
analytics.track('FormSubmitted', {
  form_name: 'Contact Form',
  category: 'Lead Generation'
});
```

### Product View Tracking

```javascript
analytics.track('ProductViewed', {
  product_id: 'heatless-curler-1',
  product_name: 'Heatless Hair Curling Rod',
  price: 29.99,
  category: 'Hair Tools'
});
```

---

## 🛒 Tracking E-Commerce Events

### Add to Cart

```javascript
analytics.trackCart('add', {
  product_id: 'heatless-curler-1',
  title: 'Heatless Hair Curling Rod Set',
  price: 29.99,
  quantity: 1,
  variant_id: 'pink',
  variant_title: 'Pink',
  cart_total: 29.99 // Total cart value after adding
});
```

### Remove from Cart

```javascript
analytics.trackCart('remove', {
  product_id: 'heatless-curler-1',
  title: 'Heatless Hair Curling Rod Set',
  price: 29.99,
  quantity: 1,
  cart_total: 0 // New cart total
});
```

### Update Cart Quantity

```javascript
analytics.trackCart('update', {
  product_id: 'heatless-curler-1',
  title: 'Heatless Hair Curling Rod Set',
  price: 29.99,
  quantity: 2, // New quantity
  cart_total: 59.98
});
```

### Checkout Started

```javascript
analytics.trackCart('checkout_start', {
  cart_total: 59.98,
  items_count: 2
});
```

### Checkout Completed (per product)

```javascript
// Track each product in the order
analytics.trackCart('checkout_complete', {
  product_id: 'heatless-curler-1',
  title: 'Heatless Hair Curling Rod Set',
  price: 29.99,
  quantity: 2,
  total_value: 59.98,
  discount_code: 'SUMMER20',
  discount_amount: 11.99
});
```

---

## 💰 Tracking Orders/Purchases

Track completed orders with full revenue data:

```javascript
analytics.trackPurchase({
  order_id: 'ORD-12345',
  customer_email: 'customer@example.com',
  subtotal: 59.98,
  discount_total: 11.99,
  shipping_total: 5.00,
  tax_total: 4.80,
  total_value: 57.79,
  currency: 'USD',
  payment_method: 'credit_card',
  shipping_method: 'standard',
  discount_codes: ['SUMMER20'],
  items: [
    {
      product_id: 'heatless-curler-1',
      title: 'Heatless Hair Curling Rod Set',
      quantity: 2,
      price: 29.99
    }
  ],
  status: 'completed'
});
```

---

## 🎯 Integration Examples

### React Integration

```jsx
import { useEffect } from 'react';

// Initialize once when app loads
useEffect(() => {
  if (window.analytics) {
    window.analytics.init({
      endpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT,
      debug: import.meta.env.DEV
    });
  }
}, []);

// Track product view
function ProductPage({ product }) {
  useEffect(() => {
    window.analytics?.track('ProductViewed', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      category: product.category
    });
  }, [product]);

  return <div>...</div>;
}

// Track add to cart
function AddToCartButton({ product }) {
  const handleAddToCart = () => {
    // Your cart logic...
    
    // Track the event
    window.analytics?.trackCart('add', {
      product_id: product.id,
      title: product.name,
      price: product.price,
      quantity: 1,
      cart_total: getCartTotal()
    });
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
}
```

### Vanilla JavaScript

```javascript
// Track button clicks
document.querySelectorAll('[data-track-event]').forEach(button => {
  button.addEventListener('click', (e) => {
    const eventName = e.target.dataset.trackEvent;
    const eventData = JSON.parse(e.target.dataset.trackData || '{}');
    analytics.track(eventName, eventData);
  });
});

// Example button
<button 
  data-track-event="NewsletterSignup"
  data-track-data='{"source": "footer"}'>
  Subscribe
</button>
```

### Shopify Integration

```liquid
<!-- In theme.liquid -->
<script src="{{ 'analytics.js' | asset_url }}"></script>
<script>
  analytics.init({
    endpoint: '{{ settings.analytics_endpoint }}',
    debug: false
  });
</script>

<!-- In product.liquid -->
<script>
  analytics.track('ProductViewed', {
    product_id: '{{ product.id }}',
    product_name: '{{ product.title }}',
    price: {{ product.price | money_without_currency }},
    category: '{{ product.type }}'
  });
</script>

<!-- In cart template when adding product -->
<script>
  document.querySelector('.add-to-cart-btn').addEventListener('click', function() {
    analytics.trackCart('add', {
      product_id: '{{ product.id }}',
      title: '{{ product.title }}',
      price: {{ product.price | money_without_currency }},
      quantity: parseInt(document.querySelector('[name="quantity"]').value),
      variant_id: '{{ product.selected_or_first_available_variant.id }}',
      variant_title: '{{ product.selected_or_first_available_variant.title }}'
    });
  });
</script>
```

---

## 🔍 Advanced Usage

### Manual Session Control

```javascript
// Get current session ID
const sessionId = analytics.getSessionId();
console.log('Current session:', sessionId);

// Reset session (for testing)
analytics.reset();
```

### Manual Event Flushing

```javascript
// Manually send queued events immediately
analytics.flush();
```

### Check SDK Version

```javascript
console.log('Analytics SDK version:', analytics.version);
```

---

## 🎨 Integration with Your Curlea Site

For your specific Curlea Luxe site, here's how to integrate:

### 1. Add to `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- ... other head content ... -->
  
  <!-- Analytics SDK -->
  <script src="/analytics.js"></script>
</head>
<body>
  <!-- ... your app ... -->
  
  <script>
    // Initialize analytics
    analytics.init({
      endpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT || 'https://YOUR_PROJECT.supabase.co/functions/v1/track',
      debug: import.meta.env.DEV
    });
  </script>
</body>
</html>
```

### 2. Track Product Views in `ProductDetailPage.tsx`

```tsx
useEffect(() => {
  window.analytics?.track('ProductViewed', {
    product_id: product.id,
    product_name: product.name,
    price: product.price,
    category: product.category
  });
}, [product]);
```

### 3. Track Cart Events (when you implement cart)

```tsx
const handleAddToCart = (product: Product) => {
  // Your add to cart logic
  
  // Track the event
  window.analytics?.trackCart('add', {
    product_id: product.id,
    title: product.name,
    price: product.price,
    quantity: 1,
    cart_total: calculateCartTotal()
  });
};
```

### 4. Track Checkout (when implemented)

```tsx
const handleCheckout = (orderData) => {
  // Your checkout logic
  
  // Track the purchase
  window.analytics?.trackPurchase({
    order_id: orderData.id,
    total_value: orderData.total,
    items: orderData.items,
    // ... other fields
  });
};
```

---

## 🐛 Debugging

### Enable Debug Mode

```javascript
analytics.init({
  endpoint: 'YOUR_ENDPOINT',
  debug: true // See all events in console
});
```

### Check Event Queue

Open browser console and look for:
```
[Curlea Analytics] Event queued: {...}
[Curlea Analytics] Flushing queue: 5 events
[Curlea Analytics] Event sent successfully: {...}
```

### Common Issues

**Issue**: "Analytics not initialized"
**Solution**: Make sure you call `analytics.init()` before tracking events

**Issue**: Events not showing in database
**Solution**: 
1. Check that your endpoint URL is correct
2. Verify your Edge Function is deployed (next step)
3. Check browser console for errors
4. Enable debug mode to see what's being sent

**Issue**: "API endpoint not configured"
**Solution**: Pass `endpoint` in the `init()` call

---

## 📱 Mobile Considerations

The SDK automatically handles:
- ✅ Touch events
- ✅ Mobile device detection
- ✅ Network failures with retry logic
- ✅ Page visibility changes
- ✅ Low-bandwidth batching

---

## 🔒 Privacy & GDPR

### Cookie-Free Tracking

The SDK uses **localStorage** for session tracking, not cookies. This is generally more privacy-friendly, but you should still:

1. Add to your privacy policy
2. Consider getting consent in EU markets
3. Provide opt-out mechanism

### Opt-Out Implementation

```javascript
// Check for user consent
const hasConsent = localStorage.getItem('analytics_consent');

if (hasConsent === 'true') {
  analytics.init({ endpoint: 'YOUR_ENDPOINT' });
} else {
  // Show consent banner
  showConsentBanner((accepted) => {
    if (accepted) {
      localStorage.setItem('analytics_consent', 'true');
      analytics.init({ endpoint: 'YOUR_ENDPOINT' });
    }
  });
}
```

---

## 📈 What Gets Tracked Automatically

Once initialized, the SDK automatically tracks:

| Event | Data Collected |
|-------|----------------|
| **Visit** | Device type, browser, OS, location, referrer, UTM params |
| **Page View** | URL, title, scroll depth, time on page |
| **Session** | 30-minute timeout, auto-renewed on activity |

---

## ⚡ Performance

- **Async**: All tracking is non-blocking
- **Batched**: Events sent in batches every 5 seconds
- **Retry Logic**: Failed events retry up to 3 times
- **Lightweight**: ~8KB minified, loads fast
- **No Dependencies**: Pure vanilla JavaScript

---

## 🔄 Next Steps

✅ **SDK Created**: Complete!  
⚙️ **Next**: Set up Edge Functions to receive events (PROJECT 3)  
📊 **Then**: Build the analytics dashboard (PROJECT 4)

---

## 📚 API Reference

### `analytics.init(config)`
Initialize the SDK
- `config.endpoint` (required): API endpoint URL
- `config.debug` (optional): Enable debug logging

### `analytics.track(eventName, eventData)`
Track custom event
- `eventName` (string): Name of the event
- `eventData` (object): Additional data

### `analytics.trackCart(eventType, productData)`
Track cart event
- `eventType`: 'add' | 'remove' | 'update' | 'checkout_start' | 'checkout_complete'
- `productData` (object): Product information

### `analytics.trackPurchase(orderData)`
Track purchase/order
- `orderData` (object): Order information

### `analytics.getSessionId()`
Get current session ID

### `analytics.flush()`
Manually flush event queue

### `analytics.reset()`
Reset session (for testing)

---

**You're now ready to start tracking! 🎉**

