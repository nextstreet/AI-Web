/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_SITE_NAME?: string;
  readonly PAYLOAD_URL?: string;
  readonly PAYLOAD_LOCALE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
