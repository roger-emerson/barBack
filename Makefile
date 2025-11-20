.PHONY: help install build run stop clean test dev logs

IMAGE_NAME = barback-system
CONTAINER_NAME = barback-system
VERSION = 1.0.0

help:
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@echo '  install    Install dependencies'
	@echo '  build      Build Docker image'
	@echo '  run        Start the application'
	@echo '  stop       Stop the application'
	@echo '  restart    Restart the application'
	@echo '  logs       Show application logs'
	@echo '  dev        Run in development mode'
	@echo '  test       Run tests'
	@echo '  clean      Clean up containers and volumes'

install:
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

build:
	@echo "Building Docker image..."
	docker-compose build
	@echo "✓ Build complete"

run:
	@echo "Starting application..."
	docker-compose up -d
	@echo "✓ Application running at http://localhost:3000"

stop:
	@echo "Stopping application..."
	docker-compose down
	@echo "✓ Application stopped"

restart: stop run

logs:
	docker-compose logs -f

status:
	docker-compose ps

dev:
	@echo "Starting development environment..."
	@trap 'kill 0' EXIT; \
	cd backend && npm run dev & \
	cd frontend && npm run dev & \
	wait

clean:
	@echo "Cleaning up..."
	docker-compose down -v
	rm -rf backend/node_modules frontend/node_modules
	rm -rf frontend/dist
	@echo "✓ Cleanup complete"

export:
	@echo "Exporting Docker image..."
	docker save $(IMAGE_NAME):latest | gzip > $(IMAGE_NAME)-$(VERSION).tar.gz
	@echo "✓ Image exported"

shell:
	docker exec -it $(CONTAINER_NAME) /bin/sh
