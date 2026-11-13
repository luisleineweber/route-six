import { pokemonIdentity } from '../../data/dataset';
import { pokemonBaseStats } from '../../data/base-stats';
import type { BaseStats } from '../../domain/base-stats';
import { selectionProfile } from '../../domain/pokemon-selection';
import { analyzeTypes, damageMultiplier } from '../../domain/team/analyze-types';
import { checkTeam } from '../../domain/team/check-team';
import type { AvailabilitySnapshot, GameData, PlanningTarget } from '../../domain/types';
import type { PlannerState } from '../planner/state';
import { progressContent, compareProgressPaths, type ProgressContent } from './progress-content';

interface EmptyExportSlot {
  name: string;
  dex: null;
  spriteSrc: null;
  types: string[];
  progress: null;
  baseStats?: undefined;
}

interface PokemonExportSlot {
  name: string;
  dex: number;
  spriteSrc: string;
  types: string[];
  progress: ProgressContent | null;
  baseStats?: BaseStats;
}

/** A Pokémon slot always has a Dex number and a sprite. An empty slot has neither. */
export type ExportSlot = EmptyExportSlot | PokemonExportSlot;

export interface TeamExport {
  kind: 'team' | 'progress';
  title: string;
  subtitle: string;
  logoSrc: string;
  filename: string;
  slots: ExportSlot[];
  defense: { type: string; multipliers: (number | null)[] }[];
  coverage: string[];
  notes: string[];
}

const memberNames = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

function selectTeamPaths(game: GameData, snapshot: AvailabilitySnapshot, members: string[], target: PlanningTarget) {
  const sorted = (ids: string[]) => [...ids].sort((first, second) =>
    compareProgressPaths(game, snapshot.paths[first], snapshot.paths[second]));
  const entries = { ...snapshot.entries };
  for (const id of members) {
    const entry = entries[id];
    entries[id] = { ...entry, currentPathIds: sorted(entry.currentPathIds), futurePathIds: sorted(entry.futurePathIds) };
  }
  const result = checkTeam({ ...snapshot, entries }, members, target);
  return {
    paths: result.chosenPathIds.map(id => id === null ? undefined : snapshot.paths[id]),
    notes: result.warnings.filter(warning => warning.code === 'choice-conflict' || warning.code === 'finite-resource')
      // The sheet has no member list, so it names the Pokémon instead of "These members".
      .map(warning => `Team conflict: ${warning.message.replace(/^These members/,
        memberNames.format(warning.slotIndexes.map(index => pokemonIdentity(members[index]).name)))}`),
  };
}

export function buildTeamExport(game: GameData, state: PlannerState, progress: boolean, snapshot: AvailabilitySnapshot | null): TeamExport {
  if (progress && (!snapshot || snapshot.query.gameId !== state.gameId || snapshot.query.milestoneId !== state.milestoneId || snapshot.query.respectLevelLimit !== state.respectLevelLimit)) {
    throw new Error('Wait for the current access check before exporting.');
  }
  const members = state.team.filter((id): id is string => id !== null);
  const selected = progress ? selectTeamPaths(game, snapshot!, members, state.target) : { paths: [], notes: [] };
  const selectedPaths = selected.paths;
  const analysis = analyzeTypes(game, members);
  const mode = progress ? 'My playthrough team' : 'My Pokémon team';
  const subtitle = progress ? [game.milestones.find(point => point.id === state.milestoneId)!.name,
    ...(state.target === 'whole-game' ? ['Whole game'] : []),
    state.respectLevelLimit ? snapshot!.levelLimit ? `Level limit: ${snapshot!.levelLimit.level}` : 'No active level limit' : 'Level limit off'].join(' · ') : 'Base stats · Highest value in red';
  return {
    kind: progress ? 'progress' : 'team', title: mode, subtitle,
    logoSrc: `/games/${state.gameId}-logo.png`,
    filename: `${state.gameId}-${progress ? 'progress' : 'team'}-planner.png`,
    slots: state.team.map(id => {
      if (!id) return { name: 'Empty slot', dex: null, spriteSrc: null, types: [], progress: null };
      const pokemon = pokemonIdentity(id);
      const profile = selectionProfile(game, id);
      return { name: pokemon.name, dex: pokemon.nationalDex, spriteSrc: profile.spriteSrc, types: profile.types,
        ...(progress ? {} : { baseStats: pokemonBaseStats(state.gameId, id) }),
        progress: progress ? progressContent(game, snapshot!, id, selectedPaths.shift()) : null };
    }),
    defense: progress ? [] : game.typeChart.typeIds.map(type => ({ type, multipliers: state.team.map(id => id ? damageMultiplier(game, type, id) : null) })),
    coverage: progress ? [] : analysis.coveredTypes,
    notes: progress ? selected.notes : ['Types only. Abilities, items, and moves are not included.'],
  };
}
