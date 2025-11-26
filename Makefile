.PHONY: help build build-prod up up-prod down down-prod logs logs-prod clean test migrate seed

# Default target
help:
	@echo "TutorGo Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make up              - Start development environment"
	@echo "  make down            - Stop development environment"
	@echo "  make logs            - View development logs"
	@echo "  make restart         - Restart development services"
	@echo ""
	@echo "Production:"
	@echo "  make build-prod      - Build production images"
	@echo "  make up-prod         - Start production environment"
	@echo "  make down-prod       - Stop production environment"
	@echo "  make logs-prod       - View production logs"
	@echo ""
	@echo "Database:"
	@echo "  make migrate         - Run database migrations"
	@echo "  make seed            - Seed database with test data"
	@echo "  make db-reset        - Reset database (CAUTION!)"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean           - Remove unused Docker resources"
	@echo "  make backup          - Backup production databases"
	@echo "  make test            - Run tests in containers"
	@echo "  make health          - Check service health"

# Development commands
up:
	docker-compose up -d
	@echo "✓ Development environment started"
	@echo "Frontend: http://localhost:3000"
	@echo "Auth API: http://localhost:3001"

down:
	docker-compose down
	@echo "✓ Development environment stopped"

logs:
	docker-compose logs -f

restart:
	docker-compose restart
	@echo "✓ Services restarted"

# Production commands
build-prod:
	@echo "Building production images..."
	docker build -t tutorgo/backend:latest -f apps/backend/Dockerfile apps/backend
	docker build -t tutorgo/frontend:latest -f apps/frontend/Dockerfile apps/frontend
	@echo "✓ Production images built"

up-prod:
	docker-compose -f docker-compose.prod.yml up -d
	@echo "✓ Production environment started"
	@echo "Run 'make logs-prod' to view logs"

down-prod:
	docker-compose -f docker-compose.prod.yml down
	@echo "✓ Production environment stopped"

logs-prod:
	docker-compose -f docker-compose.prod.yml logs -f

restart-prod:
	docker-compose -f docker-compose.prod.yml restart
	@echo "✓ Production services restarted"

# Database commands
migrate:
	docker-compose exec backend npm run prisma:migrate
	@echo "✓ Migrations completed"

migrate-prod:
	docker-compose -f docker-compose.prod.yml exec auth-service npx prisma migrate deploy
	@echo "✓ Production migrations completed"

seed:
	docker-compose exec backend npm run db:seed
	@echo "✓ Database seeded"

db-reset:
	@echo "WARNING: This will delete all data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose exec backend npm run db:reset; \
		echo "✓ Database reset"; \
	fi

# Maintenance commands
clean:
	@echo "Cleaning up Docker resources..."
	docker system prune -f
	@echo "✓ Cleanup completed"

clean-all:
	@echo "WARNING: This will remove all Docker resources including volumes!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		docker system prune -a -f --volumes; \
		echo "✓ Complete cleanup done"; \
	fi

backup:
	@echo "Backing up databases..."
	@mkdir -p backups
	docker-compose -f docker-compose.prod.yml exec -T postgres \
		pg_dump -U tutorgo tutorgo > backups/postgres_$$(date +%Y%m%d_%H%M%S).sql
	docker-compose -f docker-compose.prod.yml exec -T mongodb \
		mongodump --archive > backups/mongodb_$$(date +%Y%m%d_%H%M%S).archive
	@echo "✓ Backups created in ./backups/"

# Testing commands
test:
	docker-compose exec backend npm test
	@echo "✓ Backend tests completed"

test-frontend:
	docker-compose exec frontend npm test
	@echo "✓ Frontend tests completed"

# Health check commands
health:
	@echo "Checking service health..."
	@curl -s http://localhost:3001/health | jq . || echo "Auth service: DOWN"
	@curl -s http://localhost:3002/health | jq . || echo "Tutor service: DOWN"
	@curl -s http://localhost:3003/health | jq . || echo "Booking service: DOWN"
	@curl -s http://localhost:3004/health | jq . || echo "Payment service: DOWN"
	@curl -s http://localhost:3005/health | jq . || echo "Chat service: DOWN"
	@curl -s http://localhost:3006/health | jq . || echo "Notification service: DOWN"
	@curl -s http://localhost:3007/health | jq . || echo "Review service: DOWN"

health-prod:
	@echo "Checking production service health..."
	@docker-compose -f docker-compose.prod.yml ps

# Monitoring commands
stats:
	docker stats

ps:
	docker-compose ps

ps-prod:
	docker-compose -f docker-compose.prod.yml ps

# Shell access
shell-backend:
	docker-compose exec backend sh

shell-frontend:
	docker-compose exec frontend sh

shell-postgres:
	docker-compose exec postgres psql -U tutorgo -d tutorgo

shell-mongodb:
	docker-compose exec mongodb mongosh tutorgo

shell-redis:
	docker-compose exec redis redis-cli
