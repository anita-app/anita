/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  // anita-app.com serves the app from /2/, the published files are in the GitHub Pages repository next to this one.
  base: mode === 'production' ? '/2/' : '/',
  build: {
    outDir: '../anita-app.github.io/2',
    emptyOutDir: true,
  },
  server: {
    // The Dropbox login redirects to http://localhost:3000/, as registered in the Dropbox app.
    port: 3000,
    strictPort: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
  resolve: {
    // Imports like 'app/libs/...' point to src/app.
    alias: [{ find: /^app\//, replacement: `${fileURLToPath(new URL('./src/app/', import.meta.url))}` }],
  },
  worker: {
    format: 'es',
  },
  plugins: [
    // React Compiler, in its Rust port (oxc-transform-react).
    react({ compiler: true }),
    tailwindcss(),
    VitePWA({
      // The service worker is ours (src/service-worker.ts): the plugin adds the list of files to precache.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      // Registered by src/serviceWorkerRegistration.ts; the manifest is public/manifest.json.
      injectRegister: false,
      manifest: false,
      injectManifest: {
        // The files of the build only, as before: files of public/ are not precached.
        globPatterns: ['**/*.{js,css,html}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
  },
}))
