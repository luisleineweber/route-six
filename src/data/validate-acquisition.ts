import type { GameData, Requirement, ValidationIssue } from '../domain/types';
import { leaves } from '../domain/requirements';

export function validateAcquisition(game: GameData, base: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const issue = (id: string, file: string, message: string) => issues.push({ recordId: id, fieldPath: base+file+'.json', message });
  const profiles = new Map(game.profiles.map(p => [p.pokemonId, p]));
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
    const profile = profiles.get(source.pokemonId);
    if (!profile) { issue(source.id, 'sources', 'Unknown Pokémon.'); continue; }
    if (!locations.has(source.locationId)) issue(source.id, 'sources', 'Unknown location.');
    if (!source.genders.every(g => profile.breeding.genders.includes(g))) issue(source.id, 'sources', 'Source genders do not match the game profile.');
    if (source.level.kind === 'range' && source.level.minimum > source.level.maximum) issue(source.id, 'sources', 'Source level range is reversed.');
    if (source.details.kind === 'game-trade') {
      const offered = source.details.offeredPokemonId;
      if (!has(source.requirements, 'pokemon', offered, true)) issue(source.id, 'sources', 'Trade must consume its offered Pokémon.');
      if (source.level.kind === 'match-traded-pokemon' && source.level.pokemonId !== offered) issue(source.id, 'sources', 'Trade level refers to a different offered Pokémon.');
    }
    if (source.details.kind === 'fossil' && !has(source.requirements, 'item', source.details.itemId, true)) issue(source.id, 'sources', 'Fossil revival must consume its fossil.');
    if (source.details.kind === 'wild' && source.details.method !== 'grass' && !has(source.requirements, 'capability', source.details.method)) issue(source.id, 'sources', 'Encounter method must have an explicit capability requirement.');
    if (source.details.kind === 'breeding') {
      const rule = rules.get(source.details.ruleId);
      if (!rule?.offspringPokemonIds.includes(source.pokemonId)) issue(source.id, 'sources', 'Breeding source does not match its offspring rule.');
      if (!has(source.requirements, 'capability', source.details.capabilityId)) issue(source.id, 'sources', 'Breeding source must require Day Care access.');
      if (game.game.id === 'emerald' && (source.level.kind !== 'fixed' || source.level.value !== 5)) issue(source.id, 'sources', 'Emerald eggs hatch at level 5.');
      if (rule?.requiredHeldItemId && !has(source.requirements, 'item', rule.requiredHeldItemId, false)) issue(source.id, 'sources', 'Breeding held item must be retained.');
    }
  }
  for (const rule of game.breedingRules) {
    for (const id of [...rule.parentPokemonIds, ...rule.offspringPokemonIds]) if (!profiles.has(id)) issue(rule.id, 'breeding-rules', `Unknown Pokémon: ${id}`);
    if (rule.requiredHeldItemId && !items.has(rule.requiredHeldItemId)) issue(rule.id, 'breeding-rules', 'Unknown held item.');
  }
  for (const evolution of game.evolutions) {
    const from = profiles.get(evolution.fromPokemonId); const to = profiles.get(evolution.toPokemonId);
    if (!from || !to) { issue(evolution.id, 'evolutions', 'Unknown evolution species.'); continue; }
    if (evolution.itemId && !items.has(evolution.itemId)) issue(evolution.id, 'evolutions', 'Unknown evolution item.');
    if (evolution.trigger === 'use-item' && !has(evolution.requirements, 'item', evolution.itemId!, true)) issue(evolution.id, 'evolutions', 'Item evolution must consume the evolution item.');
    for (const condition of evolution.conditions) {
      if (condition.kind === 'personality' && (condition.minimum > condition.maximum || condition.maximum >= condition.modulus)) issue(evolution.id, 'evolutions', 'Invalid personality interval.');
      const capability = { friendship: 'friendship', beauty: 'beauty', stats: 'stat-training', time: condition.kind === 'time' ? condition.period : '', personality: 'personality', 'party-space': 'party-space' }[condition.kind];
      if (!has(evolution.requirements, 'capability', capability)) issue(evolution.id, 'evolutions', `Evolution must prove its ${condition.kind} action.`);
    }
    for (const transition of evolution.genderTransitions ?? []) if (!from.breeding.genders.includes(transition.from) || !to.breeding.genders.includes(transition.to)) issue(evolution.id, 'evolutions', 'Invalid gender transition.');
    if (!evolution.genderTransitions && !from.breeding.genders.every(g => to.breeding.genders.includes(g))) issue(evolution.id, 'evolutions', 'Evolution needs explicit gender transitions.');
    for (const id of evolution.coProductIds) if (!profiles.has(id)) issue(evolution.id, 'evolutions', 'Unknown simultaneous product.');
  }
  const grounded = new Set(game.exclusions.map(e => e.pokemonId));
  const groundRequirement = (r:Requirement, seen=new Set<string>()):boolean => {
    if('requirements' in r)return r.kind==='all'?r.requirements.every(c=>groundRequirement(c,seen)):r.requirements.some(c=>groundRequirement(c,seen));
    if(r.kind==='milestone')return true;
    if(r.kind==='pokemon')return grounded.has(r.id);
    const key=`${r.kind}:${r.id}`;if(seen.has(key))return false;
    const next=new Set([...seen,key]);
    if(r.kind==='capability'){const c=game.capabilities.find(c=>c.id===r.id);return !!c&&groundRequirement(c.requirements,next);}
    const item=game.items.find(i=>i.id===r.id);
    return !!item&&item.sources.some(s=>groundRequirement(s.requirements,next)&&groundRequirement(game.locations.find(l=>l.id===s.locationId)?.requirements??{kind:'any',requirements:[]},next));
  };
  let changed = true;
  while (changed) {
    changed = false;
    for(const source of game.sources.filter(s=>s.details.kind!=='breeding')) {
      const location=game.locations.find(l=>l.id===source.locationId);
      if(!grounded.has(source.pokemonId)&&location&&groundRequirement(source.requirements)&&groundRequirement(location.requirements)){grounded.add(source.pokemonId);changed=true;}
    }
    for (const evolution of game.evolutions) if (grounded.has(evolution.fromPokemonId)) {
      for (const id of [evolution.toPokemonId, ...evolution.coProductIds]) if (!grounded.has(id)) { grounded.add(id); changed = true; }
    }
    for (const rule of game.breedingRules) if (rule.parentPokemonIds.some(id => grounded.has(id))) {
      for (const id of rule.offspringPokemonIds) if (!grounded.has(id)) { grounded.add(id); changed = true; }
    }
  }
  for (const profile of game.profiles) if (!grounded.has(profile.pokemonId)) issue(profile.pokemonId, 'pokemon', 'Species has no grounded source, evolution, or exclusion.');
  for (const exclusion of game.exclusions) {
    if (!profiles.has(exclusion.pokemonId)) issue(exclusion.pokemonId, 'exclusions', 'Unknown excluded species.');
    if (game.sources.some(s => s.pokemonId === exclusion.pokemonId && s.details.kind !== 'breeding')) issue(exclusion.pokemonId, 'exclusions', 'Excluded species also has a direct source.');
  }
  // A capability/item cycle without Pokémon participation is a data error.
  const dependencyRows = new Map<string, Requirement[]>([
    ...game.capabilities.map(c => [`capability:${c.id}`, [c.requirements]] as [string, Requirement[]]),
    ...game.items.map(i => [`item:${i.id}`, i.sources.map(s => s.requirements)] as [string, Requirement[]]),
  ]);
  const active = new Set<string>(); const done = new Set<string>();
  function visit(id: string) {
    if (active.has(id)) { issue(id, 'capabilities', 'Access dependency cycle.'); return; }
    if (done.has(id)) return;
    active.add(id);
    for (const req of dependencyRows.get(id) ?? []) for (const leaf of leaves(req)) {
      if (leaf.kind === 'capability' || leaf.kind === 'item') visit(`${leaf.kind}:${leaf.id}`);
    }
    active.delete(id); done.add(id);
  }
  for (const id of dependencyRows.keys()) visit(id);
  return issues;
}
