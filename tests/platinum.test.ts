import { beforeAll, describe, expect, it } from 'vitest';
import { dataset } from './local-data';
import { solve } from '../src/domain/availability/solve';
import { pokemonBlockers } from '../src/domain/availability/blockers';
import { checkTeam } from '../src/domain/team/check-team';
import type { AvailabilitySnapshot } from '../src/domain/types';
import type { AccessContext } from '../src/domain/availability/context';

const game = dataset.games.find(value => value.game.id === 'platinum')!;
const at = (id: string) => game.milestones.find(row => row.id === id)!;
let whole: AccessContext;
let hallOfFame: AccessContext;
let snapshot: AvailabilitySnapshot;
beforeAll(() => {
  whole = solve(game, at('hall-of-fame'), false, new Set(game.milestones.map(row => row.id)));
  hallOfFame = solve(game, at('hall-of-fame'), true);
  snapshot = { query: { gameId: 'platinum', milestoneId: 'hall-of-fame', respectLevelLimit: false },
    levelLimit: null, entries: {}, paths: {}, choiceGroups: game.choices, resourceLimits: whole.resourceLimits };
  for (const [id, paths] of whole.paths) {
    for (const path of paths) snapshot.paths[path.id] = path;
    snapshot.entries[id] = { pokemonId: paths[0].pokemonId, status: 'available', currentPathIds: paths.map(path => path.id),
      futurePathIds: [], firstMilestoneIds: [], blockers: [] };
  }
}, 60000);

describe('Platinum progress data', () => {
  it('covers all species with native paths, explicit exclusions or player trade rules', () => {
    const base = game.profiles.filter(profile => whole.paths.has(profile.pokemonId));
    expect(base).toHaveLength(382);
    expect(whole.paths.size).toBe(389);
    expect(game.exclusions).toHaveLength(97);
    const blocked = game.profiles.filter(profile => !whole.paths.has(profile.pokemonId)
      && !game.exclusions.some(row => row.pokemonId === profile.pokemonId));
    expect(blocked).toHaveLength(14);
    for (const profile of blocked) {
      expect(pokemonBlockers(game, whole, profile.pokemonId).some(reason => reason.code === 'player-trade')).toBe(true);
    }
  });

  it('keeps starter families possible and different starters mutually exclusive', () => {
    expect(checkTeam(snapshot, ['turtwig', 'grotle', 'torterra'], 'current-progress').feasible).toBe(true);
    expect(checkTeam(snapshot, ['turtwig', 'chimchar'], 'current-progress').feasible).toBe(false);
  });

  it('retains Trainer ID fossil parity and one Giratina across both capture sites', () => {
    expect(checkTeam(snapshot, ['cranidos', 'rampardos'], 'current-progress').feasible).toBe(true);
    expect(checkTeam(snapshot, ['cranidos', 'shieldon'], 'current-progress').feasible).toBe(false);
    expect(checkTeam(snapshot, ['giratina-origin'], 'current-progress').feasible).toBe(true);
    expect(checkTeam(snapshot, ['giratina', 'giratina-origin'], 'current-progress').feasible).toBe(false);
  });

  it('checks early eggs, cave access and the next Gym level limit', () => {
    const early = solve(game, at('eterna-city'), true);
    expect(early.paths.has('togepi')).toBe(false);
    expect(early.paths.has('gible')).toBe(false);
    const rescued = solve(game, at('eterna-galactic-clear'), true);
    for (const id of ['togepi', 'gible', 'gabite']) expect(rescued.paths.has(id), id).toBe(true);
    expect(rescued.paths.has('garchomp')).toBe(false);
  });

  it('makes Origin Forme reachable after Hall of Fame without an optional path visit', () => {
    expect(hallOfFame.paths.has('giratina-origin')).toBe(true);
    expect(hallOfFame.paths.has('dialga')).toBe(true);
    expect(hallOfFame.paths.has('spiritomb')).toBe(false);
    expect(hallOfFame.paths.has('regigigas')).toBe(false);
  });

  it('exposes all eight badges, the League stages and the native Friday condition', () => {
    const points = new Set(game.game.planner!.checkpoints.map(point => point.milestoneId));
    for (const id of ['oreburgh-gym', 'eterna-gym', 'hearthome-gym', 'veilstone-gym',
      'pastoria-gym', 'canalave-gym', 'snowpoint-gym', 'sunyshore-gym',
      'league-aaron', 'league-bertha', 'league-flint', 'league-lucian', 'hall-of-fame']) expect(points.has(id), id).toBe(true);
    expect(game.sources.find(source => source.id === 'drifloon-valley-windworks')).toMatchObject({
      maxUses: null, details: { kind: 'static' }, encounterConditions: [{ kind: 'weekday', day: 'friday' }],
      requirements: { kind: 'milestone', id: 'windworks-clear' },
    });
  });
});
