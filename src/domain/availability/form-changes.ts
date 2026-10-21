import type { ProofPath } from '../proofs';
import { claimsFor, mergeChoices, unique } from '../proofs';
import { selectionId, selectionProfile } from '../pokemon-selection';
import { requirementWitnesses, type AccessContext } from './context';

export function formChangePaths(ctx: AccessContext): ProofPath[] {
  const paths: ProofPath[] = [];
  for (const change of ctx.game.formChanges ?? []) {
    const from = selectionId(change.pokemonId, change.fromFormId);
    const to = selectionId(change.pokemonId, change.toFormId);
    const heldSources = new Set(change.heldItemId ? ctx.game.items.find(item => item.id === change.heldItemId)!
      .sources.map(source => `item-source:${source.id}`) : []);
    const requirements = { kind: 'all' as const, requirements: [change.requirements,
      ...(change.heldItemId ? [{ kind: 'item' as const, id: change.heldItemId, quantity: 1, consumed: false }] : [])] };
    for (const parent of ctx.paths.get(from) ?? []) {
      if (parent.ancestors.includes(to) || parent.formChangeIds?.includes(change.id)) continue;
      const genders = parent.genders.filter(gender => selectionProfile(ctx.game, to).genders.includes(gender));
      if (!genders.length) continue;
      for (const witness of requirementWitnesses(ctx, requirements)) {
        const itemUses = parent.itemUses.map(use => {
          if (use.heldByOrigin !== parent.outputOrigin) return use;
          const { heldByOrigin: _holder, ...released } = use;
          return released;
        });
        const path: ProofPath = { ...parent, id: '', formId: change.toFormId,
          formChangeIds: [...(parent.formChangeIds ?? []), change.id], genders,
          sourceIds: unique([...parent.sourceIds, ...witness.sourceIds]),
          firstMilestoneIds: [ctx.milestone.id], choices: mergeChoices([...parent.choices, ...witness.choices]),
          ancestors: unique([...parent.ancestors, from]),
          individuals: [...parent.individuals.map(individual => individual.origin === parent.outputOrigin
            && individual.use === 'consume' ? { ...individual,
              stages: [...individual.stages, `${to}:${individual.gender}`] } : individual), ...witness.individuals],
          itemUses: [...itemUses, ...witness.itemUses.map(use => heldSources.has(use.resourceId) && !use.consumed
            ? { ...use, heldByOrigin: parent.outputOrigin } : use)],
        };
        path.claims = claimsFor(path);
        paths.push(path);
      }
    }
  }
  return paths;
}
