# DATABASE.md

# DATABASE DESIGN SPECIFICATION

Project:
Landing Page Platform

Version:
1.0

Database:
PostgreSQL

ORM:
Prisma

Primary Key:
UUID

Soft Delete:
Enabled

Audit Trail:
Required

---

# DATABASE PRINCIPLES

Every table must contain:

```sql
id UUID PRIMARY KEY

created_at TIMESTAMP

updated_at TIMESTAMP

deleted_at TIMESTAMP NULL

created_by UUID NULL

updated_by UUID NULL
```

Rules:

* UUID everywhere
* Soft Delete
* Foreign Keys
* Index Slug Fields
* Index Lookup Fields

---

# AUTHENTICATION

## users

```sql
id

email

username

password_hash

full_name

avatar

phone

status

last_login_at
```

Status:

* active
* inactive
* suspended

---

## refresh_tokens

```sql
id

user_id

token

expires_at

revoked
```

---

# RBAC

## roles

```sql
id

name

description
```

Default:

```text
ADMIN
EDITOR
CONTENT_CREATOR
```

---

## permissions

```sql
id

code

name

description
```

Examples:

```text
pages.create

pages.edit

pages.publish

media.upload

media.delete
```

---

## role_permissions

```sql
role_id

permission_id
```

---

## user_roles

```sql
user_id

role_id
```

---

# CMS

## pages

```sql
id

title

slug

status

template_id

seo_id
```

Status:

```text
draft

published

archived
```

---

## page_sections

```sql
id

page_id

section_type

position

settings_json

is_active
```

Example settings_json

```json
{
  "title":"Hero Title",
  "subtitle":"Hero Subtitle"
}
```

---

## page_versions

```sql
id

page_id

version_number

layout_json

change_note
```

Purpose:

Version Restore

---

# REUSABLE BLOCKS

## reusable_blocks

```sql
id

name

type

settings_json
```

Examples:

Header

Footer

CTA

Banner

---

## page_block_links

```sql
id

page_id

block_id

position
```

---

# TEMPLATE SYSTEM

## templates

```sql
id

name

description

thumbnail
```

---

## template_sections

```sql
id

template_id

section_type

position

settings_json
```

---

# MEDIA LIBRARY

## media_folders

```sql
id

name

parent_id
```

---

## media_files

```sql
id

folder_id

filename

file_path

mime_type

file_size

storage_provider
```

Storage Provider:

```text
local

minio

s3
```

---

## media_tags

```sql
id

name
```

---

## media_file_tags

```sql
media_id

tag_id
```

---

# BLOG

## categories

```sql
id

name

slug

description
```

---

## tags

```sql
id

name

slug
```

---

## posts

```sql
id

title

slug

excerpt

content

featured_image

status

author_id

published_at
```

Status:

```text
draft

review

published

archived
```

---

## post_categories

```sql
post_id

category_id
```

---

## post_tags

```sql
post_id

tag_id
```

---

# SEO

## seo_metadata

```sql
id

meta_title

meta_description

meta_keywords

og_title

og_description

og_image

canonical_url

schema_json
```

Referenced by:

Pages

Posts

Categories

Templates

---

# FORM BUILDER

## forms

```sql
id

name

slug

description

settings_json
```

---

## form_fields

```sql
id

form_id

field_type

label

placeholder

required

position

settings_json
```

Field Types:

```text
text

textarea

email

phone

number

select

radio

checkbox

date

file
```

---

## form_submissions

```sql
id

form_id

submitted_at

ip_address
```

---

## form_submission_values

```sql
id

submission_id

field_id

value
```

---

# MENU SYSTEM

## menus

```sql
id

name

location
```

Examples:

```text
header

footer

sidebar
```

---

## menu_items

```sql
id

menu_id

parent_id

title

url

position

target
```

---

# ACTIVITY LOGS

## activity_logs

```sql
id

user_id

action

entity_type

entity_id

old_data

new_data

ip_address
```

Examples:

```text
page.updated

media.uploaded

post.published
```

---

# ANALYTICS

## page_views

```sql
id

page_id

visitor_id

ip_address

user_agent

referer
```

---

## visitor_sessions

```sql
id

visitor_id

started_at

ended_at
```

---

# PLUGIN SYSTEM

## plugins

```sql
id

name

slug

version

enabled

settings_json
```

---

## plugin_settings

```sql
id

plugin_id

key

value
```

---

# AI MODULE

## ai_providers

```sql
id

name

api_key

base_url

model
```

Examples:

```text
openai

anthropic

gemini

dify
```

---

## ai_logs

```sql
id

provider_id

user_id

prompt

response

token_usage
```

---

# NOTIFICATION SYSTEM

## notifications

```sql
id

user_id

title

message

read_at
```

---

# FILE EXPORTS

## exports

```sql
id

type

status

file_path
```

Examples:

```text
csv

xlsx

pdf
```

---

# SETTINGS

## system_settings

```sql
id

setting_key

setting_value
```

Examples:

```text
site_name

site_logo

default_language

maintenance_mode
```

---

# FUTURE MULTI-SITE SUPPORT

## sites

```sql
id

name

domain

status
```

---

## site_pages

```sql
site_id

page_id
```

Purpose:

Allow one CMS to manage multiple websites.

---

# FUTURE CRM SUPPORT

## leads

```sql
id

full_name

phone

email

source

status
```

---

## lead_notes

```sql
id

lead_id

content
```

---

# FUTURE DIFY SUPPORT

## knowledge_bases

```sql
id

name

provider

external_id
```

---

## knowledge_documents

```sql
id

knowledge_base_id

title

external_document_id
```

---

# ESTIMATED DATABASE SIZE

MVP:

25-30 Tables

Production:

40-50 Tables

Enterprise:

60+ Tables

Schema must be designed so new modules can be added without breaking existing modules.
