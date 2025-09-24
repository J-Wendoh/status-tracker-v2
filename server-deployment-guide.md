# 🚀 Server Deployment Guide - OAG Tracker

This guide will help you deploy the OAG Tracker application to your server using the GitHub Packages.

## 📋 Prerequisites

### Server Requirements
- Ubuntu 20.04+ or CentOS 8+ (or any Docker-compatible OS)
- Docker and Docker Compose installed
- Git installed
- At least 2GB RAM, 20GB storage
- Network access to GitHub Container Registry

### GitHub Setup
- Personal Access Token with `packages:read` permission
- Access to the repository: `https://github.com/J-Wendoh/status-tracker-v2`

## 🛠️ Step 1: Server Setup

### Install Docker (if not installed)
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add your user to docker group
sudo usermod -aG docker $USER

# Restart session or run:
newgrp docker

# Verify installation
docker --version
docker-compose --version
```

## 🔑 Step 2: GitHub Authentication

### Create Personal Access Token
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select these permissions:
   - ✅ `packages:read` (to pull Docker images)
   - ✅ `repo` (if repository is private)
4. Copy the generated token

### Login to GitHub Container Registry
```bash
# Login to GitHub Container Registry
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u J-Wendoh --password-stdin
```

## 📦 Step 3: Deploy Application

### Clone Deployment Files
```bash
# Create deployment directory
mkdir -p /opt/oag-tracker
cd /opt/oag-tracker

# Clone repository (deployment files only)
git clone https://github.com/J-Wendoh/status-tracker-v2.git .

# Make deployment script executable
chmod +x deploy.sh
```

### Configure Environment
```bash
# Copy environment template
cp .env.production.example .env.production

# Edit environment variables
nano .env.production
```

**Required Environment Variables:**
```env
# Supabase Configuration (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://nseovcbrrifjgyrugdwz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZW92Y2Jycmlmamd5cnVnZHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NjE0MDgsImV4cCI6MjA3MjUzNzQwOH0.KWkqabeCNmwapyLqM3aRS0QrWrwPHDQxPgOH3eTy6W4

# GitHub Container Registry
GITHUB_USERNAME=J-Wendoh
GITHUB_TOKEN=your_github_personal_access_token_here

# Application Configuration
NODE_ENV=production
```

### Deploy the Application
```bash
# Run deployment
./deploy.sh
```

## 🔍 Step 4: Verify Deployment

### Check Application Status
```bash
# Check if containers are running
./deploy.sh status

# View application logs
./deploy.sh logs

# Test application accessibility
curl http://localhost:3000
```

### Access Application
- **Local Access**: `http://localhost:3000`
- **External Access**: `http://YOUR_SERVER_IP:3000`

## 🛡️ Step 5: Security Setup (Recommended)

### Firewall Configuration
```bash
# Allow SSH (if not already configured)
sudo ufw allow 22

# Allow HTTP traffic
sudo ufw allow 3000

# Enable firewall
sudo ufw enable
```

### SSL Certificate (Optional - for production)
```bash
# Install Certbot
sudo apt install certbot

# Get SSL certificate (requires domain)
sudo certbot certonly --standalone -d yourdomain.com

# Configure nginx reverse proxy (optional)
# This step requires additional nginx configuration
```

## 🔧 Management Commands

### Daily Operations
```bash
# View application status
./deploy.sh status

# View real-time logs
./deploy.sh logs

# Restart application
./deploy.sh restart

# Stop application
./deploy.sh stop

# Create backup
./deploy.sh backup
```

### Update Application
```bash
# Pull latest version and redeploy
./deploy.sh

# Or manually update
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoring

### Health Checks
The application includes built-in health monitoring:
- Health check endpoint: `http://localhost:3000/api/health`
- Automatic restart on failure
- Container status monitoring

### Log Management
```bash
# View specific service logs
docker-compose -f docker-compose.prod.yml logs oag-tracker

# Follow logs in real-time
docker-compose -f docker-compose.prod.yml logs -f

# View last N lines
docker-compose -f docker-compose.prod.yml logs --tail=100
```

## 🆘 Troubleshooting

### Common Issues

#### 1. Image Pull Fails
```bash
# Check GitHub authentication
docker login ghcr.io -u J-Wendoh

# Verify token permissions
echo $GITHUB_TOKEN | docker login ghcr.io -u J-Wendoh --password-stdin
```

#### 2. Container Won't Start
```bash
# Check logs for errors
./deploy.sh logs

# Verify environment variables
cat .env.production

# Check container status
docker ps -a
```

#### 3. Application Not Accessible
```bash
# Check if port is bound
netstat -tlnp | grep :3000

# Check firewall rules
sudo ufw status

# Verify container networking
docker network ls
docker network inspect oag-tracker_oag-network
```

#### 4. Database Connection Issues
```bash
# Verify Supabase URL and keys in .env.production
# Check Supabase project status in dashboard
# Test connection from container:
docker exec -it oag-tracker-app curl -I https://nseovcbrrifjgyrugdwz.supabase.co
```

### Recovery Procedures

#### Emergency Stop
```bash
./deploy.sh stop
```

#### Rollback to Previous Version
```bash
# Stop current version
./deploy.sh stop

# Pull specific version (replace with desired version)
docker pull ghcr.io/j-wendoh/status-tracker-v2:v1.0.0

# Update docker-compose.prod.yml to use specific version
# Then restart
./deploy.sh
```

#### Complete Reset
```bash
# Stop and remove all containers
docker-compose -f docker-compose.prod.yml down -v

# Remove all images
docker system prune -a

# Redeploy
./deploy.sh
```

## 📈 Performance Optimization

### Resource Monitoring
```bash
# Monitor resource usage
docker stats

# Check disk usage
df -h
du -sh /var/lib/docker/
```

### Optimization Tips
1. **Memory**: Ensure at least 2GB RAM available
2. **Storage**: Monitor Docker volumes and clean up regularly
3. **Network**: Use CDN for static assets in production
4. **Database**: Monitor Supabase metrics in dashboard

## 🔄 Backup Strategy

### Automated Backups
The deployment script creates backups automatically:
- Location: `/opt/backups/oag-tracker/`
- Frequency: Before each deployment
- Retention: Manual cleanup required

### Manual Backup
```bash
# Create immediate backup
./deploy.sh backup

# List available backups
ls -la /opt/backups/oag-tracker/
```

## 📞 Support

### Getting Help
1. **Application Logs**: `./deploy.sh logs`
2. **GitHub Issues**: https://github.com/J-Wendoh/status-tracker-v2/issues
3. **Supabase Dashboard**: Check project health at supabase.com
4. **Container Status**: `./deploy.sh status`

### Useful Commands Summary
```bash
# Quick deployment
./deploy.sh

# Check status
./deploy.sh status

# View logs
./deploy.sh logs

# Restart app
./deploy.sh restart

# Emergency stop
./deploy.sh stop

# Create backup
./deploy.sh backup
```

---

## 🎉 Deployment Complete!

Your OAG Tracker application should now be running at:
- **Local**: http://localhost:3000
- **External**: http://YOUR_SERVER_IP:3000

The application is connected to your Supabase project and ready for production use!