const rawBase = (process.env.PAYLOAD_URL || import.meta.env.PAYLOAD_URL || '').trim();
export const payloadBase = rawBase.replace(/\/$/, '');

export const hasPayload = Boolean(payloadBase);

/**
 * Read from Payload's public REST API. Returns null when Payload is not
 * configured or the request fails, so pages can fall back to repository data.
 */
export async function payloadFetch<T>(path: string, timeoutMs = 3000): Promise<T | null> {
  if (!payloadBase) return null;
  try {
    const response = await fetch(`${payloadBase}/api${path}`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) {
      console.warn(`[payload] ${path} -> ${response.status}`);
      return null;
    }
    return await response.json() as T;
  } catch (error) {
    console.warn(`[payload] ${path} failed: ${(error as Error).message}`);
    return null;
  }
}

export type PayloadPage = {
  id: string | number;
  slug: string;
  path: string;
  title: string;
  pageType?: string;
  excerpt?: string;
  legacyHeroSummary?: string;
  legacyPrimaryKeyword?: string;
  legacyBody?: Array<{ heading: string; paragraphs: string[]; bullets?: string[] }>;
  legacyInternalLinks?: Array<{ label: string; slug: string }>;
  publishedAt?: string;
  updatedAt?: string;
};

export type PayloadDesign = {
  id: string | number;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  tags?: Array<{ tag?: string }> | string[];
  votesCount?: number;
};

export type PayloadSiteSettings = {
  legacyConfig?: Record<string, unknown>;
};
