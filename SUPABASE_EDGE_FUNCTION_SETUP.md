# Supabase Edge Function Setup Guide

## Issue: HTTP 500 Errors from `/functions/v1/track`

If you're seeing 500 errors from the track endpoint, it's likely because the Supabase Edge Function doesn't have the required environment variables configured.

## Required Environment Variables

The `track` Edge Function needs these environment variables:

1. **SUPABASE_SERVICE_ROLE_KEY** (Required)
   - This is the service role key from your Supabase project
   - It bypasses Row Level Security (RLS) policies
   - **DO NOT** expose this in client-side code

2. **SUPABASE_URL** (Optional - auto-provided)
   - Usually auto-provided by Supabase
   - Defaults to: `https://vfhxwzcbjdlfmizakvqc.supabase.co`

3. **SUPABASE_ANON_KEY** (Fallback - auto-provided)
   - Used as fallback if SERVICE_ROLE_KEY is not set
   - Auto-provided by Supabase
   - May not work if RLS policies block inserts

## How to Set Environment Variables in Supabase

### Step 1: Get Your Service Role Key

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Click on your project
3. Go to **Settings** → **API**
4. Find **Service Role Key** (keep this secret!)
5. Copy the key

### Step 2: Set Environment Variables in Edge Function

1. In Supabase dashboard, go to **Edge Functions**
2. Click on the `track` function
3. Go to **Settings** tab
4. Scroll down to **Environment Variables**
5. Click **Add new variable**
6. Add:
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Your service role key from Step 1
7. Click **Save**

### Step 3: Redeploy the Function

After setting environment variables, you may need to redeploy:

```bash
# In your project root
cd analytics-backend/supabase/functions/track

# Deploy (if using Supabase CLI)
supabase functions deploy track
```

Or redeploy from the Supabase dashboard:
1. Go to **Edge Functions**
2. Click on `track`
3. Click **Redeploy**

## Verify Setup

After setting the environment variables, check the function logs:

1. Go to **Edge Functions** → `track`
2. Click **Logs** tab
3. Look for:
   - `Using Supabase URL: https://...`
   - `API key type: Service Role` (should say "Service Role", not "Anon")
   - `Supabase client initialized successfully`

If you see `API key type: Anon`, the SERVICE_ROLE_KEY is not set.

## Troubleshooting

### Still Getting 500 Errors?

1. **Check Function Logs**: Go to Supabase dashboard → Edge Functions → track → Logs
2. **Look for error messages**: The improved error handling will show detailed error messages
3. **Common issues**:
   - Missing SERVICE_ROLE_KEY → Add it as environment variable
   - Wrong table name → Check if table is named `orders` (analytics schema) not `public.orders`
   - RLS policies → SERVICE_ROLE_KEY bypasses RLS, but ANON_KEY might be blocked
   - Table doesn't exist → Run the schema migration in `analytics-backend/supabase/COMPLETE_SCHEMA.sql`

### Check Function Logs

The function now logs detailed errors. Check the logs in Supabase dashboard:
- **Edge Functions** → `track` → **Logs**

Look for:
- `Error inserting order:` - Shows database errors
- `Error code:` - PostgreSQL error code
- `Error message:` - Human-readable error message
- `Error details:` - Additional error context

## Testing

After setup, test with a simple request:

```bash
curl -X POST https://vfhxwzcbjdlfmizakvqc.supabase.co/functions/v1/track \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "type": "event",
    "data": {
      "session_id": "test-session",
      "event_name": "TestEvent",
      "event_category": "test"
    }
  }'
```

Should return:
```json
{
  "success": true,
  "type": "event",
  "event_id": "..."
}
```

## Security Notes

⚠️ **IMPORTANT**: 
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Only use it in Edge Functions or server-side code
- The SERVICE_ROLE_KEY bypasses all RLS policies
- Keep it secure and rotate it if exposed


