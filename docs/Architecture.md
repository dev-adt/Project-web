# ARCHITECTURE.md

# SYSTEM ARCHITECTURE

Landing Builder Platform

Version: 1.0

---

# OVERVIEW

This system is NOT a simple landing page.

This system is a complete Headless CMS + Visual Landing Builder Platform.

The architecture must support:

* Unlimited Landing Pages
* Visual Builder
* Blog System
* Form Builder
* Media Library
* SEO Manager
* RBAC
* Versioning
* Plugin System

Future support:

* Dify
* AI Assistant
* CRM
* Multi-site

---

# HIGH LEVEL ARCHITECTURE

```text
Browser
│
├── Public Website
│
└── Admin Dashboard
        │
        ▼
NextJS Frontend
        │
        ▼
NestJS API
        │
 ┌──────┼────────┐
 ▼      ▼        ▼
Postgres MinIO Redis
```

---

# FRONTEND ARCHITECTURE

Framework:

NextJS

Language:

TypeScript

UI:

Shadcn UI

State:

Zustand

DnD:

Dnd-Kit

---

Folder Structure

```text
src/

app/

components/

modules/

hooks/

services/

stores/

types/

utils/

styles/
```

---

# COMPONENT STRUCTURE

```text
components/

builder/

Hero

Feature

FAQ

CTA

Gallery

Video

Timeline

Form

Pricing

Testimonial
```

Each component:

```text
Hero/

Hero.tsx

HeroEditor.tsx

HeroPreview.tsx

HeroSettings.tsx

schema.ts
```

---

# BUILDER ARCHITECTURE

Builder Engine

Responsibilities:

* Add Section
* Remove Section
* Duplicate Section
* Reorder Section
* Save Layout
* Publish Layout

---

Layout Data

Stored as JSON

Example

```json
{
  "sections":[
    {
      "id":"hero_001",
      "type":"hero",
      "settings":{
        "title":"AI Health Assistant"
      }
    }
  ]
}
```

---

# BACKEND ARCHITECTURE

Framework:

NestJS

Pattern:

Modular Architecture

---

Modules

```text
auth

users

roles

permissions

pages

builder

media

blog

seo

forms

analytics

plugins

activity_logs

versions
```

---

# AUTH MODULE

Responsibilities:

* Login
* Logout
* Refresh Token
* Password Reset

Security:

* JWT
* Refresh Token
* Bcrypt

---

# RBAC MODULE

Tables

roles

permissions

role_permissions

user_roles

---

Permission Format

```text
pages.create

pages.edit

pages.delete

pages.publish

media.upload

media.delete
```

---

# PAGE MODULE

Purpose:

Manage landing pages.

Features:

* Create Page
* Edit Page
* Duplicate Page
* Archive Page
* Publish Page

---

# BUILDER MODULE

Purpose:

Store visual layout.

Tables:

page_sections

page_versions

---

Responsibilities:

* Save Layout
* Load Layout
* Validate Components

---

# MEDIA MODULE

Storage:

MinIO

Features:

* Upload
* Delete
* Replace
* Folder Support

Allowed Types:

jpg

jpeg

png

webp

svg

pdf

docx

xlsx

---

# BLOG MODULE

Entities:

Posts

Categories

Tags

Authors

---

Features:

* Draft
* Review
* Publish
* Archive

---

# SEO MODULE

Page SEO

Fields:

title

description

keywords

og_title

og_description

og_image

canonical

schema_json

---

Auto Generate:

sitemap.xml

robots.txt

---

# FORM BUILDER MODULE

Purpose:

Create forms without coding.

---

Field Types

Text

Textarea

Email

Phone

Number

Date

Checkbox

Radio

Select

File Upload

Submit

---

Form Submission Storage

Database

---

Export

CSV

Excel

---

# VERSIONING MODULE

Purpose:

Restore previous content.

Every update:

Create Snapshot

---

Features

View History

Compare Versions

Restore Version

---

# ACTIVITY LOG MODULE

Track:

Login

Logout

Page Update

Post Update

Media Upload

Role Change

Version Restore

---

# ANALYTICS MODULE

Metrics

Page Views

Unique Visitors

Form Leads

Traffic Sources

Top Pages

---

# PLUGIN SYSTEM

Purpose:

Allow future extension.

Plugin Structure

```text
plugins/

dify/

crm/

analytics/

email/
```

---

Plugin Interface

```typescript
interface Plugin {

id:string

name:string

version:string

enabled:boolean

init():void

destroy():void

}
```

---

# REDIS USAGE

Purpose

Cache

Rate Limiting

Session Store

Queue

---

# FILE STORAGE

Provider

MinIO

Directory Structure

```text
uploads/

images/

documents/

avatars/

exports/
```

---

# DATABASE PRINCIPLES

Use UUID

Soft Delete

Audit Trail

Created By

Updated By

Created At

Updated At

---

# API DESIGN

REST API

Versioned

Example

```text
/api/v1/pages

/api/v1/posts

/api/v1/forms
```

---

# DEPLOYMENT

Docker Compose

Services

```text
frontend

backend

postgres

redis

minio

nginx
```

---

# VPS REQUIREMENTS

Minimum

4 CPU

8GB RAM

80GB SSD

---

Recommended

8 CPU

16GB RAM

160GB SSD

---

# NGINX

Reverse Proxy

SSL

Compression

Cache Headers

Rate Limiting

---

# SECURITY

Must Implement

RBAC

CSRF

XSS Protection

Input Validation

File Validation

Rate Limit

JWT Expiration

Audit Log

Password Hashing

---

# FUTURE READY

Must support:

Dify

OpenAI

Claude

Google Drive Sync

Knowledge Base

CRM

Email Marketing

Multi Tenant

Multi Site

White Label

without major refactoring.

---

# FINAL REQUIREMENT

The codebase must be clean, modular and scalable.

The architecture must prioritize:

Maintainability

Extensibility

Security

Performance

Developer Experience

Production Readiness
