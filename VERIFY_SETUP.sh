#!/bin/bash
# Verification script for API Gateway setup

echo "🔍 Verifying API Gateway Setup..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: .env file exists
echo "Check 1: Verify .env file..."
if [ -f "apps/backend/.env" ]; then
    echo -e "${GREEN}✓${NC} .env file found"
else
    echo -e "${RED}✗${NC} .env file NOT found"
    echo "  Please create apps/backend/.env from .env.example"
fi
echo ""

# Check 2: express-http-proxy in package.json
echo "Check 2: Verify express-http-proxy dependency..."
if grep -q "express-http-proxy" apps/backend/package.json; then
    echo -e "${GREEN}✓${NC} express-http-proxy is listed in dependencies"
else
    echo -e "${YELLOW}⚠${NC} express-http-proxy NOT in package.json"
    echo "  Run: cd apps/backend && npm install express-http-proxy"
fi
echo ""

# Check 3: API Gateway file exists
echo "Check 3: Verify API Gateway implementation..."
if [ -f "apps/backend/src/api-gateway/index.ts" ]; then
    echo -e "${GREEN}✓${NC} API Gateway file found at src/api-gateway/index.ts"
else
    echo -e "${RED}✗${NC} API Gateway file NOT found"
    echo "  This file should exist: apps/backend/src/api-gateway/index.ts"
fi
echo ""

# Check 4: Port configuration
echo "Check 4: Verify port configuration in .env..."
GATEWAY_PORT=$(grep "GATEWAY_PORT" apps/backend/.env | cut -d'=' -f2)
AUTH_PORT=$(grep "AUTH_SERVICE_PORT" apps/backend/.env | cut -d'=' -f2)
TUTOR_PORT=$(grep "TUTOR_SERVICE_PORT" apps/backend/.env | cut -d'=' -f2)

if [ "$GATEWAY_PORT" = "3001" ]; then
    echo -e "${GREEN}✓${NC} GATEWAY_PORT=3001 (correct)"
else
    echo -e "${RED}✗${NC} GATEWAY_PORT=$GATEWAY_PORT (should be 3001)"
fi

if [ "$AUTH_PORT" = "3008" ]; then
    echo -e "${GREEN}✓${NC} AUTH_SERVICE_PORT=3008 (correct)"
else
    echo -e "${YELLOW}⚠${NC} AUTH_SERVICE_PORT=$AUTH_PORT (should be 3008)"
fi

if [ "$TUTOR_PORT" = "3002" ]; then
    echo -e "${GREEN}✓${NC} TUTOR_SERVICE_PORT=3002 (correct)"
else
    echo -e "${RED}✗${NC} TUTOR_SERVICE_PORT=$TUTOR_PORT (should be 3002)"
fi
echo ""

# Check 5: Service files updated
echo "Check 5: Verify service port updates..."
if grep -q "3008" apps/backend/src/auth-service/index.ts; then
    echo -e "${GREEN}✓${NC} Auth Service configured for port 3008"
else
    echo -e "${YELLOW}⚠${NC} Auth Service may not be configured for port 3008"
fi

if grep -q "3005" apps/backend/src/review-service/index.ts; then
    echo -e "${GREEN}✓${NC} Review Service configured for port 3005"
else
    echo -e "${YELLOW}⚠${NC} Review Service may not be configured for port 3005"
fi

if grep -q "3009" apps/backend/src/admin-service/index.ts; then
    echo -e "${GREEN}✓${NC} Admin Service configured for port 3009"
else
    echo -e "${YELLOW}⚠${NC} Admin Service may not be configured for port 3009"
fi
echo ""

# Check 6: Dev script includes gateway
echo "Check 6: Verify npm scripts..."
if grep -q "dev:gateway" apps/backend/package.json; then
    echo -e "${GREEN}✓${NC} dev:gateway script found in package.json"
else
    echo -e "${RED}✗${NC} dev:gateway script NOT in package.json"
fi

if grep -q "npm run dev:gateway" apps/backend/package.json; then
    echo -e "${GREEN}✓${NC} dev script starts gateway first"
else
    echo -e "${YELLOW}⚠${NC} dev script may not include gateway"
fi
echo ""

# Check 7: Frontend API configuration
echo "Check 7: Verify frontend API configuration..."
if grep -q "localhost:3001" apps/frontend/src/lib/api-client.ts; then
    echo -e "${GREEN}✓${NC} Frontend configured to use http://localhost:3001"
else
    echo -e "${YELLOW}⚠${NC} Frontend may need API URL update"
fi
echo ""

# Check 8: Documentation files
echo "Check 8: Verify documentation..."
if [ -f "API_GATEWAY_SETUP.md" ]; then
    echo -e "${GREEN}✓${NC} API_GATEWAY_SETUP.md found"
else
    echo -e "${YELLOW}⚠${NC} API_GATEWAY_SETUP.md not found"
fi

if [ -f "FIX_SUMMARY.md" ]; then
    echo -e "${GREEN}✓${NC} FIX_SUMMARY.md found"
else
    echo -e "${YELLOW}⚠${NC} FIX_SUMMARY.md not found"
fi

if [ -f "TROUBLESHOOTING.md" ]; then
    echo -e "${GREEN}✓${NC} TROUBLESHOOTING.md found"
else
    echo -e "${YELLOW}⚠${NC} TROUBLESHOOTING.md not found"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Verification Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. cd apps/backend"
echo "2. npm install (if dependencies updated)"
echo "3. npm run dev (starts all services including gateway)"
echo "4. cd ../frontend && npm run dev (in another terminal)"
echo "5. Visit http://localhost:3000/dashboard"
echo ""
echo "For detailed info, see:"
echo "  - FIX_SUMMARY.md (what changed)"
echo "  - API_GATEWAY_SETUP.md (full documentation)"
echo "  - TROUBLESHOOTING.md (if issues arise)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
