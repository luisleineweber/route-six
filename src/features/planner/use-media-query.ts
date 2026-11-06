import { useSyncExternalStore } from 'react';

/** Matches the sidebar breakpoint (60rem) in styles.css. */
export const wideLayout = '(min-width: 60rem)';

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    notify => {
      const list = window.matchMedia(query);
      list.addEventListener('change', notify);
      return () => list.removeEventListener('change', notify);
    },
    () => window.matchMedia(query).matches,
  );
}
