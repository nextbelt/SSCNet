# Sourcing Supply Chain Net

A comprehensive B2B supply chain sourcing platform with LinkedIn API integration, verified POCs (Points of Contact), and real-time RFQ (Request for Quote) management.

## 🎯 Key Features

- **LinkedIn Verified POCs**: Every point of contact is verified through LinkedIn OAuth 2.0
- **Real-time RFQ Management**: Create, manage, and respond to RFQs with live updates
- **AI-Powered Matching**: Smart supplier recommendations based on capabilities and history
- **Advanced Search**: Elasticsearch-powered search with faceted filtering
- **Real-time Messaging**: WebSocket-based communication between buyers and suppliers
- **Document Management**: Secure file uploads with AWS S3 integration
- **Analytics Dashboard**: Performance metrics and business intelligence
- **Mobile Responsive**: Full mobile and tablet support

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with Python 3.11+
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens + LinkedIn OAuth 2.0
- **Real-time**: WebSockets with Pusher
- **Search**: Elasticsearch
- **Cache**: Redis
- **File Storage**: AWS S3
- **Email**: SendGrid
- **Monitoring**: Sentry

### Frontend (Next.js)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: TailwindCSS with custom components
- **State Management**: Zustand + React Query
- **UI Components**: Headless UI + Heroicons
- **Forms**: React Hook Form
- **Real-time**: Pusher client

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Database**: PostgreSQL 15
- **Search**: Elasticsearch 8.x
- **Cache**: Redis 7
- **Monitoring**: Sentry + Custom metrics

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (for frontend development)
- **Python 3.11+** (for backend development)  
- **Docker & Docker Compose** (for containerized deployment)
- **PostgreSQL 15+** (for local database development)

### Option 1: Development Setup (Recommended for Development)

1. **Clone and setup**
```cmd
cd "c:\Users\cncha\OneDrive\Desktop\Sourcing Supply Chain Net"
setup-dev.bat
```

2. **Configure environment variables**
```cmd
REM Backend configuration
copy backend\.env.example backend\.env
REM Edit backend\.env with your LinkedIn API keys and database settings

REM Frontend configuration  
copy frontend\.env.local.example frontend\.env.local
REM Edit frontend\.env.local with your API URLs
```

3. **Start Backend (Terminal 1)**
```cmd
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8100
```

4. **Start Frontend (Terminal 2)**
```cmd
cd frontend
npm run dev
```

### Option 2: Docker Deployment

1. **Quick Docker setup**
```cmd
setup.bat
```

This will start all services with Docker Compose.

### Access Points
- **Frontend**: http://localhost:3100
- **Backend API**: http://localhost:8100  
- **API Documentation**: http://localhost:8100/docs

## 📋 API Documentation

### Authentication Endpoints
- `GET /api/auth/linkedin` - Initiate LinkedIn OAuth
- `POST /api/auth/linkedin/callback` - Handle LinkedIn callback
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### RFQ Management
- `POST /api/rfqs` - Create RFQ
- `GET /api/rfqs` - List RFQs with filtering
- `GET /api/rfqs/{id}` - Get RFQ details
- `PUT /api/rfqs/{id}` - Update RFQ
- `DELETE /api/rfqs/{id}` - Delete RFQ
- `POST /api/rfqs/{id}/responses` - Submit response
- `GET /api/rfqs/{id}/responses` - Get responses (owner only)

### Company Management
- `POST /api/companies` - Create company
- `GET /api/companies` - List companies
- `GET /api/companies/{id}` - Get company details
- `PUT /api/companies/{id}` - Update company
- `POST /api/companies/{id}/pocs` - Add POC
- `PUT /api/companies/{id}/pocs/{poc_id}` - Update POC

### Search & Discovery
- `GET /api/search/suppliers` - Search suppliers
- `GET /api/search/materials` - Search materials
- `GET /api/recommendations` - Get AI recommendations

## 🔧 Configuration

### Required Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/sscn_db

# LinkedIn API
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback

# JWT
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256

# Third-party Services
SENDGRID_API_KEY=your-sendgrid-api-key
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET_NAME=sscn-documents
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your-linkedin-client-id
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_CLUSTER=us2
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v --cov=app
```

### Frontend Tests
```bash
cd frontend
npm run test
npm run test:e2e
```

## 📈 LinkedIn API Integration

### OAuth 2.0 Flow
1. User clicks "Sign in with LinkedIn"
2. Redirect to LinkedIn authorization URL
3. User grants permissions
4. LinkedIn redirects back with authorization code
5. Exchange code for access token
6. Fetch user profile and company data
7. Verify employment and create/update user

### Required LinkedIn Scopes
- `r_liteprofile` - Basic profile information
- `r_emailaddress` - Email address
- `r_organization_social` - Company information

### Company Verification
- Match user's current employer with company domain
- Verify role and employment status
- Auto-create company profiles from LinkedIn data
- Establish POC relationships

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- LinkedIn OAuth 2.0 integration
- Role-based access control (RBAC)
- Rate limiting (60 requests/minute)
- CORS protection

### Data Protection
- Input validation and sanitization
- SQL injection prevention (SQLAlchemy ORM)
- XSS protection (CSP headers)
- Secure file uploads
- Password hashing (bcrypt)

### Compliance
- SOC 2 Type II ready
- GDPR compliance features
- Data retention policies
- Audit logging

## 📊 Third-Party Integrations

### LinkedIn API
- User authentication and verification
- Company data enrichment
- Professional profile validation

### SendGrid
- Transactional emails
- RFQ notifications
- Welcome emails
- Password reset

### AWS S3
- Document storage
- File uploads
- CDN integration

### Clearbit (Optional)
- Company data enrichment
- Logo fetching
- Industry classification

### Pusher
- Real-time notifications
- Live chat
- Status updates

## 🚀 Deployment

### Production Deployment
```bash
# Build and deploy with Docker
docker-compose -f docker-compose.prod.yml up -d

# Or deploy to cloud platforms
# AWS ECS, Google Cloud Run, Azure Container Instances
```

### Environment Configuration
- Use environment-specific Docker Compose files
- Configure SSL certificates for HTTPS
- Set up monitoring and logging
- Configure backup strategies

## 📋 TODO / Roadmap

### Phase 1 (MVP) ✅
- [x] LinkedIn OAuth integration
- [x] Basic RFQ management
- [x] Company profiles and POCs
- [x] Real-time notifications
- [x] Document uploads

### Phase 2 (Growth)
- [ ] Advanced search with Elasticsearch
- [ ] AI-powered supplier matching
- [ ] Mobile applications
- [ ] Analytics dashboard
- [ ] Bulk operations

### Phase 3 (Scale)
- [ ] Enterprise integrations (SAP, Oracle)
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] API marketplace
- [ ] White-label solutions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: [docs.sscn.com](https://docs.sscn.com)
- **Email**: support@sscn.com
- **Slack**: [Join our community](https://slack.sscn.com)

## 🏢 Business Model

### Revenue Streams
1. **Subscription Plans**: Tiered pricing for suppliers and buyers
2. **Transaction Fees**: Commission on successful deals
3. **Premium Features**: Advanced analytics, priority support
4. **Enterprise Licenses**: Custom deployments for large corporations

### Pricing Strategy
- **Freemium**: Basic features for small companies
- **Professional**: $99/month per company
- **Enterprise**: Custom pricing for large organizations

---

**Built with ❤️ for the global supply chain community**