import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  worker: { format: 'es' },
  // Full game fixtures retain proof caches. Run one at a time so concurrent
  // solver work does not exceed the integration setup time limit.
  test: { environment: 'node', include: ['tests/**/*.test.ts'], maxWorkers: 1 },
});
