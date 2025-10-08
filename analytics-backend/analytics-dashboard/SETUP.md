# 📊 Curlea Analytics Dashboard - Setup Guide

## 🚀 Quick Start

### 1. Create Environment File

Create a `.env` file in this directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://vfhxwzcbjdlfmizakvqc.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Get your Anon Key:**
1. Go to https://supabase.com/dashboard/project/vfhxwzcbjdlfmizakvqc/settings/api
2. Copy the `anon` `public` key
3. Paste it in the `.env` file

### 2. Install Dependencies

```powershell
npm install
```

### 3. Run the Dashboard

```powershell
npm run dev
```

The dashboard will open automatically at `http://localhost:3000`

---

## 📈 What You'll See

The dashboard displays:

### **Overview Cards:**
- 📊 **Total Visits** - Number of unique visitors
- 💰 **Total Revenue** - Sum of all completed orders
- 🛒 **Total Orders** - Number of purchases
- 📈 **Average Order Value** - Revenue per order

### **Charts:**
1. **Traffic Sources** (Pie Chart)
   - Shows where your visitors come from (direct, social, search, etc.)

2. **Top Products** (Bar Chart)
   - Most viewed products
   - Products with most cart additions

3. **Conversion Funnel** (Bar Chart)
   - Visits → Product Views → Add to Cart → Checkout → Orders
   - Visualize where users drop off

4. **Top Products Table**
   - Detailed product performance
   - Conversion rates

---

## 🛠️ Build for Production

```powershell
npm run build
```

This creates an optimized build in the `dist` folder.

---

## 🔄 Real-Time Updates

The dashboard fetches data from Supabase on load. To enable real-time updates:

1. Add Supabase Realtime subscriptions
2. Or set up auto-refresh intervals

---

## 📊 Available Data Views

The dashboard queries these Supabase views:
- `total_sales_summary` - Revenue and orders
- `aov_summary` - Average order value
- `traffic_by_source` - Traffic breakdown
- `top_products_summary` - Product analytics
- `conversion_funnel` - User journey

All these views were created when you deployed the SQL schema.

---

## 🎨 Customization

### Change Theme
Edit colors in `src/index.css` under `:root` variables.

### Add More Charts
1. Create a new component in `src/components/`
2. Query Supabase data
3. Use Recharts to visualize

### Modify Queries
Edit `src/App.tsx` and `src/components/Dashboard.tsx` to fetch different data.

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Make sure you created the `.env` file
- Check that variable names start with `VITE_`

### No data showing
- Check that your analytics SDK is sending events
- Verify Supabase tables have data
- Open browser console for errors

### Build errors
- Run `npm install` again
- Delete `node_modules` and reinstall

---

## ✅ Next Steps

1. Create `.env` file with your credentials
2. Run `npm install`
3. Start with `npm run dev`
4. View your analytics at `http://localhost:3000`

**Your analytics data is being collected right now from your Curlea store!** 🎉

