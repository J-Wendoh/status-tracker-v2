#!/bin/bash

# GitHub Container Registry Authentication Setup
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${BLUE}[AUTH] $1${NC}"; }
success() { echo -e "${GREEN}[✓] $1${NC}"; }
warning() { echo -e "${YELLOW}[⚠] $1${NC}"; }
error() { echo -e "${RED}[✗] $1${NC}"; }

echo "=============================================="
echo "🔑 GitHub Container Registry Authentication"
echo "=============================================="
echo ""

log "This script will help you authenticate with GitHub Container Registry"
echo ""

# Check if running as service user or root
if [ "$USER" = "root" ]; then
    warning "Running as root. Consider switching to service user:"
    echo "  su - oag-tracker"
    echo ""
fi

# Get GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
    log "Please enter your GitHub Personal Access Token:"
    warning "Make sure your token has 'packages:read' permission"
    echo -n "GitHub Token: "
    read -s GITHUB_TOKEN
    echo ""
else
    log "Using GITHUB_TOKEN from environment variable"
fi

# Validate token is not empty
if [ -z "$GITHUB_TOKEN" ]; then
    error "GitHub token cannot be empty"
    exit 1
fi

# Test Docker availability
log "Testing Docker access..."
if docker info > /dev/null 2>&1; then
    success "Docker is accessible"
else
    error "Cannot access Docker. Make sure:"
    echo "  - Docker is installed and running"
    echo "  - Your user is in the 'docker' group"
    echo "  - Try: sudo usermod -aG docker \$USER && newgrp docker"
    exit 1
fi

# Login to GitHub Container Registry
log "Logging into GitHub Container Registry..."
if echo "$GITHUB_TOKEN" | docker login ghcr.io -u J-Wendoh --password-stdin; then
    success "Successfully logged into GitHub Container Registry!"
else
    error "Failed to login to GitHub Container Registry"
    echo ""
    warning "Common issues:"
    echo "  - Token doesn't have 'packages:read' permission"
    echo "  - Token has expired"
    echo "  - Username is incorrect (should be 'J-Wendoh')"
    exit 1
fi

# Test pulling the image
log "Testing image pull access..."
if docker pull ghcr.io/j-wendoh/status-tracker-v2:latest > /dev/null 2>&1; then
    success "Successfully pulled application image!"

    # Show image info
    echo ""
    log "Image Information:"
    docker images ghcr.io/j-wendoh/status-tracker-v2:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
else
    error "Failed to pull application image"
    warning "This might be normal if the image hasn't been published yet"
    warning "Check GitHub Actions at: https://github.com/J-Wendoh/status-tracker-v2/actions"
fi

# Update environment file if it exists
if [ -f ".env.production" ]; then
    log "Updating .env.production with GitHub credentials..."

    # Create backup
    cp .env.production .env.production.backup

    # Update GITHUB_TOKEN in env file
    if grep -q "GITHUB_TOKEN=" .env.production; then
        sed -i "s/GITHUB_TOKEN=.*/GITHUB_TOKEN=${GITHUB_TOKEN}/" .env.production
    else
        echo "GITHUB_TOKEN=${GITHUB_TOKEN}" >> .env.production
    fi

    success "Environment file updated"
else
    warning ".env.production not found. Create it manually with:"
    echo "  cp .env.production.example .env.production"
    echo "  nano .env.production"
fi

echo ""
echo "=============================================="
success "GitHub authentication setup complete!"
echo "=============================================="
echo ""

log "Next steps:"
echo "  1. Deploy application: ./deploy.sh"
echo "  2. Check status: ./deploy.sh status"
echo "  3. View logs: ./deploy.sh logs"
echo ""

# Test if deploy script is available
if [ -f "./deploy.sh" ] && [ -x "./deploy.sh" ]; then
    log "Ready to deploy! Run:"
    echo "  ./deploy.sh"
else
    warning "Deploy script not found. Make sure you're in the application directory."
fi