// Deterministic development seed for the client-kit Directus operator console.
//
// Usage:
//   1. Create an admin static token in Data Studio (Settings -> Access Tokens).
//   2. DIRECTUS_ADMIN_TOKEN="the-token" node client-kit/directus/seed/seed.mjs
//   3. Add --dry-run to preview create/update decisions without writing.
//
// Idempotent: every record is matched by its natural key (tenant slug,
// candidate external_id, deliverable external_key, run execution_id), so
// re-running updates the same rows instead of duplicating them.

const baseUrl = (process.env.DIRECTUS_URL ?? 'http://localhost:8055').replace(/\/$/, '');
const token = process.env.DIRECTUS_ADMIN_TOKEN;
const dryRun = process.argv.includes('--dry-run');

if (!token) {
  console.error('DIRECTUS_ADMIN_TOKEN is required. Create a static admin token in Data Studio first.');
  process.exit(1);
}

const tenant = {
  id: '30000000-0000-4000-8000-000000000001',
  name: 'Ita Bag Lab',
  slug: 'ita-bag-lab',
  wp_base_url: 'https://example.com',
  environment: 'staging',
  credential_ref: 'wp-ita-bag-lab',
  locale: 'en',
  market: 'US / EU',
  brand_voice: 'Practical, specific, no hype. Prefer measurements and production constraints over adjectives.',
  seo_plugin: 'yoast',
  publish_policy: 'draft_only',
  enabled: true,
  notes: 'Demo tenant. Replace wp_base_url, credential_ref and seo_plugin with the real client values.',
};

const candidateRows = [
  {
    id: '31000000-0000-4000-8000-000000000001',
    external_id: 'b0000000-0000-4000-8000-000000000001',
    query: 'how to choose ita bag insert size',
    intent: 'informational',
    page_type: 'guide',
    channel: 'seo',
    action: 'CREATE',
    score: 86,
    reason: '站点缺少尺寸指南，查询意图明确且能自然导向产品页。',
    status: 'new',
    discovered_at: '2026-10-20T02:00:00Z',
    last_synced_at: '2026-10-22T02:00:00Z',
  },
  {
    id: '31000000-0000-4000-8000-000000000002',
    external_id: 'b0000000-0000-4000-8000-000000000002',
    query: 'ita bag vs backpack',
    intent: 'commercial_investigation',
    page_type: 'comparison',
    channel: 'seo',
    action: 'CREATE',
    score: 74,
    reason: '对比型搜索可覆盖新客，但需避免与现有背包文章重复。',
    status: 'new',
    discovered_at: '2026-10-20T02:05:00Z',
    last_synced_at: '2026-10-22T02:00:00Z',
  },
  {
    id: '31000000-0000-4000-8000-000000000003',
    external_id: 'b0000000-0000-4000-8000-000000000003',
    query: 'custom ita bag manufacturer',
    intent: 'transactional',
    page_type: 'commercial',
    channel: 'sem_google',
    action: 'CREATE',
    score: 81,
    reason: '高购买意图查询适合搜索广告承接，落地页需与定制产品页一致。',
    status: 'new',
    discovered_at: '2026-10-21T02:00:00Z',
    last_synced_at: '2026-10-22T02:00:00Z',
  },
  {
    id: '31000000-0000-4000-8000-000000000004',
    external_id: 'b0000000-0000-4000-8000-000000000004',
    query: 'ita bag convention setup ideas',
    intent: 'inspirational',
    page_type: 'community_topic',
    channel: 'social_meta',
    action: 'CREATE',
    score: 68,
    reason: '展会季话题适合社媒传播，可导流到尺寸指南与产品页。',
    status: 'new',
    discovered_at: '2026-10-21T02:10:00Z',
    last_synced_at: '2026-10-22T02:00:00Z',
  },
].map((row) => ({ ...row, tenant: tenant.id }));

const deliverableRows = [
  {
    id: '32000000-0000-4000-8000-000000000001',
    external_key: 'ita-bag-lab:article:insert-size-guide',
    candidate: candidateRows[0].id,
    kind: 'article',
    status: 'ready',
    title: 'How to Choose the Right Ita Bag Insert Size',
    slug: 'ita-bag-insert-size-guide',
    excerpt:
      'Measure the collection, the window, and the bag opening before choosing an insert size. A short guide with a practical measuring sequence.',
    body_md: [
      '## Start with the collection, not the bag',
      '',
      'Measure the outer dimensions of the pins, cards, and plush pieces you actually plan to display. Add clearance for pin backs, chains, and sleeves.',
      '',
      '## Measure the usable window',
      '',
      'Use the inner opening, not the outer panel. Leave at least 10 mm between the insert edge and the seam.',
      '',
      '## Check the bag opening',
      '',
      'The insert must pass through the opening without bending. If it does not, split the insert into two panels.',
    ].join('\n'),
    seo_title: 'How to Choose an Ita Bag Insert Size',
    seo_description:
      'A practical measuring sequence for choosing an ita bag insert size: collection dimensions, usable window area, and bag opening clearance.',
    keywords: ['ita bag insert size', 'ita bag dimensions', 'ita bag insert'],
    canonical_url: '',
    target_post_type: 'post',
    target_categories: ['Guides'],
    target_tags: ['ita bag', 'sizing'],
    featured_image_url: '',
    ai_model: 'gpt-5',
    ai_run_id: 'run-demo-001',
  },
  {
    id: '32000000-0000-4000-8000-000000000002',
    external_key: 'ita-bag-lab:product:sakura-panel-bag',
    candidate: null,
    kind: 'product',
    status: 'planned',
    title: 'Sakura Panel Ita Bag',
    slug: 'sakura-panel-ita-bag',
    excerpt: 'A compact crossbody ita bag with a shaped clear panel and a removable insert.',
    body_md: [
      '## Overview',
      '',
      'A compact crossbody format built around a shaped display window. The removable insert keeps pin backs away from the lining.',
      '',
      '## Specification',
      '',
      '- Window: 18 x 24 cm shaped panel',
      '- Material: nylon outer, polyester lining, 0.5 mm PVC window',
      '- Insert: 6 mm foam with hook-and-loop attachment',
    ].join('\n'),
    seo_title: 'Sakura Panel Ita Bag',
    seo_description:
      'Compact crossbody ita bag with a shaped clear panel, removable foam insert, and custom color options.',
    keywords: ['sakura ita bag', 'crossbody ita bag'],
    target_post_type: 'product',
    target_categories: ['Ita Bags'],
    target_tags: ['ita bag', 'crossbody'],
    featured_image_url: '',
    payload: {
      sku: 'ITA-SAKURA-01',
      price: '32.00',
      currency: 'USD',
      stock_status: 'instock',
      attributes: {
        Color: ['Sakura pink', 'Ink black'],
        Panel: ['Heart', 'Rectangle'],
      },
    },
    ai_model: 'gpt-5',
    ai_run_id: 'run-demo-002',
  },
].map((row) => ({ ...row, tenant: tenant.id }));

const runRows = [
  {
    id: '33000000-0000-4000-8000-000000000001',
    tenant: tenant.id,
    deliverable: deliverableRows[0].id,
    workflow: 'candidate-to-deliverable',
    execution_id: 'demo-exec-001',
    status: 'success',
    started_at: '2026-10-22T02:10:00Z',
    finished_at: '2026-10-22T02:11:20Z',
    payload_summary: { candidates: 2, deliverables: 1, model: 'gpt-5' },
  },
];

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...options,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${options.method ?? 'GET'} ${path} -> ${response.status}: ${detail}`);
  }
  return response.status === 204 ? null : response.json();
}

async function upsertBy(collection, keyField, keyValue, item) {
  const query = `/items/${collection}?filter[${keyField}][_eq]=${encodeURIComponent(keyValue)}&limit=1`;
  const existing = await request(query);
  const current = existing.data?.[0];

  if (current) {
    if (dryRun) {
      console.log(`[dry-run] update ${collection}/${current.id} (${keyField}=${keyValue})`);
      return current.id;
    }
    const { id: _id, ...patch } = item;
    await request(`/items/${collection}/${current.id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    console.log(`updated ${collection}/${current.id} (${keyField}=${keyValue})`);
    return current.id;
  }

  if (dryRun) {
    console.log(`[dry-run] create ${collection}/${item.id} (${keyField}=${keyValue})`);
    return item.id;
  }
  await request(`/items/${collection}`, { method: 'POST', body: JSON.stringify(item) });
  console.log(`created ${collection}/${item.id} (${keyField}=${keyValue})`);
  return item.id;
}

await upsertBy('tenants', 'slug', tenant.slug, tenant);
for (const row of candidateRows) await upsertBy('candidates', 'external_id', row.external_id, row);
for (const row of deliverableRows) await upsertBy('deliverables', 'external_key', row.external_key, row);
for (const row of runRows) await upsertBy('runs', 'execution_id', row.execution_id, row);

console.log(
  dryRun
    ? 'Dry run complete. No records were written.'
    : 'Seed complete: 1 tenant, 4 candidates, 2 deliverables, 1 run.',
);
