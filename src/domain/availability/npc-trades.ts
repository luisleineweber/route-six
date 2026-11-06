import type { ProofPath } from '../proofs';
import type { AccessContext, Witness } from './context';
import { usefulPaths } from './context';

/** A null offer accepts any hatched, unfused Pokémon. Keep the actual offer proof. */
export function anyTradeOffers(ctx: AccessContext): Witness[] {
  const paths = [...ctx.paths.values()].flat().filter(path => !ctx.game.formChanges?.some(change =>
    change.fusionPartnerPokemonId && change.pokemonId === path.pokemonId && change.toFormId === path.formId));
  // One free repeatable capture can pay every offer. Other such captures add
  // no resource or choice alternative. This also prevents trade-chain growth.
  const free = paths.filter(path => !path.choices.length && !path.itemUses.length
    && path.individuals.length === 1 && ctx.resourceLimits[path.outputOrigin] === null)
    .sort((a, b) => a.minimumLevel - b.minimumLevel || a.outputOrigin.localeCompare(b.outputOrigin))[0];
  const offers: ProofPath[] = free ? [free] : usefulPaths(ctx, paths);
  return offers.map(path => ({ choices: path.choices, individuals: path.individuals,
    itemUses: path.itemUses, sourceIds: path.sourceIds, minimumLevel: path.minimumLevel }));
}
