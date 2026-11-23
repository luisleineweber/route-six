import type { ReactElement } from 'react';
import { loadStartGame, PlannerRoot } from './PlannerRoot';

/**
 * Build-time entry for the static start page. It returns the element only:
 * scripts/prerender.ts renders it with react-dom/server. Effects, workers,
 * and other browser APIs do not run during that render.
 */
export async function startPage(): Promise<ReactElement> {
  return <PlannerRoot game={await loadStartGame()} />;
}
