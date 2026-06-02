# Production Deployment Guide - Landing Builder Platform

This guide outlines step-by-step instructions to deploy the stateless multi-container **Landing Builder Platform** on a production-ready Ubuntu VPS.

---

## 1. Prerequisites & VPS Initialization

Target OS: **Ubuntu 24.04 LTS** (Recommended VPS: 4 vCPU, 8GB RAM, 80GB SSD).

### A. Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
```

### B. Install Docker Engine & Compose Plugin
```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

# Install Docker:
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
```

---

## 2. Setting Up Project Directories

On your VPS, initialize the production directory structure under `/opt/landing-platform`:

```bash
sudo mkdir -p /opt/landing-platform
sudo mkdir -p /opt/landing-platform/backups/postgres
sudo mkdir -p /opt/landing-platform/backups/minio
sudo mkdir -p /opt/landing-platform/backups/scripts
sudo mkdir -p /opt/landing-platform/logs
sudo mkdir -p /opt/landing-platform/nginx

# Adjust folder ownership to current deploy administrator
sudo chown -R $USER:$USER /opt/landing-platform
```

Copy the codebase files (`backend/`, `frontend/`, `nginx/nginx.conf`, `docker-compose.prod.yml`) to the server target `/opt/landing-platform/`.

---

## 3. Environment Variables Configuration

Create a secure production environment configuration file `/opt/landing-platform/.env`:

```env
# ==============================================================================
# Database Configuration
# ==============================================================================
DB_PORT_HOST=5432
DB_NAME=landing_db_prod
DB_USER=landing_admin
DB_PASSWORD=SecurePostgresPasswd_Change_Me

# ==============================================================================
# Redis Cache Configuration
# ==============================================================================
REDIS_PORT_HOST=6379
REDIS_PASSWORD=SecureRedisPasswd_Change_Me

# ==============================================================================
# Object Storage Configuration (MinIO)
# ==============================================================================
MINIO_PORT_HOST=9000
MINIO_CONSOLE_PORT_HOST=9001
MINIO_ROOT_USER=minio_admin_user
MINIO_ROOT_PASSWORD=SecureMinioPasswd_Change_Me
MINIO_BUCKET_MEDIA=media
MINIO_BUCKET_UPLOADS=uploads
MINIO_BUCKET_EXPORTS=exports
MINIO_BUCKET_BACKUPS=backups

# ==============================================================================
# Application Security Keys
# ==============================================================================
JWT_SECRET=AtLeast32CharactersLongJWTSecretKeyHere_Change_Me
JWT_REFRESH_SECRET=AtLeast32CharactersLongJWTRefreshSecretKeyHere_Change_Me
JWT_EXPIRATION=3600s
JWT_REFRESH_EXPIRATION=604800s

# ==============================================================================
# Nginx Gateway Port
# ==============================================================================
NGINX_PORT_HOST=80
```

> [!WARNING]
> Always generate unique, high-entropy secrets for `DB_PASSWORD`, `REDIS_PASSWORD`, `MINIO_ROOT_PASSWORD`, and `JWT_SECRET` keys. Do not commit `.env` into version control.

---

## 4. Single-Command Deploy

Deploy the production stack:
```bash
cd /opt/landing-platform
docker compose -f docker-compose.prod.yml up -d --build
```

This single command will:
1. Trigger NextJS production build and server launch.
2. Trigger NestJS production compilation and dist launch.
3. Securely start Redis with auth passwords and data persistence.
4. Auto-initialize MinIO buckets (media, uploads, exports, backups) via dynamic MC tools.
5. Initialize Nginx proxy with active security headers and rate limits.

---

## 5. Let's Encrypt SSL Termination (Optional but Mandatory for Prod)

To secure dynamic referers and public page view trackers under SSL HTTPS:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d example.com -d www.example.com -d api.example.com
```
Let Certbot update your Nginx configuration files automatically and handle SSL auto-renew cronjobs behind the scenes.
