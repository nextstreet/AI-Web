# Web

Static-first Astro delivery layer for crawlable pages, metadata, Schema,
internal links, and later lightweight interactive Islands. Keep SEO scoring and
secret-bearing database operations outside this package.

The site loads tenant-scoped, published pages, products, categories, and site
chrome from Payload at build time (`PAYLOAD_URL`). Without Payload configuration
it falls back to reviewed Markdown through a typed Content Collection. Both
paths render canonical URLs, JSON-LD, breadcrumbs, and related links. `/studio/`
is a deterministic build-time developer view; it is not an administrative
publishing endpoint.

The Payload content model lives in `../cms`. The Directus-based client delivery
kit is a separate project under `../../client-kit` and must not be wired back
into this package.
