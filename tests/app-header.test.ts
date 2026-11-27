import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AppHeader, type PlannerPage } from '../src/components/AppHeader';

const renderHeader = (page: PlannerPage) => renderToStaticMarkup(createElement(AppHeader, {
  gameId: 'emerald', loadingGameId: null, onGameChange: () => {}, page, onPageChange: () => {},
}));

describe('Header', () => {
  it('ordnet Marke, Spielauswahl und Planerauswahl in Leserichtung an', () => {
    const html = renderHeader('team');
    expect(html.indexOf('class="brand"')).toBeLessThan(html.indexOf('class="game-selector"'));
    expect(html.indexOf('class="game-selector"')).toBeLessThan(html.indexOf('class="planner-nav"'));
    expect(html.indexOf('class="planner-nav"')).toBeLessThan(html.indexOf('class="theme-toggle"'));
    expect(html).toContain('<strong>Route Six</strong>');
    expect(html).toContain('<strong>Pokémon Emerald</strong><span>Change game</span>');
  });

  it.each(['team', 'progress', 'full-game'] as const)('kennzeichnet nur den aktiven Planer: %s', page => {
    const html = renderHeader(page);
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html).toContain('<button type="button" class="selected" aria-current="page">');
  });

  // WCAG 2.5.3: the accessible name must contain all visible button text.
  it('leitet den Namen der Planerauswahl aus dem sichtbaren Text ab', () => {
    const html = renderHeader('team');
    const nav = html.slice(html.indexOf('<button', html.indexOf('class="planner-nav"')), html.indexOf('</nav>'));
    expect(nav).not.toMatch(/aria-labelledby|aria-describedby|aria-label=/);
    expect(nav).toContain('<button type="button" class="selected" aria-current="page">Team Planner</button>');
    expect(nav).toContain('<button type="button" class="">Progress Planner</button>');
    expect(nav).toContain('<button type="button" class="">Full Game Planner</button>');
  });
});
