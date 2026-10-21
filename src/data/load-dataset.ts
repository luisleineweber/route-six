import { rawSharedData } from './shared-data';
import { gameLoaders } from './game-registry';

/** Full assembly is for build checks and tests. The app loads one game at a time. */
export async function loadRawDataset(): Promise<unknown> {
  const games = await Promise.all(Object.entries(gameLoaders).map(async ([id, load]) => {
    const game = await load();
    if ((game as { game?: { id?: string } } | null)?.game?.id !== id) {
      throw new Error(`Game registry ID does not match its local data: ${id}`);
    }
    return game;
  }));
  return { ...rawSharedData, games };
}
