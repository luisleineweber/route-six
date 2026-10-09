import type { GameData, TypeAnalysis } from '../types';

export function damageMultiplier(game: GameData, attack: string, defender: string): number {
  const profile = game.profiles.find(p => p.pokemonId === defender);
  const a = game.typeChart.typeIds.indexOf(attack);
  if (!profile || a < 0) throw new Error(`Unknown type profile: ${attack} → ${defender}`);
  return profile.types.reduce((n, type) => {
    const d = game.typeChart.typeIds.indexOf(type);
    const value = game.typeChart.matrix[a]?.[d];
    if (value === undefined) throw new Error(`Incomplete type chart: ${attack} → ${type}`);
    return n * value;
  }, 1);
}

export function analyzeTypes(game: GameData, team: string[]): TypeAnalysis {
  const types = game.typeChart.typeIds;
  const empty = () => Object.fromEntries(types.map(t => [t, 0]));
  const result: TypeAnalysis = { weaknesses: empty(), resistances: empty(), immunities: empty(), repeatedTypes: {}, coveredTypes: [], totalTypes: types.length };
  const counts = empty();
  for (const id of team) {
    const profile = game.profiles.find(p => p.pokemonId === id);
    if (!profile) throw new Error(`Missing Pokémon profile: ${id}`);
    for (const type of profile.types) counts[type]++;
    for (const attack of types) {
      const value = damageMultiplier(game, attack, id);
      if (value > 1) result.weaknesses[attack]++;
      else if (value === 0) result.immunities[attack]++;
      else if (value < 1) result.resistances[attack]++;
    }
  }
  result.repeatedTypes = Object.fromEntries(Object.entries(counts).filter(([, count]) => count > 1));
  result.coveredTypes = types.filter((_, d) => types.some((type, a) => counts[type] > 0 && game.typeChart.matrix[a][d] > 1));
  return result;
}
