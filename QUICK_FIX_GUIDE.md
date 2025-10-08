# ⚡ Quick Fix Guide - Most Common Issues

## 🚨 Critical Issue Found: Missing VITE_SUPABASE_URL

### ❌ Current Problem
Your `.env` file is missing the `VITE_SUPABASE_URL` variable.

### ✅ Quick Fix (2 minutes)

**Step 1:** Create/Edit `.env` file in project root

**Step 2:** Add this exact content:
```env
VITE_SUPABASE_URL=https://vfhxwzcbjdlfmizakvqc.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_SECRET=your-actual-service-role-key
VITE_ANALYTICS_ENDPOINT=https://vfhxwzcbjdlfmizakvqc.supabase.co/functions/v1/track
```

**Step 3:** Get your keys from Supabase
1. Go to https://supabase.com/dashboard
2. Select project: `vfhxwzcbjdlfmizakvqc`
3. Settings → API
4. Copy "anon public" key
5. Copy "service_role" key (keep secret!)

**Step 4:** Replace placeholders in `.env` with real keys

**Step 5:** Restart dev server
```bash
npm run dev
```

---

## 🔧 Common Fixes

### Fix #1: "Analytics SDK not loading"
```html
<!-- Make sure index.html has this BEFORE analytics.init(): -->
<script src="/analytics.js"></script>
<script>
  analytics.init({
    endpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT,
    debug: import.meta.env.DEV
  });
</script>
```

### Fix #2: "Events not sending"
```bash
# Test Edge Function directly:
curl -X POST https://vfhxwzcbjdlfmizakvqc.supabase.co/functions/v1/track \
  -H "Content-Type: application/json" \
  -d '{"type":"event","data":{"session_id":"test","event_name":"test"}}'
```

**Expected response:**
```json
{"success":true,"type":"event","event_id":"..."}
```

### Fix #3: "Edge Function not deployed"
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref vfhxwzcbjdlfmizakvqc

# Deploy
cd analytics-backend
supabase functions deploy track
```

### Fix #4: "Database tables missing"
1. Open Supabase Dashboard → SQL Editor
2. Open `analytics-backend/supabase/schema.sql`
3. Copy all contents
4. Paste in SQL Editor
5. Click "Run"

### Fix #5: ".env changes not working"
```bash
# Always restart dev server after .env changes!
# Press Ctrl+C to stop
npm run dev
```

---

## 🧪 Quick Test Commands

### Test 1: Check if SDK loaded
```javascript
// In browser console:
console.log(analytics);
// Should show: { init: ƒ, track: ƒ, ... }
```

### Test 2: Check session ID
```javascript
// In browser console:
console.log(analytics.getSessionId());
// Should show: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
```

### Test 3: Send test event
```javascript
// In browser console:
analytics.track('TestEvent', { test: true });
// Should show: "[Curlea Analytics] Event sent successfully"
```

### Test 4: Check Supabase data
```sql
-- In Supabase SQL Editor:
SELECT * FROM events ORDER BY created_at DESC LIMIT 10;
```

---

## 📱 Quick Links

**Supabase Dashboard:**
https://supabase.com/dashboard/project/vfhxwzcbjdlfmizakvqc

**Supabase API Settings:**
https://supabase.com/dashboard/project/vfhxwzcbjdlfmizakvqc/settings/api

**Edge Functions:**
https://supabase.com/dashboard/project/vfhxwzcbjdlfmizakvqc/functions

**Database Tables:**
https://supabase.com/dashboard/project/vfhxwzcbjdlfmizakvqc/editor

---

## 🎯 5-Minute Setup Checklist

- [ ] 1. Create `.env` with all 4 variables (see top of this guide)
- [ ] 2. Get keys from Supabase Dashboard → Settings → API
- [ ] 3. Deploy database schema (SQL Editor → Run `schema.sql`)
- [ ] 4. Deploy Edge Function (`supabase functions deploy track`)
- [ ] 5. Start dev server (`npm run dev`)
- [ ] 6. Open http://localhost:5173
- [ ] 7. Check console for "[Curlea Analytics] initialized"
- [ ] 8. Click a product
- [ ] 9. Check console for "Event sent successfully"
- [ ] 10. Check Supabase → `events` table for data

---

## 💡 Pro Tips

1. **Always check browser console first** - Most issues show clear error messages
2. **Use debug mode** - Set `debug: true` to see all SDK activity
3. **Test Edge Function separately** - Use curl to isolate frontend vs backend issues
4. **Check Network tab** - See exact requests being sent
5. **Restart after .env changes** - Environment variables only load on startup

---

## 🆘 Still Stuck?

1. Check `ANALYTICS_VALIDATION_REPORT.md` for full diagnostic
2. Read `DEPLOYMENT_CHECKLIST.md` for step-by-step
3. Review `analytics-backend/QUICK_START.md` for detailed setup
4. Check Edge Function logs: `supabase functions logs track`

---

## ✅ Success Looks Like This

**Browser Console:**
```
[Curlea Analytics] Analytics SDK initialized successfully
[Curlea Analytics] Session ID: abc123...
[Curlea Analytics] Visit tracked successfully
[Curlea Analytics] Event sent successfully: event
[Curlea Analytics] Page view tracked: /
```

**Supabase Tables:**
- `visits` - New rows appearing
- `events` - Product views showing up
- `cart_events` - Add to cart tracked

**No Errors:**
- Console: Clean, no red errors
- Network tab: All POST requests return 200
- Edge Function logs: Success messages

---

**You're almost there! Just fix the .env file and you're good to go! 🚀**

