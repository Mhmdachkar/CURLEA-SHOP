# 🚀 Curlea Analytics - Deployment Checklist

## 📋 Pre-Deployment Verification

Date: ________________  
Completed by: ________________

---

## ✅ Phase 1: Environment Setup

### 1.1 Create .env File
- [ ] Create `.env` file in project root (`curlea-luxe-animation-main/`)
- [ ] Copy template from `env.template`
- [ ] Add `VITE_SUPABASE_URL` (https://vfhxwzcbjdlfmizakvqc.supabase.co)
- [ ] Add `VITE_SUPABASE_ANON_KEY` (starts with eyJ...)
- [ ] Add `SUPABASE_SERVICE_ROLE_SECRET` (starts with eyJ...)
- [ ] Add `VITE_ANALYTICS_ENDPOINT` (your Edge Function URL)
- [ ] Verify .env is in .gitignore (DO NOT commit to git!)

**How to get keys:**
1. Go to https://supabase.com/dashboard
2. Select project: `vfhxwzcbjdlfmizakvqc`
3. Settings → API → Copy both keys

---

## ✅ Phase 2: Supabase Backend Deployment

### 2.1 Deploy Database Schema
- [ ] Navigate to: `analytics-backend/supabase/`
- [ ] Open Supabase SQL Editor
- [ ] Run `schema.sql` (creates all tables, views, indexes, RLS policies)
- [ ] Verify tables created:
  - [ ] visits
  - [ ] page_views
  - [ ] events
  - [ ] products
  - [ ] cart_events
  - [ ] orders
  - [ ] campaigns

### 2.2 Deploy SQL Functions
- [ ] In Supabase SQL Editor
- [ ] Run `functions.sql` (creates analytics helper functions)
- [ ] Verify functions created (check Database → Functions)

### 2.3 Deploy Edge Function
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Login: `supabase login`
- [ ] Link project: `supabase link --project-ref vfhxwzcbjdlfmizakvqc`
- [ ] Deploy function: `supabase functions deploy track`
- [ ] Verify deployment in Supabase Dashboard → Edge Functions

### 2.4 Test Edge Function
```bash
curl -X POST https://vfhxwzcbjdlfmizakvqc.supabase.co/functions/v1/track \
  -H "Content-Type: application/json" \
  -d '{"type":"visit","data":{"session_id":"test","device":"Desktop"}}'
```
- [ ] Receives 200 OK response
- [ ] Returns JSON with `{"success":true}`
- [ ] Data appears in `visits` table

---

## ✅ Phase 3: Frontend Integration

### 3.1 Verify Files
- [ ] `public/analytics.js` exists (602 lines)
- [ ] `index.html` has SDK script tag
- [ ] `index.html` has initialization code
- [ ] Uses `import.meta.env.VITE_ANALYTICS_ENDPOINT`
- [ ] Debug mode set to `import.meta.env.DEV`

### 3.2 Verify Tracking Code
- [ ] ProductDetailPage has product view tracking (line ~74)
- [ ] ProductDetailPage has add to cart tracking (line ~115)
- [ ] CollectionPage has product click tracking (line ~1226)
- [ ] CollectionPage has quick add tracking (line ~1198)
- [ ] TypeScript types declared in `vite-env.d.ts`

---

## ✅ Phase 4: Local Testing

### 4.1 Start Development Server
```bash
cd curlea-luxe-animation-main
npm install
npm run dev
```
- [ ] Server starts successfully
- [ ] No errors in terminal
- [ ] Site loads at http://localhost:5173

### 4.2 Test Analytics Integration
- [ ] Open browser DevTools Console (F12)
- [ ] Navigate to home page
- [ ] Look for: `[Curlea Analytics] Analytics SDK initialized successfully`
- [ ] See session ID logged
- [ ] No errors in console

### 4.3 Test Product View Tracking
- [ ] Click on any product
- [ ] Check console: `[Curlea Analytics] Event sent successfully: event`
- [ ] Check Network tab: POST request to Edge Function
- [ ] Verify in Supabase: Check `events` table

### 4.4 Test Add to Cart Tracking
- [ ] On product page, click "Add to Cart"
- [ ] Check console: `[Curlea Analytics] Cart event sent successfully: add`
- [ ] Check Network tab: POST request to Edge Function
- [ ] Verify in Supabase: Check `cart_events` table

### 4.5 Use Test Page (Optional)
- [ ] Navigate to http://localhost:5173/test-analytics.html
- [ ] Click "Test Product View" button
- [ ] Click "Test Add to Cart" button
- [ ] Click "Test Custom Event" button
- [ ] All show success messages
- [ ] All appear in Supabase tables

---

## ✅ Phase 5: Production Deployment

### 5.1 Netlify Configuration
- [ ] Add environment variables in Netlify:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_ANALYTICS_ENDPOINT`
  - [ ] (Do NOT add `SUPABASE_SERVICE_ROLE_SECRET` - security risk!)

**How to add in Netlify:**
1. Netlify Dashboard → Site Settings → Environment Variables
2. Add each variable with exact name and value
3. Save changes

### 5.2 Deploy to Production
```bash
git add .
git commit -m "Add analytics integration"
git push origin main
```
- [ ] Netlify build starts automatically
- [ ] Build succeeds
- [ ] Site deploys successfully
- [ ] No build errors

### 5.3 Test Production Site
- [ ] Visit your live site
- [ ] Open DevTools Console
- [ ] Navigate around the site
- [ ] Click on products
- [ ] Add items to cart
- [ ] Verify events in Supabase `events` and `cart_events` tables

### 5.4 Turn Off Debug Mode (Production)
- [ ] Confirm `debug: import.meta.env.DEV` is used (auto-disables in production)
- [ ] Or manually set to `debug: false` in `index.html`
- [ ] Redeploy if needed

---

## ✅ Phase 6: Monitoring & Validation

### 6.1 Verify Data Collection
- [ ] Open Supabase Dashboard
- [ ] Check `visits` table - should see new entries
- [ ] Check `page_views` table - should see page visits
- [ ] Check `events` table - should see product views
- [ ] Check `cart_events` table - should see cart actions

### 6.2 Test Analytics Queries
Run in Supabase SQL Editor:

```sql
-- Total visits today
SELECT COUNT(*) FROM visits WHERE created_at > NOW() - INTERVAL '1 day';

-- Total events today
SELECT COUNT(*) FROM events WHERE created_at > NOW() - INTERVAL '1 day';

-- Top products viewed
SELECT 
  payload->>'product_name' as product,
  COUNT(*) as views
FROM events 
WHERE event_name = 'ProductViewed'
AND created_at > NOW() - INTERVAL '7 days'
GROUP BY payload->>'product_name'
ORDER BY views DESC
LIMIT 10;
```

- [ ] Queries return data
- [ ] Data is accurate
- [ ] Timestamps are correct

### 6.3 Monitor Edge Function
```bash
supabase functions logs track --project-ref vfhxwzcbjdlfmizakvqc
```
- [ ] No errors in logs
- [ ] Events being processed
- [ ] Response times < 500ms

---

## ✅ Phase 7: Optional Enhancements

### 7.1 GDPR Compliance (if serving EU)
- [ ] Add analytics notice to privacy policy
- [ ] Implement consent banner
- [ ] Add opt-out mechanism
- [ ] Update SDK to respect consent

### 7.2 Dashboard Setup (Future)
- [ ] Set up React analytics dashboard
- [ ] Deploy to Vercel/Netlify subdomain
- [ ] Add authentication
- [ ] Connect to Supabase
- [ ] Build charts and metrics

### 7.3 Advanced Tracking (Future)
- [ ] Checkout flow tracking
- [ ] Order completion tracking
- [ ] Email capture tracking
- [ ] Newsletter signup tracking
- [ ] Quiz completion tracking

---

## 🔍 Troubleshooting Guide

### Issue: "Analytics SDK not loaded"
**Solution:**
- Verify `/public/analytics.js` exists
- Check `<script src="/analytics.js"></script>` in index.html
- Clear browser cache and reload

### Issue: "API endpoint is required"
**Solution:**
- Verify `.env` file has `VITE_ANALYTICS_ENDPOINT`
- Restart dev server after adding .env
- Check for typos in variable name

### Issue: "Failed to send event"
**Solution:**
- Check Edge Function is deployed
- Test Edge Function with curl
- Check browser Network tab for errors
- Verify CORS headers in Edge Function

### Issue: "Events not appearing in database"
**Solution:**
- Check Edge Function logs for errors
- Verify database schema is deployed
- Check RLS policies allow inserts
- Verify Service Role Key is correct

### Issue: TypeScript errors
**Solution:**
- Verify `vite-env.d.ts` has analytics types
- Restart TypeScript server in VS Code
- Check no conflicting type declarations

---

## 📊 Success Metrics

After deployment, you should see:

✅ **Within 1 hour:**
- 10+ visits tracked
- Page views for each page
- Product view events

✅ **Within 24 hours:**
- 100+ visits
- Multiple cart events
- Data in all core tables

✅ **Within 1 week:**
- Thousands of events
- Clear traffic patterns
- Product engagement data
- Conversion funnel insights

---

## 🎯 Final Verification

- [ ] All environment variables set correctly
- [ ] Database schema deployed
- [ ] Edge Function deployed and tested
- [ ] Analytics SDK loaded on site
- [ ] Tracking events firing
- [ ] Data appearing in Supabase
- [ ] No console errors
- [ ] Production site tested
- [ ] Monitoring in place

---

## 📞 Support Resources

**Documentation:**
- Full Setup Guide: `analytics-backend/COMPLETE_SETUP_SUMMARY.md`
- Quick Start: `analytics-backend/QUICK_START.md`
- Integration Guide: `analytics-backend/CURLEA_INTEGRATION_GUIDE.md`
- Validation Report: `ANALYTICS_VALIDATION_REPORT.md`

**Commands:**
```bash
# View Edge Function logs
supabase functions logs track --project-ref vfhxwzcbjdlfmizakvqc

# Test endpoint
curl -X POST https://vfhxwzcbjdlfmizakvqc.supabase.co/functions/v1/track \
  -H "Content-Type: application/json" \
  -d '{"type":"event","data":{"session_id":"test","event_name":"test"}}'

# Restart dev server
npm run dev
```

---

## ✅ Deployment Complete!

**Date Completed:** ________________  
**Deployed By:** ________________  
**Production URL:** ________________  
**Supabase Project:** vfhxwzcbjdlfmizakvqc

**Notes:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

**🎉 Congratulations! Your Shopify-style analytics is now live! 🎉**

