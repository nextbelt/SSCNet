# LinkedProcurement Domain Setup Guide

## 🌐 Domain: linkedprocurement.com

This guide covers how to set up your custom domain with Railway hosting.

## Current Setup

| Service | Railway URL | Future Custom Domain |
|---------|-------------|---------------------|
| Frontend | loyal-inspiration-production.up.railway.app | linkedprocurement.com |
| Frontend (www) | loyal-inspiration-production.up.railway.app | www.linkedprocurement.com |
| Backend API | sscnet-production.up.railway.app | api.linkedprocurement.com |
| App (optional) | loyal-inspiration-production.up.railway.app | app.linkedprocurement.com |

## Step 1: DNS Configuration

Add these DNS records in your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

### Option A: CNAME Records (Recommended)

| Type  | Host/Name | Value/Points To | TTL |
|-------|-----------|-----------------|-----|
| CNAME | @ | loyal-inspiration-production.up.railway.app | 3600 |
| CNAME | www | loyal-inspiration-production.up.railway.app | 3600 |
| CNAME | api | sscnet-production.up.railway.app | 3600 |
| CNAME | app | loyal-inspiration-production.up.railway.app | 3600 |

> **Note**: Some registrars don't allow CNAME on root domain (@). In that case, use Option B.

### Option B: A Record + CNAME (If CNAME on root isn't supported)

First, get Railway's IP by running:
```bash
nslookup loyal-inspiration-production.up.railway.app
```

Then add:
| Type  | Host/Name | Value | TTL |
|-------|-----------|-------|-----|
| A | @ | [Railway IP] | 3600 |
| CNAME | www | loyal-inspiration-production.up.railway.app | 3600 |
| CNAME | api | sscnet-production.up.railway.app | 3600 |
| CNAME | app | loyal-inspiration-production.up.railway.app | 3600 |

## Step 2: Add Custom Domain in Railway

### Frontend Service:
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your project
3. Click on the **Frontend** service (loyal-inspiration)
4. Go to **Settings** → **Networking** → **Custom Domains**
5. Click **+ Add Custom Domain**
6. Enter: `linkedprocurement.com`
7. Click **Add Domain**
8. Repeat for: `www.linkedprocurement.com`

### Backend Service:
1. Click on the **Backend** service (SSCNet)
2. Go to **Settings** → **Networking** → **Custom Domains**
3. Click **+ Add Custom Domain**
4. Enter: `api.linkedprocurement.com`
5. Click **Add Domain**

## Step 3: Update Environment Variables

### Backend (.env / Railway Variables):
```env
FRONTEND_URL=https://linkedprocurement.com
ALLOWED_ORIGINS=https://linkedprocurement.com,https://www.linkedprocurement.com,https://app.linkedprocurement.com
LINKEDIN_REDIRECT_URI=https://linkedprocurement.com/auth/linkedin/callback
```

### Frontend (.env.production):
```env
NEXT_PUBLIC_API_URL=https://api.linkedprocurement.com
```

## Step 4: Update LinkedIn OAuth (When Ready)

1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Select your app
3. Go to **Auth** settings
4. Add redirect URIs:
   - `https://linkedprocurement.com/auth/linkedin/callback`
   - `https://www.linkedprocurement.com/auth/linkedin/callback`

## Step 5: Update Supabase Auth Redirect URLs

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Update **Site URL**: `https://linkedprocurement.com`
5. Add to **Redirect URLs**:
   - `https://linkedprocurement.com/**`
   - `https://www.linkedprocurement.com/**`
   - `https://app.linkedprocurement.com/**`

## SSL/HTTPS

Railway automatically provisions SSL certificates for custom domains. After adding your domain:

1. Wait 5-10 minutes for SSL provisioning
2. Test: `https://linkedprocurement.com`
3. Certificate should show "Let's Encrypt" or "Railway"

## Verification Checklist

After setup, verify:

- [ ] `https://linkedprocurement.com` loads frontend
- [ ] `https://www.linkedprocurement.com` loads frontend  
- [ ] `https://api.linkedprocurement.com/health` returns healthy
- [ ] `https://api.linkedprocurement.com/docs` loads API docs
- [ ] SSL certificates are valid (green padlock)
- [ ] Login/signup works correctly
- [ ] No CORS errors in browser console

## DNS Propagation

DNS changes can take up to 48 hours to propagate globally, but typically:
- Most users: 15 minutes - 2 hours
- Some regions: Up to 24 hours

Check propagation status: https://www.whatsmydns.net/#CNAME/linkedprocurement.com

## Troubleshooting

### "Domain not verified" in Railway
- Double-check DNS records are correct
- Wait 10-15 minutes for DNS to propagate
- Try removing and re-adding the domain

### SSL Certificate not working
- Railway auto-provisions SSL after domain verification
- Can take up to 10 minutes
- If still failing after 30 mins, contact Railway support

### CORS Errors after domain change
- Update `ALLOWED_ORIGINS` in backend Railway variables
- Make sure to include both `linkedprocurement.com` and `www.linkedprocurement.com`
- Redeploy backend service

### Mixed content warnings
- Ensure all API calls use `https://api.linkedprocurement.com`
- Check frontend `.env.production` has correct API URL

## Email Setup (Future)

When you're ready to set up email (support@linkedprocurement.com):

### MX Records for Google Workspace / Microsoft 365:
Add your email provider's MX records separately from the web hosting records.

### SPF Record (for SendGrid):
```
TXT @ "v=spf1 include:sendgrid.net ~all"
```

---

## Quick Reference

| URL | Purpose |
|-----|---------|
| https://linkedprocurement.com | Main website/app |
| https://www.linkedprocurement.com | Redirect to main |
| https://api.linkedprocurement.com | Backend API |
| https://api.linkedprocurement.com/docs | API Documentation |
| https://api.linkedprocurement.com/health | Health check |

---

**Need help?** Contact support@linkedprocurement.com
