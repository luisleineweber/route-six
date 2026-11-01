import { beforeAll, describe, expect, it } from 'vitest';
import { dataset } from './local-data';
import { isProgressReady } from '../src/data/game-catalogue';
import { solve } from '../src/domain/availability/solve';
import { ancestors } from '../src/domain/availability/context';
import type { AccessContext } from '../src/domain/availability/context';
import type { GameData } from '../src/domain/types';

const ids = ['omega-ruby', 'alpha-sapphire'] as const;
const games = Object.fromEntries(ids.map(id => [id, dataset.games.find(row => row.game.id === id)!])) as Record<typeof ids[number], GameData>;
const cache = new Map<string, AccessContext>();
function at(game: GameData, milestoneId: string) {
  const key = `${game.game.id}:${milestoneId}`;
  if (!cache.has(key)) cache.set(key, solve(game, game.milestones.find(row => row.id === milestoneId)!, false));
  return cache.get(key)!;
}
const whole = {} as Record<typeof ids[number], AccessContext>;
beforeAll(() => {
  for (const id of ids) {
    const game = games[id];
    whole[id] = solve(game, game.milestones.find(row => row.id === 'league-rematch')!, false,
      new Set(game.milestones.map(row => row.id)));
    for (const point of ['mauville-gym', 'lavaridge-gym', 'mossdeep-gym', 'sootopolis-gym']) at(game, point);
  }
}, 300_000);

describe.each(ids)('%s Progress Planner', id => {
  const game = games[id];

  it('is registered with the eight Gyms and Victory Road', () => {
    expect(isProgressReady(id)).toBe(true);
    expect(game.game.firstMilestoneId).toBe('littleroot');
    expect(game.game.planner?.defaultMilestoneId).toBe('victory-road');
    expect(game.game.planner?.checkpoints.map(point => point.milestoneId)).toEqual(['rustboro-gym', 'dewford-gym',
      'mauville-gym', 'lavaridge-gym', 'petalburg-gym', 'fortree-gym', 'mossdeep-gym', 'sootopolis-gym', 'victory-road']);
  });

  it('puts the Primal event after the Mind Badge and before Wallace', () => {
    const seafloor = ancestors(game, 'seafloor-cavern');
    expect(seafloor.has('mossdeep-gym')).toBe(true);
    expect(seafloor.has('dive-received')).toBe(true);
    const wallace = ancestors(game, 'sootopolis-gym');
    expect(wallace.has('cave-of-origin')).toBe(true);
    expect(wallace.has('eon-flute')).toBe(true);
    const dive = game.capabilities.find(row => row.id === 'dive')!;
    expect(JSON.stringify(dive.requirements)).toContain('"mossdeep-gym"');
  });

  it('gives every location a checked access gate', () => {
    for (const location of game.locations) {
      expect(location.requirements, location.id).not.toEqual({ kind: 'all', requirements: [] });
    }
  });

  it('keeps side branches open at later checkpoints', () => {
    // Route 117 Day Care and the Route 111 desert are side branches, not checkpoint ancestors.
    const gymFour = at(game, 'lavaridge-gym');
    expect(gymFour.paths.has('budew')).toBe(true);
    expect(gymFour.paths.has('trapinch')).toBe(true);
    const gymThree = at(game, 'mauville-gym');
    expect(gymThree.paths.has('trapinch')).toBe(false);
  });

  it('keeps DexNav-only Pokémon behind Groudon or Kyogre', () => {
    const dexNav = game.sources.filter(source => source.details.kind === 'dexnav');
    expect(dexNav.length).toBeGreaterThan(100);
    for (const source of dexNav) expect(JSON.stringify(source.requirements), source.id).toContain('"cave-of-origin"');
    expect(at(game, 'mossdeep-gym').paths.has('lillipup')).toBe(false);
    expect(at(game, 'sootopolis-gym').paths.has('lillipup')).toBe(true);
  });

  it('reaches the version legends and keeps the other Eon Pokémon external', () => {
    const own = id === 'omega-ruby' ? ['groudon', 'latios', 'ho-oh'] : ['kyogre', 'latias', 'lugia'];
    const other = id === 'omega-ruby' ? 'latias' : 'latios';
    for (const species of own) expect(whole[id].paths.has(species), species).toBe(true);
    expect(game.exclusions.find(row => row.pokemonId === other)?.reason).toBe('external-event');
    for (const species of ['giratina', 'kyurem', 'landorus']) expect(whole[id].paths.has(species), species).toBe(false);
  });

  it('keeps the version Shellos form', () => {
    expect(whole[id].paths.has('shellos')).toBe(id === 'omega-ruby');
    expect(whole[id].paths.has('shellos-east')).toBe(id === 'alpha-sapphire');
  });
});
