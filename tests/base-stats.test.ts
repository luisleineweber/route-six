import { beforeAll, describe, expect, it } from 'vitest';
import { checkBaseStatCoverage, pokemonBaseStats, rawBaseStats, validateBaseStats } from '../src/data/base-stats';
import { gameLoaders } from '../src/data/game-registry';
import { statAxes } from '../src/domain/base-stats';
import type { GameData } from '../src/domain/types';

describe('reviewed native base stats', () => {
  let games: GameData[];
  beforeAll(async () => {
    games = await Promise.all(Object.values(gameLoaders).map(load => load())) as GameData[];
  }, 120_000);
  it('covers every species and selectable form in all registered games', () => {
    expect(checkBaseStatCoverage(games)).toEqual([]);
  });

  it('uses game-specific changes rather than current-generation values', () => {
    expect(pokemonBaseStats('emerald', 'raichu')).toEqual([60, 90, 55, 100, 90, 80]);
    expect(pokemonBaseStats('x', 'raichu')).toEqual([60, 90, 55, 110, 90, 80]);
    expect(pokemonBaseStats('emerald', 'blaziken')).toEqual([80, 120, 70, 80, 110, 70]);
  });

  it('uses the native Deoxys form for each Generation III version', () => {
    expect(pokemonBaseStats('emerald', 'deoxys')).toEqual([50, 95, 90, 180, 95, 90]);
    expect(pokemonBaseStats('firered', 'deoxys')).toEqual([50, 180, 20, 150, 180, 20]);
    expect(pokemonBaseStats('leafgreen', 'deoxys')).toEqual([50, 70, 160, 90, 70, 160]);
    expect(pokemonBaseStats('ruby', 'deoxys')).toEqual([50, 150, 50, 150, 150, 50]);
  });

  it('keeps stat-changing and cosmetic forms explicit', () => {
    expect(pokemonBaseStats('black-2', 'kyurem-black')).toEqual([125, 170, 100, 95, 120, 90]);
    expect(pokemonBaseStats('white-2', 'kyurem-white')).toEqual([125, 120, 90, 95, 170, 100]);
    expect(pokemonBaseStats('x', 'gourgeist-super')).toEqual([85, 100, 122, 54, 58, 75]);
    expect(pokemonBaseStats('x', 'pumpkaboo-small')).toEqual([44, 66, 70, 56, 44, 55]);
    expect(pokemonBaseStats('black', 'deerling-winter')).toEqual(pokemonBaseStats('black', 'deerling'));
  });

  it('keeps Generation I Special as one axis and orders later special stats correctly', () => {
    expect(statAxes(pokemonBaseStats('red', 'alakazam'))).toEqual([
      { label: 'HP', value: 55 }, { label: 'Atk', value: 50 }, { label: 'Def', value: 45 },
      { label: 'Spe', value: 120 }, { label: 'Spc', value: 135 },
    ]);
    expect(statAxes(pokemonBaseStats('emerald', 'blaziken')).slice(4)).toEqual([
      { label: 'SpD', value: 70 }, { label: 'SpA', value: 110 },
    ]);
  });

  it('rejects missing data and invalid records instead of drawing a substitute', () => {
    expect(() => pokemonBaseStats('red', 'kyurem-black')).toThrow('Missing reviewed base stats');
    expect(() => pokemonBaseStats('unknown', 'blaziken')).toThrow('Missing reviewed base stats');
    const record = { ...structuredClone(rawBaseStats[0]), stats: [{ tables: ['rb', 'rb'], values: [256, 1, 1, 1, 1] }] };
    const result = validateBaseStats([record]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.map(issue => issue.fieldPath)).toEqual(expect.arrayContaining(['base-stats.values', 'base-stats.tables']));
    expect(validateBaseStats(null).ok).toBe(false);
    expect(validateBaseStats([{ id: 'test', stats: [{ tables: ['e'], values: [1, 1, 1, 1, 1, 1] }] }]).ok).toBe(false);
  });
});
