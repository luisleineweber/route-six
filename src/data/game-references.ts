import type { GameData, Reference, SharedData } from '../domain/types';

export function gameReferences(data: SharedData, game: GameData): Reference[] {
  const rows = [game.game, game.typeChart, ...game.profiles, ...game.milestones, ...game.bosses,
    ...game.locations, ...game.capabilities, ...game.items, ...game.items.flatMap(item => item.sources),
    ...game.choices, ...game.sources, ...game.breedingRules, ...game.evolutions, ...game.exclusions,
    ...(game.formChanges ?? []), ...game.profiles.flatMap(profile => profile.forms ?? [])];
  const ids = new Set(rows.flatMap(row => row.review.referenceIds));
  return data.references.filter(reference => ids.has(reference.id));
}
