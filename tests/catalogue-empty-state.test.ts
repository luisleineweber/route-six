import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { emerald } from './local-data';
import { GameContext } from '../src/features/planner/GameContext';
import { PokemonSearch } from '../src/features/progress/PokemonSearch';
import type { AvailabilitySnapshot } from '../src/domain/types';

function emptyCatalogue(progressPage: boolean) {
  const snapshot: AvailabilitySnapshot = {
    query: { gameId: 'emerald', milestoneId: 'roxanne-defeated', respectLevelLimit: true },
    levelLimit: { bossId: 'brawly', level: 19 },
    entries: {
      bagon: {
        pokemonId: 'bagon', status: 'later', currentPathIds: [], futurePathIds: [],
        firstMilestoneIds: [], blockers: [],
      },
    },
    paths: {}, choiceGroups: [], resourceLimits: {},
  };
  const game = { ...emerald, profiles: progressPage ? emerald.profiles.filter(p => p.pokemonId === 'bagon') : [] };
  return renderToStaticMarkup(createElement(GameContext, { value: game }, createElement(PokemonSearch, {
    snapshot, target: 'current-progress', progressPage, team: Array(6).fill(null), activeSlot: null,
    onAdd: () => {}, onDetails: () => {}, onCancel: () => {},
  })));
}

describe('Empty catalogue guidance', () => {
  it('names the status filter when current access hides a matching later species', () => {
    const html = emptyCatalogue(true);
    expect(html).toContain('No Pokémon match these filters.');
    expect(html).toContain('Change your search, type, or status filters.');
    expect(html).toContain('Clear filters');
  });

  it('keeps Team Planner guidance free of progress status filters', () => {
    const html = emptyCatalogue(false);
    expect(html).toContain('Change the name or type.');
    expect(html).not.toContain('status filters');
  });
});
