# DEPLOYMENT.md

# DEPLOYMENT SPECIFICATION

Project:
Landing Builder Platform

Version:
1.0

Target Environment:
Production VPS

OS:
Ubuntu 24.04 LTS

Deployment Type:
Docker Compose

---

# DEPLOYMENT GOALS

The system must be deployable using a single command.

Required:

```bash
docker compose up -d
```

The deployment must support:

* Production
* Staging
* Local Development

without major changes.

---

# VPS REQUIREMENTS

## Minimum

CPU

4 vCPU

RAM

8 GB

Storage

80 GB SSD

Network

1 Gbps

---

## Recommended

CPU

8 vCPU

RAM

16 GB

Storage

160 GB SSD

Network

1 Gbps

---

# REQUIRED SERVICES

The platform must run using Docker containers.

Services:

```text
frontend
backend
postgres
redis
minio
nginx
```

Optional:

```text
prometheus
grafana
loki
```

---

# DIRECTORY STRUCTURE

```text
/opt/landing-platform

├── docker-compose.yml

├── .env

├── frontend/

├── backend/

├── nginx/

├── backups/

├── logs/

├── storage/

├── postgres/

├── redis/

├── minio/

└── monitoring/
```

---

# DOCKER COMPOSE ARCHITECTURE

```text
Internet
    │
    ▼

Nginx

    │

 ┌──┴─────┐
 ▼        ▼

Frontend  Backend

            │

   ┌────────┼────────┐
   ▼        ▼        ▼

Postgres Redis MinIO
```

---

# FRONTEND CONTAINER

Technology:

NextJS

Port:

3000

Container Name:

landing-frontend

Requirements:

* Production Build
* Health Check
* Environment Variables

---

# BACKEND CONTAINER

Technology:

NestJS

Port:

4000

Container Name:

landing-backend

Requirements:

* Health Check
* Graceful Shutdown
* Logging

---

# POSTGRES CONTAINER

Version:

16+

Container Name:

landing-postgres

Persistent Volume:

Required

Path:

```text
/opt/landing-platform/postgres
```

---

# REDIS CONTAINER

Version:

7+

Container Name:

landing-redis

Usage:

Cache

Rate Limit

Session Storage

Queue

---

# MINIO CONTAINER

Container Name:

landing-minio

Purpose:

Media Storage

Buckets:

```text
media

uploads

exports

backups
```

Persistent Volume:

Required

---

# NGINX CONTAINER

Container Name:

landing-nginx

Responsibilities:

* Reverse Proxy
* SSL Termination
* Compression
* Static Cache
* Security Headers

---

# DOMAIN STRUCTURE

Production

```text
example.com
```

Frontend

```text
example.com
```

API

```text
api.example.com
```

Admin

```text
admin.example.com
```

MinIO

```text
storage.example.com
```

Optional

Monitoring

```text
monitor.example.com
```

---

# SSL

Required

Provider:

Let's Encrypt

Requirements:

* Auto Renewal
* HTTPS Redirect
* TLS 1.2+
* TLS 1.3

---

# ENVIRONMENT VARIABLES

Frontend

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_URL=
```

Backend

```env
NODE_ENV=

PORT=

JWT_SECRET=

JWT_REFRESH_SECRET=

DATABASE_URL=

REDIS_URL=

MINIO_ENDPOINT=

MINIO_ACCESS_KEY=

MINIO_SECRET_KEY=
```

Never hardcode secrets.

---

# DATABASE BACKUP

Automatic Backups Required.

Schedule:

Daily

Retention:

30 Days

Backup Location:

```text
/opt/landing-platform/backups/postgres
```

Backup Format:

```text
.sql.gz
```

---

# MEDIA BACKUP

MinIO Backup

Schedule:

Daily

Retention:

30 Days

Backup Location:

```text
/opt/landing-platform/backups/minio
```

---

# RESTORE PROCEDURE

Must support:

Database Restore

Media Restore

Full System Restore

Without code changes.

---

# LOGGING

Store Logs

Frontend

Backend

Nginx

Database

---

Directory

```text
/opt/landing-platform/logs
```

---

# HEALTH CHECKS

Frontend

```text
/health
```

Backend

```text
/api/v1/health
```

Docker Health Checks Required.

---

# MONITORING

Optional Phase

Prometheus

Grafana

Loki

---

Metrics

CPU

RAM

Disk

Network

Response Time

Error Rate

---

# SECURITY

Required

Firewall

Fail2Ban

Rate Limiting

Security Headers

IP Blocking

---

# NGINX SECURITY HEADERS

Required

```text
X-Frame-Options

X-Content-Type-Options

Referrer-Policy

Content-Security-Policy
```

---

# FILE STORAGE STRATEGY

Do not store uploaded files inside application containers.

Store files only in:

MinIO

or

Mounted Persistent Volume

Containers must remain stateless.

---

# DEPLOYMENT STRATEGY

Use:

Rolling Deployment

or

Blue-Green Deployment

Future Ready

---

# CI/CD

Preferred:

GitHub Actions

Pipeline:

```text
Lint

Test

Build

Docker Build

Docker Push

Deploy
```

---

# RELEASE FLOW

Development

↓

Staging

↓

Production

---

# STAGING ENVIRONMENT

Must support:

Separate Database

Separate Redis

Separate MinIO

Separate Domain

Example:

```text
staging.example.com
```

---

# DOCKER IMAGES

Frontend

```text
landing-platform/frontend
```

Backend

```text
landing-platform/backend
```

Versioned Tags Required.

Example:

```text
v1.0.0

v1.1.0
```

---

# ERROR RECOVERY

If deployment fails:

Rollback to previous version.

Requirements:

* Previous image retained
* Database backup available
* Zero data loss

---

# SCALING STRATEGY

Future Support

Multiple Backend Instances

Multiple Frontend Instances

Redis Shared Cache

External PostgreSQL

External Object Storage

Load Balancer

Without architecture changes.

---

# FUTURE SERVICES

Architecture must support:

Dify

OpenAI

Claude

Gemini

CRM

Email Marketing

Analytics

Knowledge Base

without deployment redesign.

---

# PRODUCTION CHECKLIST

Before Release

* Environment Variables Configured
* SSL Enabled
* Database Backup Working
* Media Backup Working
* Health Checks Working
* Logs Persisted
* Rate Limiting Enabled
* Monitoring Enabled
* Tests Passed
* Docker Images Versioned

---

# FINAL REQUIREMENT

The entire platform must be deployable, recoverable, scalable and maintainable by a single administrator using Docker Compose on Ubuntu VPS.

No manual code modifications should be required after deployment.

All infrastructure must be Infrastructure-as-Code friendly and production-ready.
