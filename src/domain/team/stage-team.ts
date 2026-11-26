import { selectionId } from '../pokemon-selection';
import type { AvailabilitySnapshot, GameData } from '../types';

export type StageOverrides = Record<string, Record<number, string | null>>;
export interface StageMember {
  targetId: string | null;
  pokemonId: string | null;
  kind: 'final' | 'earlier' | 'missing' | 'empty' | 'replacement';
}

/** Walk backwards only. Sibling branches are not earlier evolution stages. */
export function stageMember(game: GameData, snapshot: AvailabilitySnapshot, targetId: string | null): StageMember {
  if (!targetId) return { targetId, pokemonId: null, kind: 'empty' };
  let candidates = [targetId];
  const visited = new Set<string>();
  while (candidates.length) {
    const available = candidates.find(id => snapshot.entries[id]?.currentPathIds.length);
    if (available) return { targetId, pokemonId: available, kind: available === targetId ? 'final' : 'earlier' };
    candidates.forEach(id => visited.add(id));
    candidates = [...new Set(game.evolutions.filter(rule => candidates.includes(selectionId(rule.toPokemonId, rule.toFormId)))
      .map(rule => selectionId(rule.fromPokemonId, rule.fromFormId)))].filter(id => !visited.has(id));
  }
  return { targetId, pokemonId: null, kind: 'missing' };
}

export function stageTeam(game: GameData, snapshot: AvailabilitySnapshot, finalTeam: (string | null)[], overrides: Record<number, string | null> = {}): StageMember[] {
  return finalTeam.map((targetId, slot) => Object.hasOwn(overrides, slot)
    ? { targetId, pokemonId: overrides[slot], kind: 'replacement' }
    : stageMember(game, snapshot, targetId));
}
