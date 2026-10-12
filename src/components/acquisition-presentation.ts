import type { AcquisitionPath, AvailabilitySnapshot, GameData, SourceDetails } from '../domain/types';
import { pokemonById } from '../data/dataset';
import { evolutionLabels } from './evolution-presentation';

const sourceMethodNames = {
  grass: 'Grass', surf: 'Surf', 'old-rod': 'Old Rod', 'good-rod': 'Good Rod',
  'super-rod': 'Super Rod', 'rock-smash': 'Rock Smash', starter: 'Starter',
  gift: 'Gift', static: 'Fixed encounter', egg: 'Egg', fossil: 'Fossil revival',
  'game-trade': 'In-game trade', breeding: 'Breeding',
} as const;

export function sourceMethod(details: SourceDetails) {
  const key = details.kind === 'wild' ? details.method : details.kind;
  const rodIcon = key === 'old-rod' || key === 'good-rod' || key === 'super-rod' ? `/items/${key}.png` : null;
  return { name: sourceMethodNames[key], rodIcon };
}

export function pathSource(game: GameData, path: AcquisitionPath) {
  const id = path.breedingSteps[0]?.sourceId ?? path.sourceIds[0];
  const source = game.sources.find(source => source.id === id);
  if (!source) throw new Error(`Missing acquisition source: ${id}`);
  return source;
}

export function groupAcquisitionPaths(game: GameData, snapshot: AvailabilitySnapshot, ids: string[]) {
  const groups = new Map<string, { id: string; title: string; method: string; rodIcon: string | null; paths: AcquisitionPath[] }>();
  for (const id of new Set(ids)) {
    const path = snapshot.paths[id];
    const evolutionId = path.evolutionIds.at(-1);
    if (evolutionId) {
      const evolution = game.evolutions.find(evolution => evolution.id === evolutionId);
      if (!evolution) throw new Error(`Missing acquisition evolution: ${evolutionId}`);
      const key = JSON.stringify(['evolution', path.pokemonId, evolution.id]);
      let group = groups.get(key);
      if (!group) {
        group = { id: key, title: `Evolve ${pokemonById.get(evolution.fromPokemonId)!.name}`,
          method: evolutionLabels(game, evolution).join(' · '), rodIcon: null, paths: [] };
        groups.set(key, group);
      }
      group.paths.push(path);
      continue;
    }
    const source = pathSource(game, path);
    const location = game.locations.find(location => location.id === source.locationId)!;
    const method = sourceMethod(source.details);
    const key = JSON.stringify([location.id, source.details.kind, source.details.kind === 'wild' ? source.details.method : null]);
    let group = groups.get(key);
    if (!group) {
      group = { id: key, title: source.details.kind === 'breeding' ? 'Day Care breeding' : location.name, method: method.name, rodIcon: method.rodIcon, paths: [] };
      groups.set(key, group);
    }
    group.paths.push(path);
  }
  return [...groups.values()];
}

export function firstAccessPoints(game: GameData, ids: string[]) {
  // Access points can belong to independent branches. Display order is not chronology.
  return [...new Set(ids)].map(id => game.milestones.find(point => point.id === id)!);
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
      path.choices, path.claims, path.coProductIds, path.firstMilestoneIds]);
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
