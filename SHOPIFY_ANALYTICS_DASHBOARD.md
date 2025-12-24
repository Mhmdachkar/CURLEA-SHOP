# 📊 Shopify Analytics Dashboard - Documentation

## Overview

A **pixel-perfect replica** of the Shopify Admin Analytics Dashboard built with React.js, TypeScript, and Tailwind CSS. This implementation strictly follows the **Shopify Polaris** design system aesthetics and provides a comprehensive analytics interface for tracking e-commerce performance.

---

## 🎨 Design System Implementation

### Visual Specifications

#### Color Palette
- **Page Background**: `#f1f2f3` (Light grey)
- **Card Background**: `#FFFFFF` (Pure white)
- **Primary Action**: `#008060` (Shopify teal)
- **Primary Hover**: `#006d52`
- **Positive Trends**: `#10b981` (Emerald green)
- **Negative Trends**: `#f43f5e` (Rose red)
- **Chart Colors**: Emerald/Rose with gradients

#### Typography
- **Font Family**: System fonts (Inter/San Francisco)
- **Headings**: `text-gray-900` (font-semibold)
- **Secondary Text**: `text-gray-600`
- **Labels**: `text-gray-500` (uppercase, text-xs)

#### Card Design
All metric cards follow these specifications:
- **Border Radius**: `rounded-lg`
- **Border**: `border border-gray-200`
- **Shadow**: `shadow-sm` (with `hover:shadow-md`)
- **Padding**: `p-[16px]` (consistent 16px)

---

## 🏗️ Architecture & Components

### Component Structure

```
src/
├── data/
│   └── mockAnalyticsData.ts          # Mock API data structure
├── components/
│   └── analytics/
│       ├── index.ts                   # Barrel export
│       ├── AnalyticsHeader.tsx        # Date picker & filters
│       ├── MetricCard.tsx             # Reusable metric tiles
│       ├── TopProductsTable.tsx       # Product performance table
│       └── SocialSourcesWidget.tsx    # Traffic source breakdown
└── pages/
    └── ShopifyAnalyticsDashboard.tsx  # Main dashboard layout
```

---

## 📦 Core Components

### 1. **MetricCard** (Reusable)

The foundation of the analytics UI. Each card has **4 layers**:

#### Props Interface
```typescript
interface MetricCardProps {
  title: string;              // Metric name
  value: string;              // Hero number (e.g., "$12,450.00")
  percentageChange: number;   // Trend percentage
  comparisonText: string;     // Context (e.g., "vs previous period")
  chartData: number[];        // Historical data for sparkline
  icon?: React.ReactNode;     // Optional icon
  currency?: boolean;         // Format tooltip as currency
  percentage?: boolean;       // Format tooltip as percentage
}
```

#### Visual Layers
1. **Header**: Title + More Options icon
2. **Hero Number**: Primary metric value (text-2xl, font-semibold)
3. **Trend Badge**: Color-coded badge with:
   - Arrow icon (up/down)
   - Percentage with dotted underline
   - Emerald (positive) or Rose (negative) background
4. **Sparkline Chart**: Mini area chart using Recharts

#### Features
- Framer Motion animations (fade-in, hover lift)
- Responsive Recharts area chart with gradients
- Dynamic color theming based on trend direction
- Tooltip on chart hover

---

### 2. **AnalyticsHeader**

Top navigation bar with filtering controls.

#### Features
- **Date Range Picker**: Dropdown with preset options
  - Today, Yesterday, Last 7/30/90 days
  - This month, Last month, This year
- **Compare Toggle**: Checkbox to enable/disable period comparison
- **Export Button**: Primary action button (Shopify teal)
- Sticky positioning (`sticky top-0 z-10`)
- Responsive layout (mobile-first)

---

### 3. **TopProductsTable**

Displays top 5 products by units sold.

#### Table Columns
| Column | Description | Alignment |
|--------|-------------|-----------|
| Product | Name + image + price | Left |
| Units Sold | Quantity with trend icon | Right |
| Revenue | Total revenue | Right |

#### Features
- Product thumbnail with fallback
- Staggered animation on load
- Hover state on rows
- "View all" and "View detailed report" CTAs

---

### 4. **SocialSourcesWidget**

Breakdown of traffic sources from social media.

#### Data Visualization
- Horizontal progress bars with custom colors
- Percentage breakdown
- Total sessions summary
- Custom colors per source:
  - Instagram: `#E4405F`
  - TikTok: `#000000`
  - Facebook: `#1877F2`
  - Direct: `#6B7280`
  - Other: `#9CA3AF`

---

## 📊 Data Structure

### Analytics Payload Schema

```typescript
interface AnalyticsPayload {
  date_range: string;           // e.g., "Nov 1, 2024 - Nov 30, 2024"
  compare_to: string;           // Comparison period
  currency: string;             // "USD"
  
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
```

### MetricData Structure

```typescript
interface MetricData {
  value: number;                // Current period value
  compare_value: number;        // Previous period value
  trend_percentage: number;     // % change (positive/negative)
  history: number[];            // 30-day historical data
}
```

### Utility Functions

```typescript
formatCurrency(value: number): string    // "$12,450.00"
formatPercentage(value: number): string  // "+18.5%"
formatNumber(value: number): string      // "1.2K" or "1.5M"
```

---

## 🎯 Key Metrics Tracked

### 1. **Total Sales**
**Formula**: `Gross Sales - Discounts - Returns + Taxes + Shipping`

### 2. **Online Store Sessions**
**Definition**: Total number of distinct user sessions

### 3. **Returning Customer Rate**
**Formula**: `(Customers with >1 order / Total Customers) × 100`

### 4. **Conversion Rate**
**Formula**: `(Total Orders / Total Sessions) × 100`

### 5. **Average Order Value (AOV)**
**Formula**: `Total Sales / Total Orders`

### 6. **Total Orders**
**Definition**: Count of completed orders

---

## 🚀 Usage

### Route Configuration

The dashboard is accessible at:
```
/shopify-analytics
```

### Implementation in Your App

```typescript
import ShopifyAnalyticsDashboard from '@/pages/ShopifyAnalyticsDashboard';

// In your routing setup:
<Route path="/shopify-analytics" element={<ShopifyAnalyticsDashboard />} />
```

### Using Mock Data

```typescript
import { mockAnalyticsData } from '@/data/mockAnalyticsData';

// Access metrics
const { metrics, top_products, sales_by_social_source } = mockAnalyticsData;
```

---

## 🎨 Tailwind Configuration

### Key Classes Used

#### Layout
```css
gap-4           /* Use gap- instead of space- (user preference) */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

#### Cards
```css
bg-white rounded-lg border border-gray-200 shadow-sm
hover:shadow-md transition-all duration-200
```

#### Typography
```css
text-2xl font-semibold text-gray-900 tracking-tight
text-sm text-gray-600
text-xs text-gray-500 uppercase
```

#### Colors
```css
bg-[#f1f2f3]    /* Page background */
bg-[#008060]    /* Shopify primary */
bg-emerald-50   /* Positive trend background */
text-emerald-700 /* Positive trend text */
bg-rose-50      /* Negative trend background */
text-rose-700   /* Negative trend text */
```

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 1 column grid
- **Tablet (md)**: 2 column grid
- **Desktop (lg)**: 3 column grid

### Mobile Optimizations
- Stacked header controls
- Single column metrics
- Horizontal scroll for table
- Touch-friendly button sizes (44px minimum)

---

## ⚡ Performance Optimizations

### Implemented Features
1. **Lazy Loading**: Dashboard loaded via React lazy()
2. **Framer Motion**: Optimized animations with GPU acceleration
3. **Recharts**: Efficient SVG-based charting
4. **Memoization**: Charts render only when data changes
5. **Code Splitting**: Separated from main bundle

---

## 🔧 Customization Guide

### Changing Colors

Edit `mockAnalyticsData.ts` and component styles:

```typescript
// Primary action color
bg-[#008060] → bg-[YOUR_COLOR]

// Chart colors in MetricCard.tsx
stopColor={isPositive ? '#10b981' : '#f43f5e'}
```

### Adding New Metrics

1. Add to `mockAnalyticsData.ts`:
```typescript
metrics: {
  your_new_metric: {
    value: 100,
    compare_value: 90,
    trend_percentage: 11.1,
    history: [/* 30 days */],
  }
}
```

2. Add MetricCard in dashboard:
```typescript
<MetricCard
  title="Your New Metric"
  value={metrics.your_new_metric.value.toString()}
  percentageChange={metrics.your_new_metric.trend_percentage}
  comparisonText="vs previous period"
  chartData={metrics.your_new_metric.history}
  icon={<YourIcon className="w-5 h-5" />}
/>
```

### Connecting Real API

Replace mock data with API calls:

```typescript
// In ShopifyAnalyticsDashboard.tsx
const [analyticsData, setAnalyticsData] = useState(null);

useEffect(() => {
  fetch('/api/analytics')
    .then(res => res.json())
    .then(data => setAnalyticsData(data));
}, []);
```

---

## 🧪 Testing Recommendations

### Visual Testing
- Test on Chrome, Safari, Firefox, Edge
- Verify hover states and animations
- Check responsive breakpoints (375px, 768px, 1024px, 1440px)

### Functional Testing
- Date range picker dropdown
- Compare toggle functionality
- Chart interactions and tooltips
- Button click handlers

### Accessibility
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader compatibility
- Color contrast ratios (WCAG AA)
- Focus indicators

---

## 📚 Dependencies

### Required Libraries
```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.30.1",
  "framer-motion": "^12.23.22",
  "lucide-react": "^0.462.0",
  "recharts": "^2.15.4",
  "tailwindcss": "^3.4.17"
}
```

---

## 🎓 Key Learnings & Best Practices

### Design System Adherence
- ✅ Consistent 16px padding (`p-[16px]`)
- ✅ System fonts for native feel
- ✅ Subtle shadows and borders
- ✅ Color-coded trends with semantic meaning

### Component Architecture
- ✅ Reusable MetricCard for all metrics
- ✅ Prop-driven customization
- ✅ Separation of concerns (data/UI)
- ✅ TypeScript interfaces for type safety

### User Experience
- ✅ Smooth animations (Framer Motion)
- ✅ Interactive charts with tooltips
- ✅ Loading states and fallbacks
- ✅ Clear visual hierarchy

---

## 🔗 Related Files

- **Main Dashboard**: `src/pages/ShopifyAnalyticsDashboard.tsx`
- **Mock Data**: `src/data/mockAnalyticsData.ts`
- **Components**: `src/components/analytics/*`
- **Routing**: `src/App.tsx` (line 31, 123)

---

## 🆘 Troubleshooting

### Charts Not Rendering
- Ensure `recharts` is installed: `npm install recharts`
- Verify data format matches MetricData interface

### Animations Laggy
- Check if GPU acceleration is enabled
- Reduce number of animated elements on mobile

### TypeScript Errors
- Ensure `@types/node` is installed
- Check tsconfig.json path aliases (`@/`)

---

## 🎉 Result

A production-ready, **pixel-perfect Shopify Analytics Dashboard** that:
- ✅ Matches Shopify Polaris design system
- ✅ Fully responsive (mobile to desktop)
- ✅ Animated and interactive
- ✅ Type-safe with TypeScript
- ✅ Extensible and customizable
- ✅ Performance optimized

---

## 📖 Further Reading

- [Shopify Polaris Design System](https://polaris.shopify.com/)
- [Recharts Documentation](https://recharts.org/)
- [Framer Motion API](https://www.framer.com/motion/)
- [Tailwind CSS Customization](https://tailwindcss.com/docs/customizing-colors)

---

**Built with ❤️ following Shopify's design excellence**

