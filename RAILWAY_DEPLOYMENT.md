# 🚀 Railway Deployment Guide for SSCN B2B Marketplace

## Prerequisites
- Railway account (you have this! ✅)
- GitHub repository with your code
- LinkedIn Developer App for OAuth
- AWS S3 bucket for file storage (optional for MVP)
- SendGrid account for emails (optional for MVP)

## 🚂 Quick Deployment Steps

### 1. Prepare GitHub Repository
```bash
# Initialize git in your project root
cd "C:\Users\cncha\OneDrive\Desktop\Sourcing Supply Chain Net"
git init
git add .
git commit -m "Initial commit: Complete B2B marketplace platform"

# Create GitHub repo and push
# (You'll need to create a new repo on GitHub first)
git remote add origin https://github.com/yourusername/sourcing-supply-chain-net.git
git push -u origin main
```

### 2. Deploy Backend on Railway

#### 2.1 Create Backend Service
1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will detect both frontend and backend - select **backend folder**

#### 2.2 Configure Backend Environment Variables
Set these in Railway dashboard under **Variables**:

**Required for MVP:**
```
SECRET_KEY=your-super-secret-jwt-key-make-it-long-and-random
LINKEDIN_CLIENT_ID=your-linkedin-app-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-app-client-secret
FRONTEND_URL=https://your-frontend-domain.railway.app
```

**Railway will auto-provide:**
```
DATABASE_URL=postgresql://... (Railway PostgreSQL plugin)
PORT=... (auto-provided)
```

**Optional (for full features):**
```
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=sscn-documents
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@yourdomain.com
```

#### 2.3 Add PostgreSQL Plugin
1. In your Railway project, click "Add Service"
2. Select "PostgreSQL"
3. Railway will automatically set `DATABASE_URL`

### 3. Deploy Frontend on Railway

#### 3.1 Create Frontend Service
1. In the same Railway project, click "Add Service"
2. Select "GitHub Repo" again
3. Choose the same repository but select **frontend folder**

#### 3.2 Configure Frontend Environment Variables
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your-linkedin-app-client-id
NODE_ENV=production
```

### 4. LinkedIn App Configuration

#### 4.1 Create LinkedIn Developer App
1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Create new app
3. Add these redirect URIs:
   - `https://your-frontend-domain.railway.app/auth/linkedin/callback`
   - `http://localhost:3000/auth/linkedin/callback` (for local dev)

#### 4.2 Required LinkedIn Products
- Sign In with LinkedIn using OpenID Connect
- LinkedIn Profile API

### 5. Update CORS and Redirect URIs
Once deployed, update your environment variables with actual Railway domains:

**Backend Variables:**
```
FRONTEND_URL=https://your-actual-frontend.railway.app
ALLOWED_ORIGINS=https://your-actual-frontend.railway.app
LINKEDIN_REDIRECT_URI=https://your-actual-frontend.railway.app/auth/linkedin/callback
```

**Frontend Variables:**
```
NEXT_PUBLIC_API_URL=https://your-actual-backend.railway.app
```

## 🧪 Testing Your Deployment

### 1. Test Backend API
```bash
# Health check
curl https://your-backend-domain.railway.app/health

# API docs
https://your-backend-domain.railway.app/docs
```

### 2. Test Frontend
Visit: `https://your-frontend-domain.railway.app`

Should see:
- ✅ Landing page loads
- ✅ Navigation to buyer/supplier dashboards
- ✅ RFQ posting interface
- ✅ Supplier opportunities browser
- ✅ Company profile management
- ✅ Performance analytics

### 3. Test LinkedIn Integration
1. Go to supplier profile page
2. Try adding a POC
3. LinkedIn OAuth should redirect properly

## 🔧 Railway Project Structure

Your Railway project will have:
```
📁 SSCN Marketplace
├── 🐍 Backend Service (FastAPI)
│   ├── 🗄️ PostgreSQL Database
│   └── 🌐 Public domain: your-backend.railway.app
└── ⚛️ Frontend Service (Next.js)
    └── 🌐 Public domain: your-frontend.railway.app
```

## 📋 MVP Testing Checklist

Once deployed, test these core features:

**🔵 Buyer Side:**
- [ ] Post new RFQ
- [ ] Search for suppliers
- [ ] View RFQ responses
- [ ] Contact suppliers

**🟢 Supplier Side:**
- [ ] Browse RFQ opportunities  
- [ ] Submit quotes
- [ ] Manage company profile
- [ ] View performance analytics
- [ ] Add/verify POCs

**🔗 LinkedIn Integration:**
- [ ] POC LinkedIn authentication
- [ ] Employment verification
- [ ] Profile data sync

## 🚀 Go Live Commands

### Option A: Using Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy backend
cd backend
railway up

# Deploy frontend  
cd ../frontend
railway up
```

### Option B: Using Railway Dashboard
1. Connect GitHub repo
2. Railway auto-deploys on git push
3. Configure environment variables
4. Enable PostgreSQL plugin
5. Test endpoints

## 🎯 Next Steps After Deployment

1. **Domain Setup**: Add custom domains in Railway
2. **SSL**: Railway provides HTTPS automatically
3. **Monitoring**: Use Railway's built-in metrics
4. **Scaling**: Railway auto-scales based on usage
5. **CI/CD**: Auto-deploy on git push

## 💡 Pro Tips

- Railway provides free tier perfect for testing
- PostgreSQL plugin is free up to 1GB
- Use Railway's environment groups for staging/production
- Railway logs are available in dashboard
- Can add custom domains later

Your B2B marketplace will be live and ready for testing in ~10 minutes! 🎉