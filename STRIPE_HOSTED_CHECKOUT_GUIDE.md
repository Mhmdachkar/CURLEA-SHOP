# Stripe Hosted Checkout - Complete Implementation Guide

## What is Stripe Hosted Checkout?

**Stripe Hosted Checkout** is Stripe's secure, PCI-compliant checkout page that you redirect users to. This is the **recommended approach** because:

✅ Stripe handles all security and PCI compliance  
✅ Stripe handles the payment form UI  
✅ You only need to style YOUR cart UI  
✅ Automatic mobile optimization  
✅ Support for multiple payment methods  

---

## The Flow

### What Happens:

1. **User adds items to cart** → Your beautiful cart UI (YOU style this)
2. **User clicks "Checkout" button** → Your styled button (YOU style this)
3. **Backend creates Stripe session** → API call
4. **Redirect to Stripe** → User sees Stripe's secure page (STRIPE styles this)
5. **User enters payment info** → On Stripe's page
6. **Payment processed** → By Stripe
7. **Redirect back to your site** → Success or cancel page (YOU style this)

### What You Need to Style:

```
┌─────────────────────────────────┐
│  YOUR CART PAGE (YOU STYLE)    │
│  - Product list                 │
│  - Total calculation            │
│  - Checkout button              │
└────────┬────────────────────────┘
         │
         │ Click "Checkout"
         ↓
┌─────────────────────────────────┐
│  YOUR LOADING STATE (OPTIONAL) │
└────────┬────────────────────────┘
         │
         │ Redirect
         ↓
┌─────────────────────────────────┐
│  STRIPE CHECKOUT PAGE           │
│  (STRIPE STYLES THIS)           │
│  - Payment form                 │
│  - Card input                   │
│  - Address collection           │
└────────┬────────────────────────┘
         │
         │ After payment
         ↓
┌─────────────────────────────────┐
│  YOUR SUCCESS PAGE (YOU STYLE) │
└─────────────────────────────────┘
```

**Key Insight:** You only style YOUR parts (cart UI, checkout button, success page). Stripe handles the payment form.

---

## Quick Implementation

### Step 1: Add Styles to Your Project

```bash
# Copy the CSS file
cp checkout-styles.css your-project/styles/
```

```html
<!-- Link in your HTML -->
<link rel="stylesheet" href="styles/checkout-styles.css">
```

### Step 2: Create Cart UI

Use the HTML structure from `checkout-example.html` or React components from `CheckoutComponents.jsx`.

### Step 3: Add Checkout Button

```html
<button class="checkout-btn" onclick="handleCheckout()">
  <i data-feather="credit-card"></i>
  <span>Secure Checkout - $99.99</span>
</button>
```

### Step 4: Implement Checkout Handler

```javascript
async function handleCheckout() {
  // Show loading state
  const button = document.querySelector('.checkout-btn');
  button.disabled = true;
  button.innerHTML = '<span>Processing...</span>';
  
  try {
    // Call your backend to create Stripe session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems: cartItems,
        currency: 'USD'
      })
    });
    
    const { url } = await response.json();
    
    // Redirect to Stripe
    if (url) {
      window.location.href = url;
    }
  } catch (error) {
    console.error('Checkout error:', error);
    // Re-enable button, show error
    button.disabled = false;
    button.innerHTML = '<span>Try Again</span>';
  }
}
```

### Step 5: Backend Stripe Session Creation

```javascript
// Node.js/Express example
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-checkout-session', async (req, res) => {
  const { cartItems, currency = 'USD' } = req.body;
  
  try {
    // Convert cart items to Stripe line items
    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: item.product_name,
          images: [item.image_url],
        },
        unit_amount: Math.round(parseFloat(item.price) * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/`,
      
      // Collect addresses
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'AU', 'NZ'],
      },
      
      // Collect phone
      phone_number_collection: { enabled: true },
      
      // Always create customer
      customer_creation: 'always',
    });
    
    // Return session URL
    res.json({ 
      sessionId: session.id, 
      url: session.url 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## Branding Stripe's Checkout Page

While Stripe hosts the payment page, you CAN customize it to match your brand.

### Stripe Dashboard Settings

1. Go to https://dashboard.stripe.com
2. Navigate to **Settings → Branding → Appearance**
3. Configure:

```
Accent Color:        #A4193D (Deep Rose)
Accent Text Color:   #FFDFB9 (Peach)
Background Color:    #FDF8F4 (Off-white)
Logo:               Upload your logo
```

This creates a seamless visual transition from your cart to their checkout.

---

## Complete Code Example

### HTML/JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="checkout-styles.css">
  <script src="https://unpkg.com/feather-icons"></script>
</head>
<body>
  
  <!-- Cart Button -->
  <button onclick="openCart()" class="cart-button">
    <i data-feather="shopping-cart"></i>
    <span class="cart-badge">3</span>
  </button>
  
  <!-- Cart Modal -->
  <div id="cart-modal" class="cart-container" style="display:none;">
    <h2 class="cart-header gradient-text">
      <i data-feather="shopping-cart"></i>
      Shopping Cart
    </h2>
    
    <div class="cart-items" id="cart-items">
      <!-- Items will be dynamically inserted -->
    </div>
    
    <div class="cart-bottom">
      <div class="guest-banner">
        <div class="guest-banner-title">💡 Quick Checkout Available!</div>
        <div class="guest-banner-text">Continue as guest</div>
      </div>
      
      <button class="checkout-btn" onclick="checkout()">
        <i data-feather="credit-card"></i>
        <span>Secure Checkout - $99.99 (3 items)</span>
      </button>
    </div>
  </div>
  
  <script>
    // Sample cart data
    let cartItems = [
      { id: 1, name: 'Product 1', price: 29.99, quantity: 1, image: 'product1.jpg' },
      { id: 2, name: 'Product 2', price: 39.99, quantity: 2, image: 'product2.jpg' }
    ];
    
    function openCart() {
      document.getElementById('cart-modal').style.display = 'block';
      renderCart();
    }
    
    function renderCart() {
      const container = document.getElementById('cart-items');
      container.innerHTML = cartItems.map(item => `
        <div class="cart-item">
          <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-info">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-price">$${item.price}</div>
          </div>
        </div>
      `).join('');
    }
    
    async function checkout() {
      const button = document.querySelector('.checkout-btn');
      button.disabled = true;
      button.innerHTML = '<span>Processing...</span>';
      
      try {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartItems, currency: 'USD' })
        });
        
        const { url } = await response.json();
        window.location.href = url; // Redirect to Stripe
      } catch (error) {
        console.error('Error:', error);
        button.disabled = false;
        button.innerHTML = '<span>Try Again</span>';
      }
    }
    
    feather.replace();
  </script>
  
</body>
</html>
```

---

## React Implementation

```jsx
import { useState } from 'react';
import { ShoppingCart, CheckoutButton } from './CheckoutComponents';
import './checkout-styles.css';

function App() {
  const [cartItems, setCartItems] = useState([
    { id: 1, product_name: 'Product 1', price: '29.99', quantity: 1, image_url: 'product1.jpg' }
  ]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems, currency: 'USD' })
      });
      
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };
  
  return (
    <>
      <button onClick={() => setCartOpen(true)}>
        Open Cart
      </button>
      
      <ShoppingCart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onCheckout={handleCheckout}
        isLoading={loading}
      />
    </>
  );
}
```

---

## Testing

### Test Card Numbers (Stripe Test Mode)

```
Visa:        4242 4242 4242 4242
Visa Debit:  4000 0566 5566 5556
Mastercard:  5555 5555 5555 4444
AMEX:        378282246310005
```

Any expiry date in the future  
Any 3-digit CVC  
Any ZIP code  

---

## Key Differences from Custom Checkout

| Stripe Hosted Checkout | Custom Checkout |
|------------------------|-----------------|
| ✅ Secure by default | ⚠️ You handle PCI compliance |
| ✅ Stripe handles UI | ⚠️ You build payment form |
| ✅ Mobile optimized | ⚠️ You optimize mobile |
| ✅ Multiple payment methods | ⚠️ Limited options |
| ✅ Better conversion rates | ⚠️ Lower conversion |
| ✅ Easier implementation | ⚠️ More complex |

**Recommendation:** Use Stripe Hosted Checkout unless you have specific customization needs.

---

## Summary

1. ✅ Style YOUR cart UI with the provided CSS
2. ✅ Add checkout button with loading state
3. ✅ Call backend API to create Stripe session
4. ✅ Redirect to Stripe's URL
5. ✅ Stripe handles payment
6. ✅ User redirects back to your site

**That's it!** You get secure, beautiful checkout with minimal effort.

---

## Files to Use

1. **checkout-styles.css** - Complete styling
2. **checkout-example.html** - Working example
3. **CheckoutComponents.jsx** - React components
4. **STRIPE_CHECKOUT_STYLE_GUIDE.md** - Full documentation

Need help? Check the implementation guide or example files!

