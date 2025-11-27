# 🚀 Deployment Instructions

## Quick Answer: **YES, Push Directly!**

If your main website is connected to Netlify via Git, **pushing will auto-deploy**. However, you also need to deploy the analytics dashboard separately.

---

## 📦 **Step 1: Deploy Main Website**

### Option A: Git Push (Recommended - Auto-Deploy)
```bash
# From project root
git add .
git commit -m "feat: Add campaign tracking and enhanced analytics dashboards"
git push origin main
```

**What happens:**
- Netlify detects the push
- Automatically runs: `npm install && npm run build:netlify`
- Deploys `dist/` folder to production
- ✅ Campaign tracking goes live immediately

### Option B: Manual Netlify Deploy
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Deploys** tab
4. Click **Trigger deploy** → **Deploy site**
5. Or drag & drop `dist/` folder

---

## 📊 **Step 2: Deploy Analytics Dashboard**

The analytics dashboard is a **separate app** and needs its own deployment.

### Option A: Separate Netlify Site (Recommended)

1. **Create New Netlify Site:**
   - Go to Netlify Dashboard
   - Click **Add new site** → **Import an existing project**
   - Connect to same Git repository
   - **Important:** Set base directory to: `analytics-backend/analytics-dashboard`
   - Build command: `npm ci --include=dev && npm run build`
   - Publish directory: `analytics-backend/analytics-dashboard/dist`

2. **Set Environment Variables:**
   - Go to Site settings → Environment variables
   - Add:
     ```
     VITE_SUPABASE_URL=https://vfhxwzcbjdlfmizakvqc.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     ```

3. **Deploy:**
   - Push changes (same repo, different base directory)
   - Or manually trigger deploy

### Option B: Manual Build & Deploy

```bash
# Navigate to analytics dashboard
cd analytics-backend/analytics-dashboard

# Install dependencies
npm install

# Build
npm run build

# Deploy dist/ folder to Netlify
# (Drag & drop dist/ folder to Netlify dashboard)
```

### Option C: Netlify CLI

```bash
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Navigate to analytics dashboard
cd analytics-backend/analytics-dashboard

# Login to Netlify
netlify login

# Initialize (first time only)
netlify init

# Deploy
netlify deploy --prod
```

---

## ✅ **Step 3: Verify Deployment**

### Main Website:
1. Visit your website (e.g., `https://curlea.beauty`)
2. Open browser console
3. Look for: `[Campaign Tracking] Campaign detected and tracked`
4. Test with UTM params: `?utm_campaign=test&utm_source=facebook`
5. Check campaign appears in Supabase `campaigns` table

### Analytics Dashboard:
1. Visit dashboard URL (e.g., `https://analytics.curlea.beauty` or your Netlify URL)
2. Navigate to **Campaign Performance** tab
3. Verify data loads from Supabase
4. Check all 4 new dashboards work:
   - Campaign Performance
   - Pixel Analytics
   - Conversion Analytics
   - Customer Journey

---

## 🔧 **Troubleshooting**

### Main Website Not Deploying:
- Check Netlify build logs
- Verify `netlify.toml` is correct
- Ensure `package.json` has `build:netlify` script
- Check Git connection in Netlify

### Analytics Dashboard Not Loading:
- Verify environment variables are set
- Check Supabase connection
- Review browser console for errors
- Check Netlify build logs

### Campaign Tracking Not Working:
- Verify `src/utils/campaignTracking.ts` is in build
- Check browser console for errors
- Test with UTM parameters in URL
- Verify Supabase `campaigns` table exists

---

## 📝 **Pre-Deployment Checklist**

### Main Website:
- [x] Code compiles (`npm run build` succeeds)
- [ ] All changes committed
- [ ] Git repository connected to Netlify
- [ ] Environment variables set (if any)

### Analytics Dashboard:
- [ ] `VITE_SUPABASE_URL` environment variable set
- [ ] `VITE_SUPABASE_ANON_KEY` environment variable set
- [ ] Build succeeds (`npm run build` in dashboard folder)
- [ ] Separate Netlify site created (or deployment method chosen)

---

## 🎯 **Recommended Setup**

**Best Practice:**
1. **Main Website:** `https://curlea.beauty` (auto-deploy on push)
2. **Analytics Dashboard:** `https://analytics.curlea.beauty` (separate Netlify site, auto-deploy on push)

**Both connected to same Git repository, different base directories.**

---

## 🚨 **Important Notes**

1. **Campaign tracking works immediately** after main website deploys
2. **Analytics dashboards** need separate deployment
3. **No database changes needed** - all tables already exist
4. **Environment variables** must be set for analytics dashboard
5. **Both apps** can share the same Supabase project

---

## 📞 **Need Help?**

- Check Netlify build logs for errors
- Verify Supabase connection in dashboard
- Test campaign tracking with UTM parameters
- Review browser console for JavaScript errors

**You're ready to deploy!** 🚀

