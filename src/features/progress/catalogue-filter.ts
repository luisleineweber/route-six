import type { AvailabilityEntry, PlanningTarget } from '../../domain/types';

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
