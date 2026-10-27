import { pokemonById, pokemonIdentity } from '../../data/dataset';
import { selectionId, selectionProfile } from '../../domain/pokemon-selection';
import { pathSource, pathOptionName, breedingParentName, sourceMethod } from '../../components/acquisition-presentation';
import { evolutionConditionText, evolutionLabels } from '../../components/evolution-presentation';
import { encounterInstructions } from '../../components/encounter-presentation';
import { itemSourceInstructions } from '../../components/item-source-presentation';
import { isExclusionBlocker } from '../../domain/availability/exclusions';
import type { AcquisitionPath, AvailabilitySnapshot, Evolution, GameData, PokemonSource } from '../../domain/types';

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
  evolutionNotes: string[];
}

function evolutionRequirement(game: GameData, rule: Evolution) {
  return rule.trigger === 'use-item' ? game.items.find(item => item.id === rule.itemId)!.name
    : rule.trigger === 'player-trade' ? 'Player trade'
    : rule.minimumLevel ? `Lv. ${rule.minimumLevel}` : 'Level up';
}

function extraEvolutionNotes(game: GameData, path: AcquisitionPath, selectedPath: AcquisitionPath) {
  return path.evolutionIds.filter(id => !selectedPath.evolutionIds.includes(id)).map(id => {
    const rule = game.evolutions.find(rule => rule.id === id)!;
    const target = path.coProductIds.includes(rule.toPokemonId) ? path.pokemonId : rule.toPokemonId;
    const from = pokemonIdentity(selectionId(rule.fromPokemonId, rule.fromFormId)).name;
    const to = pokemonIdentity(selectionId(target, target === rule.toPokemonId ? rule.toFormId : null)).name;
    return [`${from} → ${to}`, evolutionRequirement(game, rule), ...evolutionLabels(game, rule).slice(1)].join(' · ');
  });
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
  const options = new Map<string, ProgressRouteOption>();
  for (const pathId of [...ids].sort((a, b) => compareProgressPaths(game, snapshot.paths[a], snapshot.paths[b]))) {
    const path = snapshot.paths[pathId];
    const source = pathSource(game, path);
    if (source.details.kind !== 'wild') continue;
    const conditions = encounterLabels(source);
    if (source.locationId === selectedSource.locationId || options.has(source.locationId)) continue;
    const method = sourceMethod(source.details);
    options.set(source.locationId, {
      location: game.locations.find(location => location.id === source.locationId)!.name,
      sourceName: pokemonIdentity(selectionId(source.pokemonId, source.formId)).name,
      method: conditions.length ? `${method.name} (${conditions.join(', ')})` : method.name,
      methodIconSrc: method.iconSrc,
      evolutionNotes: extraEvolutionNotes(game, path, selectedPath),
    });
  }
  return [...options.values()];
}

function stage(game: GameData, id: string, requirement: string | null = null, conditions: string[] = []): EvolutionStage {
  const pokemon = pokemonIdentity(id);
  return { name: pokemon.name, dex: pokemon.nationalDex,
    spriteSrc: selectionProfile(game, id).spriteSrc, requirement, conditions };
}

function progressPathPriority(game: GameData, path: AcquisitionPath): number {
  const conditions = path.evolutionIds.reduce((count, id) => count + game.evolutions.find(rule => rule.id === id)!.conditions.length, 0);
  return path.breedingSteps.length * 100 + conditions * 10 + path.evolutionIds.length;
}

/** Choose an earlier proven path before a simpler late catch. This does not grant access. */
export function compareProgressPaths(game: GameData, first: AcquisitionPath, second: AcquisitionPath): number {
  const order = (path: AcquisitionPath) => Math.min(Number.MAX_SAFE_INTEGER, ...path.firstMilestoneIds.map(id => {
    const index = game.milestones.findIndex(point => point.id === id);
    return index < 0 ? Number.MAX_SAFE_INTEGER : index;
  }));
  return order(first) - order(second)
    || progressPathPriority(game, first) - progressPathPriority(game, second)
    || first.minimumLevel - second.minimumLevel;
}

export function progressContent(game: GameData, snapshot: AvailabilitySnapshot, id: string, selectedPath?: AcquisitionPath): ProgressContent {
  const entry = snapshot.entries[id];
  const ids = entry.currentPathIds.length ? entry.currentPathIds : entry.futurePathIds;
  const paths = ids.map(id => snapshot.paths[id]);
  const path = selectedPath ?? paths.reduce<AcquisitionPath | null>((best, candidate) =>
    !best || compareProgressPaths(game, candidate, best) < 0 ? candidate : best, null);
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
    const requirement = evolutionRequirement(game, rule);
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
  const area = source.details.kind === 'wild' ? pathOptionName(game, { ...path, evolutionIds: [] }) : 'Source option';
  const locationName = area === 'Source option' ? location.name : `${location.name} · ${area.replace(/\bb?\d+f\b/gi, floor => floor.toUpperCase())}`;
  return { location: locationName,
    method: method?.name ?? source.details.kind.replaceAll('-', ' '),
    methodIconSrc: method?.iconSrc ?? null,
    acquisition, routeOptions: otherRouteOptions(game, snapshot, id, path), stages, missingSource: null };
}
