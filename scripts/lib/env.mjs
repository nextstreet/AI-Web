// Shared helpers for repository operation scripts.
// Parses .env at the repository root and safely encodes the Supabase
// connection string when the password contains reserved URL characters.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Minimal .env reader: KEY="value" lines, # comments, no interpolation. */
export function readDotEnv(filePath = path.join(repoRoot, '.env')) {
  const values = {};
  let raw;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch {
    return values;
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

/**
 * URL-encode userinfo (username/password) in a postgres:// URL so passwords
 * containing characters such as `+ $ ?` survive shell and driver parsing.
 */
export function encodePostgresUrl(rawUrl) {
  const schemeEnd = rawUrl.indexOf('://');
  const at = rawUrl.lastIndexOf('@');
  if (schemeEnd === -1 || at === -1 || at < schemeEnd) return rawUrl;
  const scheme = rawUrl.slice(0, schemeEnd + 3);
  const userinfo = rawUrl.slice(schemeEnd + 3, at);
  const host = rawUrl.slice(at + 1);
  const colon = userinfo.indexOf(':');
  if (colon === -1) return rawUrl;
  const user = encodeURIComponent(userinfo.slice(0, colon));
  const pass = encodeURIComponent(userinfo.slice(colon + 1));
  return `${scheme}${user}:${pass}@${host}`;
}

/** Returns the Supabase connection string from .env or the environment. */
export function getSupabaseDbUrl() {
  const env = readDotEnv();
  const raw = env.SUPABASE_DB_URL ?? process.env.SUPABASE_DB_URL ?? '';
  if (!raw) return '';
  return encodePostgresUrl(raw);
}
