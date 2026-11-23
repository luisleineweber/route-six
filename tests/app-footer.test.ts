import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AppFooter } from '../src/components/AppFooter';
import { assetUrl } from '../src/data/asset-url';

function renderFooter() {
  return renderToStaticMarkup(createElement(AppFooter));
}

// CI sets VITE_SITE_URL. Each test sets its own value so results do not depend on the environment.
beforeEach(() => vi.stubEnv('VITE_SITE_URL', ''));
afterEach(() => vi.unstubAllEnvs());

it('keeps only the session guidance, credits, fan attribution, and a way back', () => {
  const html = renderFooter();
  expect(html).toContain('<footer class="app-footer">');
  expect(html).toContain('Route Six');
  expect(html).toContain('Plans reset when you reload. Export your team as a PNG to keep a copy.');
  expect(html).toContain('An unofficial fan project');
  expect(html).toContain('The Pokémon Company');
  expect(html).toContain('href="#main"');
  expect(html).not.toContain('<dl');
  expect(html).not.toContain('<details');
});

it.each([undefined, '', '   '])('omits the site link when no URL is configured (%s)', value => {
  vi.stubEnv('VITE_SITE_URL', value);
  const html = renderFooter();
  expect(html).not.toContain('Route Six site');
  expect(html).not.toContain('coming soon');
});

it('links the configured Route Six site in a new tab, outside the credits', () => {
  vi.stubEnv('VITE_SITE_URL', ' https://route-six.example ');
  const html = renderFooter();
  const link = html.match(/<a class="footer-link" href="https:\/\/route-six\.example".*?<\/a>/)![0];
  expect(link).toContain('target="_blank" rel="noopener noreferrer"');
  expect(link).toContain('Route Six site');
  expect(link).toContain('opens in a new tab');
  expect(html.match(/<p class="footer-credits">.*?<\/p>/)![0]).not.toContain('route-six.example');
});

it('credits asset sources with licence and new-tab notices', () => {
  const credits = renderFooter().match(/<p class="footer-credits">.*?<\/p>/)![0];
  expect(credits).toContain('href="https://github.com/PokeAPI/sprites"');
  expect(credits).toContain('href="https://github.com/partywhale/pokemon-type-icons"');
  expect(credits).toContain(`href="${assetUrl('/types/LICENSE.txt')}"`);
  expect(credits.match(/target="_blank" rel="noopener noreferrer"/g)).toHaveLength(3);
  expect(credits.match(/opens in a new tab/g)).toHaveLength(3);
});
