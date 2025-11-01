# 🔧 Fix Stripe Payment on Production (curlea.beauty)

## ✅ Issues Fixed

1. **CSP Blocking Stripe** - Updated `netlify.toml` to allow Stripe checkout frames
2. **Environment Variables** - Verify they're set in Netlify dashboard

---

## 🚀 Steps to Fix

### 1. Update CSP Configuration ✅

**Already fixed!** Both `netlify.toml` and `index.html` now allow:
- Stripe checkout frames: `frame-src https://checkout.stripe.com`
- Stripe scripts: `script-src ... https://js.stripe.com`
- Stripe images: `img-src ... https://*.stripe.com`
- Stripe connections: `connect-src ... https://*.stripe.com`

### 2. Verify Environment Variables in Netlify

**Critical:** Environment variables must be set in Netlify dashboard!

1. Go to: https://app.netlify.com
2. Select your site (curlea.beauty)
3. Click: **Site settings** → **Environment variables**
4. Verify these are set:
   - `VITE_SUPABASE_URL` = `https://vfhxwzcbjdlfmizakvqc.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key-here`
   - `VITE_ANALYTICS_ENDPOINT` = `https://vfhxwzcbjdlfmizakvqc.supabase.co/functions/v1/track`

### 3. Redeploy Your Site

After updating `netlify.toml` and environment variables:

**Option A: Auto-deploy (if connected to Git)**
- Push changes to your Git repository
- Netlify will automatically rebuild

**Option B: Manual deploy**
1. In Netlify dashboard: **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

### 4. Verify Edge Function is Deployed

Make sure the `create-checkout` Edge Function is deployed:

1. Go to: https://supabase.com/dashboard/project/vfhxwzcbjdlfmizakvqc
2. Click: **Edge Functions** (left sidebar)
3. Verify `create-checkout` function exists and is active

---

## 🔍 Debugging Production Issues

### Check Browser Console

Open browser console (F12) on curlea.beauty and check for:

1. **Missing Environment Variables:**
   ```
   Supabase URL: undefined
   Supabase Anon Key: NOT SET
   ```
   → **Fix:** Set environment variables in Netlify dashboard

2. **CSP Violations:**
   ```
   Refused to frame 'https://checkout.stripe.com'...
   ```
   → **Fix:** Already fixed in `netlify.toml` - redeploy!

3. **401 Unauthorized:**
   ```
   POST .../create-checkout 401 (Unauthorized)
   ```
   → **Fix:** Check `VITE_SUPABASE_ANON_KEY` is correct in Netlify

4. **CORS Errors:**
   ```
   Access-Control-Allow-Origin
   ```
   → **Fix:** Add your domain to Supabase allowed origins (Settings → API)

---

## ✅ Checklist

- [ ] Updated `netlify.toml` with Stripe CSP rules ✅ (already done)
- [ ] Set `VITE_SUPABASE_URL` in Netlify environment variables
- [ ] Set `VITE_SUPABASE_ANON_KEY` in Netlify environment variables
- [ ] Set `VITE_ANALYTICS_ENDPOINT` in Netlify environment variables
- [ ] Redeployed site with new `netlify.toml`
- [ ] Verified `create-checkout` Edge Function is deployed
- [ ] Added `curlea.beauty` to Supabase allowed origins (Settings → API)
- [ ] Tested Stripe checkout on production

---

## 🎯 Quick Test

1. Visit: https://curlea.beauty
2. Add item to cart
3. Go to checkout
4. Select "Stripe" payment method
5. Click "Continue to payment"
6. Should redirect to Stripe checkout page ✅

---

## 📞 Still Not Working?

**Please share:**
1. Browser console errors (F12 → Console)
2. Network tab errors (F12 → Network → Failed requests)
3. Confirm environment variables are set in Netlify dashboard

