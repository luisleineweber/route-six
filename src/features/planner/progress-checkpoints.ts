import type { GameData } from '../../domain/types';

export function progressCheckpoints(game: GameData) {
  if (game.game.planner === null) return [];
  const ids = new Set(game.game.planner.checkpoints.map(point => point.milestoneId));
  return game.milestones.filter(milestone => ids.has(milestone.id))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function progressCheckpointOptions(game: GameData) {
  const planner = game.game.planner;
  if (planner === null) return [];
  return progressCheckpoints(game).map(milestone => {
    const { milestoneId, ...option } = planner.checkpoints.find(point => point.milestoneId === milestone.id)!;
    return { id: milestoneId, ...option };
  });
}

export type ProgressCheckpointOption = ReturnType<typeof progressCheckpointOptions>[number];
