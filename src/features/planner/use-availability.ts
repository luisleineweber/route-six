import { useEffect, useRef, useState } from 'react';
import type { AvailabilitySnapshot } from '../../domain/types';
import type { PlannerState } from './state';

type AccessResult = { key: string; snapshot: AvailabilitySnapshot; error?: never }
  | { key: string; error: string; snapshot?: never };

export function useAvailability(state: PlannerState, enabled = true) {
  const worker = useRef<Worker | null>(null);
  const sequence = useRef(0);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<AccessResult | null>(null);
  const { gameId, milestoneId, respectLevelLimit } = state;
  const key = JSON.stringify([gameId, milestoneId, respectLevelLimit, attempt]);

  useEffect(() => {
    if (!enabled || milestoneId === null) return;
    const id = ++sequence.current;
    function fail(message: string) {
      console.error('Availability failed:', message);
      worker.current?.terminate();
      worker.current = null;
      setResult({ key, error: message });
    }
    try {
      const instance = worker.current ?? new Worker(new URL('./availability.worker.ts', import.meta.url), { type: 'module' });
      worker.current = instance;
      instance.onmessage = event => {
        if (worker.current !== instance || event.data.id !== id || sequence.current !== id) return;
        const { error, result } = event.data;
        if (error || !result.ok) fail(error ?? JSON.stringify(result.error));
        else setResult({ key, snapshot: result.value });
      };
      instance.onerror = event => {
        if (worker.current === instance && sequence.current === id) fail(event.message || 'The access check failed.');
      };
      instance.onmessageerror = () => {
        if (worker.current === instance && sequence.current === id) fail('The access check returned unreadable data.');
      };
      instance.postMessage({ id, query: { gameId, milestoneId, respectLevelLimit } });
    } catch (error) {
      fail(error instanceof Error ? error.message : String(error));
    }
    return () => { sequence.current++; };
  }, [enabled, gameId, milestoneId, respectLevelLimit, key]);

  useEffect(() => () => {
    worker.current?.terminate();
    worker.current = null;
  }, []);

  const active = enabled && milestoneId !== null;
  const current = active && result?.key === key ? result : null;
  return {
    snapshot: current?.snapshot ?? null,
    loading: active && current === null,
    error: current?.error ?? null,
    retry: () => setAttempt(value => value + 1),
  };
}
