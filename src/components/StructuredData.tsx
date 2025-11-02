import { DOMAINS } from '@/config/seo.config';

interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  description: string;
  contactPoint?: {
    "@type": "ContactPoint";
    telephone: string;
    contactType: string;
    email: string;
  };
  sameAs?: string[];
}

interface ProductSchema {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description: string;
  image: string[];
  sku?: string;
  brand: {
    "@type": "Brand";
    name: string;
  };
  offers: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
    availability: string;
    url: string;
  };
}

interface BreadcrumbSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

// Organization structured data
export const getOrganizationSchema = (): OrganizationSchema => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CURLEA",
  url: DOMAINS.active,
  logo: `${DOMAINS.active}/assets/curlea-logo.png`,
  description: "Premium luxury hair accessories and heatless curling tools designed for curly hair. Elevate your styling routine with elegant, professional-grade products.",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+1-800-CURLEA",
    contactType: "Customer Service",
    email: "hello@curlea.com",
  },
  sameAs: [
    "https://www.instagram.com/curlea",
    "https://www.pinterest.com/curlea",
    "https://www.tiktok.com/@curlea",
    "https://twitter.com/curlea_official",
  ],
});

// Product structured data
export const getProductSchema = (
  productId: string,
  name: string,
  description: string,
  images: string[],
  price: string,
  currency: string = "EUR"
): ProductSchema => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: name,
  description: description,
  image: images,
  sku: productId,
  brand: {
    "@type": "Brand",
    name: "CURLEA",
  },
  offers: {
    "@type": "Offer",
    price: price.replace(/[€$£]/g, '').trim(),
    priceCurrency: currency,
    availability: "https://schema.org/InStock",
    url: `${DOMAINS.active}/product/${productId}`,
  },
});

// Breadcrumb structured data
export const getBreadcrumbSchema = (
  items: { name: string; url: string }[]
): BreadcrumbSchema => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

// Component to inject structured data
export const StructuredData = ({ data }: { data: object }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

// Collection of structured data for a page
export const StructuredDataCollection = ({ schemas }: { schemas: object[] }) => {
  return (
    <>
      {schemas.map((schema, index) => (
        <StructuredData key={index} data={schema} />
      ))}
    </>
  );
};

