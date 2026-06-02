# Blog System Module

## Purpose
The **Blog System** provides visual and programmatic management of rich text content articles. It supports categorizing posts, tagging articles, setting extensive SEO configurations, and rendering headless rich-text blocks via the TipTap editor.

## Architecture
The module strictly adheres to Clean Architecture guidelines with separated concerns:
* **Presentation Layer**: Exposes Rest Controllers (`posts`, `categories`, `tags`) handling Swagger descriptors and validation DTOs.
* **Application Layer**: Services executing core business transactions and validation layers.
* **Domain & Data Isolation**: Abstracted Repositories wrapping database interactions. No services or controllers consume Prisma client directly.
* **Audit Trail & Soft Delete**: Records created/updated metadata audit trails and manages safe soft-deletes (`deletedAt` field filtering).

## API Usage

### Posts & Articles
* `POST /api/v1/posts` - Create draft post. Requires JWT & `posts.create` permission.
* `GET /api/v1/posts` - Query paginated posts with text-search and status filters.
* `GET /api/v1/posts/:id` - Fetch details of a single post.
* `GET /api/v1/posts/slug/:slug` - Publicly access single post content.
* `PUT /api/v1/posts/:id` - Modify post properties, tags, categories, or SEO metadata.
* `DELETE /api/v1/posts/:id` - Soft-delete an article.
* `POST /api/v1/posts/:id/publish` - Set status to `published` and mark publish timestamp.

### Categories Registry
* `POST /api/v1/categories` - Register new category.
* `GET /api/v1/categories` - Fetch paginated categories list.
* `GET /api/v1/categories/:id` - Fetch details.
* `PUT /api/v1/categories/:id` - Update names or slugs.
* `DELETE /api/v1/categories/:id` - Soft delete.

### Tags Registry
* `POST /api/v1/tags` - Register tag identifier.
* `GET /api/v1/tags` - List tags.
* `GET /api/v1/tags/:id` - Tag details.
* `PUT /api/v1/tags/:id` - Edit tag.
* `DELETE /api/v1/tags/:id` - Soft-delete tag.

## Dependencies
* `@prisma/client`
* `class-validator`
* `class-transformer`
* `@nestjs/common`
* `@nestjs/swagger`
