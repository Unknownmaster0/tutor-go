# PowerShell setup script for Windows

Write-Host "🚀 Setting up TutorGo Platform..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Set up environment files
Write-Host "⚙️  Setting up environment files..." -ForegroundColor Yellow
if (-not (Test-Path "apps/backend/.env")) {
    Copy-Item "apps/backend/.env.example" "apps/backend/.env"
    Write-Host "✅ Created apps/backend/.env" -ForegroundColor Green
}

if (-not (Test-Path "apps/frontend/.env.local")) {
    Copy-Item "apps/frontend/.env.example" "apps/frontend/.env.local"
    Write-Host "✅ Created apps/frontend/.env.local" -ForegroundColor Green
}

# Start Docker services
Write-Host "🐳 Starting Docker services..." -ForegroundColor Yellow
docker-compose up -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service health
Write-Host "🏥 Checking service health..." -ForegroundColor Yellow
docker-compose ps

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Edit apps/backend/.env with your configuration"
Write-Host "  2. Edit apps/frontend/.env.local with your configuration"
Write-Host "  3. Run 'npm run dev' to start the development servers"
Write-Host ""
Write-Host "🌐 Services will be available at:" -ForegroundColor Cyan
Write-Host "  - Frontend: http://localhost:3000"
Write-Host "  - Auth Service: http://localhost:3001"
Write-Host "  - RabbitMQ Management: http://localhost:15672 (user: tutorgo, pass: password)"
