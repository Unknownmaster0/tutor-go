# TutorGo Docker Build Script (PowerShell)
# Builds all production Docker images with optimization

$ErrorActionPreference = "Stop"

Write-Host "🚀 Building TutorGo Production Docker Images..." -ForegroundColor Cyan

# Build backend services
Write-Host "`nBuilding backend services..." -ForegroundColor Blue
docker build -t tutorgo/backend:latest `
  --build-arg NODE_ENV=production `
  -f apps/backend/Dockerfile `
  apps/backend

Write-Host "✓ Backend image built" -ForegroundColor Green

# Build frontend
Write-Host "`nBuilding frontend..." -ForegroundColor Blue
docker build -t tutorgo/frontend:latest `
  --build-arg NODE_ENV=production `
  -f apps/frontend/Dockerfile `
  apps/frontend

Write-Host "✓ Frontend image built" -ForegroundColor Green

# Display image sizes
Write-Host "`nImage sizes:" -ForegroundColor Blue
docker images | Select-String "tutorgo"

Write-Host "`n✓ All images built successfully!" -ForegroundColor Green
Write-Host "`nTo start services, run:"
Write-Host "  docker-compose -f docker-compose.prod.yml up -d"
