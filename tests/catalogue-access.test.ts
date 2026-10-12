import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { emerald } from '../src/data/dataset';
import type { AcquisitionPath, AvailabilityEntry, AvailabilitySnapshot, GameData } from '../src/domain/types';
import { GameContext } from '../src/features/planner/GameContext';
import { PokemonSearch } from '../src/features/progress/PokemonSearch';

const path = (pokemonId: string, sourceId: string, firstMilestoneId: string): AcquisitionPath => ({
  id: 'source-path', pokemonId, sourceIds: [sourceId], evolutionIds: [], breedingSteps: [],
  genders: ['female'], minimumLevel: 25, firstMilestoneIds: [firstMilestoneId],
  choices: [], claims: [], coProductIds: [],
});

function card(paths: AcquisitionPath[], status: AvailabilityEntry['status'] = 'later', game: GameData = emerald) {
  const pokemonId = paths[0].pokemonId;
  const entry: AvailabilityEntry = {
    pokemonId, status, currentPathIds: status === 'available' ? paths.map(path => path.id) : [],
    futurePathIds: status === 'later' ? paths.map(path => path.id) : [],
    firstMilestoneIds: paths.at(-1)!.firstMilestoneIds, blockers: [],
  };
  const snapshot: AvailabilitySnapshot = {
    query: { gameId: game.game.id, milestoneId: 'norman-defeated', respectLevelLimit: false },
    levelLimit: null, entries: { [pokemonId]: entry },
    paths: Object.fromEntries(paths.map(path => [path.id, path])), choiceGroups: [], resourceLimits: {},
  };
  const html = renderToStaticMarkup(createElement(GameContext, {
    value: { ...game, profiles: game.profiles.filter(profile => profile.pokemonId === pokemonId) },
  }, createElement(PokemonSearch, {
    snapshot, target: 'whole-game', progressPage: true, team: Array(6).fill(null), activeSlot: null,
    onAdd: () => {}, onDetails: () => {}, onCancel: () => {},
  })));
  return html.match(/<article\b[^>]*>[\s\S]*?<\/article>/)![0];
}

describe('catalogue access summaries', () => {
  it.each(['later', 'available'] as const)('shows the evolution item without the catch location when %s', status => {
    const evolved = {
      ...path('raichu', 'wild-safari-zone-south-grass-pikachu', 'devon-scope'),
      evolutionIds: ['pikachu-to-raichu'],
    };
    const html = card([evolved], status);
    expect(html).toContain(`${status === 'later' ? 'Later' : 'Now'}: Evolve Pikachu · Thunder Stone`);
    expect(html).not.toContain('Safari Zone');
    expect(html).not.toContain('Lv. 25');
    if (status === 'later') expect(html).toContain('First access: Receive the Devon Scope');
  });

  it.each(['later', 'available'] as const)('shows the first Pokémon and the final evolution level when %s', status => {
    const evolved = {
      ...path('gardevoir', 'wild-route-102-grass-ralts', 'route-102'),
      minimumLevel: 41,
      evolutionIds: ['ralts-to-kirlia', 'kirlia-to-gardevoir'],
    };
    const html = card([evolved], status);
    expect(html).toContain(`${status === 'later' ? 'Later' : 'Now'}: Evolve Ralts · Lv. 30`);
    expect(html).not.toContain('Lv. 20');
    expect(html).not.toContain('Lv. 41');
    expect(html).not.toContain(': Route 102 ·');
    if (status === 'later') expect(html).toContain('First access: Route 102');
  });

  it('does not invent a fixed level for a friendship evolution', () => {
    const evolved = {
      ...path('crobat', emerald.sources.find(source => source.pokemonId === 'golbat')!.id, 'route-102'),
      evolutionIds: ['golbat-to-crobat'],
    };
    const html = card([evolved], 'available');
    expect(html).toContain('Now: Evolve Golbat');
    expect(html).not.toContain('Lv.');
    expect(html).not.toContain('Route 102');
  });

  it('shows the breeding location instead of a parent encounter location', () => {
    const bred = {
      ...path('azurill', 'wild-route-104-grass-marill', 'devon-scope'),
      sourceIds: ['wild-route-104-grass-marill', 'breed-azurill-azurill'],
      breedingSteps: [{
        sourceId: 'breed-azurill-azurill', ruleId: 'breed-azurill',
        parents: [
          { pokemonId: 'marill', gender: 'female', pathId: 'mother' },
          { pokemonId: 'marill', gender: 'male', pathId: 'father' },
        ],
      }] as AcquisitionPath['breedingSteps'],
    };
    const html = card([bred]);
    expect(html).toContain('Later: Route 117 and Day Care · Breeding');
    expect(html).not.toContain('Route 104');
  });

  it('keeps a direct location beside its future access requirement', () => {
    const html = card([path('bagon', 'wild-meteor-falls-bagon-room-grass-bagon', 'juan-defeated')]);
    expect(html).toContain('Later: Meteor Falls');
    expect(html).toContain('First access: Defeat Juan and receive Waterfall');
  });

  it('uses the source path that matches the displayed first-access point', () => {
    const source = emerald.sources.find(source => source.id === 'wild-safari-zone-south-grass-pikachu')!;
    const game = { ...emerald, sources: [...emerald.sources, { ...source, id: 'late-source', locationId: 'route-101' }] };
    const late = path('pikachu', 'late-source', 'national-dex');
    const first = { ...path('pikachu', source.id, 'devon-scope'), id: 'first-path' };
    const html = card([late, first], 'later', game);
    expect(html).toContain('Later: Safari Zone');
    expect(html).toContain('First access: Receive the Devon Scope');
    expect(html).not.toContain('Later: Route 101');
  });
});
