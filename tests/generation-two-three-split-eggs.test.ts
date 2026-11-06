import { describe, expect, it } from 'vitest';
import { dataset } from './local-data';
import { solve } from '../src/domain/availability/solve';
import type { GameData, PokemonSource } from '../src/domain/types';

const games = ['gold', 'silver', 'crystal', 'ruby', 'sapphire', 'emerald', 'firered', 'leafgreen'] as const;
const empty = { kind: 'all' as const, requirements: [] };
const maleLine = ['nidoran-m', 'nidorino', 'nidoking'];
const splitLine = ['nidoran-f', ...maleLine];

function fixture(id: typeof games[number], parents: string[]): GameData {
  const actual = dataset.games.find(row => row.game.id === id)!;
  const game = structuredClone(actual);
  const parentIds = [...parents, 'ditto'];
  const rules = actual.breedingRules.filter(rule => rule.parentPokemonIds.some(parent => parents.includes(parent))
    && rule.offspringPokemonIds.some(offspring => splitLine.includes(offspring)));
  const ruleIds = new Set(rules.map(rule => rule.id));
  const eggs = actual.sources.filter(source => source.details.kind === 'breeding' && ruleIds.has(source.details.ruleId));
  const profiles = actual.profiles.filter(profile => [...parentIds, ...eggs.map(egg => egg.pokemonId)].includes(profile.pokemonId));
  const seeds: PokemonSource[] = parentIds.map(pokemonId => {
    const profile = profiles.find(row => row.pokemonId === pokemonId)!;
    return { id: `${id}-controlled-${pokemonId}`, pokemonId, locationId: 'test-day-care', requirements: empty,
      level: { kind: 'fixed', value: 10 }, genders: profile.genders, maxUses: null, choice: null,
      details: { kind: 'gift' }, review: profile.review };
  });
  const review = rules[0]?.review ?? actual.game.review;
  game.profiles = profiles;
  for (const profile of profiles) delete profile.forms;
  game.breedingRules = rules;
  game.sources = [...seeds, ...eggs].map(source => {
    const copy = structuredClone(source);
    copy.locationId = 'test-day-care';
    copy.requirements = copy.details.kind === 'breeding' ? { kind: 'capability', id: 'day-care' } : empty;
    return copy;
  });
  game.milestones = [{ id: 'day-care-open', name: 'Day Care open', kind: 'story', phase: 'main-story', displayOrder: 0,
    previousIds: [], locationId: null, nextBossId: null, review }];
  game.locations = [{ id: 'test-day-care', name: 'Test Day Care', requirements: empty, review }];
  game.capabilities = [{ id: 'day-care', name: 'Day Care', requirements: empty, review }];
  game.evolutions = [];
  game.formChanges = [];
  game.items = [];
  game.choices = [];
  game.exclusions = [];
  return game;
}

function offspringFrom(game: GameData, parents: string[]): string[] {
  const rules = game.breedingRules.filter(rule => rule.parentPokemonIds.some(id => parents.includes(id))
    && rule.offspringPokemonIds.some(id => splitLine.includes(id)));
  const eggIds = game.sources.filter(source => {
    if (source.details.kind !== 'breeding') return false;
    const ruleId = source.details.ruleId;
    return rules.some(rule => rule.id === ruleId);
  })
    .map(source => source.id);
  const solved = solve(game, game.milestones[0], false);
  return [...new Set([...solved.paths].filter(([, paths]) => paths.some(path => path.sourceIds.some(id => eggIds.includes(id))))
    .map(([pokemonId]) => pokemonId))].sort();
}

describe.each(games)('%s Nidoran split egg data', id => {
  it('produces either sex from a controlled Nidoran-F and Ditto', () => {
    const game = fixture(id, ['nidoran-f']);
    expect(offspringFrom(game, ['nidoran-f'])).toEqual(['nidoran-f', 'nidoran-m']);
  });

  it.each(maleLine)('produces only Nidoran-M from controlled %s and Ditto', parentId => {
    const game = fixture(id, [parentId]);
    expect(offspringFrom(game, [parentId])).toEqual(['nidoran-m']);
  });
});
