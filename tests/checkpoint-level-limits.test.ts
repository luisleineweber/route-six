import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import { progressCheckpointOptions } from '../src/features/planner/progress-checkpoints';
import { dataset } from './local-data';

const plannedGames = dataset.games.filter(game => game.game.planner !== null);

describe('Checkpoint level limits', () => {
  it.each(plannedGames.map(game => [game.game.id, game] as const))('%s uses the selected Gym Leader for each Gym checkpoint', (_id, game) => {
    const gymPoints = progressCheckpointOptions(game).filter(point => point.title.startsWith('Gym '));
    const leaders = gymPoints.map(point => {
      const milestone = game.milestones.find(m => m.id === point.id)!;
      const boss = game.bosses.find(b => b.id === milestone.nextBossId);
      return { checkpoint: point.title, kind: boss?.kind, typeId: boss?.kind === 'gym' ? boss.specialtyTypeId : null, bossId: boss?.id };
    });
    expect(leaders.map(({ checkpoint, kind, typeId }) => ({ checkpoint, kind, typeId })))
      .toEqual(gymPoints.map(point => ({ checkpoint: point.title, kind: 'gym', typeId: point.typeId })));
    expect(new Set(leaders.map(leader => leader.bossId)).size).toBe(8);
  });

  it('shows Brawly for the Emerald Gym 2 checkpoint', () => {
    const result = getAvailability(dataset, { gameId: 'emerald', milestoneId: 'brawly-defeated', respectLevelLimit: true });
    expect(result.ok && result.value.levelLimit).toEqual({ bossId: 'brawly', level: 19 });
  }, 120_000);
});
