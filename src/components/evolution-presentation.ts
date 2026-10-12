import type { Evolution, EvolutionCondition, GameData } from '../domain/types';

export function evolutionFamily(game: GameData, pokemonId: string) {
  const members = new Set([pokemonId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const evolution of game.evolutions) {
      if (!members.has(evolution.fromPokemonId) && !members.has(evolution.toPokemonId)) continue;
      for (const id of [evolution.fromPokemonId, evolution.toPokemonId]) {
        if (!members.has(id)) { members.add(id); changed = true; }
      }
    }
  }
  const evolutions = game.evolutions.filter(evolution => members.has(evolution.fromPokemonId));
  const destinations = new Set(evolutions.map(evolution => evolution.toPokemonId));
  const roots = [...members].filter(id => !destinations.has(id));
  return { roots, evolutions };
}

function conditionLabel(condition: EvolutionCondition): string {
  switch (condition.kind) {
    case 'friendship': return `Friendship ${condition.minimum}+`;
    case 'beauty': return `Beauty ${condition.minimum}+`;
    case 'time': return condition.period === 'day' ? 'During the day' : 'During the night';
    case 'stats': return { 'attack-lt-defense': 'Attack < Defense', 'attack-eq-defense': 'Attack = Defense', 'attack-gt-defense': 'Attack > Defense' }[condition.relation];
    case 'personality': return `Personality remainder ${condition.minimum}–${condition.maximum} (mod ${condition.modulus})`;
    case 'party-space': return `${condition.freeSlots} free party slot${condition.freeSlots === 1 ? '' : 's'} and a Poké Ball`;
  }
}

export function evolutionLabels(game: GameData, evolution: Evolution): string[] {
  const item = evolution.itemId ? game.items.find(item => item.id === evolution.itemId) : null;
  if (evolution.itemId && !item) throw new Error(`Missing evolution item: ${evolution.itemId}`);
  const trigger = evolution.trigger === 'use-item' ? `Use ${item!.name}`
    : evolution.trigger === 'player-trade' ? item ? `Trade while holding ${item.name}` : 'Trade'
    : evolution.minimumLevel !== null ? `Level up at Lv. ${evolution.minimumLevel}+` : 'Level up';
  return [trigger, ...evolution.conditions.map(conditionLabel)];
}
