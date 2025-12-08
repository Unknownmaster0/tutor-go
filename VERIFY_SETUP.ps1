# Verification script for API Gateway setup (Windows PowerShell)

Write-Host "🔍 Verifying API Gateway Setup..." -ForegroundColor Cyan
Write-Host ""

# Check 1: .env file exists
Write-Host "Check 1: Verify .env file..." -ForegroundColor Yellow
if (Test-Path "apps\backend\.env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
} else {
    Write-Host "✗ .env file NOT found" -ForegroundColor Red
    Write-Host "  Please create apps\backend\.env from .env.example"
}
Write-Host ""

# Check 2: express-http-proxy in package.json
Write-Host "Check 2: Verify express-http-proxy dependency..." -ForegroundColor Yellow
$packageJson = Get-Content "apps\backend\package.json" -Raw
if ($packageJson -match "express-http-proxy") {
    Write-Host "✓ express-http-proxy is listed in dependencies" -ForegroundColor Green
} else {
    Write-Host "⚠ express-http-proxy NOT in package.json" -ForegroundColor Yellow
    Write-Host "  Run: cd apps/backend && npm install express-http-proxy"
}
Write-Host ""

# Check 3: API Gateway file exists
Write-Host "Check 3: Verify API Gateway implementation..." -ForegroundColor Yellow
if (Test-Path "apps\backend\src\api-gateway\index.ts") {
    Write-Host "✓ API Gateway file found at src\api-gateway\index.ts" -ForegroundColor Green
} else {
    Write-Host "✗ API Gateway file NOT found" -ForegroundColor Red
    Write-Host "  This file should exist: apps\backend\src\api-gateway\index.ts"
}
Write-Host ""

# Check 4: Port configuration
Write-Host "Check 4: Verify port configuration in .env..." -ForegroundColor Yellow
$envContent = Get-Content "apps\backend\.env" -Raw

$gatewayPort = if ($envContent -match 'GATEWAY_PORT=(\d+)') { $matches[1] } else { "NOT SET" }
$authPort = if ($envContent -match 'AUTH_SERVICE_PORT=(\d+)') { $matches[1] } else { "NOT SET" }
$tutorPort = if ($envContent -match 'TUTOR_SERVICE_PORT=(\d+)') { $matches[1] } else { "NOT SET" }
$bookingPort = if ($envContent -match 'BOOKING_SERVICE_PORT=(\d+)') { $matches[1] } else { "NOT SET" }
$paymentPort = if ($envContent -match 'PAYMENT_SERVICE_PORT=(\d+)') { $matches[1] } else { "NOT SET" }

if ($gatewayPort -eq "3001") {
    Write-Host "✓ GATEWAY_PORT=3001 (correct)" -ForegroundColor Green
} else {
    Write-Host "✗ GATEWAY_PORT=$gatewayPort (should be 3001)" -ForegroundColor Red
}

if ($authPort -eq "3008") {
    Write-Host "✓ AUTH_SERVICE_PORT=3008 (correct)" -ForegroundColor Green
} else {
    Write-Host "⚠ AUTH_SERVICE_PORT=$authPort (should be 3008)" -ForegroundColor Yellow
}

if ($tutorPort -eq "3002") {
    Write-Host "✓ TUTOR_SERVICE_PORT=3002 (correct)" -ForegroundColor Green
} else {
    Write-Host "✗ TUTOR_SERVICE_PORT=$tutorPort (should be 3002)" -ForegroundColor Red
}

if ($bookingPort -eq "3003") {
    Write-Host "✓ BOOKING_SERVICE_PORT=3003 (correct)" -ForegroundColor Green
} else {
    Write-Host "✗ BOOKING_SERVICE_PORT=$bookingPort (should be 3003)" -ForegroundColor Red
}

if ($paymentPort -eq "3004") {
    Write-Host "✓ PAYMENT_SERVICE_PORT=3004 (correct)" -ForegroundColor Green
} else {
    Write-Host "✗ PAYMENT_SERVICE_PORT=$paymentPort (should be 3004)" -ForegroundColor Red
}

Write-Host ""

# Check 5: Service files updated
Write-Host "Check 5: Verify service port updates..." -ForegroundColor Yellow

$authService = Get-Content "apps\backend\src\auth-service\index.ts" -Raw
if ($authService -match "3008") {
    Write-Host "✓ Auth Service configured for port 3008" -ForegroundColor Green
} else {
    Write-Host "⚠ Auth Service may not be configured for port 3008" -ForegroundColor Yellow
}

$reviewService = Get-Content "apps\backend\src\review-service\index.ts" -Raw
if ($reviewService -match "3005") {
    Write-Host "✓ Review Service configured for port 3005" -ForegroundColor Green
} else {
    Write-Host "⚠ Review Service may not be configured for port 3005" -ForegroundColor Yellow
}

$adminService = Get-Content "apps\backend\src\admin-service\index.ts" -Raw
if ($adminService -match "3009") {
    Write-Host "✓ Admin Service configured for port 3009" -ForegroundColor Green
} else {
    Write-Host "⚠ Admin Service may not be configured for port 3009" -ForegroundColor Yellow
}

Write-Host ""

# Check 6: Dev script includes gateway
Write-Host "Check 6: Verify npm scripts..." -ForegroundColor Yellow
if ($packageJson -match "dev:gateway") {
    Write-Host "✓ dev:gateway script found in package.json" -ForegroundColor Green
} else {
    Write-Host "✗ dev:gateway script NOT in package.json" -ForegroundColor Red
}

if ($packageJson -match 'npm run dev:gateway') {
    Write-Host "✓ dev script starts gateway first" -ForegroundColor Green
} else {
    Write-Host "⚠ dev script may not include gateway" -ForegroundColor Yellow
}

Write-Host ""

# Check 7: Frontend API configuration
Write-Host "Check 7: Verify frontend API configuration..." -ForegroundColor Yellow
$apiClient = Get-Content "apps\frontend\src\lib\api-client.ts" -Raw
if ($apiClient -match "localhost:3001") {
    Write-Host "✓ Frontend configured to use http://localhost:3001" -ForegroundColor Green
} else {
    Write-Host "⚠ Frontend may need API URL update" -ForegroundColor Yellow
}

Write-Host ""

# Check 8: Documentation files
Write-Host "Check 8: Verify documentation..." -ForegroundColor Yellow

$docFiles = @(
    "API_GATEWAY_SETUP.md",
    "FIX_SUMMARY.md",
    "TROUBLESHOOTING.md",
    "ARCHITECTURE_DIAGRAM.md",
    "QUICK_START_API_GATEWAY.md"
)

foreach ($file in $docFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file found" -ForegroundColor Green
    } else {
        Write-Host "⚠ $file not found" -ForegroundColor Yellow
    }
}

Write-Host ""

# Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Verification Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. cd apps\backend"
Write-Host "2. npm install (if dependencies updated)"
Write-Host "3. npm run dev (starts all services including gateway)"
Write-Host "4. cd ..\frontend && npm run dev (in another terminal)"
Write-Host "5. Visit http://localhost:3000/dashboard"
Write-Host ""
Write-Host "For detailed info, see:" -ForegroundColor Yellow
Write-Host "  - FIX_SUMMARY.md (what changed)"
Write-Host "  - API_GATEWAY_SETUP.md (full documentation)"
Write-Host "  - TROUBLESHOOTING.md (if issues arise)"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
