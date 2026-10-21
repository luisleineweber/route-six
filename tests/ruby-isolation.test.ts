import { describe, expect, it } from 'vitest';
import { loadGame } from '../src/data/game-loader';
import { solve } from '../src/domain/availability/solve';
import { createInitialState, plannerReducer } from '../src/features/planner/state';

describe('Emerald and Ruby isolation', () => {
  it('uses each game’s reviewed sources at the same route progress', async () => {
    const emerald = await loadGame('emerald');
    const ruby = await loadGame('ruby');
    expect(emerald.ok && ruby.ok).toBe(true);
    if (!emerald.ok || !ruby.ok) throw new Error('Reviewed game load failed');
    const emeraldRoute = emerald.value.milestones.find(milestone => milestone.id === 'route-102');
    const rubyRoute = ruby.value.milestones.find(milestone => milestone.id === 'route-102');
    if (!emeraldRoute || !rubyRoute) throw new Error('Reviewed route milestone is missing');
    const emeraldPaths = solve(emerald.value, emeraldRoute, false).paths.get('surskit');
    const rubyPaths = solve(ruby.value, rubyRoute, false).paths.get('surskit');
    expect(emeraldPaths).toBeUndefined();
    expect(rubyPaths?.length).toBeGreaterThan(0);
    expect(rubyPaths!.every(path =>
      path.sourceIds.every(id => ruby.value.sources.some(source => source.id === id)))).toBe(true);
  }, 60000);

  it('keeps six team positions and shared settings when switching games', async () => {
    const emerald = await loadGame('emerald');
    const ruby = await loadGame('ruby');
    if (!emerald.ok || !ruby.ok) throw new Error('Reviewed game load failed');
    const state = {
      ...createInitialState(emerald.value),
      target: 'whole-game' as const,
      respectLevelLimit: false,
      team: ['treecko', null, 'surskit', null, null, 'latios'],
    };
    const next = plannerReducer(state, {
      type: 'game', gameId: 'ruby', milestoneId: ruby.value.game.planner!.defaultMilestoneId,
      pokemonIds: ruby.value.profiles.map(profile => profile.pokemonId),
    });
    expect(next).toMatchObject({
      gameId: 'ruby', milestoneId: 'victory-road', target: 'whole-game',
      respectLevelLimit: false, team: state.team,
    });
  });
});
