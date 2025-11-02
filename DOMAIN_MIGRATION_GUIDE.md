# CURLEA Domain Migration Guide
## Transitioning from curlea.netlify.app to curlea.beauty

This comprehensive guide will walk you through all the steps needed to complete your domain migration while preserving SEO value.

---

## 📋 Overview

You've purchased the domain `curlea.beauty` and need to migrate from the subdomain `curlea.netlify.app`. This guide covers:
- ✅ Code changes (already completed)
- ⚠️ DNS configuration
- ⚠️ Netlify domain setup
- ⚠️ Search Console updates
- ⚠️ Verification steps

---

## ✅ Code Changes (Already Completed)

The following files have been updated to use `curlea.beauty` as the primary domain:

### 1. SEO Configuration
- ✅ `config/seo.config.ts` - Updated `DOMAINS.current` to `curlea.beauty`
- ✅ Legacy domain moved to `DOMAINS.legacy` for redirects

### 2. SEO Components
- ✅ `src/components/SEOHead.tsx` - Now uses `DOMAINS.active` dynamically
- ✅ `src/components/StructuredData.tsx` - Updated all schema URLs
- ✅ `index.html` - Updated Open Graph and Twitter Card meta tags

### 3. Configuration Files
- ✅ `public/robots.txt` - Updated sitemap reference
- ✅ `scripts/generate-sitemap.js` - Updated to generate sitemap for curlea.beauty
- ✅ `netlify.toml` - Added 301 redirects from legacy subdomain

---

## 🔧 Step-by-Step Migration Process

### Step 1: Configure Domain in Netlify

1. **Log into Netlify Dashboard**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Select your site (curlea project)

2. **Add Custom Domain**
   - Go to **Site settings** → **Domain management**
   - Click **Add custom domain**
   - Enter: `curlea.beauty`
   - Click **Verify**

3. **Add www Subdomain (Optional but Recommended)**
   - Click **Add domain alias**
   - Enter: `www.curlea.beauty`
   - This will be automatically redirected to `curlea.beauty`

4. **Configure SSL Certificate**
   - Netlify will automatically provision an SSL certificate
   - Wait for SSL provisioning (usually 1-2 minutes)
   - Status should show "SSL certificate active"

---

### Step 2: Configure DNS Records

You need to configure DNS at your domain registrar (where you bought curlea.beauty).

#### Option A: Netlify DNS (Recommended)
1. In Netlify: **Domain settings** → **DNS**
2. Click **Add DNS zone**
3. Follow Netlify's instructions to update nameservers at your registrar
4. Netlify will automatically configure all necessary DNS records

#### Option B: Manual DNS Configuration
If using your registrar's DNS, add these records:

**A Record (Root Domain):**
```
Type: A
Name: @ (or leave blank)
Value: 75.2.60.5
TTL: 3600 (or automatic)
```

**CNAME Record (www Subdomain):**
```
Type: CNAME
Name: www
Value: curlea.netlify.app
TTL: 3600
```

**CNAME Record (for Netlify's subdomain verification):**
```
Type: CNAME
Name: _dnslink
Value: curlea.netlify.app
TTL: 3600
```

> **Note:** The IP address may change. Check Netlify's current IP at: [docs.netlify.com/domains-https/netlify-dns](https://docs.netlify.com/domains-https/netlify-dns/)

---

### Step 3: Verify DNS Propagation

Wait for DNS propagation (can take 24-48 hours, but often happens within a few hours):

1. **Check DNS Propagation**
   - Use [dnschecker.org](https://dnschecker.org)
   - Enter: `curlea.beauty`
   - Look for A records pointing to Netlify's IP

2. **Test Domain Access**
   - Try accessing: `https://curlea.beauty`
   - The site should load (may take a few minutes after DNS propagates)

3. **Test Redirects**
   - Visit: `https://curlea.netlify.app`
   - Should automatically redirect to `https://curlea.beauty`
   - Check that the redirect is a 301 (permanent redirect)

---

### Step 4: Update Environment Variables

1. **In Netlify Dashboard**
   - Go to **Site settings** → **Environment variables**
   - Add or update: `VITE_SITE_URL` = `https://curlea.beauty`

2. **Redeploy Site**
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Deploy site**
   - Or push a commit to trigger automatic deploy

---

### Step 5: Update Google Search Console

This is critical for preserving SEO rankings!

#### A. Add New Property
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **Add property**
3. Select **URL prefix** option
4. Enter: `https://curlea.beauty`
5. Verify ownership (use HTML tag method if needed)

#### B. Submit New Sitemap
1. In the new property, go to **Sitemaps**
2. Enter: `https://curlea.beauty/sitemap.xml`
3. Click **Submit**

#### C. Update Existing Property (curlea.netlify.app)
1. Go to your existing property: `https://curlea.netlify.app`
2. In **Settings** → **Change of address**
3. Select the new property: `https://curlea.beauty`
4. This tells Google about the domain migration

#### D. Request Reindexing (Important!)
1. In the new property, go to **URL Inspection**
2. Test key pages:
   - `https://curlea.beauty/`
   - `https://curlea.beauty/shop`
   - `https://curlea.beauty/collection`
3. For each page, click **Request Indexing**

---

### Step 6: Update Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. **Add site**: `https://curlea.beauty`
3. Verify ownership
4. Submit sitemap: `https://curlea.beauty/sitemap.xml`

---

### Step 7: Update Social Media & External Links

Update URLs in:
- ✅ Instagram bio/profile
- ✅ Facebook page
- ✅ Pinterest profile
- ✅ TikTok profile
- ✅ Twitter/X profile
- ✅ Any email signatures
- ✅ Business cards, marketing materials
- ✅ Google Business Profile (if applicable)

---

### Step 8: Verify Everything Works

#### SEO Verification Checklist:

- [ ] **Canonical URLs**: Check page source, should show `https://curlea.beauty/...`
- [ ] **Open Graph Tags**: Verify with [opengraph.xyz](https://www.opengraph.xyz)
- [ ] **Structured Data**: Test with [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] **Sitemap**: Verify `https://curlea.beauty/sitemap.xml` is accessible
- [ ] **Robots.txt**: Verify `https://curlea.beauty/robots.txt` shows correct sitemap
- [ ] **301 Redirects**: Test that `curlea.netlify.app` redirects properly
- [ ] **SSL Certificate**: Check for green padlock in browser
- [ ] **Site Speed**: Run [PageSpeed Insights](https://pagespeed.web.dev)

#### Redirect Testing:

Test these URLs should redirect to curlea.beauty:
```
https://curlea.netlify.app/ → https://curlea.beauty/
https://curlea.netlify.app/shop → https://curlea.beauty/shop
https://curlea.netlify.app/product/xxx → https://curlea.beauty/product/xxx
```

Use [redirect-checker.org](https://www.redirect-checker.org) to verify 301 status codes.

---

### Step 9: Monitor Migration

Monitor for the next 2-4 weeks:

1. **Google Search Console**
   - Check indexing status
   - Monitor search impressions and clicks
   - Watch for any crawl errors

2. **Analytics**
   - Monitor traffic patterns
   - Check for broken links or errors

3. **Search Rankings**
   - Track key keyword rankings
   - Use tools like Google Search Console or SEMrush

---

## 🚨 Important Notes

### SEO Preservation
- ✅ **301 redirects are in place** - This preserves SEO value from the old domain
- ✅ **Sitemap updated** - Search engines will discover new URLs
- ✅ **Canonical URLs updated** - Prevents duplicate content issues
- ⚠️ **Migration can take 2-4 weeks** for full effect in search results

### Timeline Expectations
- **DNS Propagation**: 1-48 hours (usually 1-4 hours)
- **SSL Certificate**: 1-2 minutes after DNS propagation
- **Search Engine Reindexing**: 1-2 weeks
- **Full Migration Complete**: 2-4 weeks

### What NOT to Do
- ❌ Don't remove the old domain property from Search Console immediately
- ❌ Don't remove 301 redirects for at least 6 months
- ❌ Don't change internal linking structure
- ❌ Don't panic if rankings fluctuate initially (normal during migration)

---

## 📞 Troubleshooting

### Domain Not Loading
- Check DNS propagation with [dnschecker.org](https://dnschecker.org)
- Verify DNS records at your registrar
- Check Netlify domain settings
- Wait for DNS propagation (can take up to 48 hours)

### SSL Certificate Issues
- Ensure DNS is fully propagated first
- Check Netlify SSL certificate status
- Try accessing via HTTP first, then HTTPS
- Contact Netlify support if issues persist

### Redirects Not Working
- Verify `netlify.toml` was deployed correctly
- Check Netlify deploy logs
- Test redirects with [redirect-checker.org](https://www.redirect-checker.org)
- Ensure redirect rules are in correct order

### Search Console Verification Fails
- Try different verification methods (HTML tag, DNS, file upload)
- Ensure you have access to add files/meta tags
- Check that verification code is in the correct location

---

## ✅ Migration Complete Checklist

Before considering the migration complete, verify:

- [ ] DNS fully propagated
- [ ] Domain accessible at `https://curlea.beauty`
- [ ] SSL certificate active
- [ ] 301 redirects working from old domain
- [ ] New property added to Google Search Console
- [ ] Change of address submitted in Search Console
- [ ] New sitemap submitted to Google
- [ ] New sitemap submitted to Bing
- [ ] Canonical URLs showing new domain
- [ ] Open Graph tags updated
- [ ] Structured data validated
- [ ] No broken links
- [ ] Analytics tracking new domain

---

## 📚 Additional Resources

- [Netlify Domain Setup Guide](https://docs.netlify.com/domains-https/custom-domains/)
- [Google Search Console Help](https://support.google.com/webmasters)
- [301 Redirect Guide](https://docs.netlify.com/routing/redirects/)
- [Domain Migration Best Practices](https://developers.google.com/search/docs/crawling-indexing/301-redirects)

---

## 🎉 Success!

Once all steps are complete, your site will be fully migrated to `curlea.beauty` with:
- ✅ Preserved SEO value through 301 redirects
- ✅ Updated canonical URLs
- ✅ Proper search engine indexing
- ✅ SSL certificate and security headers
- ✅ Optimized performance

**Congratulations on your new domain!** 🚀

