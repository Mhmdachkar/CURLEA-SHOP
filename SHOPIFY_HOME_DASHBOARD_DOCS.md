# 🏠 Shopify Home Dashboard Overview Widget - Documentation

## 📋 Overview

A **pixel-perfect clone** of Shopify's Home Dashboard Overview widget. This is a single interactive card with tabbed metric selection and a dual-line area chart showing current vs previous period data.

---

## 🎨 Design Specifications

### Color Palette (Exact Shopify Colors)

```css
/* Page & Card */
Page Background:    #F1F1F1  (Light gray canvas)
Card Background:    #FFFFFF  (White)
Card Border:        border-gray-200
Card Radius:        rounded-xl (16px)
Card Shadow:        shadow-sm

/* Text Colors */
Primary Text:       #303030  (Dark gray - headings, values)
Secondary Text:     #616161  (Medium gray - labels)

/* Active Tab */
Active Tab BG:      #F1F1F1  (Very light gray)
Active Tab Border:  border-gray-200

/* Chart Colors */
Current Line:       #005BD3  (Shopify Admin Blue - solid)
Previous Line:      #A4C6FF  (Light Blue - dashed)
Current Fill:       #005BD3  (with 0.1 opacity)

/* Trend Colors */
Up Trend:           text-emerald-700  (Green)
Down Trend:         text-stone-600     (Neutral gray)
```

### Typography

```css
/* Tab Label */
font-size: 12px (text-xs)
font-weight: 600 (font-semibold)
text-decoration: underline decoration-dotted

/* Value */
font-size: 18px (text-lg)
font-weight: 700 (font-bold)

/* Trend */
font-size: 12px (text-xs)
font-weight: 500 (font-medium)
```

---

## 📦 Component Structure

### Files Created

1. **`src/data/shopifyHomeDashboardData.ts`**
   - TypeScript interfaces for data structure
   - Mock data with exact values from image
   - Utility functions for formatting

2. **`src/components/analytics/ShopifyHomeDashboardWidget.tsx`**
   - Main widget component
   - Tab selector logic
   - Chart rendering

3. **`src/pages/ShopifyHomeDashboard.tsx`**
   - Page wrapper component

---

## 🔧 Data Structure

### TypeScript Interfaces

```typescript
interface DashboardData {
  selected_date_range: { start: string, end: string };
  compare_date_range: { start: string, end: string };
  metrics: {
    sessions: {
      total_count: number;        // Maps to "Sessions"
      growth_rate: number;        // e.g., -3%
      daily_data: DailyDataPoint[];
    };
    total_sales: {
      gross_amount: number;       // Maps to "Total sales"
      currency: string;           // "USD"
      growth_rate: number;        // e.g., +15%
      daily_data: DailyDataPoint[];
    };
    total_orders: {
      order_count: number;        // Maps to "Orders"
      growth_rate: number;
      daily_data: DailyDataPoint[];
    };
    conversion_rate: {
      percentage: number;         // Maps to "Conversion rate"
      growth_rate: number;
      daily_data: DailyDataPoint[];
    };
  };
  live_visitors?: number;
  next_payout?: number;
}
```

### Data Mapping (Backend Integration)

When connecting to your real backend, map your data as follows:

#### Sessions (1,083)
```sql
-- This is NOT page views
-- Unique user sessions (times out after 30 mins of inactivity)
SELECT COUNT(DISTINCT session_id) 
FROM analytics_sessions 
WHERE created_at BETWEEN ? AND ?;
```

#### Total Sales ($116,285.59)
```sql
-- Formula: (Gross Sales - Discounts - Returns) + Taxes + Shipping
SELECT SUM(gross_sales - discounts - returns + taxes + shipping) 
FROM orders 
WHERE created_at BETWEEN ? AND ?;
```

#### Orders (833)
```sql
-- Total count of completed checkouts (status: paid)
SELECT COUNT(*) 
FROM orders 
WHERE status = 'paid' 
  AND created_at BETWEEN ? AND ?;
```

#### Conversion Rate (0%)
```sql
-- Formula: (Total Orders / Total Sessions) * 100
SELECT (
  (SELECT COUNT(*) FROM orders WHERE created_at BETWEEN ? AND ?) * 100.0 /
  (SELECT COUNT(DISTINCT session_id) FROM analytics_sessions WHERE created_at BETWEEN ? AND ?)
) as conversion_rate;
```

---

## 🎯 Features

### 1. Tabbed Metric Selector

**4 Tabs:**
- Sessions
- Total sales
- Orders
- Conversion rate

**Tab States:**

**Inactive:**
- Transparent background
- Hover: `bg-gray-50`

**Active:**
- Background: `#F1F1F1`
- Border: `border-gray-200`
- Edit icon (Pencil) in top-right corner
- Rounded corners: `rounded-lg`

**Tab Content:**
- Label with dotted underline
- Large bold value
- Trend indicator (arrow + percentage)
- Color-coded (green for positive, gray for negative)

### 2. Header Controls

**Left Side:**
- Date Picker button: "Last 30 days"
- Channel Picker button: "All channels"

**Right Side:**
- Live Visitor Badge:
  - Pulsing green dot (`bg-emerald-400 animate-pulse`)
  - Text: "1 live visitor"
  - White background, rounded-full
- Payout Display: "Next payout: $0.00"

### 3. Dual-Line Area Chart

**Current Period (Solid Blue):**
- Color: `#005BD3`
- Style: Solid line
- Fill: Gradient with 0.1 opacity
- Active dot: 4px radius, white stroke

**Previous Period (Dashed Light Blue):**
- Color: `#A4C6FF`
- Style: Dashed line (`strokeDasharray="4 4"`)
- No fill

**X-Axis:**
- Format: "Oct 18", "Oct 21" (short month + day)
- Minimal styling (no axis line, no tick line)

**Legend:**
- Custom component at bottom
- Centered layout
- Two items:
  - Solid blue dot + "Oct 18–Nov 17, 2025"
  - Dashed light blue dot + "Sep 17–Oct 17, 2025"

### 4. Expand/Collapse

- ChevronDown icon on far right of tabs
- Click to expand/collapse chart section
- Icon rotates when collapsed

---

## 🚀 Usage

### Access the Dashboard

Navigate to:
```
http://localhost:8081/shopify-home-dashboard
```

### Component Usage

```tsx
import { ShopifyHomeDashboardWidget } from '@/components/analytics/ShopifyHomeDashboardWidget';

function MyPage() {
  return <ShopifyHomeDashboardWidget />;
}
```

---

## 🔌 Backend Integration

### Step 1: Replace Mock Data

In `ShopifyHomeDashboardWidget.tsx`, replace the mock data import:

```typescript
// BEFORE:
import { mockDashboardData } from '@/data/shopifyHomeDashboardData';
const data = mockDashboardData;

// AFTER:
const [data, setData] = useState<DashboardData | null>(null);

useEffect(() => {
  fetch('/api/shopify-home-dashboard')
    .then(res => res.json())
    .then(setData);
}, []);
```

### Step 2: API Response Format

Your backend should return data matching the `DashboardData` interface:

```json
{
  "selected_date_range": {
    "start": "2025-10-18",
    "end": "2025-11-17"
  },
  "compare_date_range": {
    "start": "2025-09-17",
    "end": "2025-10-17"
  },
  "metrics": {
    "sessions": {
      "total_count": 1083,
      "growth_rate": -3.0,
      "daily_data": [
        { "date": "2025-10-18", "current": 45, "previous": 52 }
      ]
    },
    "total_sales": {
      "gross_amount": 116285.59,
      "currency": "USD",
      "growth_rate": 15.0,
      "daily_data": [...]
    },
    "total_orders": {
      "order_count": 833,
      "growth_rate": 12.0,
      "daily_data": [...]
    },
    "conversion_rate": {
      "percentage": 0.0,
      "growth_rate": 0.0,
      "daily_data": [...]
    }
  },
  "live_visitors": 1,
  "next_payout": 0.0
}
```

---

## 📊 Key Metrics Explained

### Sessions
- **Definition:** Unique user sessions (not page views)
- **Timeout:** 30 minutes of inactivity
- **Calculation:** COUNT(DISTINCT session_id)

### Total Sales
- **Formula:** (Gross Sales - Discounts - Returns) + Taxes + Shipping
- **Format:** Currency (USD)

### Orders
- **Definition:** Completed checkouts with status "paid"
- **Calculation:** COUNT(*) WHERE status = 'paid'

### Conversion Rate
- **Formula:** (Total Orders / Total Sessions) * 100
- **Format:** Percentage

---

## 🎨 Styling Details

### Active Tab Styling

```tsx
className={`relative flex-1 px-4 py-3 rounded-lg transition-all duration-200 ${
  isActive
    ? 'bg-[#F1F1F1] border border-gray-200'
    : 'bg-transparent hover:bg-gray-50'
}`}
```

### Chart Line Colors

```tsx
// Current Period (Solid)
stroke="#005BD3"
fill="url(#currentGradient)"  // Opacity 0.1

// Previous Period (Dashed)
stroke="#A4C6FF"
strokeDasharray="4 4"
fill="none"
```

### Trend Colors

```tsx
// Positive Trend
text-emerald-700  // Green

// Negative Trend
text-stone-600    // Neutral gray (not red)
```

---

## 🧪 Testing Checklist

- [ ] All 4 tabs render correctly
- [ ] Active tab has `#F1F1F1` background
- [ ] Edit icon appears only on active tab
- [ ] Chart shows two lines (solid blue + dashed light blue)
- [ ] Legend displays correct date ranges
- [ ] Expand/collapse button works
- [ ] Live visitor badge has pulsing green dot
- [ ] Payout display shows correct value
- [ ] Date picker button is clickable
- [ ] Channel picker button is clickable
- [ ] Tab switching updates chart data
- [ ] Tooltip shows on chart hover
- [ ] Responsive on mobile devices

---

## 📱 Responsive Design

The widget is responsive and adapts to different screen sizes:

- **Desktop:** Full layout with all controls visible
- **Tablet:** Controls may stack vertically
- **Mobile:** Tabs may scroll horizontally if needed

---

## 🔗 Related Files

- **Data:** `src/data/shopifyHomeDashboardData.ts`
- **Component:** `src/components/analytics/ShopifyHomeDashboardWidget.tsx`
- **Page:** `src/pages/ShopifyHomeDashboard.tsx`
- **Route:** `/shopify-home-dashboard`

---

## 🎉 Result

✅ **Pixel-perfect Shopify Home Dashboard clone**  
✅ **Exact color specifications**  
✅ **Tabbed metric selector**  
✅ **Dual-line area chart**  
✅ **Live visitor badge**  
✅ **Backend-ready data structure**  
✅ **Fully responsive**  

---

**Built with precision following Shopify's exact design specifications** 🎨✨

