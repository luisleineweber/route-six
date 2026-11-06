import type { GameData, PlanningTarget } from '../../domain/types';
import type { StageOverrides } from '../../domain/team/stage-team';

export interface PlannerState {
  gameId: string;
  milestoneId: string | null;
  respectLevelLimit: boolean;
  target: PlanningTarget;
  team: (string | null)[];
  stageOverrides: StageOverrides;
}
export function createInitialState(game: GameData): PlannerState {
  return { gameId: game.game.id, milestoneId: game.game.planner?.defaultMilestoneId ?? null, respectLevelLimit: true,
    target: 'current-progress', team: Array(6).fill(null), stageOverrides: {} };
}

export type PlannerAction =
  | { type: 'restore'; state: PlannerState }
  | { type: 'game'; gameId: string; milestoneId: string | null }
  | { type: 'settings'; values: Partial<Omit<PlannerState, 'team' | 'stageOverrides'>> }
  | { type: 'stage-member'; stageId: string; slot: number; pokemonId: string | null }
  | { type: 'stage-reset'; stageId: string }
  | { type: 'stage-auto'; stageId: string; slot: number }
  | { type: 'add'; pokemonId: string; slot: number | null }
  | { type: 'remove'; slot: number };

export function plannerReducer(state: PlannerState, action: PlannerAction): PlannerState {
  if (action.type === 'restore') return action.state;
  if (action.type === 'game') {
    if (action.gameId === state.gameId) return state;
    return { ...state, gameId: action.gameId, milestoneId: action.milestoneId,
      team: Array(6).fill(null), stageOverrides: {} };
  }
  if (action.type === 'settings') return { ...state, ...action.values };
  if (action.type === 'stage-reset') {
    const stageOverrides = { ...state.stageOverrides };
    delete stageOverrides[action.stageId];
    return { ...state, stageOverrides };
  }
  if (action.type === 'stage-member') {
    if (action.slot < 0 || action.slot > 5) return state;
    return { ...state, stageOverrides: { ...state.stageOverrides,
      [action.stageId]: { ...state.stageOverrides[action.stageId], [action.slot]: action.pokemonId } } };
  }
  if (action.type === 'stage-auto') {
    const overrides = { ...state.stageOverrides[action.stageId] };
    delete overrides[action.slot];
    return { ...state, stageOverrides: { ...state.stageOverrides, [action.stageId]: overrides } };
  }
  const team = [...state.team];
  if (action.type === 'remove') team[action.slot] = null;
  else {
    const slot = action.slot ?? team.indexOf(null);
    if (slot < 0 || slot > 5) return state;
    team[slot] = action.pokemonId;
  }
  return { ...state, team };
}
