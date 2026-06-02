# Headless CMS + Visual Landing Builder Platform

This project is a premium-tier, commercial-scale Landing Page Platform designed to run seamlessly on containerized virtual private servers (VPS). The platform empowers non-technical users to build, edit, and publish custom landing pages dynamically through a modern admin dashboard without modifying any source code.

---

## System Architecture

```text
               Internet (Port 80)
                       │
                       ▼
                 Nginx Gateway
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
     NextJS Frontend      NestJS Backend
       (Port 3000)         (Port 4000)
                                 │
                        ┌────────┼────────┐
                        ▼        ▼        ▼
                    Postgres   Redis    MinIO
```

* **Nginx**: Serves as the reverse proxy gateway, enforcing custom security headers and Gzip compression.
* **NextJS Frontend**: Utilizes React 19 and NextJS 15+ to render the canvas, component library, and dashboards.
* **NestJS Backend**: Built with TypeScript and NestJS. Integrates custom global exceptions, validation filters, and standard response transform interceptors.
* **PostgreSQL & Prisma**: Persists relational data models with index constraints, UUIDs, soft deletes, and auditing trails.
* **Redis**: In-memory caching, rate-limiter, session, and queue store.
* **MinIO**: High-performance S3-compatible cloud object storage configured with default paths for media assets.

---

## Services & Ports Mapping

| Service | Internal Port | Host Port | Description |
|---|---|---|---|
| **Nginx Gateway** | `80` | `80` | Public router and security proxy |
| **NextJS Frontend** | `3000` | `3000` | Canvas editor and administration interface |
| **NestJS Backend** | `4000` | `4000` | Business logic service and Core APIs |
| **PostgreSQL** | `5432` | `5432` | Relational database storage |
| **Redis Cache** | `6379` | `6379` | Fast caching and key-value memory layer |
| **MinIO Storage** | `9000` / `9001` | `9000` / `9001` | S3 cloud storage for uploaded media assets |

---

## Local Startup Instructions

### Prerequisites
* Docker and Docker Compose installed locally.

### Start the Platform
Run the following command at the root of the project:
```bash
docker compose up --build -d
```

### Access Ports & API
* **Web Application**: Open [http://localhost](http://localhost) in your browser.
* **API Swagger Documentation**: Open [http://localhost/swagger](http://localhost/swagger).
* **API Health Check**: Open [http://localhost/health](http://localhost/health) or [http://localhost/api/v1/health](http://localhost/api/v1/health).
* **MinIO Console**: Open [http://localhost:9001](http://localhost:9001) (Credentials: `minio_admin` / `minio_secret_key`).
