import type { GameData, Requirement, ValidationIssue } from '../domain/types';
import { leaves } from '../domain/requirements';
import { pokemonSelections, selectionId } from '../domain/pokemon-selection';
import { validateItemSources } from './validate-item-sources';
import { formChangeRequirements } from '../domain/availability/form-changes';
import { validateUnovaSource } from './validate-unova-sources';

function requiresCapability(requirement: Requirement, id: string): boolean {
  if (requirement.kind === 'all') return requirement.requirements.some(child => requiresCapability(child, id));
  if (requirement.kind === 'any') return requirement.requirements.length > 0 && requirement.requirements.every(child => requiresCapability(child, id));
  return requirement.kind === 'capability' && requirement.id === id;
}

export function validateAcquisition(game: GameData, base: string): ValidationIssue[] {
  const issues: ValidationIssue[] = validateItemSources(game, base);
  const issue = (id: string, file: string, message: string) => issues.push({ recordId: id, fieldPath: base+file+'.json', message });
  const profiles = new Map(pokemonSelections(game).map(p => [selectionId(p.pokemonId, p.formId), p]));
  const locations = new Set(game.locations.map(l => l.id));
  const items = new Set(game.items.map(i => i.id));
  const rules = new Map(game.breedingRules.map(r => [r.id, r]));
  const choices = new Map(game.choices.map(c => [c.id, c]));
  const has = (req: Requirement, kind: string, id: string, consumed?: boolean) => leaves(req).some(l => l.kind === kind && l.id === id && (consumed === undefined || ('consumed' in l && l.consumed === consumed)));
  for (const group of game.choices) if (group.maximumSelections > group.options.length) issue(group.id, 'choices', 'Choice limit exceeds available options.');
  const allSources = [...game.sources, ...game.items.flatMap(i => i.sources)];
  const sourceIds = new Set<string>();
  for (const source of allSources) {
    if (sourceIds.has(source.id)) issue(source.id, 'sources', 'Source IDs must also be unique across items.');
    sourceIds.add(source.id);
    if (source.choice) {
      const group = choices.get(source.choice.groupId);
      if (!group?.options.includes(source.choice.optionId)) issue(source.id, 'sources', 'Unknown choice group or option.');
    }
  }
  for (const source of game.sources) {
    issues.push(...validateUnovaSource(game, source, base));
    const profile = profiles.get(selectionId(source.pokemonId, source.formId));
    if (!profile || profile.pokemonId !== source.pokemonId) { issue(source.id, 'sources', 'Unknown species or form.'); continue; }
    if (!locations.has(source.locationId)) issue(source.id, 'sources', 'Unknown location.');
    if (!source.genders.every(g => profile.genders.includes(g))) issue(source.id, 'sources', 'Source genders do not match the game profile.');
    if (source.level.kind === 'range' && source.level.minimum > source.level.maximum) issue(source.id, 'sources', 'Source level range is reversed.');
    if (source.details.kind === 'game-trade') {
      const offered = source.details.offeredPokemonId;
      if (offered !== null && !has(source.requirements, 'pokemon', offered, true)) issue(source.id, 'sources', 'Trade must consume its offered Pokémon.');
      if (source.level.kind === 'match-traded-pokemon' && source.level.pokemonId !== offered) issue(source.id, 'sources', 'Trade level refers to a different offered Pokémon.');
    }
    if (source.details.kind === 'fossil' && !has(source.requirements, 'item', source.details.itemId, true)) issue(source.id, 'sources', 'Fossil revival must consume its fossil.');
    if (source.details.kind === 'wild' && source.details.method !== 'grass' && !has(source.requirements, 'capability', source.details.method)) issue(source.id, 'sources', 'Encounter method must have an explicit capability requirement.');
    if (source.details.kind === 'wild') {
      const waterAccess = source.details.method === 'surf-spots' ? 'surf'
        : source.details.method === 'super-rod-spots' ? 'super-rod' : null;
      if (waterAccess && !has(source.requirements, 'capability', waterAccess)) {
        issue(source.id, 'sources', 'Rippling water encounters must also require their water access capability.');
      }
    }
    if (source.details.kind === 'honey-tree') {
      if (!has(source.requirements, 'capability', 'honey-tree') || !has(source.requirements, 'item', 'honey', true)) {
        issue(source.id, 'sources', 'Honey Tree encounters require the Honey Tree action and consumed Honey.');
      }
      if (source.maxUses !== null) issue(source.id, 'sources', 'Honey Tree encounters must be repeatable.');
    }
    if (source.details.kind === 'berry-tree') {
      if (!requiresCapability(source.requirements, 'berry-tree')) {
        issue(source.id, 'sources', 'Berry tree encounters require the berry-tree action in every alternative.');
      }
      if (source.maxUses !== null) issue(source.id, 'sources', 'Berry tree encounters must be repeatable.');
    }
    if (source.details.kind === 'dexnav') {
      if (!requiresCapability(source.requirements, 'dexnav')) {
        issue(source.id, 'sources', 'DexNav hidden Pokémon require the dexnav action in every alternative.');
      }
      if (source.maxUses !== null) issue(source.id, 'sources', 'DexNav hidden Pokémon must be repeatable.');
    }
    for (const condition of source.encounterConditions ?? []) {
      const action = condition.kind === 'radio' ? `${condition.sound}-sound`
        : condition.kind === 'headbutt-tree' ? 'headbutt' : condition.kind === 'safari-blocks' ? 'safari-blocks' : null;
      if (action && !requiresCapability(source.requirements, action)) {
        issue(source.id, 'sources', 'Encounter action must be required in every alternative.');
      }
      if (condition.kind === 'radio' && (source.details.kind !== 'wild' || source.details.method !== 'grass')) {
        issue(source.id, 'sources', 'Radio sound conditions require a grass encounter.');
      }
      if (condition.kind === 'headbutt-tree' && (source.details.kind !== 'wild' || source.details.method !== 'headbutt')) {
        issue(source.id, 'sources', 'Headbutt tree conditions require a Headbutt encounter.');
      }
      if (condition.kind === 'safari-blocks') {
        if (source.details.kind !== 'wild' || !['grass', 'surf', 'old-rod', 'good-rod', 'super-rod'].includes(source.details.method)) {
          issue(source.id, 'sources', 'Safari block conditions require grass, Surf, or fishing.');
        }
        if (new Set(condition.blocks.map(block => block.type)).size !== condition.blocks.length) {
          issue(source.id, 'sources', 'Safari block types must be unique.');
        }
        if (condition.blocks.reduce((count, block) => count + Math.ceil(block.points / 7), 0) > 30) {
          issue(source.id, 'sources', 'Safari block conditions exceed the 30-object limit, even at maximum area age.');
        }
      }
      const capability = condition.kind === 'swarm' ? 'swarm' : condition.kind === 'daily' ? `${condition.system}-daily` : null;
      if (capability && !has(source.requirements, 'capability', capability)) issue(source.id, 'sources', 'Conditional encounter needs its explicit action capability.');
      if (condition.kind === 'feebas-tiles' && (source.details.kind !== 'wild'
        || !['old-rod', 'good-rod', 'super-rod'].includes(source.details.method))) {
        issue(source.id, 'sources', 'Feebas tile conditions require a fishing method.');
      }
    }
    if (source.details.kind === 'breeding') {
      const rule = rules.get(source.details.ruleId);
      if (!rule?.offspringPokemonIds.includes(source.pokemonId)) issue(source.id, 'sources', 'Breeding source does not match its offspring rule.');
      if (!has(source.requirements, 'capability', source.details.capabilityId)) issue(source.id, 'sources', 'Breeding source must require Day Care access.');
      if (game.game.breeding === null) issue(source.id, 'sources', 'Breeding is not supported in this game.');
      else if (source.level.kind !== 'fixed' || source.level.value !== game.game.breeding.hatchLevel) {
        issue(source.id, 'sources', `Eggs must hatch at level ${game.game.breeding.hatchLevel}.`);
      }
      if (rule?.requiredHeldItemId && !has(source.requirements, 'item', rule.requiredHeldItemId, false)) issue(source.id, 'sources', 'Breeding held item must be retained.');
    }
  }
  for (const rule of game.breedingRules) {
    for (const id of [...rule.parentPokemonIds, ...rule.offspringPokemonIds]) if (!profiles.has(id)) issue(rule.id, 'breeding-rules', `Unknown Pokémon: ${id}`);
    for (const id of rule.parentFormIds ?? []) if (!profiles.get(id)?.formId) issue(rule.id, 'breeding-rules', `Unknown parent form: ${id}`);
    if (rule.offspringPokemonIds.some(id => profiles.get(id)?.breeding?.eggGroupIds.includes('ditto'))) {
      issue(rule.id, 'breeding-rules', 'Ditto cannot be an offspring of breeding.');
    }
    if (rule.requiredHeldItemId && !items.has(rule.requiredHeldItemId)) issue(rule.id, 'breeding-rules', 'Unknown held item.');
  }
  for (const evolution of game.evolutions) {
    const from = profiles.get(selectionId(evolution.fromPokemonId, evolution.fromFormId));
    const to = profiles.get(selectionId(evolution.toPokemonId, evolution.toFormId));
    if (!from || !to || from.pokemonId !== evolution.fromPokemonId || to.pokemonId !== evolution.toPokemonId) {
      issue(evolution.id, 'evolutions', 'Unknown evolution species or form.'); continue;
    }
    for (const id of evolution.excludedSourceIds ?? []) {
      if (game.sources.find(source => source.id === id)?.pokemonId !== evolution.fromPokemonId) {
        issue(evolution.id, 'evolutions', 'Evolution source restriction must name a source of its parent species.');
      }
    }
    if (evolution.itemId && !items.has(evolution.itemId)) issue(evolution.id, 'evolutions', 'Unknown evolution item.');
    if (evolution.trigger === 'use-item' && !has(evolution.requirements, 'item', evolution.itemId!, true)) issue(evolution.id, 'evolutions', 'Item evolution must consume the evolution item.');
    for (const condition of evolution.conditions) {
      if (condition.kind === 'location' || condition.kind === 'held-item'
        || condition.kind === 'party-pokemon' || condition.kind === 'party-type' || condition.kind === 'known-move') {
        if (evolution.trigger !== 'level-up') issue(evolution.id, 'evolutions', 'This evolution action requires a level gain.');
        if (condition.kind === 'party-pokemon' && condition.pokemonId === evolution.fromPokemonId) {
          issue(evolution.id, 'evolutions', 'The required party species must differ from the evolving species.');
        }
        if (condition.kind === 'party-type') {
          if (!game.typeChart.typeIds.includes(condition.typeId)) issue(evolution.id, 'evolutions', 'Unknown party type.');
          if (![...profiles.values()].some(profile => profile.pokemonId !== evolution.fromPokemonId && profile.types.includes(condition.typeId))) {
            issue(evolution.id, 'evolutions', 'The party type needs another reviewed species or form.');
          }
        }
        if (condition.kind === 'known-move') for (const route of condition.learning) {
          if (route.kind === 'teach' && !leaves(route.requirements).length) {
            issue(evolution.id, 'evolutions', 'Move teaching needs an explicit reviewed action requirement.');
          }
        }
        continue;
      }
      if (condition.kind === 'affection' || condition.kind === 'weather' || condition.kind === 'device-orientation') {
        if (evolution.trigger !== 'level-up') issue(evolution.id, 'evolutions', 'This evolution action requires a level gain.');
        const capability = condition.kind === 'affection' ? 'affection'
          : condition.kind === 'weather' ? condition.weather : condition.orientation;
        if (!requiresCapability(evolution.requirements, capability)) issue(evolution.id, 'evolutions', `Evolution must prove its ${condition.kind} action in every alternative.`);
        continue;
      }
      if (condition.kind === 'personality' && (condition.minimum > condition.maximum || condition.maximum >= condition.modulus)) issue(evolution.id, 'evolutions', 'Invalid personality interval.');
      const capability = { friendship: 'friendship', beauty: 'beauty', stats: 'stat-training', time: condition.kind === 'time' ? condition.period : '', personality: 'personality', 'party-space': 'party-space' }[condition.kind];
      if (!has(evolution.requirements, 'capability', capability)) issue(evolution.id, 'evolutions', `Evolution must prove its ${condition.kind} action.`);
    }
    for (const transition of evolution.genderTransitions ?? []) if (!from.genders.includes(transition.from) || !to.genders.includes(transition.to)) issue(evolution.id, 'evolutions', 'Invalid gender transition.');
    if (!evolution.genderTransitions && !from.genders.every(g => to.genders.includes(g))) issue(evolution.id, 'evolutions', 'Evolution needs explicit gender transitions.');
    for (const id of evolution.coProductIds) if (!profiles.has(id)) issue(evolution.id, 'evolutions', 'Unknown simultaneous product.');
  }
  for (const change of game.formChanges ?? []) {
    const from = profiles.get(selectionId(change.pokemonId, change.fromFormId));
    const to = profiles.get(selectionId(change.pokemonId, change.toFormId));
    if (!from || !to || from.pokemonId !== change.pokemonId || to.pokemonId !== change.pokemonId) issue(change.id, 'form-changes', 'Form change must use two profiles of the same species.');
    if (change.fromFormId === change.toFormId) issue(change.id, 'form-changes', 'Form change must change the form.');
    if (change.heldItemId && !items.has(change.heldItemId)) issue(change.id, 'form-changes', 'Unknown held item.');
    if (change.fusionPartnerPokemonId && (change.fusionPartnerPokemonId === change.pokemonId
      || !game.profiles.some(profile => profile.pokemonId === change.fusionPartnerPokemonId))) {
      issue(change.id, 'form-changes', 'Fusion needs another supported species as its partner.');
    }
  }
  const grounded = new Set([...profiles].filter(([, profile]) => game.exclusions.some(e => e.pokemonId === profile.pokemonId)).map(([id]) => id));
  const groundRequirement = (r:Requirement, seen=new Set<string>()):boolean => {
    if('requirements' in r)return r.kind==='all'?r.requirements.every(c=>groundRequirement(c,seen)):r.requirements.some(c=>groundRequirement(c,seen));
    if(r.kind==='milestone')return true;
    if(r.kind==='pokemon')return grounded.has(r.id);
    const key=`${r.kind}:${r.id}`;if(seen.has(key))return false;
    const next=new Set([...seen,key]);
    if(r.kind==='location'){const l=game.locations.find(l=>l.id===r.id);return !!l&&groundRequirement(l.requirements,next);}
    if(r.kind==='capability'){const c=game.capabilities.find(c=>c.id===r.id);return !!c&&groundRequirement(c.requirements,next);}
    const item=game.items.find(i=>i.id===r.id);
    return !!item&&item.sources.some(s=>{
      const holder=s.details?game.sources.find(capture=>capture.id===s.details!.pokemonSourceId):null;
      if(s.details&&(!holder||!grounded.has(selectionId(holder.pokemonId,holder.formId))||!groundRequirement(holder.requirements,next)))return false;
      return groundRequirement(s.requirements,next)&&groundRequirement(game.locations.find(l=>l.id===s.locationId)?.requirements??{kind:'any',requirements:[]},next);
    });
  };
  let changed = true;
  while (changed) {
    changed = false;
    for(const source of game.sources.filter(s=>s.details.kind!=='breeding')) {
      const location=game.locations.find(l=>l.id===source.locationId);
      const id = selectionId(source.pokemonId, source.formId);
      const offerGrounded = source.details.kind !== 'game-trade' || source.details.offeredPokemonId !== null || grounded.size > 0;
      if(!grounded.has(id)&&offerGrounded&&location&&groundRequirement(source.requirements)&&groundRequirement(location.requirements)){grounded.add(id);changed=true;}
    }
    for (const evolution of game.evolutions) if (grounded.has(selectionId(evolution.fromPokemonId, evolution.fromFormId))) {
      for (const id of [selectionId(evolution.toPokemonId, evolution.toFormId), ...evolution.coProductIds]) if (!grounded.has(id)) { grounded.add(id); changed = true; }
    }
    for (const change of game.formChanges ?? []) {
      const to = selectionId(change.pokemonId, change.toFormId);
      if (!grounded.has(to) && grounded.has(selectionId(change.pokemonId, change.fromFormId)) && groundRequirement(formChangeRequirements(change))) {
        grounded.add(to); changed = true;
      }
    }
    for (const rule of game.breedingRules) if ([...rule.parentPokemonIds, ...(rule.parentFormIds ?? [])].some(id => grounded.has(id))) {
      for (const id of rule.offspringPokemonIds) if (!grounded.has(id)) { grounded.add(id); changed = true; }
    }
  }
  for (const [id] of profiles) if (!grounded.has(id)) issue(id, 'pokemon', 'Species or form has no grounded source, evolution, or exclusion.');
  for (const exclusion of game.exclusions) {
    if (!profiles.has(exclusion.pokemonId)) issue(exclusion.pokemonId, 'exclusions', 'Unknown excluded species.');
    if (game.sources.some(s => s.pokemonId === exclusion.pokemonId && s.details.kind !== 'breeding')) issue(exclusion.pokemonId, 'exclusions', 'Excluded species also has a direct source.');
  }
  // A capability/item cycle without Pokémon participation is a data error.
  const dependencyRows = new Map<string, Requirement[]>([
    ...game.capabilities.map(c => [`capability:${c.id}`, [c.requirements]] as [string, Requirement[]]),
    ...game.locations.map(location => [`location:${location.id}`, [location.requirements]] as [string, Requirement[]]),
    ...game.items.map(i => [`item:${i.id}`, i.sources.map(s => s.requirements)] as [string, Requirement[]]),
  ]);
  const active = new Set<string>(); const done = new Set<string>();
  function visit(id: string) {
    if (active.has(id)) { issue(id, 'capabilities', 'Access dependency cycle.'); return; }
    if (done.has(id)) return;
    active.add(id);
    for (const req of dependencyRows.get(id) ?? []) for (const leaf of leaves(req)) {
      if (leaf.kind === 'capability' || leaf.kind === 'item' || leaf.kind === 'location') visit(`${leaf.kind}:${leaf.id}`);
    }
    active.delete(id); done.add(id);
  }
  for (const id of dependencyRows.keys()) visit(id);
  return issues;
}
