# 🚀 Deploy Console Fixes to Production

## ⚠️ Current Status

**Your local build has ALL fixes correctly applied!** ✅
- ✅ CSP includes Facebook and Google domains in `dist/index.html`
- ✅ Prices parse correctly (no NaN)
- ✅ Meta tag updated
- ✅ Preload hints removed

**The problem**: Production is serving **cached/old HTML files**

---

## 🔧 Solution: Force Fresh Deployment

### Option 1: Netlify CLI (Recommended - Fastest)

```bash
# Navigate to project
cd curlea-luxe-animation-main

# Clear Netlify cache
netlify cache:clear

# Force fresh deployment
netlify deploy --prod --dir=dist

# Or in one command:
netlify cache:clear && netlify deploy --prod --dir=dist
```

### Option 2: Git Push with Cache Bust

```bash
# Navigate to project
cd curlea-luxe-animation-main

# Stage all changes
git add .

# Commit with cache-busting message
git commit -m "fix: CSP violations, NaN analytics, preload warnings [cache-bust]"

# Push to trigger auto-deploy
git push origin main
```

**Then in Netlify Dashboard:**
1. Go to: https://app.netlify.com
2. Find your site → Deploys
3. Click "Trigger deploy" → "Clear cache and deploy site"

### Option 3: Manual Upload (If CLI not available)

1. Compress the `dist` folder
2. Go to Netlify Dashboard → Deploys
3. Drag and drop `dist` folder
4. Click "Deploy site"

---

## 🧪 Verify Deployment

After deploying, **hard refresh** your production site:

### Windows/Linux
- **Chrome/Edge**: `Ctrl + Shift + R`
- **Firefox**: `Ctrl + F5`

### Mac
- **Chrome/Safari**: `Cmd + Shift + R`
- **Firefox**: `Cmd + Shift + R`

### Then Check Console:

**✅ SHOULD SEE** (after fixes deploy):
```javascript
[Curlea Analytics] Initializing analytics SDK...
[Curlea Analytics] Session ID: xyz...
[Curlea Analytics] Page view tracked
[Curlea Analytics] Cart event tracked: add { price: 22.99, ... }  // Number!
```

**❌ SHOULD NOT SEE**:
```javascript
❌ Loading the script 'https://connect.facebook.net/en_US/fbevents.js' violates...
❌ The resource was preloaded using link preload but not used...
```

---

## 🔍 Troubleshooting

### If CSP errors still appear:

#### Check if new HTML is deployed:
```bash
curl https://curlea.beauty/index.html | grep "script-src-elem"
```

**Expected output:**
```html
script-src-elem 'self' 'unsafe-inline' https://js.stripe.com https://connect.facebook.net https://www.googletagmanager.com https://www.google-analytics.com
```

**If you DON'T see `script-src-elem`**: The old HTML is still cached!

#### Force cache clear:
1. Netlify Dashboard → Site settings → Build & deploy
2. Scroll to "Asset optimization"
3. Disable "Bundle CSS" temporarily
4. Trigger new deploy
5. Re-enable "Bundle CSS"
6. Deploy again

### If preload warnings still appear:

Check if old modulepreload links exist:
```bash
curl https://curlea.beauty/index.html | grep "modulepreload"
```

**Expected**: Should show ONLY the main index.js or nothing
**If shows vendor.js, router.js, etc.**: Old build is deployed

---

## 📊 Current Build Verification (Local)

I verified your local `dist/index.html` and confirmed:

```html
✅ Line 42: CSP includes script-src-elem with all domains
✅ Lines 78-79: NO modulepreload for vendor/router/animations/ui chunks
✅ Only main entry point script tag present
```

**Your build is correct!** Just need to deploy it.

---

## 🎯 Quick Deploy Commands (Copy-Paste)

### If you have Netlify CLI installed:
```bash
cd curlea-luxe-animation-main
netlify cache:clear
netlify deploy --prod --dir=dist
```

### If using Git auto-deploy:
```bash
cd curlea-luxe-animation-main
git add dist/
git commit -m "fix: deploy console fixes with cache bust"
git push origin main
```

Then go to Netlify and click **"Clear cache and deploy site"**

---

## ✅ Post-Deploy Checklist

1. Visit: https://curlea.beauty
2. Hard refresh (Ctrl+Shift+R)
3. Open Console (F12)
4. Verify:
   - [ ] No CSP violation errors
   - [ ] No preload warnings
   - [ ] `typeof fbq` returns `"function"`
   - [ ] `typeof gtag` returns `"function"`
5. Add product to cart:
   - [ ] Check console for cart event
   - [ ] Verify `price: 22.99` (not NaN)

---

## 🆘 If Still Having Issues

The dist folder has the correct fixes. If production still shows errors after deploy:

1. **Check browser cache**: Open in Incognito/Private mode
2. **Check CDN cache**: Wait 5-10 minutes for CDN propagation
3. **Check Netlify deploy log**: Ensure `dist/index.html` was uploaded
4. **Compare files**: 
   ```bash
   curl https://curlea.beauty/index.html > deployed.html
   diff deployed.html curlea-luxe-animation-main/dist/index.html
   ```

---

## 📝 Summary

**What you need to do:**
1. Clear Netlify cache
2. Deploy the `dist` folder (which has all fixes)
3. Hard refresh browser
4. Verify console is clean

**The fixes are ready and tested** - just need to push to production! 🚀

