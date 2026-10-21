import { describe, expect, it } from 'vitest';
import { solve } from '../src/domain/availability/solve';
import { getAvailability } from '../src/domain/availability';
import { checkTeam } from '../src/domain/team/check-team';
import type { AccessContext } from '../src/domain/availability/context';
import type { AvailabilitySnapshot } from '../src/domain/types';
import { breed, evolution, fixture, milestone, source } from './fixtures';

function testGame() {
  const value = fixture(['treecko', 'grovyle', 'ditto', 'ralts']);
  source(value.game, 'starter', 'treecko', 5, undefined, { maxUses: 1 });
  source(value.game, 'ditto', 'ditto', 20, milestone('gate'));
  source(value.game, 'wild-treecko', 'treecko', 30, milestone('future'));
  source(value.game, 'optional-ralts', 'ralts', 5, milestone('optional'));
  evolution(value.game, 'treecko', 'grovyle', 16);
  breed(value.game, 'treecko', ['treecko', 'grovyle'], 'treecko');
  return value;
}

function snapshot(context: AccessContext): AvailabilitySnapshot {
  const result = { query: { gameId: context.game.game.id, milestoneId: context.milestone.id, respectLevelLimit: true },
    entries: {}, paths: {}, choiceGroups: context.game.choices, resourceLimits: context.resourceLimits,
    levelLimit: null } as AvailabilitySnapshot;
  for (const [id, paths] of context.paths) {
    for (const path of paths) result.paths[path.id] = path;
    result.entries[id] = { pokemonId: paths[0].pokemonId, status: 'available', currentPathIds: paths.map(path => path.id),
      futurePathIds: [], firstMilestoneIds: [], blockers: [] };
  }
  return result;
}

describe('Reuse of earlier solved progress', () => {
  it('finds a partner through a shared second Egg Group', () => {
    const { game } = fixture(['treecko', 'swablu']);
    source(game, 'female-treecko', 'treecko', 5, undefined, { maxUses: 1, genders: ['female'] });
    source(game, 'male-swablu', 'swablu', 5, undefined, { genders: ['male'] });
    breed(game, 'treecko', ['treecko'], 'treecko');
    const context = solve(game, game.milestones.find(row => row.id === 'gate')!, true);
    const eggs = context.paths.get('treecko')!.filter(path => path.breedingSteps.length);
    expect(eggs.length).toBeGreaterThan(0);
    expect(eggs.every(path => path.breedingSteps[0].parents.some(parent => parent.pokemonId === 'swablu'))).toBe(true);
  });

  it('keeps native access and finite team results equal to a fresh solve', () => {
    const { game } = testGame();
    const gate = game.milestones.find(row => row.id === 'gate')!;
    const end = game.milestones.find(row => row.id === 'end')!;
    const earlier = solve(game, gate, true);
    const reused = solve(game, end, true, new Set(), 'reused', earlier);
    const fresh = solve(game, end, true, new Set(), 'fresh');
    expect([...reused.paths.keys()].sort()).toEqual([...fresh.paths.keys()].sort());
    for (const team of [['treecko', 'treecko', 'treecko'], ['treecko', 'grovyle', 'ditto']]) {
      expect(checkTeam(snapshot(reused), team, 'current-progress').feasible)
        .toBe(checkTeam(snapshot(fresh), team, 'current-progress').feasible);
    }
  });

  it('retains parent links inside the new context and leaves the earlier context unchanged', () => {
    const { game } = testGame();
    const earlier = solve(game, game.milestones.find(row => row.id === 'gate')!, true);
    const before = JSON.stringify([...earlier.paths.values()]);
    const later = solve(game, game.milestones.find(row => row.id === 'end')!, true, new Set(), 'later', earlier);
    const paths = [...later.paths.values()].flat();
    expect(paths.some(path => path.breedingSteps.length)).toBe(true);
    for (const path of paths) for (const step of path.breedingSteps) for (const parent of step.parents) {
      expect(paths.some(value => value.id === parent.pathId)).toBe(true);
    }
    expect(JSON.stringify([...earlier.paths.values()])).toBe(before);
  });

  it('does not carry a later optional visit into an earlier query', () => {
    const value = testGame();
    for (const id of ['optional', 'start']) {
      const result = getAvailability(value.data, { gameId: value.game.game.id, milestoneId: id, respectLevelLimit: true });
      if (!result.ok) throw new Error('Fixture query failed');
      expect(result.value.entries.ralts.status).toBe(id === 'optional' ? 'available' : 'later');
    }
  });
});
