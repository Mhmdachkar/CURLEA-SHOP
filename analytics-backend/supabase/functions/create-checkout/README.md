# Stripe Checkout Edge Functions

Complete Stripe Hosted Checkout backend implementation for Supabase Edge Functions.

## 📋 Overview

This directory contains two Edge Functions:

1. **create-checkout** - Creates Stripe Checkout sessions and saves orders
2. **stripe-webhook** - Handles Stripe webhook events and updates order status

---

## 🚀 Deployment Instructions

### Prerequisites

- Supabase CLI installed: `npm install -g supabase`
- Logged in to Supabase: `supabase login`
- Linked to your project: `supabase link --project-ref YOUR_PROJECT_REF`
- Stripe account with API keys

### Step 1: Set Up Database

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **"New Query"**
4. Copy and paste contents of `orders-schema.sql`
5. Click **"Run"**

This creates:
- `orders` table
- `order_items` table
- Indexes for performance
- Row Level Security (RLS) policies

### Step 2: Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **"Developers"** → **"API keys"**
3. Copy your **Secret key**:
   - Development: `sk_test_...`
   - Production: `sk_live_...`

4. For Webhooks:
   - Click **"Developers"** → **"Webhooks"**
   - Click **"Add endpoint"**
   - Copy the **Signing secret**: `whsec_...`

### Step 3: Set Environment Variables

Deploy the functions with environment variables:

```bash
# Deploy create-checkout function
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your_anon_key_here
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Deploy stripe-webhook function
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Note:** These secrets are automatically available to all edge functions.

### Step 4: Deploy Functions

From the `analytics-backend` directory:

```bash
# Deploy create-checkout
supabase functions deploy create-checkout

# Deploy stripe-webhook
supabase functions deploy stripe-webhook
```

### Step 5: Configure Stripe Webhook

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Set the endpoint URL:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `payment_intent.succeeded` (optional)
   - `payment_intent.payment_failed` (optional)
5. Click **"Add endpoint"**
6. Copy the **Signing secret** and update your environment:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_new_secret_here
   ```

---

## 🧪 Testing

### Test create-checkout Locally

```bash
# Start local Supabase
supabase start

# Run function locally
cd supabase/functions/create-checkout
deno task start

# Test with cURL
curl -X POST http://localhost:54321/functions/v1/create-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "cartItems": [
      {
        "id": 1,
        "product_name": "Test Product",
        "variant": "Default",
        "quantity": 1,
        "price": "19.99",
        "currency": "USD",
        "image_url": "https://example.com/image.jpg"
      }
    ],
    "currency": "USD",
    "successUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/",
    "isGuest": true
  }'
```

### Test stripe-webhook Locally

```bash
# Use Stripe CLI to forward webhooks
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# Trigger a test webhook
stripe trigger checkout.session.completed
```

### Test with Stripe Test Cards

Use these in Stripe Test Mode:

- **Visa**: `4242 4242 4242 4242`
- **Mastercard**: `5555 5555 5555 4444`
- **AMEX**: `3782 822463 10005`

Any future expiry, any CVC, any ZIP.

---

## 📁 Function Details

### create-checkout

**Endpoint:** `POST /functions/v1/create-checkout`

**Request:**
```json
{
  "cartItems": [
    {
      "id": 1,
      "product_name": "Product Name",
      "variant": "Variant Name",
      "quantity": 1,
      "price": "19.99",
      "currency": "USD",
      "image_url": "/products/image.jpg"
    }
  ],
  "currency": "USD",
  "successUrl": "https://yoursite.com/success",
  "cancelUrl": "https://yoursite.com/",
  "isGuest": true
}
```

**Response:**
```json
{
  "sessionId": "cs_test_abc123...",
  "url": "https://checkout.stripe.com/..."
}
```

**What it does:**
1. Validates cart items
2. Parses prices (handles multiple formats)
3. Calculates total
4. Creates absolute image URLs
5. Generates unique order number
6. Creates order in database (status: pending)
7. Creates order items
8. Creates Stripe checkout session
9. Links order to session
10. Returns session URL

### stripe-webhook

**Endpoint:** `POST /functions/v1/stripe-webhook`

**Stripe Configuration:**
- Receives webhook events from Stripe
- Verifies signature using webhook secret
- Updates order status based on event type

**Events Handled:**
- `checkout.session.completed` → status: completed
- `checkout.session.async_payment_succeeded` → status: completed
- `checkout.session.async_payment_failed` → status: failed
- `payment_intent.succeeded` → logged
- `payment_intent.payment_failed` → logged

---

## 🔧 Environment Variables

Required environment variables (set with `supabase secrets set`):

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `STRIPE_SECRET_KEY` | Stripe secret key | Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Stripe Dashboard → Webhooks |
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings |
| `SUPABASE_ANON_KEY` | Anonymous key | Supabase Dashboard → Settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Supabase Dashboard → Settings |

**Note:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are automatically provided by Supabase Edge Functions. You only need to set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.

---

## 📊 Database Schema

### orders Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_number | TEXT | Unique identifier (AU-20250120-123456789) |
| user_id | UUID | Reference to auth.users (nullable) |
| total_amount | DECIMAL | Order total |
| currency | TEXT | Currency code (USD, EUR, etc.) |
| status | TEXT | pending, completed, failed |
| customer_email | TEXT | Customer email |
| is_guest | BOOLEAN | Guest checkout flag |
| stripe_session_id | TEXT | Stripe checkout session ID |
| billing_address | JSONB | Billing address from Stripe |
| shipping_address | JSONB | Shipping address from Stripe |
| created_at | TIMESTAMP | Order creation time |
| updated_at | TIMESTAMP | Last update time |

### order_items Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | Foreign key to orders |
| product_name | TEXT | Product name |
| variant | TEXT | Product variant |
| quantity | INTEGER | Item quantity |
| unit_price | DECIMAL | Price per unit |
| total_price | DECIMAL | Total for this item |
| image_url | TEXT | Product image URL |
| created_at | TIMESTAMP | Creation time |

---

## 🐛 Troubleshooting

### Issue: "Stripe secret key not found"

**Solution:** Set the environment variable:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key
```

### Issue: "Webhook signature verification failed"

**Solution:** 
1. Verify webhook secret is correct
2. Ensure you're using the correct webhook secret for your environment (test vs live)
3. Check that the endpoint URL in Stripe matches your deployed function

### Issue: "Failed to create order"

**Solution:**
1. Verify database schema is deployed
2. Check that tables exist in Supabase Dashboard
3. Ensure RLS policies allow service role access

### Issue: "Invalid image URL"

**Solution:**
- Frontend should send absolute URLs when possible
- Ensure images are accessible via HTTPS
- Check that origin/referer headers are set correctly

---

## 🔒 Security

### Implemented:
- ✅ Webhook signature verification
- ✅ Environment variable secrets
- ✅ Row Level Security (RLS)
- ✅ Input validation
- ✅ Price parsing sanitization

### Best Practices:
- Use test keys during development
- Rotate secrets regularly
- Monitor webhook logs
- Set up alerts for failed payments
- Use HTTPS for all URLs

---

## 📚 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Project README](../README.md)

---

## ✅ Deployment Checklist

Before going to production:

- [ ] Database schema deployed
- [ ] Both functions deployed
- [ ] Environment variables set
- [ ] Webhook endpoint configured in Stripe
- [ ] Webhook secret set
- [ ] Test payments working
- [ ] Error handling verified
- [ ] Logs monitored
- [ ] Production Stripe keys configured
- [ ] HTTPS enforced
- [ ] RLS policies reviewed

---

## 🎉 You're Ready!

Your Stripe checkout backend is now deployed and ready to process payments!

**Next Steps:**
1. Test with Stripe test cards
2. Configure production keys
3. Set up monitoring and alerts
4. Deploy to production

**Need Help?**
- Check logs in Supabase Dashboard → Edge Functions
- Review Stripe Dashboard → Events
- Check database for orders

Happy selling! 🚀✨

