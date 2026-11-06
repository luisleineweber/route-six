import { describe, expect, it } from 'vitest';
import { emerald } from './local-data';
import { evolutionConditionText, evolutionFamily, evolutionLabels } from '../src/components/evolution-presentation';

describe('evolution families', () => {
  it('shows the full family from a middle or final stage', () => {
    const middle = evolutionFamily(emerald, 'pikachu');
    expect(middle.roots).toEqual(['pichu']);
    expect(middle.evolutions.map(evolution => evolution.id)).toEqual(expect.arrayContaining(['pichu-to-pikachu', 'pikachu-to-raichu']));
    expect(middle.evolutions).toHaveLength(2);
    expect(evolutionFamily(emerald, 'raichu')).toEqual(middle);
  });

  it('keeps all branches when a branch end opens the card', () => {
    const family = evolutionFamily(emerald, 'beautifly');
    expect(family.roots).toEqual(['wurmple']);
    expect(family.evolutions.map(evolution => evolution.toPokemonId)).toEqual(expect.arrayContaining(['silcoon', 'cascoon', 'beautifly', 'dustox']));
    expect(family.evolutions).toHaveLength(4);
  });

  it('includes Shedinja and its special conditions', () => {
    const family = evolutionFamily(emerald, 'shedinja');
    expect(family.roots).toEqual(['nincada']);
    expect(family.evolutions.map(evolution => evolution.toPokemonId)).toEqual(['ninjask', 'shedinja']);
    const shedinja = family.evolutions.find(evolution => evolution.toPokemonId === 'shedinja')!;
    expect(evolutionLabels(emerald, shedinja)).toEqual(['Level up at Lv. 20+', '1 free party slot', 'Use Poké Ball']);
    expect(evolutionLabels(emerald, { ...shedinja, requirements: { kind: 'all', requirements: [] } }))
      .toEqual(['Level up at Lv. 20+', '1 free party slot']);
  });

  it('does not add a section for a Pokémon without evolutions', () => {
    expect(evolutionFamily(emerald, 'ditto')).toEqual({ roots: ['ditto'], evolutions: [] });
  });
});

describe('evolution requirements', () => {
  const labels = (id: string) => evolutionLabels(emerald, emerald.evolutions.find(evolution => evolution.id === id)!);

  it('names the Beauty food used in the selected generation', () => {
    const condition = { kind: 'beauty' as const, minimum: 170 };
    expect(evolutionConditionText(emerald, condition)).toContain('dry Pokéblocks');
    const platinum = { ...emerald, game: { ...emerald.game, generation: 4 } };
    expect(evolutionConditionText(platinum, condition)).toBe('Raise Beauty to 170 with Poffins, then gain a level.');
    const omegaRuby = { ...emerald, game: { ...emerald.game, generation: 6 } };
    expect(evolutionConditionText(omegaRuby, condition)).toContain('dry Pokéblocks');
  });

  it('shows level, item, and friendship requirements', () => {
    expect(labels('abra-to-kadabra')).toEqual(['Level up at Lv. 16+']);
    expect(labels('pikachu-to-raichu')).toEqual(['Use Thunder Stone']);
    expect(labels('pichu-to-pikachu')).toEqual(['Level up', 'Friendship 220+']);
  });

  it('shows the held item for a trade evolution', () => {
    expect(labels('seadra-to-kingdra')).toEqual(['Trade while holding Dragon Scale']);
    expect(labels('kadabra-to-alakazam')).toEqual(['Trade']);
  });
});
