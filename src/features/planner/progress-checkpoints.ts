import type { GameData } from '../../domain/types';

export function progressCheckpoints(game: GameData) {
  const gymBattles = new Set(game.bosses.filter(boss => boss.kind === 'gym').map(boss => `${boss.id}-defeated`));
  return game.milestones.filter(milestone => gymBattles.has(milestone.id) || milestone.id === 'victory-road')
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function progressCheckpointOptions(game: GameData) {
  return progressCheckpoints(game).map(milestone => {
    if (milestone.id === 'victory-road') return {
      id: milestone.id, label: 'Victory Road', title: 'Victory Road', detail: 'Before the League', typeId: null,
    };
    const gym = game.bosses.find(boss => `${boss.id}-defeated` === milestone.id);
    if (gym?.kind !== 'gym') throw new Error(`Missing Gym for progress point: ${milestone.id}`);
    const type = gym.specialtyTypeId[0].toUpperCase() + gym.specialtyTypeId.slice(1);
    return {
      id: milestone.id, label: `Gym ${gym.badgeNumber} · ${type} · ${gym.name}`,
      title: `Gym ${gym.badgeNumber}`, detail: `${gym.name} · ${type}`, typeId: gym.specialtyTypeId,
    };
  });
}

export type ProgressCheckpointOption = ReturnType<typeof progressCheckpointOptions>[number];
