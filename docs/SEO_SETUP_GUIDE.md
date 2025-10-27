# CURLEA SEO & Visibility Foundation
## Complete Setup Guide

This guide will help you implement all Phase 1 SEO optimizations for CURLEA's transition from `curlea.netlify.app` to `curlea.beauty`.

---

## 🎯 Overview

CURLEA is positioning as a premium luxury hair accessory brand specializing in curly hair products. This SEO foundation ensures maximum discoverability and professional web presence.

---

## 📋 Table of Contents

1. [Technical SEO](#1-technical-seo)
2. [Metadata & Titles](#2-metadata--titles)
3. [Brand Keywords](#3-brand-keywords)
4. [Structured Data](#4-structured-data)
5. [Domain Transition](#5-domain-transition)
6. [Search Engine Registration](#6-search-engine-registration)
7. [Social Visibility](#7-social-visibility)
8. [Quality & Accessibility](#8-quality--accessibility)

---

## 1. Technical SEO

### ✅ Files Created
- `public/robots.txt` - Optimized for crawling
- `scripts/generate-sitemap.js` - Dynamic sitemap generator

### Implementation Steps

#### A. Build Sitemap Script
Add to `package.json`:
```json
"scripts": {
  "build": "vite build && node scripts/generate-sitemap.js",
  "build:netlify": "vite build --mode production && node scripts/generate-sitemap.js && npm run optimize-assets"
}
```

#### B. Verify robots.txt
1. Check `https://curlea.netlify.app/robots.txt`
2. Should allow all main pages, block admin/API endpoints
3. Sitemap location points to `/sitemap.xml`

#### C. Build Performance
Run Lighthouse audit:
```bash
npm run build
# Deploy to Netlify
# Run Lighthouse test
```

**Target Metrics:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

### Image Optimization Checklist
✅ All product images have descriptive alt text
✅ Images compressed and in WebP format
✅ Lazy loading implemented
✅ Responsive images with srcset

---

## 2. Metadata & Titles

### ✅ Files Created
- `src/components/SEOHead.tsx` - Dynamic metadata component
- Pre-configured SEO for: Home, Shop, Curly Collection, Wavy Collection, Product Pages

### Implementation

#### Add to each page:
```tsx
import { SEOHead } from '@/components/SEOHead';
import { SEOPages } from '@/components/SEOHead';

// In component
<SEOHead {...SEOPages.home} />
// or
<SEOHead {...SEOPages.shop} />
```

#### Home Page Example:
```tsx
<SEOHead 
  title="CURLEA - Luxury Hair Accessories | Elegant Tools for Curly Hair"
  description="Discover CURLEA's collection of premium heatless curlers and elegant hair accessories..."
  keywords="CURLEA, curly hair accessories, heatless curlers, luxury hair products"
/>
```

---

## 3. Brand Keywords

### Top 5 Brand Keywords
1. **curly hair accessories** - Primary
2. **luxury hair accessories** - Secondary  
3. **heatless curlers** - Product focus
4. **Curlea collection** - Branded
5. **elegant hair tools** - Lifestyle

### Keyword Density Guidelines
- **Title tags**: 1-2 keywords naturally placed
- **Headings (H1, H2)**: 1 keyword per heading
- **Meta description**: 1-2 keywords
- **Body content**: 2-3% keyword density max

### Example Implementation
```
H1: "Discover CURLEA's Curly Hair Collection"
H2: "Premium Luxury Hair Accessories"
Meta: "Shop elegant hair clips and heatless curlers..."
```

---

## 4. Structured Data

### ✅ Files Created
- `src/components/StructuredData.tsx` - Schema markup component
- Supports: Organization, Product, Breadcrumb schemas

### Implementation

#### In each page component:
```tsx
import { StructuredDataCollection, getOrganizationSchema } from '@/components/StructuredData';

// In component
<StructuredDataCollection 
  schemas={[
    getOrganizationSchema(),
    getProductSchema(product.id, product.name, ...),
    getBreadcrumbSchema([...items])
  ]} 
/>
```

#### Validate with Google
1. Go to [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Enter your URL
3. Verify all schemas are detected
4. Fix any errors

---

## 5. Domain Transition

### Current Setup: curlea.netlify.app
### Future Domain: curlea.beauty

### Step 1: Update Environment Variables

Create `.env.production`:
```bash
VITE_SITE_URL=https://curlea.beauty
VITE_NETLIFY_URL=https://curlea.netlify.app
```

### Step 2: Update References

Update in these files:
- `robots.txt` - Add new sitemap location
- `SEOHead.tsx` - Update BASE_URL
- `StructuredData.tsx` - Update all URLs
- `sitemap.xml` - Update domain

### Step 3: Configure 301 Redirects

Create/update `netlify.toml`:
```toml
[[redirects]]
  from = "https://curlea.netlify.app/*"
  to = "https://curlea.beauty/:splat"
  status = 301
  force = true
```

### Step 4: DNS Setup (When Ready)
1. Point `curlea.beauty` to Netlify servers
2. Wait for DNS propagation (24-48 hours)
3. Test redirects
4. Submit new sitemap to search engines

---

## 6. Search Engine Registration

### Google Search Console

#### A. Add Property
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property → `https://curlea.netlify.app`
3. Verify ownership (HTML tag method)

#### B. Submit Sitemap
```
URL: https://curlea.netlify.app/sitemap.xml
```

#### C. Monitor
- Check indexing status
- View search queries
- Monitor impressions & clicks
- Review Core Web Vitals

### Bing Webmaster Tools

#### A. Add Site
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add site → `https://curlea.netlify.app`
3. Verify ownership

#### B. Submit Sitemap
```
URL: https://curlea.netlify.app/sitemap.xml
```

### Google Analytics (GA4)

#### Setup
1. Create GA4 property
2. Add measurement ID to `.env`
3. Add tracking code to `index.html`

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 7. Social Visibility

### OG Image Guidelines

**Style:**
- Background: Soft pastel tones (peach, lavender, cream)
- Logo: Center or top-left
- Product: Right side with elegant framing
- Typography: Elegant, minimal

**Dimensions:**
- OG Image: 1200 x 630px
- Twitter Card: 1200 x 675px
- Facebook: 1200 x 630px

### Example OG Tags
```html
<meta property="og:title" content="CURLEA - Luxury Hair Accessories">
<meta property="og:description" content="Transform your curly hair routine with premium heatless curlers and elegant accessories.">
<meta property="og:image" content="https://curlea.beauty/og-image.jpg">
<meta property="og:url" content="https://curlea.beauty">
```

---

## 8. Quality & Accessibility

### Semantic HTML Checklist
✅ Use `<header>`, `<main>`, `<footer>`
✅ Use `<article>` for blog posts/products
✅ Use `<nav>` for navigation
✅ Use `<section>` for distinct page sections
✅ Proper heading hierarchy (H1 → H2 → H3)

### Accessibility Improvements

#### A. Text Contrast
- Ensure WCAG AA compliance (4.5:1 ratio)
- Test with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

#### B. Keyboard Navigation
- All interactive elements keyboard accessible
- Visible focus indicators

#### C. Screen Readers
- Proper alt text for images
- ARIA labels where needed
- Form labels properly associated

### Performance Optimization

#### Image Compression
```bash
# Use ImageOptim or similar
- Compress all images by 70-80%
- Convert to WebP format
- Use lazy loading
```

#### Code Splitting
```tsx
// Lazy load heavy components
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
```

---

## 📊 Monitoring & Success Metrics

### Weekly Tasks
- [ ] Check Google Search Console for indexing status
- [ ] Review keyword rankings
- [ ] Monitor page speed scores
- [ ] Check for broken links

### Monthly Tasks
- [ ] Review analytics data
- [ ] Update sitemap with new products
- [ ] Check competitor rankings
- [ ] Update meta descriptions if needed

### Success Indicators
- 100% of pages indexed within 2 weeks
- Organic traffic increase month-over-month
- Page load time under 2 seconds
- Mobile-friendly test passing 100%

---

## 🚀 Quick Start Checklist

- [ ] Run `npm run build` to generate sitemap
- [ ] Deploy to Netlify
- [ ] Verify robots.txt is accessible
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Add Google Analytics tracking
- [ ] Test all meta tags with [Open Graph Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Validate structured data with Google Rich Results Test
- [ ] Run Lighthouse audit
- [ ] Test mobile responsiveness

---

## 📞 Support

For questions or issues:
- Review each component's inline documentation
- Check console for any errors
- Test URLs in search engine testing tools

---

**Last Updated:** [Current Date]
**Version:** 1.0

