# TutorGo Docker Commands (PowerShell)
# Windows-compatible alternative to Makefile

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "TutorGo Docker Commands" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Development:" -ForegroundColor Yellow
    Write-Host "  .\docker-commands.ps1 up              - Start development environment"
    Write-Host "  .\docker-commands.ps1 down            - Stop development environment"
    Write-Host "  .\docker-commands.ps1 logs            - View development logs"
    Write-Host "  .\docker-commands.ps1 restart         - Restart development services"
    Write-Host ""
    Write-Host "Production:" -ForegroundColor Yellow
    Write-Host "  .\docker-commands.ps1 build-prod     - Build production images"
    Write-Host "  .\docker-commands.ps1 up-prod        - Start production environment"
    Write-Host "  .\docker-commands.ps1 down-prod      - Stop production environment"
    Write-Host "  .\docker-commands.ps1 logs-prod      - View production logs"
    Write-Host ""
    Write-Host "Database:" -ForegroundColor Yellow
    Write-Host "  .\docker-commands.ps1 migrate        - Run database migrations"
    Write-Host "  .\docker-commands.ps1 seed           - Seed database with test data"
    Write-Host ""
    Write-Host "Maintenance:" -ForegroundColor Yellow
    Write-Host "  .\docker-commands.ps1 clean          - Remove unused Docker resources"
    Write-Host "  .\docker-commands.ps1 backup         - Backup production databases"
    Write-Host "  .\docker-commands.ps1 health         - Check service health"
}

function Start-Dev {
    docker-compose up -d
    Write-Host "✓ Development environment started" -ForegroundColor Green
    Write-Host "Frontend: http://localhost:3000"
    Write-Host "Auth API: http://localhost:3001"
}

function Stop-Dev {
    docker-compose down
    Write-Host "✓ Development environment stopped" -ForegroundColor Green
}

function Show-Logs {
    docker-compose logs -f
}

function Restart-Dev {
    docker-compose restart
    Write-Host "✓ Services restarted" -ForegroundColor Green
}

function Build-Prod {
    Write-Host "Building production images..." -ForegroundColor Blue
    docker build -t tutorgo/backend:latest -f apps/backend/Dockerfile apps/backend
    docker build -t tutorgo/frontend:latest -f apps/frontend/Dockerfile apps/frontend
    Write-Host "✓ Production images built" -ForegroundColor Green
}

function Start-Prod {
    docker-compose -f docker-compose.prod.yml up -d
    Write-Host "✓ Production environment started" -ForegroundColor Green
    Write-Host "Run '.\docker-commands.ps1 logs-prod' to view logs"
}

function Stop-Prod {
    docker-compose -f docker-compose.prod.yml down
    Write-Host "✓ Production environment stopped" -ForegroundColor Green
}

function Show-LogsProd {
    docker-compose -f docker-compose.prod.yml logs -f
}

function Run-Migrate {
    docker-compose exec backend npm run prisma:migrate
    Write-Host "✓ Migrations completed" -ForegroundColor Green
}

function Run-MigrateProd {
    docker-compose -f docker-compose.prod.yml exec auth-service npx prisma migrate deploy
    Write-Host "✓ Production migrations completed" -ForegroundColor Green
}

function Run-Seed {
    docker-compose exec backend npm run db:seed
    Write-Host "✓ Database seeded" -ForegroundColor Green
}

function Clean-Docker {
    Write-Host "Cleaning up Docker resources..." -ForegroundColor Blue
    docker system prune -f
    Write-Host "✓ Cleanup completed" -ForegroundColor Green
}

function Backup-Databases {
    Write-Host "Backing up databases..." -ForegroundColor Blue
    New-Item -ItemType Directory -Force -Path backups | Out-Null
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    
    docker-compose -f docker-compose.prod.yml exec -T postgres `
        pg_dump -U tutorgo tutorgo > "backups/postgres_$timestamp.sql"
    
    docker-compose -f docker-compose.prod.yml exec -T mongodb `
        mongodump --archive > "backups/mongodb_$timestamp.archive"
    
    Write-Host "✓ Backups created in .\backups\" -ForegroundColor Green
}

function Check-Health {
    Write-Host "Checking service health..." -ForegroundColor Blue
    
    $services = @(
        @{Name="Auth"; Port=3001},
        @{Name="Tutor"; Port=3002},
        @{Name="Booking"; Port=3003},
        @{Name="Payment"; Port=3004},
        @{Name="Chat"; Port=3005},
        @{Name="Notification"; Port=3006},
        @{Name="Review"; Port=3007}
    )
    
    foreach ($service in $services) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)/health" -TimeoutSec 2
            if ($response.StatusCode -eq 200) {
                Write-Host "✓ $($service.Name) service: UP" -ForegroundColor Green
            }
        } catch {
            Write-Host "✗ $($service.Name) service: DOWN" -ForegroundColor Red
        }
    }
}

function Show-Stats {
    docker stats
}

function Show-Ps {
    docker-compose ps
}

function Show-PsProd {
    docker-compose -f docker-compose.prod.yml ps
}

# Command router
switch ($Command.ToLower()) {
    "help" { Show-Help }
    "up" { Start-Dev }
    "down" { Stop-Dev }
    "logs" { Show-Logs }
    "restart" { Restart-Dev }
    "build-prod" { Build-Prod }
    "up-prod" { Start-Prod }
    "down-prod" { Stop-Prod }
    "logs-prod" { Show-LogsProd }
    "migrate" { Run-Migrate }
    "migrate-prod" { Run-MigrateProd }
    "seed" { Run-Seed }
    "clean" { Clean-Docker }
    "backup" { Backup-Databases }
    "health" { Check-Health }
    "stats" { Show-Stats }
    "ps" { Show-Ps }
    "ps-prod" { Show-PsProd }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
    }
}
