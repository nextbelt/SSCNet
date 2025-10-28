#!/bin/bash

echo "🚀 Starting Sourcing Supply Chain Net setup..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker and try again."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Create environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend environment file..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your configuration before starting the services"
fi

if [ ! -f frontend/.env.local ]; then
    echo "📝 Creating frontend environment file..."
    cp frontend/.env.local.example frontend/.env.local
    echo "⚠️  Please edit frontend/.env.local with your configuration before starting the services"
fi

# Create necessary directories
mkdir -p nginx/ssl

echo "🐳 Starting Docker services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service health..."

# Check backend
if curl -f http://localhost:8000/health &> /dev/null; then
    echo "✅ Backend is running at http://localhost:8000"
else
    echo "❌ Backend health check failed"
fi

# Check frontend
if curl -f http://localhost:3000 &> /dev/null; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "❌ Frontend health check failed"
fi

# Check database
if docker-compose exec postgres pg_isready -U sscn_user &> /dev/null; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL is not ready"
fi

# Check Redis
if docker-compose exec redis redis-cli ping &> /dev/null; then
    echo "✅ Redis is running"
else
    echo "❌ Redis is not ready"
fi

# Check Elasticsearch
if curl -f http://localhost:9200/_cluster/health &> /dev/null; then
    echo "✅ Elasticsearch is running"
else
    echo "❌ Elasticsearch is not ready"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📱 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🔧 Development URLs:"
echo "   PostgreSQL: localhost:5432"
echo "   Redis: localhost:6379"
echo "   Elasticsearch: http://localhost:9200"
echo ""
echo "📚 Next steps:"
echo "1. Configure your environment variables in backend/.env and frontend/.env.local"
echo "2. Set up your LinkedIn OAuth application"
echo "3. Configure your third-party API keys (SendGrid, AWS, etc.)"
echo "4. Run database migrations: docker-compose exec backend alembic upgrade head"
echo "5. Visit http://localhost:3000 to start using the application"
echo ""
echo "📖 For more information, see README.md"