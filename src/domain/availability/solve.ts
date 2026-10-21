import type { EvolutionCondition, GameData, Milestone } from '../types';
import type { ProofPath } from '../proofs';
import { claimsFor, compactItemUses, mergeChoices, pathSignature, unique } from '../proofs';
import { findConflict } from '../team/resources';
import { ancestors, limitsFor, requirementWitnesses, type AccessContext } from './context';
import { breedingPaths } from './breeding';
import { evolutionWitnesses } from './evolution-actions';
import { selectionId } from '../pokemon-selection';
import { formChangePaths } from './form-changes';
import { seedPaths } from './seed-paths';

export function conditionText(c: EvolutionCondition, generation: number): string {
  switch (c.kind) {
    case 'friendship': return `Raise friendship to ${c.minimum}, then gain a level.`;
    case 'beauty': return `Raise Beauty to ${c.minimum} with ${generation === 4 ? 'Poffins' : 'dry Pokéblocks'}, then gain a level.`;
    case 'time': return `Gain a level during the ${c.period}.`;
    case 'stats': return `At evolution, ${c.relation.replaceAll('-', ' ')}.`;
    case 'personality': return `Select a personality with remainder ${c.minimum}–${c.maximum} modulo ${c.modulus}.`;
    case 'party-space': return `Leave ${c.freeSlots} free party slot${c.freeSlots === 1 ? '' : 's'}.`;
    case 'location': return `Gain a level at ${c.locationId}.`;
    case 'held-item': return `Hold ${c.itemId}, then gain a level. The evolution uses the item.`;
    case 'party-pokemon': return `Keep ${c.pokemonId} in the party, then gain a level.`;
    case 'party-type': return `Keep another ${c.typeId}-type Pokémon in the party, then gain a level.`;
    case 'affection': return 'At least two hearts in Pokémon-Amie, then gain a level.';
    case 'weather': return 'Gain a level in natural rain.';
    case 'device-orientation': return 'Hold the Nintendo 3DS upside-down when the Pokémon gains a level.';
    case 'known-move': return `Know ${c.moveName}, then gain a level.`;
  }
}

export function solve(game: GameData, milestone: Milestone, respectLevelLimit: boolean, history: ReadonlySet<string> = new Set(), pathPrefix = milestone.id, earlier?: AccessContext): AccessContext {
  const reached = new Set([...ancestors(game, milestone.id), ...history]);
  const boss = game.bosses.find(b => b.id === milestone.nextBossId);
  const ctx: AccessContext = { game, milestone, reached, limit: respectLevelLimit && boss ? boss.highestLevel : 100,
    paths: new Map(), resourceLimits: limitsFor(game) };
  const signatures = new Set<string>();
  const breedingSignatures = new Set<string>();
  const locations = new Map(game.locations.map(l => [l.id, l]));
  let sequence = 0;
  function add(path: ProofPath): boolean {
    if (path.minimumLevel > ctx.limit || path.minimumLevel > 100) return false;
    path.itemUses = compactItemUses(path.itemUses);
    const signature = pathSignature(path);
    if (signatures.has(signature)) return false;
    if (path.breedingSteps.length) {
      // Repeatable parents with the same choices and finite claims prove the same egg.
      // Keep distinct finite sources, genders, item costs and resulting levels.
      const key = JSON.stringify([path.pokemonId, path.formId ?? null, path.genders, path.minimumLevel, path.choices, path.knownMoveIds ?? [],
        path.individuals.filter(i => ctx.resourceLimits[i.origin] !== null).map(i => [i.origin, i.gender, i.use]),
        path.itemUses.filter(i => ctx.resourceLimits[i.resourceId] !== null)]);
      if (breedingSignatures.has(key)) return false;
      breedingSignatures.add(key);
    }
    if (findConflict({ choiceGroups: game.choices, resourceLimits: ctx.resourceLimits }, [path])) return false;
    signatures.add(signature);
    path.id = `${pathPrefix}:path-${sequence++}`;
    const id = selectionId(path.pokemonId, path.formId);
    const paths = ctx.paths.get(id) ?? [];
    paths.push(path); ctx.paths.set(id, paths); return true;
  }
  if (earlier) seedPaths(ctx, earlier, add);
  let changed = true;
  while (changed) {
    changed = false;
    ctx.requirementCache = new Map();
    ctx.partnerCache = undefined;
    for (const source of game.sources) {
      const location = locations.get(source.locationId)!;
      if (source.details.kind === 'breeding') {
        if (!requirementWitnesses(ctx, location.requirements).length) continue;
        for (const path of breedingPaths(ctx, source)) changed = add(path) || changed;
        continue;
      }
      const req = { kind: 'all' as const, requirements: [location.requirements, source.requirements] };
      for (const witness of requirementWitnesses(ctx, req)) {
        if (witness.sourceIds.includes(source.id)) continue;
        const minimumLevel = source.level.kind === 'fixed' ? source.level.value : source.level.kind === 'range' ? source.level.minimum : witness.minimumLevel;
        for (const gender of source.genders) {
          const outputOrigin = `source:${source.id}`;
          const path: ProofPath = { id: '', pokemonId: source.pokemonId, formId: source.formId ?? null,
            formChangeIds: [], outputOrigin, sourceIds: unique([source.id, ...witness.sourceIds]),
            evolutionIds: [], breedingSteps: [], genders: [gender], minimumLevel, firstMilestoneIds: [milestone.id],
            choices: mergeChoices([...(source.choice ? [source.choice] : []), ...witness.choices]), claims: [], coProductIds: [],
            individuals: [...witness.individuals.map(p=>p.use==='consume'&&!p.consumedBy&&source.maxUses===1?{...p,consumedBy:source.id}:p),
              { origin: outputOrigin, gender, stages: [`${selectionId(source.pokemonId, source.formId)}:${gender}`], use: 'consume', coProducts: [] }],
            itemUses: witness.itemUses.map(u=>u.consumed&&!u.ownerOrigin&&!u.acquisitionId?{...u,ownerOrigin:outputOrigin}:u),
            knownMoveIds: source.knownMoveIds ?? [], ancestors: [], conditions: [] };
          path.claims = claimsFor(path); changed = add(path) || changed;
        }
      }
    }
    for (const evolution of game.evolutions) {
      if (evolution.trigger === 'player-trade') continue;
      const from = selectionId(evolution.fromPokemonId, evolution.fromFormId);
      const to = selectionId(evolution.toPokemonId, evolution.toFormId);
      for (const parent of [...(ctx.paths.get(from) ?? [])]) {
        if (evolution.excludedSourceIds?.some(id => parent.outputOrigin === `source:${id}`)) continue;
        if (parent.ancestors.includes(to) || parent.evolutionIds.includes(evolution.id)) continue;
        const witnesses = evolutionWitnesses(ctx, evolution, parent);
        const genders = evolution.genderTransitions ? unique(evolution.genderTransitions.filter(t => parent.genders.includes(t.from)).map(t => t.to)) : parent.genders;
        if (!genders.length) continue;
        for (const gender of genders) for (const witness of witnesses) {
          const path: ProofPath = { ...parent, id: '', pokemonId: evolution.toPokemonId, formId: evolution.toFormId ?? null,
            sourceIds: unique([...parent.sourceIds, ...witness.sourceIds]), evolutionIds: [...parent.evolutionIds, evolution.id],
            genders: [gender], minimumLevel: witness.minimumLevel, choices: mergeChoices([...parent.choices, ...witness.choices]),
            firstMilestoneIds: [milestone.id], coProductIds: evolution.coProductIds,
            individuals: [...parent.individuals.map(p => p.origin === parent.outputOrigin && p.use === 'consume' ? { ...p,
              stages: [...p.stages, `${to}:${gender}`], coProducts: evolution.coProductIds } : p), ...witness.individuals],
            itemUses: [...parent.itemUses, ...witness.itemUses.map(u => u.ownerOrigin || u.acquisitionId ? u : { ...u,
              token: `${parent.outputOrigin}:${evolution.id}:${u.token}`, ...(u.consumed?{ownerOrigin:parent.outputOrigin}:{}) })],
            knownMoveIds: unique([...(parent.knownMoveIds ?? []), ...evolution.conditions
              .filter(condition => condition.kind === 'known-move').map(condition => condition.moveId)]),
            ancestors: unique([...parent.ancestors, from]), conditions: [...parent.conditions, ...evolution.conditions.map(condition => conditionText(condition, game.game.generation))] };
          path.claims = claimsFor(path); changed = add(path) || changed;
          for (const product of evolution.coProductIds) {
            const profile = game.profiles.find(p => p.pokemonId === product)!;
            const productGenders = parent.genders.filter(g=>profile.genders.includes(g));
            const productPath: ProofPath = { ...path, id: '', pokemonId: product, formId: null, genders: productGenders.length?productGenders:profile.genders,
              coProductIds: [evolution.toPokemonId], individuals: path.individuals.map(p => p.origin === parent.outputOrigin ? {
                ...p, stages: [...p.stages.slice(0, -1), `${product}:${productGenders[0]??profile.genders[0]}`], coProducts: [evolution.toPokemonId] } : p) };
            changed = add(productPath) || changed;
          }
        }
      }
    }
    for (const path of formChangePaths(ctx)) changed = add(path) || changed;
  }
  return ctx;
}
