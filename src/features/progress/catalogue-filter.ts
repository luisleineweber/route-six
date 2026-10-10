import type { AvailabilityEntry, PlanningTarget } from '../../domain/types';

export type CatalogueStatus = AvailabilityEntry['status'] | 'obtainable';

export function defaultCatalogueStatus(target: PlanningTarget): CatalogueStatus {
  return target === 'whole-game' ? 'obtainable' : 'available';
}

export function matchesCatalogueStatus(entry: AvailabilityEntry, status: CatalogueStatus) {
  return status === 'obtainable'
    ? entry.currentPathIds.length > 0 || entry.futurePathIds.length > 0
    : entry.status === status;
}
