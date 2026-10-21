import type { GameData, PokemonProfile, SharedData } from './types';

/** A base species uses its species ID. An alternate form uses its shared form ID. */
export function selectionId(pokemonId: string, formId?: string | null): string {
  return formId ?? pokemonId;
}

export interface PokemonSelection extends PokemonProfile {
  formId: string | null;
}

export function pokemonSelections(game: GameData): PokemonSelection[] {
  return game.profiles.flatMap(profile => [
    { ...profile, formId: null },
    ...(profile.forms ?? []).map(form => ({ ...profile, ...form })),
  ]);
}

export function selectionProfile(game: GameData, id: string): PokemonSelection {
  const base = game.profiles.find(profile => profile.pokemonId === id);
  if (base) return { ...base, formId: null };
  for (const profile of game.profiles) {
    const form = profile.forms?.find(form => form.formId === id);
    if (form) return { ...profile, ...form };
  }
  throw new Error(`Missing Pokémon selection in ${game.game.name}: ${id}`);
}

export function selectionIdentity(shared: SharedData, id: string) {
  const form = shared.forms?.find(form => form.id === id);
  const pokemon = shared.pokemon.find(pokemon => pokemon.id === (form?.pokemonId ?? id));
  if (!pokemon) throw new Error(`Missing Pokémon identity: ${id}`);
  return { ...pokemon, selectionId: id, formId: form?.id ?? null,
    name: form ? `${pokemon.name} (${form.name})` : pokemon.name };
}
