# Update Product Prices - Quick Guide

## ✅ Local Prices Updated

All prices in `src/data/products.ts` have been updated with the real prices you provided:

| Product | New Price |
|---------|-----------|
| DreamCurl™ Original Set | $22.99 |
| DreamCurl™ Midi | $22.99 |
| DreamCurl™ JUMBO SIZE | $22.99 |
| ZERO HEAT SET MINI SIZE | $22.99 |
| BUN BONS - Heatless Curling System | $19.99 |
| DreamCurl™ Short Set | $16.99 |
| Curved Resin Hair Clip (9pcs) | $14.99 |
| Curved Resin Hair Clip (4pcs) | $8.99 |
| HC027D Fashion Solid Elegant Neutral Geometric Flower Hair Claw Clips | $15.99 |
| MIO Elegant Scarf - Soft Satin Hair Band & Scrunchies | $6.99 |
| SongMay Woman Hair Clips | $3.99 |
| CURLEA Comb | $2.99 |

## 🔄 Update Supabase Prices (Recommended)

To update prices in Supabase (the source of truth), you have **3 options**:

### Option 1: Use the Pricing Management Dashboard (Easiest)

1. Go to your Analytics Dashboard
2. Click on the **"Pricing"** tab
3. All products will be listed with their current prices
4. Click **"Edit"** on each product
5. Update the prices to match the new values above
6. Click **"Save"** or use **"Save All Changes"** for batch updates

### Option 2: Run the Update Script

```bash
# Make sure you have your Supabase credentials in .env file
# Then run:
node scripts/update-product-prices.js
```

**Note:** The script requires:
- `VITE_SUPABASE_URL` in your .env file
- `SUPABASE_SERVICE_ROLE_KEY` or `VITE_SUPABASE_ANON_KEY` in your .env file

### Option 3: Manual Supabase Update

1. Go to your Supabase Dashboard
2. Navigate to the `products` table
3. Update each product's `price` field manually

## 📝 What Was Updated

- ✅ All main product prices in `src/data/products.ts`
- ✅ All duplicate entries (e.g., dreamcurl-midi, dreamcurl-jumbo appear twice)
- ✅ Curly hair collection function prices
- ✅ Size option prices (9-piece and 4-piece sets)

## 🎯 Next Steps

1. **Update Supabase** (if you want Supabase to be the source of truth):
   - Use Option 1 (Dashboard) or Option 2 (Script) above
   
2. **Sync Products** (if needed):
   - Go to Analytics Dashboard → Products tab
   - Click "Sync Products" to ensure all products are in Supabase

3. **Verify Prices**:
   - Check your website to ensure prices display correctly
   - All prices should now show the new values

## 💡 Important Notes

- Local prices (`products.ts`) are now updated as **fallback** prices
- If Supabase prices are set, they will **override** local prices
- If Supabase is unavailable, the site will use local prices
- The Pricing Management dashboard is the recommended way to manage prices going forward

---

**All prices have been successfully updated in the codebase!** 🎉

