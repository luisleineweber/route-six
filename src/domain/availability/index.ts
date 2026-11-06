import type { AvailabilityQuery, AvailabilitySnapshot, Dataset, GameData, QueryError, Result } from '../types';
import { solve } from './solve';
import { ancestors, limitsFor, type AccessContext } from './context';
import { pokemonBlockers } from './blockers';
import { pathSignature, type ProofPath } from '../proofs';
import { leaves } from '../requirements';
import { pokemonSelections, selectionId } from '../pokemon-selection';
import { isExclusionBlocker } from './exclusions';
import { fullGameStages } from './full-game-stages';

const contexts = new WeakMap<GameData, Map<string, AccessContext>>();
const relevantIds = new WeakMap<GameData, Set<string>>();
const stageGames = new WeakMap<GameData, GameData>();
function context(game: GameData, milestoneId: string, limit: boolean, history: Set<string> = new Set()): AccessContext {
  let cache = contexts.get(game);
  if (!cache) { cache = new Map(); contexts.set(game, cache); }
  let relevant = relevantIds.get(game);
  if (!relevant) {
    relevant = new Set([...game.locations, ...game.capabilities, ...game.sources, ...game.evolutions, ...(game.formChanges ?? []),
      ...game.items.flatMap(i => i.sources)].flatMap(r => leaves(r.requirements)).filter(r => r.kind === 'milestone').map(r => r.id));
    for (const evolution of game.evolutions) for (const condition of evolution.conditions) {
      if (condition.kind !== 'known-move') continue;
      for (const route of condition.learning) if (route.kind === 'teach') {
        for (const leaf of leaves(route.requirements)) if (leaf.kind === 'milestone') relevant.add(leaf.id);
      }
    }
    relevantIds.set(game, relevant);
  }
  const selected = game.milestones.find(m => m.id === milestoneId)!;
  const bossLevel = limit ? game.bosses.find(b => b.id === selected.nextBossId)?.highestLevel ?? 100 : 100;
  const extra = [...history].filter(id => relevant!.has(id) && !ancestors(game, milestoneId).has(id));
  if (history.size && !extra.length) return context(game, milestoneId, limit);
  const stateKey = (id: string) => `${[...new Set([...ancestors(game, id), ...history])].filter(id => relevant!.has(id)).sort().join(',')}:${bossLevel}`;
  const key = `${stateKey(milestoneId)}:history=${[...history].filter(id=>relevant!.has(id)).sort().join(',')}`;
  let value = cache.get(key);
  if (!value) {
    const equivalents = game.milestones.filter(m => !history.has(m.id)
      && (limit ? game.bosses.find(b => b.id === m.nextBossId)?.highestLevel ?? 100 : 100) === bossLevel
      && stateKey(m.id) === stateKey(milestoneId));
    const first = equivalents[0];
    const reached = new Set([...ancestors(game, first.id), ...history]);
    let earlier: AccessContext | undefined;
    let largest = 0;
    for (const candidate of cache.values()) {
      if (candidate.limit > bossLevel || [...candidate.reached].some(id => !reached.has(id))) continue;
      const size = [...candidate.paths.values()].reduce((total, paths) => total + paths.length, 0);
      if (size > largest) { earlier = candidate; largest = size; }
    }
    value = solve(game, first, limit, history, `${first.id}:context-${cache.size}`, earlier);
    const firstIds = firstPoints(game, equivalents.map(m => m.id));
    for (const paths of value.paths.values()) for (const path of paths) path.firstMilestoneIds = firstIds;
    cache.set(key, value);
  }
  return value;
}

function firstPoints(game: GameData, ids: string[]): string[] {
  return ids.filter(id => !ids.some(other => other !== id && ancestors(game, id).has(other)));
}

export function getAvailability(data: Dataset, query: AvailabilityQuery): Result<AvailabilitySnapshot, QueryError> {
  const game = data.games.find(g => g.game.id === query.gameId);
  if (!game) return { ok: false, error: { code: 'unknown-game', gameId: query.gameId } };
  if (game.game.planner === null) return { ok: false, error: { code: 'progress-not-ready', gameId: query.gameId } };
  const milestone = game.milestones.find(m => m.id === query.milestoneId);
  if (!milestone) return { ok: false, error: { code: 'unknown-milestone', milestoneId: query.milestoneId } };
  const current = context(game, milestone.id, query.respectLevelLimit);
  const reached = ancestors(game, milestone.id);
  const boss = game.bosses.find(b => b.id === milestone.nextBossId);
  const snapshot: AvailabilitySnapshot = { query, levelLimit: boss ? { bossId: boss.id, level: boss.highestLevel } : null,
    entries: {}, paths: {}, choiceGroups: game.choices, resourceLimits: limitsFor(game) };
  // Keep earlier acquisitions even if a later milestone uses a lower recommended level.
  const present = [...new Set([...reached].map(id => context(game, id, query.respectLevelLimit)))];
  const currentPaths = new Map<string, ProofPath[]>();
  for (const ctx of present) for (const [id, paths] of ctx.paths) currentPaths.set(id, [...(currentPaths.get(id) ?? []), ...paths]);
  const futurePaths = new Map<string, ProofPath[]>();
  const aliases = new Map<string, string>();
  // Future access must extend this query's required history, including optional branches.
  const future = game.milestones.filter(m => !reached.has(m.id));
  const visitedContexts = new Set(present);
  for (const m of future) {
    const ctx = context(game, m.id, query.respectLevelLimit, reached);
    if (visitedContexts.has(ctx)) continue;
    visitedContexts.add(ctx);
    for (const [id, paths] of ctx.paths) futurePaths.set(id, [...(futurePaths.get(id) ?? []), ...paths]);
  }
  for (const profile of pokemonSelections(game)) {
    const id = selectionId(profile.pokemonId, profile.formId);
    const now = currentPaths.get(id) ?? [];
    const later = futurePaths.get(id) ?? [];
    const blockers = now.length ? [] : pokemonBlockers(game, current, id);
    const unavailable = !later.length && blockers.some(isExclusionBlocker);
    const firstMilestoneIds = firstPoints(game, [...new Set((now.length ? now : later).flatMap(p => p.firstMilestoneIds))]);
    const canonical = new Map<string, ProofPath>();
    const currentKeys = new Set(now.map(pathSignature));
    const compact = (paths: ProofPath[], future = false) => paths.map(path => {
      const key = pathSignature(path);
      const existing = canonical.get(key);
      if (existing) {
        aliases.set(path.id, existing.id);
        // A future optional visit includes the selected history. It cannot make
        // an existing catch available earlier than its current proof.
        if (!future || !currentKeys.has(key)) {
          existing.firstMilestoneIds = firstPoints(game, [...new Set([...existing.firstMilestoneIds, ...path.firstMilestoneIds])]);
        }
        return existing;
      }
      const copy = { ...path, firstMilestoneIds: [...path.firstMilestoneIds] };
      aliases.set(path.id, copy.id);
      canonical.set(key, copy); return copy;
    });
    const compactNow = compact(now); const compactLater = compact(later, true);
    for (const path of [...compactNow, ...compactLater]) snapshot.paths[path.id] = path;
    snapshot.entries[id] = { pokemonId: profile.pokemonId, status: now.length ? 'available' : later.length ? 'later' : unavailable ? 'unavailable' : 'blocked',
      currentPathIds: [...new Set(compactNow.map(p => p.id))], futurePathIds: [...new Set(compactLater.map(p => p.id))], firstMilestoneIds, blockers };
  }
  for (const path of Object.values(snapshot.paths)) path.breedingSteps = path.breedingSteps.map(step => ({ ...step,
    parents: step.parents.map(parent => ({ ...parent, pathId: aliases.get(parent.pathId) ?? parent.pathId })) as typeof step.parents }));
  return { ok: true, value: snapshot };
}

/** Check possible access before one Gym or League entry, with that battle's cap. */
export function getStageAvailability(data: Dataset, query: AvailabilityQuery): Result<AvailabilitySnapshot, QueryError> {
  const game = data.games.find(game => game.game.id === query.gameId);
  if (!game) return { ok: false, error: { code: 'unknown-game', gameId: query.gameId } };
  if (!game.game.planner) return { ok: false, error: { code: 'progress-not-ready', gameId: query.gameId } };
  const stages = fullGameStages(game);
  const stage = stages.find(stage => stage.milestoneId === query.milestoneId);
  if (!stage) return { ok: false, error: { code: 'unknown-milestone', milestoneId: query.milestoneId } };
  let stageGame = stageGames.get(game);
  if (!stageGame) {
    stageGame = { ...game, milestones: [...game.milestones, ...stages.map(point => ({
      ...game.milestones.find(milestone => milestone.id === point.milestoneId)!,
      id: `before-battle:${point.id}`, previousIds: [point.milestoneId], nextBossId: point.bossId,
    }))] };
    stageGames.set(game, stageGame);
  }
  const atStage = (point: typeof stage) => context(stageGame!, `before-battle:${point.id}`, query.respectLevelLimit, new Set(point.reachedIds));
  const current = atStage(stage);
  const snapshot: AvailabilitySnapshot = { query, levelLimit: { bossId: stage.bossId, level: stage.level },
    entries: {}, paths: {}, choiceGroups: game.choices, resourceLimits: limitsFor(game) };
  // A lower later cap must not remove an animal obtained at an earlier stage.
  const earlier = query.respectLevelLimit ? stages.slice(0, stages.indexOf(stage)).filter(point => point.level > stage.level)
    .map(atStage) : [];
  for (const profile of pokemonSelections(game)) {
    const id = selectionId(profile.pokemonId, profile.formId);
    const paths = [current, ...earlier].flatMap(point => point.paths.get(id) ?? []);
    const blockers = paths.length ? [] : pokemonBlockers(game, current, id);
    // Stage contexts prove current access, not the first real acquisition point.
    for (const path of paths) snapshot.paths[path.id] = { ...path, firstMilestoneIds: [] };
    snapshot.entries[id] = { pokemonId: profile.pokemonId,
      status: paths.length ? 'available' : blockers.some(isExclusionBlocker) ? 'unavailable' : 'blocked',
      currentPathIds: paths.map(path => path.id), futurePathIds: [], firstMilestoneIds: [], blockers };
  }
  return { ok: true, value: snapshot };
}
