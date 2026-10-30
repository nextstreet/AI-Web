import { candidates, galleryItems, publishedContents } from './seed';
import { payloadFetch, type PayloadDesign, type PayloadPage } from './payload';
import type { CandidateContent, GalleryItem, PageType, PublishedContent } from './types';

export function isSeedFallbackEnabled() {
  return true;
}

function mapPage(doc: PayloadPage): PublishedContent | null {
  if (!doc.slug || !doc.title) return null;
  const body = Array.isArray(doc.legacyBody)
    ? doc.legacyBody.filter((section) => section && typeof section.heading === 'string')
    : [];
  return {
    id: String(doc.id),
    tenantId: 'ita-bag-lab',
    candidateId: '',
    slug: doc.slug,
    pageType: (doc.pageType || 'intent_guide') as PageType,
    primaryKeyword: doc.legacyPrimaryKeyword || '',
    title: doc.title,
    metaDescription: doc.excerpt || doc.legacyHeroSummary || '',
    heroSummary: doc.legacyHeroSummary || doc.excerpt || '',
    body,
    internalLinks: Array.isArray(doc.legacyInternalLinks) ? doc.legacyInternalLinks : [],
    publishedAt: doc.publishedAt || doc.updatedAt || '',
  };
}

function mapDesign(doc: PayloadDesign): GalleryItem | null {
  if (!doc.slug || !doc.name) return null;
  const tags = Array.isArray(doc.tags)
    ? doc.tags.map((tag) => typeof tag === 'string' ? tag : tag?.tag || '').filter(Boolean)
    : [];
  return {
    id: String(doc.id),
    tenantId: 'ita-bag-lab',
    slug: doc.slug,
    title: doc.name,
    imageUrl: doc.imageUrl || '',
    description: doc.description || '',
    tags,
    votesCount: Number(doc.votesCount) || 0,
  };
}

export async function getPublishedContents(): Promise<PublishedContent[]> {
  const response = await payloadFetch<{ docs?: PayloadPage[] }>(
    '/pages?limit=200&depth=0&where[_status][equals]=published',
  );
  const pages = (response?.docs || []).map(mapPage).filter((page): page is PublishedContent => Boolean(page));
  return pages.length ? pages : publishedContents;
}

export async function getPublishedContent(slug: string): Promise<PublishedContent | undefined> {
  const pages = await getPublishedContents();
  return pages.find((page) => page.slug === slug);
}

export async function getCandidates(): Promise<CandidateContent[]> {
  return candidates;
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const response = await payloadFetch<{ docs?: PayloadDesign[] }>(
    '/designs?limit=100&depth=0&where[_status][equals]=published',
  );
  const items = (response?.docs || []).map(mapDesign).filter((item): item is GalleryItem => Boolean(item));
  return items.length ? items : galleryItems;
}

export function getSystemSnapshot() {
  return { publishedContents, galleryItems };
}
