import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GameSelector } from '../src/components/GameSelector';
import { gameCatalogue, gameGroups, isGameReady } from '../src/data/game-catalogue';

const renderSelector = (gameId = 'emerald') => renderToStaticMarkup(createElement(GameSelector, { gameId, onChange: () => {} }));

describe('Game selection', () => {
  it('keeps the selected game in the trigger and groups the library without a visible menu title', () => {
    const html = renderSelector();
    expect(html).toContain('<strong>Pokémon Emerald</strong>');
    expect(html).toContain('role="region" aria-label="Choose a game"');
    expect(html).not.toContain('game-menu-title');
    expect(html).not.toContain('game-menu-header');
    expect(html).not.toContain('game-menu-close');
    for (const group of gameGroups) expect(html).toContain(`<h2 id="generation-${group.generation}">Generation ${group.generation}</h2>`);
  });

  it('uses logos alone while keeping game names as tooltips and accessible labels', () => {
    const html = renderSelector();
    expect(html).not.toContain('game-option-name');
    for (const game of gameCatalogue) {
      expect(html).toContain(`title="${game.name}" aria-label="${game.name}"`);
      expect(html).toContain(`src="${game.logoSrc}"`);
    }
    expect(html).not.toContain('Team ready');
    expect(html).not.toContain('Ready');
    expect(html).not.toContain('supports progress checks');
  });

  it.each(['emerald', 'heartgold', 'x'])('exposes the current game to assistive technology without a visible selection badge (%s)', gameId => {
    const html = renderSelector(gameId);
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html).not.toContain('game-option-check');
    expect(html).toMatch(new RegExp(`aria-label="${gameCatalogue.find(game => game.id === gameId)!.name}" aria-pressed="true"`));
  });

  it('keeps planned games disabled and explains them without labeling available games', () => {
    const html = renderSelector();
    const planned = gameCatalogue.filter(game => !isGameReady(game.id));
    expect(html.match(/class="game-option-note"/g)).toHaveLength(planned.length);
    expect(html.match(/disabled=""/g)).toHaveLength(planned.length);
    for (const game of planned) {
      expect(html).toContain(`aria-describedby="${game.id}-planned"`);
      expect(html).toContain(`id="${game.id}-planned">Planned</span>`);
    }
    expect(html).not.toContain('id="emerald-planned"');
    expect(html).not.toContain('id="heartgold-planned"');
  });
});
