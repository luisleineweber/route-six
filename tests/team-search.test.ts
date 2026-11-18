import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkTeam } from '../src/domain/team/check-team';
import type { ProofPath } from '../src/domain/proofs';
import type { AcquisitionPath, AvailabilitySnapshot } from '../src/domain/types';
import { kiloudeSnapshot, xyGameIds as ids } from './xy-snapshots';

// A blocked search cannot be stopped by a Vitest timeout, so each check has a budget of conflict checks.
const budget = { calls: 0, limit: Infinity };
vi.mock('../src/domain/team/resources', async importOriginal => {
  const actual = await importOriginal<typeof import('../src/domain/team/resources')>();
  return { ...actual, findConflict: (...args: Parameters<typeof actual.findConflict>) => {
    if (++budget.calls > budget.limit) throw new Error(`More than ${budget.limit} conflict checks`);
    return actual.findConflict(...args);
  } };
});
const { findConflict } = await vi.importActual<typeof import('../src/domain/team/resources')>('../src/domain/team/resources');

beforeEach(() => { budget.calls = 0; budget.limit = Infinity; });

/** The first team, in member order and then path order, whose paths fit together. */
function firstFittingPaths(snapshot: AvailabilitySnapshot, team: string[]): (string | null)[] | null {
  const selected: AcquisitionPath[] = [];
  function visit(position: number): boolean {
    if (position === team.length) return true;
    for (const id of snapshot.entries[team[position]].currentPathIds) {
      selected.push(snapshot.paths[id]);
      if (!findConflict(snapshot, selected) && visit(position + 1)) return true;
      selected.pop();
    }
    return false;
  }
  return visit(0) ? selected.map(path => path.id) : null;
}

function reversedPaths(snapshot: AvailabilitySnapshot): AvailabilitySnapshot {
  const entries = Object.fromEntries(Object.entries(snapshot.entries).map(([id, entry]) =>
    [id, { ...entry, currentPathIds: [...entry.currentPathIds].reverse() }]));
  return { ...snapshot, entries };
}

const starters = ['chespin', 'fennekin', 'froakie'];
const pathRich = ['pangoro', 'lickilicky', 'poliwrath'];

describe.each(ids)('%s team search with path-rich members', id => {
  let snapshot: AvailabilitySnapshot;
  beforeAll(() => { snapshot = kiloudeSnapshot(id); }, 60_000);

  it.each([
    [[...pathRich, ...starters], [3, 4, 5]],
    [[...starters, ...pathRich], [0, 1, 2]],
    [['pangoro', ...starters], [1, 2, 3]],
    [[...starters, 'pangoro'], [0, 1, 2]],
  ])('finds the starter conflict in %j quickly', (team, core) => {
    budget.limit = 10_000;
    const start = performance.now();
    const check = checkTeam(snapshot, team, 'current-progress');
    expect(performance.now() - start).toBeLessThan(250);
    expect(check.feasible).toBe(false);
    expect(check.chosenPathIds).toEqual(team.map(() => null));
    expect(check.warnings).toEqual([{ code: 'choice-conflict', relatedId: 'kalos-starter', slotIndexes: core,
      message: 'These members need incompatible choices in Kalos starter. Select another family or source.' }]);
  });

  it.each([
    [[...pathRich, 'chespin']],
    [['chespin', ...pathRich]],
    [['poliwrath', 'froakie', 'lickilicky', 'pangoro']],
  ])('chooses the first fitting path for each member of %j', team => {
    for (const ordered of [snapshot, reversedPaths(snapshot)]) {
      const expected = firstFittingPaths(ordered, team);
      expect(expected).not.toBeNull();
      expect(checkTeam(ordered, team, 'current-progress')).toEqual({ feasible: true, chosenPathIds: expected, warnings: [] });
    }
  });
});

describe('team search with equal claims', () => {
  // Both paths claim one evolution stone, but a stone use is shared only by the same individual.
  const path = (gender: 'male' | 'female'): ProofPath => ({
    id: gender, pokemonId: 'a', sourceIds: ['repeatable'], evolutionIds: [], breedingSteps: [], genders: [gender],
    minimumLevel: 1, firstMilestoneIds: [], choices: [], coProductIds: [], outputOrigin: 'source:repeatable',
    ancestors: [], conditions: [],
    claims: [{ resourceId: 'source:repeatable', quantity: 1, use: 'retain' }, { resourceId: 'item-source:stone', quantity: 1, use: 'consume' }],
    individuals: [{ origin: 'source:repeatable', gender, stages: [`a:${gender}`], use: 'retain', coProducts: [] }],
    itemUses: [{ resourceId: 'item-source:stone', token: 'stone', quantity: 1, consumed: true, ownerOrigin: 'source:repeatable' }],
  });
  const entry = (pathIds: string[]) => ({ pokemonId: 'a', status: 'available' as const, currentPathIds: pathIds,
    futurePathIds: [], firstMilestoneIds: [], blockers: [] });
  const snapshot: AvailabilitySnapshot = {
    query: { gameId: 'test', milestoneId: 'start', respectLevelLimit: false }, levelLimit: null,
    entries: { first: entry(['male']), second: entry(['female', 'male']) },
    paths: { male: path('male'), female: path('female') },
    choiceGroups: [], resourceLimits: { 'source:repeatable': null, 'item-source:stone': 1 },
  };

  it('keeps paths whose item owners differ', () => {
    expect(checkTeam(snapshot, ['first', 'second'], 'current-progress'))
      .toEqual({ feasible: true, chosenPathIds: ['male', 'male'], warnings: [] });
  });
});
