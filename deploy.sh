#!/bin/bash

# OAG Tracker Deployment Script
set -e

# Configuration
REPO_URL="https://github.com/J-Wendoh/status-tracker-v2.git"
CONTAINER_REGISTRY="ghcr.io/j-wendoh/status-tracker-v2"
CONTAINER_NAME="oag-tracker-app"
BACKUP_DIR="/opt/backups/oag-tracker"
ENV_FILE=".env.production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Function to check if required commands exist
check_dependencies() {
    log "Checking dependencies..."

    for cmd in docker git curl; do
        if ! command -v $cmd &> /dev/null; then
            error "$cmd is not installed. Please install it first."
        fi
    done

    # Check Docker Compose
    if docker compose version &> /dev/null; then
        log "Using docker compose (plugin)"
        COMPOSE_CMD="docker compose"
    elif command -v docker-compose &> /dev/null; then
        log "Using docker-compose (standalone)"
        COMPOSE_CMD="docker-compose"
    else
        error "Docker Compose is not installed. Please install it first."
    fi

    success "All dependencies are available"
}

# Function to create backup
create_backup() {
    log "Creating backup..."

    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
    fi

    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/oag-tracker-backup-$TIMESTAMP.tar.gz"

    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        log "Creating application backup..."
        docker exec $CONTAINER_NAME tar czf - /app > "$BACKUP_FILE" 2>/dev/null || warning "Could not create app backup"
    fi

    success "Backup created at $BACKUP_FILE"
}

# Function to pull latest image
pull_latest_image() {
    log "Pulling latest image from registry..."

    # Login to GitHub Container Registry
    echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin || {
        warning "Could not login to GitHub Container Registry. Using cached image if available."
    }

    docker pull $CONTAINER_REGISTRY:latest || error "Failed to pull latest image"
    success "Latest image pulled successfully"
}

# Function to deploy application
deploy_application() {
    log "Deploying application..."

    # Check if .env file exists
    if [ ! -f "$ENV_FILE" ]; then
        error "Environment file $ENV_FILE not found. Please create it with required variables."
    fi

    # Stop existing containers
    log "Stopping existing containers..."
    $COMPOSE_CMD -f docker-compose.prod.yml down || true

    # Start new containers
    log "Starting new containers..."
    $COMPOSE_CMD -f docker-compose.prod.yml up -d

    # Wait for containers to be healthy
    log "Waiting for application to be ready..."
    sleep 10

    # Health check
    HEALTH_CHECK_URL="http://localhost:3000"
    MAX_RETRIES=30
    RETRY_COUNT=0

    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -f -s "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
            success "Application is healthy and running"
            break
        fi

        RETRY_COUNT=$((RETRY_COUNT + 1))
        log "Health check attempt $RETRY_COUNT/$MAX_RETRIES..."
        sleep 5
    done

    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        error "Application failed to start properly"
    fi
}

# Function to cleanup old images
cleanup_old_images() {
    log "Cleaning up old images..."

    # Remove dangling images
    docker image prune -f || true

    # Remove old versions of our image (keep last 3)
    docker images $CONTAINER_REGISTRY --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}" | \
    tail -n +2 | sort -k2 | head -n -3 | awk '{print $2}' | \
    xargs -r docker rmi || true

    success "Cleanup completed"
}

# Function to show status
show_status() {
    log "Application Status:"
    echo "==================="
    $COMPOSE_CMD -f docker-compose.prod.yml ps
    echo ""
    log "Application Logs (last 20 lines):"
    echo "=================================="
    $COMPOSE_CMD -f docker-compose.prod.yml logs --tail=20
}

# Main deployment process
main() {
    log "Starting OAG Tracker deployment..."

    # Check if running as root or with docker permissions
    if ! docker info > /dev/null 2>&1; then
        error "Cannot connect to Docker daemon. Make sure Docker is running and you have permissions."
    fi

    check_dependencies
    create_backup
    pull_latest_image
    deploy_application
    cleanup_old_images
    show_status

    success "Deployment completed successfully!"
    log "Application is available at: http://localhost:3000"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "status")
        show_status
        ;;
    "logs")
        $COMPOSE_CMD -f docker-compose.prod.yml logs -f
        ;;
    "stop")
        log "Stopping application..."
        $COMPOSE_CMD -f docker-compose.prod.yml down
        success "Application stopped"
        ;;
    "restart")
        log "Restarting application..."
        $COMPOSE_CMD -f docker-compose.prod.yml restart
        success "Application restarted"
        ;;
    "backup")
        create_backup
        ;;
    *)
        echo "Usage: $0 {deploy|status|logs|stop|restart|backup}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Deploy latest version (default)"
        echo "  status  - Show application status"
        echo "  logs    - Show application logs"
        echo "  stop    - Stop the application"
        echo "  restart - Restart the application"
        echo "  backup  - Create backup only"
        exit 1
        ;;
esac