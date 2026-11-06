import type { Gender, PokemonProfile, PokemonSource } from '../types';
import type { ProofPath } from '../proofs';
import { claimsFor, mergeChoices, unique } from '../proofs';
import { findConflict } from '../team/resources';
import { requirementWitnesses, usefulPaths, type AccessContext } from './context';
import { pokemonSelections, selectionId } from '../pokemon-selection';

export function compatibleGenders(a: PokemonProfile, b: PokemonProfile, ga: Gender, gb: Gender): boolean {
  if (!a.breeding || !b.breeding || ga === 'not-applicable' || gb === 'not-applicable') return false;
  const ae = a.breeding.eggGroupIds; const be = b.breeding.eggGroupIds;
  if (ae.includes('undiscovered') || be.includes('undiscovered')) return false;
  const ad = ae.includes('ditto'); const bd = be.includes('ditto');
  if (ad || bd) return ad !== bd;
  return ga !== 'genderless' && gb !== 'genderless' && ga !== gb && ae.some(group => be.includes(group));
}

function retained(path: ProofPath): ProofPath['individuals'] {
  return path.individuals.map(p => p.origin === path.outputOrigin && p.use === 'consume'
    ? { ...p, use: 'retain' } : { ...p });
}

export function breedingPaths(ctx: AccessContext, source: PokemonSource): ProofPath[] {
  if (source.details.kind !== 'breeding' || ctx.game.game.breeding === null) return [];
  const rule = ctx.game.breedingRules.find(r => r.id === (source.details as { ruleId: string }).ruleId)!;
  const profileById = ctx.breedingProfiles ??= new Map(pokemonSelections(ctx.game)
    .map(profile => [selectionId(profile.pokemonId, profile.formId), profile]));
  const requirements = requirementWitnesses(ctx, source.requirements);
  if (!requirements.length || source.level.kind !== 'fixed' || source.level.value > ctx.limit) return [];
  const results: ProofPath[] = [];
  const parentPaths = [...rule.parentPokemonIds, ...(rule.parentFormIds ?? [])].flatMap(id => usefulPaths(ctx, ctx.paths.get(id) ?? []))
    .filter(path => !path.sourceIds.includes(source.id));
  const partners = ctx.partnerCache ??= new Map<string, ProofPath[]>();
  if (!partners.size) for (const paths of ctx.paths.values()) for (const path of usefulPaths(ctx, paths)) {
    const profile = profileById.get(selectionId(path.pokemonId, path.formId))!;
    for (const group of profile.breeding?.eggGroupIds ?? []) {
      const candidates = partners.get(group) ?? [];
      candidates.push(path); partners.set(group, candidates);
    }
  }
  // Retained keys and held items can serve both parents and later eggs.
  const unconstrained = (p: ProofPath) => !p.choices.length && p.individuals.every(i => ctx.resourceLimits[i.origin] === null)
    && p.itemUses.every(i => (!i.consumed && !i.heldByOrigin) || i.acquisitionId || ctx.resourceLimits[i.resourceId] === null);
  const parentKey = (path: ProofPath, gender: Gender) => JSON.stringify([
    gender, [...profileById.get(selectionId(path.pokemonId, path.formId))!.breeding!.eggGroupIds].sort(),
  ]);
  const freeParents = new Map<string, ProofPath>();
  for (const path of parentPaths) if (unconstrained(path)) for (const gender of path.genders) {
    const key = parentKey(path, gender);
    const previous = freeParents.get(key);
    if (!previous || path.minimumLevel < previous.minimumLevel) freeParents.set(key, path);
  }
  // The same offspring needs no costly parent alternative when a repeatable
  // parent has the same gender and partner compatibility.
  const parentCandidates = [...new Set([...freeParents.values(), ...parentPaths.filter(path =>
    path.genders.some(gender => !freeParents.has(parentKey(path, gender))))])];
  for (const parent of parentCandidates) {
    if (parent.sourceIds.includes(source.id)) continue;
    const a = profileById.get(selectionId(parent.pokemonId, parent.formId))!;
    // Equivalent partners share Egg Groups, gender, choice and finite resource constraints.
    const representatives = new Map<string, ProofPath>();
    const pairs: { partner: ProofPath; ga: Gender; gb: Gender }[] = [];
    const groups = a.breeding!.eggGroupIds.includes('ditto') ? [...partners.keys()]
      : [...a.breeding!.eggGroupIds, 'ditto'];
    const candidates = new Set(groups.flatMap(group => partners.get(group) ?? []));
    for (const partner of candidates) {
      if (partner.sourceIds.includes(source.id)) continue;
      const b = profileById.get(selectionId(partner.pokemonId, partner.formId))!;
      for (const ga of parent.genders) for (const gb of partner.genders) {
        if (compatibleGenders(a, b, ga, gb) && (b.breeding!.eggGroupIds.includes('ditto') || ga === 'female')) {
          pairs.push({ partner, ga, gb });
        }
      }
    }
    const freeGenders = new Set(pairs.filter(p => unconstrained(p.partner)).map(p => `${p.ga}:${p.gb}`));
    for (const { partner, ga, gb } of pairs) {
      if (partner.sourceIds.includes(source.id)) continue;
      if (freeGenders.has(`${ga}:${gb}`) && !unconstrained(partner)) continue;
      const key = JSON.stringify([ga, gb, partner.choices,
        partner.individuals.filter(i => ctx.resourceLimits[i.origin] !== null),
        partner.itemUses.filter(i => (i.consumed || i.heldByOrigin) && !i.acquisitionId && ctx.resourceLimits[i.resourceId] !== null)]);
      if (!representatives.has(key) || representatives.get(key)!.minimumLevel > partner.minimumLevel) representatives.set(key, partner);
    }
    for (const partner of representatives.values()) for (const ga of parent.genders) for (const gb of partner.genders) {
      const b = profileById.get(selectionId(partner.pokemonId, partner.formId))!;
      if (!compatibleGenders(a, b, ga, gb) || (!b.breeding!.eggGroupIds.includes('ditto') && ga !== 'female')) continue;
      for (const req of requirements) {
        const parentProof = retained(parent);
        const partnerProof = retained(partner).map(p => parent.outputOrigin===partner.outputOrigin && p.origin===partner.outputOrigin
          && parentProof.some(a=>a.origin===p.origin&&a.gender===p.gender)
          ? {...p,copy:1} : p);
        // Both parents must be alive together. One parent's earlier trade cannot
        // consume the sole animal that is needed as the other parent.
        for(const [retains,other] of [[parentProof,partnerProof],[partnerProof,parentProof]]) {
          for(const animal of retains.filter(p=>p.use==='retain')) {
            if(other.some(p=>p.use==='consume'&&p.origin===animal.origin&&p.gender===animal.gender)) {
              animal.copy=0;
              for(const used of other.filter(p=>p.use==='consume'&&p.origin===animal.origin&&p.gender===animal.gender))used.copy=1;
            }
          }
        }
        const outputOrigin = `source:${source.id}`;
        const choices = mergeChoices([...parent.choices, ...partner.choices, ...req.choices]);
        for (const offspringGender of source.genders) {
          const path: ProofPath = {
            id: '', pokemonId: source.pokemonId, formId: source.formId ?? null, formChangeIds: [], outputOrigin,
            sourceIds: unique([...parent.sourceIds, ...partner.sourceIds, source.id, ...req.sourceIds]),
            evolutionIds: [], breedingSteps: [{ sourceId: source.id, ruleId: rule.id,
              parents: [{ pokemonId: parent.pokemonId, formId: parent.formId ?? null, gender: ga, pathId: parent.id },
                { pokemonId: partner.pokemonId, formId: partner.formId ?? null, gender: gb, pathId: partner.id }] }],
            genders: [offspringGender], minimumLevel: source.level.value, firstMilestoneIds: [ctx.milestone.id],
            choices, claims: [], coProductIds: [],
            individuals: [...parentProof, ...partnerProof, ...req.individuals,
              { origin: outputOrigin, gender: offspringGender, stages: [`${selectionId(source.pokemonId, source.formId)}:${offspringGender}`], use: 'consume', coProducts: [] }],
            itemUses: [...parent.itemUses, ...partner.itemUses, ...req.itemUses.map(u=>u.consumed&&!u.ownerOrigin&&!u.acquisitionId?{...u,ownerOrigin:outputOrigin}:u)],
            ancestors: [],
            knownMoveIds: source.knownMoveIds ?? [],
            conditions: [`Breed ${parent.pokemonId} (${ga}) with ${partner.pokemonId} (${gb}) at the Day Care.`, ...(rule.requiredHeldItemId ? [`One parent must hold ${rule.requiredHeldItemId}.`] : [])],
          };
          path.claims = claimsFor(path);
          if (!findConflict({ choiceGroups: ctx.game.choices, resourceLimits: ctx.resourceLimits }, [path])) results.push(path);
        }
      }
    }
  }
  return results;
}
