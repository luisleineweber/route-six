import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { AcquisitionPath, AvailabilitySnapshot, GameData, PlanningTarget, PokemonProfile } from '../src/domain/types';
import { GameContext } from '../src/features/planner/GameContext';
import { PokemonSearch } from '../src/features/progress/PokemonSearch';
import { matchingCataloguePokemon, matchingCatalogueSelection } from '../src/features/progress/catalogue-filter';

const review = { referenceIds: ['gen7-dex'], checkedOn: '2026-11-23' };
const rattata: PokemonProfile = {
  pokemonId: 'rattata', regionalDex: 15, types: ['normal'], spriteSrc: '/pokemon/19.png',
  genders: ['male', 'female'], breeding: null, review,
  forms: [{ formId: 'rattata-alola', types: ['dark', 'normal'], spriteSrc: '/pokemon/rattata-alola.png',
    genders: ['male', 'female'], breeding: null, review }],
};
const pikachu: PokemonProfile = {
  pokemonId: 'pikachu', regionalDex: 25, types: ['electric'], spriteSrc: '/pokemon/25.png',
  genders: ['male', 'female'], breeding: null, review,
};

function fixture(id: string, region: string): GameData {
  return {
    game: { id, region, name: id, generation: 7, firstMilestoneId: 'start', breeding: null, planner: null, review },
    profiles: [pikachu, rattata], typeChart: { typeIds: ['normal', 'dark', 'electric'], matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], review },
    milestones: [], bosses: [],
    locations: [{ id: 'field', name: 'Field', requirements: { kind: 'all', requirements: [] }, review }],
    capabilities: [], items: [], choices: [], breedingRules: [], evolutions: [], exclusions: [],
    sources: [{ id: 'local-rattata', pokemonId: 'rattata', formId: 'rattata-alola', locationId: 'field',
      requirements: { kind: 'all', requirements: [] }, level: { kind: 'fixed', value: 3 }, genders: ['male', 'female'],
      maxUses: null, choice: null, details: { kind: 'wild', method: 'grass', ratePercent: 20 }, review }],
  };
}

const alola = fixture('sun', 'Alola');
const kanto = fixture('lets-go-pikachu', 'Kanto');

const path: AcquisitionPath = {
  id: 'field-catch', pokemonId: 'rattata', formId: 'rattata-alola', sourceIds: ['local-rattata'],
  evolutionIds: [], breedingSteps: [], genders: ['male', 'female'], minimumLevel: 3,
  firstMilestoneIds: [], choices: [], claims: [], coProductIds: [],
};

const snapshot: AvailabilitySnapshot = {
  query: { gameId: 'lets-go-pikachu', milestoneId: 'start', respectLevelLimit: true },
  levelLimit: null, choiceGroups: [], resourceLimits: {}, paths: { [path.id]: path },
  entries: {
    rattata: { pokemonId: 'rattata', status: 'later', currentPathIds: [], futurePathIds: ['standard-catch'],
      firstMilestoneIds: [], blockers: [] },
    'rattata-alola': { pokemonId: 'rattata', status: 'available', currentPathIds: [path.id], futurePathIds: [],
      firstMilestoneIds: [], blockers: [] },
  },
};

function render(game: GameData, data: AvailabilitySnapshot | null, target: PlanningTarget = 'whole-game') {
  return renderToStaticMarkup(createElement(GameContext, { value: game }, createElement(PokemonSearch, {
    snapshot: data, progressPage: data !== null, target,
    team: Array(6).fill(null), activeSlot: null, onAdd: () => {}, onSwap: () => {}, onDetails: () => {}, onCancel: () => {},
  })));
}

describe('Catalogue forms', () => {
  it('shows the Alolan sprite in Alola and keeps one result per Pokédex entry', () => {
    const html = render(alola, null);
    expect(html.match(/<article\b/g)).toHaveLength(2);
    expect(html).toContain('2 Pokémon');
    expect(html).toContain('/pokemon/rattata-alola.png');
    expect(html).toContain('aria-label="View Rattata (Alolan Form) details"');
    expect(html).toContain('aria-label="Add Rattata (Alolan Form) to team"');
    expect(html.indexOf('#015')).toBeLessThan(html.indexOf('#025'));
  });

  it('keeps the Kanto default in Let’s Go and searches the alternate name and types', () => {
    expect(render(kanto, null)).toContain('/pokemon/19.png');
    expect(render(kanto, null)).not.toContain('/pokemon/rattata-alola.png');
    for (const [query, types] of [['alolan rattata 15', []], ['', ['dark']]] as const) {
      expect(matchingCataloguePokemon(kanto, query, types).map(row => row.ids)).toEqual([['rattata-alola']]);
    }
    expect(matchingCataloguePokemon(kanto, 'alolan rattata', ['electric'])).toEqual([]);
  });

  it('shows the form available at the selected point with that form’s catch and actions', () => {
    const html = render(kanto, snapshot, 'current-progress');
    expect(html.match(/<article\b/g)).toHaveLength(1);
    expect(html).toContain('/pokemon/rattata-alola.png');
    expect(html).toContain('Now: Field');
    expect(html).toContain('aria-label="Add Rattata (Alolan Form) to team"');
    expect(html).toContain('Available now or later<span class="chip-count">1</span>');
    expect(html).toContain('Available later<span class="chip-count">1</span>');
  });

  it('uses the selected status to choose a form from the name and type results', () => {
    const [item] = matchingCataloguePokemon(kanto, 'rattata', []);
    expect(matchingCatalogueSelection(item.ids, snapshot, 'available')).toBe('rattata-alola');
    expect(matchingCatalogueSelection(item.ids, snapshot, 'later')).toBe('rattata');
    const [alolan] = matchingCataloguePokemon(kanto, 'rattata', ['dark']);
    expect(matchingCatalogueSelection(alolan.ids, snapshot, 'later')).toBeUndefined();
  });
});
