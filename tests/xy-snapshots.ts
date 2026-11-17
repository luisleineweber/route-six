import { dataset } from './local-data';
import { solve } from '../src/domain/availability/solve';
import type { AvailabilitySnapshot } from '../src/domain/types';

export const xyGameIds = ['x', 'y'] as const;

/** Build the X or Y snapshot at Kiloude City without the level limit, with every solved path current. */
export function kiloudeSnapshot(id: (typeof xyGameIds)[number]): AvailabilitySnapshot {
  const game = dataset.games.find(row => row.game.id === id)!;
  const ctx = solve(game, game.milestones.find(row => row.id === 'kiloude')!, false);
  const snapshot: AvailabilitySnapshot = {
    query: { gameId: id, milestoneId: 'kiloude', respectLevelLimit: false },
    levelLimit: null, entries: {}, paths: {}, choiceGroups: game.choices,
    resourceLimits: ctx.resourceLimits,
  };
  for (const [selection, paths] of ctx.paths) {
    for (const path of paths) snapshot.paths[path.id] = path;
    snapshot.entries[selection] = { pokemonId: paths[0].pokemonId, status: 'available',
      currentPathIds: paths.map(path => path.id), futurePathIds: [], firstMilestoneIds: [], blockers: [] };
  }
  return snapshot;
}
