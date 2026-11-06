import { beforeAll, describe, expect, it } from 'vitest';
import { dataset } from './local-data';
import { solve } from '../src/domain/availability/solve';
import { pokemonBlockers } from '../src/domain/availability/blockers';
import { checkTeam } from '../src/domain/team/check-team';
import type { AccessContext } from '../src/domain/availability/context';
import type { AvailabilitySnapshot, GameData } from '../src/domain/types';

const ids = ['diamond', 'pearl'] as const;
const games = Object.fromEntries(ids.map(id => [id, dataset.games.find(game => game.game.id === id)!])) as Record<typeof ids[number], GameData>;
const at = (game: GameData, milestoneId: string) => game.milestones.find(row => row.id === milestoneId)!;
const whole = {} as Record<typeof ids[number], AccessContext>;
const snapshots = {} as Record<typeof ids[number], AvailabilitySnapshot>;

beforeAll(() => {
  for (const id of ids) {
    const game = games[id];
    whole[id] = solve(game, at(game, 'hall-of-fame'), false, new Set(game.milestones.map(row => row.id)));
    const snapshot: AvailabilitySnapshot = { query: { gameId: id, milestoneId: 'hall-of-fame', respectLevelLimit: false },
      levelLimit: null, entries: {}, paths: {}, choiceGroups: game.choices, resourceLimits: whole[id].resourceLimits };
    for (const [pokemonId, paths] of whole[id].paths) {
      for (const path of paths) snapshot.paths[path.id] = path;
      snapshot.entries[pokemonId] = { pokemonId: paths[0].pokemonId, status: 'available', currentPathIds: paths.map(path => path.id),
        futurePathIds: [], firstMilestoneIds: [], blockers: [] };
    }
    snapshots[id] = snapshot;
  }
}, 60000);

describe.each(ids)('%s progress data', id => {
  const game = games[id];
  const ctx = () => whole[id];

  it('closes the 363-species inventory and keeps trade blockers explicit', () => {
    const expected = game.profiles.filter(profile => !game.exclusions.some(row => row.pokemonId === profile.pokemonId));
    const actualBase = expected.filter(profile => ctx().paths.has(profile.pokemonId));
    expect(actualBase).toHaveLength(363);
    expect(game.exclusions).toHaveLength(117);
    expect(ctx().paths.size).toBe(369);
    const missing = game.profiles.filter(profile => !ctx().paths.has(profile.pokemonId)
      && !game.exclusions.some(row => row.pokemonId === profile.pokemonId));
    expect(missing).toHaveLength(13);
    for (const profile of missing) expect(pokemonBlockers(game, ctx(), profile.pokemonId)
      .some(reason => reason.code === 'player-trade'), profile.pokemonId).toBe(true);
  });

  it('allows one starter family and rejects two starter choices', () => {
    const family = id === 'diamond' ? ['turtwig', 'grotle', 'torterra'] : ['piplup', 'prinplup', 'empoleon'];
    const other = id === 'diamond' ? 'chimchar' : 'turtwig';
    expect(checkTeam(snapshots[id], family, 'current-progress').feasible).toBe(true);
    expect(checkTeam(snapshots[id], [family[0], other], 'current-progress').feasible).toBe(false);
  });

  it('keeps version fossil and box legend exclusive, with level 47 legends', () => {
    const fossil = id === 'diamond' ? 'cranidos' : 'shieldon';
    const other = id === 'diamond' ? 'shieldon' : 'cranidos';
    const legend = id === 'diamond' ? 'dialga' : 'palkia';
    const rivalLegend = id === 'diamond' ? 'palkia' : 'dialga';
    expect(ctx().paths.has(fossil)).toBe(true);
    expect(ctx().paths.has(other)).toBe(false);
    expect(ctx().paths.has(legend)).toBe(true);
    expect(ctx().paths.has(rivalLegend)).toBe(false);
    expect(game.sources.find(source => source.pokemonId === legend && source.details.kind === 'static')?.level)
      .toEqual({ kind: 'fixed', value: 47 });
  });

  it('keeps progress gates on HMs and early eggs', () => {
    const capability = (capabilityId: string) => game.capabilities.find(row => row.id === capabilityId)!;
    expect(JSON.stringify(capability('surf').requirements)).toContain('hearthome-gym');
    expect(JSON.stringify(capability('surf').requirements)).toContain('hm03');
    expect(JSON.stringify(capability('strength').requirements)).toContain('canalave-gym');
    const hm04 = game.items.find(item => item.id === 'hm04')!;
    expect(hm04.sources.some(source => source.locationId === 'route-209-lost-tower-5f')).toBe(true);
    expect(hm04.sources.some(source => source.locationId === 'iron-island')).toBe(false);
    const early = solve(game, at(game, 'hearthome'), false);
    expect(early.paths.has('happiny')).toBe(true);
    expect(early.paths.has('togepi')).toBe(false);
    const gibleSource = game.sources.find(source => source.pokemonId === 'gible' && source.details.kind === 'wild')!;
    expect(gibleSource.locationId).toBe('wayward-cave-b1f');
    const caveRequirements = JSON.stringify(game.locations.find(location => location.id === gibleSource.locationId)?.requirements);
    expect(caveRequirements).toContain('cut');
    expect(caveRequirements).toContain('strength');
  });

  it('gates Eevee and night Rotom on National Dex', () => {
    expect(ctx().paths.has('eevee')).toBe(true);
    expect(ctx().paths.has('rotom')).toBe(true);
    for (const pokemonId of ['eevee', 'rotom']) {
      const source = game.sources.find(row => row.pokemonId === pokemonId && (row.details.kind === 'static' || row.details.kind === 'gift'));
      expect(source?.requirements).toMatchObject({ kind: 'capability', id: 'national-dex' });
    }
    const rotom = game.sources.find(source => source.pokemonId === 'rotom' && source.details.kind === 'static')!;
    expect(rotom.encounterConditions).toContainEqual({ kind: 'time', periods: ['night'] });
  });

  it('records regional form paths without origin forms and keeps the East evolution link', () => {
    for (const formId of ['burmy-sandy', 'burmy-trash', 'shellos-east', 'gastrodon-east', 'wormadam-sandy', 'wormadam-trash']) {
      expect(ctx().paths.has(formId), formId).toBe(true);
    }
    expect([...ctx().paths.keys()].some(key => key.includes('origin'))).toBe(false);
    expect(game.evolutions.some(edge => edge.fromPokemonId === 'shellos' && edge.fromFormId === 'shellos-east'
      && edge.toPokemonId === 'gastrodon' && edge.toFormId === 'gastrodon-east')).toBe(true);
  });

  it('keeps the Snowpoint Haunter trade separate from player-trade Gengar', () => {
    const npcHaunter = game.sources.find(source => source.pokemonId === 'haunter' && source.details.kind === 'game-trade');
    expect(npcHaunter).toBeDefined();
    expect(ctx().paths.has('haunter')).toBe(true);
    expect(ctx().paths.has('gengar')).toBe(false);
    expect(game.exclusions.some(row => row.pokemonId === 'gengar')).toBe(false);
    expect(pokemonBlockers(game, ctx(), 'gengar').some(reason => reason.code === 'player-trade')).toBe(true);
  });
});
