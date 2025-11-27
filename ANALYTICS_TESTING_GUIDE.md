# 🧪 CURLEA Analytics Testing Guide
**Purpose:** Validate all tracking implementations and dashboard functionality

---

## 🎯 Pre-Testing Checklist

### Environment Setup
- [ ] Development environment running (`npm run dev`)
- [ ] Analytics dashboard running (`cd analytics-backend/analytics-dashboard && npm run dev`)
- [ ] Browser DevTools open (Network + Console tabs)
- [ ] Meta Pixel Helper extension installed
- [ ] Google Tag Assistant extension installed

### Browser Testing
Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on macOS)
- [ ] Mobile browser (Chrome Android or Safari iOS)

---

## 📊 Test Suite 1: Meta Pixel Tracking

### Test 1.1: PageView Event
**Steps:**
1. Open homepage in new incognito window
2. Open Meta Pixel Helper extension
3. Check console for `fbq('track', 'PageView')`

**Expected Results:**
- ✅ Green checkmark in Pixel Helper
- ✅ `PageView` event visible in helper
- ✅ Console shows no errors

### Test 1.2: ViewContent Event
**Steps:**
1. Click on any product
2. Wait for product page to load
3. Check Pixel Helper for `ViewContent` event

**Expected Results:**
- ✅ `ViewContent` event fires
- ✅ Contains: `content_name`, `content_ids`, `value`, `currency`
- ✅ Product ID matches URL parameter

### Test 1.3: AddToCart Event
**Steps:**
1. On product page, select color/size (if applicable)
2. Click "Add to Cart"
3. Check Pixel Helper

**Expected Results:**
- ✅ `AddToCart` event fires
- ✅ Contains: `content_name`, `content_ids`, `value`, `quantity`, `currency`
- ✅ Price is numeric (not NaN)

### Test 1.4: InitiateCheckout Event
**Steps:**
1. Open cart drawer
2. Check Pixel Helper

**Expected Results:**
- ✅ `InitiateCheckout` event fires
- ✅ Contains: `num_items`, `value`, `currency`
- ✅ Cart total is accurate

### Test 1.5: Purchase Event
**Steps:**
1. Complete a test order (use Stripe test card: 4242 4242 4242 4242)
2. Land on success page
3. Check Pixel Helper

**Expected Results:**
- ✅ `Purchase` event fires
- ✅ Contains: `value`, `currency`, `transaction_id`
- ✅ Event fires only ONCE (not on refresh)

---

## 🔍 Test Suite 2: Google Analytics 4

### Test 2.1: page_view Event
**Steps:**
1. Navigate between pages (Home → Shop → Product)
2. Open DevTools → Network tab
3. Filter by "collect" or "google-analytics"

**Expected Results:**
- ✅ `page_view` event sent on each route change
- ✅ Contains: `page_path`, `page_location`
- ✅ No duplicate events

### Test 2.2: view_item Event
**Steps:**
1. Open product page
2. Check Network tab for GA4 request

**Expected Results:**
- ✅ `view_item` event sent
- ✅ Contains: `currency`, `value`, `items` array
- ✅ Item has `id` and `name`

### Test 2.3: add_to_cart Event
**Steps:**
1. Add product to cart
2. Check Network tab

**Expected Results:**
- ✅ `add_to_cart` event sent
- ✅ Contains: `currency`, `value`, `items` array
- ✅ Quantity is correct

### Test 2.4: begin_checkout Event
**Steps:**
1. Open cart drawer or go to checkout
2. Check Network tab

**Expected Results:**
- ✅ `begin_checkout` event sent
- ✅ Contains cart value and item count

### Test 2.5: purchase Event
**Steps:**
1. Complete test order
2. Check Network tab on success page

**Expected Results:**
- ✅ `purchase` event sent
- ✅ Contains: `transaction_id`, `value`, `currency`, `items`
- ✅ Transaction ID matches order ID

---

## 🛠️ Test Suite 3: Custom Analytics (Supabase)

### Test 3.1: Visit Tracking
**Steps:**
1. Open site in new incognito window
2. Open Console and look for `[Curlea Analytics]` logs
3. Check for "Visit tracked" message

**Expected Results:**
- ✅ `session_id` generated (UUID format)
- ✅ `visit_id` returned from backend
- ✅ Device, browser, OS detected correctly

**Verification in Dashboard:**
1. Open Analytics Dashboard → Visits tab
2. Find your visit (sort by created_at DESC)
3. Verify all fields populated

### Test 3.2: Page View Tracking
**Steps:**
1. Navigate to multiple pages
2. Check console for "Page view tracked" messages

**Expected Results:**
- ✅ Event logged for each page
- ✅ Contains: `url`, `title`, `referrer`
- ✅ `session_id` consistent across pages

**Verification in Dashboard:**
1. Open Page Views tab
2. Find your page views
3. Verify URLs, scroll depth, time on page

### Test 3.3: Product View Event
**Steps:**
1. Open product page
2. Check console for "Custom event tracked: ProductViewed"

**Expected Results:**
- ✅ Event contains: `product_id`, `product_name`, `price`, `category`
- ✅ Price is numeric
- ✅ Event sent to Supabase

**Verification in Dashboard:**
1. Open Events tab
2. Filter by `event_name = 'ProductViewed'`
3. Verify payload contains product data

### Test 3.4: Cart Events
**Steps:**
1. Add product to cart
2. Update quantity
3. Remove product
4. Check console for cart events

**Expected Results:**
- ✅ `add` event with product details
- ✅ `update` event with new quantity
- ✅ `remove` event
- ✅ `cart_total` updates correctly

**Verification in Dashboard:**
1. Open Cart Events tab
2. Find your events by `session_id`
3. Verify event sequence and data

### Test 3.5: Purchase Tracking
**Steps:**
1. Complete COD order
2. Check console for "Analytics order tracking initiated"

**Expected Results:**
- ✅ `trackPurchase` called with full order data
- ✅ Order includes: `order_id`, `customer_email`, `total_value`, `items`
- ✅ UTM parameters captured (if present in URL)

**Verification in Dashboard:**
1. Open Orders tab → Analytics Orders section
2. Find your order by `order_id`
3. Verify all fields: customer, total, items, utm params

---

## 🏷️ Test Suite 4: Campaign Tracking (UTM)

### Test 4.1: UTM Parameter Capture
**Steps:**
1. Visit site with UTM params: 
   ```
   ?utm_source=facebook&utm_medium=cpc&utm_campaign=summer_sale&utm_content=video_ad&utm_term=curly_hair
   ```
2. Check console for `utm_` parameters in visit data

**Expected Results:**
- ✅ All 5 UTM parameters captured
- ✅ Stored with visit record
- ✅ Persist through entire session

**Verification in Dashboard:**
1. Open Visits tab
2. Find your visit
3. Verify all UTM columns populated

### Test 4.2: Campaign Attribution to Order
**Steps:**
1. Visit with UTM params (as above)
2. Browse and add products to cart
3. Complete order

**Expected Results:**
- ✅ Order record includes UTM parameters
- ✅ Attribution maintained from first visit
- ✅ Shows in Analytics Orders table

**Verification in Dashboard:**
1. Open Orders tab → Analytics Orders
2. Find your order
3. Verify UTM Source, Medium, Campaign columns

### Test 4.3: Campaign Performance Metrics
**Steps:**
1. Create test campaign in Supabase:
   ```sql
   INSERT INTO campaigns (name, utm_campaign, utm_source, utm_medium, cost, budget, is_active)
   VALUES ('Test Campaign', 'summer_sale', 'facebook', 'cpc', 100, 500, true);
   ```
2. Generate visits and orders with matching UTM params
3. Open Campaigns tab in dashboard

**Expected Results:**
- ✅ Campaign shows in Active Campaigns card
- ✅ Performance table shows visitors, orders, revenue
- ✅ ROI calculated: `((revenue - cost) / cost) * 100`

---

## 🛒 Test Suite 5: E-commerce Flow

### Test 5.1: Stripe Checkout Flow
**Steps:**
1. Add products to cart
2. Click "Pay with Card"
3. Complete Stripe checkout (test card: 4242 4242 4242 4242)
4. Verify webhook processing
5. Check success page

**Expected Results:**
- ✅ Redirected to Stripe checkout
- ✅ Webhook fires (`/.netlify/functions/stripe-webhook`)
- ✅ Order created in `stripe_orders` table
- ✅ Order items created in `order_items` table
- ✅ Analytics order updated
- ✅ Success page shows order confirmation
- ✅ Email sent to customer

**Verification in Dashboard:**
1. Open Orders tab → Stripe Orders
2. Find your order by `stripe_session_id`
3. Click "View Items" to see order items
4. Verify status = 'completed'

### Test 5.2: COD (Cash on Delivery) Flow
**Steps:**
1. Add products to cart
2. Select "Cash on Delivery"
3. Fill out delivery form
4. Submit order

**Expected Results:**
- ✅ Form validates required fields
- ✅ Order created in both orders tables
- ✅ Analytics SDK tracks purchase immediately
- ✅ Email sent to customer
- ✅ Redirect to success page

**Verification in Dashboard:**
1. Check Stripe Orders for COD entry
2. Check Analytics Orders for same `order_id`
3. Verify customer_email and phone stored

---

## 📦 Test Suite 6: Inventory Management

### Test 6.1: Inventory Dashboard Display
**Steps:**
1. Open Analytics Dashboard
2. Click "Inventory" tab
3. Review all sections

**Expected Results:**
- ✅ Stats cards show: Total Variants, Total Stock, Stock Value, Low Stock, Out of Stock
- ✅ Low Stock Alerts table (if any items < 5 units)
- ✅ All Product Variants table with full data
- ✅ Recent Inventory Movements showing sales/restocks

### Test 6.2: Stock Deduction on Order
**Steps:**
1. Note current stock of a product variant
2. Complete an order for that variant
3. Check Inventory tab → Product Variants table
4. Check Inventory Movements table

**Expected Results:**
- ✅ Stock quantity decreased by order quantity
- ✅ Available quantity updated
- ✅ New "sale" movement record created
- ✅ Movement shows: previous_stock, new_stock, order_id

**Manual Verification (if automated trigger fails):**
```sql
-- Check product variant stock
SELECT * FROM product_variants WHERE product_id = 'dreamcurl-midi' AND size = 'Midi' AND color = 'Purple';

-- Check inventory movements
SELECT * FROM inventory_movements WHERE variant_id = '<variant-id-from-above>' ORDER BY created_at DESC LIMIT 5;
```

---

## 📈 Test Suite 7: Dashboard Functionality

### Test 7.1: Overview Tab
**Steps:**
1. Open Overview tab
2. Review all metrics

**Expected Results:**
- ✅ Total Visitors shows unique count
- ✅ Total Revenue aggregates all orders
- ✅ Total Orders count correct
- ✅ Avg Order Value = Revenue / Orders
- ✅ Conversion Funnel shows all 5 steps
- ✅ Conversion rates calculated correctly

### Test 7.2: Sales Tab
**Steps:**
1. Open Sales tab
2. Review daily sales table

**Expected Results:**
- ✅ Each row shows one day's data
- ✅ Orders, Customers, Revenue, Profit, AOV all populated
- ✅ Profit margin % displayed
- ✅ Data sortable by column

### Test 7.3: Products Tab
**Steps:**
1. Open Products tab
2. Review product catalog and top products

**Expected Results:**
- ✅ Products synced from codebase
- ✅ Sync button works
- ✅ Top Products shows revenue leaders
- ✅ "% of Total" column calculated
- ✅ "Velocity" (units/day) displayed

### Test 7.4: Traffic Tab
**Steps:**
1. Open Traffic tab
2. Review visitor stats and sources

**Expected Results:**
- ✅ Device breakdown (Mobile, Desktop, Tablet)
- ✅ Traffic sources with visitor counts
- ✅ "Visits/Visitor" ratio calculated
- ✅ "% of Traffic" for each source

### Test 7.5: Campaigns Tab
**Steps:**
1. Open Campaigns tab
2. Review campaign performance

**Expected Results:**
- ✅ Active campaigns listed
- ✅ Performance metrics show conversion rate
- ✅ CPA (Cost Per Acquisition) calculated
- ✅ ROI color-coded (green = positive, red = negative)

### Test 7.6: All Data Tables
**Steps:**
1. Navigate through all tabs
2. Interact with tables (scroll, sort)

**Expected Results:**
- ✅ No empty required columns
- ✅ "-" or "0" for optional/zero values
- ✅ Loading states show "..." or spinner
- ✅ Error states show red alert with message
- ✅ Empty states show helpful message

---

## 🔐 Test Suite 8: Security & Privacy

### Test 8.1: CSP Compliance
**Steps:**
1. Open Console
2. Look for CSP violation errors

**Expected Results:**
- ✅ No CSP errors for Meta Pixel
- ✅ No CSP errors for Google Analytics
- ✅ No CSP errors for Supabase requests

### Test 8.2: Data Privacy
**Steps:**
1. Review what data is collected
2. Check if PII is minimized

**Expected Results:**
- ✅ IP addresses collected (for fraud detection only)
- ✅ Email/phone only at checkout (with consent)
- ✅ Session IDs are random UUIDs (not identifiable)
- ✅ No tracking of sensitive data without consent

---

## 🐛 Common Issues & Solutions

### Issue 1: Meta Pixel Not Firing
**Solution:**
- Verify CSP allows `connect.facebook.net`
- Check `netlify.toml` has correct script-src
- Ensure `fbq` function is defined (check inline script in index.html)

### Issue 2: GA4 Events Not Sending
**Solution:**
- Replace `G-XXXXXXXXXX` with actual Measurement ID
- Check CSP allows `www.googletagmanager.com`
- Verify `gtag` function is defined

### Issue 3: Custom Analytics SDK Not Loading
**Solution:**
- Check `/analytics.js` and `/init-analytics.js` exist in public folder
- Verify endpoint URL is correct: `https://vfhxwzcbjdlfmizakvqc.supabase.co/functions/v1/track`
- Check browser console for network errors

### Issue 4: Dashboard Shows Empty Tables
**Solution:**
- Verify Supabase credentials in `.env`
- Check RLS policies allow public read access
- Run test traffic to generate data
- Check Supabase logs for errors

### Issue 5: Orders Not Appearing in Dashboard
**Solution:**
- Verify webhook is configured in Stripe dashboard
- Check Netlify function logs for webhook errors
- Manually trigger webhook in Stripe dashboard
- Verify `orders` and `stripe_orders` tables exist

### Issue 6: Inventory Not Decrementing
**Solution:**
- Check `product_variants` table exists
- Verify trigger function installed: `reduce_inventory_on_public_order`
- Review `order_items` have correct `product_id`, `size`, `color`
- Check `inventory_movements` table for error logs

---

## ✅ Final Validation Checklist

- [ ] All Meta Pixel events fire correctly
- [ ] All GA4 events send properly
- [ ] Custom analytics SDK tracks all events
- [ ] UTM parameters captured and attributed
- [ ] Orders created in both tables
- [ ] Inventory decrements on purchase
- [ ] Dashboard loads without errors
- [ ] All tabs display data correctly
- [ ] No CSP violations in console
- [ ] Mobile responsive (test on phone)
- [ ] Email confirmations sent
- [ ] Webhook processing works
- [ ] No sensitive data leaked
- [ ] Performance is acceptable (< 3s page load)

---

## 📞 Support

If tests fail:
1. Check console for JavaScript errors
2. Review Network tab for failed requests
3. Check Supabase logs for database errors
4. Review `TRACKING_AUDIT_REPORT.md` for configuration
5. Test in incognito mode (avoids ad blockers)

**Last Updated:** 2025-11-27

