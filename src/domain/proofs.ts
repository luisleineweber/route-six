import type { AcquisitionPath, ChoiceSelection, Gender, ResourceClaim } from './types';
import { addIndividual, itemQuantities, neededCopies } from './resource-use';

/** A retained parent can be used before a later evolution or game trade. */
export interface IndividualProof {
  origin: string;
  gender: Gender;
  stages: string[];
  use: 'retain' | 'consume';
  coProducts: string[];
  copy?: number;
  consumedBy?: string;
  storedByOrigin?: string;
}

export interface ProofPath extends AcquisitionPath {
  outputOrigin: string;
  individuals: IndividualProof[];
  ancestors: string[];
  conditions: string[];
  knownMoveIds?: string[];
  itemUses: { resourceId: string; token: string; quantity: number; consumed: boolean;
    ownerOrigin?: string; acquisitionId?: string; heldByOrigin?: string }[];
}

export function unique<T>(values: T[]): T[] { return [...new Set(values)]; }

export function mergeChoices(choices: ChoiceSelection[]): ChoiceSelection[] {
  return [...new Map(choices.map(c => [`${c.groupId}:${c.optionId}`, c])).values()];
}

/** Repeated access requirements reuse the same retained key or held item. */
export function compactItemUses(uses: ProofPath['itemUses']): ProofPath['itemUses'] {
  const retained = new Map<string, ProofPath['itemUses'][number]>();
  const acquisitions = new Map<string, ProofPath['itemUses'][number]>();
  const held = new Map<string, ProofPath['itemUses'][number]>();
  const consumed = uses.filter(use => use.consumed && !use.acquisitionId);
  for (const use of uses) if (use.acquisitionId) {
    const key = `${use.resourceId}:${use.acquisitionId}`;
    const previous = acquisitions.get(key);
    acquisitions.set(key, { ...use, quantity: Math.max(previous?.quantity ?? 0, use.quantity) });
  }
  for (const use of uses) if (!use.consumed && use.heldByOrigin) {
    const key = `${use.resourceId}:${use.heldByOrigin}`;
    const previous = held.get(key);
    held.set(key, { ...use, token: use.resourceId, quantity: Math.max(previous?.quantity ?? 0, use.quantity) });
  }
  for (const use of uses) if (!use.consumed && !use.heldByOrigin) {
    const previous = retained.get(use.resourceId);
    retained.set(use.resourceId, { resourceId: use.resourceId, token: use.resourceId,
      quantity: Math.max(previous?.quantity ?? 0, use.quantity), consumed: false });
  }
  return [...consumed, ...[...acquisitions.values()].sort((a, b) => a.resourceId.localeCompare(b.resourceId)),
    ...[...held.values()].sort((a, b) => a.resourceId.localeCompare(b.resourceId)),
    ...[...retained.values()].sort((a, b) => a.resourceId.localeCompare(b.resourceId))];
}

export function claimsFor(path: Pick<ProofPath, 'individuals' | 'itemUses'>): ResourceClaim[] {
  const claims: ResourceClaim[] = [];
  const origins = new Map<string, IndividualProof[]>();
  for (const individual of path.individuals) {
    const group = origins.get(individual.origin) ?? [];
    addIndividual(group, individual); origins.set(individual.origin, group);
  }
  for (const [origin, group] of origins) {
    claims.push({ resourceId: origin, quantity: neededCopies(group), use: group.some(p=>p.use==='consume') ? 'consume' : 'retain' });
  }
  for (const [resourceId, quantity] of itemQuantities([path])) {
    claims.push({ resourceId, quantity: Math.max(quantity.consumed, quantity.retained), use: quantity.consumed ? 'consume' : 'retain' });
  }
  return claims;
}

export function pathSignature(path: ProofPath): string {
  return JSON.stringify([path.pokemonId, path.minimumLevel, path.genders, path.sourceIds,
    path.evolutionIds, path.choices, path.individuals, path.itemUses, path.conditions, path.knownMoveIds ?? [],
    path.formId ?? null, path.formChangeIds ?? []]);
}
