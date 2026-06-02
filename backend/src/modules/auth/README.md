# Authentication & Role-Based Access Control (RBAC) Module

This module represents the complete authentication, users, roles, and permissions system for the Landing Builder Platform.

---

## Architecture

* **Repository Pattern**: Built using absolute database abstractions (`UserRepository`, `RoleRepository`, `PermissionRepository`, `RefreshTokenRepository`). Zero controllers or services access the Prisma database client directly.
* **Passport-JWT**: Integrates verified passport JWT schemes (`JwtStrategy`, `JwtAuthGuard`) supporting customizable token expiry times.
* **Modular RBAC**: Evaluating active authorization claims via an advanced NestJS guard (`RbacGuard`). Bypasses match checks automatically if the client possesses the `ADMIN` role.
* **Refresh Token Rotation & Revoking**: Automatically revokes expired sessions, supports single logout, and limits parallel token rotation.

---

## API Endpoints

### 1. Authentication
* `POST /api/v1/auth/login`: Signs access and refresh claims.
  * Request:
    ```json
    {
      "email": "admin@example.com",
      "password": "password"
    }
    ```
* `POST /api/v1/auth/refresh`: Exchanges refresh token for rotated credentials.
  * Request: `{"refreshToken": "token_string"}`
* `POST /api/v1/auth/logout`: Revokes active refresh session token.
* `GET /api/v1/auth/me`: Retrieves current active profile.

### 2. User Accounts Management
* `POST /api/v1/users`: Create a new user (Requires `users.create` permission).
* `GET /api/v1/users`: Query paginated users (Requires `users.view` permission).
* `GET /api/v1/users/{id}`: Detailed user profile (Requires `users.view` permission).
* `PUT /api/v1/users/{id}`: Modify user profile or alter assigned roles (Requires `users.edit`).
* `DELETE /api/v1/users/{id}`: Soft-delete user (Requires `users.delete` permission).

### 3. Role & Permission Allocations
* `POST /api/v1/roles`: Registers custom role metadata (Requires `roles.create` permission).
* `GET /api/v1/roles`: List all system roles (Requires `roles.view` permission).
* `POST /api/v1/roles/{id}/permissions`: Assign permission UUID mappings (Requires `roles.edit`).
* `GET /api/v1/permissions`: List all global permission codes (Requires `permissions.view`).

---

## Local Unit Testing

Run standalone unit tests inside the backend directory:
```bash
npm run test
```
