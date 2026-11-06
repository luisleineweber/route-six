import { beforeAll, describe, expect, it } from 'vitest';
import { dataset } from './local-data';
import { isProgressReady } from '../src/data/game-catalogue';
import { solve } from '../src/domain/availability/solve';
import { ancestors } from '../src/domain/availability/context';
import { pokemonBaseStats } from '../src/data/base-stats';
import type { AccessContext } from '../src/domain/availability/context';
import type { GameData } from '../src/domain/types';

const ids = ['heartgold', 'soulsilver'] as const;
const games = Object.fromEntries(ids.map(id => [id, dataset.games.find(g => g.game.id === id)!])) as Record<typeof ids[number], GameData>;
const whole = {} as Record<typeof ids[number], AccessContext>;
const cache = new Map<string, AccessContext>();
function at(game: GameData, id: string) {
  const key = `${game.game.id}:${id}`;
  if (!cache.has(key)) cache.set(key, solve(game, game.milestones.find(m => m.id === id)!, false));
  return cache.get(key)!;
}

beforeAll(() => {
  for (const id of ids) {
    const game = games[id];
    whole[id] = solve(game, game.milestones.find(m => m.id === 'red-defeated')!, false,
      new Set(game.milestones.map(m => m.id)));
    at(game, 'before-league');
    at(game, 'national-dex');
    at(game, 'red-defeated');
    at(game, 'before-whitney');
  }
}, 300_000);

describe.each(ids)('%s reviewed Progress Planner', id => {
  const game = games[id];

  it('registers the eight Johto Gyms and the Pokémon League', () => {
    expect(isProgressReady(id)).toBe(true);
    expect(game.game.firstMilestoneId).toBe('new-bark-town');
    expect(game.game.planner?.defaultMilestoneId).toBe('before-league');
    expect(game.game.planner?.checkpoints.map(p => p.milestoneId)).toEqual([
      'violet-gym', 'before-bugsy', 'before-whitney', 'before-morty', 'before-chuck',
      'before-jasmine', 'before-pryce', 'before-clair', 'before-league',
    ]);
  });

  it('keeps the version tower encounter before the League journey', () => {
    expect(ancestors(game, 'before-league').has('tower-legend-resolved')).toBe(true);
    expect(ancestors(game, 'before-league').has('kimono-girls')).toBe(true);
    expect(game.milestones.find(m => m.id === 'tower-legend-resolved')?.locationId)
      .toBe(id === 'heartgold' ? 'bell-tower-summit' : 'whirl-islands-lugia-cave');
    expect(at(game, 'before-league').paths.has(id === 'heartgold' ? 'ho-oh' : 'lugia')).toBe(true);
  });

  it('keeps Route 47 and the Safari approach behind Amphy’s medicine', () => {
    expect(ancestors(game, 'route-47').has('amphy-healed')).toBe(true);
    expect(ancestors(game, 'route-48').has('amphy-healed')).toBe(true);
    expect(ancestors(game, 'before-chuck').has('amphy-healed')).toBe(false);
    expect(JSON.stringify(game.locations.find(l => l.id === 'route-47')!.requirements)).toContain('amphy-healed');
  });

  it('keeps radio replacements and Safari block species after the National Pokédex', () => {
    expect(at(game, 'before-league').paths.has('shinx')).toBe(false);
    expect(at(game, 'national-dex').paths.has('shinx')).toBe(true);
    expect(at(game, 'before-league').paths.has('riolu')).toBe(false);
    expect(whole[id].paths.has('riolu')).toBe(true);
    for (const source of game.sources) {
      for (const condition of source.encounterConditions ?? []) {
        if (condition.kind === 'radio') expect(JSON.stringify(source.requirements)).toContain(`${condition.sound}-sound`);
        if (condition.kind === 'safari-blocks') expect(JSON.stringify(source.requirements)).toContain('safari-blocks');
      }
    }
  });

  it('keeps optional visits usable after later story progress', () => {
    const afterRed = at(game, 'red-defeated');
    for (const pokemonId of ['raichu', 'bellossom', 'sunflora', 'vaporeon', 'jolteon', 'flareon',
      'mamoswine', 'ludicolo', 'shiftry', 'nincada', 'whismur', 'makuhita', 'plusle', 'minun',
      'numel', 'spoink', 'absol', 'roserade', 'burmy', 'cherubi', 'mismagius', 'honchkrow', 'chatot', 'togekiss', 'gallade']) {
      expect(afterRed.paths.has(pokemonId), pokemonId).toBe(true);
    }
    expect(at(game, 'before-whitney').paths.has('sunflora')).toBe(true);
  }, 30_000);

  it('requires Rock Climb for the remote Burmy and Cherubi trees', () => {
    for (const pokemonId of ['burmy', 'cherubi']) {
      expect(at(game, 'before-league').paths.has(pokemonId)).toBe(false);
      expect(whole[id].paths.has(pokemonId)).toBe(true);
      const trees = game.sources.filter(s => s.pokemonId === pokemonId && s.details.kind === 'wild');
      expect(trees.length).toBeGreaterThan(0);
      for (const tree of trees) expect(JSON.stringify(tree.requirements)).toContain('rock-climb');
    }
  });

  it('reaches native fixed encounters and keeps opposite-version legends blocked', () => {
    for (const pokemonId of ['articuno', 'zapdos', 'moltres', 'mewtwo', 'raikou', 'entei', 'suicune', 'ho-oh', 'lugia', 'porygon']) {
      expect(whole[id].paths.has(pokemonId), pokemonId).toBe(true);
    }
    expect(whole[id].paths.has(id === 'heartgold' ? 'kyogre' : 'groudon')).toBe(true);
    expect(whole[id].paths.has(id === 'heartgold' ? 'groudon' : 'kyogre')).toBe(false);
    expect(whole[id].paths.has('rayquaza')).toBe(false);
  });

  it('uses the correct version fossils and a consumed fossil for each revival', () => {
    const native = id === 'heartgold' ? ['omanyte', 'anorith'] : ['kabuto', 'lileep'];
    const other = id === 'heartgold' ? ['kabuto', 'lileep'] : ['omanyte', 'anorith'];
    for (const pokemonId of [...native, 'aerodactyl']) expect(whole[id].paths.has(pokemonId), pokemonId).toBe(true);
    for (const pokemonId of other) expect(whole[id].paths.has(pokemonId), pokemonId).toBe(false);
    for (const source of game.sources.filter(s => s.details.kind === 'fossil')) {
      expect(source.level).toEqual({ kind: 'fixed', value: 20 });
      expect(source.requirements).toMatchObject({ kind: 'item', quantity: 1, consumed: true });
    }
  });

  it('provides native breeding sources for babies and preserves form stats', () => {
    for (const pokemonId of ['pichu', 'cleffa', 'igglybuff', 'smoochum', 'elekid', 'magby', 'wynaut', 'bonsly', 'mime-jr', 'happiny', 'munchlax']) {
      expect(whole[id].paths.has(pokemonId), pokemonId).toBe(true);
    }
    expect(pokemonBaseStats(id, 'wormadam-sandy')).toEqual([60, 79, 105, 36, 59, 85]);
    expect(pokemonBaseStats(id, 'giratina-origin')).toEqual([150, 120, 100, 90, 120, 100]);
    expect(game.sources.some(s => s.id === 'gift-tentacool-rescue')).toBe(false);
    expect(whole[id].paths.has('tentacool')).toBe(true);
  });
});
