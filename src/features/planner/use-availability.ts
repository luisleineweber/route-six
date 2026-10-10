import { useEffect, useRef, useState } from 'react';
import type { AvailabilitySnapshot } from '../../domain/types';
import type { PlannerState } from './state';

export function useAvailability(state: PlannerState, enabled = true) {
  const worker = useRef<Worker | null>(null);
  const sequence = useRef(0);
  const [snapshot, setSnapshot] = useState<AvailabilitySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const instance = new Worker(new URL('./availability.worker.ts', import.meta.url), { type: 'module' });
    worker.current = instance;
    instance.onmessage = event => {
      if (event.data.id !== sequence.current) return;
      if (event.data.error || !event.data.result.ok) {
        const message = event.data.error ?? JSON.stringify(event.data.result.error);
        console.error('Availability failed:', message); setError(message); return;
      }
      setError(null); setSnapshot(event.data.result.value);
    };
    instance.onerror = event => { console.error('Availability worker failed:', event.message); setError(event.message || 'The access check failed. Reload the page.'); };
    return () => { instance.terminate(); worker.current = null; };
  }, [enabled]);
  useEffect(() => {
    if (!enabled) return;
    sequence.current++;
    worker.current?.postMessage({ id: sequence.current, query: {
      gameId: state.gameId, milestoneId: state.milestoneId, respectLevelLimit: state.respectLevelLimit,
    } });
  }, [enabled, state.gameId, state.milestoneId, state.respectLevelLimit]);
  const loading = enabled && (!snapshot || snapshot.query.gameId !== state.gameId || snapshot.query.milestoneId !== state.milestoneId || snapshot.query.respectLevelLimit !== state.respectLevelLimit);
  return { snapshot: enabled && !loading ? snapshot : null, loading, error: enabled ? error : null };
}
