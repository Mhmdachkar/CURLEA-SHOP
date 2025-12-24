/**
 * Mock Analytics Data Structure
 * Replicates Shopify's Analytics API response
 */

export interface MetricData {
  value: number;
  compare_value: number;
  trend_percentage: number;
  history: number[];
}

export interface TopProduct {
  id: number;
  name: string;
  image: string;
  price: number;
  sold: number;
  revenue: number;
}

export interface SocialSource {
  name: string;
  sessions: number;
  percentage: number;
  color: string;
}

export interface AnalyticsPayload {
  date_range: string;
  compare_to: string;
  currency: string;
  metrics: {
    total_sales: MetricData;
    online_store_sessions: MetricData;
    returning_customer_rate: MetricData;
    online_store_conversion_rate: MetricData;
    average_order_value: MetricData;
    total_orders: MetricData;
  };
  top_products: TopProduct[];
  sales_by_social_source: SocialSource[];
}

export const mockAnalyticsData: AnalyticsPayload = {
  date_range: "Nov 1, 2024 - Nov 30, 2024",
  compare_to: "Oct 1, 2024 - Oct 31, 2024",
  currency: "USD",
  
  metrics: {
    total_sales: {
      value: 12450.00,
      compare_value: 10500.00,
      trend_percentage: 18.5,
      history: [320, 450, 380, 520, 680, 850, 920, 780, 890, 950, 1020, 1100, 980, 1150, 1200, 1050, 1180, 1250, 1100, 1300, 1150, 1220, 1280, 1350, 1200, 1320, 1400, 1180, 1250, 1300],
    },
    
    online_store_sessions: {
      value: 8450,
      compare_value: 7200,
      trend_percentage: 17.4,
      history: [180, 220, 250, 280, 310, 340, 360, 320, 350, 380, 400, 420, 390, 430, 450, 410, 440, 470, 420, 480, 440, 460, 490, 510, 470, 500, 530, 460, 490, 520],
    },
    
    returning_customer_rate: {
      value: 15.4,
      compare_value: 18.0,
      trend_percentage: -14.4,
      history: [18, 17.5, 17, 16.8, 16.5, 16.2, 16, 15.8, 15.7, 15.6, 15.5, 15.4, 15.3, 15.4, 15.5, 15.3, 15.2, 15.4, 15.6, 15.3, 15.5, 15.4, 15.6, 15.4, 15.3, 15.5, 15.4, 15.6, 15.5, 15.4],
    },
    
    online_store_conversion_rate: {
      value: 1.2,
      compare_value: 1.0,
      trend_percentage: 20.0,
      history: [0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.0, 1.15, 1.2, 1.25, 1.3, 1.15, 1.35, 1.4, 1.25, 1.3, 1.45, 1.2, 1.5, 1.3, 1.35, 1.4, 1.5, 1.35, 1.45, 1.55, 1.3, 1.4, 1.5],
    },
    
    average_order_value: {
      value: 147.34,
      compare_value: 138.50,
      trend_percentage: 6.4,
      history: [135, 138, 140, 142, 145, 147, 150, 144, 148, 151, 153, 155, 149, 156, 158, 152, 154, 159, 150, 160, 153, 155, 157, 161, 154, 158, 162, 151, 156, 160],
    },
    
    total_orders: {
      value: 84,
      compare_value: 76,
      trend_percentage: 10.5,
      history: [2, 3, 2, 4, 3, 5, 4, 3, 4, 5, 6, 5, 4, 6, 7, 5, 6, 8, 5, 7, 6, 7, 8, 9, 7, 8, 10, 6, 7, 9],
    },
  },
  
  top_products: [
    {
      id: 101,
      name: "Curlea DreamCurl Original Heatless Curling Kit",
      image: "/images/products/dreamcurl-original.jpg",
      price: 29.99,
      sold: 450,
      revenue: 13495.50,
    },
    {
      id: 102,
      name: "Silk Scrunchie Set (7-Pack)",
      image: "/images/products/scrunchies.jpg",
      price: 14.99,
      sold: 320,
      revenue: 4796.80,
    },
    {
      id: 103,
      name: "Curlea DreamCurl Midi Kit",
      image: "/images/products/dreamcurl-midi.jpg",
      price: 24.99,
      sold: 280,
      revenue: 6997.20,
    },
    {
      id: 104,
      name: "Peau de Soie Bonnet",
      image: "/images/products/bonnet.jpg",
      price: 19.99,
      sold: 245,
      revenue: 4897.55,
    },
    {
      id: 105,
      name: "Curlea Bun Bons Heatless Curling System",
      image: "/images/products/bunbons.jpg",
      price: 22.99,
      sold: 198,
      revenue: 4552.02,
    },
  ],
  
  sales_by_social_source: [
    {
      name: "Instagram",
      sessions: 3420,
      percentage: 40.5,
      color: "#E4405F",
    },
    {
      name: "TikTok",
      sessions: 2850,
      percentage: 33.7,
      color: "#000000",
    },
    {
      name: "Facebook",
      sessions: 1280,
      percentage: 15.1,
      color: "#1877F2",
    },
    {
      name: "Direct",
      sessions: 650,
      percentage: 7.7,
      color: "#6B7280",
    },
    {
      name: "Other",
      sessions: 250,
      percentage: 3.0,
      color: "#9CA3AF",
    },
  ],
};

/**
 * Format currency values
 */
export const formatCurrency = (value: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format percentage values
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers
 */
export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

