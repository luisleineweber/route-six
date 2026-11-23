import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { emerald } from './local-data';
import { GameContext } from '../src/features/planner/GameContext';
import { PokemonSearch } from '../src/features/progress/PokemonSearch';
import { firstBatchSize, firstRenderCount } from '../src/features/progress/use-progressive-count';

describe('Catalogue batches', () => {
  it('starts client mounts with one batch and prerendered markup with the full list', () => {
    expect(firstRenderCount(false)).toBe(firstBatchSize);
    expect(firstRenderCount(true)).toBe(Infinity);
  });

  it('renders every card on the server, so the prerendered page and hydration match', () => {
    const html = renderToStaticMarkup(createElement(GameContext, { value: emerald }, createElement(PokemonSearch, {
      snapshot: null, target: 'whole-game', progressPage: false, team: Array(6).fill(null), activeSlot: null,
      onAdd: () => {}, onSwap: () => {}, onDetails: () => {}, onCancel: () => {},
    })));
    expect(emerald.profiles.length).toBeGreaterThan(firstBatchSize);
    expect(html.match(/<article\b/g)).toHaveLength(emerald.profiles.length);
    expect(html).toContain('202 Pokémon');
  });
});
