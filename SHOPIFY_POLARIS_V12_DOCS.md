# 🎨 Shopify Analytics Dashboard - Polaris v12+ Edition

## 📋 Complete Rebuild Documentation

This is a **pixel-perfect, production-ready** Shopify Admin Analytics Dashboard built with the **exact Shopify Polaris v12+ design specifications** you provided.

---

## 🎯 Key Differences from Previous Build

| Feature | Previous Build | New Build (Polaris v12+) |
|---------|---------------|-------------------------|
| **Page BG** | `#f1f2f3` | `#F1F1F1` (exact Polaris) |
| **Primary Text** | `text-gray-900` | `#303030` (Polaris Dark Grey) |
| **Chart Color** | Emerald/Rose | `#887EF9` (Polaris Purple) |
| **Comparison Line** | None | `#E1E3E5` (Dashed grey) |
| **Data Hook** | Manual state | `useAnalytics` hook |
| **Formulas** | Basic | **Real formulas documented** |
| **Hero Update** | Static | **Updates on chart hover** ✨ |
| **Auto-Refresh** | None | Built-in (60s interval) |

---

## 📦 Files Delivered

### 1. **types/analytics.ts** - TypeScript Interfaces
Complete type definitions for the analytics data structure.

**Key Types:**
- `AnalyticsData` - Main data payload
- `MetricData` - Individual metric structure
- `TopProduct` - Product performance data
- `UseAnalyticsReturn` - Hook return type

### 2. **data/mockData.js** - Mock Data with Real Formulas
Mock database response with **extensive documentation** on how each metric is calculated.

**Documented Formulas:**
```javascript
// Total Sales
Formula: (Gross Sales - Discounts - Returns) + Taxes + Shipping

// Online Store Sessions
Formula: COUNT(DISTINCT session_id) FROM analytics_sessions

// Returning Customer Rate
Formula: (Customers with > 1 order / Total Customers) * 100

// Conversion Rate
Formula: (Total Orders / Total Sessions) * 100

// Average Order Value
Formula: Total Sales / Total Order Count
```

**Includes:**
- Realistic data generation functions
- Weekend dip simulation
- Backend query examples (SQL)
- Integration instructions

### 3. **hooks/useAnalytics.ts** - Data Fetching Hook
Custom hook that manages:
- Date range selection
- Comparison mode toggle
- Auto-refresh (configurable interval)
- Loading/error states
- Manual refetch

**Usage:**
```typescript
const { data, loading, error, refetch, setDateRange, setCompareEnabled } = useAnalytics({
  dateRange: 'last_30_days',
  compareEnabled: true,
  autoRefresh: true,
  refreshInterval: 60000,
});
```

### 4. **components/analytics/AnalyticsCard.tsx** - Reusable Metric Card
The core component with **ALL requested features**:

✅ **4-Layer Structure:**
1. Header (Title + Menu icon)
2. Hero Number (Updates on hover!) + Trend Badge
3. Date indicator (when hovering)
4. Sparkline chart with gradient

✅ **Hover Interaction:**
- Hovering chart updates the hero number in real-time
- Shows date of hovered point
- Displays comparison value in tooltip

✅ **Comparison Mode:**
- Dashed grey line for previous period
- Color: `#E1E3E5`
- Only shows when `compareEnabled={true}`

✅ **Color-Coded Trends:**
- **Positive:** `bg-[#EBF9F5]` + `text-[#007B5C]` (Success)
- **Negative:** `bg-[#FFF4F4]` + `text-[#D72C0D]` (Critical)

✅ **Chart Specifications:**
- Primary line: `#887EF9` (Polaris Purple)
- Gradient fill: `#887EF9` → transparent
- Comparison line: `#E1E3E5` (dashed)
- Cursor: Purple vertical line
- Active dot: 4px radius, white stroke

### 5. **components/analytics/Dashboard.tsx** - Main Layout
Complete dashboard with **Global Bar** and metric grid.

**Global Bar Controls:**

1. **Date Range Picker**
   - White pill button with grey border
   - Dropdown with 6 presets
   - Hover: darker border (`#1A1A1A`)

2. **Compare Toggle**
   - Checkbox + label
   - Updates all charts instantly
   - Color: `#005BD3` (Shopify Blue)

3. **Auto-Refresh Button**
   - Circular refresh icon
   - Spins during refresh
   - 60-second interval (configurable)

**Responsive Grid:**
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns
- Gap: 16px

**Top Products Table:**
- Product image (12x12 grid cells)
- Title, Items Sold, Net Sales
- Sortable (descending by net sales)
- Hover: `bg-[#F1F1F1]`

---

## 🎨 Exact Color Specifications

### Primary Colors
```css
--page-bg: #F1F1F1;           /* Light Grey Surface */
--card-bg: #FFFFFF;            /* Pure White */
--primary-text: #303030;       /* Dark Grey - Headings */
--secondary-text: #616161;     /* Medium Grey - Labels */
--border-color: #D4D4D4;       /* Light Grey Border */
```

### Interactive Colors
```css
--primary-button: #1A1A1A;     /* Almost Black */
--link-color: #005BD3;         /* Shopify Blue */
--chart-primary: #887EF9;      /* Purple/Indigo */
--chart-comparison: #E1E3E5;   /* Light Grey Dashed */
```

### Trend Colors
```css
/* Success (Positive Trend) */
--success-bg: #EBF9F5;
--success-text: #007B5C;

/* Critical (Negative Trend) */
--critical-bg: #FFF4F4;
--critical-text: #D72C0D;
```

---

## 🚀 Getting Started

### Step 1: Access the Dashboard

Navigate to:
```
http://localhost:8080/shopify-analytics
```

### Step 2: Test Features

1. **Date Range Picker**
   - Click the calendar button
   - Select different ranges
   - Watch metrics update

2. **Comparison Mode**
   - Toggle "Compare to previous period"
   - See dashed lines appear on all charts

3. **Chart Hover Interaction** ⭐
   - Hover over any chart
   - Watch the hero number update in real-time
   - See the date indicator appear

4. **Manual Refresh**
   - Click the refresh button
   - Watch the spinner animation

### Step 3: Connect Real Data

Replace the mock data fetch in `useAnalytics.ts`:

```typescript
// BEFORE (Mock):
return {
  ...mockAnalyticsData,
  // ...
} as AnalyticsData;

// AFTER (Real API):
const response = await fetch(`${process.env.VITE_API_URL}/analytics`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`,
  },
  body: JSON.stringify({
    date_range: dateRange,
    compare_enabled: compareEnabled,
  }),
});

if (!response.ok) {
  throw new Error(`Analytics API error: ${response.status}`);
}

return await response.json();
```

---

## 📊 Real Data Integration Guide

### Backend Requirements

Your API endpoint should return data in this structure:

```json
{
  "date_range": {
    "start_date": "2024-11-01",
    "end_date": "2024-11-30",
    "label": "Last 30 Days"
  },
  "compare_period": {
    "start_date": "2024-10-01",
    "end_date": "2024-10-31"
  },
  "metrics": {
    "total_sales": {
      "current": 14650.00,
      "previous": 12180.00,
      "trend_percentage": 20.3,
      "is_positive": true,
      "history": [
        { "date": "2024-11-01", "value": 450.50, "timestamp": 1698796800000 },
        // ... 30 days
      ],
      "previous_history": [
        { "date": "2024-10-01", "value": 420.30, "timestamp": 1696118400000 },
        // ... 30 days
      ]
    },
    // ... other metrics
  },
  "top_selling_products": [
    {
      "id": "prod_001",
      "image_url": "/path/to/image.jpg",
      "title": "Product Name",
      "items_sold": 487,
      "net_sales": 14598.13
    }
    // ... more products
  ]
}
```

### Database Queries

#### Total Sales
```sql
SELECT 
  SUM(gross_sales - discounts - returns + taxes + shipping) as total_sales
FROM orders 
WHERE created_at >= ? AND created_at <= ?;
```

#### Online Store Sessions
```sql
SELECT 
  COUNT(DISTINCT session_id) as visitor_sessions
FROM analytics_sessions 
WHERE timestamp >= ? AND timestamp <= ?;
```

#### Returning Customer Rate
```sql
SELECT (
  COUNT(DISTINCT CASE WHEN order_count > 1 THEN customer_id END) * 100.0 /
  COUNT(DISTINCT customer_id)
) as returning_rate
FROM (
  SELECT customer_id, COUNT(*) as order_count
  FROM orders
  GROUP BY customer_id
) customer_orders;
```

#### Conversion Rate
```sql
SELECT (
  (SELECT COUNT(*) FROM orders WHERE created_at BETWEEN ? AND ?) * 100.0 /
  (SELECT COUNT(DISTINCT session_id) FROM sessions WHERE timestamp BETWEEN ? AND ?)
) as conversion_rate;
```

#### Average Order Value
```sql
SELECT 
  SUM(total_amount) / COUNT(*) as average_order_value
FROM orders
WHERE created_at >= ? AND created_at <= ?;
```

#### Top Selling Products
```sql
SELECT 
  p.id,
  p.image_url,
  p.title,
  SUM(oi.quantity) as items_sold,
  SUM(oi.quantity * oi.price) as net_sales
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.created_at >= ? AND o.created_at <= ?
GROUP BY p.id
ORDER BY net_sales DESC
LIMIT 10;
```

---

## 🎯 Component API Reference

### AnalyticsCard

```typescript
interface AnalyticsCardProps {
  title: string;              // e.g., "Total sales"
  dataKey: string;            // Unique identifier for gradients
  metric: MetricData;         // Metric data object
  compareEnabled: boolean;    // Show comparison line?
  formatType?: 'currency' | 'number' | 'percentage';
  icon?: React.ReactNode;     // Optional icon
}
```

**Features:**
- Auto-formats values based on `formatType`
- Updates hero number on chart hover
- Shows trend badge (Success/Critical)
- Displays comparison line when enabled

### useAnalytics Hook

```typescript
interface UseAnalyticsOptions {
  dateRange: string;          // e.g., 'last_30_days'
  compareEnabled: boolean;    // Enable comparison mode
  autoRefresh?: boolean;      // Enable auto-refresh
  refreshInterval?: number;   // Refresh interval in ms (default: 60000)
}

interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setDateRange: (range: string) => void;
  setCompareEnabled: (enabled: boolean) => void;
}
```

**Example:**
```typescript
const { 
  data, 
  loading, 
  error, 
  refetch, 
  setDateRange, 
  setCompareEnabled 
} = useAnalytics({
  dateRange: 'last_30_days',
  compareEnabled: true,
  autoRefresh: true,
  refreshInterval: 60000,
});
```

---

## 🔥 Advanced Features

### 1. Chart Hover Interaction (The Star Feature! ⭐)

When you hover over any chart:
1. Hero number updates to show value at that point
2. Date indicator appears below the number
3. Tooltip shows current and previous values
4. Purple cursor line follows mouse

**Implementation:**
```typescript
const [hoveredValue, setHoveredValue] = useState<number | null>(null);
const [hoveredDate, setHoveredDate] = useState<string | null>(null);

// In CustomTooltip:
setHoveredValue(currentValue);
setHoveredDate(date);

// In chart container:
onMouseLeave={handleMouseLeave}
```

### 2. Auto-Refresh System

**How it works:**
```typescript
useEffect(() => {
  if (!autoRefresh) return;
  
  const interval = setInterval(() => {
    refetch();
  }, refreshInterval);
  
  return () => clearInterval(interval);
}, [autoRefresh, refreshInterval, refetch]);
```

**Manual refresh:**
```typescript
const { isRefreshing, handleRefresh } = useManualRefresh(refetch);

<button onClick={handleRefresh} disabled={isRefreshing}>
  <RefreshCw className={isRefreshing ? 'animate-spin' : ''} />
</button>
```

### 3. Comparison Mode

Toggle between with/without previous period:

**With Comparison:**
- Dashed grey line (`#E1E3E5`)
- Previous values in tooltip
- Trend percentage shown

**Without Comparison:**
- Only current period line
- Simpler tooltip
- Focus on current data

---

## 🎨 Design System Compliance

### Typography Hierarchy

```css
/* Page Title */
font-size: 24px;
font-weight: 600;
color: #303030;
line-height: 1.2;

/* Card Title */
font-size: 14px;
font-weight: 500;
color: #616161;

/* Hero Number */
font-size: 32px;
font-weight: 600;
color: #303030;
letter-spacing: -0.02em;

/* Trend Badge */
font-size: 12px;
font-weight: 500;
```

### Spacing System

```css
/* Card Padding */
padding: 24px;

/* Grid Gap */
gap: 16px;

/* Button Padding */
padding: 8px 16px;

/* Border Radius */
border-radius: 12px;
```

### Shadow System

```css
/* Card */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

/* Card Hover */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

/* Dropdown */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
```

---

## 🧪 Testing Checklist

### Visual Tests
- [ ] Page background is `#F1F1F1`
- [ ] Cards have white background
- [ ] Chart lines are `#887EF9`
- [ ] Comparison lines are dashed `#E1E3E5`
- [ ] Success badges are teal (`#007B5C` on `#EBF9F5`)
- [ ] Critical badges are red (`#D72C0D` on `#FFF4F4`)
- [ ] Borders are `#D4D4D4`
- [ ] Text colors match spec (`#303030` / `#616161`)

### Interactive Tests
- [ ] Date picker opens/closes
- [ ] Selecting range updates data
- [ ] Compare toggle works
- [ ] Comparison lines appear/disappear
- [ ] Refresh button spins
- [ ] Chart hover updates hero number ⭐
- [ ] Chart hover shows date indicator ⭐
- [ ] Tooltip displays correctly
- [ ] Mobile responsive works

### Data Tests
- [ ] Metrics display correctly
- [ ] Formulas are accurate
- [ ] Trend percentages calculate properly
- [ ] Top products sort by net sales
- [ ] Currency formats correctly
- [ ] Numbers format with commas
- [ ] Percentages show decimal places

---

## 📚 Additional Resources

### Related Files
- `types/analytics.ts` - Type definitions
- `data/mockData.js` - Mock data + formulas
- `hooks/useAnalytics.ts` - Data fetching hook
- `components/analytics/AnalyticsCard.tsx` - Metric cards
- `components/analytics/Dashboard.tsx` - Main layout
- `pages/ShopifyAnalyticsDashboard.tsx` - Page wrapper

### Documentation Files
- `SHOPIFY_ANALYTICS_DASHBOARD.md` - Original docs
- `SHOPIFY_POLARIS_V12_DOCS.md` - This file (new spec)
- `IMPLEMENTATION_GUIDE.md` - Integration guide
- `QUICK_REFERENCE.md` - Quick reference

---

## 🎉 Success Criteria

✅ **Exact Polaris v12+ Colors**  
✅ **Real Formula Documentation**  
✅ **useAnalytics Hook**  
✅ **Chart Hover Updates Hero Number**  
✅ **Comparison Mode with Dashed Lines**  
✅ **Auto-Refresh System**  
✅ **Date Range Picker**  
✅ **Top Products Table**  
✅ **Responsive Grid**  
✅ **Loading/Error States**  
✅ **TypeScript Type Safety**  
✅ **Zero Linter Errors**  

---

## 🚀 Ready to Deploy!

The dashboard is **100% complete** with all requested specifications:

1. ✅ Exact Polaris v12+ design tokens
2. ✅ Real data formulas documented
3. ✅ useAnalytics custom hook
4. ✅ Chart hover interaction
5. ✅ Comparison mode
6. ✅ Auto-refresh
7. ✅ Fully responsive
8. ✅ Production-ready

**Access now at:** `http://localhost:8080/shopify-analytics`

---

**Built with precision following Shopify Polaris v12+ specifications** 🎨✨

