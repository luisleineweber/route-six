import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AppHeader, type PlannerPage } from '../src/components/AppHeader';

const renderHeader = (page: PlannerPage) => renderToStaticMarkup(createElement(AppHeader, {
  gameId: 'emerald', onGameChange: () => {}, page, onPageChange: () => {},
}));

describe('Header', () => {
  it('ordnet Marke, Spielauswahl und Planerauswahl in Leserichtung an', () => {
    const html = renderHeader('team');
    expect(html.indexOf('class="brand"')).toBeLessThan(html.indexOf('class="game-selector"'));
    expect(html.indexOf('class="game-selector"')).toBeLessThan(html.indexOf('class="planner-nav"'));
    expect(html).toContain('<strong>Route Six</strong>');
    expect(html).toContain('<strong>Pokémon Emerald</strong><span>Change game</span>');
  });

  it.each(['team', 'progress'] as const)('kennzeichnet nur den aktiven Planer: %s', page => {
    const html = renderHeader(page);
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html).toContain(`class="selected" aria-current="page" aria-labelledby="${page}-planner-label"`);
    for (const id of ['team', 'progress']) {
      expect(html).toContain(`aria-labelledby="${id}-planner-label" aria-describedby="${id}-planner-description"`);
      expect(html).toContain(`id="${id}-planner-label"`);
      expect(html).toContain(`id="${id}-planner-description"`);
    }
  });
});
