import type { GameLoadError } from '../../data/game-loader';
import type { GameData, Result } from '../../domain/types';

interface GameSelectionOptions {
  getState: () => { gameId: string; team: readonly (string | null)[] };
  confirmChange: (gameId: string) => boolean;
  loadGame: (gameId: string) => Promise<Result<GameData, GameLoadError>>;
  onLoading: (gameId: string | null) => void;
  onError: (error: GameLoadError | null) => void;
  onChange: (game: GameData) => void;
}

export function createGameSelection(options: GameSelectionOptions) {
  let request = 0;
  return async (gameId: string) => {
    const currentRequest = ++request;
    options.onError(null);
    const state = options.getState();
    if (gameId === state.gameId) { options.onLoading(null); return; }
    const approvedTeam = [...state.team];
    if (approvedTeam.some(id => id !== null) && !options.confirmChange(gameId)) {
      options.onLoading(null); return;
    }
    options.onLoading(gameId);
    const result = await options.loadGame(gameId);
    if (currentRequest !== request) return;
    options.onLoading(null);
    if (!result.ok) { options.onError(result.error); return; }
    const currentTeam = options.getState().team;
    if (currentTeam.some(id => id !== null)
      && currentTeam.some((id, index) => id !== approvedTeam[index])
      && !options.confirmChange(gameId)) return;
    options.onChange(result.value);
  };
}
