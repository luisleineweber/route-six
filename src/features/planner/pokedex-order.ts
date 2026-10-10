import type { GameData, Pokemon } from '../../domain/types';

export function sortPokemonByPokedex(pokemon: Pokemon[], game: GameData): Pokemon[] {
  const regionalDexById = new Map(game.profiles.flatMap(profile => profile.regionalDex === undefined
    ? [] : [[profile.pokemonId, profile.regionalDex] as const]));
  return [...pokemon].sort((a, b) => {
    const aRegional = regionalDexById.get(a.id);
    const bRegional = regionalDexById.get(b.id);
    if (aRegional !== undefined || bRegional !== undefined) {
      if (aRegional === undefined) return 1;
      if (bRegional === undefined) return -1;
      return aRegional - bRegional;
    }
    return a.nationalDex - b.nationalDex;
  });
}
