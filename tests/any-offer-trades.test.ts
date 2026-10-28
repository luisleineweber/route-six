import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import { checkTeam } from '../src/domain/team/check-team';
import { solve } from '../src/domain/availability/solve';
import { validateDataset } from '../src/data/validate-dataset';
import { fixture, none, source } from './fixtures';

describe('NPC trades with no species restriction', () => {
  it('consumes a real offer and keeps the fixed receiving level', () => {
    const { data, game } = fixture(['treecko', 'wurmple']);
    for (const profile of game.profiles) delete profile.regionalDex;
    source(game, 'offer', 'treecko', 5, none, { maxUses: 1 });
    source(game, 'npc', 'wurmple', 50, none, {
      details: { kind: 'game-trade', offeredPokemonId: null }, maxUses: 1,
    });
    expect(validateDataset(data).ok).toBe(true);
    const result = getAvailability(data, { gameId: 'emerald', milestoneId: 'start', respectLevelLimit: false });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.entries.wurmple.status).toBe('available');
    const path = result.value.paths[result.value.entries.wurmple.currentPathIds[0]];
    expect(path.minimumLevel).toBe(50);
    expect(path.sourceIds).toContain('offer');
    expect(checkTeam(result.value, ['treecko', 'wurmple'], 'current-progress').feasible).toBe(false);
  });

  it('uses one repeatable offer without growing repeatable trade chains', () => {
    const { game } = fixture(['treecko', 'wurmple', 'ralts']);
    source(game, 'offer', 'treecko', 5);
    for (const id of ['wurmple', 'ralts']) source(game, `npc-${id}`, id, 50, none, {
      details: { kind: 'game-trade', offeredPokemonId: null },
    });
    const ctx = solve(game, game.milestones[0], false);
    expect(ctx.paths.get('wurmple')).toHaveLength(2);
    expect(ctx.paths.get('ralts')).toHaveLength(2);
    expect(ctx.paths.get('wurmple')!.every(path => path.sourceIds.includes('offer'))).toBe(true);
  });

  it('cannot create its own first offer', () => {
    const { game } = fixture(['wurmple']);
    source(game, 'npc', 'wurmple', 50, none, { details: { kind: 'game-trade', offeredPokemonId: null } });
    expect(solve(game, game.milestones[0], false).paths.size).toBe(0);
  });
});
