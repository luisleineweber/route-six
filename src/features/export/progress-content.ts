import { pokemonById } from '../../data/dataset';
import { pathSource } from '../../components/acquisition-presentation';
import { conditionText } from '../../domain/availability/solve';
import type { AcquisitionPath, AvailabilitySnapshot, GameData } from '../../domain/types';

export interface EvolutionStage {
  name: string;
  dex: number;
  requirement: string | null;
  conditions: string[];
}

export interface ProgressContent {
  location: string | null;
  method: string;
  acquisition: string[];
  stages: EvolutionStage[];
  missingSource: { title: string; explanation: string } | null;
}

function stage(id: string, requirement: string | null = null, conditions: string[] = []): EvolutionStage {
  const pokemon = pokemonById.get(id)!;
  return { name: pokemon.name, dex: pokemon.nationalDex, requirement, conditions };
}

function complexity(game: GameData, path: AcquisitionPath): number {
  // Prefer a direct source over breeding, then fewer evolution steps and conditions.
  const conditions = path.evolutionIds.reduce((count, id) => count + game.evolutions.find(rule => rule.id === id)!.conditions.length, 0);
  return path.breedingSteps.length * 100 + conditions * 10 + path.evolutionIds.length;
}

export function progressContent(game: GameData, snapshot: AvailabilitySnapshot, id: string): ProgressContent {
  const entry = snapshot.entries[id];
  const ids = entry.currentPathIds.length ? entry.currentPathIds : entry.futurePathIds;
  const paths = ids.map(id => snapshot.paths[id]);
  const path = paths.reduce<AcquisitionPath | null>((best, candidate) =>
    !best || complexity(game, candidate) < complexity(game, best) ? candidate : best, null);
  if (!path) {
    const exclusion = entry.blockers.find(blocker => blocker.code === 'other-version' || blocker.code === 'external-event');
    const explanation = exclusion?.code === 'other-version'
      ? 'Requires another game version or a player trade. Player trades are excluded from this planner.'
      : exclusion?.code === 'external-event'
        ? 'Requires an external distribution event. These events are excluded from this planner.'
        : entry.blockers[0]?.message.replace(/\b[a-z]+(?:-[a-z]+)*\b/g, word => pokemonById.get(word)?.name ?? word)
          ?? 'No acquisition path meets the selected progress and level settings.';
    return { location: null, method: '', acquisition: [], stages: [], missingSource: {
      title: exclusion ? `Not obtainable in ${game.game.name.replace(/^Pokémon /, '')}` : 'Requirements not met', explanation,
    } };
  }
  const source = pathSource(game, path);
  const location = game.locations.find(location => location.id === source.locationId)!;
  const stages = [stage(source.pokemonId)];
  for (const id of path.evolutionIds) {
    const rule = game.evolutions.find(rule => rule.id === id)!;
    const target = path.coProductIds.includes(rule.toPokemonId) ? path.pokemonId : rule.toPokemonId;
    const requirement = rule.trigger === 'use-item' ? game.items.find(item => item.id === rule.itemId)!.name
      : rule.trigger === 'player-trade' ? 'Player trade'
      : rule.minimumLevel ? `Lv. ${rule.minimumLevel}` : 'Level up';
    stages.push(stage(target, requirement, rule.conditions.map(conditionText)));
  }
  const acquisition = path.breedingSteps.map(step => `Parents: ${step.parents.map(parent => pokemonById.get(parent.pokemonId)!.name).join(' + ')}.`);
  if (source.details.kind === 'game-trade') acquisition.push(`Offer ${pokemonById.get(source.details.offeredPokemonId)!.name}.`);
  if (source.details.kind === 'fossil') {
    const itemId = source.details.itemId;
    acquisition.push(`Revive ${game.items.find(item => item.id === itemId)!.name}.`);
  }
  return { location: location.name,
    method: source.details.kind === 'wild' ? source.details.method.replaceAll('-', ' ') : source.details.kind.replaceAll('-', ' '),
    acquisition, stages, missingSource: null };
}
