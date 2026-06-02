# DEV_RULES.md

# DEVELOPMENT RULES

Project:
Landing Builder Platform

Version:
1.0

Purpose:

This document defines mandatory development rules.

All generated code must follow these rules.

These rules take precedence over implementation shortcuts.

---

# CORE PRINCIPLES

Priority Order

1. Security
2. Maintainability
3. Scalability
4. Performance
5. Developer Experience

Never sacrifice architecture quality for faster implementation.

---

# GENERAL RULES

The system is a long-term platform.

It is NOT a prototype.

It is NOT a demo.

It must be production-ready.

Avoid hacks.

Avoid temporary solutions.

Avoid code duplication.

---

# TYPESCRIPT RULES

Mandatory

```json
{
  "strict": true
}
```

Requirements

* No implicit any
* No ts-ignore
* No unused variables
* No unused imports

Forbidden

```typescript
let data:any
```

Use explicit types.

---

# CLEAN ARCHITECTURE

Must separate:

Presentation Layer

Application Layer

Domain Layer

Infrastructure Layer

Business logic must never exist inside controllers.

Business logic must never exist inside React pages.

---

# BACKEND ARCHITECTURE

NestJS Modular Architecture

Structure

```text
src/

modules/

common/

config/

database/

shared/
```

Each module:

```text
module/

controller/

service/

repository/

dto/

entities/

guards/

validators/
```

---

# CONTROLLER RULES

Controllers must:

* Receive Request
* Validate DTO
* Call Service
* Return Response

Controllers must NOT:

* Access Database
* Contain Business Logic

---

# SERVICE RULES

Services contain business logic.

Services must:

* Use repositories
* Be testable
* Be reusable

---

# REPOSITORY RULES

All database access must go through repositories.

Forbidden

```typescript
prisma.user.findMany()
```

inside controller.

---

Required

```typescript
userRepository.findMany()
```

---

# DATABASE RULES

Use Prisma.

Use UUID.

Use Soft Delete.

Never hard delete business data.

Required Fields

```text
id

created_at

updated_at

deleted_at
```

All tables must support audit trail.

---

# API RULES

Versioned APIs

Required

```text
/api/v1
```

Response Format

Success

```json
{
  "success": true,
  "data": {}
}
```

Error

```json
{
  "success": false,
  "message": ""
}
```

Never return raw database objects.

---

# VALIDATION RULES

All input must use DTO validation.

Required

class-validator

class-transformer

Example

```typescript
IsEmail()

IsString()

IsUUID()
```

No endpoint may accept unvalidated input.

---

# ERROR HANDLING

Global Exception Filter required.

Standard Errors

400

401

403

404

409

422

500

Never expose stack traces.

---

# AUTHENTICATION RULES

Use JWT.

Use Refresh Token.

Passwords:

bcrypt

Minimum Length:

8

Token expiration configurable.

---

# AUTHORIZATION RULES

RBAC required.

Permissions required.

Never rely only on frontend restrictions.

Backend must validate every action.

---

# SECURITY RULES

Mandatory

Helmet

Rate Limiting

Input Validation

Output Sanitization

CSRF Protection

XSS Protection

SQL Injection Protection

File Validation

Virus Scan Hook Ready

---

# FILE UPLOAD RULES

Allowed Types

jpg

jpeg

png

webp

svg

pdf

docx

xlsx

Forbidden

exe

bat

cmd

sh

php

js

Maximum File Size

Configurable

Default

20MB

---

# FRONTEND RULES

Framework

NextJS

Language

TypeScript

---

No business logic inside UI components.

Pages should be thin.

Use hooks and services.

---

# COMPONENT RULES

Components must be reusable.

Forbidden

Huge components >500 lines.

Required

Split into:

View

Logic

Types

Config

---

# BUILDER COMPONENT RULES

Every builder block must contain:

```text
Component

Editor

Preview

Schema
```

Example

```text
Hero/

Hero.tsx

HeroEditor.tsx

HeroPreview.tsx

schema.ts
```

---

# STATE MANAGEMENT

Use Zustand.

Do not use Redux.

Keep stores modular.

---

# FORM RULES

Use React Hook Form.

Validation

Zod

All forms must support:

Loading

Error

Success

---

# UI RULES

Use Shadcn UI.

Avoid custom UI unless necessary.

Use consistent spacing.

Use accessibility best practices.

---

# RESPONSIVE RULES

Must support:

Desktop

Tablet

Mobile

Desktop first.

---

# PERFORMANCE RULES

Use:

SSR

Lazy Loading

Code Splitting

Memoization

Image Optimization

Pagination

Caching

---

# CACHE RULES

Use Redis.

Cache:

Pages

SEO

Templates

Public Content

Do not cache:

Admin actions

Authenticated user data

---

# SEO RULES

All pages must support:

Title

Description

OG Tags

Canonical URL

Structured Data

---

# LOGGING RULES

Use structured logging.

Required

Request Log

Error Log

Activity Log

Audit Log

---

# TESTING RULES

Required

Unit Test

Integration Test

E2E Test

Coverage Target

80%

Minimum

60%

---

# DOCKER RULES

Everything must run in Docker.

Required Services

```text
frontend

backend

postgres

redis

minio

nginx
```

Single command startup

```bash
docker compose up -d
```

---

# ENVIRONMENT RULES

Use .env

Never hardcode:

API Keys

Passwords

Secrets

Domains

Database URLs

---

# FEATURE FLAGS

Future-ready.

Support enabling/disabling features without deployment.

---

# PLUGIN RULES

All plugins must be isolated.

Plugins must never modify core code directly.

Use plugin interfaces.

---

# AI RULES

AI integrations must be provider-agnostic.

Support:

OpenAI

Claude

Gemini

Dify

through common interfaces.

---

# CODE QUALITY

Required

ESLint

Prettier

Husky

Lint Staged

Conventional Commits

---

# GIT RULES

Branch Naming

```text
feature/

fix/

hotfix/

refactor/
```

Commit Example

```text
feat: add page builder

fix: resolve upload issue

refactor: improve auth module
```

---

# DOCUMENTATION

Every module must contain:

README.md

Purpose

Architecture

API Usage

Dependencies

---

# FORBIDDEN PRACTICES

Do NOT:

* Use any
* Use ts-ignore
* Hardcode IDs
* Hardcode URLs
* Hardcode credentials
* Duplicate logic
* Put SQL in controllers
* Put business logic in React components
* Use global mutable state unnecessarily
* Bypass RBAC
* Bypass validation

---

# FINAL REQUIREMENT

The generated code must be:

Production Ready

Maintainable

Modular

Scalable

Secure

Testable

Plugin Ready

Future Proof

The project should be capable of supporting 100+ landing pages, thousands of media assets, and future AI/CRM integrations without major architectural changes.
