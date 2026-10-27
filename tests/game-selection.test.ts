import { describe, expect, it, vi } from 'vitest';
import { dataset, emerald, initialState } from './local-data';
import { createGameSelection } from '../src/features/planner/game-selection';
import { plannerReducer } from '../src/features/planner/state';
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
  let state = { ...initialState, target: 'whole-game' as const, respectLevelLimit: false, team };
  const confirmChange = vi.fn(() => true);
  const loadGame = vi.fn(async (_id: string) => success());
  const onLoading = vi.fn();
  const onError = vi.fn();
  const onChange = vi.fn((game: GameData) => {
    state = plannerReducer(state, {
      type: 'game', gameId: game.game.id, milestoneId: game.game.planner?.defaultMilestoneId ?? null,
    }) as typeof state;
  });
  const select = createGameSelection({
    getState: () => state, confirmChange, loadGame, onLoading, onError, onChange,
  });
  return {
    select, confirmChange, loadGame, onLoading, onError, onChange, state: () => state,
    setTeam: (nextTeam: (string | null)[]) => { state = { ...state, team: nextTeam }; },
  };
}

describe('Game-change confirmation', () => {
  it('cancels before loading and preserves the game, team, and settings', async () => {
    const h = setup();
    const before = h.state();
    h.confirmChange.mockReturnValue(false);
    await h.select('ruby');
    expect(h.confirmChange).toHaveBeenCalledWith('ruby');
    expect(h.loadGame).not.toHaveBeenCalled();
    expect(h.onChange).not.toHaveBeenCalled();
    expect(h.onLoading).toHaveBeenLastCalledWith(null);
    expect(h.state()).toBe(before);
  });

  it('loads and clears the team once after approval, while keeping shared settings', async () => {
    const h = setup();
    await h.select('ruby');
    expect(h.confirmChange).toHaveBeenCalledTimes(1);
    expect(h.loadGame).toHaveBeenCalledExactlyOnceWith('ruby');
    expect(h.onChange).toHaveBeenCalledExactlyOnceWith(ruby);
    expect(h.state()).toMatchObject({ gameId: 'ruby', team: Array(6).fill(null), target: 'whole-game', respectLevelLimit: false });
  });

  it('does not warn or load when the selected game is unchanged', async () => {
    const h = setup();
    const before = h.state();
    await h.select('emerald');
    expect(h.confirmChange).not.toHaveBeenCalled();
    expect(h.loadGame).not.toHaveBeenCalled();
    expect(h.state()).toBe(before);
  });

  it('switches an empty team without a warning', async () => {
    const h = setup(Array(6).fill(null));
    await h.select('ruby');
    expect(h.confirmChange).not.toHaveBeenCalled();
    expect(h.onChange).toHaveBeenCalledWith(ruby);
  });

  it('can cancel after a member is added during an initially empty-team load', async () => {
    const h = setup(Array(6).fill(null));
    const pending = delayedLoad();
    h.loadGame.mockReturnValueOnce(pending.promise);
    const change = h.select('ruby');
    expect(h.confirmChange).not.toHaveBeenCalled();
    h.setTeam(['treecko', null, null, null, null, null]);
    h.confirmChange.mockReturnValue(false);
    pending.resolve(success());
    await change;
    expect(h.confirmChange).toHaveBeenCalledTimes(1);
    expect(h.onChange).not.toHaveBeenCalled();
    expect(h.state().gameId).toBe('emerald');
    expect(h.state().team[0]).toBe('treecko');
    expect(h.onLoading).toHaveBeenLastCalledWith(null);
  });

  it('asks again if a filled team changed after approval and keeps those edits on cancel', async () => {
    const h = setup();
    const pending = delayedLoad();
    h.loadGame.mockReturnValueOnce(pending.promise);
    h.confirmChange.mockReturnValueOnce(true).mockReturnValueOnce(false);
    const change = h.select('ruby');
    h.setTeam(['treecko', 'ralts', null, null, null, null]);
    pending.resolve(success());
    await change;
    expect(h.confirmChange).toHaveBeenCalledTimes(2);
    expect(h.onChange).not.toHaveBeenCalled();
    expect(h.state().team.slice(0, 2)).toEqual(['treecko', 'ralts']);
  });

  it('can approve the updated team before the delayed reset', async () => {
    const h = setup();
    const pending = delayedLoad();
    h.loadGame.mockReturnValueOnce(pending.promise);
    const change = h.select('ruby');
    h.setTeam(['ralts', null, null, null, null, null]);
    pending.resolve(success());
    await change;
    expect(h.confirmChange).toHaveBeenCalledTimes(2);
    expect(h.onChange).toHaveBeenCalledExactlyOnceWith(ruby);
  });

  it('does not ask twice when only the team array reference changed', async () => {
    const h = setup();
    const pending = delayedLoad();
    h.loadGame.mockReturnValueOnce(pending.promise);
    const change = h.select('ruby');
    h.setTeam([...h.state().team]);
    pending.resolve(success());
    await change;
    expect(h.confirmChange).toHaveBeenCalledTimes(1);
    expect(h.onChange).toHaveBeenCalledWith(ruby);
  });

  it('does not ask again if all members were removed during loading', async () => {
    const h = setup();
    const pending = delayedLoad();
    h.loadGame.mockReturnValueOnce(pending.promise);
    const change = h.select('ruby');
    h.setTeam(Array(6).fill(null));
    pending.resolve(success());
    await change;
    expect(h.confirmChange).toHaveBeenCalledTimes(1);
    expect(h.onChange).toHaveBeenCalledWith(ruby);
  });

  it('cancels an older load when a newer game selection is declined', async () => {
    const h = setup();
    const pending = delayedLoad();
    h.loadGame.mockReturnValueOnce(pending.promise);
    h.confirmChange.mockReturnValueOnce(true).mockReturnValueOnce(false);
    const older = h.select('ruby');
    await h.select('sapphire');
    pending.resolve(success());
    await older;
    expect(h.loadGame).toHaveBeenCalledExactlyOnceWith('ruby');
    expect(h.onChange).not.toHaveBeenCalled();
    expect(h.confirmChange).toHaveBeenCalledTimes(2);
    expect(h.state().gameId).toBe('emerald');
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
    expect(h.confirmChange).toHaveBeenCalledTimes(1);
  });

  it('applies only the newest successful request', async () => {
    const h = setup();
    const pending = delayedLoad();
    h.loadGame.mockReturnValueOnce(pending.promise).mockResolvedValueOnce(success(sapphire));
    const older = h.select('ruby');
    await h.select('sapphire');
    pending.resolve(success());
    await older;
    expect(h.onChange).toHaveBeenCalledExactlyOnceWith(sapphire);
    expect(h.state().gameId).toBe('sapphire');
  });

  it('reports load failure without changing the team or asking a second time', async () => {
    const h = setup();
    const before = h.state();
    const error: GameLoadError = { code: 'unknown-game', gameId: 'ruby' };
    h.loadGame.mockResolvedValueOnce({ ok: false, error });
    await h.select('ruby');
    expect(h.onError).toHaveBeenLastCalledWith(error);
    expect(h.onChange).not.toHaveBeenCalled();
    expect(h.confirmChange).toHaveBeenCalledTimes(1);
    expect(h.state()).toBe(before);
  });

  it('does not report an error from an older cancelled request', async () => {
    const h = setup();
    const pending = delayedLoad();
    h.loadGame.mockReturnValueOnce(pending.promise);
    const older = h.select('ruby');
    await h.select(emerald.game.id);
    pending.resolve({ ok: false, error: { code: 'unknown-game', gameId: 'ruby' } });
    await older;
    expect(h.onError.mock.calls.every(([error]) => error === null)).toBe(true);
    expect(h.onChange).not.toHaveBeenCalled();
  });
});
