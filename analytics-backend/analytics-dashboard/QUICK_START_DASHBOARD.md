# 🎯 Curlea Analytics Dashboard - Quick Start

## ✅ Status: Dashboard Ready to Launch!

All files created ✅  
Dependencies installed ✅  
Configuration files ready ✅  

---

## 🚀 3 Steps to View Your Analytics

### **Step 1: Create Environment File**

Create a file named `.env` in the `analytics-dashboard` folder:

```powershell
cd curlea-luxe-animation-main\analytics-backend\analytics-dashboard
```

Create `.env` file with this content:

```env
VITE_SUPABASE_URL=https://vfhxwzcbjdlfmizakvqc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmaHh3emNiamRsZm1pemFrdnFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0MDQ0MTcsImV4cCI6MjA0Mzk4MDQxN30.RER6Cqhbelgië7qZGxJVYNnXZ5iI4nbVZoQXdWEHT6fZE
```

> **Note:** Replace the anon key if needed. Get it from:  
> https://supabase.com/dashboard/project/vfhxwzcbjdlfmizakvqc/settings/api

---

### **Step 2: Start the Dashboard**

```powershell
npm run dev
```

The dashboard will automatically open at: **http://localhost:3000**

---

### **Step 3: View Your Analytics!**

You'll see:

📊 **Overview Cards:**
- Total Visits
- Total Revenue  
- Total Orders
- Average Order Value

📈 **Interactive Charts:**
- Traffic Sources (Pie Chart)
- Top Products (Bar Chart)
- Conversion Funnel (Horizontal Bar)
- Product Performance Table

---

## 🎨 What the Dashboard Shows

### **Real Data from Your Curlea Store:**

✅ **Visits** - From the `visits` table  
✅ **Page Views** - Tracked by your SDK  
✅ **Product Views** - When users click products  
✅ **Cart Events** - Add to cart actions  
✅ **Orders** - Completed purchases  

### **All Data is LIVE:**

The dashboard queries Supabase views:
- `total_sales_summary`
- `aov_summary`
- `traffic_by_source`
- `top_products_summary`
- `conversion_funnel`

---

## 🔄 Testing the Dashboard

### **1. Check if Data is Being Collected:**

Go to your Curlea store: http://localhost:8081  

Open console, you should see:
```
✅ [Curlea Analytics] Event sent successfully: page_view
✅ [Curlea Analytics] Event sent successfully: cart_event
```

### **2. View Data in Supabase:**

https://supabase.com/dashboard/project/vfhxwzcbjdlfmizakvqc/editor

Check these tables:
- `visits`
- `page_views`
- `events`
- `cart_events`

### **3. View Dashboard:**

```powershell
cd curlea-luxe-animation-main\analytics-backend\analytics-dashboard
npm run dev
```

Open: http://localhost:3000

---

## 📂 Dashboard Structure

```
analytics-dashboard/
├── src/
│   ├── components/
│   │   └── Dashboard.tsx       # Charts and visualizations
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client
│   │   └── utils.ts            # Helper functions
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── index.html                  # HTML template
├── package.json                # Dependencies
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS
└── .env                        # Environment variables (YOU CREATE THIS)
```

---

## 🐛 Troubleshooting

### **Dashboard shows 0 for all stats?**
- Make sure your Curlea store SDK is running and sending events
- Check Supabase tables have data
- Verify `.env` file has correct credentials

### **"Missing Supabase environment variables"**
- Create the `.env` file in the `analytics-dashboard` folder
- Make sure it starts with `VITE_`

### **Port 3000 already in use?**
- The dashboard will automatically use port 3001
- Or specify a different port in `vite.config.ts`

---

## 🎯 Next Steps After Setup

1. **Customize the Dashboard:**
   - Edit colors in `src/index.css`
   - Add more charts in `src/components/Dashboard.tsx`
   
2. **Deploy the Dashboard:**
   - Build: `npm run build`
   - Deploy `dist` folder to Netlify/Vercel
   
3. **Add Real-Time Updates:**
   - Use Supabase Realtime subscriptions
   - Auto-refresh every N seconds

---

## ✨ You're All Set!

**Your complete analytics stack:**

1. ✅ **SDK** - Collecting data from your store
2. ✅ **Supabase** - Storing and processing data
3. ✅ **Edge Functions** - Ingesting events
4. ✅ **Dashboard** - Visualizing insights

**Create the `.env` file and run `npm run dev` to see your analytics!** 🚀

