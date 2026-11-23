import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import { AppFooter } from '../src/components/AppFooter';
import { assetUrl } from '../src/data/asset-url';

function renderFooter() {
  return renderToStaticMarkup(createElement(AppFooter));
}

afterEach(() => vi.unstubAllEnvs());

it('keeps only the session guidance, credits, fan attribution, and a way back', () => {
  const html = renderFooter();
  expect(html).toContain('<footer class="app-footer">');
  expect(html).toContain('Route Six');
  expect(html).toContain('Plans reset when you reload. Export a PNG to keep your team.');
  expect(html).toContain('Unofficial fan project');
  expect(html).toContain('The Pokémon Company');
  expect(html).toContain('href="#main"');
  expect(html).not.toContain('<dl');
  expect(html).not.toContain('<details');
});

it('does not link the site to itself, even when the site URL is set', () => {
  vi.stubEnv('VITE_SITE_URL', 'https://route-six.example');
  expect(renderFooter()).not.toContain('route-six.example');
});

it('links the GitHub repository in a new tab with a hidden mark and a label that phones hide visually', () => {
  const link = renderFooter().match(/<a class="footer-github".*?<\/a>/)![0];
  expect(link).toContain('href="https://github.com/luisleineweber/route-six"');
  expect(link).toContain('target="_blank" rel="noopener noreferrer"');
  expect(link).toContain('<svg');
  expect(link).toContain('aria-hidden="true"');
  expect(link).toContain('<span class="footer-github-label">View on GitHub</span>');
  expect(link).toContain('opens in a new tab');
});

it('credits asset sources with licence and new-tab notices', () => {
  const credits = renderFooter().match(/<p class="footer-credits">.*?<\/p>/)![0];
  expect(credits).toContain('href="https://github.com/PokeAPI/sprites"');
  expect(credits).toContain('href="https://github.com/partywhale/pokemon-type-icons"');
  expect(credits).toContain(`href="${assetUrl('/types/LICENSE.txt')}"`);
  expect(credits.match(/target="_blank" rel="noopener noreferrer"/g)).toHaveLength(3);
  expect(credits.match(/opens in a new tab/g)).toHaveLength(3);
});
