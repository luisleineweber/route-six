import { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  applyTheme, darkSchemeQuery, followSystemTheme, oppositeTheme, readThemePreference, writeTheme,
  type Theme, type ThemePreference,
} from './theme';

const storage = () => window.localStorage;
const listeners = new Set<() => void>();
// The page keeps the choice in memory too, so it still works when storage fails.
let preference: ThemePreference | null = null;

/** The inline script in index.html sets data-theme before React starts. */
function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function show(theme: Theme) {
  applyTheme({ root: document.documentElement, themeColor: document.querySelector<HTMLMetaElement>('meta[name="theme-color"]') }, theme);
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/**
 * The prerendered page cannot know the theme, so the server snapshot is light.
 * React renders the real theme after hydration without a mismatch. The toggle
 * icon reads data-theme in CSS, so it is correct before hydration too.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => 'light' as const);

  useEffect(() => followSystemTheme(window.matchMedia(darkSchemeQuery), () => preference ??= readThemePreference(storage), show), []);

  const toggle = useCallback(() => {
    const next = oppositeTheme(currentTheme());
    preference = next;
    show(next);
    const saved = writeTheme(storage, next);
    if (!saved.ok) console.warn('The colour theme applies to this visit only. The browser did not save it.', saved.error);
  }, []);

  return [theme, toggle] as const;
}
