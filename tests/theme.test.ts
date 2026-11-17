import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ThemeSwitch } from '../src/components/ThemeSwitch';
import {
  applyTheme, parseThemePreference, readThemePreference, resolveTheme, themeColors, themeStorageKey,
  writeThemePreference, type ThemeStorage,
} from '../src/theme/theme';

function memoryStorage(initial: Record<string, string> = {}): ThemeStorage & { values: Record<string, string> } {
  const values = { ...initial };
  return {
    values,
    getItem: key => values[key] ?? null,
    setItem: (key, value) => { values[key] = value; },
    removeItem: key => { delete values[key]; },
  };
}

const blocked = (): ThemeStorage => { throw new DOMException('Blocked', 'SecurityError'); };

describe('theme preference', () => {
  it('starts with System when nothing is stored', () => {
    expect(readThemePreference(() => memoryStorage())).toBe('system');
  });

  it('reads a stored light or dark choice', () => {
    expect(readThemePreference(() => memoryStorage({ [themeStorageKey]: 'dark' }))).toBe('dark');
    expect(readThemePreference(() => memoryStorage({ [themeStorageKey]: 'light' }))).toBe('light');
  });

  it('uses System for unknown values and when storage is unavailable', () => {
    expect(parseThemePreference('sepia')).toBe('system');
    expect(readThemePreference(blocked)).toBe('system');
  });

  it('saves light and dark and removes the key for System', () => {
    const storage = memoryStorage();
    expect(writeThemePreference(() => storage, 'dark')).toEqual({ ok: true });
    expect(storage.values[themeStorageKey]).toBe('dark');
    expect(writeThemePreference(() => storage, 'system')).toEqual({ ok: true });
    expect(storage.values).toEqual({});
  });

  it('reports a failed save instead of throwing', () => {
    expect(writeThemePreference(blocked, 'light')).toMatchObject({ ok: false });
  });

  it('resolves System from the system colour scheme', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('sets data-theme and the browser UI colour', () => {
    const target = { root: { dataset: {} as DOMStringMap }, themeColor: { content: '' } };
    applyTheme(target, 'dark');
    expect(target.root.dataset.theme).toBe('dark');
    expect(target.themeColor.content).toBe(themeColors.dark);
  });
});

describe('inline theme script in index.html', () => {
  const html = readFileSync('index.html', 'utf8');
  const script = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? '';

  function runScript(storage: () => ThemeStorage, systemDark: boolean) {
    const target = { root: { dataset: {} as DOMStringMap }, themeColor: { content: '' } };
    const window = {
      get localStorage() { return storage(); },
      matchMedia: (query: string) => ({ matches: query === '(prefers-color-scheme: dark)' && systemDark }),
    };
    const document = {
      documentElement: target.root,
      querySelector: (selector: string) => selector === 'meta[name="theme-color"]' ? target.themeColor : null,
    };
    new Function('window', 'document', script)(window, document);
    return target;
  }

  it('runs before the stylesheet and the app in the head', () => {
    const head = html.slice(0, html.indexOf('</head>'));
    expect(script).not.toBe('');
    expect(head).toContain(script);
    expect(head.indexOf('name="theme-color"')).toBeLessThan(head.indexOf('<script>'));
  });

  const cases = [
    { stored: undefined, systemDark: false }, { stored: undefined, systemDark: true },
    { stored: 'light', systemDark: true }, { stored: 'dark', systemDark: false },
    { stored: 'sepia', systemDark: true },
  ];
  it.each(cases)('matches the theme helpers: stored $stored, system dark $systemDark', ({ stored, systemDark }) => {
    const storage = () => memoryStorage(stored ? { [themeStorageKey]: stored } : {});
    const theme = resolveTheme(readThemePreference(storage), systemDark);
    const target = runScript(storage, systemDark);
    expect(target.root.dataset.theme).toBe(theme);
    expect(target.themeColor.content).toBe(themeColors[theme]);
  });

  it('follows the system when storage is blocked', () => {
    expect(runScript(blocked, true).root.dataset.theme).toBe('dark');
  });
});

describe('theme stylesheet', () => {
  const css = readFileSync('src/styles.css', 'utf8');

  it('keeps one set of dark tokens behind data-theme', () => {
    expect(css).not.toContain('prefers-color-scheme');
    expect(css.match(/:root\[data-theme="dark"\] \{/g)).toHaveLength(1);
    expect(css).toMatch(/:root\[data-theme="dark"\] \{\s+color-scheme: dark;/);
  });
});

describe('theme switch', () => {
  it('renders three icon radios with names for assistive technology and System checked on the server', () => {
    const html = renderToStaticMarkup(createElement(ThemeSwitch));
    expect(html).toContain('role="radiogroup" aria-label="Colour theme"');
    expect(html.match(/type="radio"/g)).toHaveLength(3);
    expect(html.match(/checked=""/g)).toHaveLength(1);
    expect(html).toMatch(/<input[^>]*checked=""[^>]*value="system"/);
    for (const name of ['Match system', 'Light', 'Dark']) expect(html).toContain(`<span class="sr-only">${name}</span>`);
    // No visible text: every text node sits in an sr-only span.
    expect(html.replace(/<span class="sr-only">[^<]*<\/span>/g, '').replace(/<[^>]+>/g, '')).toBe('');
  });
});
