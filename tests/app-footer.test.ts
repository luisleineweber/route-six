import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import { AppFooter } from '../src/components/AppFooter';
import type { GameData } from '../src/domain/types';
import { GameContext } from '../src/features/planner/GameContext';
import { dataset, emerald } from './local-data';

function renderFooter(game: GameData = emerald) {
  return renderToStaticMarkup(createElement(GameContext, { value: game }, createElement(AppFooter)));
}

afterEach(() => vi.unstubAllEnvs());

it('replaces the MVP line with game context, session guidance, and fan attribution', () => {
  const html = renderFooter();
  expect(html).toContain('<footer class="app-footer">');
  expect(html).toContain('Route Six');
  expect(html).toContain('Pokémon Emerald');
  expect(html).toContain('<dt>Region</dt><dd>Hoenn</dd>');
  expect(html).toContain('<dt>Generation</dt><dd>3</dd>');
  expect(html).toContain(`<dd>${emerald.profiles.length} species</dd>`);
  expect(html).toContain('Team &amp; Progress');
  expect(html).toContain('Plans reset when you reload. Export your team to keep a copy.');
  expect(html).toContain('An unofficial fan project');
  expect(html).toContain('The Pokémon Company');
  expect(html).toContain('href="#main"');
  expect(html).not.toContain('MVP specification');
});

it('uses the selected game and distinguishes team-only support', () => {
  const heartgold = dataset.games.find(game => game.game.id === 'heartgold')!;
  const html = renderFooter(heartgold);
  expect(html).toContain('Pokémon HeartGold');
  expect(html).toContain(`<dd>${heartgold.profiles.length} species</dd>`);
  expect(html).toContain('<dd>Team Planner</dd>');
  expect(html).toContain('Progress planning is not available for this game yet.');
  expect(html).not.toContain('Pokémon Emerald');
  expect(html).not.toContain('Team &amp; Progress');
});

it.each([undefined, '', '   '])('shows the project link as coming soon when no URL is configured (%s)', value => {
  vi.stubEnv('VITE_SITE_URL', value);
  const html = renderFooter();
  expect(html).toContain('Project link coming soon.');
  expect(html).not.toContain('class="footer-project-link"');
});

it('uses the configured Route Six site destination', () => {
  vi.stubEnv('VITE_SITE_URL', ' https://route-six.example ');
  const html = renderFooter();
  expect(html).toContain('href="https://route-six.example"');
  expect(html).toContain('Visit the Route Six site');
});

it('keeps source credits in a native disclosure with asset attribution and new-tab notices', () => {
  const html = renderFooter();
  expect(html).toContain('<details class="footer-credits"><summary>');
  expect(html).toContain('Sources &amp; credits');
  expect(html).toContain('These links show the sources used for game details.');
  expect(html).toContain('href="https://github.com/PokeAPI/sprites"');
  expect(html).toContain('href="https://github.com/partywhale/pokemon-type-icons"');
  expect(html).toContain('href="/types/LICENSE.txt"');
  expect(html.match(/target="_blank" rel="noopener noreferrer"/g)).toHaveLength(3);
  expect(html.match(/opens in a new tab/g)).toHaveLength(3);
});
