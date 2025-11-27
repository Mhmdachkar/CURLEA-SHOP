# 🚀 Deployment Checklist - CURLEA Analytics Enhancement

## ✅ Pre-Deployment Verification

### 1. Code Quality
- [x] Main project builds successfully (`npm run build`)
- [ ] Analytics dashboard builds successfully (`cd analytics-backend/analytics-dashboard && npm run build`)
- [ ] No critical linter errors
- [ ] All tracking functions tested locally

### 2. Configuration Updates Needed

#### Google Analytics 4
- [ ] Replace `G-XXXXXXXXXX` in `index.html` (line 27) with actual GA4 Measurement ID
- [ ] Get ID from: https://analytics.google.com/ → Admin → Data Streams → Web Stream Details

#### Meta Pixel (Already Configured)
- [x] Pixel ID: 1384648266132087 (already in `index.html`)
- [x] Domain verification complete

#### Supabase (Already Configured)
- [x] Endpoint: `https://vfhxwzcbjdlfmizakvqc.supabase.co/functions/v1/track`
- [x] Tables created and operational
- [x] RLS policies configured

### 3. Environment Variables

Create `.env` file in `analytics-backend/analytics-dashboard/` with:
```env
VITE_SUPABASE_URL=https://vfhxwzcbjdlfmizakvqc.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 📦 Files Changed in This Update

### New Files Created
1. `TRACKING_AUDIT_REPORT.md` - Comprehensive tracking audit
2. `ANALYTICS_TESTING_GUIDE.md` - Testing procedures
3. `ANALYTICS_ENHANCEMENT_SUMMARY.md` - Feature summary
4. `DEPLOYMENT_CHECKLIST.md` - This file

### Files Modified
1. `analytics-backend/analytics-dashboard/src/components/DashboardShopify.tsx`
   - Added inventory management tab
   - Enhanced table columns with new metrics
   - Added inventory hooks integration

2. `analytics-backend/analytics-dashboard/src/components/dashboard/ShopifySidebar.tsx`
   - Added "Inventory" navigation item

3. `src/utils/supabase/inventory.ts` - Created inventory utility functions
4. `src/hooks/useProductInventory.ts` - Created inventory React hook
5. `src/contexts/CartContext.tsx` - Enhanced with inventory checks
6. `src/pages/ProductDetailPage.tsx` - Added quantity limits based on stock

---

## 🎯 Deployment Steps

### Step 1: Main Website Deployment

```bash
# From project root
cd curlea-luxe-animation-main
npm run build

# Verify build output in dist/ folder
# Deploy dist/ folder to Netlify
```

#### Netlify Deployment
1. **Via Netlify CLI:**
   ```bash
   netlify deploy --prod
   ```

2. **Via Git Push:**
   ```bash
   git add .
   git commit -m "feat: Enhanced analytics tracking and dashboard"
   git push origin main
   ```

3. **Via Netlify Dashboard:**
   - Upload `dist` folder manually
   - Or connect GitHub repo for auto-deploy

### Step 2: Analytics Dashboard Deployment

```bash
# From project root
cd analytics-backend/analytics-dashboard
npm install
npm run build

# Deploy dist/ folder to separate Netlify site or subdomain
```

#### Recommended Setup
- **Main Site:** `https://curlea.beauty`
- **Analytics Dashboard:** `https://analytics.curlea.beauty` (subdomain)
  - OR: `https://curlea-analytics.netlify.app` (separate site)

#### Security for Analytics Dashboard
- [ ] Add Supabase authentication
- [ ] Restrict access to admin users only
- [ ] Use environment variables for sensitive keys
- [ ] Enable HTTPS only

### Step 3: Verify Deployment

#### Main Website Checks
- [ ] Homepage loads without errors
- [ ] Products display correctly
- [ ] Add to cart works
- [ ] Checkout flow completes
- [ ] Meta Pixel fires (check with Pixel Helper)
- [ ] GA4 events send (check in Google Analytics Realtime)
- [ ] Custom analytics tracks (check Supabase tables)

#### Analytics Dashboard Checks
- [ ] Dashboard loads without errors
- [ ] All tabs accessible
- [ ] Data displays in tables
- [ ] Inventory tab shows variants
- [ ] No console errors
- [ ] Responsive on mobile

---

## 🧪 Post-Deployment Testing

### Test Suite 1: Tracking Verification (10 minutes)
1. **Meta Pixel Test**
   - Install Meta Pixel Helper extension
   - Visit homepage → check PageView
   - View product → check ViewContent
   - Add to cart → check AddToCart
   - Complete test order → check Purchase

2. **Google Analytics Test**
   - Open GA4 Realtime report
   - Navigate site → check page_view events
   - View product → check view_item
   - Add to cart → check add_to_cart
   - Complete order → check purchase

3. **Custom Analytics Test**
   - Open browser console
   - Look for `[Curlea Analytics]` logs
   - Verify events queued and sent
   - Check Supabase tables for new records

### Test Suite 2: Dashboard Verification (5 minutes)
1. Open Analytics Dashboard
2. Navigate through all tabs
3. Verify data appears in tables
4. Check inventory tab functionality
5. Test on mobile device

### Test Suite 3: E-commerce Flow (10 minutes)
1. **Stripe Checkout:**
   - Add products to cart
   - Proceed to Stripe checkout
   - Use test card: 4242 4242 4242 4242
   - Verify webhook processes (check Netlify function logs)
   - Confirm order appears in dashboard

2. **COD (Cash on Delivery):**
   - Add products to cart
   - Select COD option
   - Fill delivery form
   - Submit order
   - Verify email sent
   - Check order in dashboard

### Test Suite 4: Inventory System (5 minutes)
1. Check inventory tab in dashboard
2. Note stock level of a product
3. Complete an order for that product
4. Refresh inventory tab
5. Verify stock decreased
6. Check inventory movements table

---

## 🔍 Monitoring & Maintenance

### Daily Checks
- [ ] Review Netlify function logs for errors
- [ ] Check Supabase logs for database errors
- [ ] Monitor Meta Events Manager for pixel issues
- [ ] Review GA4 Realtime for tracking issues

### Weekly Reviews
- [ ] Analyze conversion funnel performance
- [ ] Review low stock alerts
- [ ] Check campaign ROI
- [ ] Identify top-performing products

### Monthly Tasks
- [ ] Generate comprehensive analytics report
- [ ] Review and optimize marketing campaigns
- [ ] Plan inventory restocking
- [ ] Update product pricing if needed

---

## 🐛 Troubleshooting Guide

### Issue: Meta Pixel Not Firing
**Solution:**
1. Check browser console for CSP errors
2. Verify `netlify.toml` CSP policy allows `connect.facebook.net`
3. Clear browser cache and test in incognito
4. Check Meta Events Manager for pixel status

### Issue: GA4 Events Not Sending
**Solution:**
1. Verify GA4 Measurement ID is correct (not `G-XXXXXXXXXX`)
2. Check CSP allows `www.googletagmanager.com`
3. Test in GA4 DebugView mode
4. Wait 24-48 hours for data to appear in reports

### Issue: Dashboard Shows No Data
**Solution:**
1. Verify Supabase credentials in `.env`
2. Check RLS policies allow read access
3. Generate test traffic to populate tables
4. Review Supabase logs for query errors
5. Check network tab for failed API requests

### Issue: Orders Not Appearing
**Solution:**
1. Check Stripe webhook is configured correctly
2. Review Netlify function logs for webhook errors
3. Verify `orders` and `stripe_orders` tables exist
4. Manually trigger webhook in Stripe dashboard
5. Check order creation logic in CheckoutPage.tsx

### Issue: Inventory Not Decreasing
**Solution:**
1. Verify `product_variants` table exists
2. Check database trigger is installed: `reduce_inventory_on_public_order`
3. Review `order_items` table for correct product matching data
4. Check `inventory_movements` table for error logs
5. Manually test trigger with sample order

---

## 📈 Performance Optimization

### Website Performance
- [x] Images optimized (WebP format)
- [x] Code splitting implemented
- [x] CSS minified
- [x] JavaScript bundled and minified
- [ ] Consider CDN for static assets
- [ ] Enable HTTP/2 server push

### Dashboard Performance
- [ ] Lazy load large tables
- [ ] Implement pagination for 100+ rows
- [ ] Cache frequent queries
- [ ] Add loading skeletons

### Database Performance
- [x] Indexes on frequently queried columns
- [ ] Monitor slow queries
- [ ] Consider read replicas for heavy traffic
- [ ] Archive old data (>1 year)

---

## 🔐 Security Checklist

### Website Security
- [x] HTTPS enabled
- [x] CSP headers configured
- [x] XSS protection enabled
- [x] CORS properly configured
- [ ] Rate limiting on API endpoints
- [ ] DDoS protection via Netlify

### Dashboard Security
- [ ] Implement Supabase authentication
- [ ] Restrict to admin users only
- [ ] Use environment variables for keys
- [ ] Enable 2FA for admin accounts
- [ ] Regular security audits

### Data Privacy
- [x] GDPR compliance considerations
- [ ] Cookie consent banner (recommended)
- [x] Data retention policies
- [ ] Privacy policy updated
- [ ] Terms of service reviewed

---

## 📞 Support & Resources

### Documentation
- Main: `README.md`
- Audit: `TRACKING_AUDIT_REPORT.md`
- Testing: `ANALYTICS_TESTING_GUIDE.md`
- Summary: `ANALYTICS_ENHANCEMENT_SUMMARY.md`

### External Resources
- **Meta Pixel:** https://business.facebook.com/events_manager
- **Google Analytics:** https://analytics.google.com/
- **Supabase:** https://app.supabase.com/
- **Netlify:** https://app.netlify.com/

### Getting Help
1. Check documentation files first
2. Review error logs (Netlify, Supabase)
3. Test in incognito mode (bypasses ad blockers)
4. Check browser console for JavaScript errors
5. Review Network tab for failed requests

---

## ✅ Final Checklist

### Before Going Live
- [ ] All tests passed
- [ ] GA4 Measurement ID updated
- [ ] Supabase credentials configured
- [ ] Analytics dashboard deployed
- [ ] Webhooks configured in Stripe
- [ ] Email service working
- [ ] Mobile tested
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Performance acceptable (< 3s page load)
- [ ] Security review complete

### After Going Live
- [ ] Monitor for 24 hours
- [ ] Review error logs
- [ ] Check tracking data appearing
- [ ] Verify orders processing correctly
- [ ] Test inventory decrements
- [ ] Confirm emails sending
- [ ] Monitor conversion rates

### Week 1 Tasks
- [ ] Review analytics daily
- [ ] Address any tracking issues
- [ ] Optimize based on performance data
- [ ] Set up automated reports
- [ ] Train team on dashboard usage

---

## 🎉 Success Criteria

**Deployment is successful when:**
1. ✅ All tracking systems operational (Pixel, GA4, Custom)
2. ✅ Orders processing without errors
3. ✅ Analytics dashboard displays data
4. ✅ Inventory system decrements on purchase
5. ✅ No critical errors in logs
6. ✅ Conversion funnel tracking works
7. ✅ Campaign attribution accurate
8. ✅ Website performance acceptable

---

**Last Updated:** 2025-11-27  
**Status:** Ready for Deployment  
**Version:** 2.0 (Analytics Enhancement Release)

