# API_SPEC.md

# API SPECIFICATION

Project:
Landing Builder Platform

Version:
v1

Base URL

```text
/api/v1
```

Response Format

Success

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": []
}
```

---

# AUTHENTICATION

## Login

POST

```text
/auth/login
```

Request

```json
{
  "email":"admin@example.com",
  "password":"password"
}
```

Response

```json
{
  "accessToken":"...",
  "refreshToken":"...",
  "user":{}
}
```

---

## Refresh Token

POST

```text
/auth/refresh
```

---

## Logout

POST

```text
/auth/logout
```

---

## Forgot Password

POST

```text
/auth/forgot-password
```

---

## Reset Password

POST

```text
/auth/reset-password
```

---

## Current User

GET

```text
/auth/me
```

---

# USERS

## Get Users

GET

```text
/users
```

Query

```text
?page=1

&limit=20

&search=
```

---

## Get User Detail

GET

```text
/users/{id}
```

---

## Create User

POST

```text
/users
```

Body

```json
{
  "email":"user@example.com",
  "fullName":"John Doe",
  "roleIds":[]
}
```

---

## Update User

PUT

```text
/users/{id}
```

---

## Delete User

DELETE

```text
/users/{id}
```

Soft Delete Only

---

# ROLES

## Get Roles

GET

```text
/roles
```

---

## Create Role

POST

```text
/roles
```

---

## Update Role

PUT

```text
/roles/{id}
```

---

## Delete Role

DELETE

```text
/roles/{id}
```

---

## Assign Permissions

POST

```text
/roles/{id}/permissions
```

---

# PERMISSIONS

## Get Permissions

GET

```text
/permissions
```

---

# PAGES

## Get Pages

GET

```text
/pages
```

Query

```text
?page=1

&limit=20

&status=published
```

---

## Get Page Detail

GET

```text
/pages/{id}
```

---

## Get Page By Slug

GET

```text
/pages/slug/{slug}
```

Used by frontend renderer.

---

## Create Page

POST

```text
/pages
```

Body

```json
{
  "title":"Home",
  "slug":"home"
}
```

---

## Update Page

PUT

```text
/pages/{id}
```

---

## Delete Page

DELETE

```text
/pages/{id}
```

---

## Duplicate Page

POST

```text
/pages/{id}/duplicate
```

---

## Publish Page

POST

```text
/pages/{id}/publish
```

---

## Archive Page

POST

```text
/pages/{id}/archive
```

---

# PAGE BUILDER

## Get Layout

GET

```text
/pages/{id}/layout
```

---

## Save Layout

PUT

```text
/pages/{id}/layout
```

Example

```json
{
  "sections":[]
}
```

---

## Add Section

POST

```text
/pages/{id}/sections
```

---

## Update Section

PUT

```text
/pages/{id}/sections/{sectionId}
```

---

## Delete Section

DELETE

```text
/pages/{id}/sections/{sectionId}
```

---

## Reorder Sections

POST

```text
/pages/{id}/sections/reorder
```

Body

```json
{
  "sectionIds":[]
}
```

---

# REUSABLE BLOCKS

## Get Blocks

GET

```text
/blocks
```

---

## Create Block

POST

```text
/blocks
```

---

## Update Block

PUT

```text
/blocks/{id}
```

---

## Delete Block

DELETE

```text
/blocks/{id}
```

---

# TEMPLATES

## Get Templates

GET

```text
/templates
```

---

## Create Template

POST

```text
/templates
```

---

## Create Page From Template

POST

```text
/templates/{id}/create-page
```

---

# MEDIA

## Upload File

POST

```text
/media/upload
```

multipart/form-data

---

## Get Files

GET

```text
/media
```

---

## Get File Detail

GET

```text
/media/{id}
```

---

## Delete File

DELETE

```text
/media/{id}
```

---

## Move File

POST

```text
/media/{id}/move
```

---

## Create Folder

POST

```text
/media/folders
```

---

## Get Folders

GET

```text
/media/folders
```

---

# BLOG

## Get Posts

GET

```text
/posts
```

---

## Get Post

GET

```text
/posts/{id}
```

---

## Create Post

POST

```text
/posts
```

---

## Update Post

PUT

```text
/posts/{id}
```

---

## Delete Post

DELETE

```text
/posts/{id}
```

---

## Publish Post

POST

```text
/posts/{id}/publish
```

---

# CATEGORIES

GET

```text
/categories
```

POST

```text
/categories
```

PUT

```text
/categories/{id}
```

DELETE

```text
/categories/{id}
```

---

# TAGS

GET

```text
/tags
```

POST

```text
/tags
```

PUT

```text
/tags/{id}
```

DELETE

```text
/tags/{id}
```

---

# SEO

## Update SEO

PUT

```text
/seo/{entityType}/{entityId}
```

Example

```text
/seo/page/123
```

---

## Generate Sitemap

POST

```text
/seo/generate-sitemap
```

---

# FORMS

## Get Forms

GET

```text
/forms
```

---

## Create Form

POST

```text
/forms
```

---

## Update Form

PUT

```text
/forms/{id}
```

---

## Delete Form

DELETE

```text
/forms/{id}
```

---

## Submit Form

POST

```text
/forms/{slug}/submit
```

Public endpoint.

---

## Get Submissions

GET

```text
/forms/{id}/submissions
```

---

## Export Submissions

GET

```text
/forms/{id}/export
```

Formats

```text
csv

xlsx
```

---

# VERSIONING

## Get Versions

GET

```text
/pages/{id}/versions
```

---

## Get Version

GET

```text
/pages/{id}/versions/{versionId}
```

---

## Restore Version

POST

```text
/pages/{id}/versions/{versionId}/restore
```

---

# ACTIVITY LOGS

## Get Logs

GET

```text
/activity-logs
```

Filters

```text
user

action

date
```

---

# ANALYTICS

## Dashboard Metrics

GET

```text
/analytics/dashboard
```

---

## Page Views

GET

```text
/analytics/page-views
```

---

## Leads

GET

```text
/analytics/leads
```

---

# PLUGINS

## Get Plugins

GET

```text
/plugins
```

---

## Enable Plugin

POST

```text
/plugins/{id}/enable
```

---

## Disable Plugin

POST

```text
/plugins/{id}/disable
```

---

## Plugin Settings

PUT

```text
/plugins/{id}/settings
```

---

# AI MODULE

## Generate Content

POST

```text
/ai/generate
```

---

## Rewrite Content

POST

```text
/ai/rewrite
```

---

## Summarize Content

POST

```text
/ai/summarize
```

---

## Translate Content

POST

```text
/ai/translate
```

---

# SETTINGS

## Get Settings

GET

```text
/settings
```

---

## Update Settings

PUT

```text
/settings
```

---

# HEALTH CHECK

GET

```text
/health
```

Response

```json
{
  "status":"ok"
}
```

---

# AUTHORIZATION RULE

All endpoints except:

```text
/auth/login

/auth/refresh

/forms/{slug}/submit

/pages/slug/{slug}

/health
```

require authentication.

All protected endpoints must use RBAC middleware.

---

# OPENAPI

System must auto-generate:

```text
/swagger
```

using NestJS Swagger.

All endpoints must be documented.

---

# FINAL REQUIREMENT

All APIs must:

* Use DTO Validation
* Use Pagination
* Use UUID
* Return Standard Response Format
* Support Audit Logging
* Support Soft Delete
* Support RBAC
* Be OpenAPI Compatible
