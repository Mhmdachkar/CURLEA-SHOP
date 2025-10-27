# CURLEA Quick SEO Reference

## 🚀 Quick Start (5 Minutes)

### 1. Build and Deploy
```bash
npm run build
# Deploy to Netlify
```

### 2. Submit Sitemap
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Sitemaps"
3. Enter: `https://curlea.netlify.app/sitemap.xml`
4. Click "Submit"

### 3. Verify
- Check: `https://curlea.netlify.app/robots.txt`
- Check: `https://curlea.netlify.app/sitemap.xml`

Done! ✅

---

## 📝 Using SEO Components

### Basic Usage
```tsx
import { SEOHead } from '@/components/SEOHead';
import { SEOPages } from '@/components/SEOHead';

function MyPage() {
  return (
    <>
      <SEOHead {...SEOPages.home} />
      {/* Your content */}
    </>
  );
}
```

### Custom SEO
```tsx
<SEOHead 
  title="Custom Page Title"
  description="Custom description under 160 characters"
  keywords="keyword1, keyword2, keyword3"
  image="/custom-og-image.jpg"
/>
```

---

## 🏷️ Structured Data

### Add to Page
```tsx
import { StructuredDataCollection, getOrganizationSchema } from '@/components/StructuredData';

function MyPage() {
  return (
    <>
      <StructuredDataCollection 
        schemas={[getOrganizationSchema()]} 
      />
    </>
  );
}
```

### For Product Pages
```tsx
import { getProductSchema } from '@/components/StructuredData';

const productSchema = getProductSchema(
  product.id,
  product.name,
  product.description,
  product.images,
  product.price
);

<StructuredData data={productSchema} />
```

---

## 🔄 Domain Transition (curlea.beauty)

### When Ready:
1. Update `config/seo.config.ts` → change `DOMAINS.current`
2. Update `netlify.toml` → add 301 redirects
3. Deploy
4. Submit new sitemap: `https://curlea.beauty/sitemap.xml`

### Redirect Template
```toml
# In netlify.toml
[[redirects]]
  from = "https://curlea.netlify.app/*"
  to = "https://curlea.beauty/:splat"
  status = 301
  force = true
```

---

## 🔍 Validation Tools

- **Google Rich Results**: https://search.google.com/test/rich-results
- **OG Image Preview**: https://developers.facebook.com/tools/debug/
- **Lighthouse**: Chrome DevTools → Lighthouse tab
- **Mobile-Friendly**: https://search.google.com/test/mobile-friendly

---

## 📊 Key Metrics to Track

- **PageSpeed**: 90+ (Lighthouse)
- **Mobile-Friendly**: Pass
- **Indexing**: 100% of pages
- **Organic Traffic**: Track weekly
- **Keyword Rankings**: Track monthly

---

## ⚡ Common Commands

```bash
# Build with sitemap
npm run build

# Check SEO status
npm run lint

# Validate structured data
# Visit: https://search.google.com/test/rich-results
```

---

## 🎯 Top 5 Keywords for CURLEA

1. **curly hair accessories** - Primary
2. **luxury hair accessories** - Secondary
3. **heatless curlers** - Product focus
4. **Curlea collection** - Branded
5. **elegant hair tools** - Lifestyle

---

## 📞 Need Help?

See full guide: `docs/SEO_SETUP_GUIDE.md`

