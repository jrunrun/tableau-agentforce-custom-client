/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SCRT_URL: string;
  readonly VITE_ORG_ID: string;
  // Add other environment variables you're using
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
