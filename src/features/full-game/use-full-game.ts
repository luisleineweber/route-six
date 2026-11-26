import { useEffect, useState } from 'react';
import type { AvailabilitySnapshot } from '../../domain/types';

export function useFullGame(gameId: string, respectLevelLimit: boolean, enabled: boolean) {
  const [result, setResult] = useState<{ key: string; snapshots: Record<string, AvailabilitySnapshot>; error: string | null }>({ key: '', snapshots: {}, error: null });
  const key = JSON.stringify([gameId, respectLevelLimit]);
  useEffect(() => {
    if (!enabled) return;
    const worker = new Worker(new URL('./full-game.worker.ts', import.meta.url), { type: 'module' });
    setResult({ key, snapshots: {}, error: null });
    const fail = (message: string) => {
      console.error('Full-game access failed:', message);
      setResult(current => ({ ...current, error: message }));
      worker.terminate();
    };
    worker.onmessage = event => {
      if (event.data.error) { fail(event.data.error); return; }
      setResult(current => ({ ...current, snapshots: { ...current.snapshots, [event.data.stageId]: event.data.snapshot } }));
    };
    worker.onerror = event => fail(event.message || 'The stage check failed. Reload the guide to retry.');
    worker.postMessage({ gameId, respectLevelLimit });
    return () => worker.terminate();
  }, [key, enabled, gameId, respectLevelLimit]);
  return result.key === key ? result : { snapshots: {} as Record<string, AvailabilitySnapshot>, error: null };
}
