#!/bin/bash

echo "🚀 Setting up TutorGo Platform..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set up environment files
echo "⚙️  Setting up environment files..."
if [ ! -f apps/backend/.env ]; then
  cp apps/backend/.env.example apps/backend/.env
  echo "✅ Created apps/backend/.env"
fi

if [ ! -f apps/frontend/.env.local ]; then
  cp apps/frontend/.env.example apps/frontend/.env.local
  echo "✅ Created apps/frontend/.env.local"
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
docker-compose ps

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Edit apps/backend/.env with your configuration"
echo "  2. Edit apps/frontend/.env.local with your configuration"
echo "  3. Run 'npm run dev' to start the development servers"
echo ""
echo "🌐 Services will be available at:"
echo "  - Frontend: http://localhost:3000"
echo "  - Auth Service: http://localhost:3001"
echo "  - RabbitMQ Management: http://localhost:15672 (user: tutorgo, pass: password)"
