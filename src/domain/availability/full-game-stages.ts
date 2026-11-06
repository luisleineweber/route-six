import type { Boss, GameData, ProgressCheckpoint } from '../types';
import { ancestors } from './context';

export interface FullGameStage {
  id: string;
  title: string;
  detail: string;
  milestoneId: string;
  bossId: string;
  level: number;
  typeId: string | null;
  reachedIds: string[];
}

/** Each stage includes possible optional visits before its battle, not its reward. */
export function fullGameStages(game: GameData): FullGameStage[] {
  if (!game.game.planner) return [];
  const checkpoints = game.game.planner.checkpoints;
  const gymPoints = checkpoints.filter(point => point.typeId !== null);
  // Checkpoint metadata identifies the leader. Mandatory prerequisites can
  // include several Gym branches and cannot identify one leader by order.
  const gyms = gymPoints.map(checkpoint => {
    const boss = game.bosses.find(boss => boss.kind === 'gym'
      && boss.specialtyTypeId === checkpoint.typeId && checkpoint.detail.includes(boss.name));
    if (!boss) throw new Error(`Missing Gym leader for ${checkpoint.milestoneId}.`);
    return boss;
  });
  const leagueMilestone = game.milestones.filter(point => point.phase === 'main-story'
    && game.bosses.some(boss => boss.id === point.nextBossId && boss.kind === 'elite-four'))
    .sort((a, b) => a.displayOrder - b.displayOrder)[0];
  const leagueBoss = game.bosses.find(boss => boss.id === leagueMilestone?.nextBossId);
  const battles: { boss: Boss; checkpoint: ProgressCheckpoint | undefined }[] = gyms.map((boss, index) => ({ boss, checkpoint: gymPoints[index] }));
  if (leagueBoss) battles.push({ boss: leagueBoss, checkpoint: { milestoneId: leagueMilestone.id, title: 'League', label: 'League', detail: 'Elite Four & Champion', typeId: null } });
  const stages: FullGameStage[] = [];
  for (const [index, { boss, checkpoint }] of battles.entries()) {
    if (!checkpoint) throw new Error(`Missing full-game checkpoint for ${boss.id}.`);
    const allowedBosses = new Set(battles.slice(0, index + 1).map(battle => battle.boss.id));
    const forbidden = new Set(gymPoints.slice(index).filter((point, offset) => {
      const milestone = game.milestones.find(milestone => milestone.id === point.milestoneId)!;
      return milestone.kind === 'boss' || milestone.nextBossId !== gyms[index + offset].id;
    }).map(point => point.milestoneId));
    const points = game.milestones.filter(point => point.phase === 'main-story'
      && point.nextBossId !== null && allowedBosses.has(point.nextBossId)
      && ![...ancestors(game, point.id)].some(id => forbidden.has(id)));
    const battlePoint = game.milestones.find(point => point.id === checkpoint.milestoneId)!;
    const before = (battlePoint.kind === 'boss' || battlePoint.nextBossId !== boss.id ? battlePoint.previousIds.map(id => game.milestones.find(point => point.id === id)!) : [battlePoint])
      .sort((a, b) => b.displayOrder - a.displayOrder)[0];
    if (!before) throw new Error(`Missing pre-battle progress for ${boss.id}.`);
    stages.push({ id: checkpoint.milestoneId, title: boss.kind === 'gym' ? checkpoint.title : 'League',
      detail: boss.kind === 'gym' ? boss.name : 'Elite Four & Champion', milestoneId: before.id,
      bossId: boss.id, level: boss.highestLevel, typeId: checkpoint.typeId, reachedIds: points.map(point => point.id) });
  }
  return stages;
}
