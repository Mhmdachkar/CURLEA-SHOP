# 🚀 Analytics Dashboard Deployment Guide

## Quick Start - Deploy to Netlify

### Step 1: Prepare Your Repository

1. **Commit all changes:**
```bash
git add .
git commit -m "Add analytics dashboard with Netlify config"
git push origin main
```

### Step 2: Deploy to Netlify

#### Option A: Deploy via Netlify UI (Recommended)

1. **Go to Netlify**: https://app.netlify.com
2. **Click "Add new site" → "Import an existing project"**
3. **Connect to GitHub/GitLab/Bitbucket**
4. **Select your repository**
5. **Configure build settings:**
   - **Base directory**: `analytics-backend/analytics-dashboard`
   - **Build command**: `npm run build`
   - **Publish directory**: `analytics-backend/analytics-dashboard/dist`
   - **Node version**: 18

6. **Click "Deploy site"**

#### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Navigate to dashboard directory
cd analytics-backend/analytics-dashboard

# Deploy
netlify deploy --prod
```

### Step 3: Set Environment Variables

In Netlify Dashboard → Site Settings → Environment variables, add:

**Required Variables:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Optional Variables:**
```
VITE_ADMIN_PASSWORD=your-secure-password-123
VITE_APP_TITLE=CURLEA Analytics Dashboard
VITE_ENV=production
```

### Step 4: Configure Domain (Optional)

1. **Go to Domain settings** in Netlify
2. **Add custom domain** (e.g., `analytics.curlea.beauty`)
3. **Update DNS records** as instructed
4. **Enable HTTPS** (automatic with Netlify)

---

## 🔐 Authentication Setup

You have **two authentication options**:

### Option 1: Simple Password Protection (Easier)

**Setup:**
1. Set `VITE_ADMIN_PASSWORD` in Netlify environment variables
2. Use the "Simple Auth" tab on the login page
3. Enter the password to access

**Pros:**
- ✅ Quick to set up
- ✅ No database configuration needed
- ✅ Good for small teams

**Cons:**
- ⚠️ Single password for everyone
- ⚠️ Less secure than Supabase Auth

### Option 2: Supabase Authentication (Recommended)

**Setup:**

1. **Enable Email Auth in Supabase:**
   - Go to Supabase Dashboard
   - Authentication → Providers
   - Enable Email provider

2. **Create Admin Users:**
```sql
-- Run in Supabase SQL Editor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'admin@yourdomain.com',
  crypt('your-secure-password', gen_salt('bf')),
  now()
);
```

Or use Supabase Dashboard:
- Authentication → Users
- Click "Invite User"
- Enter admin email

3. **Set Row Level Security (RLS):**
```sql
-- Allow authenticated users to read analytics
CREATE POLICY "Allow authenticated users" ON visits
FOR SELECT USING (auth.role() = 'authenticated');

-- Repeat for all analytics tables
```

**Pros:**
- ✅ Secure user management
- ✅ Multiple admin accounts
- ✅ Password reset functionality
- ✅ Audit trails

**Cons:**
- ⚠️ Requires Supabase setup
- ⚠️ More initial configuration

---

## 📁 File Structure

```
analytics-backend/analytics-dashboard/
├── src/
│   ├── components/
│   │   └── Auth.tsx          ← Login component
│   ├── lib/
│   │   └── supabase.ts       ← Supabase client
│   └── App.tsx               ← Main dashboard
├── netlify.toml              ← Netlify config
├── _redirects                ← SPA routing
├── .env.example              ← Environment variables template
└── package.json              ← Dependencies
```

---

## 🔧 Configuration Files Explained

### `netlify.toml`

```toml
[build]
  base = "analytics-backend/analytics-dashboard"
  command = "npm run build"
  publish = "dist"
```
- **base**: Directory to build from
- **command**: Build command to run
- **publish**: Directory with build output

### `_redirects`

```
/* /index.html 200
```
- Redirects all routes to `index.html` for SPA routing

### `.env` (Create from `.env.example`)

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_ADMIN_PASSWORD=my-secure-password
```

---

## 🌐 Custom Domain Setup

### Option 1: Subdomain (Recommended)

**Setup `analytics.curlea.beauty`:**

1. **In Netlify:**
   - Domain settings → Add custom domain
   - Enter: `analytics.curlea.beauty`

2. **In Your DNS Provider:**
   - Add CNAME record:
     ```
     analytics → your-site.netlify.app
     ```

### Option 2: Separate Domain

**Setup `curlea-analytics.com`:**

1. **In Netlify:**
   - Domain settings → Add custom domain
   - Enter: `curlea-analytics.com`

2. **In Your DNS Provider:**
   - Add A record:
     ```
     @ → Netlify IP (provided in Netlify dashboard)
     ```

---

## 🔒 Security Best Practices

### 1. Strong Password

If using simple auth:
```bash
# Generate a strong password
openssl rand -base64 32
```

Set as `VITE_ADMIN_PASSWORD`

### 2. IP Whitelist (Optional)

In `netlify.toml`, add:
```toml
[[redirects]]
  from = "/*"
  to = "/.netlify/functions/ip-check"
  status = 200
  conditions = {Country = ["!US", "!CA"]}  # Only allow US/CA
```

### 3. Basic Auth (Extra Layer)

In Netlify Dashboard:
- Settings → Access control
- Enable password protection
- Set password

### 4. HTTPS Only

Automatically enabled by Netlify!

---

## 📊 Monitoring & Analytics

### Track Dashboard Usage

In Supabase, create a table:
```sql
CREATE TABLE dashboard_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  ip_address INET,
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);
```

Add logging to `Auth.tsx`:
```typescript
await supabase.from('dashboard_access_logs').insert({
  user_email: email,
  ip_address: // get from request
});
```

---

## 🐛 Troubleshooting

### Issue: Build Fails

**Solution:**
```bash
# Clear cache and rebuild
cd analytics-backend/analytics-dashboard
rm -rf node_modules dist
npm install
npm run build
```

### Issue: Environment Variables Not Working

**Solution:**
1. Check variable names start with `VITE_`
2. Rebuild after adding variables
3. Clear Netlify cache: Deploys → Trigger deploy → Clear cache

### Issue: 404 on Refresh

**Solution:**
- Ensure `_redirects` file exists
- Check it's in the `dist` folder after build
- Verify `netlify.toml` has redirects config

### Issue: Authentication Not Working

**Solution:**
- Check Supabase URL and keys are correct
- Verify RLS policies in Supabase
- Check browser console for errors

---

## 🚀 Deployment Checklist

- [ ] Code committed to Git
- [ ] Repository connected to Netlify
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] First deploy successful
- [ ] Login page accessible
- [ ] Authentication working
- [ ] Dashboard loading data
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled
- [ ] Password protection enabled (optional)

---

## 📱 Access URLs

After deployment, you'll have:

**Netlify URL (Default):**
```
https://your-site-name.netlify.app
```

**Custom Domain (If configured):**
```
https://analytics.curlea.beauty
```

---

## 🔄 Continuous Deployment

Netlify automatically:
- ✅ Deploys on every push to main branch
- ✅ Creates preview deployments for pull requests
- ✅ Enables instant rollbacks
- ✅ Provides deploy notifications

**To disable auto-deploy:**
- Settings → Build & deploy → Stop builds

---

## 💡 Pro Tips

1. **Use Deploy Previews**: Test changes before merging to main
2. **Set Up Notifications**: Get alerts on deploy status
3. **Use Branch Deploys**: Deploy from different branches
4. **Monitor Performance**: Use Netlify Analytics
5. **Set Up Backups**: Regular database backups in Supabase

---

## 📞 Support

**Netlify Issues:**
- Docs: https://docs.netlify.com
- Support: https://answers.netlify.com

**Supabase Issues:**
- Docs: https://supabase.com/docs
- Support: https://github.com/supabase/supabase

---

## 🎉 You're Done!

Your analytics dashboard is now:
- ✅ Hosted on Netlify
- ✅ Protected with authentication
- ✅ Accessible to admins only
- ✅ Automatically deployed on updates

**Share the URL with your team and start analyzing your data!** 🚀

---

**Last Updated**: November 18, 2025
**Status**: Production Ready ✅

