import type { GameData, Result, SharedData, ValidationIssue } from '../domain/types';
import { sharedData } from './dataset';
import { gameLoaders } from './game-registry';
import { validateDataset } from './validate-dataset';

export type GameLoadError =
  | { code: 'unknown-game'; gameId: string }
  | { code: 'invalid-data'; gameId: string; issues: ValidationIssue[] }
  | { code: 'load-failed'; gameId: string; message: string };

export function gameLoadMessage(error: GameLoadError): string {
  if (error.code === 'unknown-game') return `No reviewed local data exists for ${error.gameId}.`;
  if (error.code === 'load-failed') return `Could not load ${error.gameId}: ${error.message}`;
  return error.issues.map(issue => `${issue.fieldPath} [${issue.recordId ?? error.gameId}]: ${issue.message}`).join('\n');
}

export function createGameLoader(shared: SharedData, loaders: Readonly<Record<string, () => Promise<unknown>>>) {
  const loaded = new Map<string, GameData>();
  const pending = new Map<string, Promise<Result<GameData, GameLoadError>>>();

  async function read(gameId: string): Promise<Result<GameData, GameLoadError>> {
    try {
      const raw = await loaders[gameId]();
      const checked = validateDataset({ ...shared, games: [raw] });
      if (!checked.ok) return { ok: false, error: { code: 'invalid-data', gameId, issues: checked.error } };
      const game = checked.value.games[0];
      if (game.game.id !== gameId) return { ok: false, error: { code: 'invalid-data', gameId, issues: [{
        recordId: game.game.id, fieldPath: `data/games/${gameId}/game.json/id`, message: 'Game ID does not match its registry entry.',
      }] } };
      loaded.set(gameId, game);
      return { ok: true, value: game };
    } catch (error) {
      return { ok: false, error: { code: 'load-failed', gameId, message: error instanceof Error ? error.message : String(error) } };
    }
  }

  return async function loadGame(gameId: string): Promise<Result<GameData, GameLoadError>> {
    if (!Object.hasOwn(loaders, gameId)) return { ok: false, error: { code: 'unknown-game', gameId } };
    const game = loaded.get(gameId);
    if (game) return { ok: true, value: game };
    const current = pending.get(gameId);
    if (current) return current;
    const request = read(gameId);
    pending.set(gameId, request);
    try { return await request; }
    finally { pending.delete(gameId); }
  };
}

export const loadGame = createGameLoader(sharedData, gameLoaders);
