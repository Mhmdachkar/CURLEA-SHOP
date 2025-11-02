/**
 * CURLEA SEO Configuration
 * Manages all SEO-related settings including domain transition
 */

// Domain Configuration
export const DOMAINS = {
  // Current production domain (primary)
  current: 'https://curlea.beauty',
  
  // Legacy subdomain (for redirects)
  legacy: 'https://curlea.netlify.app',
  
  // Local development
  local: 'http://localhost:5173',
  
  // Get active domain based on environment
  get active(): string {
    if (import.meta.env.DEV) return this.local;
    if (import.meta.env.PROD) {
      return import.meta.env.VITE_SITE_URL || this.current;
    }
    return this.current;
  },
};

// SEO Defaults
export const SEO_DEFAULTS = {
  siteName: 'CURLEA',
  title: 'CURLEA - Luxury Hair Accessories for Curly Hair',
  description: 'Discover premium heatless curlers and elegant hair accessories by CURLEA. Transform your curly hair routine with our luxury collection.',
  defaultImage: '/assets/curlea-og-image.jpg',
  author: 'CURLEA',
  themeColor: '#ffffff',
};

// Social Media Links
export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/curlea',
  pinterest: 'https://www.pinterest.com/curlea',
  tiktok: 'https://www.tiktok.com/@curlea',
  twitter: 'https://twitter.com/curlea_official',
  facebook: 'https://www.facebook.com/curlea',
};

// Contact Information
export const CONTACT_INFO = {
  email: 'hello@curlea.com',
  phone: '+1-800-CURLEA',
  address: {
    street: '123 Luxury Lane',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'USA',
  },
};

// Keywords per category
export const KEYWORDS = {
  general: 'curly hair accessories, luxury hair accessories, CURLEA, hair accessories for curly hair, elegant hair tools, premium hair products',
  heatless: 'heatless curlers, overnight curls, no heat curling, safe hair styling, DreamCurl, heatless curling system',
  clips: 'hair clips for curly hair, luxury hair clips, stylish hair accessories, bobby pins, hair styling tools',
  collection: 'curly hair collection, wavy hair products, straight hair accessories, hair care tools, styling accessories',
};

// Page-specific SEO configurations
export const PAGE_SEO = {
  home: {
    title: 'CURLEA - Luxury Hair Accessories | Elegant Tools for Curly Hair',
    description: 'Discover CURLEA\'s collection of premium heatless curlers and elegant hair accessories. Transform your curly hair routine with luxury products designed for beautiful, healthy hair.',
    keywords: KEYWORDS.general,
    path: '/',
  },
  shop: {
    title: 'Shop CURLEA Collection - Premium Hair Accessories',
    description: 'Browse our complete collection of luxury hair accessories for curly, wavy, and straight hair. Find the perfect styling tools to enhance your natural beauty.',
    keywords: KEYWORDS.general + ', shop hair accessories, buy heatless curlers',
    path: '/shop',
  },
  curly: {
    title: 'Curly Hair Collection - CURLEA Premium Accessories',
    description: 'Explore our curated collection of premium hair accessories specifically designed for curly hair. From comfortable hair clips to styling tools, enhance your natural curls.',
    keywords: 'curly hair accessories, curly hair clips, curly hair tools, products for curly hair, ' + KEYWORDS.collection,
    path: '/category/curly',
  },
  wavy: {
    title: 'DreamCurl™ Collection - Heatless Curlers by CURLEA',
    description: 'Effortless curls, no heat, no damage. Professional heatless curling system designed to protect your hair while creating beautiful, voluminous curls overnight.',
    keywords: KEYWORDS.heatless + ', CURLEA products, DreamCurl collection',
    path: '/category/wavy',
  },
};

// Schema markup defaults
export const SCHEMA_DEFAULTS = {
  brand: {
    '@type': 'Organization',
    name: 'CURLEA',
    url: DOMAINS.active,
    logo: `${DOMAINS.active}/assets/curlea-logo.png`,
    description: SEO_DEFAULTS.description,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: CONTACT_INFO.phone,
      contactType: 'Customer Service',
      email: CONTACT_INFO.email,
      areaServed: 'US',
      availableLanguage: ['English'],
    },
    sameAs: Object.values(SOCIAL_LINKS),
  },
};

// OG Image configuration
export const OG_CONFIG = {
  defaultImage: SEO_DEFAULTS.defaultImage,
  imageWidth: 1200,
  imageHeight: 630,
  twitterImageWidth: 1200,
  twitterImageHeight: 675,
};

// Canonical URL helper
export const getCanonicalUrl = (path: string = ''): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${DOMAINS.active}${cleanPath}`;
};

// Check if using primary domain
export const isPrimaryDomain = (): boolean => {
  return window.location.hostname.includes('curlea.beauty');
};

// Legacy domain redirect helper
export const getRedirectUrl = (path: string = ''): string => {
  return `${DOMAINS.current}${path}`;
};

