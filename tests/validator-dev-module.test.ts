import { describe, expect, it } from 'vitest';
import { createServer } from 'vite';

describe('validator browser module', () => {
  it('serves the precompiled validator as a browser ES module', async () => {
    const server = await createServer({ server: { port: 0, open: false } });
    try {
      await server.listen();
      const address = server.httpServer!.address();
      if (!address || typeof address === 'string') throw new Error('Missing test server port');
      const base = `http://localhost:${address.port}${server.config.base}`;
      const dataset = await (await fetch(`${base}src/data/validate-dataset.ts`)).text();
      expect(dataset).toContain('/src/data/compiled-shapes.mjs');
      const response = await fetch(`${base}src/data/compiled-shapes.mjs`);
      expect(response.ok).toBe(true);
      const module = await response.text();
      // Browsers have no require(), and raw CommonJS files have no ES exports.
      expect(module).not.toMatch(/\brequire\(/);
      expect(module).toContain('/node_modules/.vite/deps/ajv-formats_dist_formats');
      expect(module).toContain('checkShape');
    } finally {
      await server.close();
    }
  }, 60_000);
});
