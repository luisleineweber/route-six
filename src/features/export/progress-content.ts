import { pokemonById, pokemonIdentity } from '../../data/dataset';
import { selectionId, selectionProfile } from '../../domain/pokemon-selection';
import { pathSource, breedingParentName, sourceMethod } from '../../components/acquisition-presentation';
import { evolutionConditionText } from '../../components/evolution-presentation';
import { encounterInstructions } from '../../components/encounter-presentation';
import { itemSourceInstructions } from '../../components/item-source-presentation';
import { isExclusionBlocker } from '../../domain/availability/exclusions';
import type { AcquisitionPath, AvailabilitySnapshot, GameData, PokemonSource } from '../../domain/types';

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
  methodIconSrc: string | null;
  acquisition: string[];
  routeOptions: ProgressRouteOption[];
  stages: EvolutionStage[];
  missingSource: { title: string; explanation: string } | null;
}

export interface ProgressRouteOption {
  location: string;
  sourceName: string;
  method: string;
  methodIconSrc: string | null;
}

function encounterLabels(source: PokemonSource) {
  return (source.encounterConditions ?? []).map(condition => {
    switch (condition.kind) {
      case 'time': return condition.periods.map(period => period[0].toUpperCase() + period.slice(1)).join('/');
      case 'season': return condition.seasons.map(season => season[0].toUpperCase() + season.slice(1)).join('/');
      case 'weekday': return condition.day[0].toUpperCase() + condition.day.slice(1);
      case 'swarm': return 'Swarm';
      case 'daily': return 'Daily rotation';
      case 'radio': return condition.sound === 'hoenn' ? 'Hoenn Sound' : 'Sinnoh Sound';
      case 'headbutt-tree': return `${condition.category} tree`;
      case 'safari-blocks': return 'Safari blocks';
      case 'feebas-tiles': return 'Feebas tiles';
    }
  });
}

function otherRouteOptions(game: GameData, snapshot: AvailabilitySnapshot, id: string, selectedPath: AcquisitionPath) {
  const entry = snapshot.entries[id];
  const ids = entry.currentPathIds.length ? entry.currentPathIds : entry.futurePathIds;
  const selectedSource = pathSource(game, selectedPath);
  const selectedKey = selectedSource.details.kind === 'wild'
    ? JSON.stringify([selectedSource.locationId, selectedSource.pokemonId, selectedSource.formId ?? null,
      selectedSource.details.method, encounterLabels(selectedSource)])
    : null;
  const options = new Map<string, ProgressRouteOption & { milestoneOrder: number; locationOrder: number }>();
  for (const pathId of ids) {
    const path = snapshot.paths[pathId];
    const source = pathSource(game, path);
    if (source.details.kind !== 'wild') continue;
    const conditions = encounterLabels(source);
    const key = JSON.stringify([source.locationId, source.pokemonId, source.formId ?? null, source.details.method, conditions]);
    if (key === selectedKey || options.has(key)) continue;
    const method = sourceMethod(source.details);
    const milestoneOrder = Math.min(...path.firstMilestoneIds.map(milestoneId => {
      const index = game.milestones.findIndex(milestone => milestone.id === milestoneId);
      return index < 0 ? Number.MAX_SAFE_INTEGER : index;
    }), Number.MAX_SAFE_INTEGER);
    options.set(key, {
      location: game.locations.find(location => location.id === source.locationId)!.name,
      sourceName: pokemonIdentity(selectionId(source.pokemonId, source.formId)).name,
      method: conditions.length ? `${method.name} (${conditions.join(', ')})` : method.name,
      methodIconSrc: method.iconSrc,
      milestoneOrder,
      locationOrder: game.locations.findIndex(location => location.id === source.locationId),
    });
  }
  return [...options.values()]
    .sort((a, b) => a.milestoneOrder - b.milestoneOrder || a.locationOrder - b.locationOrder || a.sourceName.localeCompare(b.sourceName))
    .map(({ location, sourceName, method, methodIconSrc }) => ({ location, sourceName, method, methodIconSrc }));
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
    return { location: null, method: '', methodIconSrc: null, acquisition: [], routeOptions: [], stages: [], missingSource: {
      title: exclusion ? `Not obtainable in ${game.game.name.replace(/^Pokémon /, '')}` : 'Requirements not met', explanation,
    } };
  }
  const source = pathSource(game, path);
  const location = game.locations.find(location => location.id === source.locationId)!;
  const method = source.details.kind === 'wild' ? sourceMethod(source.details) : null;
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
    method: method?.name ?? source.details.kind.replaceAll('-', ' '),
    methodIconSrc: method?.iconSrc ?? null,
    acquisition, routeOptions: otherRouteOptions(game, snapshot, id, path), stages, missingSource: null };
}
