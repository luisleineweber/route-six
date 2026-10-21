import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { validateDataset } from '../src/data/validate-dataset';
import { validateRegionalDex } from '../src/data/validate-regional-dex';
import { regionalDexName, sortPokemonByPokedex } from '../src/features/planner/pokedex-order';
import { GameContext } from '../src/features/planner/GameContext';
import { PokemonCatalogueCard } from '../src/features/progress/PokemonCatalogueCard';
import { fixture, source } from './fixtures';

function zeroDex() {
  const { data, game } = fixture(['ralts', 'treecko']);
  game.game.id = 'zero-dex';
  game.game.generation = 5;
  game.game.region = 'Unova';
  game.profiles.find(profile => profile.pokemonId === 'ralts')!.regionalDex = 0;
  game.profiles.find(profile => profile.pokemonId === 'treecko')!.regionalDex = 1;
  source(game, 'ralts-gift', 'ralts');
  source(game, 'treecko-gift', 'treecko');
  return { data, game };
}

describe('Regional Pokédex numbers starting at zero', () => {
  it('rejects fractional numbers in the semantic check', () => {
    const { game } = zeroDex();
    game.profiles[0].regionalDex = 1.5;
    game.profiles[1].regionalDex = 2.5;
    expect(validateRegionalDex(game, 'test/').some(issue=>issue.message.includes('integers'))).toBe(true);
  });
  it('accepts a complete sequence from zero', () => {
    expect(validateDataset(zeroDex().data).ok).toBe(true);
  });

  it.each([-1, 0, 2, 1.5])('rejects invalid second regional number %s', number => {
    const { data, game } = zeroDex();
    game.profiles.find(profile => profile.pokemonId === 'treecko')!.regionalDex = number;
    expect(validateDataset(data).ok).toBe(false);
  });

  it('sorts number zero before number one without changing the input', () => {
    const { data, game } = zeroDex();
    const input = [...data.pokemon];
    expect(input.map(species => species.id)).toEqual(['treecko', 'ralts']);
    expect(sortPokemonByPokedex(input, game).map(species => species.id)).toEqual(['ralts', 'treecko']);
    expect(input.map(species => species.id)).toEqual(['treecko', 'ralts']);
  });

  it('labels number 000 as regional in catalogue cards', () => {
    const { game } = zeroDex();
    const html = renderToStaticMarkup(createElement(GameContext, { value: game },
      createElement(PokemonCatalogueCard, {
        pokemonId: 'ralts', regionalDex: 0, progressPage: false, activeSlot: null,
        canAdd: true, onAdd: () => {}, onDetails: () => {},
      }),
    ));
    expect(html).toContain('title="Unova Pokédex"');
    expect(html).toContain('Unova </span>#000');
  });
});

function sectionedDex() {
  const { data, game } = fixture(['treecko', 'ralts', 'abra', 'kadabra']);
  game.game.region = 'Kalos';
  game.game.regionalDexSections = [
    { id: 'central', name: 'Central Kalos' },
    { id: 'coastal', name: 'Coastal Kalos' },
    { id: 'mountain', name: 'Mountain Kalos' },
  ];
  for (const [id, section] of [['treecko', 'mountain'], ['ralts', 'coastal'], ['abra', 'central']]) {
    const profile = game.profiles.find(profile => profile.pokemonId === id)!;
    profile.regionalDex = 1;
    profile.regionalDexSectionId = section;
  }
  delete game.profiles.find(profile => profile.pokemonId === 'kadabra')!.regionalDex;
  for (const profile of game.profiles) source(game, `${profile.pokemonId}-gift`, profile.pokemonId);
  return { data, game };
}

describe('Regional Pokédex sections', () => {
  it('accepts a separate number sequence for each section', () => {
    expect(validateDataset(sectionedDex().data).ok).toBe(true);
  });

  it.each(['unknown', undefined])('rejects an invalid section %s', sectionId => {
    const { data, game } = sectionedDex();
    game.profiles[0].regionalDexSectionId = sectionId;
    expect(validateDataset(data).ok).toBe(false);
  });

  it('rejects a section without a regional number', () => {
    const { data, game } = sectionedDex();
    game.profiles.find(profile => profile.pokemonId === 'kadabra')!.regionalDexSectionId = 'central';
    expect(validateDataset(data).ok).toBe(false);
  });

  it('rejects duplicate numbers within one section', () => {
    const { data, game } = sectionedDex();
    game.profiles.find(profile => profile.pokemonId === 'ralts')!.regionalDexSectionId = 'central';
    expect(validateDataset(data).ok).toBe(false);
  });

  it('sorts sections in game order, then National Dex, without changing the input', () => {
    const { data, game } = sectionedDex();
    const input = [...data.pokemon];
    const before = input.map(species => species.id);
    expect(sortPokemonByPokedex(input, game).map(species => species.id)).toEqual(['abra', 'ralts', 'treecko', 'kadabra']);
    expect(input.map(species => species.id)).toEqual(before);
    expect(regionalDexName(game, 'coastal')).toBe('Coastal Kalos');
  });

  it('uses the section name in catalogue cards', () => {
    const { game } = sectionedDex();
    const html = renderToStaticMarkup(createElement(GameContext, { value: game },
      createElement(PokemonCatalogueCard, {
        pokemonId: 'ralts', regionalDex: 1, regionalDexSectionId: 'coastal', progressPage: false,
        activeSlot: null, canAdd: true, onAdd: () => {}, onDetails: () => {},
      }),
    ));
    expect(html).toContain('title="Coastal Kalos Pokédex"');
  });
});
