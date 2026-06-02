# Pages & Headless CMS Module

This module manages landing pages, visual component layouts (sections), and versioned snapshot rollbacks.

---

## Architecture

* **Database Schema**: Wires three tables: `pages`, `page_sections`, and `page_versions` with cascaded deletion limits.
* **Layout Reorders**: Position indexes reordering are fully computed inside Postgres transactions to prevent collisions.
* **Publish Versions Snapshot**: Publishing capturing layout structures to the versions table to track edits and restore snapshots easily.

---

## API Specification

All endpoints are versioned under `/api/v1/pages`.

### 1. Page Operations
* `POST /pages`: Create a draft page (Requires `pages.create`).
* `GET /pages`: Paginated page records (Requires `pages.view`).
* `GET /pages/slug/{slug}`: **Public route** matching slug path (Bypasses JWT).
* `POST /pages/{id}/publish`: Saves active layouts snapshot and updates status to `published` (Requires `pages.publish`).
* `POST /pages/{id}/duplicate`: Copies complete section allocations (Requires `pages.create`).
* `DELETE /pages/{id}`: Soft delete pages (Requires `pages.delete`).

### 2. Layout Section Builders
* `GET /pages/{id}/layout`: Fetch all layout sections.
* `PUT /pages/{id}/layout`: Replace total layouts.
* `POST /pages/{id}/sections`: Append block component.
* `PUT /pages/{id}/sections/{sectionId}`: Modify single block properties.
* `DELETE /pages/{id}/sections/{sectionId}`: Soft-delete block.
* `POST /pages/{id}/sections/reorder`: Updates position index list in a transaction.

### 3. Version History
* `GET /pages/{id}/versions`: List snapshot versions.
* `POST /pages/{id}/versions/{versionId}/restore`: Overwrites active layouts with selected snapshot values.
