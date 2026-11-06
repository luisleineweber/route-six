import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Game, PokemonProfile } from '../src/domain/types';
import { isGameReady, isProgressReady } from '../src/data/game-catalogue';

const read = <T>(game: string, file: string): T => JSON.parse(readFileSync(`data/games/${game}/${file}.json`, 'utf8'));
const progressGames = new Set(['diamond', 'pearl', 'platinum', 'black', 'white', 'black-2', 'white-2', 'x', 'y',
  'omega-ruby', 'alpha-sapphire', 'heartgold', 'soulsilver']);
const games: [string, number, string, number, number][] = [
  ['diamond', 493, 'turtwig', 1, 151], ['pearl', 493, 'turtwig', 1, 151],
  ['platinum', 493, 'turtwig', 1, 210], ['heartgold', 493, 'chikorita', 1, 256],
  ['soulsilver', 493, 'chikorita', 1, 256], ['black', 649, 'victini', 0, 156],
  ['white', 649, 'victini', 0, 156], ['black-2', 649, 'victini', 0, 301],
  ['white-2', 649, 'victini', 0, 301], ['x', 721, 'chespin', 1, 457],
  ['y', 721, 'chespin', 1, 457], ['omega-ruby', 721, 'treecko', 1, 211],
  ['alpha-sapphire', 721, 'treecko', 1, 211],
];

describe('Generation IV–VI Team Planner data', () => {
  it.each(games)('enables %s with reviewed base profiles and its reviewed progress state', (id, count, first, number, regionalCount) => {
    const game = read<Game>(id, 'game');
    const profiles = read<PokemonProfile[]>(id, 'pokemon');
    expect(isGameReady(id)).toBe(true);
    expect(isProgressReady(id)).toBe(progressGames.has(id));
    if (progressGames.has(id)) {
      expect(game.planner?.defaultMilestoneId).toBe(
        ['heartgold', 'soulsilver'].includes(id) ? 'before-league' : 'victory-road');
      expect(game.firstMilestoneId).not.toBeNull();
    } else {
      expect(game.planner).toBeNull();
      expect(game.firstMilestoneId).toBeNull();
    }
    expect(game.breeding?.hatchLevel).toBe(1);
    expect(profiles).toHaveLength(count);
    expect(profiles.filter(profile => profile.regionalDex !== undefined)).toHaveLength(regionalCount);
    expect(profiles.find(profile => profile.pokemonId === first)?.regionalDex).toBe(number);
  });

  it.each(['x', 'y'])('keeps the three %s Kalos sequences and National Dex remainder', id => {
    const profiles = read<PokemonProfile[]>(id, 'pokemon');
    const game = read<Game>(id, 'game');
    expect(game.regionalDexSections?.map(section => section.id)).toEqual(['central', 'coastal', 'mountain']);
    for (const [section, count] of [['central', 153], ['coastal', 153], ['mountain', 151]] as const) {
      const entries = profiles.filter(profile => profile.regionalDexSectionId === section);
      expect(entries.map(profile => profile.regionalDex).sort((a, b) => a! - b!))
        .toEqual(Array.from({ length: count }, (_, index) => index + 1));
    }
    expect(profiles.find(profile => profile.pokemonId === 'drifloon')).toMatchObject({ regionalDex: 1, regionalDexSectionId: 'coastal' });
    expect(profiles.find(profile => profile.pokemonId === 'diglett')).toMatchObject({ regionalDex: 1, regionalDexSectionId: 'mountain' });
    expect(profiles.find(profile => profile.pokemonId === 'bulbasaur')?.regionalDexSectionId).toBe('central');
    expect(profiles.find(profile => profile.pokemonId === 'arceus')?.regionalDex).toBeUndefined();
  });
});
