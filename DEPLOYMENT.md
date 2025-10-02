# OAG Tracker - Production Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Prerequisites on Server
- Docker installed
- Docker Compose installed
- Git installed
- Port 3000 available (or configure different port)

### 2. Initial Server Setup

```bash
# Install Docker (if not already installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose (if not already installed)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### 3. Clone Repository on Server

```bash
# Navigate to your deployment directory
cd /opt  # or your preferred directory

# Clone the repository
git clone <YOUR_GITHUB_REPO_URL> oag_tracker
cd oag_tracker
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
nano .env
```

Add the following content (replace with your actual values):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://nseovcbrrifjgyrugdwz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZW92Y2Jycmlmamd5cnVnZHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NjE0MDgsImV4cCI6MjA3MjUzNzQwOH0.KWkqabeCNmwapyLqM3aRS0QrWrwPHDQxPgOH3eTy6W4
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SERVICE_ROLE_KEY>
SUPABASE_JWT_SECRET=<YOUR_JWT_SECRET>

# Node Environment
NODE_ENV=production
```

**⚠️ IMPORTANT:** Replace `<YOUR_SERVICE_ROLE_KEY>` and `<YOUR_JWT_SECRET>` with actual values from your Supabase project settings.

### 5. Build and Run with Docker Compose

```bash
# Build the Docker image
docker-compose build

# Start the application
docker-compose up -d

# Check if container is running
docker-compose ps

# View logs
docker-compose logs -f app
```

### 6. Access the Application

The application will be available at:
- **Local:** `http://localhost:3000`
- **Server IP:** `http://<SERVER_IP>:3000`

### 7. Production Considerations

#### A. Setup Nginx Reverse Proxy (Recommended)

Install Nginx:
```bash
sudo apt update
sudo apt install nginx
```

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/oag-tracker
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/oag-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### B. Setup SSL with Let's Encrypt (Recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 8. Updating the Application

When you push changes to GitHub:

```bash
# On the server
cd /opt/oag_tracker

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs -f app
```

### 9. Useful Docker Commands

```bash
# Stop the application
docker-compose down

# View logs
docker-compose logs -f app

# Restart the application
docker-compose restart

# View running containers
docker ps

# Remove all stopped containers and images
docker system prune -a

# Execute commands in running container
docker-compose exec app sh
```

### 10. Monitoring

```bash
# Check container health
docker-compose ps

# Monitor resource usage
docker stats oag_tracker_app

# View recent logs
docker-compose logs --tail=100 app
```

### 11. Troubleshooting

#### Container won't start:
```bash
# Check logs
docker-compose logs app

# Check if port is already in use
sudo netstat -tulpn | grep 3000

# Check environment variables
docker-compose config
```

#### Application errors:
```bash
# View real-time logs
docker-compose logs -f app

# Restart container
docker-compose restart app
```

#### Database connection issues:
- Verify Supabase URL and keys in `.env` file
- Check network connectivity to Supabase
- Verify Supabase project is active

## 🔐 Security Checklist

- [ ] Change default passwords in Supabase
- [ ] Keep `.env` file secure (never commit to git)
- [ ] Setup firewall rules (allow only necessary ports)
- [ ] Enable SSL/HTTPS
- [ ] Setup automatic backups for Supabase data
- [ ] Monitor application logs regularly
- [ ] Keep Docker and system packages updated

## 📱 Test Accounts

After deployment, test with these credentials:

- **Attorney General:** `ag@ag.go.ke` / `ke.AG001.AG`
- **HOD:** `hod.test@ag.go.ke` / `ke.HOD001.AG`
- **Officer:** `officer.test@ag.go.ke` / `ke.OFF001.AG`

## 🆘 Support

For issues, check:
1. Application logs: `docker-compose logs -f app`
2. Container status: `docker-compose ps`
3. Environment configuration: `docker-compose config`
4. Supabase dashboard for database issues

## 📝 Notes

- The application uses Supabase for authentication and data storage
- All environment variables must be set correctly for the app to work
- First-time users will be forced to change their password
- The application automatically reloads after password changes
