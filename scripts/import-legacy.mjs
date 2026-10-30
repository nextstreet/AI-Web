#!/usr/bin/env node
/** Import the exported Supabase fixture into Payload (pages + designs). */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const base = (process.env.PAYLOAD_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const email = process.env.PAYLOAD_ADMIN_EMAIL;
const password = process.env.PAYLOAD_ADMIN_PASSWORD;
if (!email || !password) {
  console.error('Missing PAYLOAD_ADMIN_EMAIL / PAYLOAD_ADMIN_PASSWORD');
  process.exit(1);
}

let token = '';
async function request(pathname, { method = 'GET', body, auth = true } = {}) {
  const response = await fetch(`${base}${pathname}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(auth && token ? { authorization: `JWT ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  let payload;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
  if (!response.ok) {
    throw new Error(`${method} ${pathname} -> ${response.status}: ${typeof payload === 'string' ? payload : JSON.stringify(payload)}`);
  }
  return payload;
}

async function authenticate() {
  try {
    token = (await request('/api/users/login', { method: 'POST', auth: false, body: { email, password } })).token;
  } catch {
    token = (await request('/api/users/first-register', {
      method: 'POST', auth: false, body: { email, password, name: 'Owner', role: 'admin' },
    })).token;
  }
  if (!token) throw new Error('No Payload token returned');
}

async function upsert(collection, field, value, data) {
  const query = new URLSearchParams({ [`where[${field}][equals]`]: value, limit: '1', depth: '0', draft: 'true' });
  const existing = (await request(`/api/${collection}?${query}`)).docs?.[0];
  if (existing) {
    const result = await request(`/api/${collection}/${existing.id}`, { method: 'PATCH', body: data });
    return { id: result.doc?.id || existing.id, created: false };
  }
  const result = await request(`/api/${collection}`, { method: 'POST', body: data });
  return { id: result.doc?.id, created: true };
}

const fixture = JSON.parse(readFileSync(path.join(process.cwd(), 'apps/cms/seed/legacy-site.json'), 'utf8'));

await authenticate();

console.log('Importing site settings');
await request('/api/globals/site-settings', {
  method: 'POST',
  body: {
    brandName: 'ITA ATELIER',
    tagline: 'Custom ita bag concepts shaped around the things people collect.',
    footerText: 'Concept collection · Production details to be confirmed',
    nav: [
      { label: 'The bags', href: '/collection' },
      { label: 'Create', href: '/customize' },
      { label: 'Design studio', href: '/gallery' },
      { label: 'Field notes', href: '/guides' },
    ],
  },
});

console.log(`Importing ${fixture.pages.length} pages`);
let pagesCreated = 0;
for (const page of fixture.pages) {
  const data = {
    title: page.title,
    slug: page.slug,
    path: page.path,
    pageType: page.pageType,
    excerpt: page.excerpt,
    legacyHeroSummary: page.legacyHeroSummary,
    legacyPrimaryKeyword: page.legacyPrimaryKeyword,
    legacyBody: page.legacyBody,
    legacyInternalLinks: page.legacyInternalLinks,
    _status: 'published',
  };
  const result = await upsert('pages', 'slug', page.slug, data);
  if (result.created) pagesCreated += 1;
}
console.log(`  pages created: ${pagesCreated}`);

console.log(`Importing ${fixture.designs.length} designs`);
for (const design of fixture.designs) {
  await upsert('designs', 'slug', design.slug, design);
}

console.log('Done');
