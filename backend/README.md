# NestJS Backend API Engine

This service is the core API server containing the modular business logic, security layers, relational schemas, caching, and storage connectors.

## Architecture

* **Modular Pattern**: Codebase is separated into decoupled feature modules containing controllers, services, repositories, and DTOs.
* **Database (Prisma & PostgreSQL)**: Custom ORM provider injecting the `PrismaService` globally.
* **Global Interceptors**: Transforms successful responses to standard structure `{"success": true, "message": "Success", "data": ...}`.
* **Global Filters**: Catches HTTP and internal server errors, mapping to a structured `{"success": false, "message": "...", "errors": [...]}` format.

## API Specification

All protected routes are versioned at `/api/v1` and require token validation under future Role-Based Access Control (RBAC).

### Health Status Endpoint
* **Path**: `/api/v1/health`
* **Method**: `GET`
* **Response**:
  ```json
  {
    "success": true,
    "message": "Success",
    "data": {
      "status": "ok",
      "timestamp": "2026-06-02T11:38:36Z",
      "services": {
        "database": "up"
      }
    }
  }
  ```

---

## Development

Install dependencies locally:
```bash
npm install
```

Generate Prisma clients:
```bash
npx prisma generate
```

Run in development mode:
```bash
npm run start:dev
```
