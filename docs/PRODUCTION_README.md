# Production Architecture Overview - Landing Builder Platform

This document outlines the hardened production architecture, security configurations, and container configurations for the **Landing Builder Platform**.

---

## 1. High-Level Services Architecture

In production, the platform runs as a stateless, highly optimized, multi-container orchestration managed via Docker Compose:

```text
                             Internet
                                │
                                ▼
                       Nginx Reverse Proxy
                     (SSL, HSTS, Rate Limit)
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
         NextJS Frontend                NestJS Backend
         (Stateless Node)              (Stateless Node)
                                               │
                               ┌───────────────┼───────────────┐
                               ▼               ▼               ▼
                          PostgreSQL         Redis           MinIO
                         (Timeseries)     (Rate Limit)     (S3 Storage)
```

---

## 2. Hardened Production Configuration

### A. Docker Log Rotation Limits
To prevent containers from saturating the server disk space over time, log files are capped strictly in `docker-compose.prod.yml`:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### B. Redis Password Protection
The Redis database instance runs in protected mode with `appendonly` persistence activated and a mandatory system-generated secret password:
```bash
redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
```

### C. Nginx Reverse Proxy Security Headers
Nginx intercepts all inbound traffic and enforces the following strict security HTTP headers:
* **HSTS**: `Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"`
* **CSP**: `Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'self';"`
* **Permissions Policy**: `Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"`
* **Clickjacking Protection**: `X-Frame-Options "SAMEORIGIN"`
* **MIME Sniffing Prevention**: `X-Content-Type-Options "nosniff"`
* **Referrer Policy**: `Referrer-Policy "strict-origin-when-cross-origin"`

---

## 3. API Rate Limiting Zones

Nginx limits the maximum API rate call threshold to prevent DDoS and brute-force attacks:
* **Storage Zone**: `10MB` memory zone.
* **Rate Limits**: Capped at `15 requests/second` per IP, with a short burst buffer of up to `30 requests`.
* **API Rate Configuration**:
  ```nginx
  limit_req_zone $binary_remote_addr zone=api_limit_zone:10m rate=15r/s;
  ```

---

## 4. Platform Health Check Routes

Health checks are declared directly on containers to allow the gateway proxy and container orchestrator to dynamically manage unhealthy services:

| Component | Port | Check Endpoint | Docker Native Command |
| :--- | :--- | :--- | :--- |
| **Nginx** | `80` | `/health` | `wget -qO- http://localhost/health` |
| **Backend** | `4000` | `/api/v1/health` | `node healthcheck.js` |
| **Frontend** | `3000` | `/` | `node healthcheck.js` |
| **Postgres** | `5432` | `-` | `pg_isready -U postgres -d landing_db` |
| **Redis** | `6379` | `-` | `redis-cli ping` |
| **MinIO** | `9000` | `/minio/health/live` | `wget -qO- http://localhost:9000/minio/health/live` |
