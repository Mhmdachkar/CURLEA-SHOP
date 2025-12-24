# 💰 Next Payout Explanation

## What is "Next Payout"?

**Next Payout** shows the total amount of money from completed orders that will be included in your next Stripe payout.

### How Stripe Payouts Work

Stripe processes payouts on a schedule (daily, weekly, or monthly) and transfers money from your Stripe account to your bank account. The "Next Payout" amount represents the sum of all completed orders that are pending transfer.

---

## 🔧 Current Implementation

### Calculation Logic

The dashboard calculates "Next Payout" as:
```
Sum of all completed orders from the last 7 days
```

**Why 7 days?**
- Stripe typically processes payouts **weekly** (every 7 days)
- This shows orders that will be included in the next weekly payout
- You can adjust this period based on your Stripe payout schedule

### Code Location
`src/services/shopifyHomeDashboardService.ts` - `getNextPayout()`

---

## ⚙️ Customization Options

### For Daily Payouts
If Stripe processes payouts daily, change the period to 1-2 days:

```typescript
const payoutPeriodDays = 2; // Last 2 days for daily payouts
```

### For Weekly Payouts (Current)
```typescript
const payoutPeriodDays = 7; // Last 7 days for weekly payouts
```

### For Monthly Payouts
```typescript
const payoutPeriodDays = 30; // Last 30 days for monthly payouts
```

---

## 📊 What It Shows

### Example Scenarios

**Scenario 1: Weekly Payouts**
- Today is Monday
- Last payout was last Monday
- Shows: Sum of all completed orders from last Monday to today
- This is what will be paid out in the next payout (likely this Monday or next)

**Scenario 2: Daily Payouts**
- Today is Tuesday
- Last payout was yesterday
- Shows: Sum of all completed orders from yesterday and today
- This is what will be paid out today or tomorrow

---

## 🔍 Why It Was Showing $0.00

**Previous Issue:**
- The function was a placeholder that always returned `0`
- It wasn't actually calculating anything
- It was waiting for you to implement the payout logic

**Fixed:**
- Now calculates the sum of completed orders from the payout period
- Checks both `public.orders` (Stripe) and analytics `orders` tables
- Returns the actual total amount pending payout

---

## 🎯 How to Verify

1. **Check Your Stripe Dashboard:**
   - Go to Stripe Dashboard → Payouts
   - See your payout schedule (daily/weekly/monthly)
   - Compare the amount shown there with the dashboard

2. **Check Your Orders:**
   - Look at completed orders from the last 7 days
   - Sum them up manually
   - Should match the "Next Payout" amount

3. **Adjust the Period:**
   - If your payouts are daily, change `payoutPeriodDays` to `2`
   - If monthly, change to `30`
   - Refresh the dashboard to see updated amount

---

## 💡 Advanced: Track Actual Payouts

If you want to track which orders have been paid out, you would need to:

1. **Add a `payout_status` column** to the orders table:
   ```sql
   ALTER TABLE orders ADD COLUMN payout_status TEXT DEFAULT 'pending';
   -- Values: 'pending', 'paid', 'failed'
   ```

2. **Update the function** to only count orders with `payout_status = 'pending'`:
   ```typescript
   .eq('payout_status', 'pending')
   ```

3. **Update payout status** when Stripe processes the payout (via webhook or manual update)

---

## ✅ Current Status

**Fixed:** ✅
- Now calculates actual payout amount
- Shows sum of completed orders from last 7 days
- Works with both Stripe orders and analytics orders tables

**Default Period:** 7 days (weekly payouts)

**Customizable:** Yes - change `payoutPeriodDays` variable

---

## 📝 Summary

**Next Payout** = Sum of completed orders from the last payout period

- **Default:** Last 7 days (weekly payouts)
- **Customizable:** Change `payoutPeriodDays` in the code
- **Shows:** Real amount that will be paid out
- **Updates:** Every 30 seconds (with dashboard refresh)

The amount now reflects actual pending payouts instead of $0.00! 🎉

