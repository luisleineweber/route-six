import { describe, expect, it } from 'vitest';
import pokemon from '../data/pokemon.json';
import references from '../data/references.json';

describe('Generation IV species identities', () => {
  it('adds exactly National Dex 387 through 493 without adding form identities', () => {
    const introduced = pokemon.filter(species => species.introducedGeneration === 4);
    expect(introduced.map(species => species.nationalDex)).toEqual(
      Array.from({ length: 107 }, (_, index) => index + 387),
    );
    expect(new Set(pokemon.map(species => species.id)).size).toBe(pokemon.length);
    expect(new Set(pokemon.map(species => species.nationalDex)).size).toBe(pokemon.length);
    expect(introduced[0]).toMatchObject({ id: 'turtwig', name: 'Turtwig' });
    expect(introduced.at(-1)).toMatchObject({ id: 'arceus', name: 'Arceus' });
    expect(introduced.find(species => species.nationalDex === 439)).toMatchObject({ id: 'mime-jr', name: 'Mime Jr.' });
    expect(introduced.find(species => species.nationalDex === 474)).toMatchObject({ id: 'porygon-z', name: 'Porygon-Z' });
  });

  it('keeps a pinned source and review date for every new identity', () => {
    const source = references.find(reference => reference.id === 'generation-iv-identities');
    expect(source?.revision).toBe('fe1ea418a7364c93daf0d07ae55e195452d8803c');
    for (const species of pokemon.filter(species => species.introducedGeneration === 4)) {
      expect(species.review).toEqual({ referenceIds: ['generation-iv-identities'], checkedOn: '2026-10-13' });
    }
  });
});

describe('Generation V and VI species identities', () => {
  it.each([[5, 494, 156], [6, 650, 72]])('covers every Generation %i National Dex identity', (generation, first, count) => {
    expect(pokemon.filter(species => species.introducedGeneration === generation).map(species => species.nationalDex))
      .toEqual(Array.from({ length: count }, (_, index) => first + index));
  });

  it('keeps the accented display name separate from the stable ASCII ID', () => {
    expect(pokemon.find(species => species.nationalDex === 669)).toMatchObject({ id: 'flabebe', name: 'Flabébé' });
    expect(pokemon.at(-1)).toMatchObject({ id: 'volcanion', nationalDex: 721, introducedGeneration: 6 });
    expect(new Set(pokemon.map(species => species.nationalDex)).size).toBe(721);
  });
});
