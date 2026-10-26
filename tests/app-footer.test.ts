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
  expect(html).toContain('Pokémon Field Guide');
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
  expect(html).toContain('Progress checks are still under review.');
  expect(html).not.toContain('Pokémon Emerald');
  expect(html).not.toContain('Team &amp; Progress');
});

it.each([undefined, '', '   '])('links honestly to GitHub when no project URL is configured (%s)', value => {
  vi.stubEnv('VITE_GITHUB_URL', value);
  const html = renderFooter();
  expect(html).toContain('href="https://github.com/" target="_blank" rel="noopener noreferrer"');
  expect(html).toContain('Open GitHub');
  expect(html).not.toContain('View on GitHub');
});

it('uses the configured GitHub destination', () => {
  vi.stubEnv('VITE_GITHUB_URL', ' https://github.com/example/field-guide ');
  const html = renderFooter();
  expect(html).toContain('href="https://github.com/example/field-guide"');
  expect(html).toContain('View on GitHub');
  expect(html).not.toContain('Open GitHub');
});

it('keeps source credits in a native disclosure with asset attribution and new-tab notices', () => {
  const html = renderFooter();
  expect(html).toContain('<details class="footer-credits"><summary>');
  expect(html).toContain('Sources &amp; credits');
  expect(html).toContain('Game data is maintained locally, with source references and review dates.');
  expect(html).toContain('href="https://github.com/PokeAPI/sprites"');
  expect(html).toContain('href="https://github.com/partywhale/pokemon-type-icons"');
  expect(html).toContain('href="/types/LICENSE.txt"');
  expect(html.match(/target="_blank" rel="noopener noreferrer"/g)).toHaveLength(4);
  expect(html.match(/opens in a new tab/g)).toHaveLength(4);
});
