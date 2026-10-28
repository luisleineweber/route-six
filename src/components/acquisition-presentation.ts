import type { AcquisitionPath, AvailabilityEntry, AvailabilitySnapshot, GameData, ParentWitness, SourceDetails } from '../domain/types';
import { pokemonById, pokemonIdentity } from '../data/dataset';
import { selectionId } from '../domain/pokemon-selection';
import { evolutionLabels } from './evolution-presentation';

const sourceMethodNames = {
  grass: 'Grass', surf: 'Surf', 'old-rod': 'Old Rod', 'good-rod': 'Good Rod',
  'super-rod': 'Super Rod', 'rock-smash': 'Rock Smash', starter: 'Starter',
  headbutt: 'Headbutt', 'bug-contest': 'Bug-Catching Contest',
  gift: 'Gift', static: 'Fixed encounter', roaming: 'Roaming encounter', egg: 'Egg', fossil: 'Fossil revival',
  'honey-tree': 'Honey Tree', 'poke-radar': 'Poké Radar',
  'dark-grass': 'Dark grass', 'grass-spots': 'Shaking grass', 'cave-spots': 'Dust cloud',
  'bridge-spots': 'Bridge shadow', 'surf-spots': 'Surf in rippling water',
  'super-rod-spots': 'Super Rod in rippling water',
  horde: 'Horde', 'rough-terrain': 'Rough terrain', 'yellow-flowers': 'Yellow flowers',
  'red-flowers': 'Red flowers', 'purple-flowers': 'Purple flowers',
  'ceiling-ambush': 'Ceiling ambush', 'ground-ambush': 'Ground ambush',
  'rustling-bush-ambush': 'Rustling bush', 'sky-ambush': 'Sky ambush',
  'trash-can-ambush': 'Shaking trash can', 'berry-tree': 'Berry tree pests',
  'game-trade': 'In-game trade', breeding: 'Breeding',
  'hidden-grotto': 'Hidden Grotto', 'white-forest': 'White Forest resident',
} as const;

export function sourceMethod(details: SourceDetails) {
  const key = details.kind === 'wild' ? details.method : details.kind;
  const rod = key === 'super-rod-spots' ? 'super-rod' : key;
  const itemIcon = rod === 'old-rod' || rod === 'good-rod' || rod === 'super-rod' ? `/items/${rod}.png` : null;
  const methodIcon = key === 'grass' ? '/methods/grass.svg' : key === 'surf' || key === 'surf-spots' ? '/methods/surf.svg' : null;
  return { name: sourceMethodNames[key], iconSrc: itemIcon ?? methodIcon };
}

export function pathSource(game: GameData, path: AcquisitionPath) {
  const id = path.breedingSteps[0]?.sourceId ?? path.sourceIds[0];
  const source = game.sources.find(source => source.id === id);
  if (!source) throw new Error(`Missing acquisition source: ${id}`);
  return source;
}

export function breedingParentName(parent: ParentWitness, snapshot: AvailabilitySnapshot): string {
  return pokemonIdentity(selectionId(parent.pokemonId, parent.formId ?? snapshot.paths[parent.pathId]?.formId)).name;
}

function acquisitionGroup(game: GameData, path: AcquisitionPath) {
  const evolutionId = path.evolutionIds.at(-1);
  if (evolutionId) {
    const evolution = game.evolutions.find(evolution => evolution.id === evolutionId);
    if (!evolution) throw new Error(`Missing acquisition evolution: ${evolutionId}`);
    return { id: JSON.stringify(['evolution', path.pokemonId, evolution.id]),
      title: `Evolve ${pokemonIdentity(selectionId(evolution.fromPokemonId, evolution.fromFormId)).name}`,
      method: evolutionLabels(game, evolution).join(' · '), iconSrc: null };
  }
  const source = pathSource(game, path);
  const location = game.locations.find(location => location.id === source.locationId)!;
  const method = sourceMethod(source.details);
  return { id: JSON.stringify([location.id, source.details.kind, source.details.kind === 'wild' ? source.details.method : null]),
    title: source.details.kind === 'breeding' ? 'Day Care breeding' : location.name,
    method: method.name, iconSrc: method.iconSrc };
}

export function groupAcquisitionPaths(game: GameData, snapshot: AvailabilitySnapshot, ids: string[]) {
  const groups = new Map<string, ReturnType<typeof acquisitionGroup> & { paths: AcquisitionPath[] }>();
  for (const id of new Set(ids)) {
    const path = snapshot.paths[id];
    const description = acquisitionGroup(game, path);
    let group = groups.get(description.id);
    if (!group) {
      group = { ...description, paths: [] };
      groups.set(group.id, group);
    }
    group.paths.push(path);
  }
  return [...groups.values()];
}

export function firstAccessPoints(game: GameData, ids: string[]) {
  // Access points can belong to independent branches. Display order is not chronology.
  return [...new Set(ids)].map(id => game.milestones.find(point => point.id === id)!);
}

export function firstAccessLabel(game: GameData, path: AcquisitionPath, milestoneId: string) {
  const point = game.milestones.find(point => point.id === milestoneId);
  if (!point) throw new Error(`Missing first-access point: ${milestoneId}`);
  const { title } = acquisitionGroup(game, path);
  if (title === point.name) return title;
  const relation = point.kind === 'route' || point.kind === 'area' ? 'at' : 'after';
  return `${title} — ${relation} “${point.name}”`;
}

export function firstAccessOptions(game: GameData, snapshot: AvailabilitySnapshot, entry: AvailabilityEntry) {
  const paths = [...new Set([...entry.currentPathIds, ...entry.futurePathIds])].map(id => snapshot.paths[id]);
  return firstAccessPoints(game, entry.firstMilestoneIds).map(point => {
    const path = paths.find(path => path.firstMilestoneIds.includes(point.id));
    if (!path) throw new Error(`Missing acquisition path for ${entry.pokemonId} at ${point.id}`);
    return { id: point.id, path, label: firstAccessLabel(game, path, point.id) };
  });
}

export function distinctPathOptions(paths: AcquisitionPath[], snapshot: AvailabilitySnapshot) {
  const options = new Map<string, AcquisitionPath>();
  for (const path of paths) {
    const parentSteps = path.breedingSteps.map(step => ({ ...step, parents: step.parents.map(parent => {
      const proof = snapshot.paths[parent.pathId];
      return { pokemonId: parent.pokemonId, gender: parent.gender, sourceIds: proof?.sourceIds,
        evolutionIds: proof?.evolutionIds, minimumLevel: proof?.minimumLevel, choices: proof?.choices, claims: proof?.claims };
    }) }));
    const key = JSON.stringify([path.sourceIds, path.evolutionIds, path.minimumLevel, parentSteps,
      path.choices, path.claims, path.coProductIds, path.firstMilestoneIds, path.formId ?? null, path.formChangeIds ?? []]);
    if (!options.has(key)) options.set(key, path);
  }
  return [...options.values()];
}

export function pathOptionName(game: GameData, path: AcquisitionPath) {
  const source = pathSource(game, path);
  if (path.evolutionIds.length) {
    const location = game.locations.find(location => location.id === source.locationId)!;
    return `${pokemonById.get(source.pokemonId)!.name} · ${location.name} · ${sourceMethod(source.details).name}`;
  }
  // Area names are part of the manually maintained wild-source IDs.
  if (source.details.kind === 'wild') {
    const prefix = `wild-${source.locationId}-`;
    const suffix = `-${source.details.method}-${source.pokemonId}`;
    if (source.id.startsWith(prefix) && source.id.endsWith(suffix)) {
      const area = source.id.slice(prefix.length, -suffix.length).replaceAll('-', ' ');
      if (area) return area[0].toUpperCase() + area.slice(1);
    }
  }
  return source.details.kind === 'breeding' ? 'Parent pair' : 'Source option';
}
