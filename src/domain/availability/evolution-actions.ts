import type { Evolution, EvolutionCondition, GameData, Requirement } from '../types';
import type { ProofPath } from '../proofs';
import { pokemonSelections, selectionId } from '../pokemon-selection';
import { emptyWitness, mergeWitness, requirementWitnesses, type AccessContext, type Witness } from './context';

export function conditionRequirement(condition: EvolutionCondition, game: GameData, parentSpeciesId: string): Requirement | null {
  switch (condition.kind) {
    case 'location': return { kind: 'location', id: condition.locationId };
    case 'held-item': return { kind: 'item', id: condition.itemId, quantity: 1, consumed: true };
    case 'party-pokemon': return { kind: 'pokemon', id: condition.pokemonId, quantity: 1, consumed: false };
    case 'party-type': return { kind: 'any', requirements: pokemonSelections(game)
      .filter(profile => profile.pokemonId !== parentSpeciesId && profile.types.includes(condition.typeId))
      .map(profile => ({ kind: 'pokemon', id: selectionId(profile.pokemonId, profile.formId), quantity: 1, consumed: false })) };
    default: return null;
  }
}

export function evolutionRequirements(evolution: Evolution, game: GameData): Requirement {
  return { kind: 'all', requirements: [evolution.requirements,
    ...evolution.conditions.map(condition => conditionRequirement(condition, game, evolution.fromPokemonId))
      .filter(requirement => requirement !== null)] };
}

/** Keep each teaching cost on the individual that will evolve. */
export function evolutionWitnesses(ctx: AccessContext, evolution: Evolution, parent: ProofPath): Witness[] {
  const minimumLevel = evolution.trigger === 'level-up'
    ? Math.max(evolution.minimumLevel ?? 1, parent.minimumLevel + 1) : parent.minimumLevel;
  let witnesses = requirementWitnesses(ctx, evolutionRequirements(evolution, ctx.game))
    .map(witness => ({ ...witness, minimumLevel }));
  for (const condition of evolution.conditions) {
    if (condition.kind !== 'known-move') continue;
    const learning = parent.knownMoveIds?.includes(condition.moveId) ? [emptyWitness()]
      : condition.learning.flatMap(route => {
        if (route.kind === 'teach') return requirementWitnesses(ctx, route.requirements)
          .map(witness => ({ ...witness, minimumLevel: route.minimumLevel + 1 }));
        // A capture above this level cannot go back and learn the missed move.
        return parent.minimumLevel < route.level ? [{ ...emptyWitness(), minimumLevel: route.level }] : [];
      });
    witnesses = witnesses.flatMap(witness => learning.map(route => mergeWitness(witness, route)));
  }
  return witnesses;
}
