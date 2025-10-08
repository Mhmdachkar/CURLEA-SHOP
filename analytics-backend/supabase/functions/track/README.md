# Track Edge Function

This Supabase Edge Function receives analytics events from the frontend SDK and inserts them into the database.

## Deployment

### Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Logged in: `supabase login`
- Linked to your project: `supabase link --project-ref YOUR_PROJECT_REF`

### Deploy

```bash
# From the analytics-backend directory
supabase functions deploy track
```

### Set Environment Variables

The function needs access to these environment variables (automatically available):
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (for bypassing RLS)

### Get Function URL

After deployment, your function URL will be:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/track
```

Use this URL as the `endpoint` in your SDK initialization.

## API

### Endpoint
`POST /track`

### Request Body

```json
{
  "type": "visit" | "page_view" | "event" | "cart_event" | "order",
  "data": {
    // Type-specific data
  }
}
```

### Event Types

#### 1. Visit
```json
{
  "type": "visit",
  "data": {
    "session_id": "unique-session-id",
    "device": "Desktop",
    "browser": "Chrome",
    "os": "Windows",
    "country": "United States",
    "city": "New York",
    "region": "NY",
    "referrer": "https://google.com",
    "landing_page": "https://yoursite.com",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "summer_sale",
    "is_mobile": false,
    "is_tablet": false,
    "is_desktop": true,
    "screen_width": 1920,
    "screen_height": 1080,
    "language": "en-US",
    "timezone": "America/New_York"
  }
}
```

#### 2. Page View
```json
{
  "type": "page_view",
  "data": {
    "session_id": "unique-session-id",
    "visit_id": "uuid",
    "url": "https://yoursite.com/products/product-1",
    "path": "/products/product-1",
    "title": "Product Name",
    "referrer": "https://yoursite.com",
    "scroll_depth": 75,
    "time_on_page": 45
  }
}
```

#### 3. Custom Event
```json
{
  "type": "event",
  "data": {
    "session_id": "unique-session-id",
    "visit_id": "uuid",
    "event_name": "ButtonClick",
    "event_category": "Engagement",
    "event_label": "Subscribe",
    "event_value": 1,
    "payload": {
      "button_text": "Subscribe Now",
      "page": "Homepage"
    }
  }
}
```

#### 4. Cart Event
```json
{
  "type": "cart_event",
  "data": {
    "session_id": "unique-session-id",
    "visit_id": "uuid",
    "event_type": "add",
    "external_product_id": "product-123",
    "product_title": "Product Name",
    "variant_id": "variant-456",
    "variant_title": "Size L",
    "quantity": 1,
    "price": 29.99,
    "total_value": 29.99,
    "cart_total": 59.98,
    "discount_code": "SUMMER20",
    "discount_amount": 5.99
  }
}
```

#### 5. Order
```json
{
  "type": "order",
  "data": {
    "order_id": "ORD-12345",
    "session_id": "unique-session-id",
    "visit_id": "uuid",
    "customer_email": "customer@example.com",
    "subtotal": 59.98,
    "discount_total": 5.99,
    "shipping_total": 5.00,
    "tax_total": 4.80,
    "total_value": 63.79,
    "currency": "USD",
    "payment_method": "credit_card",
    "source": "google",
    "utm_campaign": "summer_sale",
    "items": [
      {
        "product_id": "product-123",
        "quantity": 2,
        "price": 29.99
      }
    ],
    "status": "completed"
  }
}
```

### Response

Success:
```json
{
  "success": true,
  "type": "visit",
  "visit_id": "uuid"
}
```

Error:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Testing

### Using cURL

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/track \
  -H "Content-Type: application/json" \
  -d '{
    "type": "visit",
    "data": {
      "session_id": "test-session-123",
      "device": "Desktop",
      "browser": "Chrome",
      "country": "United States"
    }
  }'
```

### Using JavaScript

```javascript
fetch('https://YOUR_PROJECT_REF.supabase.co/functions/v1/track', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'visit',
    data: {
      session_id: 'test-session-123',
      device: 'Desktop',
      browser: 'Chrome',
      country: 'United States'
    }
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## Monitoring

### View Logs

```bash
supabase functions logs track --tail
```

### View in Dashboard

Go to your Supabase dashboard:
- **Functions** → **track** → **Logs**

## Error Handling

The function includes:
- ✅ Request validation
- ✅ CORS support
- ✅ Automatic visit_id lookup from session_id
- ✅ Automatic product_id lookup from external_product_id
- ✅ Error logging
- ✅ Graceful error responses

## Security

- Uses `service_role` key for database access (bypasses RLS)
- CORS enabled for all origins (adjust in production if needed)
- No authentication required (public tracking endpoint)
- Rate limiting handled by Supabase

## Performance

- Deno runtime (fast and secure)
- Minimal dependencies
- Async operations
- Optimized database queries

## Troubleshooting

### Function not deploying
- Make sure you're logged in: `supabase login`
- Make sure you're linked to project: `supabase link`
- Check for TypeScript errors in the code

### Events not being inserted
- Check function logs: `supabase functions logs track`
- Verify RLS policies allow inserts
- Check that required fields are being sent

### CORS errors
- Make sure CORS headers are correctly set
- Test with `OPTIONS` request

## Next Steps

After deploying this function:
1. Copy the function URL
2. Update your SDK initialization with the endpoint
3. Test with the SDK
4. Monitor logs to verify events are being received

