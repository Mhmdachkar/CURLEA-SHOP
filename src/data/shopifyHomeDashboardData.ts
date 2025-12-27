/**
 * Shopify Home Dashboard Overview - Mock Data
 * 
 * Exact data structure matching backend API response
 * Use these exact keys for backend integration
 */

export interface DateRange {
  start: string;
  end: string;
}

export interface DailyDataPoint {
  date: string;
  current: number;
  previous: number;
}

export interface MetricData {
  growth_rate: number;
  daily_data: DailyDataPoint[];
}

export interface SessionsMetric extends MetricData {
  total_count: number; // Maps to "Sessions"
}

export interface TotalSalesMetric extends MetricData {
  gross_amount: number; // Maps to "Total sales"
  currency: string; // "USD"
}

export interface TotalOrdersMetric extends MetricData {
  order_count: number; // Maps to "Orders"
}

export interface ConversionRateMetric extends MetricData {
  percentage: number; // Maps to "Conversion rate"
}

export interface DashboardMetrics {
  sessions: SessionsMetric;
  total_sales: TotalSalesMetric;
  total_orders: TotalOrdersMetric;
  conversion_rate: ConversionRateMetric;
}

export interface DashboardData {
  selected_date_range: DateRange;
  compare_date_range: DateRange;
  metrics: DashboardMetrics;
  live_visitors?: number; // For live visitor badge
  next_payout?: number; // For payout display
}

/**
 * MOCK DATA - Populated with values from the image
 * 
 * Data Mapping:
 * - Sessions: 1,083 (unique user sessions, not page views)
 * - Total Sales: $116,285.59 (Gross Sales - Discounts - Returns + Taxes + Shipping)
 * - Orders: 833 (completed checkouts with status: paid)
 * - Conversion Rate: 0% (Total Orders / Total Sessions) * 100
 */
export const mockDashboardData: DashboardData = {
  selected_date_range: {
    start: '2025-10-18',
    end: '2025-11-17',
  },
  compare_date_range: {
    start: '2025-09-17',
    end: '2025-10-17',
  },
  metrics: {
    sessions: {
      total_count: 1083,
      growth_rate: -3.0, // -3%
      daily_data: [
        { date: '2025-10-18', current: 45, previous: 52 },
        { date: '2025-10-19', current: 52, previous: 48 },
        { date: '2025-10-20', current: 38, previous: 55 },
        { date: '2025-10-21', current: 61, previous: 49 },
        { date: '2025-10-22', current: 55, previous: 58 },
        { date: '2025-10-23', current: 48, previous: 51 },
        { date: '2025-10-24', current: 67, previous: 54 },
        { date: '2025-10-25', current: 59, previous: 62 },
        { date: '2025-10-26', current: 44, previous: 47 },
        { date: '2025-10-27', current: 56, previous: 53 },
        { date: '2025-10-28', current: 62, previous: 59 },
        { date: '2025-10-29', current: 51, previous: 48 },
        { date: '2025-10-30', current: 58, previous: 55 },
        { date: '2025-10-31', current: 64, previous: 61 },
        { date: '2025-11-01', current: 49, previous: 46 },
        { date: '2025-11-02', current: 55, previous: 52 },
        { date: '2025-11-03', current: 61, previous: 58 },
        { date: '2025-11-04', current: 47, previous: 54 },
        { date: '2025-11-05', current: 53, previous: 50 },
        { date: '2025-11-06', current: 59, previous: 56 },
        { date: '2025-11-07', current: 65, previous: 62 },
        { date: '2025-11-08', current: 51, previous: 48 },
        { date: '2025-11-09', current: 57, previous: 54 },
        { date: '2025-11-10', current: 63, previous: 60 },
        { date: '2025-11-11', current: 48, previous: 45 },
        { date: '2025-11-12', current: 54, previous: 51 },
        { date: '2025-11-13', current: 60, previous: 57 },
        { date: '2025-11-14', current: 66, previous: 63 },
        { date: '2025-11-15', current: 52, previous: 49 },
        { date: '2025-11-16', current: 58, previous: 55 },
        { date: '2025-11-17', current: 64, previous: 61 },
      ],
    },
    total_sales: {
      gross_amount: 116285.59,
      currency: 'USD',
      growth_rate: 15.0, // +15%
      daily_data: [
        { date: '2025-10-18', current: 3850, previous: 3200 },
        { date: '2025-10-19', current: 4200, previous: 3500 },
        { date: '2025-10-20', current: 3100, previous: 3800 },
        { date: '2025-10-21', current: 4800, previous: 3400 },
        { date: '2025-10-22', current: 4500, previous: 3900 },
        { date: '2025-10-23', current: 3800, previous: 3300 },
        { date: '2025-10-24', current: 5200, previous: 3600 },
        { date: '2025-10-25', current: 4700, previous: 4100 },
        { date: '2025-10-26', current: 3600, previous: 3000 },
        { date: '2025-10-27', current: 4400, previous: 3500 },
        { date: '2025-10-28', current: 4900, previous: 3900 },
        { date: '2025-10-29', current: 4100, previous: 3200 },
        { date: '2025-10-30', current: 4600, previous: 3700 },
        { date: '2025-10-31', current: 5100, previous: 4000 },
        { date: '2025-11-01', current: 3900, previous: 3100 },
        { date: '2025-11-02', current: 4400, previous: 3500 },
        { date: '2025-11-03', current: 4900, previous: 3900 },
        { date: '2025-11-04', current: 3700, previous: 3600 },
        { date: '2025-11-05', current: 4200, previous: 3300 },
        { date: '2025-11-06', current: 4700, previous: 3800 },
        { date: '2025-11-07', current: 5200, previous: 4100 },
        { date: '2025-11-08', current: 4000, previous: 3200 },
        { date: '2025-11-09', current: 4500, previous: 3600 },
        { date: '2025-11-10', current: 5000, previous: 4000 },
        { date: '2025-11-11', current: 3800, previous: 3000 },
        { date: '2025-11-12', current: 4300, previous: 3400 },
        { date: '2025-11-13', current: 4800, previous: 3800 },
        { date: '2025-11-14', current: 5300, previous: 4200 },
        { date: '2025-11-15', current: 4100, previous: 3300 },
        { date: '2025-11-16', current: 4600, previous: 3700 },
        { date: '2025-11-17', current: 5100, previous: 4000 },
      ],
    },
    total_orders: {
      order_count: 833,
      growth_rate: 12.0, // +12%
      daily_data: [
        { date: '2025-10-18', current: 28, previous: 24 },
        { date: '2025-10-19', current: 32, previous: 26 },
        { date: '2025-10-20', current: 24, previous: 29 },
        { date: '2025-10-21', current: 36, previous: 25 },
        { date: '2025-10-22', current: 33, previous: 30 },
        { date: '2025-10-23', current: 28, previous: 24 },
        { date: '2025-10-24', current: 39, previous: 27 },
        { date: '2025-10-25', current: 35, previous: 31 },
        { date: '2025-10-26', current: 27, previous: 22 },
        { date: '2025-10-27', current: 33, previous: 26 },
        { date: '2025-10-28', current: 37, previous: 29 },
        { date: '2025-10-29', current: 31, previous: 24 },
        { date: '2025-10-30', current: 34, previous: 28 },
        { date: '2025-10-31', current: 38, previous: 30 },
        { date: '2025-11-01', current: 29, previous: 23 },
        { date: '2025-11-02', current: 33, previous: 26 },
        { date: '2025-11-03', current: 37, previous: 29 },
        { date: '2025-11-04', current: 28, previous: 27 },
        { date: '2025-11-05', current: 32, previous: 25 },
        { date: '2025-11-06', current: 35, previous: 28 },
        { date: '2025-11-07', current: 39, previous: 31 },
        { date: '2025-11-08', current: 30, previous: 24 },
        { date: '2025-11-09', current: 34, previous: 27 },
        { date: '2025-11-10', current: 38, previous: 30 },
        { date: '2025-11-11', current: 29, previous: 22 },
        { date: '2025-11-12', current: 33, previous: 25 },
        { date: '2025-11-13', current: 36, previous: 29 },
        { date: '2025-11-14', current: 40, previous: 32 },
        { date: '2025-11-15', current: 31, previous: 25 },
        { date: '2025-11-16', current: 35, previous: 28 },
        { date: '2025-11-17', current: 38, previous: 30 },
      ],
    },
    conversion_rate: {
      percentage: 0.0, // 0% (Total Orders / Total Sessions) * 100
      growth_rate: 0.0,
      daily_data: [
        { date: '2025-10-18', current: 0.62, previous: 0.46 },
        { date: '2025-10-19', current: 0.62, previous: 0.54 },
        { date: '2025-10-20', current: 0.63, previous: 0.53 },
        { date: '2025-10-21', current: 0.75, previous: 0.51 },
        { date: '2025-10-22', current: 0.60, previous: 0.52 },
        { date: '2025-10-23', current: 0.58, previous: 0.47 },
        { date: '2025-10-24', current: 0.58, previous: 0.50 },
        { date: '2025-10-25', current: 0.59, previous: 0.50 },
        { date: '2025-10-26', current: 0.61, previous: 0.47 },
        { date: '2025-10-27', current: 0.59, previous: 0.49 },
        { date: '2025-10-28', current: 0.60, previous: 0.49 },
        { date: '2025-10-29', current: 0.61, previous: 0.50 },
        { date: '2025-10-30', current: 0.59, previous: 0.51 },
        { date: '2025-10-31', current: 0.59, previous: 0.49 },
        { date: '2025-11-01', current: 0.59, previous: 0.50 },
        { date: '2025-11-02', current: 0.60, previous: 0.50 },
        { date: '2025-11-03', current: 0.61, previous: 0.50 },
        { date: '2025-11-04', current: 0.60, previous: 0.50 },
        { date: '2025-11-05', current: 0.61, previous: 0.76 },
        { date: '2025-11-06', current: 0.59, previous: 0.50 },
        { date: '2025-11-07', current: 0.60, previous: 0.50 },
        { date: '2025-11-08', current: 0.59, previous: 0.50 },
        { date: '2025-11-09', current: 0.60, previous: 0.50 },
        { date: '2025-11-10', current: 0.58, previous: 0.50 },
        { date: '2025-11-11', current: 0.60, previous: 0.46 },
        { date: '2025-11-12', current: 0.61, previous: 0.49 },
        { date: '2025-11-13', current: 0.60, previous: 0.51 },
        { date: '2025-11-14', current: 0.61, previous: 0.51 },
        { date: '2025-11-15', current: 0.60, previous: 0.51 },
        { date: '2025-11-16', current: 0.60, previous: 0.51 },
        { date: '2025-11-17', current: 0.59, previous: 0.49 },
      ],
    },
  },
  live_visitors: 1,
  next_payout: 0.0,
};

/**
 * Format currency values
 */
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
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
 * Format number with commas
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Format date for chart (e.g., "Oct 18")
 */
export const formatChartDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Format date range for legend (e.g., "Oct 18–Nov 17, 2025")
 */
export const formatDateRange = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startFormatted = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endFormatted = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startFormatted}–${endFormatted}`;
};


