# 🚀 Quick Server Deployment Steps

## Step 1: SSH into Your Server

```bash
ssh your-user@your-server-ip
```

## Step 2: Navigate to Deployment Directory

```bash
cd /opt
# or wherever you want to deploy the app
```

## Step 3: Clone or Pull the Repository

### If first time (Clone):
```bash
git clone https://github.com/J-Wendoh/status-tracker-v2.git oag_tracker
cd oag_tracker
```

### If updating existing deployment (Pull):
```bash
cd oag_tracker
git pull origin main
```

## Step 4: Create Environment File

```bash
nano .env
```

Copy and paste this content (update the keys):

```env
NEXT_PUBLIC_SUPABASE_URL=https://nseovcbrrifjgyrugdwz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZW92Y2Jycmlmamd5cnVnZHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NjE0MDgsImV4cCI6MjA3MjUzNzQwOH0.KWkqabeCNmwapyLqM3aRS0QrWrwPHDQxPgOH3eTy6W4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZW92Y2Jycmlmamd5cnVnZHd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk2MTQwOCwiZXhwIjoyMDcyNTM3NDA4fQ.xnvPXkuFU8fVsqAy0VHdYnVQPZcMqCVo3KH9_5TKcxI
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase-settings
NODE_ENV=production
```

Save with `Ctrl+X`, then `Y`, then `Enter`

## Step 5: Build and Run with Docker

```bash
# Stop any existing containers
docker-compose down

# Build the image (this may take a few minutes)
docker-compose build --no-cache

# Start the container
docker-compose up -d

# Check if it's running
docker-compose ps

# View logs
docker-compose logs -f app
```

## Step 6: Verify Deployment

```bash
# Check container status
docker ps | grep oag_tracker

# Test the health endpoint
curl http://localhost:3000/api/health

# View logs
docker-compose logs --tail=50 app
```

## Step 7: Access the Application

- **From server:** `http://localhost:3000`
- **From browser:** `http://YOUR_SERVER_IP:3000`

## Quick Commands Reference

```bash
# Stop application
docker-compose down

# Restart application
docker-compose restart

# View real-time logs
docker-compose logs -f app

# Rebuild after code changes
docker-compose down && docker-compose build --no-cache && docker-compose up -d

# Check container health
docker-compose ps
docker stats oag_tracker_app

# Remove everything and start fresh
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

## Troubleshooting

### Container won't start:
```bash
docker-compose logs app
```

### Port already in use:
```bash
sudo netstat -tulpn | grep 3000
# Kill the process using the port if needed
```

### Clear Docker cache:
```bash
docker system prune -a
docker-compose build --no-cache
```

## Test Login Credentials

Once deployed, test with:
- **AG:** `ag@ag.go.ke` / `ke.AG001.AG`
- **HOD:** `hod.test@ag.go.ke` / `ke.HOD001.AG`
- **Officer:** `officer.test@ag.go.ke` / `ke.OFF001.AG`

## Production Setup (Optional but Recommended)

### Setup Nginx Reverse Proxy:
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/oag-tracker
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/oag-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Setup SSL (Free with Let's Encrypt):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Need Help?

Check the full deployment guide: `DEPLOYMENT.md`
