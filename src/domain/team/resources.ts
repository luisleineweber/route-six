import type { AcquisitionPath, AvailabilitySnapshot } from '../types';
import type { IndividualProof, ProofPath } from '../proofs';
import { addIndividual, itemQuantities, neededCopies } from '../resource-use';

export interface Conflict { kind: 'choice-conflict' | 'finite-resource'; id: string }

/** True when the path takes part in the conflict: it selects in the choice group or claims the finite resource.
 * Proof paths already list every origin and item use as a claim (claimsFor), so claims cover both path kinds. */
export function pathUsesConflict(path: AcquisitionPath, conflict: Conflict): boolean {
  if (conflict.kind === 'choice-conflict') return path.choices.some(choice => choice.groupId === conflict.id);
  return path.claims.some(claim => claim.resourceId === conflict.id);
}

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
