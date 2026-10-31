/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Address of the templates catalog, to test a local copy. */
  readonly VITE_TEMPLATES_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
