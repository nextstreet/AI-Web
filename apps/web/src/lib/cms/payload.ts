import {
  cmsProductCategorySchema,
  cmsProductSchema,
  pageTypeSchema,
  type CmsBlock,
  type CmsProduct as SharedCmsProduct,
  type CmsProductCategory as SharedCmsProductCategory,
  type PageType,
} from '@ai-seo/shared';

import { lexicalToHtml } from './lexical';

export type CmsProductCategory = SharedCmsProductCategory;

/** Payload 产品「展现形式」区块，仅在站点渲染时使用 */
export type CmsProductPresentationBlock =
  | { blockType: 'richText'; html: string }
  | { blockType: 'imageText'; heading?: string; body?: string; image?: string; imagePosition: 'left' | 'right' }
  | { blockType: 'specTable'; title?: string; rows: { label: string; value: string }[] }
  | { blockType: 'sizeGuide'; title?: string; notes?: string; image?: string }
  | { blockType: 'comparison'; title?: string; items: { title: string; text?: string }[] }
  | { blockType: 'faq'; title?: string; items: { question: string; answer: string }[] }
  | { blockType: 'cta'; heading?: string; body?: string; buttonLabel?: string; buttonHref?: string };

export type CmsProduct = SharedCmsProduct & {
  gallery: string[];
  variants: { name: string; options: string[] }[];
  presentation: CmsProductPresentationBlock[];
};

export type CmsInternalLink = { path: string; label: string };

export type CmsPage = {
  id: string;
  tenantId: string;
  path: string;
  pageType: PageType;
  title: string;
  seoTitle?: string;
  description: string;
  eyebrow?: string;
  lead?: string;
  bodyHtml: string;
  blocks: CmsBlock[];
  primaryTopic?: string;
  topicId?: string;
  relatedTopicIds: string[];
  publishedAt?: string;
  updatedAt?: string;
  noIndex: boolean;
  canonicalUrl?: string;
  ogImage?: string;
  twitterCard?: string;
  robots?: string;
  jsonLdOverride?: Record<string, unknown>;
  wordCount?: number;
  readingTimeMinutes?: number;
  aiPrompt?: string;
  aiModel?: string;
  aiGeneratedAt?: string;
  targetKeyword?: string;
  internalLinks: CmsInternalLink[];
};

export type CmsNavigationItem = {
  id: string;
  label: string;
  url: string;
  openInNewTab: boolean;
};

export type CmsSite = {
  siteName: string;
  footerText: string;
};

const endpoint = import.meta.env.PAYLOAD_URL?.replace(/\/$/, '');
const locale = import.meta.env.PAYLOAD_LOCALE?.trim() || 'en';
const tenantId = import.meta.env.PAYLOAD_TENANT_ID?.trim() || 'ita-bag-lab';

const defaultNavigation: CmsNavigationItem[] = [
  { id: 'custom', label: 'Custom', url: '/custom/', openInNewTab: false },
  { id: 'products', label: 'Products', url: '/products/', openInNewTab: false },
  { id: 'guides', label: 'Guides', url: '/guides/', openInNewTab: false },
];

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function requiredString(item: Record<string, unknown>, field: string, collection: string): string {
  const value = optionalString(item[field]);
  if (!value) throw new Error(`Payload ${collection} item is missing required field "${field}".`);
  return value;
}

function normalizePath(value: string): string {
  const path = value.trim();
  if (!path.startsWith('/') || path.includes('?') || path.includes('#')) {
    throw new Error(`Payload page path must be an absolute site path without query or hash: ${value}`);
  }
  return path === '/' ? path : `${path.replace(/\/+$/, '')}/`;
}

function recordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.map(asRecord).filter((item): item is Record<string, unknown> => item !== null)
    : [];
}

function mediaUrl(value: unknown): string | undefined {
  const media = asRecord(value);
  const url = optionalString(media?.url);
  if (!url) return undefined;
  if (/^https?:\/\//.test(url)) return url;
  return endpoint ? `${endpoint}${url}` : url;
}

function parsePrice(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return undefined;
  const cleaned = value.replace(/[^0-9.]/g, '');
  if (!cleaned) return undefined;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

async function request<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  if (!endpoint) throw new Error('Payload CMS is not configured. Set PAYLOAD_URL or remove it entirely.');
  const url = new URL(`${endpoint}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) {
    throw new Error(`Payload request ${path} failed with ${response.status} ${response.statusText}.`);
  }
  return await response.json() as T;
}

let pagesPromise: Promise<CmsPage[]> | undefined;
let navigationPromise: Promise<CmsNavigationItem[]> | undefined;
let sitePromise: Promise<CmsSite | null> | undefined;
let productsPromise: Promise<CmsProduct[]> | undefined;
let categoriesPromise: Promise<CmsProductCategory[]> | undefined;

async function loadPages(): Promise<CmsPage[]> {
  const response = await request<{ docs?: unknown[] }>('/api/pages', {
    'where[_status][equals]': 'published',
    locale,
    depth: '1',
    sort: 'path',
    limit: '500',
  });

  const pages = (response.docs ?? []).map((value): CmsPage => {
    const doc = asRecord(value);
    if (!doc) throw new Error('Payload pages returned a non-object item.');

    const seo = asRecord(doc.seo) ?? {};
    const ai = asRecord(doc.ai) ?? {};
    const faq = recordArray(doc.faq)
      .map((item) => ({
        question: requiredString(item, 'question', 'pages.faq'),
        answer: requiredString(item, 'answer', 'pages.faq'),
      }));
    const keywords = recordArray(seo.keywords)
      .map((item) => optionalString(item.keyword))
      .filter((keyword): keyword is string => Boolean(keyword));

    const blocks: CmsBlock[] = faq.length > 0
      ? [{ blockType: 'faq', items: faq }]
      : [];

    const internalLinks = recordArray(doc.relatedPages)
      .map((page) => {
        const path = optionalString(page.path);
        const label = optionalString(page.title);
        return path && label ? { path, label } : null;
      })
      .filter((link): link is CmsInternalLink => link !== null);

    const bodyHtml = lexicalToHtml(doc.body);
    const seoTitle = optionalString(seo.title);
    const canonicalUrl = optionalString(seo.canonicalUrl);
    const ogImage = mediaUrl(seo.image);
    const excerpt = optionalString(doc.excerpt);
    const createdAt = optionalString(doc.createdAt);
    const updatedAt = optionalString(doc.updatedAt);
    const aiPrompt = optionalString(ai.prompt);
    const aiModel = optionalString(ai.model);
    const aiGeneratedAt = optionalString(ai.generatedAt);

    return {
      id: String(doc.id),
      tenantId,
      path: normalizePath(requiredString(doc, 'path', 'pages')),
      pageType: pageTypeSchema.parse(requiredString(doc, 'pageType', 'pages')),
      title: requiredString(doc, 'title', 'pages'),
      ...(seoTitle ? { seoTitle } : {}),
      description: optionalString(seo.description) ?? excerpt ?? requiredString(doc, 'title', 'pages'),
      ...(excerpt ? { lead: excerpt } : {}),
      bodyHtml,
      blocks,
      relatedTopicIds: [],
      ...(createdAt ? { publishedAt: createdAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
      noIndex: seo.noindex === true,
      ...(canonicalUrl ? { canonicalUrl } : {}),
      ...(ogImage ? { ogImage } : {}),
      ...(aiPrompt ? { aiPrompt } : {}),
      ...(aiModel ? { aiModel } : {}),
      ...(aiGeneratedAt ? { aiGeneratedAt } : {}),
      ...(keywords[0] ? { targetKeyword: keywords[0] } : {}),
      internalLinks,
    };
  });

  const paths = new Set<string>();
  for (const page of pages) {
    if (paths.has(page.path)) throw new Error(`Payload pages contains duplicate published path ${page.path}.`);
    paths.add(page.path);
  }
  return pages;
}

async function loadSiteSettings(): Promise<Record<string, unknown> | null> {
  const doc = await request<unknown>('/api/globals/site-settings', { locale, depth: '1' });
  return asRecord(doc);
}

async function loadNavigation(): Promise<CmsNavigationItem[]> {
  const settings = await loadSiteSettings();
  const items = recordArray(settings?.nav);
  return items.map((item, index) => ({
    id: `nav-${index + 1}`,
    label: requiredString(item, 'label', 'site-settings.nav'),
    url: requiredString(item, 'href', 'site-settings.nav'),
    openInNewTab: item.external === true,
  }));
}

async function loadSite(): Promise<CmsSite | null> {
  const settings = await loadSiteSettings();
  if (!settings) return null;
  const siteName = optionalString(settings.brandName);
  if (!siteName) return null;
  const footerText = optionalString(settings.footerText) ?? `© ${new Date().getFullYear()} ${siteName}`;
  return { siteName, footerText };
}

async function loadProductCategories(): Promise<CmsProductCategory[]> {
  const response = await request<{ docs?: unknown[] }>('/api/categories', {
    locale,
    depth: '0',
    sort: 'sort',
    limit: '200',
  });

  return (response.docs ?? []).map((value, index) => {
    const doc = asRecord(value);
    if (!doc) throw new Error('Payload categories returned a non-object item.');
    const result = cmsProductCategorySchema.safeParse({
      slug: doc.slug,
      name: doc.name,
      description: optionalString(doc.description),
    });
    if (!result.success) {
      const detail = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
      throw new Error(`Payload category [${index}] failed validation: ${detail}`);
    }
    return result.data;
  });
}

function loadPresentation(value: unknown): CmsProductPresentationBlock[] {
  return recordArray(value).flatMap((item): CmsProductPresentationBlock[] => {
    const blockType = optionalString(item.blockType);
    switch (blockType) {
      case 'richText':
        return [{ blockType, html: lexicalToHtml(item.content) }];
      case 'imageText':
        return [{
          blockType,
          heading: optionalString(item.heading),
          body: optionalString(item.body),
          image: mediaUrl(item.image),
          imagePosition: item.imagePosition === 'right' ? 'right' : 'left',
        }];
      case 'specTable':
        return [{
          blockType,
          title: optionalString(item.title),
          rows: recordArray(item.rows).flatMap((row) => {
            const label = optionalString(row.label);
            const rowValue = optionalString(row.value);
            return label && rowValue ? [{ label, value: rowValue }] : [];
          }),
        }];
      case 'sizeGuide':
        return [{
          blockType,
          title: optionalString(item.title),
          notes: optionalString(item.notes),
          image: mediaUrl(item.image),
        }];
      case 'comparison':
        return [{
          blockType,
          title: optionalString(item.title),
          items: recordArray(item.items).flatMap((entry) => {
            const title = optionalString(entry.title);
            return title ? [{ title, text: optionalString(entry.text) }] : [];
          }),
        }];
      case 'faq':
        return [{
          blockType,
          title: optionalString(item.title),
          items: recordArray(item.items).flatMap((entry) => {
            const question = optionalString(entry.question);
            const answer = optionalString(entry.answer);
            return question && answer ? [{ question, answer }] : [];
          }),
        }];
      case 'cta':
        return [{
          blockType,
          heading: optionalString(item.heading),
          body: optionalString(item.text),
          buttonLabel: optionalString(item.buttonLabel),
          buttonHref: optionalString(item.buttonHref),
        }];
      default:
        return [];
    }
  });
}

async function loadProducts(): Promise<CmsProduct[]> {
  const response = await request<{ docs?: unknown[] }>('/api/products', {
    'where[_status][equals]': 'published',
    locale,
    depth: '1',
    sort: 'name',
    limit: '500',
  });

  return (response.docs ?? []).map((value) => {
    const doc = asRecord(value);
    if (!doc) throw new Error('Payload products returned a non-object item.');

    const seo = asRecord(doc.seo) ?? {};
    const ai = asRecord(doc.ai) ?? {};
    const category = asRecord(doc.category);
    const name = requiredString(doc, 'name', 'products');

    const features = recordArray(doc.highlights).map((item) => {
      const label = requiredString(item, 'title', 'products.highlights');
      return { label, detail: optionalString(item.text) ?? label };
    });

    const specs = recordArray(doc.specs).map((item) => {
      const dimension = requiredString(item, 'label', 'products.specs');
      const value = requiredString(item, 'value', 'products.specs');
      const note = optionalString(item.note);
      return { dimension, value: note ? `${value} (${note})` : value };
    });

    const priceFrom = parsePrice(doc.priceFrom);
    const currency = optionalString(doc.currency);
    const leadTime = optionalString(doc.leadTime);
    const image = mediaUrl(doc.heroImage);
    const canonicalUrl = optionalString(seo.canonicalUrl);
    const ogImage = mediaUrl(seo.image);
    const aiPrompt = optionalString(ai.prompt);
    const aiModel = optionalString(ai.model);
    const aiGeneratedAt = optionalString(ai.generatedAt);

    const result = cmsProductSchema.safeParse({
      slug: doc.slug,
      name,
      description: optionalString(doc.excerpt) ?? name,
      ...(optionalString(category?.slug) ? { categorySlug: optionalString(category?.slug) } : {}),
      ...(priceFrom != null ? { priceFrom } : {}),
      ...(currency && currency.length === 3 ? { priceCurrency: currency } : {}),
      ...(leadTime ? { leadTime } : {}),
      ...(image ? { image } : {}),
      features,
      specs,
      ...(canonicalUrl ? { canonicalUrl } : {}),
      ...(ogImage ? { ogImage } : {}),
      ...(aiPrompt ? { aiPrompt } : {}),
      ...(aiModel ? { aiModel } : {}),
      ...(aiGeneratedAt ? { aiGeneratedAt } : {}),
    });

    if (!result.success) {
      const detail = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
      throw new Error(`Payload product ${String(doc.slug)} failed validation: ${detail}`);
    }
    return {
      ...result.data,
      gallery: recordArray(doc.gallery).flatMap((media) => {
        const url = mediaUrl(media);
        return url ? [url] : [];
      }),
      variants: recordArray(doc.variants).flatMap((variant) => {
        const name = optionalString(variant.name);
        if (!name) return [];
        const options = recordArray(variant.options)
          .map((option) => optionalString(option.label))
          .filter((label): label is string => Boolean(label));
        return [{ name, options }];
      }),
      presentation: loadPresentation(doc.presentation),
    };
  });
}

export function isCmsEnabled(): boolean {
  return Boolean(endpoint);
}

export function getPublishedCmsPages(): Promise<CmsPage[]> {
  if (!isCmsEnabled()) return Promise.resolve([]);
  pagesPromise ??= loadPages();
  return pagesPromise;
}

export async function getPublishedCmsPage(path: string): Promise<CmsPage | undefined> {
  const normalizedPath = normalizePath(path);
  return (await getPublishedCmsPages()).find((page) => page.path === normalizedPath);
}

export async function getHeaderNavigation(): Promise<CmsNavigationItem[]> {
  if (!isCmsEnabled()) return defaultNavigation;
  navigationPromise ??= loadNavigation();
  const navigation = await navigationPromise;
  return navigation.length > 0 ? navigation : defaultNavigation;
}

export function getCmsSite(): Promise<CmsSite | null> {
  if (!isCmsEnabled()) return Promise.resolve(null);
  sitePromise ??= loadSite();
  return sitePromise;
}

export function getCmsProducts(): Promise<CmsProduct[]> {
  if (!isCmsEnabled()) return Promise.resolve([]);
  productsPromise ??= loadProducts();
  return productsPromise;
}

export function getCmsProductCategories(): Promise<CmsProductCategory[]> {
  if (!isCmsEnabled()) return Promise.resolve([]);
  categoriesPromise ??= loadProductCategories();
  return categoriesPromise;
}

export async function getCmsProduct(slug: string): Promise<CmsProduct | undefined> {
  return (await getCmsProducts()).find((product) => product.slug === slug);
}
