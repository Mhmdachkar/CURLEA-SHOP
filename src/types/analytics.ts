/**
 * Analytics Data Types
 * TypeScript interfaces for Shopify Analytics Dashboard
 */

export interface DateRangeOption {
  label: string;
  value: string;
  days: number;
}

export interface MetricData {
  current: number;
  previous: number;
  trend_percentage: number;
  is_positive: boolean;
  history: HistoryPoint[];
  previous_history?: HistoryPoint[];
}

export interface HistoryPoint {
  date: string;
  value: number;
  timestamp: number;
}

export interface TopProduct {
  id: string;
  image_url: string;
  title: string;
  items_sold: number;
  net_sales: number;
  variant?: string;
}

export interface AnalyticsData {
  date_range: {
    start_date: string;
    end_date: string;
    label: string;
  };
  compare_period?: {
    start_date: string;
    end_date: string;
  };
  metrics: {
    /**
     * Total Sales
     * Formula: (Gross Sales - Discounts - Returns) + Taxes + Shipping
     */
    total_sales: MetricData;
    
    /**
     * Online Store Sessions
     * Formula: Count of unique session_id tokens within the date range
     */
    visitor_sessions: MetricData;
    
    /**
     * Returning Customer Rate
     * Formula: (Customers with > 1 order / Total Customers) * 100
     */
    returning_customer_rate: MetricData;
    
    /**
     * Online Store Conversion Rate
     * Formula: (Total Orders / Total Sessions) * 100
     */
    conversion_rate: MetricData;
    
    /**
     * Average Order Value (AOV)
     * Formula: Total Sales / Total Order Count
     */
    average_order_value: MetricData;
    
    /**
     * Total Orders
     * Formula: Count of completed orders within the date range
     */
    total_orders: MetricData;
  };
  top_selling_products: TopProduct[];
}

export interface UseAnalyticsOptions {
  dateRange: string;
  compareEnabled: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setDateRange: (range: string) => void;
  setCompareEnabled: (enabled: boolean) => void;
}

