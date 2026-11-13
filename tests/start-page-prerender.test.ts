import { afterEach, describe, expect, it, vi } from 'vitest';
import { build } from 'vite';
import { renderToString } from 'react-dom/server';
import { insertStartPage } from '../scripts/prerender-page';
import { searchPlugin } from '../scripts/search-plugin';
import { siteTitle } from '../src/content/site-copy';
import { startPage } from '../src/entry-server';

afterEach(() => vi.unstubAllEnvs());

const siteUrl = 'https://luisleineweber.github.io/route-six/';
const token = 'aB3_dE5-fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC';

/** Builds the real index head in memory, as the client build of `npm run build` does. */
async function builtIndex() {
  vi.stubEnv('SITE_URL', siteUrl);
  vi.stubEnv('GOOGLE_SITE_VERIFICATION', token);
  const result = await build({ configFile: false,
    plugins: [searchPlugin(), { name: 'search-test-entry', enforce: 'pre',
      load(id) { if (id.endsWith('/src/main.tsx')) return 'export {};'; },
    }],
    build: { write: false }, logLevel: 'silent' });
  const bundles = Array.isArray(result) ? result : [result];
  const index = bundles.flatMap(bundle => 'output' in bundle ? bundle.output : [])
    .find(asset => asset.fileName === 'index.html');
  expect(index?.type).toBe('asset');
  return index?.type === 'asset' ? String(index.source) : '';
}

describe('prerendered start page', () => {
  it('puts the real start interface into the built index and keeps the search metadata', async () => {
    const result = insertStartPage(await builtIndex(), renderToString(await startPage()));
    expect(result.ok).toBe(true);
    const html = result.ok ? result.html : '';
    const [head, body] = html.split('<body>');
    expect(head).toContain(`<title>${siteTitle}</title>`);
    expect(head).toContain(`rel="canonical" href="${siteUrl}"`);
    expect(head).toContain(`name="google-site-verification" content="${token}"`);
    expect(head.indexOf('<meta charset="UTF-8"')).toBeLessThan(1024);
    expect(body).not.toContain('<div id="root"></div>');
    expect(body).toContain('<strong>Route Six</strong><span>Pokémon playthrough planner</span>');
    expect(body).toContain('aria-label="Planner pages"');
    expect(body).toContain('<span>Team Planner</span><span>Your six Pokémon and their types</span>');
    expect(body).toContain('<span>Progress Planner</span><span>Where and when to find your team</span>');
    expect(body).toMatch(/<h1>Team planner<\/h1>/);
    expect(body).toContain('<h2>Type analysis</h2>');
    expect(body).toContain('Add a Pokémon to see weaknesses and attack coverage.');
    expect(body).toContain('Emerald');
    expect(body.match(/<main\b/g)).toHaveLength(1);
    // Keep the page small: the add confirmation icon joins a card only after an add.
    expect(body).toContain('class="lucide lucide-plus add-icon"');
    expect(body).not.toContain('added-icon');
    expect(body).not.toMatch(/dex-name">[^<]*<!-- -->/);
    // Only the real interface: no loading screen and no extra search copy.
    expect(body).not.toContain('Opening Route Six');
    expect(body).not.toContain('planner-guide');
    expect(body).not.toContain('Check type weaknesses');
  }, 60_000);

  it('rejects an index without exactly one empty root', () => {
    expect(insertStartPage('<body></body>', '<p>x</p>').ok).toBe(false);
    expect(insertStartPage('<div id="root"></div><div id="root"></div>', '<p>x</p>').ok).toBe(false);
    expect(insertStartPage('<div id="root"></div>', ' ').ok).toBe(false);
  });
});
