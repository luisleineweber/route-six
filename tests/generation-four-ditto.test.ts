import { describe, expect, it } from 'vitest';
import { dataset } from './local-data';
import { solve } from '../src/domain/availability/solve';
import { checkTeam } from '../src/domain/team/check-team';
import type { AvailabilitySnapshot, GameData } from '../src/domain/types';

const games = ['diamond', 'pearl', 'platinum'] as const;
const noRequirements = { kind: 'all' as const, requirements: [] };

function tinyRotomGame(id: typeof games[number]): GameData {
  const actual = dataset.games.find(game => game.game.id === id)!;
  const game = structuredClone(actual);
  game.profiles = game.profiles.filter(profile => ['rotom', 'ditto'].includes(profile.pokemonId));
  for (const profile of game.profiles) delete profile.forms;
  const eggSource = structuredClone(actual.sources.find(row => row.pokemonId === 'rotom' && row.details.kind === 'breeding'));
  const eggDetails = eggSource?.details;
  if (!eggSource || !eggDetails || eggDetails.kind !== 'breeding') throw new Error(`${id} has no reviewed Rotom breeding source`);
  const rule = game.breedingRules.find(row => row.id === eggDetails.ruleId);
  if (!rule) throw new Error(`${id} Rotom source has no reviewed offspring rule`);
  game.breedingRules = [rule];
  game.milestones = [{ id: 'day-care-open', name: 'Day Care open', kind: 'story', phase: 'main-story', displayOrder: 0,
    previousIds: [], locationId: null, nextBossId: null, review: rule.review }];
  game.locations = [{ id: 'test-day-care', name: 'Test Day Care', requirements: noRequirements, review: rule.review }];
  game.capabilities = [{ id: 'day-care', name: 'Day Care', requirements: noRequirements, review: rule.review }];
  const rotom = structuredClone(actual.sources.find(row => row.pokemonId === 'rotom' && row.details.kind !== 'breeding')!);
  const ditto = structuredClone(actual.sources.find(row => row.pokemonId === 'ditto' && row.details.kind !== 'breeding')!);
  rotom.maxUses = 1;
  ditto.maxUses = null;
  for (const source of [rotom, ditto, eggSource]) {
    source.locationId = 'test-day-care';
    source.requirements = source === eggSource ? { kind: 'capability', id: 'day-care' } : noRequirements;
  }
  game.sources = [rotom, ditto, eggSource];
  game.evolutions = [];
  game.formChanges = [];
  game.items = [];
  game.choices = [];
  game.exclusions = [];
  return game;
}

function snapshot(game: GameData): AvailabilitySnapshot {
  const milestone = game.milestones[0];
  const solved = solve(game, milestone, false);
  const paths: AvailabilitySnapshot['paths'] = {};
  const entries: AvailabilitySnapshot['entries'] = {};
  for (const [pokemonId, pokemonPaths] of solved.paths) {
    for (const path of pokemonPaths) paths[path.id] = path;
    entries[pokemonId] = { pokemonId, status: 'available', currentPathIds: pokemonPaths.map(path => path.id),
      futurePathIds: [], firstMilestoneIds: [], blockers: [] };
  }
  return { query: { gameId: game.game.id, milestoneId: milestone.id, respectLevelLimit: false }, levelLimit: null,
    entries, paths, choiceGroups: game.choices, resourceLimits: solved.resourceLimits };
}

describe.each(games)('%s genderless Ditto breeding', id => {
  it('supports each breedable genderless parent in a reviewed offspring rule', () => {
    const game = dataset.games.find(row => row.game.id === id)!;
    const missing = game.profiles.filter(profile => profile.genders.includes('genderless')
      && profile.breeding?.eggGroupIds.length
      && !profile.breeding.eggGroupIds.some(group => ['undiscovered', 'ditto'].includes(group)))
      .filter(profile => !game.breedingRules.some(rule => rule.parentPokemonIds.includes(profile.pokemonId)
        || profile.forms?.some(form => rule.parentFormIds?.includes(form.formId))))
      .map(profile => profile.pokemonId);
    expect(missing).toEqual([]);
  });

  it('breeds a level-one Rotom from one finite Rotom and Ditto, then supports two Rotom', () => {
    const game = tinyRotomGame(id);
    const available = snapshot(game);
    const rotomPaths = Object.values(available.paths).filter(path => path.pokemonId === 'rotom');
    expect(rotomPaths.some(path => path.minimumLevel === game.game.breeding!.hatchLevel
      && path.breedingSteps.some(step => step.parents.some(parent => parent.pokemonId === 'ditto')))).toBe(true);
    expect(checkTeam(available, ['rotom', 'rotom'], 'whole-game').feasible).toBe(true);
  });
});
