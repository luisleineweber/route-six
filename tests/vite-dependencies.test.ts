import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import config from '../vite.config';

describe('development dependency preparation', () => {
  it('prepares every browser dependency without scanning the game data', () => {
    const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url));
    const imports = new Set(['react/jsx-runtime', 'react/jsx-dev-runtime']);
    for (const file of readdirSync(sourceRoot, { recursive: true, withFileTypes: true })) {
      if (!file.isFile() || !/\.(tsx?|mjs)$/.test(file.name)) continue;
      const source = readFileSync(join(file.parentPath, file.name), 'utf8');
      // The generated validator embeds schema strings, so only its leading import lines count.
      const pattern = file.name.endsWith('.mjs')
        ? /^import\b[^'"]*['"]([^'"]+)['"]/gm
        : /\b(?:from\s*|import\s*(?:\(\s*)?)['"]([^'"]+)['"]/g;
      for (const match of source.matchAll(pattern)) {
        if (!match[1].startsWith('.')) imports.add(match[1]);
      }
    }

    expect(config.optimizeDeps?.noDiscovery).toBe(true);
    expect([...imports].filter(id => !config.optimizeDeps?.include?.includes(id))).toEqual([]);
  });
});
