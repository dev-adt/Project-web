# PROJECT PLAN

# HEADLESS CMS + VISUAL LANDING PAGE BUILDER PLATFORM

---

# 1. PROJECT OVERVIEW

## Objective

Build a complete Landing Page Platform running on a VPS.

The system must allow non-technical users to create, manage and publish landing pages without accessing source code, server, SSH or deployment tools.

The platform should function similarly to:

* WordPress + Elementor
* Webflow
* Framer
* Hubspot CMS

The system must be scalable and extensible for future business needs.

---

# 2. BUSINESS GOALS

The platform should allow:

* Unlimited Landing Pages
* Drag & Drop Page Building
* Content Management
* SEO Management
* Media Management
* User Management
* Form Management
* Blog Management

Future expansion:

* AI Assistant
* Dify Integration
* CRM Integration
* Email Marketing
* Analytics
* Plugin Marketplace

---

# 3. TECH STACK

## Frontend

* NextJS 15+
* React
* TypeScript
* TailwindCSS
* Shadcn UI
* Dnd Kit
* Zustand

## Backend

* NestJS
* TypeScript

## Database

* PostgreSQL

## ORM

* Prisma

## Storage

* MinIO

## Authentication

* JWT
* Refresh Token

## Deployment

* Docker
* Docker Compose

---

# 4. SYSTEM ARCHITECTURE

Public Website

↓

Render Engine

↓

Headless CMS API

↓

Database

↓

Media Storage

---

Admin Dashboard

↓

CMS API

↓

Database

---

# 5. ROLE BASED ACCESS CONTROL

## ADMIN

Full access.

Permissions:

* Manage Users
* Manage Roles
* Manage Pages
* Manage Landing Builder
* Manage Blog
* Manage Forms
* Manage SEO
* Manage Media
* Manage Plugins
* View Logs
* View Analytics
* Restore Versions

---

## EDITOR

Permissions:

* Edit Landing Pages
* Edit Content
* Edit SEO
* Manage Media
* Manage Blog

Cannot:

* Manage Users
* Manage Roles
* Change System Settings

---

## CONTENT CREATOR

Permissions:

* Create Articles
* Upload Media
* Create Drafts

Cannot:

* Publish Content
* Delete Published Content
* Access Settings

---

# 6. CORE MODULES

---

## MODULE 1

## AUTHENTICATION

Features:

* Login
* Logout
* Refresh Token
* Forgot Password
* Reset Password
* Change Password

Security:

* JWT
* Password Hashing
* Rate Limiting
* CSRF Protection

---

## MODULE 2

## USER MANAGEMENT

Tables:

users

roles

permissions

role_permissions

user_roles

Features:

* Create User
* Disable User
* Assign Roles
* Reset Password

---

## MODULE 3

## HEADLESS CMS

Purpose:

Store all website content inside database.

No page content should be hardcoded.

All content must come from API.

---

Tables:

pages

page_sections

page_versions

---

pages

Fields:

* id
* title
* slug
* status
* seo_title
* seo_description
* created_by
* created_at
* updated_at

Status:

* Draft
* Published
* Archived

---

page_sections

Fields:

* id
* page_id
* section_type
* position
* settings_json
* is_active

---

Example:

{
"title":"AI Health Assistant",
"subtitle":"Protecting Vietnamese Family Clans",
"buttonText":"Start Now"
}

---

# 7. VISUAL PAGE BUILDER

This is the most important module.

Must function similarly to Elementor/Webflow.

Users must be able to:

* Add Section
* Remove Section
* Duplicate Section
* Drag Section
* Reorder Section
* Hide Section
* Save Draft
* Publish

No coding required.

---

# 8. SECTION LIBRARY

Initial Components:

Hero

Features

Benefits

About

Timeline

Pricing

FAQ

Testimonials

Gallery

Video

Statistics

CTA

Contact Form

Partners

Team Members

Rich Text

Spacer

Divider

Custom HTML Block

---

Every section must be reusable.

---

# 9. COMPONENT SYSTEM

All sections must be implemented as reusable React components.

Example:

components/

HeroSection

FeatureSection

FAQSection

GallerySection

CTASection

---

Builder only changes component settings.

Users never edit source code.

---

# 10. REUSABLE BLOCKS

Allow users to save sections as reusable blocks.

Example:

Header

Footer

CTA Banner

Newsletter Section

Contact Block

When block changes:

All pages update automatically.

---

# 11. TEMPLATE SYSTEM

Support Landing Page Templates.

Examples:

Healthcare Template

Education Template

Business Template

Event Template

Nonprofit Template

Family Clan Template

Users can create pages from templates.

---

# 12. MEDIA LIBRARY

Supported:

* jpg
* jpeg
* png
* webp
* svg
* pdf
* docx

Features:

* Upload
* Search
* Preview
* Replace
* Delete
* Folder Management

Metadata:

* filename
* size
* type
* uploader
* upload_date

---

# 13. BLOG SYSTEM

Modules:

Posts

Categories

Tags

Authors

Comments (optional)

Status:

Draft

Review

Published

Archived

---

# 14. SEO MANAGER

Each page must support:

Meta Title

Meta Description

Keywords

OG Title

OG Description

OG Image

Canonical URL

Schema JSON-LD

Auto Generate:

sitemap.xml

robots.txt

---

# 15. FORM BUILDER

Visual Form Builder.

Field Types:

Text

Textarea

Email

Phone

Number

Select

Checkbox

Radio

Date

File Upload

Submit Button

---

Submissions stored in database.

Admin can export:

CSV

Excel

---

# 16. VERSION CONTROL

Every content update creates a snapshot.

Users can:

* View Version History
* Compare Versions
* Restore Versions

---

# 17. ACTIVITY LOG

Track all actions.

Examples:

User Login

Page Updated

Post Published

Media Uploaded

Role Changed

Version Restored

---

# 18. ANALYTICS DASHBOARD

Widgets:

Total Pages

Total Visitors

Total Posts

Total Leads

Total Form Submissions

Recent Activities

---

# 19. PLUGIN SYSTEM

System must support future plugins.

Plugins table:

* id
* name
* version
* enabled
* settings

Examples:

Chatbot

Dify

CRM

Email Marketing

Analytics

Facebook Messenger

Zalo OA

Google Drive Sync

Knowledge Base

---

# 20. AI CONTENT ASSISTANT

Future-ready architecture.

Features:

Generate Content

Rewrite Content

SEO Optimization

Summarize Content

Translate Content

AI should be injectable into editor.

---

# 21. PUBLIC RENDER ENGINE

Pages are rendered dynamically.

Flow:

Visitor

↓

NextJS Page

↓

API Request

↓

CMS Data

↓

Render Components

No hardcoded content.

---

# 22. DATABASE DESIGN PRINCIPLE

Rules:

* Normalize relational data.
* Use JSON only for dynamic component settings.
* Use UUID as primary key.
* Use soft delete whenever possible.
* Maintain audit trail.

---

# 23. SECURITY REQUIREMENTS

Must implement:

Authentication

Authorization

Rate Limiting

Input Validation

CSRF Protection

XSS Protection

SQL Injection Protection

File Upload Validation

Role Validation

Activity Logging

---

# 24. PERFORMANCE REQUIREMENTS

Use:

Server Side Rendering

Caching

Image Optimization

Lazy Loading

Pagination

Database Indexing

CDN Ready Architecture

---

# 25. MVP ROADMAP

Phase 1

Authentication

User Roles

Pages

Media Library

SEO

Landing Builder

---

Phase 2

Blog

Templates

Reusable Blocks

Version History

---

Phase 3

Form Builder

Analytics

Activity Logs

---

Phase 4

Plugin System

AI Assistant

Dify Integration

CRM Integration

---

# 26. FINAL REQUIREMENT

This project is NOT a single landing page.

This project is a Landing Page Platform.

All content must be editable through Admin Dashboard.

No content should require source code modification.

Admin and Editor must be able to create and manage complete landing pages without developer assistance.

The architecture must be scalable, plugin-ready, reusable, maintainable and production-ready.
