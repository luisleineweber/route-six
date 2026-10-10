import type { GameData } from '../../domain/types';

const emeraldStoryBattles = new Set([
  'pokedex', 'rival-110', 'maxie-chimney', 'rival-119', 'maxie-hideout',
  'space-center', 'archie', 'weather-resolved', 'victory-road', 'steven-rematch',
]);

export function progressCheckpoints(game: GameData) {
  return game.milestones.filter(milestone => milestone.id === game.game.firstMilestoneId
    || milestone.id === 'league'
    || milestone.kind === 'boss'
    || (game.game.id === 'emerald' && emeraldStoryBattles.has(milestone.id)))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}
