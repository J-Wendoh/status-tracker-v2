#!/bin/bash

# OAG Tracker Deployment Verification Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[VERIFY] $1${NC}"
}

success() {
    echo -e "${GREEN}[✓] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[⚠] $1${NC}"
}

error() {
    echo -e "${RED}[✗] $1${NC}"
}

# Test functions
test_docker() {
    log "Testing Docker installation..."
    if command -v docker &> /dev/null; then
        success "Docker is installed: $(docker --version)"
    else
        error "Docker is not installed"
        return 1
    fi

    if docker compose version &> /dev/null; then
        success "Docker Compose is installed: $(docker compose version)"
    elif command -v docker-compose &> /dev/null; then
        success "Docker Compose is installed: $(docker-compose --version)"
    else
        error "Docker Compose is not installed"
        return 1
    fi
}

test_github_access() {
    log "Testing GitHub Container Registry access..."

    if docker pull ghcr.io/j-wendoh/status-tracker-v2:latest &> /dev/null; then
        success "Successfully pulled image from GitHub Container Registry"
        return 0
    else
        error "Failed to pull image from GitHub Container Registry"
        warning "Please ensure you're logged in: echo \$GITHUB_TOKEN | docker login ghcr.io -u J-Wendoh --password-stdin"
        return 1
    fi
}

test_environment() {
    log "Testing environment configuration..."

    if [ -f ".env.production" ]; then
        success "Environment file .env.production exists"

        # Check required variables
        source .env.production

        if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
            success "Supabase URL is configured"
        else
            error "NEXT_PUBLIC_SUPABASE_URL is not set"
        fi

        if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
            success "Supabase anonymous key is configured"
        else
            error "NEXT_PUBLIC_SUPABASE_ANON_KEY is not set"
        fi

        if [ -n "$GITHUB_USERNAME" ]; then
            success "GitHub username is configured"
        else
            warning "GITHUB_USERNAME is not set (needed for deployment script)"
        fi

    else
        error "Environment file .env.production not found"
        warning "Copy .env.production.example to .env.production and configure it"
        return 1
    fi
}

test_supabase_connection() {
    log "Testing Supabase connection..."

    if [ -f ".env.production" ]; then
        source .env.production

        if curl -f -s "$NEXT_PUBLIC_SUPABASE_URL" > /dev/null; then
            success "Supabase URL is accessible"
        else
            error "Cannot connect to Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
            return 1
        fi
    else
        warning "Cannot test Supabase connection - no environment file"
        return 1
    fi
}

test_deployment() {
    log "Testing deployment configuration..."

    if [ -f "docker-compose.prod.yml" ]; then
        success "Docker Compose production file exists"
    else
        error "docker-compose.prod.yml not found"
        return 1
    fi

    if [ -x "deploy.sh" ]; then
        success "Deployment script is executable"
    else
        error "deploy.sh is not executable or not found"
        return 1
    fi

    # Test docker-compose syntax
    if docker compose -f docker-compose.prod.yml config > /dev/null; then
        success "Docker Compose configuration is valid"
    elif docker-compose -f docker-compose.prod.yml config > /dev/null; then
        success "Docker Compose configuration is valid"
    else
        error "Docker Compose configuration has errors"
        return 1
    fi
}

test_application() {
    log "Testing application deployment..."

    # Check if application is running
    if docker ps | grep -q "oag-tracker-app"; then
        success "Application container is running"

        # Test application response
        log "Testing application response..."
        sleep 5  # Wait for app to fully start

        if curl -f -s "http://localhost:3000" > /dev/null; then
            success "Application is responding on port 3000"
            return 0
        else
            warning "Application container is running but not responding on port 3000"
            warning "Check logs with: ./deploy.sh logs"
            return 1
        fi
    else
        warning "Application container is not running"
        warning "Deploy the application with: ./deploy.sh"
        return 1
    fi
}

# Main verification process
main() {
    log "Starting OAG Tracker deployment verification..."
    echo "=============================================="

    # Track test results
    failed_tests=0
    total_tests=0

    # Run tests
    tests=(
        "test_docker"
        "test_environment"
        "test_supabase_connection"
        "test_github_access"
        "test_deployment"
        "test_application"
    )

    for test_name in "${tests[@]}"; do
        total_tests=$((total_tests + 1))
        echo ""
        if ! $test_name; then
            failed_tests=$((failed_tests + 1))
        fi
    done

    echo ""
    echo "=============================================="

    if [ $failed_tests -eq 0 ]; then
        success "All verification tests passed! ($total_tests/$total_tests)"
        success "Your OAG Tracker deployment is ready!"
        echo ""
        log "Application URL: http://localhost:3000"
        log "Management commands:"
        log "  ./deploy.sh status  - Check application status"
        log "  ./deploy.sh logs    - View application logs"
        log "  ./deploy.sh restart - Restart application"
    else
        error "$failed_tests out of $total_tests tests failed"
        warning "Please resolve the issues above before proceeding"
        return 1
    fi
}

# Handle script arguments
case "${1:-verify}" in
    "verify")
        main
        ;;
    "quick")
        log "Running quick verification..."
        test_docker && test_environment && test_deployment
        ;;
    "app-only")
        log "Testing application only..."
        test_application
        ;;
    *)
        echo "Usage: $0 {verify|quick|app-only}"
        echo ""
        echo "Commands:"
        echo "  verify   - Run all verification tests (default)"
        echo "  quick    - Run basic configuration tests only"
        echo "  app-only - Test running application only"
        exit 1
        ;;
esac