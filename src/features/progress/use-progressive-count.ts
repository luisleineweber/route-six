import { startTransition, useEffect, useState } from 'react';

/** Cards in the first paint. Enough to fill a desktop screen. */
export const firstBatchSize = 48;
/** Cards added per later step. */
export const nextBatchSize = 96;

/**
 * Renders a long list in steps so a game switch or filter change paints quickly.
 * The full list still renders a few frames later, so page search keeps working.
 * Only a new `resetKey` starts again from the first batch. A data update with the
 * same key keeps the rendered cards, so the scroll position does not jump.
 */
export function useProgressiveCount(total: number, resetKey: string): number {
  const [progress, setProgress] = useState({ resetKey, count: firstBatchSize });
  let { count } = progress;
  if (progress.resetKey !== resetKey) {
    count = firstBatchSize;
    setProgress({ resetKey, count });
  }
  useEffect(() => {
    if (count >= total) return;
    const timer = setTimeout(() => startTransition(() => setProgress(current => current.resetKey === resetKey
      ? { resetKey, count: current.count + nextBatchSize }
      : current)), 0);
    return () => clearTimeout(timer);
  }, [total, count, resetKey]);
  return Math.min(count, total);
}
