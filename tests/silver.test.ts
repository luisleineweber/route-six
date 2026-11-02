import { existsSync, readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T;
const profiles = readJson<Array<{
  pokemonId: string;
  regionalDex: number;
  spriteSrc: string;
  review: { referenceIds: string[]; checkedOn: string };
}>>('data/games/silver/pokemon.json');
const species = readJson<Array<{ id: string; introducedGeneration: number }>>('data/pokemon.json');
const typeChart = readJson<{ typeIds: string[]; matrix: number[][]; review: { referenceIds: string[] } }>(
  'data/games/silver/type-chart.json');
const bosses = readJson<Array<{
  id: string;
  kind: string;
  badgeNumber?: number;
  review: { referenceIds: string[] };
}>>('data/games/silver/bosses.json');
const game = readJson<{
  id: string;
  generation: number;
  breeding: { hatchLevel: number } | null;
  planner: { defaultMilestoneId: string; checkpoints: Array<{ milestoneId: string }> };
}>('data/games/silver/game.json');
const milestones = readJson<Array<{ id: string; previousIds: string[]; displayOrder: number }>>(
  'data/games/silver/progression.json');
const choices = readJson<Array<{ id: string; options: string[]; maximumSelections: number; review: { referenceIds: string[] } }>>(
  'data/games/silver/choices.json');
const items = readJson<Array<{ id: string; sources: Array<{ id: string; locationId: string; requirements: TestRequirement; maxUses: number | null; review: { referenceIds: string[] } }>; review: { referenceIds: string[] } }>>(
  'data/games/silver/items.json');
type TestRequirement = { kind: string; id?: string; requirements?: TestRequirement[] };
const locations = readJson<Array<{ id: string; requirements: TestRequirement }>>('data/games/silver/locations.json');
const capabilities = readJson<Array<{ id: string; requirements: { kind: string; id: string } }>>(
  'data/games/silver/capabilities.json');
const sources = readJson<Array<{
  id: string;
  pokemonId: string;
  locationId: string;
  requirements: TestRequirement;
  level: { kind: string; value?: number; minimum?: number; maximum?: number };
  details: { kind: string; method?: string; ratePercent?: number; offeredPokemonId?: string };
  maxUses: number | null;
  choice: { groupId: string; optionId: string } | null;
  review: { referenceIds: string[]; checkedOn: string };
}>>('data/games/silver/sources.json');
const capabilityIds = new Set(capabilities.map(capability => capability.id));
const locationIds = new Set(locations.map(location => location.id));
const profileIds = new Set(profiles.map(profile => profile.pokemonId));
const evolutions = readJson<Array<{ fromPokemonId: string; toPokemonId: string; trigger: string; itemId: string | null; requirements: TestRequirement }>>('data/games/silver/evolutions.json');
const breedingRules = readJson<Array<{ id: string; parentPokemonIds: string[]; offspringPokemonIds: string[] }>>('data/games/silver/breeding-rules.json');
const exclusions = readJson<Array<{ pokemonId: string; reason: string }>>('data/games/silver/exclusions.json');
const schemaAjv = new Ajv2020({ allErrors: true, strict: false });
addFormats(schemaAjv);
for (const path of [
  'docs/schema/common.schema.json', 'docs/schema/game.schema.json', 'docs/schema/acquisition.schema.json',
]) schemaAjv.addSchema(readJson<Record<string, unknown>>(path));
const validateSource = schemaAjv.compile({
  $ref: 'https://pokemon-playthrough-planner.local/schema/acquisition.schema.json#/$defs/source',
});
const validateLocation = schemaAjv.compile({
  $ref: 'https://pokemon-playthrough-planner.local/schema/game.schema.json#/$defs/location',
});
const validateChoice = schemaAjv.compile({
  $ref: 'https://pokemon-playthrough-planner.local/schema/game.schema.json#/$defs/choiceGroup',
});
const validateItem = schemaAjv.compile({
  $ref: 'https://pokemon-playthrough-planner.local/schema/game.schema.json#/$defs/item',
});

describe('Silver reviewed data layer', () => {
  it('covers all 251 Generation I and II species in Silver New Pokédex order', () => {
    const expected = species.filter(entry => entry.introducedGeneration <= 2).map(entry => entry.id).sort();
    expect(expected).toHaveLength(251);
    expect(profiles.map(profile => profile.pokemonId).sort()).toEqual(expected);
    expect(profiles.map(profile => profile.regionalDex)).toEqual(
      Array.from({ length: 251 }, (_, index) => index + 1));
    expect(profiles.filter(profile => [1, 10, 21, 251].includes(profile.regionalDex))
      .map(profile => [profile.regionalDex, profile.pokemonId])).toEqual([
      [1, 'chikorita'], [10, 'pidgey'], [21, 'pichu'], [251, 'celebi'],
    ]);
    expect(profiles.every(profile => profile.review.referenceIds.includes('silver-species')
      && profile.review.referenceIds.includes('silver-dex'))).toBe(true);
    expect(profiles.every(profile => profile.review.checkedOn === '2026-10-12'
      && existsSync(`public${profile.spriteSrc}`))).toBe(true);
  });

  it('uses the complete Generation II type chart', () => {
    expect(typeChart.typeIds).toHaveLength(17);
    expect(typeChart.matrix).toHaveLength(17);
    expect(typeChart.matrix.every(row => row.length === 17)).toBe(true);
    expect(typeChart.review.referenceIds).toContain('silver-type-chart');
  });

  it('matches Emerald’s Generation III type chart', () => {
    const emeraldChart = readJson<{ typeIds: string[]; matrix: number[][] }>(
      'data/games/emerald/type-chart.json');
    expect(typeChart.typeIds).toEqual(emeraldChart.typeIds);
    expect(typeChart.matrix).toEqual(emeraldChart.matrix);
  });

  it('covers both regions and the post-game battle in the boss catalogue', () => {
    expect(bosses).toHaveLength(22);
    expect(bosses.filter(boss => boss.kind === 'gym')).toHaveLength(16);
    expect(bosses.filter(boss => boss.kind === 'elite-four')).toHaveLength(4);
    expect(bosses.filter(boss => boss.kind === 'champion')).toHaveLength(1);
    expect(bosses.find(boss => boss.id === 'red')?.kind).toBe('trainer');
    expect(bosses.filter(boss => boss.kind === 'gym').map(boss => boss.badgeNumber)).toEqual(
      Array.from({ length: 16 }, (_, index) => index + 1));
    expect(bosses.every(boss => boss.review.referenceIds.includes('silver-bosses'))).toBe(true);
  });

  it('sets Silver progress defaults and gates its version-specific wings', () => {
    expect(game).toMatchObject({ id: 'silver', generation: 2, breeding: { hatchLevel: 5 } });
    expect(milestones.some(point => point.id === game.planner.defaultMilestoneId)).toBe(true);
    expect(game.planner.checkpoints.every(point => milestones.some(m => m.id === point.milestoneId))).toBe(true);
    expect(milestones.map(point => point.displayOrder)).toEqual(
      Array.from({ length: milestones.length }, (_, index) => index));
    expect(locations.some(location => location.id === 'radio-tower')).toBe(true);
    expect(capabilities.find(capability => capability.id === 'silver-wing')).toMatchObject({
      requirements: { kind: 'milestone', id: 'radio-tower-cleared' },
    });
    expect(capabilities.find(capability => capability.id === 'rainbow-wing')).toMatchObject({
      requirements: { kind: 'milestone', id: 'kanto-open' },
    });
    // The Olivine City fisherman gives the Good Rod before Morty and Cianwood.
    expect(capabilities.find(capability => capability.id === 'good-rod')).toMatchObject({
      requirements: { kind: 'milestone', id: 'ecruteak-city' },
    });
  });

  it('covers reviewed Silver land, surf, fishing, tree and contest table entries', () => {
    expect(sources).toHaveLength(2608);
    expect(Object.fromEntries(['grass', 'surf', 'headbutt', 'rock-smash', 'bug-contest', 'old-rod', 'good-rod', 'super-rod']
      .map(method => [method, sources.filter(source => source.details.method === method).length]))).toEqual({
      grass: 1663, surf: 189, headbutt: 252, 'rock-smash': 8, 'bug-contest': 10,
      'old-rod': 78, 'good-rod': 130, 'super-rod': 130,
    });
    expect(Object.fromEntries(['grass', 'surf', 'headbutt', 'rock-smash', 'bug-contest', 'old-rod', 'good-rod', 'super-rod']
      .map(method => [method, new Set(sources.filter(source => source.details.method === method)
        .map(source => source.locationId)).size]))).toEqual({
      grass: 91, surf: 62, headbutt: 21, 'rock-smash': 4, 'bug-contest': 1,
      'old-rod': 25, 'good-rod': 25, 'super-rod': 25,
    });
    expect(new Set(sources.map(source => source.id)).size).toBe(sources.length);
    expect(sources.every(source => validateSource(source))).toBe(true);
    expect(locations.every(location => validateLocation(location))).toBe(true);
    expect(locations).toHaveLength(161);
    expect(locations.find(location => location.id === 'wild-route-26')).toMatchObject({
      requirements: { kind: 'milestone', id: 'clair-defeated' },
    });
    expect(locations.find(location => location.id === 'wild-route-28')).toMatchObject({
      requirements: { kind: 'milestone', id: 'blue-defeated' },
    });
    expect(locations.find(location => location.id === 'wild-route-43')).toMatchObject({
      requirements: { kind: 'milestone', id: 'morty-defeated' },
    });
    expect(locations.find(location => location.id === 'wild-tin-tower-2f')).toMatchObject({
      requirements: { kind: 'milestone', id: 'morty-defeated' },
    });
    expect(locations.find(location => location.id === 'wild-celadon-city')).toMatchObject({
      requirements: { kind: 'milestone', id: 'kanto-open' },
    });
    expect(locations.find(location => location.id === 'wild-whirl-island-b1f')?.requirements).toEqual({
      kind: 'all', requirements: [
        { kind: 'milestone', id: 'morty-defeated' }, { kind: 'capability', id: 'surf' },
      ],
    });
    expect(sources.every(source => profileIds.has(source.pokemonId) && locationIds.has(source.locationId)
      && source.review.checkedOn === (source.id === 'breed-nidorino' ? '2026-10-21' : '2026-10-12'))).toBe(true);
    const wildSources = sources.filter(source => source.details.kind === 'wild');
    expect(wildSources.every(source => source.review.referenceIds.every(id =>
      ['silver-encounters', 'silver-special-encounters'].includes(id)))).toBe(true);
    expect(wildSources.every(source => source.requirements.kind === 'all'
      && Array.isArray(source.requirements.requirements)
      && source.requirements.requirements.every(requirement => requirement.kind === 'capability'
        && capabilityIds.has(requirement.id ?? '')))).toBe(true);
    expect(wildSources.filter(source => source.details.method === 'grass')
      .every(source => /-s[1-7](?:-[1-7])*$/u.test(source.id))).toBe(true);
    expect(wildSources.filter(source => source.details.method === 'surf')
      .every(source => /-s[1-3](?:-[1-3])*$/u.test(source.id))).toBe(true);
  });

  it('models the Burned Tower release before Morty and covers finite breeding and evolution data', () => {
    expect(capabilities.find(capability => capability.id === 'roaming-legendaries')).toMatchObject({
      requirements: { kind: 'milestone', id: 'beasts-released' },
    });
    expect(milestones.find(point => point.id === 'beasts-released')).toMatchObject({
      previousIds: ['ecruteak-city'], locationId: 'ecruteak-city',
    });
    const breedSources = sources.filter(source => source.details.kind === 'breeding');
    expect(breedSources).toHaveLength(119);
    expect(breedSources.some(source => source.pokemonId === 'ditto')).toBe(false);
    expect(breedSources.every(source => source.maxUses === null && source.level.value === 5)).toBe(true);
    expect(new Set(breedSources.map(source => source.pokemonId))).toEqual(
      new Set(breedingRules.flatMap(rule => rule.offspringPokemonIds)));
    expect(breedingRules.every(rule => rule.parentPokemonIds.every(id => profileIds.has(id))
      && rule.offspringPokemonIds.every(id => profileIds.has(id)))).toBe(true);
    expect(evolutions.length).toBeGreaterThan(100);
    expect(evolutions.filter(edge => edge.trigger === 'use-item')
      .every(edge => edge.itemId !== null && edge.requirements.kind === 'item')).toBe(true);
    expect(evolutions.some(edge => edge.trigger === 'player-trade')).toBe(true);
    expect(sources.every(source => source.details.kind !== 'player-trade')).toBe(true);
    expect(evolutions.every(edge => profileIds.has(edge.fromPokemonId) && profileIds.has(edge.toPokemonId))).toBe(true);
    expect(evolutions.find(edge => edge.fromPokemonId === 'tyrogue' && edge.toPokemonId === 'hitmontop'))
      .toMatchObject({ trigger: 'level-up', minimumLevel: 20 });
    expect(exclusions).toHaveLength(29);
    expect(exclusions).toContainEqual(expect.objectContaining({ pokemonId: 'celebi', reason: 'external-event' }));
  });

  it('keeps Silver versions, time windows, swarms and roaming levels', () => {
    const headbutt = sources.filter(source => source.details.method === 'headbutt');
    expect(headbutt.some(source => source.id.startsWith('headbutt-route-26-common')
      && source.pokemonId === 'weedle')).toBe(true);
    expect(headbutt.some(source => source.id.startsWith('headbutt-route-26-common')
      && source.pokemonId === 'caterpie')).toBe(false);
    expect(sources.some(source => source.id === 'grass-route-38-swarm-nite-meowth-l16-s2-4')).toBe(true);
    expect(sources.some(source => source.id === 'surf-slowpoke-well-b2f-water-slowpoke-l15-s1'
      && source.details.ratePercent === 1.2)).toBe(true);
    expect(sources.filter(source => source.details.method === 'bug-contest').map(source => source.id)).toEqual(
      Array.from({ length: 10 }, (_, index) => `bug-contest-national-park-slot${index + 1}`).sort());
    expect(sources.some(source => source.details.method === 'bug-contest' && source.pokemonId === 'venomoth')).toBe(false);
    expect(sources.some(source => source.id.includes('qwilfish-swarm')
      && source.details.method === 'good-rod'
      && source.requirements.kind === 'all' && Array.isArray(source.requirements.requirements)
      && source.requirements.requirements.some(requirement => requirement.id === 'swarm-report'))).toBe(true);
    expect(sources.filter(source => source.details.kind === 'roaming').map(source => [source.pokemonId,
      source.locationId, source.level.value, source.maxUses, source.requirements]).sort()).toEqual([
      ['entei', 'roaming-johto', 40, 1, { kind: 'capability', id: 'roaming-legendaries' }],
      ['raikou', 'roaming-johto', 40, 1, { kind: 'capability', id: 'roaming-legendaries' }],
      ['suicune', 'roaming-johto', 40, 1, { kind: 'capability', id: 'roaming-legendaries' }],
    ]);
  });

  it('covers starters, gifts, static captures, trades and reviewed evolution-item sources', () => {
    const starters = sources.filter(source => source.details.kind === 'starter');
    expect(choices).toHaveLength(1);
    expect(choices.every(choice => validateChoice(choice))).toBe(true);
    expect(items.every(item => validateItem(item))).toBe(true);
    expect(items.filter(item => item.id !== 'sun-stone').every(item => item.sources.every(source => source.maxUses === 1))).toBe(true);
    expect(items.find(item => item.id === 'sun-stone')?.sources.every(source => source.maxUses === null)).toBe(true);
    expect(choices[0]).toMatchObject({ id: 'starter-choice', options: ['chikorita', 'cyndaquil', 'totodile'], maximumSelections: 1 });
    expect(starters).toHaveLength(3);
    expect(starters.map(source => source.pokemonId).sort()).toEqual(['chikorita', 'cyndaquil', 'totodile']);
    expect(starters.every(source => source.maxUses === 1 && source.choice?.groupId === 'starter-choice')).toBe(true);
    const eggs = sources.filter(source => source.details.kind === 'egg');
    expect(eggs.map(source => source.pokemonId)).toEqual(['togepi']);
    expect(eggs).toMatchObject([{ maxUses: 1, level: { kind: 'fixed', value: 5 } }]);
    const gifts = sources.filter(source => source.details.kind === 'gift');
    expect(gifts.map(source => source.id).sort()).toEqual([
      'game-corner-abra', 'game-corner-dratini', 'game-corner-porygon', 'game-corner-sandshrew', 'gift-eevee-bill', 'gift-kenya-spearow', 'gift-tyrogue-kiyo',
    ]);
    expect(gifts.filter(source => !source.id.startsWith('game-corner-')).every(source => source.maxUses === 1)).toBe(true);
    expect(sources.filter(source => source.details.kind === 'game-trade')).toHaveLength(6);
    expect(sources.filter(source => source.details.kind === 'game-trade').every(source => source.details.offeredPokemonId !== undefined)).toBe(true);
    expect(sources.filter(source => source.details.kind === 'static').map(source => source.pokemonId))
      .toEqual(expect.arrayContaining(['sudowoodo', 'gyarados', 'lapras', 'electrode', 'snorlax', 'lugia', 'ho-oh']));
    expect(sources.filter(source => source.details.kind === 'static').every(source => source.maxUses === 1)).toBe(true);
    expect(sources.filter(source => source.details.kind === 'wild' && ['entei', 'raikou', 'suicune'].includes(source.pokemonId)))
      .toEqual([]);
    expect(items.map(item => item.id).sort()).toEqual(['dragon-scale', 'fire-stone', 'kings-rock', 'leaf-stone', 'metal-coat', 'moon-stone', 'sun-stone', 'thunder-stone', 'up-grade', 'water-stone']);
    expect(items.every(item => item.review.referenceIds.includes('silver-items') && item.sources.every(source => locationIds.has(source.locationId))))
      .toBe(true);
  });
});
