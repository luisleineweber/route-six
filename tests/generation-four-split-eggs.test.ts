import { describe, expect, it } from 'vitest';
import { dataset } from './local-data';
import { solve } from '../src/domain/availability/solve';
import type { GameData, PokemonSource } from '../src/domain/types';

const games = ['diamond', 'pearl', 'platinum'] as const;
const noRequirements = { kind: 'all' as const, requirements: [] };

function tinyGame(id: typeof games[number], parentIds: string[], offspringIds: string[], seedParentIds = parentIds): GameData {
  const actual = dataset.games.find(game => game.game.id === id)!;
  const game = structuredClone(actual);
  const ruleIds = new Set(game.breedingRules.filter(rule => rule.parentPokemonIds.some(parent => parentIds.includes(parent))
    && rule.offspringPokemonIds.some(offspring => offspringIds.includes(offspring))).map(rule => rule.id));
  const rules = game.breedingRules.filter(rule => ruleIds.has(rule.id));
  const sources = game.sources.filter(source => source.details.kind === 'breeding'
    && ruleIds.has(source.details.ruleId));
  for (const parentId of seedParentIds) {
    const profile = game.profiles.find(row => row.pokemonId === parentId);
    if (!profile) throw new Error(`${id} fixture has no reviewed profile for ${parentId}`);
    sources.push({ id: `${id}-test-seed-${parentId}`, pokemonId: parentId, locationId: 'test-day-care',
      requirements: noRequirements, level: { kind: 'fixed', value: 10 }, genders: profile.genders,
      maxUses: 1, choice: null, details: { kind: 'gift' }, review: profile.review });
  }
  const profiles = game.profiles.filter(profile => [...parentIds, ...seedParentIds, ...offspringIds].includes(profile.pokemonId));
  for (const profile of profiles) delete profile.forms;
  if (!rules.length || !sources.length || profiles.length !== new Set([...parentIds, ...seedParentIds, ...offspringIds]).size) {
    throw new Error(`${id} fixture is missing a reviewed profile, rule, or source`);
  }

  const review = rules[0].review;
  game.profiles = profiles;
  game.breedingRules = rules;
  game.milestones = [{ id: 'day-care-open', name: 'Day Care open', kind: 'story', phase: 'main-story', displayOrder: 0,
    previousIds: [], locationId: null, nextBossId: null, review }];
  game.locations = [{ id: 'test-day-care', name: 'Test Day Care', requirements: noRequirements, review }];
  game.capabilities = [{ id: 'day-care', name: 'Day Care', requirements: noRequirements, review }];
  game.sources = sources.map(source => {
    const copy: PokemonSource = structuredClone(source);
    copy.locationId = 'test-day-care';
    copy.requirements = copy.details.kind === 'breeding' ? { kind: 'capability', id: 'day-care' } : noRequirements;
    return copy;
  });
  game.evolutions = [];
  game.formChanges = [];
  game.items = [];
  game.choices = [];
  game.exclusions = [];
  return game;
}

function outputs(game: GameData, eggIds: string[]): Set<string> {
  const milestone = game.milestones[0];
  const solved = solve(game, milestone, false);
  const result = new Set<string>();
  for (const [pokemonId, paths] of solved.paths) {
    if (eggIds.some(id => paths.some(path => path.sourceIds.includes(id)))) result.add(pokemonId);
  }
  return result;
}

function eggSourceIds(game: GameData, offspringIds: string[]): string[] {
  return game.sources.filter(source => source.details.kind === 'breeding' && offspringIds.includes(source.pokemonId))
    .map(source => source.id);
}

describe.each(games)('%s native split egg rules', id => {
  it.each(['nidoran-m', 'nidorino', 'nidoking'])('keeps controlled %s with Ditto on Nidoran-M', parentId => {
    const game = tinyGame(id, [parentId, 'ditto'], ['nidoran-f', 'nidoran-m']);
    expect([...outputs(game, eggSourceIds(game, ['nidoran-f', 'nidoran-m']))]).toEqual(['nidoran-m']);
  });

  it('lets Nidoran-F with Ditto produce either Nidoran species', () => {
    const game = tinyGame(id, ['nidoran-f', 'ditto'], ['nidoran-f', 'nidoran-m']);
    expect([...outputs(game, eggSourceIds(game, ['nidoran-f', 'nidoran-m']))].sort()).toEqual(['nidoran-f', 'nidoran-m']);
  });

  it('keeps Volbeat with Ditto on Volbeat', () => {
    const game = tinyGame(id, ['volbeat', 'ditto'], ['volbeat', 'illumise']);
    const volbeatEggs = eggSourceIds(game, ['volbeat', 'illumise']);
    expect([...outputs(game, volbeatEggs)]).toEqual(['volbeat']);
  });

  it('lets Illumise with Ditto produce either Illumise or Volbeat', () => {
    const game = tinyGame(id, ['illumise', 'ditto'], ['volbeat', 'illumise']);
    expect([...outputs(game, eggSourceIds(game, ['volbeat', 'illumise']))].sort()).toEqual(['illumise', 'volbeat']);
  });
});
