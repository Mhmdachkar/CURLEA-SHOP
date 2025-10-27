import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
}

export const SEOHead = ({
  title = 'CURLEA - Luxury Hair Accessories for Curly Hair',
  description = 'Discover premium heatless curlers and elegant hair accessories by CURLEA. Transform your curly hair routine with our luxury collection.',
  image = 'https://curlea.netlify.app/assets/hero-1.png',
  url,
  type = 'website',
  keywords = 'curly hair accessories, luxury hair clips, heatless curlers, CURLEA, curly hair care, hair accessories for curly hair, elegant hair tools, premium hair products',
}: SEOHeadProps) => {
  const location = useLocation();
  
  // Get full URL
  const fullUrl = url || `https://curlea.netlify.app${location.pathname}`;
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      const selector = `meta[${attribute}="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'CURLEA');
    
    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'CURLEA', true);
    updateMetaTag('og:locale', 'en_US', true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', '@curlea_official');
    updateMetaTag('twitter:creator', '@curlea_official');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    
    // Canonical URL
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = fullUrl;
    
    // Structured data will be handled separately
  }, [title, description, image, fullUrl, type, keywords, location.pathname]);
  
  return null;
};

// Predefined SEO configs for different pages
export const SEOPages = {
  home: {
    title: 'CURLEA - Luxury Hair Accessories | Elegant Tools for Curly Hair',
    description: 'Discover CURLEA\'s collection of premium heatless curlers and elegant hair accessories. Transform your curly hair routine with luxury products designed for beautiful, healthy hair.',
    keywords: 'CURLEA, curly hair accessories, heatless curlers, luxury hair products, curly hair care, elegant hair accessories, premium hair tools',
    image: 'https://curlea.netlify.app/assets/hero-1.png',
  },
  shop: {
    title: 'Shop CURLEA Collection - Premium Hair Accessories',
    description: 'Browse our complete collection of luxury hair accessories for curly, wavy, and straight hair. Find the perfect styling tools to enhance your natural beauty.',
    keywords: 'shop hair accessories, CURLEA products, buy heatless curlers, hair clips, satin bonnets, styling tools',
    image: 'https://curlea.netlify.app/assets/hero-4.png',
  },
  curly: {
    title: 'Curly Hair Collection - CURLEA Premium Accessories',
    description: 'Explore our curated collection of premium hair accessories specifically designed for curly hair. From comfortable hair clips to styling tools, enhance your natural curls.',
    keywords: 'curly hair accessories, curly hair clips, curly hair tools, products for curly hair',
    image: 'https://curlea.netlify.app/assets/curly-hair-collection/hero1.png',
  },
  wavy: {
    title: 'DreamCurl™ Collection - Heatless Curlers by CURLEA',
    description: 'Effortless curls, no heat, no damage. Professional heatless curling system designed to protect your hair while creating beautiful, voluminous curls overnight.',
    keywords: 'heatless curlers, DreamCurl, overnight curls, no heat curling, safe hair styling',
    image: 'https://curlea.netlify.app/assets/hero-4.png',
  },
  product: (productName: string, productDescription: string) => ({
    title: `${productName} by CURLEA - Premium Hair Accessories`,
    description: productDescription.substring(0, 160),
    image: 'https://curlea.netlify.app/assets/products/product-image.jpg',
  }),
};

