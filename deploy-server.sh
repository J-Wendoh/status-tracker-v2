#!/bin/bash

# OAG Tracker - Server Deployment Script
# This script pulls the latest Docker image from GitHub Container Registry and deploys it

set -e

echo "🚀 OAG Tracker Deployment Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
GITHUB_USERNAME="j-wendoh"
IMAGE_NAME="status-tracker-v2"
CONTAINER_NAME="oag_tracker_app"

echo -e "${BLUE}Step 1: Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is installed${NC}"
echo ""

echo -e "${BLUE}Step 2: Checking Docker Compose installation...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose is installed${NC}"
echo ""

echo -e "${BLUE}Step 3: Logging in to GitHub Container Registry...${NC}"
echo "You will need a GitHub Personal Access Token (PAT) with read:packages permission"
echo ""
docker login ghcr.io -u $GITHUB_USERNAME
echo ""
echo -e "${GREEN}✓ Logged in to GitHub Container Registry${NC}"
echo ""

echo -e "${BLUE}Step 4: Stopping existing container (if running)...${NC}"
docker-compose down || true
echo -e "${GREEN}✓ Stopped existing container${NC}"
echo ""

echo -e "${BLUE}Step 5: Pulling latest image from GitHub Container Registry...${NC}"
docker pull ghcr.io/${GITHUB_USERNAME}/${IMAGE_NAME}:latest
echo -e "${GREEN}✓ Pulled latest image${NC}"
echo ""

echo -e "${BLUE}Step 6: Starting container with docker-compose...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Container started${NC}"
echo ""

echo -e "${BLUE}Step 7: Checking container status...${NC}"
docker-compose ps
echo ""

echo -e "${BLUE}Step 8: Waiting for application to start...${NC}"
sleep 5
echo ""

echo -e "${BLUE}Step 9: Testing health endpoint...${NC}"
if curl -f http://localhost:3000/api/health &> /dev/null; then
    echo -e "${GREEN}✓ Application is healthy!${NC}"
else
    echo -e "${YELLOW}⚠ Health check failed, but container is running. Check logs.${NC}"
fi
echo ""

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "Application is running at: ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "Useful commands:"
echo -e "  • View logs:      ${YELLOW}docker-compose logs -f app${NC}"
echo -e "  • Stop app:       ${YELLOW}docker-compose down${NC}"
echo -e "  • Restart app:    ${YELLOW}docker-compose restart${NC}"
echo -e "  • Check status:   ${YELLOW}docker-compose ps${NC}"
echo ""
echo -e "Test login credentials:"
echo -e "  • AG:      ${YELLOW}ag@ag.go.ke / ke.AG001.AG${NC}"
echo -e "  • HOD:     ${YELLOW}hod.test@ag.go.ke / ke.HOD001.AG${NC}"
echo -e "  • Officer: ${YELLOW}officer.test@ag.go.ke / ke.OFF001.AG${NC}"
echo ""
