import { readdirSync, readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ThemeToggle } from '../src/components/ThemeToggle';
import {
  applyTheme, followSystemTheme, oppositeTheme, parseThemePreference, readThemePreference, resolveTheme, themeColors, themeStorageKey,
  writeTheme, type ThemeStorage,
} from '../src/theme/theme';

function memoryStorage(initial: Record<string, string> = {}): ThemeStorage & { values: Record<string, string> } {
  const values = { ...initial };
  return {
    values,
    getItem: key => values[key] ?? null,
    setItem: (key, value) => { values[key] = value; },
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

  it('saves the chosen theme', () => {
    const storage = memoryStorage();
    expect(writeTheme(() => storage, 'dark')).toEqual({ ok: true });
    expect(readThemePreference(() => storage)).toBe('dark');
    expect(writeTheme(() => storage, 'light')).toEqual({ ok: true });
    expect(storage.values[themeStorageKey]).toBe('light');
  });

  it('reports a failed save instead of throwing', () => {
    expect(writeTheme(blocked, 'light')).toMatchObject({ ok: false });
  });

  it('switches to the other theme', () => {
    expect(oppositeTheme('light')).toBe('dark');
    expect(oppositeTheme('dark')).toBe('light');
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

describe('following the system theme', () => {
  function fakeQuery(matches: boolean) {
    const listeners = new Set<() => void>();
    return {
      matches, listeners,
      addEventListener: (_: 'change', listener: () => void) => { listeners.add(listener); },
      removeEventListener: (_: 'change', listener: () => void) => { listeners.delete(listener); },
      change(next: boolean) { this.matches = next; listeners.forEach(listener => listener()); },
    };
  }

  it('catches a system change from before the toggle mounted', () => {
    const shown: string[] = [];
    // The inline script showed light; the system turned dark while the app loaded.
    followSystemTheme(fakeQuery(true), () => 'system', theme => shown.push(theme));
    expect(shown).toEqual(['dark']);
  });

  it('follows later system changes and stops after cleanup', () => {
    const query = fakeQuery(false);
    const shown: string[] = [];
    const stop = followSystemTheme(query, () => 'system', theme => shown.push(theme));
    query.change(true);
    stop();
    query.change(false);
    expect(shown).toEqual(['light', 'dark']);
    expect(query.listeners.size).toBe(0);
  });

  it('keeps a chosen theme when the system changes', () => {
    const query = fakeQuery(false);
    const shown: string[] = [];
    followSystemTheme(query, () => 'light', theme => shown.push(theme));
    query.change(true);
    expect(shown).toEqual([]);
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

  // Component sheets must follow the chosen theme too, not the system setting.
  it.each(readdirSync('src/styles').filter(file => file.endsWith('.css')))('follows data-theme instead of the system scheme in %s', file => {
    expect(readFileSync(`src/styles/${file}`, 'utf8')).not.toContain('prefers-color-scheme');
  });
});

describe('theme toggle', () => {
  it('renders one icon-only toggle button with a name for assistive technology', () => {
    const html = renderToStaticMarkup(createElement(ThemeToggle));
    expect(html.match(/<button/g)).toHaveLength(1);
    expect(html).toContain('class="theme-toggle" aria-label="Dark theme" aria-pressed="false"');
    expect(html).toContain('class="lucide lucide-moon theme-toggle-moon"');
    expect(html).toContain('class="lucide lucide-sun theme-toggle-sun"');
    // No visible text: the button holds only the two icons.
    expect(html.replace(/<[^>]+>/g, '')).toBe('');
  });

  it('shows the icon of the other theme from data-theme, before hydration', () => {
    const css = readFileSync('src/styles/header.css', 'utf8');
    expect(css).toContain('.theme-toggle-sun, :root[data-theme="dark"] .theme-toggle-moon { display: none; }');
    expect(css).toContain(':root[data-theme="dark"] .theme-toggle-sun { display: block; }');
  });
});
