import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import { validateDataset } from '../src/data/validate-dataset';
import { progressCheckpointOptions } from '../src/features/planner/progress-checkpoints';
import { createInitialState } from '../src/features/planner/state';
import { compatibleGenders } from '../src/domain/availability/breeding';
import { createGameLoader } from '../src/data/game-loader';
import { sharedData } from '../src/data/dataset';
import { gameReferences } from '../src/data/game-references';
import { breed, fixture, milestone, source } from './fixtures';
import { emerald } from './local-data';

function validGame(id: string) {
  const { game } = fixture(['ralts']);
  game.game.id = id;
  delete game.profiles[0].regionalDex;
  source(game, 'gift', 'ralts');
  return game;
}

function errors(edit: (game: ReturnType<typeof validGame>) => void) {
  const game = validGame('test-game');
  edit(game);
  const result = validateDataset({ ...sharedData, games: [game] });
  return result.ok ? [] : result.error.map(issue => issue.message);
}

describe('Game-specific data', () => {
  it('uses game profiles instead of the shared generation catalogue for access', () => {
    const { data, game } = fixture(['ralts', 'treecko']);
    game.profiles = game.profiles.filter(profile => profile.pokemonId === 'ralts');
    delete game.profiles[0].regionalDex;
    source(game, 'gift', 'ralts');
    expect(validateDataset(data).ok).toBe(true);
    const result = getAvailability(data, { gameId: game.game.id, milestoneId: 'start', respectLevelLimit: true });
    expect(result.ok).toBe(true);
    if (result.ok) expect(Object.keys(result.value.entries)).toEqual(['ralts']);
  });

  it('reads checkpoints without assuming Gym IDs or Victory Road', () => {
    const { game } = fixture(['ralts']);
    game.game.planner = {
      defaultMilestoneId: 'gate',
      checkpoints: [{ milestoneId: 'gate', label: 'Story gate', title: 'Gate', detail: 'Before the next task', typeId: null }],
    };
    expect(progressCheckpointOptions(game)).toEqual([
      { id: 'gate', label: 'Story gate', title: 'Gate', detail: 'Before the next task', typeId: null },
    ]);
    expect(createInitialState(game)).toMatchObject({ gameId: game.game.id, milestoneId: 'gate', team: Array(6).fill(null) });
  });

  it('rejects unknown, repeated, and invalid default checkpoints', () => {
    expect(errors(game => game.game.planner!.checkpoints[0].milestoneId = 'missing').join()).toContain('Unknown checkpoint');
    expect(errors(game => game.game.planner!.checkpoints.push(game.game.planner!.checkpoints[0])).join()).toContain('Duplicate');
    expect(errors(game => game.game.planner!.defaultMilestoneId = 'start').join()).toContain('declared checkpoint');
    expect(errors(game => game.game.planner!.checkpoints[0].typeId = 'unknown').join()).toContain('Unknown checkpoint type');
  });

  it('accepts regional Pokédex numbers above Emerald’s last number', () => {
    const game = structuredClone(emerald);
    game.profiles.find(profile => profile.pokemonId === 'bulbasaur')!.regionalDex = 203;
    expect(validateDataset({ ...sharedData, games: [game] }).ok).toBe(true);
  });

  it('supports games without breeding and preserves source genders', () => {
    const game = validGame('no-breeding');
    game.game.breeding = null;
    game.profiles[0].breeding = null;
    const data = { ...sharedData, games: [game] };
    expect(validateDataset(data).ok).toBe(true);
    expect(compatibleGenders(game.profiles[0], game.profiles[0], 'female', 'male')).toBe(false);
    const result = getAvailability(data, { gameId: game.game.id, milestoneId: 'gate', respectLevelLimit: true });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.entries.ralts.status).toBe('available');
    breed(game, 'egg', ['ralts'], 'ralts');
    const invalid = validateDataset(data);
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) expect(invalid.error.some(issue => issue.message.includes('Breeding is not supported'))).toBe(true);
  });

  it('validates the selected game’s hatch level', () => {
    const game = validGame('test-game');
    game.game.breeding = { hatchLevel: 1 };
    breed(game, 'egg', ['ralts'], 'ralts');
    const data = { ...sharedData, games: [game] };
    expect(validateDataset(data).ok).toBe(false);
    game.sources.at(-1)!.level = { kind: 'fixed', value: 1 };
    expect(validateDataset(data).ok).toBe(true);
  });

  it('rejects a breeding profile that does not match the game setting', () => {
    expect(errors(game => game.profiles[0].breeding = null).join()).toContain('Breeding profile');
    expect(errors(game => game.game.breeding = null).join()).toContain('Breeding profile');
  });

  it('rejects remote and unsafe sprite paths', () => {
    for (const sprite of ['https://example.com/ralts.png', '/../ralts.png', '//example.com/ralts.png']) {
      expect(errors(game => game.profiles[0].spriteSrc = sprite).length).toBeGreaterThan(0);
    }
  });

  it('keeps reference lists specific to the selected game', () => {
    const game = validGame('test-game');
    const references = gameReferences(sharedData, game);
    expect(references.map(reference => reference.id)).toEqual(['species', 'type-chart', 'hoenn-dex']);
    expect(references.some(reference => reference.id === 'encounters')).toBe(false);
  });
});

describe('Separate game loading', () => {
  it('keeps access rules separate when games reuse species and source IDs', async () => {
    const first = validGame('first');
    const second = validGame('second');
    second.sources[0].requirements = milestone('gate');
    const load = createGameLoader(sharedData, { first: async () => first, second: async () => second });
    const checked = await Promise.all([load('first'), load('second')]);
    expect(checked.every(result => result.ok)).toBe(true);
    const data = { ...sharedData, games: checked.flatMap(result => result.ok ? [result.value] : []) };
    const query = (gameId: string) => getAvailability(data, { gameId, milestoneId: 'start', respectLevelLimit: true });
    const available = query('first');
    const later = query('second');
    expect(available.ok && available.value.entries.ralts.status).toBe('available');
    expect(later.ok && later.value.entries.ralts.status).toBe('later');
    expect(query('first')).toEqual(available);
  });

  it('loads only the requested game, caches it, and shares concurrent requests', async () => {
    let firstLoads = 0;
    let secondLoads = 0;
    const load = createGameLoader(sharedData, {
      first: async () => { firstLoads++; return validGame('first'); },
      second: async () => { secondLoads++; return validGame('second'); },
    });
    const [first, same] = await Promise.all([load('first'), load('first')]);
    expect(first.ok).toBe(true);
    expect(same).toEqual(first);
    expect(await load('first')).toEqual(first);
    expect(firstLoads).toBe(1);
    expect(secondLoads).toBe(0);
    expect((await load('second')).ok).toBe(true);
    expect(secondLoads).toBe(1);
  });

  it('reports invalid game data without preventing another game from loading', async () => {
    const load = createGameLoader(sharedData, {
      broken: async () => ({ game: { id: 'broken' } }),
      good: async () => validGame('good'),
    });
    const broken = await load('broken');
    expect(broken.ok).toBe(false);
    if (!broken.ok) expect(broken.error.code).toBe('invalid-data');
    expect((await load('good')).ok).toBe(true);
  });

  it('reports unregistered games and registry mismatches', async () => {
    const load = createGameLoader(sharedData, { registered: async () => validGame('different') });
    expect(await load('missing')).toEqual({ ok: false, error: { code: 'unknown-game', gameId: 'missing' } });
    expect(await load('toString')).toEqual({ ok: false, error: { code: 'unknown-game', gameId: 'toString' } });
    const result = await load('registered');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('invalid-data');
  });

  it('reports a load failure and permits a later retry', async () => {
    let fail = true;
    const load = createGameLoader(sharedData, { retry: async () => {
      if (fail) throw new Error('Chunk could not load');
      return validGame('retry');
    } });
    expect(await load('retry')).toEqual({ ok: false, error: { code: 'load-failed', gameId: 'retry', message: 'Chunk could not load' } });
    fail = false;
    expect((await load('retry')).ok).toBe(true);
  });
});
