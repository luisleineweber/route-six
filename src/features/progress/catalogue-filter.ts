import { pokemonById, pokemonNames } from '../../data/dataset';
import type { AvailabilityEntry, AvailabilitySnapshot, GameData, PlanningTarget } from '../../domain/types';
import { regionalDexName, sortPokemonByPokedex } from '../planner/pokedex-order';

export type CatalogueStatus = AvailabilityEntry['status'] | 'obtainable';

export function matchesCatalogueTypes(pokemonTypes: readonly string[], selectedTypes: readonly string[]) {
  return selectedTypes.length === 0 || selectedTypes.some(type => pokemonTypes.includes(type));
}

export function defaultCatalogueStatus(target: PlanningTarget): CatalogueStatus {
  return target === 'whole-game' ? 'obtainable' : 'available';
}

export function matchesCatalogueStatus(entry: AvailabilityEntry, status: CatalogueStatus) {
  return status === 'obtainable'
    ? entry.currentPathIds.length > 0 || entry.futurePathIds.length > 0
    : entry.status === status;
}

export function matchingCataloguePokemon(game: GameData, query: string, selectedTypes: readonly string[]) {
  const words = query.toLowerCase().trim().split(/\s+/);
  const profiles = new Map(game.profiles.map(profile => [profile.pokemonId, profile]));
  const sorted = sortPokemonByPokedex(game.profiles.map(profile => pokemonById.get(profile.pokemonId)!), game);
  return sorted.flatMap(pokemon => {
    const profile = profiles.get(pokemon.id)!;
    const dexName = profile.regionalDex === undefined ? 'National' : regionalDexName(game, profile.regionalDexSectionId);
    const dexTerms = `${pokemon.nationalDex} ${profile.regionalDex ?? ''} ${dexName}`;
    const selections = [
      { id: pokemon.id, types: profile.types },
      ...(profile.forms ?? []).map(form => ({ id: form.formId, types: form.types })),
    ];
    const preferred = game.game.region === 'Alola' && profile.regionalDex !== undefined
      ? selections.findIndex(selection => selection.id === `${pokemon.id}-alola`)
      : -1;
    if (preferred > 0) selections.unshift(...selections.splice(preferred, 1));
    const ids = selections.filter(({ id, types }) => {
      const terms = `${pokemonNames.get(id)} ${dexTerms} ${types.join(' ')}`.toLowerCase();
      return words.every(word => terms.includes(word)) && matchesCatalogueTypes(types, selectedTypes);
    }).map(selection => selection.id);
    return ids.length ? [{ profile, ids }] : [];
  });
}

/** Choose a form only after checking that the same form matches all active filters. */
export function matchingCatalogueSelection(ids: readonly string[], snapshot: AvailabilitySnapshot | null, status: CatalogueStatus) {
  if (!snapshot) return ids[0];
  return ids.find(id => {
    const entry = snapshot.entries[id];
    return entry && matchesCatalogueStatus(entry, status);
  });
}
