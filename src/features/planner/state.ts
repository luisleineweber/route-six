import type { PlanningTarget } from '../../domain/types';

export interface PlannerState {
  gameId: string;
  milestoneId: string;
  respectLevelLimit: boolean;
  target: PlanningTarget;
  team: (string | null)[];
}
export const initialState: PlannerState = { gameId: 'emerald', milestoneId: 'route-102', respectLevelLimit: true,
  target: 'whole-game', team: Array(6).fill(null) };

export type PlannerAction =
  | { type: 'settings'; values: Partial<Omit<PlannerState, 'team'>> }
  | { type: 'add'; pokemonId: string; slot: number | null }
  | { type: 'remove'; slot: number };

export function plannerReducer(state: PlannerState, action: PlannerAction): PlannerState {
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
