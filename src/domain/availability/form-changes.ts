import type { ProofPath } from '../proofs';
import type { FormChange, Requirement } from '../types';
import { claimsFor, mergeChoices, unique } from '../proofs';
import { selectionId, selectionProfile } from '../pokemon-selection';
import { requirementWitnesses, type AccessContext } from './context';

export function formChangeRequirements(change: FormChange): Requirement {
  return { kind: 'all', requirements: [change.requirements,
    ...(change.heldItemId ? [{ kind: 'item' as const, id: change.heldItemId, quantity: 1, consumed: false }] : []),
    ...(change.fusionPartnerPokemonId ? [{ kind: 'pokemon' as const, id: change.fusionPartnerPokemonId,
      quantity: 1, consumed: true }] : []),
  ] };
}

export function formChangePaths(ctx: AccessContext): ProofPath[] {
  const paths: ProofPath[] = [];
  for (const change of ctx.game.formChanges ?? []) {
    const from = selectionId(change.pokemonId, change.fromFormId);
    const to = selectionId(change.pokemonId, change.toFormId);
    const heldSources = new Set(change.heldItemId ? ctx.game.items.find(item => item.id === change.heldItemId)!
      .sources.map(source => `item-source:${source.id}`) : []);
    const requirements = formChangeRequirements(change);
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
          individuals: [...parent.individuals.map(individual => {
            if (individual.storedByOrigin === parent.outputOrigin) {
              const { storedByOrigin: _storage, ...released } = individual;
              return { ...released, use: 'retain' as const };
            }
            return individual.origin === parent.outputOrigin && individual.use === 'consume'
              ? { ...individual, stages: [...individual.stages, `${to}:${individual.gender}`] } : individual;
          }), ...witness.individuals.map(individual => change.fusionPartnerPokemonId
            && individual.use === 'consume' && individual.stages.at(-1)?.split(':')[0] === change.fusionPartnerPokemonId
              ? { ...individual, storedByOrigin: parent.outputOrigin } : individual)],
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
