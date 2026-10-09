import type { IndividualProof, ProofPath } from './proofs';

function prefix(a: string[], b: string[]) {
  return a.length <= b.length && a.every((stage, index) => stage === b[index]);
}

function canShare(a: IndividualProof, b: IndividualProof): boolean {
  if (a.origin !== b.origin) return false;
  if (a.gender !== b.gender) return false;
  if (a.copy !== undefined && b.copy !== undefined && a.copy !== b.copy) return false;
  if (a.use === 'consume' && b.use === 'consume') {
    return a.coProducts.includes(b.stages.at(-1)!.split(':')[0]) || b.coProducts.includes(a.stages.at(-1)!.split(':')[0]);
  }
  return prefix(a.stages, b.stages) || prefix(b.stages, a.stages);
}

export function addIndividual(group: IndividualProof[], animal: IndividualProof): void {
  const sameAction = animal.consumedBy ? group.find(p => p.origin === animal.origin && p.consumedBy === animal.consumedBy
    && p.gender === animal.gender && JSON.stringify(p.stages) === JSON.stringify(animal.stages)) : null;
  if (sameAction) {
    if (sameAction.copy === undefined && animal.copy !== undefined) sameAction.copy = animal.copy;
    return;
  }
  if (animal.use === 'consume' || !group.some(p => p.use === 'retain' && JSON.stringify(p) === JSON.stringify(animal))) group.push({ ...animal });
}

/** Minimum distinct animals, with retained parents and simultaneous products shared. */
export function neededCopies(proofs: IndividualProof[]): number {
  const sorted = [...proofs].sort((a, b) => Number(b.use === 'consume') - Number(a.use === 'consume'));
  let best = sorted.length;
  const bins: IndividualProof[][] = [];
  function visit(index: number) {
    if (bins.length >= best) return;
    if (index === sorted.length) { best = bins.length; return; }
    const proof = sorted[index];
    for (const bin of bins) if (bin.every(other => canShare(proof, other))) {
      bin.push(proof); visit(index + 1); bin.pop();
    }
    bins.push([proof]); visit(index + 1); bins.pop();
  }
  visit(0);
  return best;
}

interface ItemDemand { quantity: number; consumed: boolean; animals: IndividualProof[] }

export function itemQuantities(paths: Pick<ProofPath, 'individuals' | 'itemUses'>[]): Map<string, { consumed: number; retained: number }> {
  const items = new Map<string, Map<string, ItemDemand>>();
  for (const path of paths) for (const use of path.itemUses) {
    const uses = items.get(use.resourceId) ?? new Map<string, ItemDemand>();
    const token = `${use.consumed ? 'consume' : 'retain'}:${use.token}`;
    const demand = uses.get(token) ?? { quantity: 0, consumed: use.consumed, animals: [] };
    demand.quantity = Math.max(demand.quantity, use.quantity);
    if (use.consumed) {
      const owners = path.individuals.filter(animal => animal.origin === use.ownerOrigin);
      if (!owners.length) throw new Error(`Item consumption has no action proof: ${use.token}`);
      for (const animal of owners) addIndividual(demand.animals, animal);
    }
    uses.set(token, demand); items.set(use.resourceId, uses);
  }
  return new Map([...items].map(([id, uses]) => [id, {
    consumed: [...uses.values()].filter(use => use.consumed).reduce((sum, use) => sum + use.quantity * neededCopies(use.animals), 0),
    retained: Math.max(0, ...[...uses.values()].filter(use => !use.consumed).map(use => use.quantity)),
  }]));
}
