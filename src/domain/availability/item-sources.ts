import type { ItemSource } from '../types';
import type { AccessContext, Witness } from './context';

/** Item actions keep their captured holder available for the team. */
export function itemSourceWitnesses(ctx: AccessContext, source: ItemSource): Witness[] {
  const details = source.details;
  if (!details) return [{ choices: [], individuals: [], itemUses: [], sourceIds: [], minimumLevel: 1 }];
  const capture = ctx.game.sources.find(value => value.id === details.pokemonSourceId);
  if (!capture) throw new Error(`Missing validated item holder source: ${details.pokemonSourceId}`);
  return (ctx.paths.get(capture.formId ?? capture.pokemonId) ?? []).filter(path => {
    if (path.outputOrigin !== `source:${capture.id}`) return false;
    if (details.kind !== 'pickup') return true;
    const holderLevel = Math.max(path.minimumLevel, details.minimumLevel);
    return holderLevel <= details.maximumLevel && holderLevel <= ctx.limit;
  }).map(path => ({ choices: path.choices, sourceIds: path.sourceIds, itemUses: path.itemUses,
    minimumLevel: 1, individuals: path.individuals.map(animal => animal.origin === path.outputOrigin
      && animal.use === 'consume' ? { ...animal, use: 'retain' as const } : animal) }));
}

/** An unlimited item needs no extra holder when an equal proof has fewer dependencies. */
export function usefulItemWitnesses(ctx: AccessContext, witnesses: Witness[]): Witness[] {
  const groups = new Map<string, Witness[]>();
  const includesSources = (a: Witness, b: Witness) => a.sourceIds.every(id => b.sourceIds.includes(id));
  const dominates = (a: Witness, b: Witness) => a.minimumLevel <= b.minimumLevel && includesSources(a, b);
  for (const witness of witnesses) {
    const key = JSON.stringify([witness.choices,
      witness.individuals.filter(animal => ctx.resourceLimits[animal.origin] !== null),
      witness.itemUses.filter(use => ctx.resourceLimits[use.resourceId] !== null)]);
    const current = groups.get(key) ?? [];
    if (current.some(value => dominates(value, witness))) continue;
    groups.set(key, [...current.filter(value => !dominates(witness, value)), witness]);
  }
  return [...groups.values()].flat();
}
