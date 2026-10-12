import { pokemonById } from '../../data/dataset';
import { analyzeTypes, damageMultiplier } from '../../domain/team/analyze-types';
import type { AvailabilitySnapshot, GameData } from '../../domain/types';
import type { PlannerState } from '../planner/state';
import { progressContent, type ProgressContent } from './progress-content';

export interface ExportSlot {
  name: string;
  dex: number | null;
  types: string[];
  progress: ProgressContent | null;
}

export interface TeamExport {
  kind: 'team' | 'progress';
  title: string;
  subtitle: string;
  filename: string;
  slots: ExportSlot[];
  defense: { type: string; multipliers: (number | null)[] }[];
  coverage: string[];
  notes: string[];
}

export function buildTeamExport(game: GameData, state: PlannerState, progress: boolean, snapshot: AvailabilitySnapshot | null): TeamExport {
  if (progress && (!snapshot || snapshot.query.gameId !== state.gameId || snapshot.query.milestoneId !== state.milestoneId || snapshot.query.respectLevelLimit !== state.respectLevelLimit)) {
    throw new Error('Wait for the current access check before exporting.');
  }
  const members = state.team.filter((id): id is string => id !== null);
  const analysis = analyzeTypes(game, members);
  const mode = progress ? 'Progress planner' : 'Team planner';
  const subtitle = progress ? [game.game.name, game.milestones.find(point => point.id === state.milestoneId)!.name,
    state.target === 'whole-game' ? 'Whole game' : 'Current/Goal progress',
    state.respectLevelLimit ? snapshot!.levelLimit ? `Level limit: ${snapshot!.levelLimit.level}` : 'No active level limit' : 'Level limit off'].join(' · ') : game.game.name;
  return {
    kind: progress ? 'progress' : 'team', title: mode, subtitle,
    filename: `${state.gameId}-${progress ? 'progress' : 'team'}-planner.png`,
    slots: state.team.map(id => {
      if (!id) return { name: 'Empty slot', dex: null, types: [], progress: null };
      const pokemon = pokemonById.get(id)!;
      return { name: pokemon.name, dex: pokemon.nationalDex, types: game.profiles.find(profile => profile.pokemonId === id)!.types,
        progress: progress ? progressContent(game, snapshot!, id) : null };
    }),
    defense: progress ? [] : game.typeChart.typeIds.map(type => ({ type, multipliers: state.team.map(id => id ? damageMultiplier(game, type, id) : null) })),
    coverage: progress ? [] : analysis.coveredTypes,
    notes: progress ? [] : ['Types only. Abilities, items, and moves are not included.'],
  };
}
