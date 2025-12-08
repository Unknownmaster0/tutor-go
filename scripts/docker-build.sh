#!/bin/bash

# TutorGo Docker Build Script
# Builds all production Docker images with optimization

set -e

echo "🚀 Building TutorGo Production Docker Images..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Build backend services
echo -e "${BLUE}Building backend services...${NC}"
docker build -t tutorgo/backend:latest \
  --build-arg NODE_ENV=production \
  -f apps/backend/Dockerfile \
  apps/backend

echo -e "${GREEN}✓ Backend image built${NC}"

# Build frontend
echo -e "${BLUE}Building frontend...${NC}"
docker build -t tutorgo/frontend:latest \
  --build-arg NODE_ENV=production \
  -f apps/frontend/Dockerfile \
  apps/frontend

echo -e "${GREEN}✓ Frontend image built${NC}"

# Display image sizes
echo -e "\n${BLUE}Image sizes:${NC}"
docker images | grep tutorgo

echo -e "\n${GREEN}✓ All images built successfully!${NC}"
echo -e "\nTo start services, run:"
echo -e "  docker-compose -f docker-compose.prod.yml up -d"
