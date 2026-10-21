import { pokemonById, pokemonIdentity } from '../../data/dataset';
import { selectionId, selectionProfile } from '../../domain/pokemon-selection';
import { pathSource, breedingParentName, sourceMethod } from '../../components/acquisition-presentation';
import { evolutionConditionText } from '../../components/evolution-presentation';
import { encounterInstructions } from '../../components/encounter-presentation';
import { itemSourceInstructions } from '../../components/item-source-presentation';
import { isExclusionBlocker } from '../../domain/availability/exclusions';
import type { AcquisitionPath, AvailabilitySnapshot, GameData } from '../../domain/types';

export interface EvolutionStage {
  name: string;
  dex: number;
  spriteSrc: string;
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

function stage(game: GameData, id: string, requirement: string | null = null, conditions: string[] = []): EvolutionStage {
  const pokemon = pokemonIdentity(id);
  return { name: pokemon.name, dex: pokemon.nationalDex,
    spriteSrc: selectionProfile(game, id).spriteSrc, requirement, conditions };
}

export function progressPathPriority(game: GameData, path: AcquisitionPath): number {
  // Prefer a direct source over breeding, then fewer evolution steps and conditions.
  const conditions = path.evolutionIds.reduce((count, id) => count + game.evolutions.find(rule => rule.id === id)!.conditions.length, 0);
  return path.breedingSteps.length * 100 + conditions * 10 + path.evolutionIds.length;
}

export function progressContent(game: GameData, snapshot: AvailabilitySnapshot, id: string, selectedPath?: AcquisitionPath): ProgressContent {
  const entry = snapshot.entries[id];
  const ids = entry.currentPathIds.length ? entry.currentPathIds : entry.futurePathIds;
  const paths = ids.map(id => snapshot.paths[id]);
  const path = selectedPath ?? paths.reduce<AcquisitionPath | null>((best, candidate) =>
    !best || progressPathPriority(game, candidate) < progressPathPriority(game, best) ? candidate : best, null);
  if (!path) {
    const exclusion = entry.blockers.find(isExclusionBlocker);
    const explanation = exclusion?.code === 'other-version'
      ? 'Requires another game version or a player trade. Player trades are excluded from this planner.'
      : exclusion?.code === 'external-event'
        ? 'Requires an external distribution event. These events are excluded from this planner.'
        : exclusion?.code === 'external-connection' ? exclusion.message
        : entry.blockers[0]?.message.replace(/\b[a-z]+(?:-[a-z]+)*\b/g, word => pokemonById.get(word)?.name ?? word)
          ?? 'No acquisition path meets the selected progress and level settings.';
    return { location: null, method: '', acquisition: [], stages: [], missingSource: {
      title: exclusion ? `Not obtainable in ${game.game.name.replace(/^Pokémon /, '')}` : 'Requirements not met', explanation,
    } };
  }
  const source = pathSource(game, path);
  const location = game.locations.find(location => location.id === source.locationId)!;
  const stages = [stage(game, selectionId(source.pokemonId, source.formId))];
  for (const id of path.evolutionIds) {
    const rule = game.evolutions.find(rule => rule.id === id)!;
    const target = path.coProductIds.includes(rule.toPokemonId) ? path.pokemonId : rule.toPokemonId;
    const requirement = rule.trigger === 'use-item' ? game.items.find(item => item.id === rule.itemId)!.name
      : rule.trigger === 'player-trade' ? 'Player trade'
      : rule.minimumLevel ? `Lv. ${rule.minimumLevel}` : 'Level up';
    stages.push(stage(game, selectionId(target, target === rule.toPokemonId ? rule.toFormId : null), requirement, rule.conditions.map(condition => evolutionConditionText(game, condition))));
  }
  const acquisition = path.breedingSteps.map(step => `Parents: ${step.parents.map(parent => breedingParentName(parent, snapshot)).join(' + ')}.`);
  acquisition.push(...encounterInstructions(source));
  acquisition.push(...itemSourceInstructions(game,path));
  for (const id of path.formChangeIds ?? []) {
    const change = game.formChanges!.find(change => change.id === id)!;
    acquisition.push(`Change form: ${pokemonIdentity(selectionId(change.pokemonId, change.toFormId)).name}.`);
    if (change.heldItemId) acquisition.push(`Keep ${game.items.find(item => item.id === change.heldItemId)!.name} held by this Pokémon.`);
  }
  const selected = pokemonIdentity(selectionId(path.pokemonId, path.formId));
  if (path.formChangeIds?.length && stages.at(-1)!.name !== selected.name) stages.push(stage(game, selected.selectionId, 'Change form'));
  if (source.details.kind === 'game-trade') acquisition.push(`Offer ${pokemonById.get(source.details.offeredPokemonId)!.name}.`);
  if (source.details.kind === 'fossil') {
    const itemId = source.details.itemId;
    acquisition.push(`Revive ${game.items.find(item => item.id === itemId)!.name}.`);
  }
  return { location: location.name,
    method: source.details.kind === 'wild' ? sourceMethod(source.details).name : source.details.kind.replaceAll('-', ' '),
    acquisition, stages, missingSource: null };
}
