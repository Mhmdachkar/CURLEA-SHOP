# Product Verification Testing Guide

## Overview
This guide explains how to test all full set variants, verify stock displays, and test the Christmas offer logic.

## Accessing the Verification Panel

### Option 1: Via Browser (Recommended)
1. Start your development server: `npm run dev`
2. Navigate to: `http://localhost:5173/verify-products` (or your dev server URL)
3. The verification panel will automatically run tests on page load (development mode only)

### Option 2: Programmatic Testing
Use the verification utilities in your code:

```typescript
import { 
  verifyAllFullSets, 
  testChristmasOffer, 
  generateVerificationReport 
} from '@/utils/productVerification';

// Verify all full set products
const results = await verifyAllFullSets();

// Test Christmas offer logic
const tests = testChristmasOffer();

// Generate full report
const report = await generateVerificationReport();
console.log(report);
```

## What Gets Tested

### 1. Full Set Products Verification
- **Products Tested:**
  - `dreamcurl-original` (DreamCurl™ Full Set Original)
  - `dreamcurl-midi` (DreamCurl™ Full Set Midi)
  - `dreamcurl-jumbo` (DreamCurl™ Full Set Jumbo)
  - `zero-heat-mini` (Zero Heat Mini Set)

- **For Each Product:**
  - ✅ Verifies all color variants exist in database
  - ✅ Checks stock quantities for each variant
  - ✅ Validates size mappings (UI → Database)
  - ✅ Verifies color normalization (UI → Database)

### 2. Color Variants Tested

#### dreamcurl-original
- Colors: Mulberry, Candy, Latte, Olive
- Database Size: `Large`
- Expected DB Colors: Mulberry, CANDY, Latte, Olive

#### dreamcurl-midi
- Colors: CANDY, LATTE, MULBERRY, OLIVE
- Database Size: `Midi`
- Expected DB Colors: CANDY, LATTE, MULBERRY, OLIVE

#### dreamcurl-jumbo
- Colors: LATTE, CANDY, OLIVE, MULBERRY
- Database Size: `Jumbo`
- Expected DB Colors: LATTE, CANDY, OLIVE, MULBERRY

#### zero-heat-mini
- Colors: OLIVE, LATTE, CANDY, PURPLE
- Database Size: `Mini`
- Expected DB Colors: OLIVE, LATTE, CANDY, Mulberry (PURPLE → Mulberry)

### 3. Christmas Offer Logic Tests

The verification includes 5 test scenarios:

1. **2 Different Full Sets → 1 Free**
   - Cart: 1x dreamcurl-original (Mulberry) + 1x dreamcurl-midi (CANDY)
   - Expected: 3rd item (cheapest) is free

2. **2 Same Full Sets (Quantity 2) → 1 Free**
   - Cart: 2x dreamcurl-original (Mulberry)
   - Expected: 3rd unit is free

3. **2 Full Sets + 1 Non-Full-Set → No Discount on Non-Full-Set**
   - Cart: 1x dreamcurl-original + 1x dreamcurl-midi + 1x curly-clip-1
   - Expected: Only full sets qualify, non-full-set pays full price

4. **3 Different Full Sets → 1 Free (3rd One)**
   - Cart: 1x dreamcurl-original + 1x dreamcurl-midi + 1x dreamcurl-jumbo
   - Expected: 3rd item (cheapest) is free

5. **4 Full Sets → Still Only 1 Free**
   - Cart: 1x each of all 4 full sets
   - Expected: Only 1 free item (3rd one), not 2

### 4. Color Normalization Verification
- Tests that UI color names are correctly normalized to database format
- Verifies all color mappings work correctly

## Understanding the Results

### Status Icons
- ✅ **Green Checkmark**: Test passed
- ⚠️ **Yellow Warning**: Test passed but with warnings (e.g., 0 stock)
- ❌ **Red X**: Test failed (e.g., missing variant in database)

### Status Colors
- **Green Background**: All tests passed
- **Yellow Background**: Some warnings (e.g., out of stock variants)
- **Red Background**: Failures detected (e.g., missing database variants)

## Common Issues and Solutions

### Issue 1: Missing Database Variants
**Symptom:** Red X icon, "No database variant found" message

**Solution:**
1. Check your Supabase `product_variants` table
2. Ensure all variants exist with correct:
   - `product_id` (e.g., "dreamcurl-original")
   - `size` (e.g., "Large", "Midi", "Jumbo", "Mini")
   - `color` (e.g., "Mulberry", "CANDY", "Latte", "Olive")
   - `is_active = true`

### Issue 2: Color Name Mismatch
**Symptom:** Variant exists but not found

**Solution:**
1. Check that database uses normalized color names:
   - "Candy" → "CANDY"
   - "PURPLE" → "Mulberry"
2. Verify `normalizeColorName()` function handles all cases

### Issue 3: Zero Stock Warning
**Symptom:** Yellow warning, "0 available quantity"

**Solution:**
1. This is expected if a variant is out of stock
2. Update `available_quantity` in database if stock is available

## Manual Testing Checklist

### Full Set Variants
- [ ] dreamcurl-original - Mulberry (Large)
- [ ] dreamcurl-original - Candy (Large)
- [ ] dreamcurl-original - Latte (Large)
- [ ] dreamcurl-original - Olive (Large)
- [ ] dreamcurl-midi - CANDY (Midi)
- [ ] dreamcurl-midi - LATTE (Midi)
- [ ] dreamcurl-midi - MULBERRY (Midi)
- [ ] dreamcurl-midi - OLIVE (Midi)
- [ ] dreamcurl-jumbo - LATTE (Jumbo)
- [ ] dreamcurl-jumbo - CANDY (Jumbo)
- [ ] dreamcurl-jumbo - OLIVE (Jumbo)
- [ ] dreamcurl-jumbo - MULBERRY (Jumbo)
- [ ] zero-heat-mini - OLIVE (Mini)
- [ ] zero-heat-mini - LATTE (Mini)
- [ ] zero-heat-mini - CANDY (Mini)
- [ ] zero-heat-mini - PURPLE (Mini) → Should map to Mulberry

### Christmas Offer Testing
- [ ] Add 2 different full sets → Verify "Now choose your 3rd free full set!" message
- [ ] Add 2 same full sets (qty 2) → Verify 3rd unit is free
- [ ] Add 2 full sets + 1 non-full-set → Verify non-full-set pays full price
- [ ] Add 3 different full sets → Verify 3rd one is free
- [ ] Add 4 full sets → Verify only 1 free (not 2)

## Database Schema Requirements

### product_variants Table
```sql
CREATE TABLE product_variants (
  id UUID PRIMARY KEY,
  product_id TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT,
  stock_quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  available_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Expected Variants

#### dreamcurl-original (product_id: "dreamcurl-original")
- Large | Mulberry
- Large | CANDY
- Large | Latte
- Large | Olive

#### dreamcurl-midi (product_id: "dreamcurl-midi")
- Midi | CANDY
- Midi | LATTE
- Midi | MULBERRY
- Midi | OLIVE

#### dreamcurl-jumbo (product_id: "dreamcurl-jumbo")
- Jumbo | LATTE
- Jumbo | CANDY
- Jumbo | OLIVE
- Jumbo | MULBERRY

#### zero-heat-mini (product_id: "zero-heat-mini")
- Mini | OLIVE
- Mini | LATTE
- Mini | CANDY
- Mini | Mulberry (Note: UI shows "PURPLE" but DB should have "Mulberry")

## Running Tests in Production

The verification panel is only available in development mode by default. To enable it in production:

1. Remove the development check in `ProductVerificationPanel.tsx`:
```typescript
// Remove this check:
if (process.env.NODE_ENV === 'development') {
  runVerification();
}
```

2. Or add a password/authentication check before showing the panel.

## Next Steps

After running verification:
1. Review all test results
2. Fix any failed tests (usually missing database variants)
3. Address warnings (usually out of stock items)
4. Re-run verification to confirm fixes
5. Test manually in the browser to verify user experience

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Supabase connection is working
3. Ensure all database variants exist
4. Check color normalization mappings
5. Review the scan report in `PRODUCT_DATABASE_SCAN.md`

