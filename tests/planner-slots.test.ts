import { expect, it } from 'vitest';
import { plannerReducer, type PlannerState } from '../src/features/planner/state';

it('fills, replaces, removes, and refills the six team slots', () => {
  let state: PlannerState = {
    gameId: 'emerald', milestoneId: 'victory-road', respectLevelLimit: true,
    target: 'current-progress', team: Array(6).fill(null),
  };
  for (const pokemonId of ['a', 'b', 'c', 'd', 'e', 'f']) {
    state = plannerReducer(state, { type: 'add', pokemonId, slot: null });
  }
  expect(state.team).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  expect(plannerReducer(state, { type: 'add', pokemonId: 'g', slot: null })).toBe(state);
  state = plannerReducer(state, { type: 'add', pokemonId: 'g', slot: 2 });
  expect(state.team).toEqual(['a', 'b', 'g', 'd', 'e', 'f']);
  state = plannerReducer(state, { type: 'remove', slot: 2 });
  expect(state.team).toEqual(['a', 'b', null, 'd', 'e', 'f']);
  state = plannerReducer(state, { type: 'add', pokemonId: 'h', slot: null });
  expect(state.team).toEqual(['a', 'b', 'h', 'd', 'e', 'f']);
});
