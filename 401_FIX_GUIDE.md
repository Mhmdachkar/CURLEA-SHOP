# 🔧 401 Unauthorized Error - QUICK FIX

## ✅ GOOD NEWS!

The Edge Function **IS deployed and working**! The error changed from:
- ❌ CORS 404 (function not found)
- ✅ **401 Unauthorized** (function exists but missing credentials)

## 🎯 The Problem

The Edge Function is trying to access environment variables that aren't set:

```typescript
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
```

These environment variables are **automatically available** in Supabase Edge Functions, but the function might be using the wrong variable names.

## 🔧 Solution: Update Edge Function Code

Supabase provides these environment variables automatically:
- `SUPABASE_URL` ✅ (correct)
- `SUPABASE_SERVICE_ROLE_KEY` ❌ (wrong - should be `SUPABASE_SERVICE_ROLE_KEY` or access headers)

Actually, for **public analytics endpoints**, we should allow anonymous access. Let me fix the Edge Function:

### Option 1: Use Anon Key (Recommended for Analytics)

The Edge Function should use the **anon key** for public endpoints, and rely on RLS policies to control access.

### Option 2: Make it Truly Public

For analytics, we can bypass Supabase auth entirely and use direct database access.

## 🚀 Quick Fix

The issue is that Supabase Edge Functions have these environment variables **automatically**:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`  
- `SUPABASE_SERVICE_ROLE_KEY`

But your function might be deployed to the wrong project or the variables aren't being read correctly.

### Check Deployment

Run this to see your deployed functions:

```powershell
supabase functions list --project-ref vfhxwzcbjdlfmizakvqc
```

### Redeploy with Explicit Project

```powershell
cd analytics-backend
supabase functions deploy track --project-ref vfhxwzcbjdlfmizakvqc --no-verify-jwt
```

The `--no-verify-jwt` flag allows public access without authentication.

## 🔍 Alternative: Check Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/vfhxwzcbjdlfmizakvqc
2. Click **Edge Functions** → `track`
3. Check the **Environment Variables** tab
4. Ensure these are set:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

If they're not there, Supabase should auto-inject them, but you can manually add:

```
SUPABASE_URL=https://vfhxwzcbjdlfmizakvqc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

## 🎯 Best Solution: Update Function Code

Let me update the function to use Supabase's auto-provided variables correctly.

The function should work as-is because Supabase auto-injects these variables. The 401 might be coming from RLS policies blocking anonymous inserts.

### Check RLS Policies

In Supabase SQL Editor, run:

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('visits', 'events', 'page_views', 'cart_events');

-- Check existing policies
SELECT * FROM pg_policies 
WHERE tablename IN ('visits', 'events', 'page_views', 'cart_events');
```

If RLS is blocking, we need to allow inserts from the Service Role.

### The Real Fix: Allow Service Role Inserts

The Edge Function uses the Service Role key, which should **bypass RLS**. If it's still getting 401, the Service Role key might not be set correctly.

Try this test:

```powershell
# Test the function with a simple payload
Invoke-RestMethod -Uri "https://vfhxwzcbjdlfmizakvqc.supabase.co/functions/v1/track" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"type":"visit","data":{"session_id":"test123","device":"Desktop"}}'
```

If this also returns 401, then the issue is definitely in the function's access to env variables or Supabase client creation.

---

## 💡 FASTEST FIX: Simplify the Function

I'll create a simplified version that definitely works:


