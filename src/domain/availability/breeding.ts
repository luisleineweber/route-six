import type { Gender, PokemonProfile, PokemonSource } from '../types';
import type { ProofPath } from '../proofs';
import { claimsFor, mergeChoices, unique } from '../proofs';
import { findConflict } from '../team/resources';
import { requirementWitnesses, usefulPaths, type AccessContext } from './context';

export function compatibleGenders(a: PokemonProfile, b: PokemonProfile, ga: Gender, gb: Gender): boolean {
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
  if (source.details.kind !== 'breeding') return [];
  const rule = ctx.game.breedingRules.find(r => r.id === (source.details as { ruleId: string }).ruleId)!;
  const profileById = new Map(ctx.game.profiles.map(p => [p.pokemonId, p]));
  const requirements = requirementWitnesses(ctx, source.requirements);
  if (!requirements.length || source.level.kind !== 'fixed' || source.level.value > ctx.limit) return [];
  const results: ProofPath[] = [];
  const parentCandidates = rule.parentPokemonIds.flatMap(id => usefulPaths(ctx, ctx.paths.get(id) ?? []));
  const partners = ctx.partnerCache ??= [...ctx.paths.values()].flatMap(paths => usefulPaths(ctx, paths));
  const unconstrained = (p: ProofPath) => !p.choices.length && p.individuals.every(i => ctx.resourceLimits[i.origin] === null)
    && p.itemUses.every(i => ctx.resourceLimits[i.resourceId] === null);
  for (const parent of parentCandidates) {
    if (parent.sourceIds.includes(source.id)) continue;
    const a = profileById.get(parent.pokemonId)!;
    // Equivalent partners share Egg Groups, gender, choice and finite resource constraints.
    const representatives = new Map<string, ProofPath>();
    const pairs = partners.flatMap(partner => parent.genders.flatMap(ga => partner.genders.flatMap(gb => {
      const b = profileById.get(partner.pokemonId)!;
      return compatibleGenders(a, b, ga, gb) && (b.breeding.eggGroupIds.includes('ditto') || ga === 'female') ? [{partner,ga,gb}] : [];
    })));
    const freeGenders = new Set(pairs.filter(p => unconstrained(p.partner)).map(p => `${p.ga}:${p.gb}`));
    for (const { partner, ga, gb } of pairs) {
      if (partner.sourceIds.includes(source.id)) continue;
      if (freeGenders.has(`${ga}:${gb}`) && !unconstrained(partner)) continue;
      const key = JSON.stringify([ga, gb, partner.choices,
        partner.individuals.filter(i => ctx.resourceLimits[i.origin] !== null),
        partner.itemUses.filter(i => ctx.resourceLimits[i.resourceId] !== null)]);
      if (!representatives.has(key) || representatives.get(key)!.minimumLevel > partner.minimumLevel) representatives.set(key, partner);
    }
    for (const partner of representatives.values()) for (const ga of parent.genders) for (const gb of partner.genders) {
      const b = profileById.get(partner.pokemonId)!;
      if (!compatibleGenders(a, b, ga, gb) || (!b.breeding.eggGroupIds.includes('ditto') && ga !== 'female')) continue;
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
            id: '', pokemonId: source.pokemonId, outputOrigin,
            sourceIds: unique([...parent.sourceIds, ...partner.sourceIds, source.id, ...req.sourceIds]),
            evolutionIds: [], breedingSteps: [{ sourceId: source.id, ruleId: rule.id,
              parents: [{ pokemonId: parent.pokemonId, gender: ga, pathId: parent.id }, { pokemonId: partner.pokemonId, gender: gb, pathId: partner.id }] }],
            genders: [offspringGender], minimumLevel: source.level.value, firstMilestoneIds: [ctx.milestone.id],
            choices, claims: [], coProductIds: [],
            individuals: [...parentProof, ...partnerProof, ...req.individuals,
              { origin: outputOrigin, gender: offspringGender, stages: [`${source.pokemonId}:${offspringGender}`], use: 'consume', coProducts: [] }],
            itemUses: [...parent.itemUses, ...partner.itemUses, ...req.itemUses.map(u=>u.consumed&&!u.ownerOrigin?{...u,ownerOrigin:outputOrigin}:u)],
            ancestors: [],
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
