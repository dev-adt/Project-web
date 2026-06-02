# Form Builder Module

## Purpose
The **Form Builder** provides Elementor-style visual forms designer and renderer workspace capabilities. It enables administrators to drag, drop, reorder, and configure custom input fields (Text, Email, Phone, Select dropdowns, Radio selectors, Checkboxes, Files uploads), and handles dynamic user submissions logs mapping with full-featured CSV downloads.

## Architecture
The module strictly follows Clean Architecture guidelines with separated concerns:
* **Presentation Layer**: Exposes Rest Controllers (`forms`, `submissions`) handling Swagger descriptors and validation DTOs.
* **Application Layer**: Services executing core business transactions and validation layers.
* **Domain & Data Isolation**: Abstracted Repositories wrapping database interactions. No services or controllers consume Prisma client directly.
* **Audit Trail & Soft Delete**: Records created/updated metadata audit trails and manages safe soft-deletes.

## API Usage

### Form Configuration Designs
* `POST /api/v1/forms` - Create dynamic form template. Requires JWT & `forms.create` permission.
* `GET /api/v1/forms` - List paginated form templates.
* `GET /api/v1/forms/:id` - Fetch details of a single form with fields.
* `GET /api/v1/forms/slug/:slug` - Publicly access single form structure.
* `PUT /api/v1/forms/:id` - Modify form meta settings.
* `PUT /api/v1/forms/:id/fields` - Overwrite dynamic Elementor form fields array.
* `DELETE /api/v1/forms/:id` - Soft-delete a form builder template.

### Submissions Registry
* `POST /api/v1/submissions/slug/:slug/submit` - Publicly submit dynamic form values.
* `GET /api/v1/submissions/form/:formId` - List paginated submissions for a form.
* `GET /api/v1/submissions/form/:formId/export` - Export submissions spreadsheet as CSV attachment download.

## Dependencies
* `@prisma/client`
* `class-validator`
* `class-transformer`
* `@nestjs/common`
* `@nestjs/swagger`
