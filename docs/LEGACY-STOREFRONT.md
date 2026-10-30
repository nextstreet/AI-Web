# Legacy ITA ATELIER storefront (integrated 2026-10-30)

The public site is the old ITA ATELIER storefront, now rendered by `apps/web`
and backed only by Payload.

## Routes

- `/` — home
- `/gallery` — design gallery / voting UI (votes stay in localStorage)
- `/collection` — concept collection
- `/designs/:slug` — concept detail
- `/customize` — design brief builder (saved in localStorage, downloadable)
- `/guides` — content index
- `/content/:slug` — 52 legacy content pages imported from Supabase
- `/custom/:path` and `/guides/:path` — two reviewed Markdown pages
- `/admin` — Payload admin (Caddy proxies to `:3000` in production)

## Content model

- `SiteSettings.legacyConfig` — full old site config JSON (brand, navigation,
  theme, home copy, catalog). Empty uses the defaults in `apps/web/src/lib`.
- `Pages` — legacy content pages; `legacyBody` stores the original
  `{heading, paragraphs, bullets}[]` sections.
- `Designs` — gallery/design concepts and vote totals.

## Data import

`apps/cms/seed/legacy-site.json` is a one-off export from the retired Supabase
project (`content_pages` + `design_concepts`). It is imported with:

```bash
pnpm cms:import
```

The website runtime never reads Supabase or Directus.

## Source history

The storefront source is also preserved on the `codex/configurable-ita-storefront`
branch. The restored production build from 2026-10-12 is kept outside the repo
under `/home/ubuntu/ai-seo-saas/legacy/ita-atelier`.
