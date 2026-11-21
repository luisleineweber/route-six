import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { emerald } from './local-data';
import { GameContext } from '../src/features/planner/GameContext';
import { PokemonCatalogueCard } from '../src/features/progress/PokemonCatalogueCard';
import { SwapTeamDialog } from '../src/features/team/SwapTeamDialog';
import { plannerReducer, createInitialState } from '../src/features/planner/state';

const card = (canAdd: boolean) => renderToStaticMarkup(createElement(GameContext, { value: emerald },
  createElement(PokemonCatalogueCard, {
    pokemonId: 'silcoon', progressPage: false, activeSlot: null,
    canAdd, onAdd: () => {}, onSwap: () => {}, onDetails: () => {},
  })));

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
    const html = renderToStaticMarkup(createElement(GameContext, { value: emerald },
      createElement(SwapTeamDialog, { pokemonId: 'silcoon', team: fullTeam, onSwap: () => {}, onClose: () => {} })));
    expect(html).toContain('Swap in Silcoon');
    expect([...html.matchAll(/aria-label="Replace ([^"]+) in slot (\d)"/g)].map(match => `${match[2]}:${match[1]}`))
      .toEqual(['1:Swampert', '2:Gardevoir', '3:Aggron', '4:Altaria', '5:Roselia', '6:Absol']);
  });

  it('replaces only the chosen slot', () => {
    const state = { ...createInitialState(emerald), team: fullTeam };
    expect(plannerReducer(state, { type: 'add', pokemonId: 'silcoon', slot: 5 }).team)
      .toEqual(['swampert', 'gardevoir', 'aggron', 'altaria', 'roselia', 'silcoon']);
  });
});
