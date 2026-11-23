import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { searchPlugin } from './scripts/search-plugin.ts';

export default defineConfig({
  plugins: [react(), searchPlugin()],
  // The game registry imports every game's data. Prepare the known browser
  // dependencies directly instead of scanning all games and report HTML files.
  optimizeDeps: {
    noDiscovery: true,
    include: [
      'react',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      '@radix-ui/react-select',
      'lucide-react',
      // The precompiled validator imports this CommonJS format table.
      'ajv-formats/dist/formats.js',
    ],
  },
  server: {
    watch: {
      ignored: ['**/output/**', '**/artifacts/**', '**/.*-source-review/**'],
    },
  },
  worker: { format: 'es' },
  // `vite build --ssr src/entry-server.tsx` builds the start page renderer for
  // scripts/prerender.ts. It needs no copy of the public assets.
  environments: { ssr: { build: { outDir: 'dist-ssr', copyPublicDir: false } } },
  // Full game fixtures retain proof caches. Run one at a time so concurrent
  // solver work does not exceed the integration setup time limit.
  test: { environment: 'node', include: ['tests/**/*.test.ts'], maxWorkers: 1 },
});
