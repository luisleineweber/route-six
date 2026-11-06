import { beforeAll, describe, expect, it } from 'vitest';
import { dataset } from './local-data';
import { isProgressReady } from '../src/data/game-catalogue';
import { solve } from '../src/domain/availability/solve';
import { pokemonBlockers } from '../src/domain/availability/blockers';
import { checkTeam } from '../src/domain/team/check-team';
import type { AccessContext } from '../src/domain/availability/context';
import type { AvailabilitySnapshot, GameData } from '../src/domain/types';

const ids = ['x', 'y'] as const;
const games = Object.fromEntries(ids.map(id => [id, dataset.games.find(row => row.game.id === id)!])) as Record<typeof ids[number], GameData>;
const whole = {} as Record<typeof ids[number], AccessContext>;
const snapshots = {} as Record<typeof ids[number], AvailabilitySnapshot>;
const contexts = new Map<string, AccessContext>();
function at(game: GameData, milestoneId: string, levelLimit = true) {
  const key = `${game.game.id}:${milestoneId}:${levelLimit}`;
  if (!contexts.has(key)) contexts.set(key, solve(game, game.milestones.find(row => row.id === milestoneId)!, levelLimit));
  return contexts.get(key)!;
}

function snapshotAt(game: GameData, milestoneId: string): AvailabilitySnapshot {
  const ctx = at(game, milestoneId, false);
  const snapshot: AvailabilitySnapshot = {
    query: { gameId: game.game.id, milestoneId, respectLevelLimit: false },
    levelLimit: null, entries: {}, paths: {},
    choiceGroups: game.choices, resourceLimits: ctx.resourceLimits,
  };
  for (const [selection, paths] of ctx.paths) {
    for (const path of paths) snapshot.paths[path.id] = path;
    snapshot.entries[selection] = { pokemonId: paths[0].pokemonId, status: 'available',
      currentPathIds: paths.map(path => path.id), futurePathIds: [], firstMilestoneIds: [], blockers: [] };
  }
  return snapshot;
}

beforeAll(() => {
  for (const id of ids) {
    const game = games[id];
    const ctx = solve(game, game.milestones.find(row => row.id === 'kiloude')!, false,
      new Set(game.milestones.map(row => row.id)));
    whole[id] = ctx;
    const snapshot: AvailabilitySnapshot = {
      query: { gameId: id, milestoneId: 'kiloude', respectLevelLimit: false },
      levelLimit: null, entries: {}, paths: {}, choiceGroups: game.choices, resourceLimits: ctx.resourceLimits,
    };
    for (const [selection, paths] of ctx.paths) {
      for (const path of paths) snapshot.paths[path.id] = path;
      snapshot.entries[selection] = { pokemonId: paths[0].pokemonId, status: 'available',
        currentPathIds: paths.map(path => path.id), futurePathIds: [], firstMilestoneIds: [], blockers: [] };
    }
    snapshots[id] = snapshot;
  }
}, 60000);

describe.each(ids)('Reviewed %s Progress Planner', id => {
  const game = games[id];
  it('loads the reviewed progress data', () => {
    expect(game.game.planner).not.toBeNull();
    expect(isProgressReady(id)).toBe(true);
  });

  it('resolves every native species and keeps player trade blockers separate', () => {
    expect(game.profiles.filter(row => whole[id].paths.has(row.pokemonId))).toHaveLength(435);
    expect(whole[id].paths.size).toBe(448);
    expect(game.exclusions).toHaveLength(271);
    const missing = game.profiles.filter(row => !whole[id].paths.has(row.pokemonId)
      && !game.exclusions.some(exclusion => exclusion.pokemonId === row.pokemonId));
    expect(missing).toHaveLength(15);
    for (const profile of missing) expect(pokemonBlockers(game, whole[id], profile.pokemonId)
      .some(reason => reason.code === 'player-trade'), profile.pokemonId).toBe(true);
    for (const exclusion of game.exclusions) expect(whole[id].paths.has(exclusion.pokemonId), exclusion.pokemonId).toBe(false);
    expect(game.exclusions.find(row => row.pokemonId === 'ivysaur')?.reason).toBeUndefined();
    expect(game.exclusions.find(row => row.pokemonId === 'wartortle')?.reason).toBeUndefined();
    expect(game.exclusions.find(row => row.pokemonId === 'metang')?.reason).toBe('external-connection');
  });

  it.each([
    [['chespin', 'froakie'], true],
    [['chespin', 'fennekin', 'froakie'], false],
    [['bulbasaur', 'charmander'], false],
    [['tyrunt', 'amaura'], false],
    [['steelix', 'steelix'], false],
    [['chespin', 'articuno'], true],
    [['chespin', 'froakie', 'zapdos'], false],
    [['rotom', 'rotom-heat', 'rotom-wash', 'rotom-frost', 'rotom-fan', 'rotom-mow'], true],
  ] as [string[], boolean][])('checks one-save resources for %j', (team, feasible) => {
    expect(checkTeam(snapshots[id], team, 'current-progress').feasible).toBe(feasible);
  });

  it('opens Route 22 before Viola and Route 10 before Grant', () => {
    const early = at(game, 'route-22');
    expect(early.limit).toBe(12);
    expect(early.paths.has('riolu')).toBe(true);
    expect(early.paths.has('farfetchd')).toBe(true);
    expect(early.paths.has('eevee')).toBe(false);
    const grant = at(game, 'route-10');
    expect(grant.limit).toBe(25);
    expect(grant.paths.has('eevee')).toBe(true);
    expect(grant.paths.has('steelix')).toBe(true);
    expect(grant.paths.has('meowstic')).toBe(true);
    expect(grant.paths.get('meowstic')?.every(path => path.genders.every(gender => gender === 'male'))).toBe(true);
    expect(grant.paths.get('meowstic-female')?.every(path => path.genders.every(gender => gender === 'female'))).toBe(true);
  });

  it('keeps Surf and the Lapras gift after the Tower of Mastery', () => {
    expect(at(game, 'reflection-cave').paths.has('lapras')).toBe(false);
    expect(at(game, 'route-12').paths.has('lapras')).toBe(true);
    expect(game.capabilities.find(row => row.id === 'surf')?.requirements)
      .toMatchObject({ kind: 'all', requirements: [
        { kind: 'milestone', id: 'shalour-gym' }, { kind: 'item', id: 'hm03' },
      ] });
  });

  it('opens Route 13 and magnetic evolution before Ramos', () => {
    const ctx = at(game, 'route-13');
    expect(ctx.limit).toBe(34);
    expect(ctx.paths.has('gible')).toBe(true);
    expect(ctx.paths.has('probopass')).toBe(true);
    expect(ctx.reached.has('coumarine-gym')).toBe(false);
    expect(ctx.reached.has('power-plant-clear')).toBe(false);
  });

  it('opens Route 21 before Wulfric with a native path', () => {
    const ctx = at(game, 'route-21');
    expect(ctx.reached.has('route-21')).toBe(true);
    expect(ctx.reached.has('snowbelle-gym')).toBe(false);
    expect(ctx.paths.has('poliwhirl')).toBe(true);
  });

  it('keeps hotel trades finite and allows repeatable wild Magikarp', () => {
    const early = at(game, 'camphrier', false);
    expect(early.paths.get('eevee')?.length).toBeGreaterThan(0);
    expect(early.paths.get('eevee')?.every(path => path.sourceIds.includes('xy-npc-trade-eevee'))).toBe(true);
    expect(early.reached.has('snorlax-clear')).toBe(false);
    const hotelSnapshot = snapshotAt(game, 'camphrier');
    expect(checkTeam(hotelSnapshot, ['eevee'], 'current-progress').feasible).toBe(true);
    expect(checkTeam(hotelSnapshot, ['eevee', 'eevee'], 'current-progress').feasible).toBe(false);

    const magikarpTrade = game.sources.find(source => source.id === 'xy-npc-trade-magikarp')!;
    expect(magikarpTrade.maxUses).toBe(1);
    expect(magikarpTrade.details).toMatchObject({ kind: 'game-trade', offeredPokemonId: 'gyarados' });
    expect(magikarpTrade.requirements).toMatchObject({ kind: 'all', requirements: [
      { kind: 'milestone', id: 'camphrier' },
      { kind: 'pokemon', id: 'gyarados', quantity: 1, consumed: true },
    ] });
    expect(checkTeam(snapshots[id], ['magikarp', 'magikarp'], 'current-progress').feasible).toBe(true);
  });

  it('allows party-type evolution with a native party partner', () => {
    const ctx = at(game, 'shalour');
    expect(ctx.limit).toBe(32);
    const paths = ctx.paths.get('pangoro')!;
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.every(path => path.individuals.length > 1)).toBe(true);
    expect(paths.some(path => path.sourceIds.some(sourceId => game.sources.find(row => row.id === sourceId)?.pokemonId === 'scraggy'))).toBe(true);
  });

  it('keeps Frost Cavern Cryogonal native and waits for Goodra level 50', () => {
    const frost = at(game, 'frost-cavern');
    expect(frost.limit).toBe(48);
    expect(frost.paths.has('cryogonal')).toBe(true);
    expect(frost.paths.has('goodra')).toBe(false);
    expect(frost.paths.has('weavile')).toBe(false);
    const olympia = at(game, 'anistar-gym');
    expect(olympia.limit).toBe(48);
    expect(olympia.paths.has('goodra')).toBe(false);
    expect(at(game, 'lysandre-labs').paths.has('goodra')).toBe(true);
  });

  it('keeps the Zygarde chamber closed after ordinary Terminus Cave opens', () => {
    const cave = at(game, 'terminus-cave', false);
    expect(cave.paths.has('durant')).toBe(true);
    expect(cave.paths.has('zygarde')).toBe(false);
    expect(cave.paths.has('mewtwo')).toBe(false);
    expect(whole[id].paths.has('zygarde')).toBe(true);
    expect(whole[id].paths.has('mewtwo')).toBe(true);
  });

  it('keeps version legends and repeatable postgame fossils separate', () => {
    const ctx = whole[id];
    expect(ctx.paths.has(id === 'x' ? 'xerneas' : 'yveltal')).toBe(true);
    expect(ctx.paths.has(id === 'x' ? 'yveltal' : 'xerneas')).toBe(false);
    for (const species of id === 'x' ? ['lileep', 'anorith'] : ['omanyte', 'kabuto']) {
      expect(ctx.paths.has(species), species).toBe(true);
    }
    for (const species of id === 'x' ? ['omanyte', 'kabuto'] : ['lileep', 'anorith']) {
      expect(ctx.paths.has(species), species).toBe(false);
    }
  });

  it('retains all four Pumpkaboo sizes and blocks each Gourgeist player trade', () => {
    for (const selection of ['pumpkaboo', 'pumpkaboo-small', 'pumpkaboo-large', 'pumpkaboo-super']) {
      expect(whole[id].paths.has(selection), selection).toBe(true);
    }
    for (const selection of ['gourgeist', 'gourgeist-small', 'gourgeist-large', 'gourgeist-super']) {
      expect(whole[id].paths.has(selection), selection).toBe(false);
    }
    for (const size of ['small', 'large', 'super']) {
      const formId = `pumpkaboo-${size}`;
      const rule = game.breedingRules.find(row => row.parentFormIds?.includes(formId))!;
      expect(rule.parentPokemonIds).toEqual([]);
      expect(rule.parentFormIds).toEqual([formId, `gourgeist-${size}`]);
      expect(game.sources.filter(row => row.details.kind === 'breeding' && row.details.ruleId === rule.id)
        .map(row => row.formId)).toEqual([formId]);
      expect(whole[id].paths.get(formId)?.some(path => path.breedingSteps
        .some(step => step.ruleId === rule.id))).toBe(true);
    }
  });
});
