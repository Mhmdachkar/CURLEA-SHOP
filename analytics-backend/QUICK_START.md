# ⚡ Quick Start Guide - 30 Minutes to Live Analytics

This is the fastest path to getting your analytics system running.

---

## 🎯 Prerequisites

- [ ] Supabase account ([sign up free](https://supabase.com))
- [ ] Node.js installed
- [ ] Your Curlea website running

---

## ⏱️ Step 1: Supabase Setup (10 minutes)

### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Name: `curlea-analytics`
4. Generate strong password (save it!)
5. Choose region closest to you
6. Wait 2-3 minutes for initialization

### 1.2 Deploy Database Schema
1. In your project, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. Open `analytics-backend/supabase/schema.sql` from this repo
4. Copy entire contents → Paste into editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. Wait for "Success" message

### 1.3 Deploy Functions
1. Create another **"New query"**
2. Open `analytics-backend/supabase/functions.sql`
3. Copy → Paste → **"Run"**
4. Wait for "Success"

### 1.4 Get API Keys
1. Go to **"Project Settings"** → **"API"**
2. Copy these (save them securely):
   - **Project URL**: `https://vfhxwzcbjdlfmizakvqc.supabase.co`
   - **anon public key**: `eyJ...` (for SDK)
   - **service_role key**: `eyJ...` (for dashboard)

✅ **Database is ready!**

---

## ⏱️ Step 2: Deploy Edge Function (10 minutes)

### 2.1 Install Supabase CLI
```bash
npm install -g supabase
```

### 2.2 Login & Link
```bash
# Login
supabase login

# Navigate to analytics-backend folder
cd curlea-luxe-animation-main/analytics-backend

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
# Get YOUR_PROJECT_REF from Settings > General > Reference ID
```

### 2.3 Deploy Function
```bash
supabase functions deploy track
```

You'll see:
```
Function URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/track
```

**Copy this URL!** You'll need it in the next step.

### 2.4 Test It
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/track \
  -H "Content-Type: application/json" \
  -d '{"type":"visit","data":{"session_id":"test","device":"Desktop"}}'
```

Should return: `{"success":true,"type":"visit","visit_id":"..."}`

✅ **Edge Function is live!**

---

## ⏱️ Step 3: Integrate SDK (10 minutes)

### 3.1 Copy SDK to Your Site
```bash
# From analytics-backend folder
cp sdk/analytics.js ../curlea-luxe-animation-main/public/analytics.js
```

### 3.2 Add to Your Site

Edit `curlea-luxe-animation-main/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <!-- your existing head content -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    
    <!-- ADD THIS: -->
    <script src="/analytics.js"></script>
    <script>
      analytics.init({
        endpoint: 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/track',
        debug: true // Turn this off in production
      });
    </script>
  </body>
</html>
```

### 3.3 Start Your Site
```bash
cd curlea-luxe-animation-main
npm run dev
```

### 3.4 Test Tracking

1. Open your site in browser
2. Open DevTools Console (F12)
3. Look for:
   ```
   [Curlea Analytics] Analytics SDK initialized successfully
   [Curlea Analytics] Event sent successfully: visit
   ```

### 3.5 Verify in Database

Go to Supabase SQL Editor and run:

```sql
SELECT * FROM visits ORDER BY created_at DESC LIMIT 1;
```

You should see your visit! 🎉

✅ **Tracking is working!**

---

## 🎯 Step 4: Track Product Views (5 minutes)

Add this to `src/pages/ProductDetailPage.tsx`:

```tsx
// Add at the top
import { useEffect } from 'react';

// Inside your component
useEffect(() => {
  if (product && window.analytics) {
    window.analytics.track('ProductViewed', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      category: product.category
    });
  }
}, [product]);
```

Test by clicking on a product, then check:

```sql
SELECT * FROM events WHERE event_name = 'ProductViewed' ORDER BY created_at DESC LIMIT 1;
```

✅ **Product tracking works!**

---

## 📊 Step 5: View Your Data (Quick Queries)

### Today's Stats
```sql
SELECT * FROM get_realtime_stats();
```

### Conversion Funnel
```sql
SELECT * FROM get_conversion_funnel_detailed();
```

### Traffic Sources
```sql
SELECT * FROM traffic_sources;
```

### Top Products
```sql
SELECT * FROM top_products_by_revenue LIMIT 10;
```

---

## ✅ Success Checklist

- [x] Supabase project created
- [x] Database schema deployed
- [x] SQL functions deployed
- [x] Edge Function deployed and tested
- [x] SDK integrated into website
- [x] Visits being tracked
- [x] Product views being tracked
- [x] Data visible in Supabase

---

## 🚀 What's Next?

### Immediate:
1. **Add Cart Tracking** - Follow `CURLEA_INTEGRATION_GUIDE.md` Section 3
2. **Add Purchase Tracking** - Follow Section 4
3. **Sync Products** - Follow Section 6

### Soon:
4. **Build Dashboard** - Use framework in `analytics-dashboard/`
5. **Set Up Reports** - Weekly email summaries
6. **Add Alerts** - Low conversion warnings

### Eventually:
7. **A/B Testing** - Test different product pages
8. **Cohort Analysis** - Track customer behavior over time
9. **Abandoned Cart Emails** - Recover lost sales

---

## 🐛 Troubleshooting

### "Events not showing in database"
1. Check console for errors
2. Verify Edge Function URL is correct
3. Check Edge Function logs: `supabase functions logs track`

### "SDK not defined"
1. Make sure `analytics.js` is in `public/` folder
2. Check that script tag is before the init script
3. Hard refresh browser (Ctrl+F5)

### "CORS error"
- Edge Function has CORS enabled, this shouldn't happen
- If it does, check you're calling the correct URL

---

## 📚 Full Documentation

For detailed guides, see:
- `README.md` - Full overview
- `SUPABASE_SETUP_GUIDE.md` - Database details
- `EDGE_FUNCTIONS_GUIDE.md` - Edge Function details  
- `CURLEA_INTEGRATION_GUIDE.md` - Full integration guide
- `SDK_SETUP_GUIDE.md` - SDK API reference

---

## 🎉 You're Done!

**In 30 minutes, you now have:**
- ✅ Production analytics database
- ✅ Scalable event ingestion
- ✅ Visitor and product tracking
- ✅ Real-time data
- ✅ Full SQL access to your data

**This is the foundation. Now build on it!** 🚀

---

## 💡 Pro Tips

1. **Turn off debug mode** in production:
   ```javascript
   analytics.init({ endpoint: '...', debug: false });
   ```

2. **Use environment variables**:
   ```javascript
   analytics.init({ 
     endpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT,
     debug: import.meta.env.DEV 
   });
   ```

3. **Set up scheduled tasks**:
   ```sql
   -- Update funnel daily
   SELECT cron.schedule(
     'update-funnel',
     '0 0 * * *',
     $$SELECT update_conversion_funnel_aggregates(CURRENT_DATE - 1)$$
   );
   ```

4. **Monitor Edge Function** in Supabase dashboard:
   - Edge Functions → track → Metrics

5. **Create custom queries** for your specific needs:
   - All data is in PostgreSQL
   - Use SQL Editor to experiment
   - Save useful queries as views

---

**Happy analyzing! 📊✨**

