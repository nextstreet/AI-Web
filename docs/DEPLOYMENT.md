# Deployment (current server)

Live host: `https://seo.cybertao.space`

## Layout

| Item | Path / value |
| --- | --- |
| App checkout | `/home/ubuntu/ai-web` |
| Payload env | `/home/ubuntu/ai-web/apps/cms/.env` (mode 600) |
| Admin/import env | `/home/ubuntu/ai-web/.env` (mode 600) |
| SQLite database | `/home/ubuntu/ai-web/apps/cms/payload.db` |
| Node runtime | `/opt/node-22.23.4/bin/node` (Astro 7 requires >= 22.23.4) |

## Services

| Service | Port | Command |
| --- | --- | --- |
| `ai-web-cms.service` | `127.0.0.1:3010` | `next start -H 127.0.0.1 -p 3010` |
| `ai-web.service` | `127.0.0.1:4322` | `node dist/server/entry.mjs` |

Port `3000` is already used by another service on this host, hence Payload uses
`3010`.

## Caddy routes

```text
seo.cybertao.space
  /admin*   -> 127.0.0.1:3010   (Payload admin)
  /api*     -> 127.0.0.1:3010   (Payload REST)
  /media*   -> 127.0.0.1:3010   (Payload uploads)
  /_next*   -> 127.0.0.1:3010   (Payload admin assets)
  /*        -> 127.0.0.1:4322   (Astro SSR)
```

Astro reads Payload on each request, so publishing content does not require a
rebuild.

## Deploy an update

```bash
cd /home/ubuntu/ai-web
git pull --ff-only
PATH=/opt/node-22.23.4/bin:$PATH pnpm install --frozen-lockfile
PATH=/opt/node-22.23.4/bin:$PATH PUBLIC_SITE_URL=https://seo.cybertao.space \
  pnpm --filter @ai-seo/web build
PATH=/opt/node-22.23.4/bin:$PATH pnpm --filter @ai-seo/cms build
sudo systemctl restart ai-web-cms ai-web
```

## Rollback

The previous storefront runs from `/home/ubuntu/ai-seo-saas/legacy/ita-atelier`
and is installed as `ai-seo-saas-legacy.service` (currently disabled).

```bash
sudo systemctl stop ai-web ai-web-cms
sudo systemctl start ai-seo-saas-legacy
sudo cp /etc/caddy/Caddyfile.bak-20261030-aiweb /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy backup before the cutover: `/etc/caddy/Caddyfile.bak-20261030-aiweb`.

## Admin credentials

The Payload admin account and rotating import credentials live in
`/home/ubuntu/ai-web/.env`; never commit that file.
