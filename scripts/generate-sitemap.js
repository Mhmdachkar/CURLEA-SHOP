const fs = require('fs');
const path = require('path');

// Read products data
const products = require('../src/data/products.ts');

// Base URL - will transition from netlify to beauty domain
const BASE_URL = process.env.BASE_URL || 'https://curlea.netlify.app';
const FUTURE_URL = 'https://curlea.beauty';

// Static pages
const staticPages = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/shop', changefreq: 'weekly', priority: 0.9 },
  { url: '/collection', changefreq: 'weekly', priority: 0.9 },
  { url: '/category/curly', changefreq: 'weekly', priority: 0.8 },
  { url: '/category/wavy', changefreq: 'weekly', priority: 0.8 },
  { url: '/category/straight', changefreq: 'weekly', priority: 0.8 },
];

// Dynamic product pages (mock data for now)
const productPages = [
  '/product/dreamcurl-original',
  '/product/dreamcurl-short-set',
  '/product/dreamcurl-midi',
  '/product/dreamcurl-jumbo',
  '/product/heatless-5',
  '/product/curly-clip-1',
  '/product/curly-scarf-1',
  '/product/curly-claw-1',
  '/product/songmay-hair-clips',
  '/product/curlea-comb',
];

// Generate sitemap XML
const generateSitemap = () => {
  const pages = [...staticPages, ...productPages.map(url => ({ url, changefreq: 'monthly', priority: 0.7 }))];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

// Generate and save sitemap
const sitemapContent = generateSitemap();
const distPath = path.join(__dirname, '../dist');
const publicPath = path.join(__dirname, '../public');

// Write to both dist and public for build and dev
[distPath, publicPath].forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.writeFileSync(path.join(dir, 'sitemap.xml'), sitemapContent);
    console.log(`✅ Sitemap generated at ${dir}/sitemap.xml`);
  }
});

// Also create for future domain
const sitemapFuture = sitemapContent.replace(new RegExp(BASE_URL, 'g'), FUTURE_URL);
[distPath, publicPath].forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.writeFileSync(path.join(dir, 'sitemap-curlea-beauty.xml'), sitemapFuture);
    console.log(`✅ Future sitemap generated at ${dir}/sitemap-curlea-beauty.xml`);
  }
});

console.log('🎉 Sitemap generation complete!');

