import type { AcquisitionPath, AvailabilitySnapshot } from '../types';
import type { IndividualProof, ProofPath } from '../proofs';
import { addIndividual, itemQuantities, neededCopies } from '../resource-use';

export interface Conflict { kind: 'choice-conflict' | 'finite-resource'; id: string }

export function findConflict(snapshot: Pick<AvailabilitySnapshot, 'choiceGroups' | 'resourceLimits'>, paths: AcquisitionPath[]): Conflict | null {
  for (const group of snapshot.choiceGroups) {
    const selected = new Set(paths.flatMap(p => p.choices).filter(c => c.groupId === group.id).map(c => c.optionId));
    if (selected.size > group.maximumSelections) return { kind: 'choice-conflict', id: group.id };
  }
  const individuals = new Map<string, IndividualProof[]>();
  const proofPaths: ProofPath[] = [];
  const plain = new Map<string, number>();
  for (const path of paths) {
    const proof = path as Partial<ProofPath>;
    if (!proof.individuals) {
      for (const claim of path.claims) plain.set(claim.resourceId, (plain.get(claim.resourceId) ?? 0) + claim.quantity);
      continue;
    }
    proofPaths.push(proof as ProofPath);
    for (const animal of proof.individuals) {
      const group = individuals.get(animal.origin) ?? [];
      addIndividual(group, animal);
      individuals.set(animal.origin, group);
    }
  }
  for (const [id, animals] of individuals) {
    const limit = snapshot.resourceLimits[id];
    if (limit !== null && limit !== undefined && neededCopies(animals) > limit) return { kind: 'finite-resource', id };
  }
  for (const [id, uses] of itemQuantities(proofPaths)) {
    const limit = snapshot.resourceLimits[id];
    if (limit !== null && limit !== undefined && Math.max(uses.consumed, uses.retained) > limit) return { kind: 'finite-resource', id };
  }
  for (const [id, quantity] of plain) {
    const limit = snapshot.resourceLimits[id];
    if (limit !== null && limit !== undefined && quantity > limit) return { kind: 'finite-resource', id };
  }
  return null;
}

/**
 * Describe everything about the path that `findConflict` can see. Two paths with the same effect are
 * interchangeable in every team, in the same position. Return null when the path can never take part in a conflict.
 */
export function conflictEffect(snapshot: Pick<AvailabilitySnapshot, 'choiceGroups' | 'resourceLimits'>, path: AcquisitionPath): string | null {
  const finite = (id: string) => snapshot.resourceLimits[id] !== null && snapshot.resourceLimits[id] !== undefined;
  const choices = path.choices.filter(choice => snapshot.choiceGroups.some(group => group.id === choice.groupId));
  const proof = path as Partial<ProofPath>;
  if (!proof.individuals) {
    const claims = path.claims.filter(claim => finite(claim.resourceId));
    return choices.length || claims.length ? JSON.stringify([choices, 'plain', claims]) : null;
  }
  const items = proof.itemUses!.filter(use => finite(use.resourceId));
  // Item demand counts the owners of each use, so owners from unlimited sources still matter.
  const owners = new Set(items.flatMap(use => use.heldByOrigin ?? (use.consumed ? use.ownerOrigin : undefined) ?? []));
  const animals = proof.individuals.filter(animal => finite(animal.origin) || owners.has(animal.origin));
  return choices.length || items.length || animals.length ? JSON.stringify([choices, 'proof', animals, items]) : null;
}
