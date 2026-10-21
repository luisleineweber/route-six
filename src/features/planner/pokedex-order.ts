import type { GameData, Pokemon } from '../../domain/types';

export function regionalDexName(game: GameData, sectionId?: string): string {
  if (sectionId === undefined) return game.game.region;
  const section = game.game.regionalDexSections?.find(section => section.id === sectionId);
  if (!section) throw new Error(`Unknown regional Pokédex section: ${sectionId}`);
  return section.name;
}

export function sortPokemonByPokedex(pokemon: Pokemon[], game: GameData): Pokemon[] {
  const profiles = new Map(game.profiles.map(profile => [profile.pokemonId, profile]));
  const sectionOrder = new Map(game.game.regionalDexSections?.map((section, index) => [section.id, index]));
  return [...pokemon].sort((a, b) => {
    const aProfile = profiles.get(a.id);
    const bProfile = profiles.get(b.id);
    const aRegional = aProfile?.regionalDex;
    const bRegional = bProfile?.regionalDex;
    if (aRegional !== undefined || bRegional !== undefined) {
      if (aRegional === undefined) return 1;
      if (bRegional === undefined) return -1;
      const sectionDifference = (sectionOrder.get(aProfile!.regionalDexSectionId!) ?? 0)
        - (sectionOrder.get(bProfile!.regionalDexSectionId!) ?? 0);
      if (sectionDifference) return sectionDifference;
      return aRegional - bRegional;
    }
    return a.nationalDex - b.nationalDex;
  });
}
