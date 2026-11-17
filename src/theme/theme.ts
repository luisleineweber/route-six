/**
 * Colour theme rules. The inline script in index.html applies the same rules
 * before the first paint; tests/theme.test.ts runs that script against these
 * functions, so keep both in step.
 */
export type ThemePreference = 'system' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

export const themePreferences: readonly ThemePreference[] = ['system', 'light', 'dark'];
export const themeStorageKey = 'route-six-theme';
export const darkSchemeQuery = '(prefers-color-scheme: dark)';
/** Browser UI colours for each theme. The values match the page backgrounds. */
export const themeColors: Record<Theme, string> = { light: '#fbfcfb', dark: '#0f0f0f' };

export type ThemeStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type StorageResult = { ok: true } | { ok: false; error: unknown };

/** Stored values other than light and dark mean the player follows the system. */
export function parseThemePreference(value: string | null): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system';
}

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): Theme {
  if (preference !== 'system') return preference;
  return systemPrefersDark ? 'dark' : 'light';
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

/** System is the default, so it removes the stored value instead of saving it. */
export function writeThemePreference(storage: () => ThemeStorage, preference: ThemePreference): StorageResult {
  try {
    if (preference === 'system') storage().removeItem(themeStorageKey);
    else storage().setItem(themeStorageKey, preference);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

export type ThemeTarget = {
  root: { dataset: DOMStringMap };
  themeColor: { content: string } | null;
};

/** The stylesheet reads data-theme for the tokens and color-scheme. */
export function applyTheme(target: ThemeTarget, theme: Theme) {
  target.root.dataset.theme = theme;
  if (target.themeColor) target.themeColor.content = themeColors[theme];
}
