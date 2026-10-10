import { pokemonById } from '../../data/dataset';
import { pathSource } from '../../components/acquisition-presentation';
import { statusNames } from '../../components/StatusLabel';
import { conditionText } from '../../domain/availability/solve';
import { analyzeTypes, damageMultiplier } from '../../domain/team/analyze-types';
import { checkTeam } from '../../domain/team/check-team';
import type { AcquisitionPath, AvailabilitySnapshot, GameData } from '../../domain/types';
import type { PlannerState } from '../planner/state';

export interface ExportSlot {
  name: string;
  dex: number | null;
  types: string[];
  status: string | null;
  details: string[];
}

export interface TeamExport {
  title: string;
  subtitle: string;
  filename: string;
  slots: ExportSlot[];
  defense: { type: string; multipliers: (number | null)[] }[];
  coverage: string[];
  notes: string[];
}

function evolutionText(game: GameData, path: AcquisitionPath): string[] {
  return path.evolutionIds.map(id => {
    const rule = game.evolutions.find(rule => rule.id === id)!;
    const target = path.coProductIds.includes(rule.toPokemonId) ? path.pokemonId : rule.toPokemonId;
    const action = rule.trigger === 'use-item' ? `use ${game.items.find(item => item.id === rule.itemId)!.name}`
      : rule.trigger === 'player-trade' ? 'player trade'
      : rule.minimumLevel ? `gain a level at Lv. ${rule.minimumLevel} or higher` : 'gain one level';
    return `${pokemonById.get(rule.fromPokemonId)!.name} → ${pokemonById.get(target)!.name}: ${action}. ${rule.conditions.map(conditionText).join(' ')}`.trim();
  });
}

export function progressDetails(game: GameData, snapshot: AvailabilitySnapshot, id: string): string[] {
  const entry = snapshot.entries[id];
  // Prefer paths that work now. Future paths are used only when none work now.
  const ids = entry.currentPathIds.length ? entry.currentPathIds : entry.futurePathIds;
  const locations = new Set<string>();
  const details: string[] = [];
  for (const pathId of ids) {
    const path = snapshot.paths[pathId];
    const source = pathSource(game, path);
    if (locations.has(source.locationId)) continue;
    locations.add(source.locationId);
    const location = game.locations.find(location => location.id === source.locationId)!;
    const method = source.details.kind === 'wild' ? source.details.method.replaceAll('-', ' ') : source.details.kind.replaceAll('-', ' ');
    details.push(`${locations.size}. ${location.name} · ${method} · ${pokemonById.get(source.pokemonId)!.name}`);
    if (path.breedingSteps.length) {
      for (const step of path.breedingSteps) {
        details.push(`Breed ${step.parents.map(parent => pokemonById.get(parent.pokemonId)!.name).join(' + ')}. Hatch at Lv. 5.`);
      }
    }
    const evolution = evolutionText(game, path);
    details.push(...(evolution.length ? evolution : ['No evolution needed.']));
    details.push(`Minimum Lv. ${path.minimumLevel}.`);
    if (locations.size === 2) break;
  }
  if (!details.length) {
    details.push('No valid acquisition path.', ...entry.blockers.map(blocker => blocker.message));
  }
  return details;
}

export function buildTeamExport(game: GameData, state: PlannerState, progress: boolean, snapshot: AvailabilitySnapshot | null): TeamExport {
  if (progress && (!snapshot || snapshot.query.gameId !== state.gameId || snapshot.query.milestoneId !== state.milestoneId || snapshot.query.respectLevelLimit !== state.respectLevelLimit)) {
    throw new Error('Wait for the current access check before exporting.');
  }
  const members = state.team.filter((id): id is string => id !== null);
  const analysis = analyzeTypes(game, members);
  const mode = progress ? 'Progress planner' : 'Team planner';
  const subtitle = progress ? [game.game.name, game.milestones.find(point => point.id === state.milestoneId)!.name,
    state.target === 'whole-game' ? 'Whole game' : 'Current progress',
    state.respectLevelLimit ? snapshot!.levelLimit ? `Level limit: ${snapshot!.levelLimit.level}` : 'No active level limit' : 'Level limit off'].join(' · ') : game.game.name;
  return {
    title: mode, subtitle,
    filename: `${state.gameId}-${progress ? 'progress' : 'team'}-planner.png`,
    slots: state.team.map(id => {
      if (!id) return { name: 'Empty slot', dex: null, types: [], status: null, details: [] };
      const pokemon = pokemonById.get(id)!;
      return { name: pokemon.name, dex: pokemon.nationalDex, types: game.profiles.find(profile => profile.pokemonId === id)!.types,
        status: progress ? statusNames[snapshot!.entries[id].status] : null,
        details: progress ? progressDetails(game, snapshot!, id) : [] };
    }),
    defense: progress ? [] : game.typeChart.typeIds.map(type => ({ type, multipliers: state.team.map(id => id ? damageMultiplier(game, type, id) : null) })),
    coverage: progress ? [] : analysis.coveredTypes,
    notes: progress ? ['Up to two locations per member. Each location is an alternative.',
      ...checkTeam(snapshot!, members, state.target).warnings.map(warning => warning.message.replace(/\b[a-z]+(?:-[a-z]+)*\b/g, word => pokemonById.get(word)?.name ?? word))]
      : ['Types only. Abilities, items, and moves are not included.'],
  };
}
