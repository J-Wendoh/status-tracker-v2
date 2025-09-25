# 🚀 OAG Tracker - Server Deployment Commands

Copy and paste these commands on your server to deploy the OAG Tracker application.

## 📋 Prerequisites
- Ubuntu/Debian server with sudo access
- Internet connection

---

## 🔧 **STEP 1: Automated Server Setup**

```bash
# Download and run the server setup script
wget -O - https://raw.githubusercontent.com/J-Wendoh/status-tracker-v2/main/server-setup.sh | sudo bash
```

**OR manually:**

```bash
# Clone repository
sudo mkdir -p /opt/oag-tracker
cd /opt/oag-tracker
sudo git clone https://github.com/J-Wendoh/status-tracker-v2.git app
cd app

# Run setup script
sudo chmod +x server-setup.sh
sudo ./server-setup.sh
```

---

## 🔑 **STEP 2: GitHub Authentication**

```bash
# Switch to service user
sudo su - oag-tracker

# Navigate to app directory
cd /opt/oag-tracker/app

# Set up GitHub authentication with your token
export GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE"
./setup-github-auth.sh
```

**OR manual authentication:**

```bash
# Login to GitHub Container Registry
echo "YOUR_GITHUB_TOKEN_HERE" | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Update environment file
cp .env.production.example .env.production
nano .env.production  # Update GITHUB_TOKEN line
```

---

## 🚀 **STEP 3: Deploy Application**

```bash
# Still as oag-tracker user, deploy the application
./deploy.sh
```

---

## ✅ **STEP 4: Verify Deployment**

```bash
# Run verification tests
./verify-deployment.sh

# Check application status
oag-tracker status

# View logs
oag-tracker logs
```

---

## 🌐 **STEP 5: Access Application**

- **Direct Access**: `http://YOUR_SERVER_IP:3000`
- **With Nginx**: `http://YOUR_SERVER_IP` (if nginx was installed)

---

## 🛠️ **Management Commands**

```bash
# Start application
oag-tracker start

# Stop application
oag-tracker stop

# Restart application
oag-tracker restart

# Check status
oag-tracker status

# View logs
oag-tracker logs

# Update application
oag-tracker update

# Create backup
oag-tracker backup

# Verify deployment
oag-tracker verify
```

---

## 🔍 **Troubleshooting**

### If image pull fails:
```bash
# Wait for GitHub Actions to complete building the image
# Check: https://github.com/J-Wendoh/status-tracker-v2/actions

# Retry authentication
./setup-github-auth.sh

# Try pulling manually
docker pull ghcr.io/j-wendoh/status-tracker-v2:latest
```

### If application won't start:
```bash
# Check logs
oag-tracker logs

# Verify configuration
./verify-deployment.sh

# Check environment
cat .env.production
```

### Port issues:
```bash
# Check if port 3000 is in use
sudo netstat -tlnp | grep :3000

# Check firewall
sudo ufw status
```

---

## 📁 **Directory Structure After Setup**

```
/opt/oag-tracker/
├── app/                    # Application code
│   ├── deploy.sh          # Deployment script
│   ├── verify-deployment.sh
│   ├── .env.production    # Environment config
│   └── docker-compose.prod.yml
├── config/                # Configuration files
├── scripts/               # Management scripts
├── logs/                  # Application logs
└── /opt/backups/oag-tracker/  # Backups
```

---

## 🎉 **Quick Start Summary**

1. **Run setup**: `wget -O - https://raw.githubusercontent.com/J-Wendoh/status-tracker-v2/main/server-setup.sh | sudo bash`
2. **Switch user**: `sudo su - oag-tracker && cd /opt/oag-tracker/app`
3. **Authenticate**: `export GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE" && ./setup-github-auth.sh`
4. **Deploy**: `./deploy.sh`
5. **Access**: `http://YOUR_SERVER_IP:3000`

That's it! Your OAG Tracker will be running with Supabase integration.