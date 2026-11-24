// @vitest-environment happy-dom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AvailabilityQuery, AvailabilitySnapshot } from '../src/domain/types';
import { emerald } from './local-data';
import App from '../src/App';
import { GameContext } from '../src/features/planner/GameContext';
import { PokemonCatalogueCard } from '../src/features/progress/PokemonCatalogueCard';
import { SwapTeamDialog } from '../src/features/team/SwapTeamDialog';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const card = (canAdd: boolean) => renderToStaticMarkup(createElement(GameContext, { value: emerald },
  createElement(PokemonCatalogueCard, {
    pokemonId: 'silcoon', progressPage: false, activeSlot: null,
    canAdd, onAdd: () => {}, onSwap: () => {}, onDetails: () => {},
  })));

const swapChoices = (pokemonId: string, team: string[]) => {
  const html = renderToStaticMarkup(createElement(GameContext, { value: emerald },
    createElement(SwapTeamDialog, { pokemonId, team, onSwap: () => {}, onClose: () => {} })));
  return [...html.matchAll(/<button type="button" class="swap-option"([^>]*)aria-label="([^"]+)"/g)]
    .map(([, attributes, label]) => `${label}${attributes.includes('disabled') ? ' (disabled)' : ''}`);
};

const fullTeam = ['swampert', 'gardevoir', 'aggron', 'altaria', 'roselia', 'absol'];

describe('swapping into a full team', () => {
  it('shows the add button while the team has room', () => {
    const html = card(true);
    expect(html).toContain('aria-label="Add Silcoon to team"');
    expect(html).not.toContain('swap-button');
  });

  it('shows a swap button instead of the add button when the team is full', () => {
    const html = card(false);
    expect(html).toContain('aria-label="Swap Silcoon into team"');
    expect(html).not.toContain('Add Silcoon to team');
  });

  it('lists every team member as a swap choice by slot', () => {
    expect(swapChoices('silcoon', fullTeam)).toEqual([
      'Replace Swampert in slot 1', 'Replace Gardevoir in slot 2', 'Replace Aggron in slot 3',
      'Replace Altaria in slot 4', 'Replace Roselia in slot 5', 'Replace Absol in slot 6',
    ]);
  });

  it('disables only the slots that already hold the incoming Pokémon', () => {
    expect(swapChoices('absol', ['absol', 'gardevoir', 'aggron', 'altaria', 'roselia', 'absol'])).toEqual([
      'Absol is already in slot 1 (disabled)', 'Replace Gardevoir in slot 2', 'Replace Aggron in slot 3',
      'Replace Altaria in slot 4', 'Replace Roselia in slot 5', 'Absol is already in slot 6 (disabled)',
    ]);
  });

  it('explains that no slot can change when every slot holds the incoming Pokémon', () => {
    const html = renderToStaticMarkup(createElement(GameContext, { value: emerald },
      createElement(SwapTeamDialog, { pokemonId: 'absol', team: Array(6).fill('absol'), onSwap: () => {}, onClose: () => {} })));
    expect(html).toContain('<p id="swap-hint">Every slot already has Absol.</p>');
    expect(html).toContain('aria-label="Cancel swap"');
    expect(swapChoices('absol', Array(6).fill('absol')).every(choice => choice.endsWith('(disabled)'))).toBe(true);
  });
});

describe('focus after a swap', () => {
  let root: ReturnType<typeof createRoot> | null = null;
  afterEach(() => { act(() => root?.unmount()); root = null; document.body.innerHTML = ''; vi.unstubAllGlobals(); });

  const button = (label: string, scope: ParentNode = document) => {
    const element = scope.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
    if (!element) throw new Error(`Missing button: ${label}`);
    return element;
  };
  const click = (element: HTMLElement) => act(() => { element.click(); });

  const renderApp = () => {
    const container = document.body.appendChild(document.createElement('div'));
    root = createRoot(container);
    act(() => root!.render(createElement(App, { initialGame: emerald })));
    return document.getElementById('pokemon-search')!;
  };

  const useAccessWorker = () => {
    type Reply = { id: number; error: string } | { id: number; result: { ok: true; value: AvailabilitySnapshot } };
    const requests: { id: number; query: AvailabilityQuery; respond: (reply: Reply) => void }[] = [];
    vi.stubGlobal('Worker', class {
      onmessage?: (event: { data: Reply }) => void;
      postMessage(request: { id: number; query: AvailabilityQuery }) {
        requests.push({ ...request, respond: data => this.onmessage?.({ data }) });
      }
      terminate() {}
    });
    return requests;
  };

  const openComparison = () => click(document.querySelector<HTMLButtonElement>('.compare-button')!);
  const copyTeam = () => click(document.querySelector<HTMLButtonElement>('.compare-team-heading button')!);

  it('moves focus to the team slot that got the new Pokémon when the swap starts in the details dialog', () => {
    const catalogue = renderApp();
    for (const name of ['Treecko', 'Grovyle', 'Sceptile', 'Torchic', 'Combusken', 'Blaziken']) click(button(`Add ${name} to team`, catalogue));

    click(button('View Mudkip details', catalogue));
    click(Array.from(document.querySelectorAll<HTMLButtonElement>('.dialog-footer button')).find(element => element.textContent?.includes('Swap Mudkip into team'))!);
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Replace Treecko in slot 1');
    click(button('Replace Blaziken in slot 6', document.querySelector('.swap-dialog')!));

    expect(document.querySelector('.acquisition-dialog')!.hasAttribute('open')).toBe(false);
    expect(document.querySelector('.swap-dialog')!.hasAttribute('open')).toBe(false);
    const focused = document.activeElement as HTMLElement;
    expect(focused.getAttribute('aria-label')).toBe('View Mudkip details');
    expect(focused.closest('.team-slot')?.getAttribute('aria-label')).toBe('Team slot 6: Mudkip');
  }, 30_000);

  it('keeps a full comparison draft intact on cancel and swaps only the chosen draft slot', () => {
    useAccessWorker();
    const catalogue = renderApp();
    for (const name of ['Treecko', 'Grovyle', 'Sceptile', 'Torchic', 'Combusken', 'Blaziken']) click(button(`Add ${name} to team`, catalogue));
    openComparison();
    copyTeam();
    const dialog = document.querySelector('.swap-dialog')!;
    const slot = (team: 'current' | 'draft', label: string) =>
      document.querySelector(`[aria-labelledby="compare-${team}-title"] .team-slot[aria-label="${label}"]`);
    click(button('Swap Mudkip into second team', catalogue));
    click(button('Cancel swap', dialog));
    expect(slot('draft', 'Team slot 6: Blaziken')).not.toBeNull();
    click(button('Swap Mudkip into second team', catalogue));
    click(button('Replace Blaziken in slot 6', dialog));
    expect(slot('draft', 'Team slot 6: Mudkip')).not.toBeNull();
    expect(slot('current', 'Team slot 6: Blaziken')).not.toBeNull();
    expect(document.activeElement?.closest('.team-slot')).toBe(slot('draft', 'Team slot 6: Mudkip'));
  }, 30_000);

  it('ends loading on access failure and retries without clearing either team', () => {
    const requests = useAccessWorker();
    const catalogue = renderApp();
    click(button('Add Treecko to team', catalogue));
    openComparison();
    copyTeam();
    const access = document.getElementById('compare-access-title')!.parentElement!;
    const failed = requests[0];
    act(() => failed.respond({ id: failed.id, error: 'Test access failure' }));
    expect(access.getAttribute('aria-busy')).toBe('false');
    expect(document.querySelector('.compare-teams .status-pending')).toBeNull();
    expect(access.querySelector('[role="alert"]')?.textContent).toContain('Test access failure');

    click(access.querySelector('button')!);
    expect(access.getAttribute('aria-busy')).toBe('true');
    expect(requests).toHaveLength(2);
    const retry = requests[1];
    act(() => retry.respond({ id: retry.id, result: { ok: true, value: {
      query: retry.query, levelLimit: null, paths: {}, choiceGroups: [], resourceLimits: {},
      entries: { treecko: { pokemonId: 'treecko', status: 'unavailable', currentPathIds: [], futurePathIds: [], firstMilestoneIds: [], blockers: [] } },
    } } }));
    expect(access.getAttribute('aria-busy')).toBe('false');
    expect(access.textContent).toContain('You cannot get the whole team at this point.');
    expect(document.querySelectorAll('.compare-teams .team-slot[aria-label="Team slot 1: Treecko"]')).toHaveLength(2);
  }, 30_000);
});
