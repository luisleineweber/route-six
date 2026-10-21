import { sharedData } from '../../data/dataset';
import { gameLoadMessage, loadGame } from '../../data/game-loader';
import { getAvailability } from '../../domain/availability';
import type { AvailabilityQuery, AvailabilitySnapshot } from '../../domain/types';

const maxCachedSnapshots = 12;
const snapshots = new Map<string, AvailabilitySnapshot>();

function queryKey(query: AvailabilityQuery): string {
  return JSON.stringify([query.gameId, query.milestoneId, query.respectLevelLimit]);
}

function rememberSnapshot(key: string, snapshot: AvailabilitySnapshot): void {
  snapshots.delete(key);
  snapshots.set(key, snapshot);
  if (snapshots.size > maxCachedSnapshots) {
    const oldestKey = snapshots.keys().next().value;
    if (oldestKey !== undefined) snapshots.delete(oldestKey);
  }
}

self.onmessage = async (event: MessageEvent<{ id: number; query: AvailabilityQuery }>) => {
  try {
    const { id, query } = event.data;
    const key = queryKey(query);
    const cached = snapshots.get(key);
    if (cached) {
      snapshots.delete(key);
      snapshots.set(key, cached);
      self.postMessage({ id, result: { ok: true, value: cached } });
      return;
    }

    const loaded = await loadGame(query.gameId);
    if (!loaded.ok) {
      self.postMessage({ id, error: gameLoadMessage(loaded.error) }); return;
    }
    const result = getAvailability({ ...sharedData, games: [loaded.value] }, query);
    if (result.ok) rememberSnapshot(key, result.value);
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id: event.data.id, error: error instanceof Error ? error.message : String(error) });
  }
};
