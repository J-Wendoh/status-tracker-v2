#!/bin/bash

# Script to build and run the Docker container

echo "🐳 Building Docker image for OAG Tracker..."

# Load environment variables if .env.local exists
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Build the Docker image
docker compose build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"

    echo "🚀 Starting container..."
    docker compose up -d

    # Wait for the container to be healthy
    echo "⏳ Waiting for application to be ready..."
    sleep 5

    # Check container status
    if docker compose ps | grep -q "healthy"; then
        echo "✅ Application is running at http://localhost:3000"
        echo ""
        echo "📊 Container status:"
        docker compose ps
        echo ""
        echo "📝 To view logs: docker compose logs -f"
        echo "🛑 To stop: docker compose down"
    else
        echo "⚠️  Container may not be healthy. Checking logs..."
        docker compose logs --tail=50
    fi
else
    echo "❌ Docker build failed. Please check the error messages above."
    exit 1
fi