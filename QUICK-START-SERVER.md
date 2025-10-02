# ⚡ Quick Start - Deploy on Server

## Copy-Paste These Commands on Your Server:

### 1. Clone Repository
```bash
cd /opt
git clone https://github.com/J-Wendoh/status-tracker-v2.git oag_tracker
cd oag_tracker
```

### 2. Create .env File
```bash
cat > .env << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://nseovcbrrifjgyrugdwz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZW92Y2Jycmlmamd5cnVnZHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NjE0MDgsImV4cCI6MjA3MjUzNzQwOH0.KWkqabeCNmwapyLqM3aRS0QrWrwPHDQxPgOH3eTy6W4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZW92Y2Jycmlmamd5cnVnZHd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk2MTQwOCwiZXhwIjoyMDcyNTM3NDA4fQ.xnvPXkuFU8fVsqAy0VHdYnVQPZcMqCVo3KH9_5TKcxI
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
NODE_ENV=production
EOF
```

### 3. Login to GitHub Container Registry
```bash
docker login ghcr.io -u j-wendoh
```
**When prompted for password, use your GitHub Personal Access Token**

### 4. Deploy
```bash
./deploy-server.sh
```

---

## OR Manual Deployment:

```bash
# Pull image
docker pull ghcr.io/j-wendoh/status-tracker-v2:latest

# Start container
docker-compose up -d

# Check logs
docker-compose logs -f app
```

---

## Access Application:
- **URL:** `http://YOUR_SERVER_IP:3000`
- **Test Login:** `ag@ag.go.ke` / `ke.AG001.AG`

---

## Update Application Later:
```bash
cd /opt/oag_tracker
./deploy-server.sh
```

---

## Useful Commands:
```bash
# View logs
docker-compose logs -f app

# Restart
docker-compose restart

# Stop
docker-compose down

# Check status
docker-compose ps
```

---

## First-Time Build Status:
Check if GitHub Actions has finished building:
https://github.com/J-Wendoh/status-tracker-v2/actions

Wait ~5-10 minutes for the first build to complete before deploying.

---

## Need Help?
See full documentation:
- `GITHUB-PACKAGES-DEPLOY.md` - Complete guide
- `SERVER-DEPLOY-STEPS.md` - Step-by-step guide
- `DEPLOYMENT.md` - General deployment info
