import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LoadingMark, LoadingNote } from '../src/components/Loading';
import { GameLoadingNotice } from '../src/components/GameLoadingNotice';
import { StartupScreen } from '../src/components/StartupScreen';

describe('Loading states', () => {
  it('draws the Route Six route with six team points and hides the mark from assistive technology', () => {
    const html = renderToStaticMarkup(createElement(LoadingMark, { size: 'lg' }));
    expect(html).toContain('aria-hidden="true"');
    expect(html.match(/class="loading-mark-point"/g)).toHaveLength(6);
    expect(html).toContain('class="loading-mark-runner"');
  });

  it('announces in-page checks as a status with a title and detail', () => {
    const html = renderToStaticMarkup(createElement(LoadingNote, { title: 'Checking team access…', detail: 'Checking without the level limit.' }));
    expect(html).toContain('role="status"');
    expect(html).toContain('<strong>Checking team access…</strong><span>Checking without the level limit.</span>');
  });

  it('names the loading game and uses its accent for the progress bar', () => {
    const html = renderToStaticMarkup(createElement(GameLoadingNotice, { gameId: 'crystal' }));
    expect(html).toContain('role="status"');
    expect(html).toContain('<strong>Loading Pokémon Crystal…</strong>');
    expect(html).toMatch(/--next-accent:oklch\(/);
  });

  it('opens the planner with the Route Six loader', () => {
    const html = renderToStaticMarkup(createElement(StartupScreen));
    expect(html).toContain('class="startup-screen" role="status"');
    expect(html).toContain('<h1>Route Six</h1>');
  });
});
