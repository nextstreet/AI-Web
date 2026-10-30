#!/usr/bin/env node
/**
 * One-off export from the retired Supabase project into the website repo's
 * Payload seed fixture. The website runtime never talks to Supabase.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/export-legacy.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!url || !key) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const headers = { apikey: key, authorization: `Bearer ${key}` };

async function get(pathname) {
  const response = await fetch(`${url}/rest/v1/${pathname}`, { headers });
  if (!response.ok) throw new Error(`${pathname} -> ${response.status} ${await response.text()}`);
  return response.json();
}

const pageTypeMap = {
  product: 'product',
  intent_guide: 'guide',
  material_guide: 'material',
  design_inspiration: 'design_inspiration',
  comparison: 'comparison',
  gallery: 'gallery',
  community_topic: 'community_topic',
};

const pages = (await get('content_pages?select=*&status=eq.published&order=published_at.asc'))
  .map((row) => ({
    slug: row.slug,
    path: `/content/${row.slug}/`,
    title: row.title,
    pageType: pageTypeMap[row.page_type] || 'guide',
    excerpt: row.meta_description || '',
    legacyHeroSummary: row.hero_summary || '',
    legacyPrimaryKeyword: row.primary_keyword || '',
    legacyBody: Array.isArray(row.body) ? row.body : [],
    legacyInternalLinks: Array.isArray(row.internal_links) ? row.internal_links : [],
    publishedAt: row.published_at || row.updated_at || '',
    sourceUpdatedAt: row.updated_at || '',
  }));

const designs = (await get('design_concepts?select=*&order=created_at.asc')).map((row) => {
  const attributes = row.attributes && typeof row.attributes === 'object' ? row.attributes : {};
  return {
    name: row.name,
    slug: row.slug,
    status: ['voting', 'winner', 'sampling', 'produced'].includes(row.status) ? 'published' : 'draft',
    description: row.description || '',
    imageUrl: attributes.imageUrl || attributes.image_url || '/images/campaign.webp',
    tags: Array.isArray(attributes.tags) ? attributes.tags.map((tag) => ({ tag: String(tag) })) : [],
    votesCount: 0,
  };
});

const votes = await get('votes?select=design_concept_id');
const voteCounts = new Map();
for (const vote of votes) voteCounts.set(vote.design_concept_id, (voteCounts.get(vote.design_concept_id) || 0) + 1);
const designRows = await get('design_concepts?select=id,slug');
const bySlug = new Map(designRows.map((row) => [row.id, row.slug]));
for (const design of designs) {
  const row = designRows.find((item) => item.slug === design.slug);
  design.votesCount = row ? voteCounts.get(row.id) || 0 : 0;
}

const fixture = {
  exportedAt: new Date().toISOString(),
  source: 'supabase:content_pages + design_concepts',
  pages,
  designs,
};

const out = path.join(process.cwd(), 'apps/cms/seed/legacy-site.json');
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(fixture, null, 2)}\n`);
console.log(`Wrote ${out}: ${pages.length} pages, ${designs.length} designs`);
