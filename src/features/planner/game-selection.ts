import type { GameLoadError } from '../../data/game-loader';
import type { GameData, Result } from '../../domain/types';
import { plannerReducer, type PlannerState } from './state';

export const gameChangeUndoDuration = 5_000;

interface GameSelectionOptions {
  getState: () => PlannerState;
  getGame: () => GameData;
  loadGame: (gameId: string) => Promise<Result<GameData, GameLoadError>>;
  onLoading: (gameId: string | null) => void;
  onError: (error: GameLoadError | null) => void;
  onChange: (game: GameData, state: PlannerState) => void;
  onUndoAvailable: (available: boolean) => void;
}

export function createGameSelection(options: GameSelectionOptions) {
  let request = 0;
  let previous: { game: GameData; state: PlannerState } | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const clearUndo = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    previous = null;
  };
  const select = async (gameId: string) => {
    const currentRequest = ++request;
    options.onError(null);
    const state = options.getState();
    if (gameId === state.gameId) { options.onLoading(null); return; }
    options.onLoading(gameId);
    const result = await options.loadGame(gameId);
    if (currentRequest !== request) return;
    options.onLoading(null);
    if (!result.ok) { options.onError(result.error); return; }
    clearUndo();
    previous = { game: options.getGame(), state: options.getState() };
    const next = result.value;
    options.onChange(next, plannerReducer(previous.state, {
      type: 'game', gameId: next.game.id, milestoneId: next.game.planner?.defaultMilestoneId ?? null,
    }));
    options.onUndoAvailable(true);
    timer = setTimeout(() => {
      clearUndo();
      options.onUndoAvailable(false);
    }, gameChangeUndoDuration);
  };
  return {
    select,
    undo: () => {
      if (!previous) return false;
      const snapshot = previous;
      ++request;
      clearUndo();
      options.onLoading(null);
      options.onError(null);
      options.onChange(snapshot.game, snapshot.state);
      options.onUndoAvailable(false);
      return true;
    },
    dispose: () => { ++request; clearUndo(); },
  };
}
