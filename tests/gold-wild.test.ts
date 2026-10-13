import { createHash } from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';
import profiles from '../data/games/gold/pokemon.json';
import rawSources from '../data/games/gold/sources.json';
import type { PokemonSource } from '../src/domain/types';
import locations from '../data/games/gold/locations.json';
import capabilities from '../data/games/gold/capabilities.json';
import progression from '../data/games/gold/progression.json';
import commonSchema from '../docs/schema/common.schema.json';
import acquisitionSchema from '../docs/schema/acquisition.schema.json';

const pinnedMethods = ['grass', 'surf', 'old-rod', 'good-rod', 'super-rod'] as const;
const sources = rawSources as unknown as PokemonSource[];
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(commonSchema);
ajv.addSchema(acquisitionSchema);
const validateSource = ajv.compile({
  $ref: 'https://pokemon-playthrough-planner.local/schema/acquisition.schema.json#/$defs/source',
});

function wildSources(method: (typeof pinnedMethods)[number]) {
  return sources.filter((source) =>
    (method === 'grass' || method === 'surf'
      ? source.id.startsWith('gold-wild-')
      : source.id.startsWith('gold-fish-')) &&
    source.details.kind === 'wild' && source.details.method === method,
  );
}

function inventoryHash(method: (typeof pinnedMethods)[number]) {
  const rows = wildSources(method)
    .map((source) => [
      source.id,
      source.pokemonId,
      source.locationId,
      source.requirements,
      source.level,
      source.details.kind === 'wild' ? source.details.ratePercent : null,
      source.review.referenceIds,
    ])
    .sort(([a], [b]) => String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0);
  return createHash('sha256').update(JSON.stringify(rows)).digest('hex');
}

function sourceHash(rows: PokemonSource[]) {
  const inventory = rows.map((source) => [
    source.id,
    source.pokemonId,
    source.locationId,
    source.requirements,
    source.level,
    source.details.kind === 'wild' ? source.details.ratePercent : null,
    source.review.referenceIds,
  ]).sort(([a], [b]) => String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0);
  return createHash('sha256').update(JSON.stringify(inventory)).digest('hex');
}

describe('PokÃ©mon Gold land, Surf, and fishing coverage', () => {
  it('pins every land map, time window, slot, species, level, and table share', () => {
    const grass = wildSources('grass');
    const tableIds = new Set(grass.map((source) =>
      source.id.replace(/^gold-wild-/, '').replace(/-(morn|day|nite)-\d+$/, ''),
    ));

    expect(grass).toHaveLength(1911);
    expect(tableIds).toHaveLength(91);
    for (const tableId of tableIds) {
      const table = grass.filter((source) => source.id.startsWith(`gold-wild-${tableId}-`));
      expect(table).toHaveLength(21);
      for (const window of ['morn', 'day', 'nite']) {
        const rows = table.filter((source) => source.id.includes(`-${window}-`));
        expect(rows).toHaveLength(7);
        expect(rows.reduce((sum, source) =>
          sum + (source.details?.kind === 'wild' ? source.details.ratePercent ?? 0 : 0), 0,
        )).toBe(100);
      }
    }
    expect(inventoryHash('grass')).toBe('bdc4224f4b77b7b4a71ef15ba11393215e4841084bad8fbd43249246d054a36f');
  });

  it('pins every Surf map, slot, species, level, and table share', () => {
    const surf = wildSources('surf');
    const tableIds = new Set(surf.map((source) =>
      source.id.replace(/^gold-wild-/, '').replace(/-surf-\d+$/, ''),
    ));

    expect(surf).toHaveLength(186);
    expect(tableIds).toHaveLength(62);
    for (const tableId of tableIds) {
      const table = surf.filter((source) => source.id.startsWith(`gold-wild-${tableId}-surf-`));
      expect(table).toHaveLength(3);
      expect(table.reduce((sum, source) =>
        sum + (source.details?.kind === 'wild' ? source.details.ratePercent ?? 0 : 0), 0,
      )).toBe(100);
    }
      expect(inventoryHash('surf')).toBe('e8c70b4a66b51bb8b0e73b1f6e696b265e10fa42182d82d4915ab14e6f4b8b3c');
  });

  it('pins all non-swarm rod tables for 61 fishing maps', () => {
    const methodHashes = {
      'old-rod': '6ed33d8cf8695c5b8f49eac6ba9b3a4bed7c198b7debe3084fb2b7a3b25b52b3',
      'good-rod': 'b4a3b4345e9ec124bbc1c000eecbe9eba0f41e5177f0e23f6200804aab52cfbe',
      'super-rod': '417571879ff4506e5b303737ae6467f1da4115239e4c6936a0e8c00a8658bd95',
    };
    const expectedCounts = { 'old-rod': 183, 'good-rod': 305, 'super-rod': 305 };

    for (const method of ['old-rod', 'good-rod', 'super-rod'] as const) {
      const rodSources = wildSources(method);
      expect(rodSources).toHaveLength(expectedCounts[method]);
      expect(new Set(rodSources.map((source) =>
        source.id.match(/^gold-fish-(.*)-\d+$/)?.[1]?.replace(/-(day|nite)$/, ''),
      ))).toHaveLength(61);
      expect(rodSources.every((source) => source.requirements?.kind === 'capability'
        ? source.requirements.id === method
        : source.requirements?.kind === 'all' && source.requirements.requirements?.some((requirement) =>
          requirement.kind === 'capability' && requirement.id === method,
        ))).toBe(true);
      const mapIds = new Set(rodSources.map((source) =>
        source.id.replace(/^gold-fish-/, '').replace(new RegExp(`-${method}(?:-(?:day|nite))?-\\d+$`), ''),
      ));
      expect(mapIds).toHaveLength(61);
      for (const mapId of mapIds) {
        for (const window of ['day', 'nite']) {
          const timedRows = rodSources.filter((source) =>
            source.id.startsWith(`gold-fish-${mapId}-${method}-${window}-`),
          );
          const anytimeRows = rodSources.filter((source) =>
            source.id.startsWith(`gold-fish-${mapId}-${method}-`) &&
            !source.id.includes('-day-') && !source.id.includes('-nite-'),
          );
          expect([...anytimeRows, ...timedRows].reduce((sum, source) =>
            sum + (source.details?.kind === 'wild' ? source.details.ratePercent ?? 0 : 0), 0,
          )).toBe(100);
        }
      }
      expect(inventoryHash(method)).toBe(methodHashes[method]);
    }
  });

  it('keeps early and late rod access tied to the source map and matching rod capability', () => {
    const sourceById = new Map(sources.map((source) => [source.id, source]));
    const locationById = new Map(locations.map((location) => [location.id, location]));
    const capabilityById = new Map(capabilities.map((capability) => [capability.id, capability]));
    const early = sourceById.get('gold-fish-route-30-old-rod-1');
    const later = sourceById.get('gold-fish-olivine-city-good-rod-1');
    const postgame = sourceById.get('gold-fish-route-4-super-rod-1');

    expect(early?.pokemonId).toBe('magikarp');
    expect(early?.level).toEqual({ kind: 'fixed', value: 10 });
    expect(early?.details.kind === 'wild' && early.details.ratePercent).toBe(71);
    expect(early?.requirements).toMatchObject({ kind: 'all' });
    expect(locationById.get('route-30')?.requirements).toEqual({ kind: 'milestone', id: 'cherrygrove-city' });
    expect(capabilityById.get('old-rod')?.requirements).toEqual({ kind: 'milestone', id: 'route-32' });

    expect(later?.pokemonId).toBe('magikarp');
    expect(later?.requirements).toMatchObject({ kind: 'all' });
    expect(capabilityById.get('good-rod')?.requirements).toEqual({ kind: 'milestone', id: 'ecruteak-city' });

    expect(postgame?.pokemonId).toBe('goldeen');
    expect(capabilityById.get('super-rod')?.requirements).toEqual({ kind: 'milestone', id: 'kanto-open' });
  });

  it('keeps every added record schema-shaped and within its species gender profile', () => {
    const profileById = new Map(profiles.map((profile) => [profile.pokemonId, profile]));
    const locationById = new Set(locations.map((location) => location.id));
    const addedSources = sources.filter((source) =>
      source.id.startsWith('gold-wild-') || source.id.startsWith('gold-fish-'),
    );

    expect(new Set(sources.map((source) => source.id)).size).toBe(sources.length);
    expect(addedSources.every((source) => source.details?.kind === 'wild' &&
      Number.isInteger(source.details.ratePercent ?? NaN) &&
      (source.details.ratePercent ?? 0) > 0 && (source.details.ratePercent ?? 0) <= 100 &&
      source.level.kind === 'fixed' && Number.isInteger(source.level.value) &&
      source.review.referenceIds.includes('gold-encounters') &&
      source.review.checkedOn === '2026-10-12' &&
      source.genders.every((gender) => profileById.get(source.pokemonId)?.genders.includes(gender)) &&
      locationById.has(source.locationId),
    )).toBe(true);
    expect(sources.every((source) => validateSource(source)), JSON.stringify(validateSource.errors)).toBe(true);
  });

  it('pins Gold Headbutt tree-set tables and their map provenance', () => {
    const headbutt = sources.filter((source) => source.id.startsWith('gold-headbutt-'));
    const groups = new Map<string, PokemonSource[]>();
    for (const source of headbutt) {
      const match = source.id.match(/^gold-headbutt-(.+)-(common|rare)-\d+$/);
      expect(match).not.toBeNull();
      const key = `${match?.[1]}-${match?.[2]}`;
      groups.set(key, [...(groups.get(key) ?? []), source]);
    }
    expect(headbutt).toHaveLength(252);
    expect(sourceHash(headbutt)).toBe('25afaa543e72eb562531264a79cb4bd2de6d23779c2cbe46f88cb94ef19c0aeb');
    expect(groups).toHaveLength(42);
    for (const [key, rows] of groups) {
      expect(rows).toHaveLength(6);
      expect(rows.reduce((sum, source) => sum +
        (source.details.kind === 'wild' ? source.details.ratePercent : 0), 0)).toBe(100);
      expect(rows.every((source) => source.locationId === key.replace(/-(common|rare)$/, '') &&
        source.details.kind === 'wild' && source.details.method === 'headbutt' &&
        source.requirements.kind === 'capability' && source.requirements.id === 'headbutt' &&
        source.review.referenceIds.includes('gold-headbutt-contest'))).toBe(true);
    }
  });

  it('pins the four grass and one water swarm replacement tables', () => {
    const swarms = sources.filter((source) => source.id.startsWith('gold-swarm-'));
    const grass = swarms.filter((source) => source.details.kind === 'wild' && source.details.method === 'grass');
    const surf = swarms.filter((source) => source.details.kind === 'wild' && source.details.method === 'surf');
    expect(grass).toHaveLength(84);
    expect(surf).toHaveLength(3);
    expect(sourceHash(swarms)).toBe('bdd30ea4c3dd34186f2bc1d34ebc0ff90ba5dd18476b88b073a5943622f94b16');
    const grassGroups = new Map<string, PokemonSource[]>();
    for (const source of grass) {
      const key = source.id.replace(/-\d+$/, '');
      grassGroups.set(key, [...(grassGroups.get(key) ?? []), source]);
    }
    expect(grassGroups).toHaveLength(12);
    for (const rows of grassGroups.values()) {
      expect(rows).toHaveLength(7);
      expect(rows.reduce((sum, source) => sum +
        (source.details.kind === 'wild' ? source.details.ratePercent : 0), 0)).toBe(100);
      expect(rows.every((source) => source.requirements.kind === 'all' &&
        source.requirements.requirements.some((item) => item.kind === 'capability' && item.id === 'swarm-report'))).toBe(true);
    }
    expect(surf.map((source) => source.pokemonId)).toEqual(['goldeen', 'marill', 'seaking']);
    expect(surf.reduce((sum, source) => sum +
      (source.details.kind === 'wild' ? source.details.ratePercent : 0), 0)).toBe(100);
    expect([...grass, ...surf].every((source) => source.review.referenceIds.includes('gold-time'))).toBe(true);
  });

  it('releases three fixed-level roaming beasts after the Burned Tower event', () => {
    const roaming = sources.filter((source) => source.details.kind === 'roaming');
    const release = progression.find((milestone) => milestone.id === 'roaming-beasts-released');
    const capability = capabilities.find((item) => item.id === 'roaming-legendaries');
    const region = locations.find((item) => item.id === 'johto-roaming-routes');
    expect(release).toMatchObject({ locationId: 'burned-tower', displayOrder: 15, previousIds: ['ecruteak-city'] });
    expect(progression.find((milestone) => milestone.id === 'morty-defeated'))
      .toMatchObject({ displayOrder: 16, previousIds: ['roaming-beasts-released'] });
    expect(capability?.requirements).toEqual({ kind: 'milestone', id: 'roaming-beasts-released' });
    expect(region?.requirements).toEqual({ kind: 'milestone', id: 'roaming-beasts-released' });
    expect(roaming.map((source) => source.pokemonId).sort()).toEqual(['entei', 'raikou', 'suicune']);
    expect(sourceHash(roaming)).toBe('824dce6313167123d1e982228ceef25e25b305f4992d9e8193040be2a1f02bc0');
    expect(roaming.every((source) => source.locationId === 'johto-roaming-routes' &&
      source.requirements.kind === 'capability' && source.requirements.id === 'roaming-legendaries' &&
      source.level.kind === 'fixed' && source.level.value === 40 && source.maxUses === 1)).toBe(true);
    expect(roamingRoutes).toHaveLength(16);
    expect(roamingRoutes.every((route) => locations.some((location) => location.id === `route-${route}`))).toBe(true);
    expect(roamingRoutes).not.toContain(40);
    expect(roamingRoutes).not.toContain(41);
  });
});

const roamingRoutes = [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 42, 43, 44, 45, 46];
