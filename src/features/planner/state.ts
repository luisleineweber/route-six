import type { GameData, PlanningTarget } from '../../domain/types';

export interface PlannerState {
  gameId: string;
  milestoneId: string | null;
  respectLevelLimit: boolean;
  target: PlanningTarget;
  team: (string | null)[];
}
export function createInitialState(game: GameData): PlannerState {
  return { gameId: game.game.id, milestoneId: game.game.planner?.defaultMilestoneId ?? null, respectLevelLimit: true,
    target: 'current-progress', team: Array(6).fill(null) };
}

export type PlannerAction =
  | { type: 'game'; gameId: string; milestoneId: string | null; pokemonIds: string[] }
  | { type: 'settings'; values: Partial<Omit<PlannerState, 'team'>> }
  | { type: 'add'; pokemonId: string; slot: number | null }
  | { type: 'remove'; slot: number };

export function plannerReducer(state: PlannerState, action: PlannerAction): PlannerState {
  if (action.type === 'game') {
    if (action.gameId === state.gameId) return state;
    const pokemonIds = new Set(action.pokemonIds);
    return { ...state, gameId: action.gameId, milestoneId: action.milestoneId,
      team: state.team.map(id => id !== null && pokemonIds.has(id) ? id : null) };
  }
  if (action.type === 'settings') return { ...state, ...action.values };
  const team = [...state.team];
  if (action.type === 'remove') team[action.slot] = null;
  else {
    const slot = action.slot ?? team.indexOf(null);
    if (slot < 0 || slot > 5) return state;
    team[slot] = action.pokemonId;
  }
  return { ...state, team };
}
