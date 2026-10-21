import type { ProofPath } from '../proofs';
import type { AccessContext } from './context';

/** Positive access rules remain valid when progress and the level limit increase. */
export function seedPaths(ctx: AccessContext, earlier: AccessContext, add: (path: ProofPath) => boolean): void {
  if (earlier.game !== ctx.game || earlier.limit > ctx.limit || [...earlier.reached].some(id => !ctx.reached.has(id))) {
    throw new Error('Cannot reuse a context with different access or a higher level limit.');
  }
  const aliases = new Map<string, string>();
  for (const paths of earlier.paths.values()) for (const original of paths) {
    const copy = { ...original, id: '', firstMilestoneIds: [ctx.milestone.id] };
    if (!add(copy)) throw new Error(`Cannot reuse a validated proof: ${original.id}`);
    aliases.set(original.id, copy.id);
  }
  for (const paths of ctx.paths.values()) for (const path of paths) {
    path.breedingSteps = path.breedingSteps.map(step => ({ ...step,
      parents: step.parents.map(parent => {
        const pathId = aliases.get(parent.pathId);
        if (!pathId) throw new Error(`Missing reused breeding parent: ${parent.pathId}`);
        return { ...parent, pathId };
      }) as typeof step.parents }));
  }
}
