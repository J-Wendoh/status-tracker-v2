# 🚀 GitHub Packages Deployment Guide

## Overview

This project uses **GitHub Container Registry (ghcr.io)** for Docker image storage and automated deployments.

### How It Works:
1. Push code to `main` branch
2. GitHub Actions automatically builds Docker image
3. Image is pushed to GitHub Container Registry
4. Pull and deploy on your server with one command

---

## 🔧 One-Time Server Setup

### Step 1: Prepare Your Server

```bash
# SSH into your server
ssh your-user@your-server-ip

# Navigate to deployment directory
cd /opt
```

### Step 2: Clone Repository

```bash
git clone https://github.com/J-Wendoh/status-tracker-v2.git oag_tracker
cd oag_tracker
```

### Step 3: Create Environment File

```bash
nano .env
```

Paste this content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://nseovcbrrifjgyrugdwz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZW92Y2Jycmlmamd5cnVnZHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NjE0MDgsImV4cCI6MjA3MjUzNzQwOH0.KWkqabeCNmwapyLqM3aRS0QrWrwPHDQxPgOH3eTy6W4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZW92Y2Jycmlmamd5cnVnZHd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk2MTQwOCwiZXhwIjoyMDcyNTM3NDA4fQ.xnvPXkuFU8fVsqAy0VHdYnVQPZcMqCVo3KH9_5TKcxI
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
NODE_ENV=production
```

Save: `Ctrl+X`, `Y`, `Enter`

### Step 4: Login to GitHub Container Registry

```bash
# Use your GitHub username and the PAT token
docker login ghcr.io -u j-wendoh

# When prompted for password, paste your GitHub PAT:
# ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Save credentials for future logins:**
The credentials will be stored in `~/.docker/config.json`

---

## 🚀 Deploy Application (Two Methods)

### Method 1: Automated Script (Recommended)

```bash
./deploy-server.sh
```

This script will:
- ✅ Check Docker installation
- ✅ Login to GitHub Container Registry
- ✅ Pull latest image
- ✅ Stop old container
- ✅ Start new container
- ✅ Verify deployment

### Method 2: Manual Commands

```bash
# Pull latest image
docker pull ghcr.io/j-wendoh/status-tracker-v2:latest

# Stop existing container
docker-compose down

# Start new container
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f app
```

---

## 🔄 Updating Application

When you push new code to GitHub:

### On GitHub (Automatic):
1. Push code to `main` branch
2. GitHub Actions builds new image (takes ~5-10 minutes)
3. Image is automatically pushed to ghcr.io

### On Your Server:
```bash
cd /opt/oag_tracker

# Pull latest code (to update docker-compose.yml if needed)
git pull origin main

# Run deployment script
./deploy-server.sh

# OR manually:
docker pull ghcr.io/j-wendoh/status-tracker-v2:latest
docker-compose down
docker-compose up -d
```

---

## 📦 Available Image Tags

GitHub Actions creates multiple tags for each build:

- `latest` - Always points to the most recent main branch build
- `main` - Main branch builds
- `sha-<commit>` - Specific commit builds (e.g., `main-e7e1234`)
- `v1.0.0` - Version tags (if you create GitHub releases)

### Using Specific Tags

Edit `docker-compose.yml`:
```yaml
services:
  app:
    image: ghcr.io/j-wendoh/status-tracker-v2:main-e7e1234  # Use specific commit
```

---

## 🔍 Monitoring & Logs

```bash
# View real-time logs
docker-compose logs -f app

# Check container status
docker-compose ps

# Check health
curl http://localhost:3000/api/health

# View resource usage
docker stats oag_tracker_app
```

---

## 🛠️ Troubleshooting

### Image Pull Failed

```bash
# Re-login to GitHub Container Registry
docker login ghcr.io -u j-wendoh
# Use your PAT: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Try pulling again
docker pull ghcr.io/j-wendoh/status-tracker-v2:latest
```

### Check GitHub Actions Build Status

1. Go to: https://github.com/J-Wendoh/status-tracker-v2/actions
2. Check if latest workflow succeeded
3. Look for "Build and Push Docker Image" workflow

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Check environment variables
docker-compose config

# Verify .env file exists
cat .env
```

### Port Already in Use

```bash
# Find what's using port 3000
sudo netstat -tulpn | grep 3000

# Kill the process or change port in docker-compose.yml:
# ports:
#   - "8080:3000"  # Use port 8080 instead
```

---

## 🔐 Security Notes

### GitHub Container Registry Authentication

**Personal Access Token (PAT):**
- Token: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (use your actual token)
- Permissions: `write:packages`, `read:packages`, `repo`
- **Keep this secure!** Don't share publicly

**Token stored in:**
- Local: `~/.docker/config.json`
- Server: `~/.docker/config.json`

### Making Images Public (Optional)

To avoid login on server pulls:

1. Go to: https://github.com/users/J-Wendoh/packages/container/status-tracker-v2/settings
2. Scroll to "Danger Zone"
3. Click "Change visibility" → "Public"

Then you won't need `docker login` on the server!

---

## 📊 Deployment Workflow Diagram

```
Developer → Push to GitHub → GitHub Actions → Build Image
                                     ↓
                            GitHub Container Registry
                                     ↓
Server → Pull Image → Docker Compose → Running Container
```

---

## ⚡ Quick Commands Reference

```bash
# Deploy/Update
./deploy-server.sh

# View logs
docker-compose logs -f app

# Restart
docker-compose restart

# Stop
docker-compose down

# Check status
docker-compose ps
docker stats oag_tracker_app

# Pull specific version
docker pull ghcr.io/j-wendoh/status-tracker-v2:main-abc1234
```

---

## 🧪 Test Credentials

After deployment, test with:

- **AG:** `ag@ag.go.ke` / `ke.AG001.AG`
- **HOD:** `hod.test@ag.go.ke` / `ke.HOD001.AG`
- **Officer:** `officer.test@ag.go.ke` / `ke.OFF001.AG`

---

## 📞 Need Help?

Check these resources:
1. **GitHub Actions:** https://github.com/J-Wendoh/status-tracker-v2/actions
2. **Container Registry:** https://github.com/J-Wendoh?tab=packages
3. **Application Logs:** `docker-compose logs -f app`
4. **Documentation:** `DEPLOYMENT.md` and `SERVER-DEPLOY-STEPS.md`

---

## 🎯 Benefits of This Setup

✅ **Automated Builds** - Every push triggers a build
✅ **Version Control** - Track and rollback to any version
✅ **Fast Deployments** - Just pull and run
✅ **Consistent Environments** - Same image everywhere
✅ **No Build on Server** - Server doesn't need build tools
✅ **Cached Layers** - Faster builds with layer caching
