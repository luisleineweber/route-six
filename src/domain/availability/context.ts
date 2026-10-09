import type { GameData, Milestone, Requirement } from '../types';
import type { ProofPath } from '../proofs';
import { mergeChoices, unique } from '../proofs';

export interface Witness {
  choices: ProofPath['choices'];
  individuals: ProofPath['individuals'];
  itemUses: ProofPath['itemUses'];
  sourceIds: string[];
  minimumLevel: number;
}
export const emptyWitness = (): Witness => ({ choices: [], individuals: [], itemUses: [], sourceIds: [], minimumLevel: 1 });
export function mergeWitness(a: Witness, b: Witness): Witness {
  return { choices: mergeChoices([...a.choices, ...b.choices]), individuals: [...a.individuals, ...b.individuals],
    itemUses: [...a.itemUses, ...b.itemUses], sourceIds: unique([...a.sourceIds, ...b.sourceIds]), minimumLevel: Math.max(a.minimumLevel, b.minimumLevel) };
}

const ancestryCache = new WeakMap<GameData, Map<string, Set<string>>>();
export function ancestors(game: GameData, id: string): Set<string> {
  let cache = ancestryCache.get(game);
  if (!cache) { cache = new Map(); ancestryCache.set(game, cache); }
  const cached = cache.get(id);
  if (cached) return cached;
  const milestones = new Map(game.milestones.map(m => [m.id, m]));
  const found = new Set<string>();
  function visit(current: string) {
    if (found.has(current)) return;
    const m = milestones.get(current);
    if (!m) throw new Error(`Missing validated milestone: ${current}`);
    found.add(current); m.previousIds.forEach(visit);
  }
  visit(id); cache.set(id, found); return found;
}

export interface AccessContext {
  game: GameData;
  milestone: Milestone;
  reached: Set<string>;
  limit: number;
  paths: Map<string, ProofPath[]>;
  resourceLimits: Record<string, number | null>;
  requirementCache?: Map<string, Witness[]>;
  partnerCache?: ProofPath[];
}

export function limitsFor(game: GameData): Record<string, number | null> {
  return Object.fromEntries([
    ...game.sources.map(s => [`source:${s.id}`, s.maxUses]),
    ...game.items.flatMap(item => item.sources.map(s => [`item-source:${s.id}`, s.maxUses])),
  ]);
}

export function requirementWitnesses(ctx: AccessContext, req: Requirement, seen = new Set<string>()): Witness[] {
  const key = JSON.stringify([req, [...seen].sort()]);
  const cached = ctx.requirementCache?.get(key);
  if (cached) return cached;
  const value = evaluateRequirement(ctx, req, seen);
  ctx.requirementCache?.set(key, value);
  return value;
}

function evaluateRequirement(ctx: AccessContext, req: Requirement, seen: Set<string>): Witness[] {
  if (req.kind === 'all') {
    let current = [emptyWitness()];
    for (const child of req.requirements) current = current.flatMap(a => requirementWitnesses(ctx, child, seen).map(b => mergeWitness(a, b)));
    return current;
  }
  if (req.kind === 'any') return req.requirements.flatMap(child => requirementWitnesses(ctx, child, seen));
  if (req.kind === 'milestone') return ctx.reached.has(req.id) ? [emptyWitness()] : [];
  const key = `${req.kind}:${req.id}`;
  if (seen.has(key)) return [];
  const nextSeen = new Set([...seen, key]);
  if (req.kind === 'capability') {
    const capability = ctx.game.capabilities.find(c => c.id === req.id);
    if (!capability) throw new Error(`Missing capability: ${req.id}`);
    return requirementWitnesses(ctx, capability.requirements, nextSeen);
  }
  if (req.kind === 'pokemon') {
    return usefulPaths(ctx, ctx.paths.get(req.id) ?? []).map(path => ({ choices: path.choices,
      individuals: Array.from({ length: req.quantity }, (_, copy) => path.individuals.map(p => p.origin === path.outputOrigin && p.use === 'consume'
        ? { ...p, use: req.consumed ? p.use : 'retain' as const, ...(req.quantity>1?{copy}:{}) } : p)).flat(),
      itemUses: path.itemUses, sourceIds: path.sourceIds, minimumLevel: path.minimumLevel }));
  }
  const item = ctx.game.items.find(i => i.id === req.id);
  if (!item) throw new Error(`Missing item: ${req.id}`);
  return item.sources.flatMap(source => {
    const location = ctx.game.locations.find(l => l.id === source.locationId)!;
    return requirementWitnesses(ctx, { kind: 'all', requirements: [location.requirements, source.requirements] }, nextSeen).map(witness => ({ ...witness,
      choices: mergeChoices([...witness.choices, ...(source.choice ? [source.choice] : [])]),
      itemUses: [...witness.itemUses, { resourceId: `item-source:${source.id}`, token: `${req.id}:${source.id}`, quantity: req.quantity, consumed: req.consumed }],
    }));
  });
}

/** Keep every finite/choice alternative. Equivalent repeatable parents need one lowest-level witness. */
export function usefulPaths(ctx: AccessContext, paths: ProofPath[]): ProofPath[] {
  const useful = new Map<string, ProofPath>();
  for (const path of paths) {
    const key = JSON.stringify([path.pokemonId, path.genders, path.choices,
      path.individuals.filter(i => ctx.resourceLimits[i.origin] !== null),
      path.itemUses.filter(i => ctx.resourceLimits[i.resourceId] !== null),
    ]);
    const existing = useful.get(key);
    if (!existing || path.minimumLevel < existing.minimumLevel) useful.set(key, path);
  }
  return [...useful.values()];
}
