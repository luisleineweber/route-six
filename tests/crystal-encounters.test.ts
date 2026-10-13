import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Requirement = { kind: string; id?: string; requirements?: Requirement[]; quantity?: number; consumed?: boolean };
type EncounterSource = {
  id: string;
  pokemonId: string;
  locationId: string;
  requirements: Requirement;
  level: { kind: string; value?: number; minimum?: number; maximum?: number };
  genders: string[];
  maxUses: number | null;
  choice: unknown;
  details: { kind: string; method?: string; ratePercent?: number };
  review: { referenceIds: string[]; checkedOn: string };
};
type Location = { id: string; requirements: Requirement };

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T;
const sources = readJson<EncounterSource[]>('data/games/crystal/sources.json');
const profiles = readJson<Array<{ pokemonId: string; genders: string[] }>>('data/games/crystal/pokemon.json');
const locations = readJson<Location[]>('data/games/crystal/locations.json');

const find = (id: string) => sources.find(source => source.id === id);

describe('Crystal encounter source review', () => {
  it('matches the reviewed map, method, table, level, and rate inventory', () => {
    const profileById = new Map(profiles.map(profile => [profile.pokemonId, profile]));
    const locationIds = new Set(locations.map(location => location.id));
    expect(sources).toHaveLength(2719);
    expect(new Set(sources.map(source => source.id)).size).toBe(sources.length);
    expect(sources.every(source => source.genders.every(gender =>
        profileById.get(source.pokemonId)?.genders.includes(gender))
      && locationIds.has(source.locationId)
      && source.review.referenceIds.length > 0
      && source.review.checkedOn === '2026-10-12')).toBe(true);
    expect(sources.reduce<Record<string, number>>((counts, source) => {
      counts[source.details.kind] = (counts[source.details.kind] ?? 0) + 1;
      return counts;
    }, {})).toEqual({ wild: 2560, roaming: 2, static: 11, gift: 10, egg: 8,
      'game-trade': 7, starter: 3, breeding: 118 });
    expect(sources.filter(source => source.details.kind === 'wild').reduce<Record<string, number>>((counts, source) => {
      const method = source.details.method!;
      counts[method] = (counts[method] ?? 0) + 1;
      return counts;
    }, {})).toEqual({ grass: 1609, 'super-rod': 260, 'good-rod': 239, surf: 186,
      headbutt: 136, 'old-rod': 112, 'bug-contest': 10, 'rock-smash': 8, });
    expect(sources.every(source => source.details.kind !== 'wild'
      || (source.details.ratePercent !== undefined && source.details.ratePercent > 0
        && source.details.ratePercent <= 100))).toBe(true);
  });

  it('keeps Crystal table, swarm, roaming, static, and story gates distinct', () => {
    expect(find('wild-headbutt-route-29-route-common-hoothoot-10')?.details.ratePercent).toBe(50);
    expect(find('wild-headbutt-route-29-route-rare-pineco-10')?.details.ratePercent).toBe(30);
    expect(find('wild-grass-route-46-morn-phanpy-2')?.details.ratePercent).toBe(5);
    expect(find('wild-bug-contest-scyther')?.level).toEqual({ kind: 'range', minimum: 13, maximum: 14 });
    expect(find('roamer-raikou')).toMatchObject({
      locationId: 'roaming-johto', level: { kind: 'fixed', value: 40 }, maxUses: 1,
      details: { kind: 'roaming' }, requirements: { kind: 'capability', id: 'roaming-legendaries' },
    });
    expect(find('roamer-entei')).toMatchObject({
      locationId: 'roaming-johto', level: { kind: 'fixed', value: 40 }, maxUses: 1,
      details: { kind: 'roaming' }, requirements: { kind: 'capability', id: 'roaming-legendaries' },
    });
    expect(sources.filter(source => source.pokemonId === 'raikou')).toHaveLength(1);
    expect(sources.filter(source => source.pokemonId === 'entei')).toHaveLength(1);
    expect(sources.some(source => source.id.includes('qwilfish-swarm')
      && JSON.stringify(source.requirements).includes('swarm-report'))).toBe(true);

    expect(find('static-tin-tower-suicune')).toMatchObject({
      pokemonId: 'suicune', locationId: 'tin-tower', level: { kind: 'fixed', value: 40 }, maxUses: 1,
      requirements: { kind: 'milestone', id: 'tin-tower-suicune' },
    });
    expect(find('static-route-36-sudowoodo')?.requirements).toEqual({
      kind: 'all', requirements: [
        { kind: 'milestone', id: 'whitney-defeated' },
        { kind: 'item', id: 'squirtbottle', quantity: 1, consumed: false },
      ],
    });
    expect(find('static-union-cave-friday-lapras')).toMatchObject({ requirements: { kind: 'capability', id: 'weekday-window' }, maxUses: null });
    expect(find('static-vermilion-city-snorlax')?.requirements).toEqual({
      kind: 'item', id: 'expn-card', quantity: 1, consumed: false,
    });
    expect(find('static-rocket-hideout-voltorb-traps')?.maxUses).toBe(8);
    expect(find('static-rocket-hideout-koffing-traps')?.maxUses).toBe(7);
    expect(find('static-rocket-hideout-geodude-traps')?.maxUses).toBe(7);
    expect(find('static-rocket-hideout-electrode')?.maxUses).toBe(3);
    expect(find('static-tin-tower-ho-oh')?.requirements).toEqual({ kind: 'capability', id: 'rainbow-wing' });
    expect(find('static-whirl-islands-lugia')?.requirements).toEqual({
      kind: 'all', requirements: [
        { kind: 'capability', id: 'silver-wing' },
        { kind: 'capability', id: 'whirlpool' },
      ],
    });
    const route42 = readJson<Array<{ id: string; previousIds: string[] }>>('data/games/crystal/progression.json')
      .find(milestone => milestone.id === 'route-42');
    expect(route42?.previousIds).toEqual(['morty-defeated']);
    const tinTowerOpen = readJson<Array<{ id: string; previousIds: string[] }>>('data/games/crystal/progression.json')
      .find(milestone => milestone.id === 'tin-tower-open');
    expect(tinTowerOpen?.previousIds).toEqual(['radio-tower-cleared']);
    expect(locations.find(location => location.id === 'tin-tower')?.requirements)
      .toEqual({ kind: 'milestone', id: 'tin-tower-open' });
    expect(locations.find(location => location.id === 'whirl-islands')?.requirements).toEqual({
      kind: 'all', requirements: [
        { kind: 'capability', id: 'surf' },
        { kind: 'capability', id: 'whirlpool' },
      ],
    });
    expect(sources.filter(source => source.id.startsWith('odd-egg-')).map(source => source.pokemonId).sort())
      .toEqual(['cleffa', 'elekid', 'igglybuff', 'magby', 'pichu', 'smoochum', 'tyrogue']);
    expect(sources.some(source => source.id === 'gift-dragon-shrine-dratini'
      && source.level.value === 15 && source.requirements.kind === 'milestone'
      && source.requirements.id === 'clair-defeated')).toBe(true);
    expect(sources.filter(source => source.details.kind === 'game-trade')).toHaveLength(7);
    expect(sources.some(source => source.pokemonId === 'ditto' && source.details.kind === 'breeding')).toBe(false);
    expect(find('trade-dodrio')?.genders).toEqual(['female']);
    expect(find('egg-togepi-violet-pokemon-center')).toMatchObject({
      pokemonId: 'togepi', locationId: 'violet-city', level: { kind: 'fixed', value: 5 },
      details: { kind: 'egg' }, requirements: { kind: 'milestone', id: 'falkner-defeated' },
    });
    expect(find('game-corner-porygon')).toBeUndefined();
  });
});
