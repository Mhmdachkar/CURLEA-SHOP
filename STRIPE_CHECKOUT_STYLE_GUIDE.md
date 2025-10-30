# Stripe Hosted Checkout - Frontend Style Implementation Guide

## Overview
This project uses **Stripe Hosted Checkout** (the recommended Stripe payment flow). Users click "Checkout" on your site and are redirected to Stripe's secure hosted payment page.

**What you style:** Everything BEFORE the redirect (cart UI, product display, checkout buttons)
**What Stripe styles:** The actual payment form (handled by Stripe's secure page)

This guide gives you the EXACT styling to match Stripe's checkout aesthetic for your pre-checkout UI.

---

## 1. Theme Colors & Brand Identity

### Primary Theme Colors (from Index.tsx)
```javascript
const THEME_PRIMARY = '#A4193D';    // Deep Rose/Primary
const THEME_ACCENT = '#FFDFB9';     // Peach/Cream
const THEME_GOLD = '#D4AF37';       // Luxury Gold
```

### CSS Variables (from src/index.css)
```css
:root {
  /* Primary Brand */
  --primary: 260 45% 35%;           /* Purple hue */
  --primary-foreground: 43 74% 88%; /* Gold foreground */
  
  /* Gold Accents */
  --gold: 43 74% 66%;
  --gold-light: 43 74% 78%;
  --gold-dark: 43 74% 54%;
  
  /* Rose Tones */
  --rose: 340 82% 75%;
  --rose-light: 340 82% 85%;
  --rose-muted: 340 35% 85%;
  
  /* Cream Backgrounds */
  --cream: 43 45% 92%;
  --cream-dark: 43 35% 88%;
  
  /* Background */
  --background: 249 248% 99%;       /* Off-white */
  
  /* Border */
  --border: 43 25% 90%;             /* Light gold border */
}
```

---

## 2. Shopping Cart Component Styles

### Cart Container
- **Background**: `bg-background` (off-white)
- **Border**: `border-gold` (luxury gold accent)
- **Width**: 
  - Mobile: `w-full`
  - Desktop: `sm:w-96` (384px)
- **Position**: Fixed slide-in from right (using Sheet component)

### Cart Header
```tsx
<SheetHeader>
  <SheetTitle className="flex items-center gap-2 gradient-text">
    <CartIcon className="h-5 w-5" />
    Shopping Cart
  </SheetTitle>
</SheetHeader>
```

### Cart Item Styling
```tsx
<div className="flex items-center gap-3 p-3 bg-cream rounded-lg border border-gold">
  {/* Product Image */}
  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
    <img src={item.image_url} alt={item.product_name} 
         className="w-full h-full object-cover" />
  </div>
  
  {/* Product Info */}
  <div className="flex-1 min-w-0">
    <h4 className="font-semibold text-sm text-primary truncate">
      {item.product_name}
    </h4>
    <p className="text-xs text-muted-foreground">
      Variant: {item.variant}
    </p>
    <p className="text-sm font-bold text-primary">
      {getCurrencySymbol(item.currency)} {item.price}
    </p>
  </div>
  
  {/* Quantity Controls */}
  <div className="flex items-center gap-2">
    {/* Minus/Plus buttons with gold hover */}
    <Button variant="ghost" 
            className="h-6 w-6 hover:bg-gold hover:text-primary">
      <Minus className="h-3 w-3" />
    </Button>
    <span className="min-w-[2rem] text-center text-sm font-semibold">
      {item.quantity}
    </span>
    <Button variant="ghost" 
            className="h-6 w-6 hover:bg-gold hover:text-primary">
      <Plus className="h-3 w-3" />
    </Button>
  </div>
  
  {/* Remove Button */}
  <Button variant="ghost" 
          className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground">
    <Trash2 className="h-3 w-3" />
  </Button>
</div>
```

### Guest Checkout Banner
```tsx
{!user && (
  <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded-lg border border-blue-200">
    <div className="text-center">
      <p className="text-xs font-semibold text-blue-800">
        💡 Quick Checkout Available!
      </p>
      <p className="text-xs text-blue-600">
        Continue as guest or sign in for member benefits
      </p>
    </div>
  </div>
)}
```

---

## 3. Checkout Button Styles

### Main Checkout Button (from CheckoutButton.tsx)
```tsx
<Button
  onClick={handleCheckout}
  disabled={loading || cartItems.length === 0}
  className={`relative overflow-hidden group ${className}`}
>
  {/* Loading Spinner or Credit Card Icon */}
  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {!loading && <CreditCard className="mr-2 h-4 w-4" />}
  
  {/* Shimmer Effect Overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
  
  {/* Button Text */}
  <span className="relative z-10">
    {loading ? 'Processing...' : 
      cartItems.length > 0 
        ? `Secure Checkout - ${getCurrencySymbol(currency)}${getTotalAmount().toFixed(2)} (${cartCount} items)`
        : 'Secure Checkout'
    }
  </span>
</Button>
```

### Button Variants

#### Primary Checkout Button (as used in cart)
```css
/* Applied via className prop */
.className="w-full bg-gradient-luxury hover:bg-gradient-hero text-primary-foreground py-3"
```

**CSS Classes:**
- `bg-gradient-luxury`: Linear gradient from primary to gold
- `hover:bg-gradient-hero`: Enhanced gradient on hover
- `text-primary-foreground`: Gold text color
- `w-full`: Full width of container
- `py-3`: Vertical padding

#### Button Gradients (defined in CSS)
```css
/* From src/index.css */
--gradient-luxury: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--gold)));
--gradient-hero: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-light)) 50%, hsl(var(--gold)) 100%);
```

---

## 4. Typography & Text Styling

### Headings
```css
/* Product names in cart */
font-semibold text-sm text-primary

/* Cart title */
gradient-text /* applies luxury gradient to text */

/* Prices */
font-bold text-sm text-primary
```

### Text Colors
- **Primary Text**: `text-primary` (#A4193D / Purple)
- **Muted Text**: `text-muted-foreground` (gray tones)
- **Gold Text**: Applied via inline styles or `text-gold`
- **White/Gold Foreground**: `text-primary-foreground` (gold)

### Font Families
- **Body**: `font-sans` (Inter, Segoe UI, etc.)
- **Display Headings**: `font-bold` (used for cart titles)
- **Regular Text**: Default or `font-normal`

---

## 5. Animations & Transitions

### Key Animations
```css
/* From src/index.css */

/* Shimmer effect on buttons */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Pulse glow */
@keyframes pulseGlow {
  0%, 100% { 
    box-shadow: 0 0 20px hsl(var(--primary) / 0.3), 0 0 40px hsl(var(--gold) / 0.2);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 40px hsl(var(--primary) / 0.5), 0 0 80px hsl(var(--gold) / 0.4);
    transform: scale(1.02);
  }
}

/* Fade in up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Applied Animations
```css
/* Cart badge */
animate-pulse-glow

/* Buttons hover */
transition-transform duration-1000

/* Loading spinner */
animate-spin

/* Shimmer on hover */
group-hover:translate-x-full (on overlay element)
```

---

## 6. Layout & Spacing

### Container Spacing
```css
/* Cart items container */
space-y-3           /* vertical spacing between items */
max-h-96            /* max height with scroll */
overflow-y-auto     /* vertical scroll if needed */

/* Padding inside cart */
mt-6                /* top margin */

/* Bottom section (total + checkout button) */
pt-4                /* padding top */
border-t            /* top border */
border-gold         /* border color */
space-y-3           /* vertical spacing */
```

### Responsive Breakpoints
```css
/* From tailwind.config.ts */
xs: 475px    /* extra small */
sm: 640px    /* small */
md: 768px    /* medium */
lg: 1024px   /* large */
xl: 1280px   /* extra large */
2xl: 1400px  /* 2x extra large */
```

---

## 7. Cart Badge (Item Count)

```tsx
{cartCount > 0 && (
  <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-gradient-rose text-white text-xs animate-pulse-glow">
    {cartCount}
  </Badge>
)}
```

**Styling:**
- Position: Absolute, top-right of cart button
- Background: `bg-gradient-rose` (rose gradient)
- Text: White
- Animation: `animate-pulse-glow` (pulsing glow effect)
- Shape: Circular (`rounded-full`)
- Size: `h-6 w-6` (24px)

---

## 8. Icons

Used from `lucide-react`:

```tsx
import { 
  ShoppingCart as CartIcon,  // Main cart icon
  Trash2,                     // Remove item
  Plus,                       // Increment quantity
  Minus,                      // Decrement quantity
  CreditCard,                 // Checkout button icon
  Loader2                     // Loading spinner
} from 'lucide-react';
```

**Icon Sizes:**
- Cart button: `h-6 w-6` (24px)
- Header: `h-5 w-5` (20px)
- Quantity controls: `h-3 w-3` (12px)
- Checkout button: `h-4 w-4` (16px)

---

## 9. Shadows & Elevation

```css
/* Card/elevation effects */
/* From CSS variables */
--shadow-luxury: 0 25px 50px -12px hsl(var(--primary) / 0.25);
--shadow-gold: 0 10px 40px -10px hsl(var(--gold) / 0.3);
--shadow-glow: 0 0 30px hsl(var(--primary-glow) / 0.4);
--shadow-soft: 0 4px 20px hsl(var(--primary) / 0.1);
```

---

## 10. Stripe Hosted Checkout Integration

### How Stripe Hosted Checkout Works

1. **User adds items to cart** → Your styled cart UI (this guide)
2. **User clicks "Checkout"** → Your styled button with loading state
3. **Backend creates Stripe session** → API call to create checkout
4. **Redirect to Stripe** → User goes to Stripe's secure page (Stripe's styling)
5. **User completes payment** → On Stripe's page
6. **Redirect back** → To your success/cancel page

**Key Point:** Your frontend styling only needs to cover steps 1-2!

### Stripe Checkout Session Configuration

Here's the exact configuration used in this project (from create-checkout/index.ts):

```javascript
const sessionConfig = {
  payment_method_types: ['card'],
  line_items: lineItems,
  mode: 'payment',
  success_url: `${window.location.origin}/success`,
  cancel_url: `${window.location.origin}/`,
  
  // Address Collection
  billing_address_collection: 'required',
  shipping_address_collection: {
    allowed_countries: [
      'US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'AU', 'NZ',
      'NL', 'BE', 'CH', 'AT', 'DK', 'FI', 'IE', 'LU', 'NO',
      'PL', 'PT', 'SE', 'AE', 'SA', 'QA', 'KW', 'BH', 'OM'
    ]
  },
  phone_number_collection: { enabled: true },
  
  // Customer
  customer_creation: 'always',
  
  // Metadata (optional but recommended)
  metadata: {
    order_id: order.id,
    currency: currency,
    is_guest: isGuest.toString(),
    total_amount: totalAmount.toString(),
    items_count: cartItems.length.toString()
  }
};

const session = await stripe.checkout.sessions.create(sessionConfig);
// Redirect to session.url
```

### Recommended Stripe Dashboard Branding

To match your frontend style in the Stripe hosted page:

**Settings → Branding → Appearance:**
- **Accent Color**: `#A4193D` (Deep Rose - Primary)
- **Accent Text Color**: `#FFDFB9` (Peach - Accent)
- **Background Color**: `#FDF8F4` (Off-white - Background)
- **Button Style**: Rounded
- **Logo**: Upload your brand logo

**This ensures seamless visual transition from your cart to Stripe's checkout!**

### Complete Flow Example

```javascript
// 1. User clicks checkout button in your styled cart
const handleCheckout = async () => {
  setIsLoading(true);
  
  try {
    // 2. Call your backend to create Stripe session
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems,
        currency: 'USD',
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/`
      })
    });
    
    const { url } = await response.json();
    
    // 3. Redirect to Stripe's hosted page
    if (url) {
      window.location.href = url;
    }
  } catch (error) {
    console.error('Checkout error:', error);
    setIsLoading(false);
  }
};
```

### Success Page Styling (After Payment)

After payment, Stripe redirects to your success page. Style it to match:

```jsx
// src/pages/Success.tsx
export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="cart-container max-w-md text-center animate-fade-in-up">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" 
             style={{ background: 'var(--gradient-gold)' }}>
          <CheckCircle className="w-10 h-10" color="white" />
        </div>
        <h1 className="text-3xl font-bold mb-4 gradient-text">
          Payment Successful!
        </h1>
        <p className="text-muted-foreground mb-6">
          Thank you for your purchase. Your order is being processed.
        </p>
        <button 
          className="checkout-btn"
          onClick={() => window.location.href = '/'}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
```

---

## 11. Complete Example Implementation

### Minimal Checkout UI Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shopping Cart - Stripe Checkout</title>
  <style>
    :root {
      --primary: #A4193D;
      --accent: #FFDFB9;
      --gold: #D4AF37;
      --background: #FDF8F4;
      --cream: #F5E6D3;
      --rose-gradient: linear-gradient(135deg, #FF6B9D, #FFB347);
      --luxury-gradient: linear-gradient(135deg, #A4193D, #D4AF37);
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: var(--background);
      color: var(--primary);
      min-height: 100vh;
      padding: 2rem;
    }
    
    .cart-container {
      max-width: 500px;
      margin: 0 auto;
      background: white;
      border: 2px solid var(--gold);
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 25px 50px -12px rgba(164, 25, 61, 0.25);
    }
    
    .cart-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
      font-weight: bold;
      background: var(--luxury-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .cart-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--cream);
      border: 1px solid var(--gold);
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .cart-item img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 0.5rem;
    }
    
    .cart-item-info {
      flex: 1;
      min-width: 0;
    }
    
    .cart-item-title {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--primary);
      margin-bottom: 0.25rem;
    }
    
    .cart-item-variant {
      font-size: 0.75rem;
      color: #666;
      margin-bottom: 0.5rem;
    }
    
    .cart-item-price {
      font-weight: bold;
      color: var(--primary);
    }
    
    .cart-quantity {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .quantity-btn {
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 0.25rem;
      transition: all 0.2s;
    }
    
    .quantity-btn:hover {
      background: var(--gold);
      color: var(--primary);
    }
    
    .checkout-btn {
      width: 100%;
      padding: 1rem 2rem;
      background: var(--luxury-gradient);
      color: white;
      border: none;
      border-radius: 3rem;
      font-size: 1.125rem;
      font-weight: bold;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s;
      box-shadow: 0 10px 30px rgba(164, 25, 61, 0.3);
    }
    
    .checkout-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(164, 25, 61, 0.4);
    }
    
    .checkout-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }
    
    .checkout-btn:hover::before {
      left: 100%;
    }
    
    .checkout-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .guest-banner {
      background: linear-gradient(to right, #dbeafe, #dcfce7);
      padding: 1rem;
      border-radius: 0.5rem;
      border: 1px solid #93c5fd;
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .guest-banner-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 0.25rem;
    }
    
    .guest-banner-text {
      font-size: 0.75rem;
      color: #2563eb;
    }
    
    @keyframes pulseGlow {
      0%, 100% {
        box-shadow: 0 0 20px rgba(164, 25, 61, 0.3), 0 0 40px rgba(212, 175, 55, 0.2);
      }
      50% {
        box-shadow: 0 0 40px rgba(164, 25, 61, 0.5), 0 0 80px rgba(212, 175, 55, 0.4);
      }
    }
    
    .animate-pulse-glow {
      animation: pulseGlow 2s ease-in-out infinite;
    }
  </style>
</head>
<body>
  <div class="cart-container">
    <div class="cart-header">
      🛒 Shopping Cart
    </div>
    
    <div id="cart-items">
      <!-- Cart items will be dynamically inserted here -->
      <div class="cart-item">
        <img src="/product.jpg" alt="Product">
        <div class="cart-item-info">
          <div class="cart-item-title">Champagne Beaute Lift</div>
          <div class="cart-item-variant">Single Package</div>
          <div class="cart-item-price">$22.99</div>
        </div>
        <div class="cart-quantity">
          <button class="quantity-btn">-</button>
          <span>1</span>
          <button class="quantity-btn">+</button>
        </div>
      </div>
    </div>
    
    <div id="guest-banner" class="guest-banner">
      <div class="guest-banner-title">💡 Quick Checkout Available!</div>
      <div class="guest-banner-text">Continue as guest or sign in for member benefits</div>
    </div>
    
    <button class="checkout-btn" onclick="handleCheckout()">
      Secure Checkout - $22.99 (1 item)
    </button>
  </div>
  
  <script>
    function handleCheckout() {
      // Redirect to your Stripe Checkout endpoint
      window.location.href = '/api/checkout';
    }
  </script>
</body>
</html>
```

---

## 12. Key Takeaways for Implementation

### Essential Elements:
1. **Color Palette**: Deep Rose (#A4193D), Peach (#FFDFB9), Gold (#D4AF37)
2. **Gradients**: Luxury gradient (primary → gold) for buttons
3. **Animations**: Shimmer effects, pulse glow, fade transitions
4. **Typography**: Inter font family with bold headings
5. **Borders**: Gold accent borders on interactive elements
6. **Spacing**: Generous padding and gap spacing
7. **Icons**: From Lucide React library
8. **Responsive**: Mobile-first approach with breakpoints

### Button Interaction:
- Hover states with translateY transform
- Shimmer overlay animation on hover
- Gradient backgrounds
- Shadow elevation
- Loading states with spinner

### Cart Design:
- Cream/beige background for items
- Gold borders for luxury feel
- Compact layout with images
- Quantity controls with +/- buttons
- Remove functionality

This completes the frontend checkout style guide. The actual payment form is handled by Stripe's hosted checkout page.

