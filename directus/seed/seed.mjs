// Deterministic development seed for the self-hosted Directus CMS.
//
// Usage:
//   1. Create an admin static token in Data Studio (Settings -> Access Tokens).
//   2. $env:DIRECTUS_ADMIN_TOKEN="the-token"; node directus/seed/seed.mjs
//
// Idempotent: re-running updates the same fixed-id items in place.

const baseUrl = (process.env.DIRECTUS_URL ?? 'http://localhost:8055').replace(/\/$/, '');
const token = process.env.DIRECTUS_ADMIN_TOKEN;

if (!token) {
  console.error('DIRECTUS_ADMIN_TOKEN is required. Create a static admin token in Data Studio first.');
  process.exit(1);
}

const tenantId = 'ita-bag-lab';

// ----- Site settings -----
const site = {
  id: '20000000-0000-4000-8000-000000000001',
  tenant_id: tenantId,
  status: 'published',
  site_name: 'Ita Bag Design Lab',
  footer_text: 'V1 — CMS-controlled content, human review required before publication.',
};

const navigation = [
  { id: '20000000-0000-4000-8000-000000000010', sort: 1, label: 'Custom', url: '/custom/' },
  { id: '20000000-0000-4000-8000-000000000011', sort: 2, label: 'Products', url: '/products/' },
  { id: '20000000-0000-4000-8000-000000000012', sort: 3, label: 'Guides', url: '/guides/' },
  { id: '20000000-0000-4000-8000-000000000013', sort: 4, label: 'Studio', url: '/studio/' },
].map((item) => ({
  tenant_id: tenantId,
  status: 'published',
  location: 'header',
  open_in_new_tab: false,
  ...item,
}));

// ----- Product categories -----
const categories = [
  {
    id: '20000000-0000-4000-8000-000000000300',
    tenant_id: tenantId,
    status: 'published',
    slug: 'bags',
    name: 'Ita Bags',
    description: 'Backpack, tote, and crossbody display bags designed around your collection.',
    sort: 1,
  },
  {
    id: '20000000-0000-4000-8000-000000000301',
    tenant_id: tenantId,
    status: 'published',
    slug: 'inserts',
    name: 'Inserts & Display',
    description: 'Removable inserts, window panels, and protective accessories for display arrangements.',
    sort: 2,
  },
];

// ----- Products -----
const products = [
  {
    id: '20000000-0000-4000-8000-000000000400',
    tenant_id: tenantId,
    status: 'published',
    slug: 'custom-ita-bag-backpack',
    name: 'Custom Ita Bag Backpack',
    description: 'A backpack-format display bag with a clear front window and removable insert, configured around your collection.',
    category: categories[0].id,
    price_from: '18.50',
    price_currency: 'USD',
    lead_time: '25-35 days after sample approval',
    image: '',
    features: [
      { label: 'Window area', detail: 'Up to 28 x 38 cm clear display zone on the front panel.' },
      { label: 'Insert system', detail: 'Removable padded insert keeps pin backs away from the lining.' },
      { label: 'Carrying', detail: 'Padded shoulder straps and a top handle for daily use.' },
    ],
    specs: [
      { dimension: 'Material', value: 'Nylon outer, polyester lining, PVC window' },
      { dimension: 'Capacity', value: 'Fits pins, cards, and small plush accessories' },
      { dimension: 'Closure', value: 'Two-way zipper with custom pull tab' },
    ],
    word_count: 180,
    ai_prompt: 'Write a concise product description for a custom Ita Bag backpack aimed at small-batch buyers, highlighting the display window and removable insert.',
    ai_model: 'gpt-4o',
    ai_generated_at: '2026-09-08T00:00:00Z',
    sort: 1,
  },
  {
    id: '20000000-0000-4000-8000-000000000401',
    tenant_id: tenantId,
    status: 'published',
    slug: 'removable-insert-system',
    name: 'Removable Display Insert',
    description: 'A foam-backed insert that secures pins and can be swapped between bags to change arrangements quickly.',
    category: categories[1].id,
    price_from: '4.20',
    price_currency: 'USD',
    lead_time: '15-20 days',
    image: '',
    features: [
      { label: 'Protection', detail: 'Soft foam layer prevents pin backs from scratching the bag lining.' },
      { label: 'Swapability', detail: 'Lightweight enough to move between bags in seconds.' },
      { label: 'Custom shapes', detail: 'Cut to match any window geometry.' },
    ],
    specs: [
      { dimension: 'Thickness', value: '6 mm foam with fabric face' },
      { dimension: 'Attachment', value: 'Hook-and-loop strips along the insert edge' },
      { dimension: 'Finish', value: 'Available in black, white, and custom colors' },
    ],
    sort: 2,
  },
  {
    id: '20000000-0000-4000-8000-000000000402',
    tenant_id: tenantId,
    status: 'published',
    slug: 'clear-window-panel-set',
    name: 'Clear Window Panel Set',
    description: 'Replacement clear panels for custom display configurations, including standard and shaped windows.',
    category: categories[1].id,
    price_from: '2.80',
    price_currency: 'USD',
    lead_time: '10-15 days',
    image: '',
    features: [
      { label: 'Clarity', detail: 'Glossy PVC panel with high optical transparency.' },
      { label: 'Shapes', detail: 'Rectangular, heart, star, and custom outline options.' },
      { label: 'Reinforced edge', detail: 'Welded seam prevents panel separation under load.' },
    ],
    specs: [
      { dimension: 'Thickness', value: '0.5 mm food-grade PVC' },
      { dimension: 'Sizing', value: 'Custom dimensions to the nearest mm' },
      { dimension: 'Compatibility', value: 'Fits all standard ita bag formats' },
    ],
    sort: 3,
  },
];

// ----- Pages -----
// Customization page migrated from local Markdown.
const customizationPage = {
  id: '20000000-0000-4000-8000-000000000101',
  tenant_id: tenantId,
  status: 'published',
  path: '/custom/custom-ita-bag-design/',
  page_type: 'customization',
  title: 'Custom Ita Bag Design Options for Small-Batch Projects',
  seo_title: 'Custom Ita Bag Design Options',
  description: 'Plan a custom Ita Bag with practical choices for bag format, display window, insert, materials, artwork, sampling, and production review.',
  eyebrow: 'Customization',
  lead: 'Turn display needs, bag format, materials, and production constraints into a decision-ready brief.',
  primary_topic: 'Custom Ita Bag design',
  topic_id: 'custom-ita-bag-design',
  related_topic_ids: ['ita-bag-design-guide'],
  published_at: '2026-09-08T00:00:00Z',
  noindex: false,
  target_keyword: 'custom ita bag design',
  word_count: 420,
  reading_time_minutes: 3,
  ai_prompt: 'Write a practical customization guide for small-batch Ita Bag production, covering format choice, specification, sampling, and inquiry preparation.',
  ai_model: 'gpt-4o',
  ai_generated_at: '2026-09-08T00:00:00Z',
  internal_links: [
    { path: '/guides/how-to-design-an-ita-bag/', label: 'How to design an Ita Bag' },
    { path: '/products/custom-ita-bag-backpack/', label: 'Custom Ita Bag Backpack' },
  ],
};

const customizationBlocks = [
  {
    id: '20000000-0000-4000-8000-000000000500',
    tenant_id: tenantId, sort: 1, page: customizationPage.id,
    block_type: 'text',
    body: '<p>An effective custom Ita Bag starts with the display collection, not a list of decorative options. Pin size, photocard sleeves, plush accessories, and the way the bag will be carried determine the useful window area, insert construction, and overall bag format.</p>',
  },
  {
    id: '20000000-0000-4000-8000-000000000501',
    tenant_id: tenantId, sort: 2, page: customizationPage.id,
    block_type: 'options',
    items: [
      { label: 'Bag format', detail: 'Backpack, tote, crossbody, and compact formats suit different display areas and carrying loads.' },
      { label: 'Display window', detail: 'Window shape and usable dimensions should follow the collection you actually plan to display.' },
      { label: 'Insert system', detail: 'A removable insert keeps pins away from the main lining and makes arrangements easier to change.' },
      { label: 'Exterior details', detail: 'Color, print, embroidery, webbing, zipper, and hardware choices should be reviewed as one coordinated system.' },
    ],
  },
  {
    id: '20000000-0000-4000-8000-000000000502',
    tenant_id: tenantId, sort: 3, page: customizationPage.id,
    block_type: 'heading',
    heading: 'Choose the product architecture first',
  },
  {
    id: '20000000-0000-4000-8000-000000000503',
    tenant_id: tenantId, sort: 4, page: customizationPage.id,
    block_type: 'text',
    body: '<p>Decide whether the project needs a backpack, tote, crossbody, or compact bag. Then map the display zone and storage zone separately. A larger clear panel can improve visibility, but it also changes structure, privacy, weight distribution, and the space left for everyday storage.</p>',
  },
  {
    id: '20000000-0000-4000-8000-000000000504',
    tenant_id: tenantId, sort: 5, page: customizationPage.id,
    block_type: 'steps',
    items: [
      { name: 'Define scope', text: 'Define users, display items, target quantity, budget range, and delivery window.' },
      { name: 'Confirm specification', text: 'Confirm dimensions, materials, artwork files, construction details, and packaging requirements.' },
      { name: 'Review sample', text: 'Review a sample for appearance, fit, usability, and workmanship before approving production.' },
    ],
  },
  {
    id: '20000000-0000-4000-8000-000000000505',
    tenant_id: tenantId, sort: 6, page: customizationPage.id,
    block_type: 'cta',
    heading: 'Start your project brief',
    body: '<p>Send a concise brief with reference images, annotated dimensions, artwork files, target quantity, destination, and required date.</p>',
    cta_label: 'Request a quotation',
    cta_url: '/custom/',
  },
];

// Guide page migrated from local Markdown.
const guidePage = {
  id: '20000000-0000-4000-8000-000000000102',
  tenant_id: tenantId,
  status: 'published',
  path: '/guides/how-to-design-an-ita-bag/',
  page_type: 'guide',
  title: 'How to Design an Ita Bag: A Practical Planning Guide',
  seo_title: 'How to Design an Ita Bag',
  description: 'Learn how to plan an Ita Bag around your collection, choose the bag and display layout, protect items, prototype the arrangement, and prepare a clear brief.',
  eyebrow: 'Guides',
  lead: 'Focused guidance for turning a collection idea into a practical display and carrying system.',
  primary_topic: 'How to design an Ita Bag',
  topic_id: 'ita-bag-design-guide',
  related_topic_ids: ['custom-ita-bag-design'],
  published_at: '2026-09-08T00:00:00Z',
  noindex: false,
  target_keyword: 'how to design an ita bag',
  word_count: 510,
  reading_time_minutes: 4,
  ai_prompt: 'Write a step-by-step guide for designing an Ita Bag, starting from the collection and ending with a production-ready brief.',
  ai_model: 'gpt-4o',
  ai_generated_at: '2026-09-08T00:00:00Z',
  internal_links: [
    { path: '/custom/custom-ita-bag-design/', label: 'Custom Ita Bag design options' },
  ],
};

const guideBlocks = [
  {
    id: '20000000-0000-4000-8000-000000000600',
    tenant_id: tenantId, sort: 1, page: guidePage.id,
    block_type: 'steps',
    items: [
      { name: 'Inventory the collection', text: 'Measure the pins, cards, keychains, or plush pieces you want to display and choose the priority items.' },
      { name: 'Select the bag format', text: 'Match carrying style, storage needs, and expected load before deciding the window size.' },
      { name: 'Plan the display zone', text: 'Arrange full-size paper templates with safe spacing for pin backs, chains, and visual balance.' },
      { name: 'Prototype and review', text: 'Test the insert inside the actual bag, load the collection, and revise access, comfort, and stability.' },
    ],
  },
  {
    id: '20000000-0000-4000-8000-000000000601',
    tenant_id: tenantId, sort: 2, page: guidePage.id,
    block_type: 'heading',
    heading: '1. Measure what you want to display',
  },
  {
    id: '20000000-0000-4000-8000-000000000602',
    tenant_id: tenantId, sort: 3, page: guidePage.id,
    block_type: 'text',
    body: '<p>List the pieces that must fit and measure their real outer dimensions. Include pin backs, chains, sleeves, ribbons, and any clearance needed between objects. If the collection rotates, define a typical arrangement rather than trying to fit every item at once.</p>',
  },
  {
    id: '20000000-0000-4000-8000-000000000603',
    tenant_id: tenantId, sort: 4, page: guidePage.id,
    block_type: 'heading',
    heading: '2. Choose the carrying format',
  },
  {
    id: '20000000-0000-4000-8000-000000000604',
    tenant_id: tenantId, sort: 5, page: guidePage.id,
    block_type: 'text',
    body: '<p>A backpack distributes a larger load differently from a tote or crossbody bag. Think about travel, daily storage, opening access, strap adjustment, and how the display faces outward while carried.</p>',
  },
  {
    id: '20000000-0000-4000-8000-000000000605',
    tenant_id: tenantId, sort: 6, page: guidePage.id,
    block_type: 'heading',
    heading: '3. Prototype the composition',
  },
  {
    id: '20000000-0000-4000-8000-000000000606',
    tenant_id: tenantId, sort: 7, page: guidePage.id,
    block_type: 'text',
    body: '<p>Cut a paper rectangle to the usable insert size and arrange the real objects or paper outlines on it. Leave room around edges and closures. Photograph promising layouts so you can compare dense, symmetrical, color-led, and focal-point compositions.</p>',
  },
  {
    id: '20000000-0000-4000-8000-000000000607',
    tenant_id: tenantId, sort: 8, page: guidePage.id,
    block_type: 'heading',
    heading: '4. Protect and secure the collection',
  },
  {
    id: '20000000-0000-4000-8000-000000000608',
    tenant_id: tenantId, sort: 9, page: guidePage.id,
    block_type: 'text',
    body: '<p>Use an insert that is suitable for the attachment method and can be removed without stressing the bag. Check sharp pin backs, loose chains, friction between objects, and pressure against the clear panel.</p>',
  },
  {
    id: '20000000-0000-4000-8000-000000000609',
    tenant_id: tenantId, sort: 10, page: guidePage.id,
    block_type: 'heading',
    heading: '5. Test before finalizing',
  },
  {
    id: '20000000-0000-4000-8000-000000000610',
    tenant_id: tenantId, sort: 11, page: guidePage.id,
    block_type: 'text',
    body: '<p>Load the bag with the items you normally carry, walk with it, open each compartment, and inspect the display after use. For a custom production project, turn the successful prototype into an annotated brief and review a physical sample before approving quantity production.</p>',
  },
  {
    id: '20000000-0000-4000-8000-000000000611',
    tenant_id: tenantId, sort: 12, page: guidePage.id,
    block_type: 'cta',
    heading: 'Plan a custom production run',
    body: '<p>When your prototype works, move to the customization brief to define materials, quantities, and sampling.</p>',
    cta_label: 'Customization options',
    cta_url: '/custom/custom-ita-bag-design/',
  },
];

// CMS verification page.
const fromCmsPage = {
  id: '20000000-0000-4000-8000-000000000100',
  tenant_id: tenantId,
  status: 'published',
  path: '/guides/from-cms/',
  page_type: 'guide',
  title: 'A CMS-controlled guide rendered from structured blocks',
  seo_title: 'Structured CMS Block Guide',
  description: 'Verify that the publishing backend controls page structure, JSON-LD, FAQ entries, and calls to action through typed content blocks.',
  eyebrow: 'CMS verification',
  lead: 'Every section of this page is a structured block authored in Directus rather than a single free-form HTML field.',
  primary_topic: 'Directus structured blocks',
  topic_id: 'cms-blocks',
  related_topic_ids: ['cms-blocks'],
  published_at: '2026-10-02T00:00:00Z',
  noindex: false,
};

const fromCmsBlocks = [
  {
    id: '20000000-0000-4000-8000-000000000200',
    tenant_id: tenantId, sort: 1, page: fromCmsPage.id,
    block_type: 'heading',
    heading: 'How block control works',
  },
  {
    id: '20000000-0000-4000-8000-000000000201',
    tenant_id: tenantId, sort: 2, page: fromCmsPage.id,
    block_type: 'text',
    body: '<p>The build reads only published pages, then maps each typed block to a dedicated page component and its structured-data entry.</p>',
  },
  {
    id: '20000000-0000-4000-8000-000000000202',
    tenant_id: tenantId, sort: 3, page: fromCmsPage.id,
    block_type: 'steps',
    items: [
      { name: 'Author', text: 'Create typed blocks in Directus.' },
      { name: 'Review', text: 'Move the page through review before publishing.' },
      { name: 'Build', text: 'Astro renders blocks and JSON-LD at build time.' },
    ],
  },
  {
    id: '20000000-0000-4000-8000-000000000203',
    tenant_id: tenantId, sort: 4, page: fromCmsPage.id,
    block_type: 'faq',
    items: [
      { question: 'Can a draft page reach the public site?', answer: 'No. The build filter only accepts the published status.' },
      { question: 'Where do structured blocks live?', answer: 'In the cms_blocks collection, owned by a cms_pages item.' },
    ],
  },
  {
    id: '20000000-0000-4000-8000-000000000204',
    tenant_id: tenantId, sort: 5, page: fromCmsPage.id,
    block_type: 'cta',
    heading: 'See the developer loop',
    body: '<p>The studio page demonstrates the underlying SEO workflow.</p>',
    cta_label: 'Open Studio',
    cta_url: '/studio/',
  },
];

async function request(path, options) {
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

async function upsert(collection, item) {
  const { id } = item;
  try {
    await request(`/items/${collection}/${id}`, { method: 'PATCH', body: JSON.stringify(item) });
    console.log(`updated ${collection}/${id}`);
  } catch (error) {
    if (!String(error).includes('403') && !String(error).includes('404')) throw error;
    await request(`/items/${collection}`, { method: 'POST', body: JSON.stringify(item) });
    console.log(`created ${collection}/${id}`);
  }
}

await upsert('cms_sites', site);
for (const item of navigation) await upsert('cms_navigation', item);
for (const item of categories) await upsert('cms_product_categories', item);
for (const item of products) await upsert('cms_products', item);
for (const item of [customizationPage, guidePage, fromCmsPage]) await upsert('cms_pages', item);
for (const item of [...customizationBlocks, ...guideBlocks, ...fromCmsBlocks]) await upsert('cms_blocks', item);
console.log('Seed complete.');
