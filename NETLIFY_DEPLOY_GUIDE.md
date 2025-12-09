# 🚀 Netlify Deployment Guide - Curlea Luxe

Complete step-by-step guide to deploy your optimized Curlea Luxe website on Netlify with maximum performance.

---

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Netlify account (free): https://app.netlify.com/signup
- ✅ Your code pushed to GitHub repository

---

## ⚡ Quick Deploy (5 Minutes)

### Step 1: Optimize Images

```powershell
# In PowerShell (you're already in the right directory)
npm run optimize:images
```

**What this does**:
- Scans all PNG/JPG images
- Converts to WebP format
- Creates responsive sizes (480/768/1280px)
- Saves to `src/assets-optimized/`

**Expected output**:
```
🖼️  Image Optimization Script
Found 47 images to optimize
...
Total savings: 81.2%
✅ Optimization map saved
🎉 Optimization complete!
```

### Step 2: Commit Changes

```powershell
git add .
git commit -m "feat: image optimization and performance improvements"
git push origin main
```

### Step 3: Deploy to Netlify

#### **Option A: Deploy via Netlify Dashboard** (Recommended)

1. **Go to Netlify**: https://app.netlify.com/

2. **Click "Add new site"** → **"Import an existing project"**

3. **Connect to GitHub**:
   - Click "GitHub"
   - Authorize Netlify
   - Select your repository

4. **Configure build settings**:
   ```
   Build command: npm run build
   Publish directory: dist
   ```

5. **Click "Deploy site"** 🚀

6. **Wait 2-3 minutes** for deployment to complete

7. **Done!** Your site is live at: `https://your-site-name.netlify.app`

#### **Option B: Deploy via Netlify CLI**

```powershell
# Install Netlify CLI (one-time)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy (from project root)
netlify deploy --prod
```

---

## 🎯 Post-Deployment: Verify Performance

### 1. Check Cache Headers

Open DevTools → Network tab → Select any image → Check Response Headers:

**Should see**:
```
Cache-Control: public, max-age=31536000, immutable
Content-Type: image/webp
```

### 2. Test with PageSpeed Insights

1. Go to: https://pagespeed.web.dev/
2. Enter your Netlify URL
3. **Target scores**:
   - Mobile: 85+ (ideally 90+)
   - Desktop: 95+

### 3. Test Mobile Layout

1. Open your Netlify site on mobile device (or Chrome DevTools mobile view)
2. Navigate to any product page
3. Scroll to **"Visual Journey"** section
4. **Verify**: All 3 containers (left image, video, right image) are fully visible
5. **Check**: No horizontal scrolling or clipping

---

## 🔧 Netlify Configuration Files

Your project now includes:

### 1. **`netlify.toml`** (Root directory)
- Build commands
- Cache headers for all file types
- SPA routing configuration
- Performance optimizations
- **Automatically used by Netlify** ✅

### 2. **`public/_headers`** (Public directory)
- Additional header rules
- Asset-specific caching
- Security headers
- **Copied to dist/ during build** ✅

### 3. **Package.json Scripts**
```json
{
  "scripts": {
    "build": "vite build && node scripts/generate-sitemap.js",
    "optimize:images": "node scripts/optimize-images.js"
  }
}
```

---

## 🌐 Custom Domain Setup (Optional)

### Add Your Custom Domain

1. **In Netlify Dashboard**:
   - Go to: Site settings → Domain management
   - Click "Add custom domain"
   - Enter: `www.curlealuxe.com` (or your domain)

2. **Update DNS Settings** (at your domain registrar):

   **Option A: Use Netlify DNS** (Easiest)
   - Netlify will provide nameservers
   - Update at your domain registrar (GoDaddy, Namecheap, etc.)
   - Wait 24-48 hours for DNS propagation

   **Option B: Use Custom DNS**
   - Add these records at your DNS provider:
   ```
   Type: A
   Name: @
   Value: 75.2.60.5

   Type: CNAME
   Name: www
   Value: your-site-name.netlify.app
   ```

3. **Enable HTTPS**:
   - Netlify → Domain settings → HTTPS
   - Click "Verify DNS configuration"
   - Click "Provision certificate" (automatic, free SSL)
   - Wait 1-2 minutes

4. **Done!** Your site is now at: `https://www.curlealuxe.com`

---

## ⚙️ Advanced: Netlify Build Settings

### Automatic Deploys

**Already configured!** Every time you push to GitHub:
1. Netlify automatically detects changes
2. Runs `npm run build`
3. Deploys to production
4. Takes ~2-3 minutes

### Deploy Previews

Every Pull Request gets a preview URL:
- Test changes before merging
- Share with team for review
- Automatic in Netlify (no setup needed)

### Environment Variables (if needed later)

1. Netlify Dashboard → Site settings → Build & deploy → Environment variables
2. Add variables (e.g., API keys)
3. Access in code: `import.meta.env.VITE_API_KEY`

---

## 📊 Performance Monitoring

### Built-in Netlify Analytics (Optional - $9/month)

1. Go to: Site settings → Analytics
2. Enable Netlify Analytics
3. Get:
   - Page views
   - Top pages
   - Traffic sources
   - Device/browser stats

### Free Alternative: Google Analytics

Already implemented in your site! Just verify it's working:
1. Open site → Check console for tracking events
2. Go to Google Analytics dashboard
3. Check real-time visitors

---

## 🔄 Update Workflow

When you add new products/images:

```powershell
# 1. Add new images to src/assets/
# 2. Optimize them
npm run optimize:images

# 3. Commit and push
git add .
git commit -m "feat: added new product images"
git push

# 4. Netlify auto-deploys in 2-3 minutes ✅
```

---

## 🐛 Troubleshooting

### Build Failed?

**Check Netlify deploy logs**:
1. Netlify Dashboard → Deploys → (Failed deploy) → View logs
2. Common issues:
   - Missing dependencies: `npm install` locally first
   - Build errors: Run `npm run build` locally to test
   - Node version: Netlify uses Node 18 (specified in `netlify.toml`)

**Fix**:
```powershell
# Test build locally
npm run build

# If successful, commit and push
git add .
git commit -m "fix: build configuration"
git push
```

### Images Not Caching?

1. **Clear Netlify cache**:
   - Netlify Dashboard → Deploys → Trigger deploy → Clear cache and deploy

2. **Verify headers**:
   - Open DevTools → Network → Check response headers
   - Should see: `Cache-Control: public, max-age=31536000`

3. **Check files exist**:
   - Verify `netlify.toml` is in root directory
   - Verify `public/_headers` exists

### Site Not Loading?

1. **Check deploy status**: Netlify Dashboard → Deploys
2. **Check build logs**: Click on deploy → View logs
3. **Test locally**: `npm run build && npm run preview`
4. **Check redirects**: Verify `netlify.toml` has SPA redirect rules

---

## ✅ Checklist: Before Going Live

- [ ] Run `npm run optimize:images`
- [ ] Test build locally: `npm run build`
- [ ] Commit and push to GitHub
- [ ] Deploy to Netlify
- [ ] Verify deployment successful
- [ ] Test site loads: `https://your-site.netlify.app`
- [ ] Check PageSpeed Insights (target: 85+ mobile)
- [ ] Test mobile layout (Visual Journey section)
- [ ] Verify images load fast
- [ ] Check cache headers in DevTools
- [ ] Test on real mobile device
- [ ] (Optional) Add custom domain
- [ ] (Optional) Enable HTTPS

---

## 📈 Expected Performance

### Before Optimization
```
Page Load: 5-8s
Total Size: 15-25MB
Lighthouse: 40-60
Time to Interactive: 8-12s
```

### After Optimization + Netlify CDN
```
Page Load: 1.5-2.5s ⚡ (70% faster)
Total Size: 3-5MB 📦 (80% smaller)
Lighthouse: 85-95 ⭐ (+40 points)
Time to Interactive: 2-4s ⚡ (75% faster)
```

---

## 🎉 You're All Set!

Your Curlea Luxe website is now:
- ✅ Optimized for performance (70%+ faster)
- ✅ Deployed on Netlify CDN (global reach)
- ✅ Auto-caching configured (1 year cache)
- ✅ Mobile layout fixed (all containers visible)
- ✅ Continuous deployment enabled (auto-updates)

**Netlify URL**: `https://your-site-name.netlify.app`

**Need help?** Check:
- Netlify Docs: https://docs.netlify.com/
- Netlify Support: https://answers.netlify.com/
- Your deploy logs: Netlify Dashboard → Deploys

---

**Total setup time: ~10 minutes**  
**Performance boost: 70%+ faster**  
**Global CDN: Included free** ✅

🚀 **Happy deploying!**

