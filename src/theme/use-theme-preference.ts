import { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  applyTheme, darkSchemeQuery, readThemePreference, resolveTheme, writeThemePreference,
  type ThemePreference,
} from './theme';

const storage = () => window.localStorage;
const listeners = new Set<() => void>();
// The page keeps the choice in memory too, so it still works when storage fails.
let current: ThemePreference | null = null;

function preference() {
  current ??= readThemePreference(storage);
  return current;
}

function applyPreference(choice: ThemePreference) {
  const theme = resolveTheme(choice, window.matchMedia(darkSchemeQuery).matches);
  applyTheme({ root: document.documentElement, themeColor: document.querySelector<HTMLMetaElement>('meta[name="theme-color"]') }, theme);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/**
 * The prerendered page has no stored choice, so the server snapshot is System.
 * React then renders the stored choice after hydration without a mismatch.
 */
export function useThemePreference() {
  const choice = useSyncExternalStore(subscribe, preference, () => 'system' as const);

  useEffect(() => {
    if (choice !== 'system') return;
    const list = window.matchMedia(darkSchemeQuery);
    const follow = () => applyPreference('system');
    list.addEventListener('change', follow);
    return () => list.removeEventListener('change', follow);
  }, [choice]);

  const select = useCallback((next: ThemePreference) => {
    current = next;
    applyPreference(next);
    const saved = writeThemePreference(storage, next);
    if (!saved.ok) console.warn('The colour theme applies to this visit only. The browser did not save it.', saved.error);
    listeners.forEach(listener => listener());
  }, []);

  return [choice, select] as const;
}
