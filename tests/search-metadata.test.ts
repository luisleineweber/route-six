import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { build, createServer } from 'vite';
import { crawlFiles, missingReleaseUrls, publicSiteUrl } from '../scripts/search-assets';
import { searchPlugin } from '../scripts/search-plugin';
import { siteDescription, siteTitle } from '../src/content/site-copy';
import { gameCatalogue } from '../src/data/game-catalogue';
import { progressGameLoaders } from '../src/data/game-registry';

afterEach(() => vi.unstubAllEnvs());

async function pageHtml(url: string, path = '/') {
  vi.stubEnv('SITE_URL', url);
  const server = await createServer({ configFile: false, plugins: [searchPlugin()],
    optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true } });
  try {
    return await server.transformIndexHtml(path, readFileSync(new URL('../index.html', import.meta.url), 'utf8'));
  } finally {
    await server.close();
  }
}

describe('search page output', () => {
  it('leaves other HTML reports outside the home page search setup', async () => {
    const html = await pageHtml('', '/report.html');
    expect(html).toContain('<div id="root"></div>');
    expect(html).not.toContain('<title>');
    expect(html).not.toContain('name="description"');
  });
  it('adds search metadata without adding visible page text', async () => {
    const html = await pageHtml('');
    expect(html.match(/<title>/g)).toHaveLength(1);
    expect(html).toContain('<meta charset="UTF-8"');
    expect(html.indexOf('<meta charset="UTF-8"')).toBeLessThan(1024);
    expect(html).toContain('Pokémon Team Planner &amp; Playthrough Guide | Route Six');
    expect(html).toContain(`name="description" content="${siteDescription}"`);
    expect(html).toContain('property="og:site_name" content="Route Six"');
    expect(html).toContain('name="twitter:card" content="summary"');
    expect(html).toContain('rel="help" type="text/plain" href="/llms.txt"');
    const body = html.split('<body>')[1];
    expect(body).toContain('<div id="root"></div>');
    expect(body).not.toContain('Plan your Pokémon playthrough');
    expect(body).not.toContain('Check type weaknesses');
    expect(body).not.toContain('planner-guide');
    expect(html).not.toContain('rel="canonical"');
    expect(html).not.toContain('application/ld+json');
    expect(siteTitle.startsWith('Pokémon Team Planner')).toBe(true);
  });

  it('uses one configured URL for canonical, sharing, structured data, and crawl files', async () => {
    const origin = 'https://example.com/';
    const html = await pageHtml(origin);
    expect(html.match(/rel="canonical"/g)).toHaveLength(1);
    expect(html).toContain(`rel="canonical" href="${origin}"`);
    expect(html).toContain(`property="og:url" content="${origin}"`);
    const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    expect(json).toBeDefined();
    const graph = JSON.parse(json!)['@graph'];
    expect(graph).toEqual(expect.arrayContaining([
      expect.objectContaining({ '@type': 'WebSite', name: 'Route Six', url: origin }),
      expect.objectContaining({ '@type': 'WebApplication', url: origin, isAccessibleForFree: true }),
    ]));
    expect(crawlFiles(origin).robots).toContain(`Sitemap: ${origin}sitemap.xml`);
    expect(crawlFiles(origin).sitemap).toContain(`<loc>${origin}</loc>`);
    expect(crawlFiles(origin).sitemap?.match(/<loc>/g)).toHaveLength(1);
  });

  it('keeps the separate agent summary in line with the registered planners', () => {
    const names = (ids: string[]) => ids.map(id => gameCatalogue.find(game => game.id === id)!.name.replace('Pokémon ', '')).sort();
    const summary = readFileSync(new URL('../public/llms.txt', import.meta.url), 'utf8');
    const list = (prefix: string) => summary.split('\n').find(line => line.startsWith(prefix))!
      .slice(prefix.length).replace(/\.$/, '').split(', ').sort();
    expect(list('- Both planners: ')).toEqual(names(Object.keys(progressGameLoaders)));
    expect(summary).not.toContain('- Team Planner only: ');
    expect(summary).toContain('Plans reset when the page reloads.');
    expect(summary).toContain('unofficial fan project');
  });

  it('emits the configured public URLs in a production build without writing files', async () => {
    vi.stubEnv('SITE_URL', 'https://example.com');
    // Exercise the real index and metadata output without bundling game data.
    // The complete application build is checked separately by npm run build.
    const result = await build({ configFile: false,
      plugins: [searchPlugin(), { name: 'search-test-entry', enforce: 'pre',
        load(id) { if (id.endsWith('/src/main.tsx')) return 'export {};'; },
      }],
      build: { write: false }, logLevel: 'silent' });
    const bundles = Array.isArray(result) ? result : [result];
    const assets = bundles.flatMap(bundle => 'output' in bundle ? bundle.output : []);
    const source = (name: string) => {
      const asset = assets.find(asset => asset.type === 'asset' && asset.fileName === name);
      expect(asset?.type).toBe('asset');
      return asset?.type === 'asset' ? String(asset.source) : '';
    };
    const html = source('index.html');
    expect(html).toContain('<meta charset="UTF-8"');
    expect(html).toContain('rel="canonical" href="https://example.com/"');
    expect(html.indexOf('<meta charset="UTF-8"')).toBeLessThan(1024);
    expect(html).toContain('<div id="root"></div>');
    expect(html).not.toContain('planner-guide');
    expect(source('robots.txt')).toContain('Sitemap: https://example.com/sitemap.xml');
    expect(source('sitemap.xml')).toContain('<loc>https://example.com/</loc>');
  }, 20_000);

  it('does not invent a domain when the release URL is unset', () => {
    expect(publicSiteUrl(undefined)).toEqual({ ok: true, url: null });
    expect(crawlFiles(null)).toEqual({ robots: 'User-agent: *\nAllow: /\n', sitemap: null });
  });

  it.each(['not a URL', 'http://example.com', 'https://example.com/app', 'https://example.com/app/?game=red', 'https://example.com/?game=red',
    'https://example.com/#team', 'https://example.com/?', 'https://example.com/#',
    'https://user:password@example.com/'])('rejects an invalid release origin (%s)', input => {
    expect(publicSiteUrl(input).ok).toBe(false);
  });

  it('normalizes the configured origin', () => {
    expect(publicSiteUrl(' https://example.com ')).toEqual({ ok: true, url: 'https://example.com/' });
  });

  it('accepts a project site path and serves the build from it', async () => {
    const siteUrl = 'https://luisleineweber.github.io/route-six/';
    expect(publicSiteUrl(siteUrl)).toEqual({ ok: true, url: siteUrl });
    const html = await pageHtml(siteUrl);
    expect(html).toContain(`rel="canonical" href="${siteUrl}"`);
    expect(html).toContain('rel="help" type="text/plain" href="/route-six/llms.txt"');
    expect(crawlFiles(siteUrl).sitemap).toContain(`<loc>${siteUrl}</loc>`);
    vi.stubEnv('SITE_URL', siteUrl);
    const result = await build({ configFile: false,
      plugins: [searchPlugin(), { name: 'search-test-entry', enforce: 'pre',
        load(id) { if (id.endsWith('/src/main.tsx')) return 'export {};'; },
      }],
      build: { write: false }, logLevel: 'silent' });
    const bundles = Array.isArray(result) ? result : [result];
    const index = bundles.flatMap(bundle => 'output' in bundle ? bundle.output : [])
      .find(asset => asset.fileName === 'index.html');
    expect(index?.type === 'asset' && String(index.source)).toContain('href="/route-six/favicon.svg"');
  }, 20_000);

  it('reports each unset public URL for a release build', () => {
    expect(missingReleaseUrls({})).toEqual([
      'SITE_URL is not set. Canonical URL, site structured data, and sitemap are omitted. Set it before publication.',
      'VITE_SITE_URL is not set. The footer site link and PNG site address are omitted. Set it before publication.',
    ]);
    expect(missingReleaseUrls({ SITE_URL: 'https://example.com', VITE_SITE_URL: ' ' })).toEqual([
      'VITE_SITE_URL is not set. The footer site link and PNG site address are omitted. Set it before publication.',
    ]);
    expect(missingReleaseUrls({ SITE_URL: 'https://example.com', VITE_SITE_URL: 'https://example.com' })).toEqual([]);
  });
});
