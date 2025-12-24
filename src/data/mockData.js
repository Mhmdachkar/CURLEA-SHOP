/**
 * Mock Analytics Data
 * 
 * This file simulates a real database response from your backend.
 * 
 * HOW TO INTEGRATE WITH YOUR REAL BACKEND:
 * ========================================
 * 
 * 1. Replace this mock data with API calls to your actual database
 * 2. Query your orders, sessions, and customer tables
 * 3. Apply the formulas documented below to calculate each metric
 * 4. Return data in this exact structure
 * 
 * SAMPLE BACKEND QUERIES (Pseudo-SQL):
 * =====================================
 * 
 * Total Sales:
 * SELECT SUM(gross_sales - discounts - returns + taxes + shipping) 
 * FROM orders 
 * WHERE created_at BETWEEN start_date AND end_date;
 * 
 * Online Store Sessions:
 * SELECT COUNT(DISTINCT session_id) 
 * FROM analytics_sessions 
 * WHERE timestamp BETWEEN start_date AND end_date;
 * 
 * Returning Customer Rate:
 * SELECT (
 *   COUNT(DISTINCT customer_id WHERE order_count > 1) / 
 *   COUNT(DISTINCT customer_id)
 * ) * 100
 * FROM customers;
 * 
 * Conversion Rate:
 * SELECT (
 *   COUNT(DISTINCT order_id) / 
 *   COUNT(DISTINCT session_id)
 * ) * 100
 * FROM orders JOIN analytics_sessions ON ...;
 * 
 * Average Order Value:
 * SELECT SUM(total_sales) / COUNT(order_id) 
 * FROM orders 
 * WHERE created_at BETWEEN start_date AND end_date;
 */

/**
 * Generate realistic historical data
 * @param {number} baseValue - Starting value
 * @param {number} days - Number of days to generate
 * @param {number} variance - Percentage variance (+/-)
 * @returns {Array} Array of history points
 */
function generateHistory(baseValue, days, variance = 0.15) {
  const history = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add random variance to create realistic fluctuations
    const randomVariance = (Math.random() - 0.5) * 2 * variance;
    const value = baseValue * (1 + randomVariance);
    
    // Weekend dip simulation (e-commerce is typically lower on weekends)
    const dayOfWeek = date.getDay();
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0;
    
    history.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * weekendMultiplier * 100) / 100,
      timestamp: date.getTime(),
    });
  }
  
  return history;
}

/**
 * Calculate metric data with comparison
 * @param {number} currentValue - Current period value
 * @param {number} previousValue - Previous period value
 * @param {number} days - Number of days for history
 * @returns {Object} Metric data object
 */
function calculateMetric(currentValue, previousValue, days = 30) {
  const trend_percentage = ((currentValue - previousValue) / previousValue) * 100;
  
  return {
    current: currentValue,
    previous: previousValue,
    trend_percentage: Math.round(trend_percentage * 10) / 10,
    is_positive: trend_percentage >= 0,
    history: generateHistory(currentValue / days, days),
    previous_history: generateHistory(previousValue / days, days),
  };
}

/**
 * MOCK DATABASE RESPONSE
 * Replace this with your actual API endpoint
 */
export const mockAnalyticsData = {
  date_range: {
    start_date: '2024-11-01',
    end_date: '2024-11-30',
    label: 'Last 30 Days',
  },
  compare_period: {
    start_date: '2024-10-01',
    end_date: '2024-10-31',
  },
  
  metrics: {
    /**
     * TOTAL SALES
     * ============
     * Formula: (Gross Sales - Discounts - Returns) + Taxes + Shipping
     * 
     * Example Calculation:
     * - Gross Sales: $15,000
     * - Discounts: -$1,200
     * - Returns: -$500
     * - Taxes: +$1,050
     * - Shipping: +$300
     * = $14,650
     */
    total_sales: calculateMetric(
      14650.00,  // Current period
      12180.00   // Previous period
    ),
    
    /**
     * ONLINE STORE SESSIONS
     * ======================
     * Formula: Count of unique session_id tokens within the date range
     * 
     * Backend Query:
     * SELECT COUNT(DISTINCT session_id) 
     * FROM analytics_sessions 
     * WHERE timestamp >= '2024-11-01' AND timestamp <= '2024-11-30';
     */
    visitor_sessions: calculateMetric(
      9850,      // Current period sessions
      8420       // Previous period sessions
    ),
    
    /**
     * RETURNING CUSTOMER RATE
     * ========================
     * Formula: (Customers with > 1 order / Total Customers) * 100
     * 
     * Example Calculation:
     * - Total Customers: 500
     * - Customers with >1 order: 78
     * - Rate: (78 / 500) * 100 = 15.6%
     * 
     * Backend Query:
     * SELECT (
     *   COUNT(DISTINCT CASE WHEN order_count > 1 THEN customer_id END) * 100.0 /
     *   COUNT(DISTINCT customer_id)
     * ) as returning_rate
     * FROM (
     *   SELECT customer_id, COUNT(*) as order_count
     *   FROM orders
     *   GROUP BY customer_id
     * ) customer_orders;
     */
    returning_customer_rate: calculateMetric(
      15.6,      // Current period (percentage)
      18.2       // Previous period (percentage)
    ),
    
    /**
     * ONLINE STORE CONVERSION RATE
     * =============================
     * Formula: (Total Orders / Total Sessions) * 100
     * 
     * Example Calculation:
     * - Total Orders: 145
     * - Total Sessions: 9,850
     * - Conversion Rate: (145 / 9850) * 100 = 1.47%
     * 
     * Backend Query:
     * SELECT (
     *   (SELECT COUNT(*) FROM orders WHERE created_at BETWEEN ? AND ?) * 100.0 /
     *   (SELECT COUNT(DISTINCT session_id) FROM sessions WHERE timestamp BETWEEN ? AND ?)
     * ) as conversion_rate;
     */
    conversion_rate: calculateMetric(
      1.47,      // Current period (percentage)
      1.25       // Previous period (percentage)
    ),
    
    /**
     * AVERAGE ORDER VALUE (AOV)
     * ==========================
     * Formula: Total Sales / Total Order Count
     * 
     * Example Calculation:
     * - Total Sales: $14,650
     * - Total Orders: 145
     * - AOV: $14,650 / 145 = $101.03
     * 
     * Backend Query:
     * SELECT SUM(total_amount) / COUNT(*) as average_order_value
     * FROM orders
     * WHERE created_at BETWEEN ? AND ?;
     */
    average_order_value: calculateMetric(
      101.03,    // Current period
      95.50      // Previous period
    ),
    
    /**
     * TOTAL ORDERS
     * =============
     * Formula: Count of completed orders within the date range
     * 
     * Backend Query:
     * SELECT COUNT(*) 
     * FROM orders 
     * WHERE status = 'completed' 
     *   AND created_at BETWEEN ? AND ?;
     */
    total_orders: calculateMetric(
      145,       // Current period
      127        // Previous period
    ),
  },
  
  /**
   * TOP SELLING PRODUCTS
   * ====================
   * Query: SELECT products with highest (quantity * price) in date range
   * Sort: Descending by net_sales
   * 
   * Backend Query:
   * SELECT 
   *   p.id,
   *   p.image_url,
   *   p.title,
   *   SUM(oi.quantity) as items_sold,
   *   SUM(oi.quantity * oi.price) as net_sales
   * FROM products p
   * JOIN order_items oi ON p.id = oi.product_id
   * JOIN orders o ON oi.order_id = o.id
   * WHERE o.created_at BETWEEN ? AND ?
   * GROUP BY p.id
   * ORDER BY net_sales DESC
   * LIMIT 10;
   */
  top_selling_products: [
    {
      id: 'prod_001',
      image_url: '/images/products/dreamcurl-original.jpg',
      title: 'Curlea DreamCurl Original Heatless Curling Kit',
      items_sold: 487,
      net_sales: 14598.13,
    },
    {
      id: 'prod_002',
      image_url: '/images/products/scrunchies.jpg',
      title: 'Silk Scrunchie Set (7-Pack)',
      items_sold: 356,
      net_sales: 5336.44,
    },
    {
      id: 'prod_003',
      image_url: '/images/products/dreamcurl-midi.jpg',
      title: 'Curlea DreamCurl Midi Kit',
      items_sold: 298,
      net_sales: 7447.02,
    },
    {
      id: 'prod_004',
      image_url: '/images/products/bonnet.jpg',
      title: 'Peau de Soie Bonnet',
      items_sold: 267,
      net_sales: 5337.33,
    },
    {
      id: 'prod_005',
      image_url: '/images/products/bunbons.jpg',
      title: 'Curlea Bun Bons Heatless Curling System',
      items_sold: 213,
      net_sales: 4896.87,
    },
    {
      id: 'prod_006',
      image_url: '/images/products/hair-oil.jpg',
      title: 'Nourishing Hair Oil Treatment',
      items_sold: 189,
      net_sales: 3402.00,
    },
    {
      id: 'prod_007',
      image_url: '/images/products/headband.jpg',
      title: 'Velvet Padded Headband',
      items_sold: 156,
      net_sales: 2340.00,
    },
    {
      id: 'prod_008',
      image_url: '/images/products/claw-clips.jpg',
      title: 'Satin Claw Clips (4-Pack)',
      items_sold: 143,
      net_sales: 1858.00,
    },
  ],
};

/**
 * DATE RANGE OPTIONS
 * ==================
 * Preset options for the date picker
 */
export const dateRangeOptions = [
  { label: 'Today', value: 'today', days: 1 },
  { label: 'Yesterday', value: 'yesterday', days: 1 },
  { label: 'Last 7 Days', value: 'last_7_days', days: 7 },
  { label: 'Last 30 Days', value: 'last_30_days', days: 30 },
  { label: 'Last 90 Days', value: 'last_90_days', days: 90 },
  { label: 'Last 365 Days', value: 'last_365_days', days: 365 },
];

/**
 * FORMATTING UTILITIES
 * ====================
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercentage = (value) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

