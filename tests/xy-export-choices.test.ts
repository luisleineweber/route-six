import { beforeAll, describe, expect, it } from 'vitest';
import { dataset } from './local-data';
import { solve } from '../src/domain/availability/solve';
import { checkTeam } from '../src/domain/team/check-team';
import { createInitialState } from '../src/features/planner/state';
import { buildTeamExport } from '../src/features/export/export-model';
import type { AvailabilitySnapshot } from '../src/domain/types';

const ids = ['x', 'y'] as const;
const snapshots = new Map<string, AvailabilitySnapshot>();

beforeAll(() => {
  for (const id of ids) {
    const game = dataset.games.find(row => row.game.id === id)!;
    const ctx = solve(game, game.milestones.find(row => row.id === 'kiloude')!, false);
    const snapshot: AvailabilitySnapshot = {
      query: { gameId: id, milestoneId: 'kiloude', respectLevelLimit: false },
      levelLimit: null, entries: {}, paths: {}, choiceGroups: game.choices,
      resourceLimits: ctx.resourceLimits,
    };
    for (const [selection, paths] of ctx.paths) {
      for (const path of paths) snapshot.paths[path.id] = path;
      snapshot.entries[selection] = { pokemonId: paths[0].pokemonId, status: 'available',
        currentPathIds: paths.map(path => path.id), futurePathIds: [], firstMilestoneIds: [], blockers: [] };
    }
    snapshots.set(id, snapshot);
  }
}, 60_000);

describe.each(ids)('%s progress export choices', id => {
  it('keeps the shared starter choice conflict visible in the export', () => {
    const game = dataset.games.find(row => row.game.id === id)!;
    const state = { ...createInitialState(game), milestoneId: 'kiloude', respectLevelLimit: false,
      team: ['chespin', 'fennekin', 'froakie', null, null, null] };
    const model = buildTeamExport(game, state, true, snapshots.get(id)!);
    expect(model.notes).toEqual([expect.stringContaining('Team conflict:')]);
  });

  it('keeps separate sources for two Snorlax across empty team slots', () => {
    const game = dataset.games.find(row => row.game.id === id)!;
    const snapshot = snapshots.get(id)!;
    expect(checkTeam(snapshot, ['snorlax', 'snorlax'], 'current-progress').feasible).toBe(true);
    const state = { ...createInitialState(game), milestoneId: 'kiloude', respectLevelLimit: false,
      team: ['snorlax', null, null, 'snorlax', null, null] };
    const model = buildTeamExport(game, state, true, snapshot);
    expect(model.slots[1].dex).toBeNull();
    const methods = [model.slots[0].progress!.method, model.slots[3].progress!.method];
    expect(methods.filter(method => method === 'Fixed encounter')).toHaveLength(1);
    expect(methods.filter(method => method === 'Breeding')).toHaveLength(1);
  });

  it.each([
    ['chespin', 'fennekin'], ['chespin', 'froakie'], ['fennekin', 'froakie'],
  ])('exports a possible %s and %s pair across empty team slots', (first, second) => {
    const game = dataset.games.find(row => row.game.id === id)!;
    const snapshot = snapshots.get(id)!;
    expect(checkTeam(snapshot, [first, second], 'current-progress').feasible).toBe(true);
    const state = { ...createInitialState(game), milestoneId: 'kiloude', respectLevelLimit: false,
      team: [first, null, second, null, null, null] };
    const model = buildTeamExport(game, state, true, snapshot);
    expect(model.slots[1].dex).toBeNull();
    const methods = [model.slots[0].progress!.method, model.slots[2].progress!.method];
    expect(methods.filter(method => method === 'Starter')).toHaveLength(1);
    expect(methods.filter(method => method === 'In-game trade')).toHaveLength(1);
    expect([model.slots[0].progress, model.slots[2].progress]
      .some(content => content?.acquisition.includes('Offer Bunnelby.'))).toBe(true);
  });
});
