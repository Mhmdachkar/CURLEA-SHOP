# CDN & Performance Setup Guide

This guide will help you set up CDN, caching, and server optimizations for maximum website performance.

---

## 📦 Step 1: Image Optimization

### Install Dependencies

```bash
npm install --save-dev sharp
```

### Run Image Optimization

```bash
npm run optimize:images
```

This script will:
- ✅ Convert all large PNG/JPG images to WebP format (90% quality)
- ✅ Generate responsive sizes: 480px, 768px, 1280px, and original
- ✅ Save optimized images to `src/assets-optimized/`
- ✅ Create an optimization map for reference

**Expected Results:**
- 60-80% file size reduction
- Faster page loads on all devices
- Better mobile performance

---

## 🌐 Step 2: CDN Setup

### Option A: Cloudflare (Recommended - Free Tier Available)

1. **Sign up for Cloudflare** (free): https://www.cloudflare.com/

2. **Add your domain** to Cloudflare

3. **Update nameservers** at your domain registrar

4. **Enable optimizations** in Cloudflare dashboard:
   - **Auto Minify**: Enable HTML, CSS, JS
   - **Brotli Compression**: Enable
   - **Rocket Loader**: Enable (optional, test first)
   - **Mirage**: Enable (image optimization)
   - **Polish**: Enable "Lossless" or "Lossy"

5. **Configure cache rules**:
   - Go to: Caching → Configuration → Cache Rules
   - Add rule:
     ```
     If Request URI Path matches ".*\.(jpg|jpeg|png|gif|webp|avif|svg|ico|css|js|woff|woff2|ttf|mp4|webm)"
     Then:
       - Cache Level: Cache Everything
       - Edge Cache TTL: 1 month
       - Browser Cache TTL: 1 month
     ```

6. **Enable HTTP/3**: Automatically enabled on Cloudflare

---

### Option B: Vercel (If hosting on Vercel)

Vercel includes CDN by default. Just add this to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

---

### Option C: AWS CloudFront

1. **Create CloudFront distribution**:
   - Origin: Your website domain
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Compress Objects Automatically: Yes

2. **Add cache behavior**:
   - Path pattern: `*.jpg|*.png|*.webp|*.css|*.js`
   - Cache policy: CachingOptimized
   - Origin request policy: CORS-S3Origin

---

## ⚙️ Step 3: Server Configuration

### If using Nginx

Add to your `nginx.conf`:

```nginx
# Enable Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json image/svg+xml;

# Enable Brotli compression (if module installed)
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json image/svg+xml;

# Cache headers for static assets
location ~* \.(jpg|jpeg|png|gif|webp|avif|ico|svg|css|js|woff|woff2|ttf)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}

# Cache headers for videos
location ~* \.(mp4|webm|ogg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}

# Enable HTTP/2
listen 443 ssl http2;
```

---

### If using Apache

Add to `.htaccess`:

```apache
# Enable Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json image/svg+xml
</IfModule>

# Cache headers for static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/avif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType video/mp4 "access plus 1 year"
</IfModule>

# Enable HTTP/2 (if supported by hosting)
<IfModule http2_module>
    Protocols h2 http/1.1
</IfModule>
```

---

## 🚀 Step 4: Update Your Build Process

### Add to `package.json`:

```json
{
  "scripts": {
    "optimize:images": "node scripts/optimize-images.js",
    "prebuild": "npm run optimize:images",
    "build": "vite build",
    "deploy": "npm run build && [your-deploy-command]"
  }
}
```

This ensures images are optimized before every production build.

---

## 📊 Step 5: Verify Performance

### Test with these tools:

1. **Google PageSpeed Insights**: https://pagespeed.web.dev/
   - Target: 90+ score on mobile and desktop

2. **WebPageTest**: https://www.webpagetest.org/
   - Check: Time to First Byte (TTFB) < 200ms
   - Check: First Contentful Paint (FCP) < 1.8s

3. **GTmetrix**: https://gtmetrix.com/
   - Target: A grade, fully loaded time < 3s

4. **Chrome DevTools Network Tab**:
   - Check images are served as WebP
   - Check cache headers are present
   - Check compression (gzip/brotli) is enabled

---

## 🎯 Expected Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Page Load Time | 5-8s | 1.5-2.5s | **70% faster** |
| Largest Image | 2-5MB | 200-500KB | **90% smaller** |
| Total Page Size | 15-25MB | 3-5MB | **80% smaller** |
| Time to Interactive | 8-12s | 2-4s | **75% faster** |
| Lighthouse Score | 40-60 | 85-95 | **+40 points** |

---

## 🔧 Troubleshooting

### Images still loading slowly?

1. **Check if CDN is active**:
   ```bash
   curl -I https://yourwebsite.com/image.jpg
   ```
   Look for `cf-cache-status` (Cloudflare) or `x-cache` (other CDNs)

2. **Verify WebP support**:
   - Open DevTools → Network tab
   - Check if images have `.webp` extension
   - Check response headers for `content-type: image/webp`

3. **Check compression**:
   ```bash
   curl -H "Accept-Encoding: gzip, deflate, br" -I https://yourwebsite.com/main.js
   ```
   Look for `content-encoding: br` or `gzip`

### CDN not caching?

- Check cache rules in CDN dashboard
- Verify no `Cache-Control: no-cache` headers in response
- Purge CDN cache and test again

---

## 📝 Maintenance Checklist

**Weekly:**
- [ ] Monitor CDN bandwidth usage
- [ ] Check for 404 errors in CDN logs

**Monthly:**
- [ ] Review PageSpeed Insights scores
- [ ] Check for new large images to optimize
- [ ] Update cache rules if needed

**Quarterly:**
- [ ] Audit total page size
- [ ] Review and optimize video files
- [ ] Test on real devices (mobile/tablet)

---

## 🎉 Quick Win Summary

**Do this NOW for instant improvements:**

1. ✅ Run `npm run optimize:images` (1 minute)
2. ✅ Sign up for Cloudflare (5 minutes)
3. ✅ Add your domain to Cloudflare (10 minutes)
4. ✅ Enable Auto Minify + Polish (2 minutes)
5. ✅ Test with PageSpeed Insights (1 minute)

**Total time: ~20 minutes for 70%+ performance boost!**

---

## 📞 Support

If you encounter issues:
1. Check the [Optimization Troubleshooting](#troubleshooting) section
2. Review the `optimization-map.json` file for image paths
3. Test with `npm run build` locally first before deploying

---

**Last Updated**: December 2025  
**Tested With**: Vite 5.x, React 18.x, Cloudflare CDN

