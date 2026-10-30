# Current Sprint — Foundation

## Goal

Turn the architecture into a reproducible local repository that Trae and Codex
CLI can understand without rereading the original conversation.

## Included in the skeleton

- [x] pnpm workspace and package boundaries.
- [x] minimal Astro static site.
- [x] shared strategy/content contracts.
- [x] deterministic opportunity scorer with tests.
- [x] page-type-aware content Brief builder with tests.
- [x] initial tenant-aware Supabase migration and RLS.
- [x] Ita Bag development seed data.
- [x] architecture and Codex workflow documentation.

## Completed in the first working V1

### 1. Topic Graph application service

- [x] Tenant-scoped repository contract and local in-memory implementation.
- [x] Create, link, list, and cycle-safe related-topic traversal.
- [x] Cross-tenant access coverage and an industry-neutral core package.
- [x] Build-time developer view at `/studio/`.

### 2. Candidate lifecycle

- [x] Deterministic, explainable opportunity decision.
- [x] Validated candidate transitions with required reasons.
- [x] Migration-backed status history with tenant RLS.
- [x] Review is mandatory before publication.

### 3. Reviewed Astro content pipeline

- [x] Discriminated schemas for customization and guide content.
- [x] One reviewed page of each type.
- [x] Canonical URL, metadata, JSON-LD, breadcrumbs, and related links.
- [x] Static sitemap output.

### 4. Legacy ITA ATELIER storefront + Payload

- [x] Restored the full old storefront (home, gallery, collection, customize, designs, guides, content).
- [x] Removed the old Supabase/Directus runtime content paths from `apps/web`.
- [x] Imported 52 legacy content pages and 3 design concepts into Payload.
- [x] Added Payload `Designs` and legacy page/config fields.
- [x] Replaced the minimal V1 `/studio` and `/products` pages with the old storefront routes.

### 5. Payload publishing CMS

- [x] Payload 3 backend with pages, products, categories, media, and site settings.
- [x] Tenant-scoped build-time source for published pages and the product catalog.
- [x] CMS-managed site name, footer, and header navigation.
- [x] Repository content fallback for local and recovery builds.
- [x] Draft/published workflow with publish-triggered static rebuilds.
- [x] One-off importer for existing Markdown pages and legacy Directus products.
- [x] Directus + n8n customer kit split into a separate repository.

## Next implementation tasks

1. Add a Supabase-backed Topic Graph repository and integration tests against a local reset database.
2. Add authenticated reviewer commands that update candidates and create drafts without exposing a service-role key.
3. Persist reviewed graph-to-page projections instead of deriving them only from local content metadata.
4. Research, review, and add the first coherent launch cluster; do not bulk-publish thin pages.

## Explicitly deferred

Strapi, GSC OAuth, production n8n flows, visual generation, social APIs, complete
forum, billing, and advanced AI orchestration.
