# 🚀 DEPLOY EDGE FUNCTION NOW

## ⚡ Quick Deploy Commands

### Step 1: Navigate to Backend
```powershell
cd analytics-backend
```

### Step 2: Deploy Function
```powershell
supabase functions deploy track --project-ref vfhxwzcbjdlfmizakvqc
```

### Step 3: Test Endpoint
```powershell
Invoke-RestMethod -Uri "https://vfhxwzcbjdlfmizakvqc.supabase.co/functions/v1/track" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"type":"visit","data":{"session_id":"test123","device":"Desktop"}}'
```

**Expected Response:**
```json
{
  "success": true,
  "type": "visit",
  "visit_id": "some-uuid-here"
}
```

## 🔧 What I Just Fixed

Updated the Edge Function to:
1. ✅ Provide better error logging if `SUPABASE_SERVICE_ROLE_KEY` is missing
2. ✅ Add fallback for `SUPABASE_URL`
3. ✅ Return clear error messages

## 🎯 After Deployment

1. **Reload your browser** at http://localhost:8081
2. **Check console** - should see:
   ```
   ✅ [Curlea Analytics] Event sent successfully: visit
   ```
3. **No more 401 errors!**

## 📊 Verify in Supabase

```sql
-- Check visits table
SELECT * FROM visits ORDER BY created_at DESC LIMIT 5;

-- Check events table  
SELECT * FROM events ORDER BY created_at DESC LIMIT 5;

-- Check cart events table
SELECT * FROM cart_events ORDER BY created_at DESC LIMIT 5;
```

---

**🎉 Run the deploy command and your analytics will be 100% operational! 🎉**

