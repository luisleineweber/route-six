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
      'ajv/dist/2020',
      'ajv-formats',
    ],
  },
  server: {
    watch: {
      ignored: ['**/output/**', '**/artifacts/**', '**/.*-source-review/**'],
    },
  },
  worker: { format: 'es' },
  // Full game fixtures retain proof caches. Run one at a time so concurrent
  // solver work does not exceed the integration setup time limit.
  test: { environment: 'node', include: ['tests/**/*.test.ts'], maxWorkers: 1 },
});
