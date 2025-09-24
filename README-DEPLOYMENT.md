# OAG Tracker Deployment Guide

This guide explains how to package and deploy the OAG Tracker application using GitHub Packages and Docker containers.

## 🏗️ Architecture Overview

- **Frontend**: Next.js application with Supabase integration
- **Backend**: Supabase (Database, Authentication, API)
- **Packaging**: Docker containers published to GitHub Container Registry
- **Deployment**: Docker Compose for production deployment

## 📦 GitHub Package Setup

### 1. Repository Configuration

Update the repository URL in `package.json`:
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/oag_tracker_copy.git"
  }
}
```

### 2. GitHub Actions Setup

The workflow in `.github/workflows/build-and-publish.yml` automatically:
- Builds the Next.js application
- Creates a Docker image
- Pushes to GitHub Container Registry
- Publishes npm package (on version tags)

### 3. Required GitHub Secrets

No additional secrets needed - uses `GITHUB_TOKEN` automatically.

## 🚀 Deployment Process

### Prerequisites

1. **Server Requirements**:
   - Docker and Docker Compose installed
   - Git installed
   - Curl installed
   - Network access to GitHub Container Registry

2. **Environment Setup**:
   ```bash
   # Copy environment template
   cp .env.production.example .env.production

   # Edit with your Supabase credentials
   nano .env.production
   ```

3. **GitHub Container Registry Access**:
   ```bash
   # Create GitHub Personal Access Token with packages:read scope
   export GITHUB_TOKEN=your_github_token
   export GITHUB_USERNAME=your_github_username
   ```

### Deployment Steps

1. **Clone Repository** (on server):
   ```bash
   git clone https://github.com/YOUR_USERNAME/oag_tracker_copy.git
   cd oag_tracker_copy
   ```

2. **Configure Environment**:
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your values
   ```

3. **Run Deployment**:
   ```bash
   ./deploy.sh
   ```

### Deployment Script Commands

```bash
# Full deployment (default)
./deploy.sh deploy

# Check application status
./deploy.sh status

# View logs
./deploy.sh logs

# Stop application
./deploy.sh stop

# Restart application
./deploy.sh restart

# Create backup only
./deploy.sh backup
```

## 🔧 Configuration Files

### Docker Configuration

- `Dockerfile`: Multi-stage build for optimized production image
- `docker-compose.prod.yml`: Production deployment configuration
- `.dockerignore`: Files excluded from Docker build context

### GitHub Actions

- `.github/workflows/build-and-publish.yml`: Automated build and publish workflow

## 📋 Environment Variables

### Required for Application

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Required for Deployment

```env
GITHUB_USERNAME=your-github-username
GITHUB_TOKEN=your-github-personal-access-token
```

## 🔄 Continuous Deployment

### Automatic Builds

The GitHub Actions workflow triggers on:
- Push to `main` or `develop` branches
- Pull requests to `main`
- Version tags (e.g., `v1.0.0`)

### Manual Deployment

1. **Push code changes** to trigger build
2. **On server**, run deployment:
   ```bash
   ./deploy.sh
   ```

## 🛡️ Security Considerations

1. **Environment Files**: Never commit `.env.production` to repository
2. **GitHub Token**: Use tokens with minimal required permissions
3. **Container Registry**: Images are private by default in GitHub Packages
4. **Health Checks**: Built-in health monitoring and restart policies

## 📊 Monitoring

### Application Health

The deployment includes:
- Health check endpoint monitoring
- Automatic container restart on failure
- Backup creation before deployments

### Logs Access

```bash
# View real-time logs
./deploy.sh logs

# View container status
./deploy.sh status
```

## 🔧 Troubleshooting

### Common Issues

1. **Image pull fails**:
   - Verify GitHub token permissions
   - Check repository visibility settings

2. **Container won't start**:
   - Check environment variables in `.env.production`
   - Verify Supabase configuration

3. **Health check fails**:
   - Check application logs: `./deploy.sh logs`
   - Verify network connectivity

### Emergency Procedures

```bash
# Quick restart
./deploy.sh restart

# Emergency stop
./deploy.sh stop

# Rollback to previous backup
# (Manual process - restore from backup directory)
```

## 📈 Scaling Considerations

For production scaling:

1. **Load Balancer**: Use nginx or cloud load balancer
2. **Multiple Instances**: Deploy across multiple servers
3. **Database**: Supabase handles scaling automatically
4. **Monitoring**: Add application performance monitoring

## 🔄 Update Process

1. **Development**: Make changes and commit
2. **CI/CD**: GitHub Actions builds and publishes
3. **Deployment**: Run `./deploy.sh` on server
4. **Verification**: Check status and logs

## 📞 Support

For issues:
1. Check application logs: `./deploy.sh logs`
2. Verify environment configuration
3. Check GitHub Actions build status
4. Review Supabase dashboard for backend issues