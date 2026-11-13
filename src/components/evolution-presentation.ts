import type { Evolution, EvolutionCondition, GameData, Requirement } from '../domain/types';
import { pokemonIdentity } from '../data/dataset';
import { conditionText } from '../domain/availability/solve';
import { selectionId, selectionProfile } from '../domain/pokemon-selection';

export function evolutionFamily(game: GameData, pokemonId: string) {
  const members = new Set([pokemonId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const evolution of game.evolutions) {
      const from = selectionId(evolution.fromPokemonId, evolution.fromFormId);
      const to = selectionId(evolution.toPokemonId, evolution.toFormId);
      if (!members.has(from) && !members.has(to)) continue;
      for (const id of [from, to]) {
        if (!members.has(id)) { members.add(id); changed = true; }
      }
    }
  }
  const evolutions = game.evolutions.filter(evolution => members.has(selectionId(evolution.fromPokemonId, evolution.fromFormId)));
  const destinations = new Set(evolutions.map(evolution => selectionId(evolution.toPokemonId, evolution.toFormId)));
  const roots = [...members].filter(id => !destinations.has(id));
  return { roots, evolutions };
}

function conditionLabel(game: GameData, condition: EvolutionCondition): string {
  switch (condition.kind) {
    case 'friendship': return `Friendship ${condition.minimum}+`;
    case 'beauty': return `Beauty ${condition.minimum}+`;
    case 'time': return condition.period === 'day' ? 'During the day' : 'During the night';
    case 'stats': return { 'attack-lt-defense': 'Attack < Defense', 'attack-eq-defense': 'Attack = Defense', 'attack-gt-defense': 'Attack > Defense' }[condition.relation];
    case 'personality': return `Personality remainder ${condition.minimum}–${condition.maximum} (mod ${condition.modulus})`;
    case 'party-space': return `${condition.freeSlots} free party slot${condition.freeSlots === 1 ? '' : 's'}`;
    case 'location': return `At ${game.locations.find(location => location.id === condition.locationId)!.name}`;
    case 'held-item': return `Hold ${game.items.find(item => item.id === condition.itemId)!.name}`;
    case 'party-pokemon': return `${pokemonIdentity(condition.pokemonId).name} in the party`;
    case 'party-type': return `Another ${condition.typeId}-type Pokémon in the party`;
    case 'affection': return 'At least two hearts in Pokémon-Amie';
    case 'weather': return 'Natural rain';
    case 'device-orientation': return 'Nintendo 3DS upside-down';
    case 'known-move': return `Know ${condition.moveName}`;
  }
}

export function evolutionConditionText(game: GameData, condition: EvolutionCondition): string {
  switch (condition.kind) {
    case 'location': return `Gain a level at ${game.locations.find(location => location.id === condition.locationId)!.name}.`;
    case 'held-item': return `${conditionLabel(game, condition)}, then gain a level. The evolution uses the item.`;
    case 'party-pokemon': return `Keep ${conditionLabel(game, condition)}, then gain a level.`;
    case 'known-move': return `${conditionLabel(game, condition)}, then gain a level.`;
    default: return conditionText(condition, game.game.generation);
  }
}

function requiredItemLabels(game: GameData, evolution: Evolution, requirement: Requirement): string[] {
  if (requirement.kind === 'all') {
    return requirement.requirements.flatMap(child => requiredItemLabels(game, evolution, child));
  }
  if (requirement.kind !== 'item' || requirement.id === evolution.itemId) return [];
  const item = game.items.find(item => item.id === requirement.id);
  if (!item) throw new Error(`Missing evolution requirement item: ${requirement.id}`);
  const name = requirement.quantity === 1 ? item.name : `${item.name} × ${requirement.quantity}`;
  return [`${requirement.consumed ? 'Use' : 'Carry'} ${name}`];
}

/** Items the evolution needs besides its trigger item, such as the Poké Ball for Shedinja. */
export function evolutionItemLabels(game: GameData, evolution: Evolution): string[] {
  return requiredItemLabels(game, evolution, evolution.requirements);
}

/** Name the one gender that can evolve, when the species has more than one. */
export function evolutionGenderLabel(game: GameData, evolution: Evolution): string | null {
  const genders = [...new Set(evolution.genderTransitions?.map(transition => transition.from))];
  return genders.length === 1 && selectionProfile(game, selectionId(evolution.fromPokemonId, evolution.fromFormId)).genders.length > 1
    ? `${genders[0][0].toUpperCase()}${genders[0].slice(1)} only` : null;
}

export function evolutionLabels(game: GameData, evolution: Evolution): string[] {
  const item = evolution.itemId ? game.items.find(item => item.id === evolution.itemId) : null;
  if (evolution.itemId && !item) throw new Error(`Missing evolution item: ${evolution.itemId}`);
  const trigger = evolution.trigger === 'use-item' ? `Use ${item!.name}`
    : evolution.trigger === 'player-trade' ? item ? `Trade while holding ${item.name}` : 'Trade'
    : evolution.minimumLevel !== null ? `Level up at Lv. ${evolution.minimumLevel}+` : 'Level up';
  const gender = evolutionGenderLabel(game, evolution);
  return [trigger, ...(gender ? [gender] : []), ...evolution.conditions.map(condition => conditionLabel(game, condition)),
    ...evolutionItemLabels(game, evolution)];
}
