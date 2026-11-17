import { beforeAll, describe, expect, it } from 'vitest';
import { dataset } from './local-data';
import { checkTeam } from '../src/domain/team/check-team';
import { createInitialState } from '../src/features/planner/state';
import { buildTeamExport } from '../src/features/export/export-model';
import type { AvailabilitySnapshot } from '../src/domain/types';
import { kiloudeSnapshot, xyGameIds as ids } from './xy-snapshots';
const snapshots = new Map<string, AvailabilitySnapshot>();

beforeAll(() => {
  for (const id of ids) snapshots.set(id, kiloudeSnapshot(id));
}, 60_000);

describe.each(ids)('%s progress export choices', id => {
  it.each([
    [['chespin', 'fennekin', 'froakie', 'pangoro'], [0, 1, 2]],
    [['pangoro', 'chespin', 'fennekin', 'froakie'], [1, 2, 3]],
  ])('names only the starters, not Pangoro with its free Scraggy path (%j)', (team, expected) => {
    const snapshot = snapshots.get(id)!;
    const pangoro = snapshot.entries.pangoro.currentPathIds.map(pathId => snapshot.paths[pathId]);
    expect(pangoro.some(path => path.choices.length > 0)).toBe(true);
    expect(pangoro.some(path => path.choices.length === 0)).toBe(true);
    const conflict = checkTeam(snapshot, team, 'current-progress').warnings.find(warning => warning.code === 'choice-conflict')!;
    expect(conflict.slotIndexes).toEqual(expected);
  });

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
