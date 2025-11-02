# 🚀 Resend Email Integration Setup Guide
## Complete Step-by-Step Instructions for curlea.beauty

This guide will walk you through setting up Resend email notifications for your COD orders on your `curlea.beauty` domain.

---

## 📋 Prerequisites

- ✅ Domain purchased: `curlea.beauty`
- ✅ Netlify account with site deployed
- ✅ Resend account (free tier: 3,000 emails/month)

---

## 🔧 Step 1: Install Resend Package

**In your project directory:**

```bash
npm install resend
```

This has already been added to your `package.json`, so just run:

```bash
npm install
```

---

## 📧 Step 2: Set Up Resend Account & Domain Verification

### 2.1 Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Click **"Sign Up"** (use Google/GitHub for quick setup)
3. Verify your email address
4. You'll be on the Resend dashboard

### 2.2 Get Your API Key

1. In Resend dashboard, click **"API Keys"** in the left sidebar
2. Click **"Create API Key"**
3. Name it: `curlea-beauty-production`
4. Set permission: **"Sending access"**
5. Click **"Add"**
6. **⚠️ IMPORTANT:** Copy the API key immediately (starts with `re_...`). You won't be able to see it again!
   - Save it securely (password manager, notes, etc.)

### 2.3 Add and Verify Your Domain

1. In Resend dashboard, click **"Domains"** in the left sidebar
2. Click **"Add Domain"**
3. Enter your domain: `curlea.beauty`
4. Click **"Add Domain"**

### 2.4 Add DNS Records

Resend will show you DNS records that need to be added. You'll see **3 types of records**:

#### Option A: Using Netlify DNS (Recommended - Easier)

If you're using Netlify DNS for your domain:

1. In Netlify dashboard → Your site → **"Domain settings"**
2. Click **"DNS"** tab
3. Click **"Add DNS record"** for each record:

   **Record 1: Domain Verification (DKIM)**
   - Type: `TXT`
   - Name: `resend._domainkey` (copy exactly from Resend)
   - Value: Copy the long encrypted string from Resend (starts with `p=MIGfMA0GCSqGSIb3DQEB...`)
   - TTL: `3600` (or leave as Auto if available)
   
   **Record 2: MX Record (for sending emails)**
   - Type: `MX`
   - Name: `send` (copy exactly from Resend)
   - Value: Copy from Resend (looks like `feedback-smtp.ap-north...` or similar)
   - Priority: `10` (copy from Resend)
   - TTL: `3600` (or Auto)

   **Record 3: SPF Record (for sending emails)**
   - Type: `TXT`
   - Name: `send` (copy exactly from Resend)
   - Value: Copy from Resend (looks like `v=spf1 include:amazons...`)
   - TTL: `3600` (or Auto)

   **Record 4: DMARC (Optional but Recommended)**
   - Type: `TXT`
   - Name: `_dmarc`
   - Value: Copy from Resend (usually `v=DMARC1; p=none;` or `v=DMARC1; p=quarantine;`)
   - TTL: `3600` (or Auto)
   
   **Important Notes:**
   - ✅ All DKIM records are **TXT** type, NOT CNAME
   - ✅ Copy names and values **exactly** as shown in Resend (case-sensitive)
   - ✅ The `send` subdomain is used for sending emails from Resend
   - ✅ Priority is only needed for MX records

4. **Save each record** after adding it

#### Option B: Using External DNS Provider

If your domain DNS is managed elsewhere (e.g., Namecheap, GoDaddy, Cloudflare):

1. Go to your domain registrar/DNS provider's dashboard
2. Navigate to **DNS Management** or **DNS Records**
3. Add the same 4 records as shown above:
   - TXT: `resend._domainkey` (Domain Verification)
   - MX: `send` (Sending)
   - TXT: `send` (SPF for Sending)
   - TXT: `_dmarc` (DMARC - Optional)

### 2.5 Verify Domain in Resend

1. After adding all DNS records, go back to Resend dashboard
2. In **"Domains"** section, find `curlea.beauty`
3. Click **"Verify"** button
4. Wait 5-30 minutes for DNS propagation (can take up to 24 hours)
5. Once verified, you'll see a green checkmark ✅

**Note:** If verification fails:
- Wait a few more minutes (DNS can be slow)
- Double-check that all DNS records are added correctly
- Ensure record names match exactly (case-sensitive)
- Visit [https://dnschecker.org](https://dnschecker.org) to check if DNS records have propagated globally

---

## 🔐 Step 3: Configure Netlify Environment Variables

### 3.1 Access Netlify Dashboard

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Select your site (the one with `curlea.beauty` domain)

### 3.2 Add Environment Variables

1. In your site dashboard, go to **"Site settings"** (top menu)
2. Click **"Environment variables"** in the left sidebar
3. Click **"Add a variable"** button

Add these **3 environment variables**:

#### Variable 1: RESEND_API_KEY
- **Key:** `RESEND_API_KEY`
- **Value:** Your Resend API key (starts with `re_...`)
- **Scopes:** Check **"All scopes"** (Production, Deploy previews, Branch deploys)
- Click **"Create variable"**

#### Variable 2: ORDER_EMAIL_FROM
- **Key:** `ORDER_EMAIL_FROM`
- **Value:** `orders@curlea.beauty` (or `hello@curlea.beauty` - must match your verified domain)
- **Scopes:** Check **"All scopes"**
- Click **"Create variable"**

#### Variable 3: ORDER_EMAIL_TO
- **Key:** `ORDER_EMAIL_TO`
- **Value:** `hello@curlea.beauty` (the email address where you want to receive orders)
- **Scopes:** Check **"All scopes"**
- Click **"Create variable"**

### 3.3 Verify Environment Variables

Your environment variables list should now show:
```
✅ RESEND_API_KEY          [Production, Deploy previews, Branch deploys]
✅ ORDER_EMAIL_FROM        [Production, Deploy previews, Branch deploys]
✅ ORDER_EMAIL_TO          [Production, Deploy previews, Branch deploys]
```

---

## 🌐 Step 4: Connect Domain to Netlify

**✅ SKIP THIS STEP IF:**
- Your website is already live at `curlea.beauty` ✅ (You're here!)
- Netlify already connected your domain when you purchased it

**If your domain is already connected and working, proceed directly to Step 5.**

---

**If you need to connect a domain manually (for reference):**

### 4.1 Add Custom Domain

1. In Netlify dashboard → Your site → **"Domain settings"**
2. Click **"Add custom domain"**
3. Enter: `curlea.beauty`
4. Click **"Verify"**

### 4.2 Configure DNS (Choose One Method)

#### Method A: Use Netlify DNS (Recommended)

1. Netlify will show you nameservers (e.g., `dns1.p01.nsone.net`)
2. Go to your domain registrar (where you bought `curlea.beauty`)
3. Find **"Nameservers"** or **"DNS Settings"**
4. Change nameservers to the ones Netlify provided
5. Save changes
6. Wait 24-48 hours for DNS propagation

#### Method B: Keep External DNS (Use A/CNAME Records)

1. Keep your current nameservers at your registrar
2. In Netlify, under **"Domain settings"** → **"DNS"**
3. Netlify will show you required DNS records:
   - **A Record:** Point `@` to Netlify's IP
   - **CNAME Record:** Point `www` to your Netlify site URL
4. Add these records in your external DNS provider
5. Wait for DNS propagation

### 4.3 Enable HTTPS

1. Once domain is connected, go to **"Domain settings"**
2. Under **"HTTPS"**, click **"Verify DNS configuration"**
3. Netlify will automatically provision SSL certificate via Let's Encrypt
4. Wait 5-10 minutes for SSL to activate
5. Your site will now be available at `https://curlea.beauty`

---

## 🔄 Step 5: Deploy Updated Code

### 5.1 Install Dependencies Locally

```bash
npm install
```

This installs the `resend` package we added.

### 5.2 Test Locally (Optional)

```bash
npm run dev
```

Test the checkout flow locally (email won't send, but code should work).

### 5.3 Push to Git & Deploy

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Add Resend email integration for COD orders"
   git push
   ```

2. **Netlify will auto-deploy:**
   - Go to Netlify dashboard → **"Deploys"** tab
   - Wait for build to complete
   - Check build logs for any errors

3. **Or trigger manual deploy:**
   - In Netlify dashboard → **"Deploys"** → **"Trigger deploy"** → **"Deploy site"**

### 5.4 Verify Function Deployment

1. After deployment, go to **"Functions"** tab in Netlify dashboard
2. You should see: `send-order-email` function listed
3. Click on it to see logs and test

---

## ✅ Step 6: Test Email Sending

### 6.1 Test from Your Website

1. Go to your live site: `https://curlea.beauty`
2. Add products to cart
3. Go to checkout
4. Select **"Cash on Delivery"**
5. Fill in delivery form:
   - Name: Test Customer
   - Email: your-test-email@gmail.com
   - Phone: +961 71 234 567
   - Address: 123 Test Street
   - City: Beirut
   - ZIP: 1107
   - Country: Lebanon
6. Click **"Place order"**
7. Complete the checkout

### 6.2 Check Email

1. Check the email inbox specified in `ORDER_EMAIL_TO` (e.g., `hello@curlea.beauty`)
2. You should receive a beautifully formatted order confirmation email with:
   - Order ID
   - Customer details
   - Order items
   - Total amount

### 6.3 Check Function Logs

1. In Netlify dashboard → **"Functions"** → `send-order-email`
2. Click **"Logs"** tab
3. Look for recent function calls
4. Check for any errors

### 6.4 Check Resend Dashboard

1. Go to [https://resend.com/emails](https://resend.com/emails)
2. You should see your sent emails listed
3. Click on an email to see details, delivery status, etc.

---

## 🐛 Troubleshooting

### Problem: Email not sending

**Check:**
1. ✅ DNS records added correctly in Netlify/external DNS
2. ✅ Domain verified in Resend dashboard (green checkmark)
3. ✅ Environment variables set in Netlify
4. ✅ Function deployed successfully
5. ✅ Check Netlify function logs for errors

**Common fixes:**
- Re-verify DNS records (wait 24 hours if just added)
- Check `ORDER_EMAIL_FROM` matches verified domain exactly
- Ensure `RESEND_API_KEY` is correct (starts with `re_`)

### Problem: "Domain not verified" error

**Solution:**
1. Go to Resend dashboard → Domains
2. Click on `curlea.beauty`
3. Check all DNS records are present
4. Wait longer for DNS propagation (use [dnschecker.org](https://dnschecker.org))
5. Re-verify domain in Resend

### Problem: Function returns 500 error

**Check:**
1. Netlify function logs (Site dashboard → Functions → Logs)
2. Ensure `resend` package is installed (check `package.json`)
3. Verify environment variables are set correctly
4. Check function code syntax (no typos)

### Problem: CORS errors

**Solution:**
- The function already includes CORS headers
- If issues persist, check Netlify's redirect rules

---

## 📊 Monitoring & Analytics

### Resend Dashboard

- **Emails:** View all sent emails, delivery status, opens, clicks
- **Analytics:** Track email performance
- **API Usage:** Monitor your monthly email quota (free: 3,000/month)

### Netlify Function Logs

- Go to **"Functions"** → `send-order-email` → **"Logs"**
- Monitor function invocations, execution time, errors

---

## 🔒 Security Notes

1. **Never commit API keys to Git** - They're stored in Netlify environment variables
2. **Domain verification** ensures only you can send from `curlea.beauty`
3. **HTTPS required** - Netlify auto-provisions SSL certificates
4. **API key rotation** - If compromised, create new key in Resend and update Netlify env var

---

## 📝 Quick Reference

### Environment Variables Summary

| Variable | Value Example | Purpose |
|----------|---------------|---------|
| `RESEND_API_KEY` | `re_abc123...` | Authenticates with Resend API |
| `ORDER_EMAIL_FROM` | `orders@curlea.beauty` | Sender email (must match verified domain) |
| `ORDER_EMAIL_TO` | `hello@curlea.beauty` | Recipient email (where orders are sent) |

### DNS Records Summary

| Type | Name | Value | Priority | Purpose |
|------|------|-------|----------|---------|
| TXT | `resend._domainkey` | Long encrypted string (starts with `p=MIGf...`) | - | Domain Verification (DKIM) |
| MX | `send` | `feedback-smtp.ap-north...` (from Resend) | 10 | Email sending server |
| TXT | `send` | `v=spf1 include:amazons...` (from Resend) | - | SPF authentication for sending |
| TXT | `_dmarc` | `v=DMARC1; p=none;` (from Resend) | - | DMARC policy (optional) |

**Note:** All values should be copied exactly from your Resend dashboard. The names are case-sensitive!

---

## ✨ You're All Set!

Once all steps are complete:
- ✅ Emails will automatically send on every COD order
- ✅ You'll receive order confirmations at `hello@curlea.beauty`
- ✅ Customers' emails will be in the "Reply-To" field
- ✅ All emails are professionally formatted with order details

---

## 🆘 Need Help?

- **Resend Docs:** [https://resend.com/docs](https://resend.com/docs)
- **Netlify Functions:** [https://docs.netlify.com/functions/overview/](https://docs.netlify.com/functions/overview/)
- **Netlify DNS:** [https://docs.netlify.com/domains-https/netlify-dns/](https://docs.netlify.com/domains-https/netlify-dns/)

---

**Last Updated:** November 2025  
**Domain:** curlea.beauty  
**Email Service:** Resend

