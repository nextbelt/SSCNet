#!/bin/bash

# 🚀 One-Click Railway Deployment Script for SSCN B2B Marketplace

echo "🚂 Setting up Railway deployment for SSCN B2B Marketplace..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    print_warning "Railway CLI not found. Installing..."
    npm install -g @railway/cli
    if [ $? -eq 0 ]; then
        print_success "Railway CLI installed successfully!"
    else
        print_error "Failed to install Railway CLI. Please install manually."
        exit 1
    fi
else
    print_success "Railway CLI found!"
fi

# Check if user is logged in to Railway
print_status "Checking Railway authentication..."
railway whoami &> /dev/null
if [ $? -ne 0 ]; then
    print_warning "Not logged in to Railway. Please log in..."
    railway login
    if [ $? -ne 0 ]; then
        print_error "Failed to log in to Railway."
        exit 1
    fi
else
    print_success "Already logged in to Railway!"
fi

# Get project name
echo ""
echo -e "${BLUE}📋 Project Configuration${NC}"
read -p "Enter your project name (default: sscn-marketplace): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-sscn-marketplace}

# Get GitHub repo URL
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/repo): " GITHUB_REPO
if [ -z "$GITHUB_REPO" ]; then
    print_error "GitHub repository URL is required!"
    exit 1
fi

# LinkedIn credentials
echo ""
echo -e "${YELLOW}🔗 LinkedIn OAuth Configuration${NC}"
echo "You'll need a LinkedIn Developer App. Get one at: https://developer.linkedin.com/"
read -p "Enter LinkedIn Client ID: " LINKEDIN_CLIENT_ID
read -p "Enter LinkedIn Client Secret: " LINKEDIN_CLIENT_SECRET

if [ -z "$LINKEDIN_CLIENT_ID" ] || [ -z "$LINKEDIN_CLIENT_SECRET" ]; then
    print_error "LinkedIn credentials are required!"
    exit 1
fi

# Generate secret key
SECRET_KEY=$(openssl rand -base64 32)
if [ -z "$SECRET_KEY" ]; then
    SECRET_KEY="fallback-secret-key-change-this-in-production-$(date +%s)"
fi

print_status "Generated SECRET_KEY: ${SECRET_KEY:0:20}..."

echo ""
echo -e "${BLUE}🚀 Starting Railway Deployment...${NC}"

# Create new Railway project
print_status "Creating Railway project: $PROJECT_NAME"
railway new "$PROJECT_NAME"

if [ $? -ne 0 ]; then
    print_error "Failed to create Railway project"
    exit 1
fi

print_success "Railway project created!"

# Deploy Backend
echo ""
print_status "🐍 Deploying Backend Service..."

# Add PostgreSQL service
print_status "Adding PostgreSQL database..."
railway add postgresql

# Set backend environment variables
print_status "Setting backend environment variables..."
railway variables set SECRET_KEY="$SECRET_KEY"
railway variables set LINKEDIN_CLIENT_ID="$LINKEDIN_CLIENT_ID" 
railway variables set LINKEDIN_CLIENT_SECRET="$LINKEDIN_CLIENT_SECRET"
railway variables set ENVIRONMENT="production"
railway variables set DEBUG="false"
railway variables set POC_VERIFICATION_INTERVAL_DAYS="30"
railway variables set EMAIL_VERIFICATION_ENABLED="true"
railway variables set AUTO_VERIFICATION_ENABLED="true"

# Deploy backend from GitHub
print_status "Deploying backend from GitHub..."
railway up --service backend

BACKEND_URL=$(railway domain)
if [ -z "$BACKEND_URL" ]; then
    BACKEND_URL="your-backend-domain.railway.app"
    print_warning "Could not get backend URL automatically. Please update manually."
else
    print_success "Backend deployed at: $BACKEND_URL"
fi

# Deploy Frontend
echo ""
print_status "⚛️ Deploying Frontend Service..."

# Create new service for frontend
railway service new frontend

# Set frontend environment variables
print_status "Setting frontend environment variables..."
railway variables set NEXT_PUBLIC_API_URL="https://$BACKEND_URL"
railway variables set NEXT_PUBLIC_LINKEDIN_CLIENT_ID="$LINKEDIN_CLIENT_ID"
railway variables set NODE_ENV="production"
railway variables set NEXT_TELEMETRY_DISABLED="1"

# Deploy frontend
railway up --service frontend

FRONTEND_URL=$(railway domain)
if [ -z "$FRONTEND_URL" ]; then
    FRONTEND_URL="your-frontend-domain.railway.app"
    print_warning "Could not get frontend URL automatically. Please update manually."
else
    print_success "Frontend deployed at: $FRONTEND_URL"
fi

# Update backend with frontend URL
print_status "Updating backend with frontend URL..."
railway service backend
railway variables set FRONTEND_URL="https://$FRONTEND_URL"
railway variables set ALLOWED_ORIGINS="https://$FRONTEND_URL,http://localhost:3000"
railway variables set LINKEDIN_REDIRECT_URI="https://$FRONTEND_URL/auth/linkedin/callback"

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Your SSCN B2B Marketplace URLs:${NC}"
echo -e "   Frontend: ${GREEN}https://$FRONTEND_URL${NC}"
echo -e "   Backend:  ${GREEN}https://$BACKEND_URL${NC}"
echo -e "   API Docs: ${GREEN}https://$BACKEND_URL/docs${NC}"
echo ""
echo -e "${YELLOW}🔗 Next Steps:${NC}"
echo "1. Update your LinkedIn app redirect URI to: https://$FRONTEND_URL/auth/linkedin/callback"
echo "2. Test your deployment at: https://$FRONTEND_URL"
echo "3. Check API health at: https://$BACKEND_URL/health"
echo ""
echo -e "${BLUE}🧪 Testing Checklist:${NC}"
echo "   □ Landing page loads"
echo "   □ Buyer dashboard (post RFQ)"
echo "   □ Supplier dashboard (browse RFQs)"
echo "   □ Company profile management"
echo "   □ Performance analytics"
echo "   □ LinkedIn POC authentication"
echo ""
echo -e "${GREEN}Happy sourcing! 🚀${NC}"