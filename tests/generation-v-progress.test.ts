import { describe, expect, it } from 'vitest';
import { dataset } from './local-data';
import { checkGen5Game } from './gen5-acceptance-checks';
import { getAvailability } from '../src/domain/availability';
import { isProgressReady } from '../src/data/game-catalogue';
import { createInitialState, plannerReducer } from '../src/features/planner/state';

describe.each(['black', 'white', 'black-2', 'white-2'])('%s native Progress Planner', id => {
  const game = dataset.games.find(row => row.game.id === id)!;

  it('passes the native source, form, choice, resource and checkpoint checks', () => {
    expect(isProgressReady(id)).toBe(true);
    expect(checkGen5Game(game).checkpoints).toHaveLength(9);
  }, 180_000);

  it('returns public access results at all nine checkpoints', () => {
    const caps = id.endsWith('-2') ? [13, 18, 24, 30, 33, 39, 48, 51, 58] : [14, 20, 23, 27, 31, 35, 39, 43, 50];
    game.game.planner!.checkpoints.forEach((point, index) => {
      const result = getAvailability(dataset, { gameId: id, milestoneId: point.milestoneId, respectLevelLimit: true });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.levelLimit?.level).toBe(caps[index]);
      expect(result.value.entries.snivy.status).toBe('available');
      expect(result.value.entries.mew.status).toBe('unavailable');
      expect(result.value.entries.conkeldurr.status).toBe('unavailable');
      expect(result.value.entries[id.endsWith('-2') ? 'regigigas' : 'landorus'].status).toBe('blocked');
    });
  }, 240_000);

  it('uses the shared six slots and resets them on a game change', () => {
    let state = createInitialState(game);
    for (const pokemonId of ['snivy', 'tepig', 'oshawott', 'patrat', 'lillipup', 'purrloin']) {
      state = plannerReducer(state, { type: 'add', pokemonId, slot: null });
    }
    expect(state.team.filter(Boolean)).toHaveLength(6);
    const changed = plannerReducer(state, { type: 'settings', values: { respectLevelLimit: false } });
    expect(changed.team).toBe(state.team);
    const switched = plannerReducer(changed, { type: 'game', gameId: 'emerald', milestoneId: 'starter' });
    expect(switched.team).toEqual(Array(6).fill(null));
  });
});
