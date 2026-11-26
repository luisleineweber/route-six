import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dataset, emerald, initialState } from './local-data';
import { createGameSelection, gameChangeUndoDuration } from '../src/features/planner/game-selection';
import { plannerReducer, type PlannerState } from '../src/features/planner/state';
import type { GameLoadError } from '../src/data/game-loader';
import type { GameData, Result } from '../src/domain/types';

type LoadResult = Result<GameData, GameLoadError>;
const ruby = dataset.games.find(game => game.game.id === 'ruby')!;
const sapphire = dataset.games.find(game => game.game.id === 'sapphire')!;
const success = (game = ruby): LoadResult => ({ ok: true, value: game });

function delayedLoad() {
  let resolve!: (result: LoadResult) => void;
  const promise = new Promise<LoadResult>(done => { resolve = done; });
  return { promise, resolve };
}

function setup(team: (string | null)[] = ['treecko', null, null, null, null, null]) {
  let game = emerald;
  let state: PlannerState = { ...initialState, target: 'whole-game', respectLevelLimit: false, team };
  const loadGame = vi.fn(async (_id: string) => success());
  const onLoading = vi.fn();
  const onError = vi.fn();
  const onUndoAvailable = vi.fn();
  const onChange = vi.fn((nextGame: GameData, nextState: PlannerState) => {
    game = nextGame;
    state = plannerReducer(state, { type: 'restore', state: nextState });
  });
  const selection = createGameSelection({
    getState: () => state, getGame: () => game, loadGame, onLoading, onError, onChange, onUndoAvailable,
  });
  return {
    ...selection, loadGame, onLoading, onError, onChange, onUndoAvailable,
    state: () => state, game: () => game,
    setTeam: (nextTeam: (string | null)[]) => { state = { ...state, team: nextTeam }; },
  };
}

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

describe('Game-change undo', () => {
  it('restores stage teams when undoing a game change', async () => {
    const h = setup();
    h.state().stageOverrides = { 'gym-1': { 0: 'ralts', 1: null } };
    const before = structuredClone(h.state());
    await h.select('ruby');
    expect(h.state().stageOverrides).toEqual({});
    expect(h.undo()).toBe(true);
    expect(h.state()).toEqual(before);
  });
  it('switches directly, clears the team, and keeps shared settings', async () => {
    const h = setup();
    await h.select('ruby');
    expect(h.loadGame).toHaveBeenCalledExactlyOnceWith('ruby');
    expect(h.game()).toBe(ruby);
    expect(h.state()).toMatchObject({
      gameId: 'ruby', milestoneId: ruby.game.planner?.defaultMilestoneId,
      team: Array(6).fill(null), target: 'whole-game', respectLevelLimit: false,
    });
    expect(h.onUndoAvailable).toHaveBeenLastCalledWith(true);
  });

  it('restores the previous game, all six slots, progress, and settings without loading again', async () => {
    const h = setup(['treecko', null, 'ralts', null, null, 'mudkip']);
    const before = h.state();
    await h.select('ruby');
    expect(h.undo()).toBe(true);
    expect(h.game()).toBe(emerald);
    expect(h.state()).toEqual(before);
    expect(h.loadGame).toHaveBeenCalledTimes(1);
    expect(h.onUndoAvailable).toHaveBeenLastCalledWith(false);
    expect(h.undo()).toBe(false);
  });

  it('keeps undo available until five seconds after the completed switch', async () => {
    const h = setup();
    await h.select('ruby');
    vi.advanceTimersByTime(gameChangeUndoDuration - 1);
    expect(h.onUndoAvailable).toHaveBeenLastCalledWith(true);
    vi.advanceTimersByTime(1);
    expect(h.onUndoAvailable).toHaveBeenLastCalledWith(false);
    expect(h.undo()).toBe(false);
    expect(h.game()).toBe(ruby);
  });

  it('starts the undo period after loading and saves team edits made during loading', async () => {
    const h = setup();
    const pending = delayedLoad();
    h.loadGame.mockReturnValueOnce(pending.promise);
    const change = h.select('ruby');
    vi.advanceTimersByTime(gameChangeUndoDuration * 2);
    h.setTeam(['treecko', 'ralts', null, null, null, null]);
    const before = h.state();
    expect(h.onUndoAvailable).not.toHaveBeenCalled();
    pending.resolve(success());
    await change;
    expect(h.undo()).toBe(true);
    expect(h.state()).toEqual(before);
  });

  it('also offers undo for an empty team', async () => {
    const h = setup(Array(6).fill(null));
    const before = h.state();
    await h.select('ruby');
    expect(h.undo()).toBe(true);
    expect(h.state()).toEqual(before);
  });

  it('does not load or change state when the current game is selected', async () => {
    const h = setup();
    const before = h.state();
    await h.select('emerald');
    expect(h.loadGame).not.toHaveBeenCalled();
    expect(h.onChange).not.toHaveBeenCalled();
    expect(h.onUndoAvailable).not.toHaveBeenCalled();
    expect(h.state()).toBe(before);
  });

  it('replaces the undo snapshot and resets its timer on the next successful switch', async () => {
    const h = setup();
    await h.select('ruby');
    h.setTeam(['torchic', null, null, null, null, null]);
    const rubyState = h.state();
    vi.advanceTimersByTime(4_000);
    h.loadGame.mockResolvedValueOnce(success(sapphire));
    await h.select('sapphire');
    vi.advanceTimersByTime(4_000);
    expect(h.undo()).toBe(true);
    expect(h.game()).toBe(ruby);
    expect(h.state()).toEqual(rubyState);
  });

  it('cancels a pending selection when undo restores the previous game', async () => {
    const h = setup();
    const before = h.state();
    await h.select('ruby');
    const pending = delayedLoad();
    h.loadGame.mockReturnValueOnce(pending.promise);
    const change = h.select('sapphire');
    expect(h.undo()).toBe(true);
    pending.resolve(success(sapphire));
    await change;
    expect(h.game()).toBe(emerald);
    expect(h.state()).toEqual(before);
    expect(h.onChange).toHaveBeenCalledTimes(2);
    expect(h.onLoading).toHaveBeenLastCalledWith(null);
  });

  it('applies only the newest successful request', async () => {
    const h = setup();
    const pending = delayedLoad();
    h.loadGame.mockReturnValueOnce(pending.promise).mockResolvedValueOnce(success(sapphire));
    const older = h.select('ruby');
    await h.select('sapphire');
    pending.resolve(success());
    await older;
    expect(h.onChange).toHaveBeenCalledTimes(1);
    expect(h.game()).toBe(sapphire);
    expect(h.undo()).toBe(true);
    expect(h.game()).toBe(emerald);
  });

  it('cancels an older load when the current game is selected again', async () => {
    const h = setup();
    const pending = delayedLoad();
    h.loadGame.mockReturnValueOnce(pending.promise);
    const older = h.select('ruby');
    await h.select('emerald');
    pending.resolve(success());
    await older;
    expect(h.onChange).not.toHaveBeenCalled();
    expect(h.onLoading).toHaveBeenLastCalledWith(null);
  });

  it('reports load failure without changing the team or replacing the existing undo', async () => {
    const h = setup();
    await h.select('ruby');
    const before = h.state();
    const error: GameLoadError = { code: 'unknown-game', gameId: 'sapphire' };
    h.loadGame.mockResolvedValueOnce({ ok: false, error });
    await h.select('sapphire');
    expect(h.onError).toHaveBeenLastCalledWith(error);
    expect(h.state()).toBe(before);
    expect(h.undo()).toBe(true);
    expect(h.game()).toBe(emerald);
    expect(h.onError).toHaveBeenLastCalledWith(null);
  });

  it('ignores an error from a cancelled request', async () => {
    const h = setup();
    const pending = delayedLoad();
    h.loadGame.mockReturnValueOnce(pending.promise);
    const older = h.select('ruby');
    await h.select('emerald');
    pending.resolve({ ok: false, error: { code: 'unknown-game', gameId: 'ruby' } });
    await older;
    expect(h.onError.mock.calls.every(([error]) => error === null)).toBe(true);
    expect(h.onChange).not.toHaveBeenCalled();
  });

  it('clears timers and ignores pending results after disposal', async () => {
    const h = setup();
    await h.select('ruby');
    const pending = delayedLoad();
    h.loadGame.mockReturnValueOnce(pending.promise);
    const change = h.select('sapphire');
    h.dispose();
    pending.resolve(success(sapphire));
    await change;
    vi.advanceTimersByTime(gameChangeUndoDuration);
    expect(h.onChange).toHaveBeenCalledTimes(1);
    expect(h.onUndoAvailable).toHaveBeenCalledTimes(1);
    expect(h.undo()).toBe(false);
  });
});
