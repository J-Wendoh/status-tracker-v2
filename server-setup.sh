#!/bin/bash

# OAG Tracker Server Setup Script
# This script sets up a clean, organized deployment structure on your server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[SETUP] $1${NC}"
}

success() {
    echo -e "${GREEN}[✓] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[⚠] $1${NC}"
}

error() {
    echo -e "${RED}[✗] $1${NC}"
    exit 1
}

# Configuration
APP_NAME="oag-tracker"
BASE_DIR="/opt/${APP_NAME}"
REPO_URL="https://github.com/J-Wendoh/status-tracker-v2.git"
BACKUP_DIR="/opt/backups/${APP_NAME}"
LOG_DIR="/var/log/${APP_NAME}"
SERVICE_USER="${APP_NAME}"

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        error "This script must be run as root (use sudo)"
    fi
}

# Function to install Docker and Docker Compose
install_docker() {
    log "Installing Docker and Docker Compose..."

    # Check if Docker is already installed
    if command -v docker &> /dev/null; then
        success "Docker is already installed: $(docker --version)"
    else
        log "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
        success "Docker installed successfully"
    fi

    # Check Docker Compose
    if docker compose version &> /dev/null; then
        success "Docker Compose is available: $(docker compose version)"
    else
        warning "Docker Compose plugin not found, but Docker includes it by default in newer versions"
    fi

    # Add service user to docker group
    if id "$SERVICE_USER" &>/dev/null; then
        usermod -aG docker $SERVICE_USER
        success "Added $SERVICE_USER to docker group"
    fi
}

# Function to create system user
create_service_user() {
    log "Creating service user..."

    if id "$SERVICE_USER" &>/dev/null; then
        success "User $SERVICE_USER already exists"
    else
        useradd -r -s /bin/bash -d $BASE_DIR -m $SERVICE_USER
        success "Created user: $SERVICE_USER"
    fi
}

# Function to create directory structure
create_directories() {
    log "Creating directory structure..."

    # Create base directories
    directories=(
        "$BASE_DIR"
        "$BASE_DIR/app"
        "$BASE_DIR/config"
        "$BASE_DIR/scripts"
        "$BASE_DIR/logs"
        "$BACKUP_DIR"
        "$LOG_DIR"
    )

    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
        chown $SERVICE_USER:$SERVICE_USER "$dir"
        log "Created directory: $dir"
    done

    success "Directory structure created"
}

# Function to clone repository
clone_repository() {
    log "Cloning repository..."

    cd $BASE_DIR/app

    if [ -d ".git" ]; then
        log "Repository already exists, pulling latest changes..."
        sudo -u $SERVICE_USER git pull
    else
        log "Cloning fresh repository..."
        sudo -u $SERVICE_USER git clone $REPO_URL .
    fi

    # Make scripts executable
    chmod +x deploy.sh verify-deployment.sh
    chown $SERVICE_USER:$SERVICE_USER deploy.sh verify-deployment.sh

    success "Repository cloned and configured"
}

# Function to create systemd service
create_systemd_service() {
    log "Creating systemd service..."

    cat > /etc/systemd/system/${APP_NAME}.service << EOF
[Unit]
Description=OAG Tracker Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
User=${SERVICE_USER}
Group=${SERVICE_USER}
WorkingDirectory=${BASE_DIR}/app
ExecStart=/bin/bash ${BASE_DIR}/app/deploy.sh
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable ${APP_NAME}.service

    success "Systemd service created and enabled"
}

# Function to create nginx reverse proxy config (optional)
create_nginx_config() {
    log "Creating nginx configuration (if nginx is available)..."

    if command -v nginx &> /dev/null; then
        cat > /etc/nginx/sites-available/${APP_NAME} << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/api/health;
    }
}
EOF

        ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
        nginx -t && systemctl reload nginx
        success "Nginx reverse proxy configured"
    else
        warning "Nginx not installed, skipping reverse proxy setup"
    fi
}

# Function to setup firewall
setup_firewall() {
    log "Configuring firewall..."

    if command -v ufw &> /dev/null; then
        # Allow SSH (preserve existing connection)
        ufw allow ssh

        # Allow HTTP and HTTPS
        ufw allow 80
        ufw allow 443

        # Allow direct access to app (can remove this if using nginx)
        ufw allow 3000

        # Enable firewall if not already enabled
        ufw --force enable

        success "Firewall configured"
    else
        warning "UFW firewall not available, skipping firewall setup"
    fi
}

# Function to create helpful aliases and scripts
create_helper_scripts() {
    log "Creating helper scripts..."

    # Create management script
    cat > $BASE_DIR/scripts/manage.sh << 'EOF'
#!/bin/bash

# OAG Tracker Management Script
APP_DIR="/opt/oag-tracker/app"

case "${1:-help}" in
    "start")
        echo "Starting OAG Tracker..."
        systemctl start oag-tracker
        ;;
    "stop")
        echo "Stopping OAG Tracker..."
        systemctl stop oag-tracker
        ;;
    "restart")
        echo "Restarting OAG Tracker..."
        systemctl restart oag-tracker
        ;;
    "status")
        systemctl status oag-tracker
        echo ""
        cd $APP_DIR && ./deploy.sh status
        ;;
    "logs")
        cd $APP_DIR && ./deploy.sh logs
        ;;
    "update")
        echo "Updating OAG Tracker..."
        cd $APP_DIR && git pull && ./deploy.sh
        ;;
    "backup")
        cd $APP_DIR && ./deploy.sh backup
        ;;
    "verify")
        cd $APP_DIR && ./verify-deployment.sh
        ;;
    *)
        echo "OAG Tracker Management Commands:"
        echo "  start   - Start the application"
        echo "  stop    - Stop the application"
        echo "  restart - Restart the application"
        echo "  status  - Show application status"
        echo "  logs    - Show application logs"
        echo "  update  - Update and redeploy"
        echo "  backup  - Create backup"
        echo "  verify  - Verify deployment"
        ;;
esac
EOF

    chmod +x $BASE_DIR/scripts/manage.sh
    chown $SERVICE_USER:$SERVICE_USER $BASE_DIR/scripts/manage.sh

    # Create symlink in /usr/local/bin for global access
    ln -sf $BASE_DIR/scripts/manage.sh /usr/local/bin/oag-tracker

    success "Helper scripts created"
    log "You can now use 'oag-tracker status' from anywhere!"
}

# Function to display setup summary
display_summary() {
    echo ""
    echo "=============================================="
    success "OAG Tracker Server Setup Complete!"
    echo "=============================================="
    echo ""
    log "Directory Structure:"
    echo "  📁 Application: $BASE_DIR/app"
    echo "  📁 Config:      $BASE_DIR/config"
    echo "  📁 Scripts:     $BASE_DIR/scripts"
    echo "  📁 Logs:        $BASE_DIR/logs"
    echo "  📁 Backups:     $BACKUP_DIR"
    echo ""
    log "Next Steps:"
    echo "  1. Set up GitHub token authentication:"
    echo "     su - $SERVICE_USER"
    echo "     cd $BASE_DIR/app"
    echo "     echo 'YOUR_GITHUB_TOKEN' | docker login ghcr.io -u J-Wendoh --password-stdin"
    echo ""
    echo "  2. Configure environment:"
    echo "     nano $BASE_DIR/app/.env.production"
    echo ""
    echo "  3. Deploy application:"
    echo "     oag-tracker start"
    echo ""
    log "Management Commands:"
    echo "  oag-tracker status  - Check application status"
    echo "  oag-tracker logs    - View application logs"
    echo "  oag-tracker update  - Update application"
    echo "  oag-tracker verify  - Verify deployment"
    echo ""
    success "Setup completed successfully!"
}

# Main setup process
main() {
    log "Starting OAG Tracker server setup..."

    check_root
    create_service_user
    install_docker
    create_directories
    clone_repository
    create_systemd_service
    create_nginx_config
    setup_firewall
    create_helper_scripts
    display_summary
}

# Run main function
main