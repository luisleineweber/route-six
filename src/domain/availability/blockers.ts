import type { Blocker, GameData, Requirement } from '../types';
import { requirementWitnesses, type AccessContext } from './context';

export function requirementBlockers(ctx: AccessContext, req: Requirement, seen = new Set<string>()): Blocker[] {
  if (requirementWitnesses(ctx, req).length) return [];
  if ('requirements' in req) {
    const results = req.requirements.map(r => requirementBlockers(ctx, r, seen));
    return req.kind === 'any' ? results.sort((a, b) => a.length - b.length)[0] ?? [] : results.flat();
  }
  const key = `${req.kind}:${req.id}`;
  if (seen.has(key)) return [{ code: 'condition', relatedId: req.id, message: `No grounded proof for ${req.id}.` }];
  const next = new Set([...seen, key]);
  if (req.kind === 'milestone') return [{ code: 'progress', relatedId: req.id,
    message: `Reach ${ctx.game.milestones.find(m => m.id === req.id)!.name}.` }];
  if (req.kind === 'capability') {
    const capability = ctx.game.capabilities.find(c => c.id === req.id)!;
    return [{ code: 'condition', relatedId: req.id, message: `Requires ${capability.name}.` }, ...requirementBlockers(ctx, capability.requirements, next)];
  }
  if (req.kind === 'pokemon') return [{ code: 'pokemon', relatedId: req.id,
    message: `Obtain ${req.quantity} ${req.id}${req.consumed ? ' to give away' : ' for this action'}.` }];
  const item = ctx.game.items.find(i => i.id === req.id)!;
  return [{ code: 'item', relatedId: req.id, message: `Requires ${item.name}${req.consumed ? ' (consumed)' : ' (kept)'}.` }];
}

export function pokemonBlockers(game: GameData, ctx: AccessContext, id: string, seen = new Set<string>()): Blocker[] {
  if (seen.has(id)) return [{ code: 'breeding-parents', relatedId: id, message: 'No accessible parent pair grounds this breeding path.' }];
  const next = new Set([...seen, id]);
  const exclusion = game.exclusions.find(e => e.pokemonId === id);
  if (exclusion) return [{ code: exclusion.reason, relatedId: id, message: exclusion.explanation }];
  const reasons: Blocker[] = [];
  const locations = new Map(game.locations.map(l => [l.id, l]));
  for (const source of game.sources.filter(s => s.pokemonId === id)) {
    const access = requirementBlockers(ctx, { kind: 'all', requirements: [locations.get(source.locationId)!.requirements, source.requirements] });
    reasons.push(...access);
    const minimum = source.level.kind === 'fixed' ? source.level.value : source.level.kind === 'range' ? source.level.minimum : null;
    if (minimum !== null && minimum > ctx.limit) reasons.push({ code: 'level-limit', relatedId: source.id, message: `Source level ${minimum} exceeds the level limit of ${ctx.limit}.` });
    if (source.details.kind === 'breeding' && !access.length) reasons.push({ code: 'breeding-parents', relatedId: source.id, message: 'Needs two distinct, accessible parents with compatible Egg Groups and genders.' });
  }
  for (const evolution of game.evolutions.filter(e => e.toPokemonId === id || e.coProductIds.includes(id))) {
    if (evolution.trigger === 'player-trade') {
      reasons.push({ code: 'player-trade', relatedId: evolution.id, message: `Evolve ${evolution.fromPokemonId} by trading with another player. Player trades are excluded.` });
      continue;
    }
    const parents = ctx.paths.get(evolution.fromPokemonId) ?? [];
    if (!parents.length) reasons.push(...pokemonBlockers(game, ctx, evolution.fromPokemonId, next));
    else {
      const minimum = Math.min(...parents.map(p => evolution.trigger === 'level-up' ? Math.max(evolution.minimumLevel ?? 1, p.minimumLevel + 1) : p.minimumLevel));
      if (minimum > ctx.limit) reasons.push({ code: 'level-limit', relatedId: evolution.id, message: `Evolution needs level ${minimum}; the current limit is ${ctx.limit}.` });
    }
    reasons.push(...requirementBlockers(ctx, evolution.requirements));
  }
  const distinct = [...new Map(reasons.map(b => [`${b.code}:${b.relatedId}:${b.message}`, b])).values()];
  return distinct.length ? distinct : [{ code: 'condition', relatedId: id, message: 'No compatible acquisition proof meets the current requirements.' }];
}
