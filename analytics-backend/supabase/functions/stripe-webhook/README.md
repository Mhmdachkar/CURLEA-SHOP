# Stripe Webhook Edge Function

Handles Stripe webhook events and updates order status.

## API

**Endpoint:** `POST /functions/v1/stripe-webhook`

**Config in Stripe Dashboard:**
```
https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook
```

## Events Handled

- `checkout.session.completed` → status: completed
- `checkout.session.async_payment_succeeded` → status: completed
- `checkout.session.async_payment_failed` → status: failed
- `payment_intent.succeeded` → logged
- `payment_intent.payment_failed` → logged

## Security

- Webhook signature verification
- Secure secret handling
- Error logging

## Environment Variables

- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret

## Deployment

```bash
supabase functions deploy stripe-webhook
```

## Configure in Stripe

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint URL
3. Select events to listen for
4. Copy signing secret
5. Set environment variable

See main [README.md](../README.md) for full instructions.

