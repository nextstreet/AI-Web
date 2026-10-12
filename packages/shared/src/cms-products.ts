import { z } from 'zod';

const requiredLabel = z.string().trim().min(1);

export const cmsProductFeatureSchema = z.object({
  label: requiredLabel,
  detail: z.string().trim().min(1),
});

export const cmsProductSpecSchema = z.object({
  dimension: requiredLabel,
  value: z.string().trim().min(1),
});

export const cmsProductSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1),
  categorySlug: z.string().trim().min(1).optional(),
  priceFrom: z.number().nonnegative().optional(),
  priceCurrency: z.string().trim().length(3).optional(),
  leadTime: z.string().trim().min(1).optional(),
  image: z.string().trim().min(1).optional(),
  features: z.array(cmsProductFeatureSchema).default([]),
  specs: z.array(cmsProductSpecSchema).default([]),
  canonicalUrl: z.string().trim().min(1).optional(),
  ogImage: z.string().trim().min(1).optional(),
  wordCount: z.number().int().nonnegative().optional(),
  aiPrompt: z.string().trim().min(1).optional(),
  aiModel: z.string().trim().min(1).optional(),
  aiGeneratedAt: z.string().trim().min(1).optional(),
});

export const cmsProductCategorySchema = z.object({
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).optional(),
});

export type CmsProduct = z.infer<typeof cmsProductSchema>;
export type CmsProductCategory = z.infer<typeof cmsProductCategorySchema>;
export type CmsProductFeature = z.infer<typeof cmsProductFeatureSchema>;
export type CmsProductSpec = z.infer<typeof cmsProductSpecSchema>;

type RawProduct = {
  slug?: unknown;
  name?: unknown;
  description?: unknown;
  price_from?: unknown;
  price_currency?: unknown;
  lead_time?: unknown;
  image?: unknown;
  features?: unknown;
  specs?: unknown;
  category?: unknown;
  canonical_url?: unknown;
  og_image?: unknown;
  word_count?: unknown;
  ai_prompt?: unknown;
  ai_model?: unknown;
  ai_generated_at?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/**
 * Normalize a Directus cms_products row into the typed contract. The category
 * relation may arrive as either a string uuid or a nested object with slug.
 */
export function normalizeCmsProduct(raw: unknown, sourceId: string): CmsProduct {
  const row = asRecord(raw);
  if (!row) throw new Error(`CMS product ${sourceId} is not an object.`);
  const r = row as RawProduct;

  const categorySlug = (() => {
    const cat = r.category;
    if (typeof cat === 'string' && cat) return undefined;
    const nested = asRecord(cat);
    if (nested && typeof nested.slug === 'string') return nested.slug.trim() || undefined;
    return undefined;
  })();

  const result = cmsProductSchema.safeParse({
    slug: r.slug,
    name: r.name,
    description: r.description,
    ...(categorySlug ? { categorySlug } : {}),
    ...(r.price_from !== null && r.price_from !== undefined && r.price_from !== ''
      ? { priceFrom: Number(r.price_from) }
      : {}),
    ...(r.price_currency ? { priceCurrency: r.price_currency } : {}),
    ...(r.lead_time ? { leadTime: r.lead_time } : {}),
    ...(r.image ? { image: r.image } : {}),
    features: Array.isArray(r.features) ? r.features : [],
    specs: Array.isArray(r.specs) ? r.specs : [],
    ...(optionalString(r.canonical_url) ? { canonicalUrl: optionalString(r.canonical_url) } : {}),
    ...(optionalString(r.og_image) ? { ogImage: optionalString(r.og_image) } : {}),
    ...(r.word_count !== null && r.word_count !== undefined && r.word_count !== ''
      ? { wordCount: Number(r.word_count) }
      : {}),
    ...(optionalString(r.ai_prompt) ? { aiPrompt: optionalString(r.ai_prompt) } : {}),
    ...(optionalString(r.ai_model) ? { aiModel: optionalString(r.ai_model) } : {}),
    ...(optionalString(r.ai_generated_at) ? { aiGeneratedAt: optionalString(r.ai_generated_at) } : {}),
  });

  if (!result.success) {
    const detail = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`CMS product ${sourceId} failed validation: ${detail}`);
  }
  return result.data;
}

export function normalizeCmsProductCategory(raw: unknown, sourceId: string): CmsProductCategory {
  const row = asRecord(raw);
  if (!row) throw new Error(`CMS product category ${sourceId} is not an object.`);
  const result = cmsProductCategorySchema.safeParse(row);
  if (!result.success) {
    const detail = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`CMS product category ${sourceId} failed validation: ${detail}`);
  }
  return result.data;
}
