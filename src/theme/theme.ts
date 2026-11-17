/**
 * Colour theme rules. The inline script in index.html applies the same rules
 * before the first paint; tests/theme.test.ts runs that script against these
 * functions, so keep both in step.
 */
export type Theme = 'light' | 'dark';
/** Without a stored choice, the page follows the system colour scheme. */
export type ThemePreference = 'system' | Theme;

export const themeStorageKey = 'route-six-theme';
export const darkSchemeQuery = '(prefers-color-scheme: dark)';
/** Browser UI colours for each theme. The values match the page backgrounds. */
export const themeColors: Record<Theme, string> = { light: '#fbfcfb', dark: '#0f0f0f' };

export type ThemeStorage = Pick<Storage, 'getItem' | 'setItem'>;
export type StorageResult = { ok: true } | { ok: false; error: unknown };

/** Stored values other than light and dark mean the player follows the system. */
export function parseThemePreference(value: string | null): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system';
}

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): Theme {
  if (preference !== 'system') return preference;
  return systemPrefersDark ? 'dark' : 'light';
}

export type SchemeQuery = {
  matches: boolean;
  addEventListener(type: 'change', listener: () => void): void;
  removeEventListener(type: 'change', listener: () => void): void;
};

/**
 * Shows the system theme now and on each system change while the choice is
 * System. The app loads code and game data before it mounts the toggle, so the
 * first sync catches a system change from that wait. Returns the cleanup.
 */
export function followSystemTheme(query: SchemeQuery, preference: () => ThemePreference, show: (theme: Theme) => void) {
  const sync = () => { if (preference() === 'system') show(resolveTheme('system', query.matches)); };
  query.addEventListener('change', sync);
  sync();
  return () => query.removeEventListener('change', sync);
}

export function oppositeTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark';
}

/**
 * Reads the stored choice. The storage getter itself can throw, for example
 * when site data is blocked, so the caller passes a function.
 */
export function readThemePreference(storage: () => ThemeStorage): ThemePreference {
  try {
    return parseThemePreference(storage().getItem(themeStorageKey));
  } catch {
    return 'system';
  }
}

export function writeTheme(storage: () => ThemeStorage, theme: Theme): StorageResult {
  try {
    storage().setItem(themeStorageKey, theme);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

export type ThemeTarget = {
  root: { dataset: DOMStringMap };
  themeColor: { content: string } | null;
};

/** The stylesheet reads data-theme for the tokens, color-scheme, and the toggle icon. */
export function applyTheme(target: ThemeTarget, theme: Theme) {
  target.root.dataset.theme = theme;
  if (target.themeColor) target.themeColor.content = themeColors[theme];
}
