# Professional Pricing Management System

## Overview

This professional pricing system allows you to manage real product prices through Supabase, replacing the fake/test prices that were previously hardcoded. **Supabase is now the source of truth for all product prices.**

## Key Features

✅ **Database-Driven Prices**: All prices are stored in Supabase and override local product prices  
✅ **Professional Admin Interface**: Easy-to-use pricing management UI in the Analytics Dashboard  
✅ **Real-Time Updates**: Price changes immediately reflect across the website  
✅ **Batch Updates**: Update multiple product prices at once  
✅ **Cost Tracking**: Manage COGS (Cost of Goods Sold) for profit calculations  
✅ **Sale Prices**: Set "Compare At" prices for displaying discounts  
✅ **Fallback Support**: Falls back to local prices if Supabase is unavailable

## How It Works

### 1. Price Priority System

When displaying products, the system follows this priority:
1. **Supabase Price** (if available) ← **Source of Truth**
2. Local Product Price (fallback if Supabase unavailable)

### 2. Price Merging

The system automatically merges:
- Local product data (name, description, images, etc.)
- Supabase price data (price, compare_at_price, cost)

This ensures all product information stays up-to-date while using real prices from the database.

## Using the Pricing Management Interface

### Access the Pricing Dashboard

1. Navigate to the **Analytics Dashboard**
2. Click on the **"Pricing"** tab
3. You'll see all products with their current prices

### Update a Single Product Price

1. Find the product you want to update
2. Click the **"Edit"** button
3. Enter the new price, compare at price (optional), and cost (optional)
4. Click **"Save"** or the save icon

### Batch Update Multiple Products

1. Click **"Edit"** on multiple products
2. Make your changes
3. Click **"Save All Changes"** button at the top

### Price Fields Explained

- **Current Price**: The selling price customers will see
- **Compare At Price**: Original price (for showing discounts)
- **Cost (COGS)**: Cost of Goods Sold (for profit calculations)
- **Local Price**: Original price from `products.ts` file (for reference)

## Using Real Prices in Your Code

### Option 1: Use the Hook (Recommended)

```typescript
import { useProductsWithRealPrices } from '@/hooks/useProductsWithRealPrices';

function MyComponent() {
  const { products, loading, error } = useProductsWithRealPrices();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>Price: {product.price}</p>
          {product.originalPrice && (
            <p>Was: {product.originalPrice}</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Option 2: Get Single Product with Real Price

```typescript
import { useProductWithRealPrice } from '@/hooks/useProductsWithRealPrices';

function ProductPage({ productId }) {
  const { product, loading, error } = useProductWithRealPrice(productId);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>Price: {product.price}</p>
      {product.numericPrice && (
        <p>Numeric price for calculations: ${product.numericPrice}</p>
      )}
    </div>
  );
}
```

### Option 3: Direct Function Call

```typescript
import { getProductsWithRealPrices, getProductWithRealPrice } from '@/utils/supabase/products';

// Get all products
const { products, errors } = await getProductsWithRealPrices();

// Get single product
const { product, error } = await getProductWithRealPrice('product-id');
```

## API Functions

### Update Product Price

```typescript
import { updateProductPrice } from '@/utils/supabase/products';

await updateProductPrice(
  'product-id',           // product ID
  29.99,                  // new price
  39.99,                  // compare at price (optional)
  15.00                   // cost/COGS (optional)
);
```

### Batch Update Prices

```typescript
import { batchUpdateProductPrices } from '@/utils/supabase/products';

const result = await batchUpdateProductPrices([
  {
    productId: 'product-1',
    price: 29.99,
    compareAtPrice: 39.99,
    cost: 15.00
  },
  {
    productId: 'product-2',
    price: 49.99
  }
]);

console.log(`Updated: ${result.success}, Failed: ${result.failed}`);
```

## Migration Guide

### Step 1: Sync Products to Supabase

Before using real prices, make sure all products are synced to Supabase:

1. Go to Analytics Dashboard
2. Click "Sync Products" button
3. Wait for sync to complete

### Step 2: Update Prices

1. Go to the **Pricing** tab in Analytics Dashboard
2. Review all products
3. Update prices from fake/test values to real prices
4. Save changes

### Step 3: Update Your Code (Optional)

If you want to use real prices in existing components:

**Before:**
```typescript
import { products } from '@/data/products';
```

**After:**
```typescript
import { useProductsWithRealPrices } from '@/hooks/useProductsWithRealPrices';

const { products } = useProductsWithRealPrices();
```

## Best Practices

1. **Always use Supabase prices** - Don't hardcode prices in your components
2. **Update prices in the dashboard** - Use the Pricing Management interface
3. **Keep local prices as fallback** - Maintain accurate prices in `products.ts` as backup
4. **Track costs** - Fill in COGS to enable profit calculations
5. **Use compare_at_price for sales** - Show customers the savings

## Troubleshooting

### Prices not updating?

1. Check if products are synced to Supabase
2. Verify Supabase connection in environment variables
3. Check browser console for errors
4. Ensure you're using the `useProductsWithRealPrices` hook

### Fallback to local prices?

If Supabase is unavailable, the system automatically falls back to local prices. This ensures the website continues to function.

### Price format issues?

Prices in Supabase are stored as numbers (e.g., `29.99`). The system automatically formats them for display (e.g., `$29.99`).

## Database Schema

The `products` table in Supabase has these price-related columns:

- `price` (numeric) - Current selling price
- `compare_at_price` (numeric, nullable) - Original price for sales
- `cost` (numeric, nullable) - Cost of Goods Sold

All prices are stored in USD.

## Security Notes

- Pricing management requires admin access
- Prices are updated via authenticated Supabase calls
- Always validate prices before updating (minimum price, etc.)

---

**Need Help?** Check the Analytics Dashboard Pricing tab or review the code in:
- `src/components/PricingManagement.tsx`
- `src/utils/supabase/products.ts`
- `src/hooks/useProductsWithRealPrices.ts`

