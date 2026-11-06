import { describe, expect, it } from 'vitest';
import { matchesCatalogueTypes } from '../src/features/progress/catalogue-filter';

describe('Catalogue type selection', () => {
  it('shows all types when no type is selected', () => {
    expect(matchesCatalogueTypes(['fire'], [])).toBe(true);
    expect(matchesCatalogueTypes(['water', 'flying'], [])).toBe(true);
  });

  it('matches either selected type, including either type of a dual-type Pokémon', () => {
    const selected = ['water', 'flying'];
    expect(matchesCatalogueTypes(['water'], selected)).toBe(true);
    expect(matchesCatalogueTypes(['normal', 'flying'], selected)).toBe(true);
    expect(matchesCatalogueTypes(['water', 'flying'], selected)).toBe(true);
    expect(matchesCatalogueTypes(['grass', 'poison'], selected)).toBe(false);
  });

  it('keeps a single selected type as a filter', () => {
    expect(matchesCatalogueTypes(['grass', 'poison'], ['grass'])).toBe(true);
    expect(matchesCatalogueTypes(['grass', 'poison'], ['water'])).toBe(false);
  });
});
