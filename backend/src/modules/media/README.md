# Media Library & Storage Module

This module manages dynamic cloud storage directories, S3 S3-compatible buffer file uploads (via MinIO), and recursive metadata allocations.

---

## Architecture

* **Relational Schema**: Relates folders recursively (self-relation `parent_id`) and maps uploaded files metadata to `media_files`.
* **MinIO Object Connector**: Direct API calls to standard `putObject` and `removeObject` endpoints.
* **Multer File Validation Interceptors**: Restricts size to <= 20MB, validates JPG, JPEG, PNG, WEBP, SVG, PDF, DOCX, XLSX extension MIME types.
* **Secure RBAC Controllers**: Exposes file uploads and deletes only for users possessing `media.upload` and `media.delete` permissions.

---

## API Specification

All endpoints are versioned under `/api/v1/media`.

### 1. File Uploads & Purges
* `POST /media/upload`: Upload file in `multipart/form-data`.
  * Fields: `file` (binary), `folderId` (UUID, optional).
* `GET /media`: Lists files (Query `folderId` or `search` parameters).
* `GET /media/{id}`: Detailed asset parameters.
* `POST /media/{id}/move`: Moves file destination (`{"folderId": "UUID"}`).
* `DELETE /media/{id}`: Purges S3 asset physically and flags DB record soft-deleted.

### 2. Folder Directories
* `POST /media/folders`: Create folder.
  * Request: `{"name": "Assets", "parentId": "UUID_optional"}`.
* `GET /media/folders`: Lists folders matching `parentId` navigation.
