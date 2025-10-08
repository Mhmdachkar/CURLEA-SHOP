# ⚙️ Supabase Edge Functions Deployment Guide

This guide will walk you through deploying the analytics Edge Function that receives tracking data from your SDK.

---

## 📋 Prerequisites

- Supabase project created (from PROJECT 1)
- Supabase CLI installed
- Database schema deployed

---

## 🔧 Step 1: Install Supabase CLI

### macOS/Linux
```bash
npm install -g supabase
```

### Windows
```bash
npm install -g supabase
```

### Verify Installation
```bash
supabase --version
```

---

## 🔐 Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate. Follow the prompts.

---

## 🔗 Step 3: Link to Your Project

```bash
# Navigate to your analytics-backend directory
cd curlea-luxe-animation-main/analytics-backend

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF
```

**How to find your project ref:**
1. Go to your Supabase dashboard
2. Click on your project
3. Go to **Settings** → **General**
4. Look for **Reference ID** (e.g., `abcdefghijklmnop`)

---

## 🚀 Step 4: Deploy the Edge Function

### Deploy Command

```bash
cd curlea-luxe-animation-main/analytics-backend

# Deploy the track function
supabase functions deploy track
```

### Expected Output

```
Deploying Function track...
Deployed Function track in Xxs
Function URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/track
```

**Save this URL!** You'll need it for your SDK configuration.

---

## ✅ Step 5: Verify Deployment

### Test with cURL

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/track \
  -H "Content-Type: application/json" \
  -d '{
    "type": "visit",
    "data": {
      "session_id": "test-session-001",
      "device": "Desktop",
      "browser": "Chrome",
      "country": "United States"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "type": "visit",
  "visit_id": "some-uuid"
}
```

### Check Database

Run this query in your Supabase SQL Editor:

```sql
SELECT * FROM visits WHERE session_id = 'test-session-001';
```

You should see your test visit!

---

## 🔍 Step 6: View Function Logs

### Real-time Logs

```bash
supabase functions logs track --tail
```

### Dashboard Logs

1. Go to your Supabase dashboard
2. Navigate to **Edge Functions** (left sidebar)
3. Click on **track**
4. Click **Logs** tab

You'll see all function invocations and any errors.

---

## 🌐 Step 7: Configure Your SDK

Now update your SDK initialization with the Edge Function URL:

### In your HTML/React app

```javascript
analytics.init({
  endpoint: 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/track',
  debug: false
});
```

### Using Environment Variables (Recommended)

Create `.env` file:
```env
VITE_ANALYTICS_ENDPOINT=https://YOUR_PROJECT_REF.supabase.co/functions/v1/track
```

Then in your code:
```javascript
analytics.init({
  endpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT,
  debug: import.meta.env.DEV
});
```

---

## 🧪 Step 8: End-to-End Testing

### 1. Test Visit Tracking

Open your website in a browser with the SDK initialized:

```html
<script src="/analytics.js"></script>
<script>
  analytics.init({
    endpoint: 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/track',
    debug: true
  });
</script>
```

### 2. Check Browser Console

You should see:
```
[Curlea Analytics] Initializing analytics SDK...
[Curlea Analytics] Event queued: {type: "visit", ...}
[Curlea Analytics] Event sent successfully: visit
```

### 3. Verify in Database

```sql
SELECT 
  session_id,
  device,
  browser,
  country,
  created_at
FROM visits
ORDER BY created_at DESC
LIMIT 10;
```

### 4. Test Custom Event

```javascript
analytics.track('TestEvent', { test: 'data' });
```

Then check:
```sql
SELECT * FROM events WHERE event_name = 'TestEvent';
```

### 5. Test Cart Event

```javascript
analytics.trackCart('add', {
  product_id: 'heatless-curler-1',
  title: 'Heatless Hair Curling Rod Set',
  price: 29.99,
  quantity: 1
});
```

Then check:
```sql
SELECT * FROM cart_events WHERE event_type = 'add';
```

---

## 🔄 Step 9: Update the Function (If Needed)

If you make changes to the function code:

```bash
# Re-deploy
supabase functions deploy track

# Watch logs to verify
supabase functions logs track --tail
```

---

## 🐛 Troubleshooting

### Issue: "Not linked to any remote project"

**Solution:**
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Issue: "Failed to deploy function"

**Solution:**
1. Check your Supabase CLI version: `supabase --version`
2. Update if needed: `npm install -g supabase@latest`
3. Make sure you're logged in: `supabase login`

### Issue: "CORS error" in browser

**Solution:** The function already includes CORS headers. Make sure:
1. The function deployed successfully
2. You're calling the correct URL
3. Check browser network tab for the actual error

### Issue: Events not appearing in database

**Solution:**
1. Check function logs: `supabase functions logs track`
2. Verify RLS policies allow inserts:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'visits';
   ```
3. Test the endpoint directly with cURL (see Step 5)

### Issue: "Service role key not found"

**Solution:** This is handled automatically by Supabase. If you see this error:
1. Verify your project is properly linked
2. Check that you deployed to the correct project

---

## 📊 Monitor Function Performance

### View Invocation Stats

In Supabase Dashboard:
1. **Edge Functions** → **track**
2. **Metrics** tab

You'll see:
- Total invocations
- Error rate
- Average execution time
- Request/response sizes

### Set Up Alerts (Optional)

You can set up email alerts for function errors:
1. **Project Settings** → **Alerts**
2. **Create Alert**
3. Choose "Edge Function Errors"

---

## 🔒 Security Best Practices

### 1. Rate Limiting (Optional)

Add rate limiting to prevent abuse:

```typescript
// In your Edge Function
const rateLimit = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requests = rateLimit.get(ip) || [];
  
  // Filter requests from last minute
  const recentRequests = requests.filter((time: number) => now - time < 60000);
  
  if (recentRequests.length >= 100) { // 100 requests per minute
    return false;
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  return true;
}
```

### 2. Validate Required Fields

The function already validates that `type` and `data` are present. Add more validation as needed.

### 3. Monitor for Abuse

Set up monitoring for:
- Unusual spike in events from single IP
- Invalid data patterns
- Excessive event sizes

---

## 💰 Cost Considerations

Supabase Edge Functions pricing (as of 2024):
- **Free tier**: 500K requests/month
- **Pro tier**: $25/month includes 2M requests
- **Additional**: $0.50 per 100K requests

For most analytics use cases, the free tier is sufficient to start.

---

## 🎯 Performance Optimization

### 1. Batching (SDK Already Handles This)

The SDK batches events every 5 seconds or when 10 events are queued.

### 2. Async Processing

All database inserts are async and non-blocking.

### 3. Connection Pooling

Supabase handles connection pooling automatically.

---

## 📈 Next Steps

✅ **Edge Function**: Deployed!  
📊 **Next**: Build the analytics dashboard (PROJECT 4)  
🔗 **Then**: Integrate with your e-commerce site (PROJECT 5)

---

## 🆘 Getting Help

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Deploy Docs](https://docs.deno.com/deploy/manual)
- [Supabase Discord](https://discord.supabase.com)

---

## ✨ Success Criteria

You've successfully completed PROJECT 3 if:

- ✅ Edge Function deployed without errors
- ✅ Function URL accessible
- ✅ Test events successfully inserted into database
- ✅ SDK can send events to the function
- ✅ Logs show successful event processing
- ✅ No CORS errors in browser console

**You're now ready to build the analytics dashboard! 🎉**

