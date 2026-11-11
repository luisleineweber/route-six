import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { emerald } from './local-data';
import { GameContext } from '../src/features/planner/GameContext';
import { PokemonSearch } from '../src/features/progress/PokemonSearch';
import { firstBatchSize } from '../src/features/progress/use-progressive-count';

describe('Catalogue batches', () => {
  it('paints the first batch of cards and keeps full group counts', () => {
    const html = renderToStaticMarkup(createElement(GameContext, { value: emerald }, createElement(PokemonSearch, {
      snapshot: null, target: 'whole-game', progressPage: false, team: Array(6).fill(null), activeSlot: null,
      onAdd: () => {}, onDetails: () => {}, onCancel: () => {},
    })));
    expect(emerald.profiles.length).toBeGreaterThan(firstBatchSize);
    expect(html.match(/<article\b/g)).toHaveLength(firstBatchSize);
    expect(html).toContain('202 Pokémon');
  });
});
