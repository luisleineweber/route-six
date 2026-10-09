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
}

export interface ProofPath extends AcquisitionPath {
  outputOrigin: string;
  individuals: IndividualProof[];
  ancestors: string[];
  conditions: string[];
  itemUses: { resourceId: string; token: string; quantity: number; consumed: boolean; ownerOrigin?: string }[];
}

export function unique<T>(values: T[]): T[] { return [...new Set(values)]; }

export function mergeChoices(choices: ChoiceSelection[]): ChoiceSelection[] {
  return [...new Map(choices.map(c => [`${c.groupId}:${c.optionId}`, c])).values()];
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
    path.evolutionIds, path.choices, path.individuals, path.itemUses, path.conditions]);
}
