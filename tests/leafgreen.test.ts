import { describe, expect, it } from 'vitest';
import sharedPokemon from '../data/pokemon.json';
import sharedReferences from '../data/references.json';
import game from '../data/games/leafgreen/game.json';
import profiles from '../data/games/leafgreen/pokemon.json';
import typeChart from '../data/games/leafgreen/type-chart.json';
import progression from '../data/games/leafgreen/progression.json';
import bosses from '../data/games/leafgreen/bosses.json';
import locations from '../data/games/leafgreen/locations.json';
import capabilities from '../data/games/leafgreen/capabilities.json';
import sources from '../data/games/leafgreen/sources.json';
import items from '../data/games/leafgreen/items.json';
import choices from '../data/games/leafgreen/choices.json';
import evolutions from '../data/games/leafgreen/evolutions.json';
import breedingRules from '../data/games/leafgreen/breeding-rules.json';
import exclusions from '../data/games/leafgreen/exclusions.json';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import commonSchema from '../docs/schema/common.schema.json';
import gameSchema from '../docs/schema/game.schema.json';
import acquisitionSchema from '../docs/schema/acquisition.schema.json';
import { rawGame } from '../src/data/games/leafgreen';
import { getAvailability } from '../src/domain/availability';
import { solve } from '../src/domain/availability/solve';
import { checkTeam } from '../src/domain/team/check-team';
import { fixture, milestone, none, review, source } from './fixtures';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateDataset } from '../src/data/validate-dataset';
import { dataset } from './local-data';
const leafgreen = dataset.games.find(entry => entry.game.id === 'leafgreen')!;

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(commonSchema).addSchema(gameSchema).addSchema(acquisitionSchema);
const validGame = ajv.getSchema(`${gameSchema.$id}#/$defs/game`)!;
const validProfile = ajv.getSchema(`${gameSchema.$id}#/$defs/profile`)!;
const validTypeChart = ajv.getSchema(`${gameSchema.$id}#/$defs/typeChart`)!;
const validMilestone = ajv.getSchema(`${gameSchema.$id}#/$defs/milestone`)!;
const validLocation = ajv.getSchema(`${gameSchema.$id}#/$defs/location`)!;
const validCapability = ajv.getSchema(`${gameSchema.$id}#/$defs/capability`)!;
const validBoss = ajv.getSchema(`${gameSchema.$id}#/$defs/boss`)!;
const validSource = ajv.getSchema(`${acquisitionSchema.$id}#/$defs/source`)!;
const validItem = ajv.getSchema(`${gameSchema.$id}#/$defs/item`)!;
const validChoice = ajv.getSchema(`${gameSchema.$id}#/$defs/choiceGroup`)!;
const validEvolution = ajv.getSchema(`${acquisitionSchema.$id}#/$defs/evolution`)!;
const validExclusion = ajv.getSchema(`${acquisitionSchema.$id}#/$defs/exclusion`)!;
const validBreedingRule = ajv.getSchema(`${gameSchema.$id}#/$defs/breedingRule`)!;
type RequirementLike = { kind: string; id?: string; requirements?: RequirementLike[] };

describe('LeafGreen reviewed data layer', () => {
  it('exports all LeafGreen collections without registering the game', () => {
    const assembled = rawGame as { game: { id: string }; items: unknown[]; choices: unknown[]; sources: unknown[] };
    expect(assembled.game.id).toBe('leafgreen');
    expect(assembled.items).toHaveLength(items.length);
    expect(assembled.choices).toHaveLength(choices.length);
    expect(assembled.sources).toHaveLength(sources.length);
  });

  it('covers every Generation III species with source-backed types and breeding data', () => {
    expect(profiles).toHaveLength(386);
    expect(profiles.map((profile) => profile.pokemonId).sort()).toEqual(
      sharedPokemon.filter(pokemon => pokemon.introducedGeneration <= game.generation).map(pokemon => pokemon.id).sort(),
    );
    expect(profiles.map((profile) => profile.regionalDex).filter(Boolean).sort((a, b) => a! - b!))
      .toEqual(Array.from({ length: 151 }, (_, index) => index + 1));
    expect(profiles.find((profile) => profile.pokemonId === 'bulbasaur')).toMatchObject({
      regionalDex: 1,
      types: ['grass', 'poison'],
      breeding: { eggGroupIds: ['monster', 'grass'] },
    });
    expect(profiles.find((profile) => profile.pokemonId === 'latias')?.genders).toEqual(['female']);
    expect(profiles.find((profile) => profile.pokemonId === 'ditto')?.genders).toEqual(['genderless']);
  });

  it('accepts every profile against the project schema and has no duplicate source values', () => {
    const errors = profiles.flatMap((profile) => {
      validProfile(profile);
      return [...(validProfile.errors ?? [])].map((error) => `${profile.pokemonId} ${error.instancePath}: ${error.message}`);
    });
    expect(errors).toEqual([]);
    expect(profiles.every((profile) => new Set(profile.types).size === profile.types.length)).toBe(true);
    expect(profiles.every((profile) => !profile.breeding ||
      new Set(profile.breeding.eggGroupIds).size === profile.breeding.eggGroupIds.length)).toBe(true);
  });

  it('has a complete Generation III chart with known type matchups', () => {
    expect(validTypeChart(typeChart)).toBe(true);
    expect(typeChart.typeIds).toHaveLength(17);
    expect(typeChart.matrix).toHaveLength(17);
    expect(typeChart.matrix.every((row) => row.length === 17)).toBe(true);
    const index = (typeId: string) => typeChart.typeIds.indexOf(typeId);
    expect(typeChart.matrix[index('fire')][index('grass')]).toBe(2);
    expect(typeChart.matrix[index('ground')][index('flying')]).toBe(0);
    expect(typeChart.matrix[index('ghost')][index('normal')]).toBe(0);
  });

  it('records all eight Gym leaders and the first League clear caps', () => {
    const gyms = bosses.filter((boss) => boss.kind === 'gym');
    expect(gyms.map((boss) => boss.badgeNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(gyms.map((boss) => boss.specialtyTypeId)).toEqual([
      'rock', 'water', 'electric', 'grass', 'poison', 'psychic', 'fire', 'ground',
    ]);
    expect(bosses.filter((boss) => boss.kind === 'elite-four').map((boss) => boss.highestLevel))
      .toEqual([54, 56, 58, 60]);
    expect(bosses.find((boss) => boss.kind === 'champion')?.highestLevel).toBe(63);
  });

  it('uses a real progress checkpoint as the default', () => {
    const milestoneIds = new Set(progression.map((milestone) => milestone.id));
    expect(milestoneIds.has(game.firstMilestoneId)).toBe(true);
    expect(milestoneIds.has(game.planner.defaultMilestoneId)).toBe(true);
    expect(game.planner.checkpoints.some((checkpoint) => checkpoint.milestoneId === game.planner.defaultMilestoneId))
      .toBe(true);
    expect(game.breeding?.hatchLevel).toBe(5);
    expect(validGame(game)).toBe(true);
    expect(bosses.every(boss => validBoss(boss))).toBe(true);
  });

  it('validates location and action gates and keeps the progress graph rooted', () => {
    const ids = new Set(progression.map((milestone) => milestone.id));
    const capabilityIds = new Set(capabilities.map((capability) => capability.id));
    const validRequirementRefs = (requirement: RequirementLike): boolean => {
      if (requirement.kind === 'all' || requirement.kind === 'any') {
        return (requirement.requirements ?? []).every(child => validRequirementRefs(child));
      }
      if (requirement.kind === 'milestone') return ids.has(requirement.id ?? '');
      if (requirement.kind === 'capability') return capabilityIds.has(requirement.id ?? '');
      return requirement.kind === 'item' || requirement.kind === 'pokemon';
    };
    expect(progression.every(milestone => validMilestone(milestone))).toBe(true);
    expect(locations.every(location => validLocation(location))).toBe(true);
    expect(capabilities.every(capability => validCapability(capability))).toBe(true);
    expect(locations.every(location => validRequirementRefs(location.requirements))).toBe(true);
    expect(capabilities.every(capability => validRequirementRefs(capability.requirements))).toBe(true);
    expect(progression.flatMap(milestone => milestone.previousIds).every(id => ids.has(id))).toBe(true);

    const visited = new Set<string>();
    const visit = (id: string, stack: Set<string>) => {
      if (stack.has(id)) throw new Error(`Progress cycle at ${id}`);
      if (visited.has(id)) return;
      const milestone = progression.find(entry => entry.id === id)!;
      const nextStack = new Set(stack).add(id);
      milestone.previousIds.forEach(previousId => visit(previousId, nextStack));
      visited.add(id);
    };
    progression.forEach(milestone => visit(milestone.id, new Set()));
    expect(progression.filter(milestone => milestone.previousIds.length === 0).map(milestone => milestone.id))
      .toEqual(['pallet-town']);
  });

  it('keeps One Island and the later Rainbow Pass gate separate', () => {
    const oneIsland = progression.find(milestone => milestone.id === 'one-island')!;
    const champion = progression.find(milestone => milestone.id === 'champion-defeated')!;
    expect(oneIsland.previousIds)
      .toEqual(['blaine-defeated']);
    expect(oneIsland.displayOrder).toBeLessThan(champion.displayOrder);
    expect(progression.find(milestone => milestone.id === 'national-dex')?.previousIds)
      .toEqual(['champion-defeated', 'one-island']);
    expect(progression.find(milestone => milestone.id === 'national-dex')?.name).toContain('60 caught');
    expect(progression.find(milestone => milestone.id === 'ruby-returned')?.previousIds)
      .toEqual(['national-dex']);
    expect(progression.find(milestone => milestone.id === 'rainbow-pass')?.previousIds)
      .toEqual(['ruby-returned']);
    expect(progression.find(milestone => milestone.id === 'fuchsia-city')?.previousIds)
      .toEqual(['celadon-city', 'pokemon-flute']);
    expect(progression.find(milestone => milestone.id === 'seven-island')?.previousIds)
      .toEqual(['rainbow-pass']);
    expect(progression.find(milestone => milestone.id === 'sapphire-returned')?.previousIds)
      .toEqual(['rainbow-pass', 'six-island', 'five-island', 'icefall-rockets-cleared']);
    expect(capabilities.find(capability => capability.id === 'tri-pass')?.requirements)
      .toEqual({ kind: 'milestone', id: 'one-island' });
    expect(capabilities.find(capability => capability.id === 'day-care')?.requirements)
      .toEqual({ kind: 'milestone', id: 'four-island' });
    expect(locations.find(location => location.id === 'seafoam-islands')?.requirements)
      .toEqual({ kind: 'capability', id: 'surf' });
    for (const id of ['route-12', 'route-13', 'route-14', 'route-15']) {
      expect(locations.find(location => location.id === id)?.requirements)
        .toEqual({ kind: 'milestone', id: 'pokemon-flute' });
    }
    expect(locations.find(location => location.id === 'route-18')?.requirements)
      .toEqual({ kind: 'all', requirements: [
        { kind: 'milestone', id: 'fuchsia-city' },
        { kind: 'capability', id: 'bicycle' },
      ] });
    expect(locations.find(location => location.id === 'route-17')?.requirements)
      .toEqual({ kind: 'all', requirements: [
        { kind: 'milestone', id: 'pokemon-flute' }, { kind: 'capability', id: 'bicycle' },
      ] });
  });

  it('covers each ordinary LeafGreen encounter table, map, method, species, and level', () => {
    const errors = sources.flatMap((source) => {
      validSource(source);
      return [...(validSource.errors ?? [])].map(error => `${source.id} ${error.instancePath}: ${error.message}`);
    });
    expect(errors).toEqual([]);
    expect(sources.filter(source => source.details.kind === 'wild')).toHaveLength(1727);
    expect(new Set(sources.map(source => source.id)).size).toBe(sources.length);

    const tableMethods = new Map<string, number>();
    const mapIds = new Set<string>();
    const capabilityIds = new Set(capabilities.map(capability => capability.id));
    const hasCapability = (requirement: RequirementLike, id: string): boolean =>
      (requirement.kind === 'capability' && requirement.id === id) ||
      (requirement.requirements ?? []).some(child => hasCapability(child, id));
    const wildSources = sources.filter(source => source.details.kind === 'wild');
    for (const source of wildSources) {
      if (typeof source.details.method !== 'string' || typeof source.details.ratePercent !== 'number') {
        throw new Error(`Invalid wild encounter details: ${source.id}`);
      }
      mapIds.add(source.locationId);
      const suffix = `-${source.details.method}-${source.pokemonId}-lv${source.level.minimum}-${source.level.maximum}`;
      expect(source.id).toMatch(new RegExp(`${suffix}$`));
      const tableKey = `${source.id.slice(0, -suffix.length)}-${source.details.method}`;
      tableMethods.set(tableKey, (tableMethods.get(tableKey) ?? 0) + source.details.ratePercent);
      expect(locations.some(location => location.id === source.locationId)).toBe(true);
      expect(source.genders).toEqual(profiles.find(profile => profile.pokemonId === source.pokemonId)?.genders);
      if (source.details.method !== 'grass') {
        expect(capabilityIds.has(source.details.method)).toBe(true);
        expect(hasCapability(source.requirements, source.details.method)).toBe(true);
      }
      expect(source.review.referenceIds).toEqual(['leafgreen-encounters']);
    }
    expect(wildSources).toHaveLength(1727);
    expect(mapIds.size).toBe(124);
    expect(tableMethods.size).toBe(319);
    expect([...tableMethods.values()].every(rate => rate === 100)).toBe(true);

    expect(sources).toContainEqual(expect.objectContaining({
      id: 'wild-route-1-sroute1-leafgreen-grass-pidgey-lv2-2',
      pokemonId: 'pidgey', locationId: 'route-1',
      level: { kind: 'range', minimum: 2, maximum: 2 },
      details: { kind: 'wild', method: 'grass', ratePercent: 10 },
    }));
    expect(sources).toContainEqual(expect.objectContaining({
      id: 'wild-four-island-icefall-cave-back-sfourislandicefallcaveback-leafgreen-grass-dewgong-lv49-49',
      pokemonId: 'dewgong', locationId: 'four-island-icefall-cave-back',
      level: { kind: 'range', minimum: 49, maximum: 49 },
      details: { kind: 'wild', method: 'grass', ratePercent: 10 },
    }));
    expect(sources.some(source => source.id.includes('altering-cave') && source.pokemonId !== 'zubat')).toBe(false);
  });

  it('records LeafGreen choices, non-wild encounters, trades, and roaming gates', () => {
    expect(items.every(item => validItem(item))).toBe(true);
    expect(choices.every(choice => validChoice(choice))).toBe(true);
    const nonWild = sources.filter(source => source.details.kind !== 'wild');
    expect(nonWild.every(source => validSource(source))).toBe(true);
    expect(nonWild.map(source => source.id).length).toBeGreaterThanOrEqual(30);
    expect(sources.find(source => source.id === 'gift-game-corner-pinsir')).toMatchObject({
      pokemonId: 'pinsir', level: { kind: 'fixed', value: 18 },
    });
    expect(sources.find(source => source.id === 'gift-game-corner-scyther')).toBeUndefined();
    expect(sources.find(source => source.id === 'fossil-omanyte-revived')).toMatchObject({
      details: { kind: 'fossil', itemId: 'helix-fossil' },
      choice: { groupId: 'mt-moon-fossil', optionId: 'helix-fossil' },
    });
    expect(sources.find(source => source.id === 'trade-mr-mime-for-abra')).toMatchObject({
      pokemonId: 'mr-mime', level: { kind: 'match-traded-pokemon', pokemonId: 'abra' },
      details: { kind: 'game-trade', offeredPokemonId: 'abra' },
      genders: ['male'],
    });
    expect(sources.find(source => source.id === 'trade-jynx-for-poliwhirl')?.genders).toEqual(['female']);
    expect(sources.find(source => source.id === 'trade-electrode-for-raichu')?.genders).toEqual(['genderless']);
    expect(sources.filter(source => source.details.kind === 'roaming')).toHaveLength(3);
    expect(sources.filter(source => source.details.kind === 'roaming').every(source =>
      source.level.kind === 'fixed' && source.level.value === 50 && source.maxUses === 1 &&
      source.locationId === 'kanto-roaming-routes' &&
      JSON.stringify(source.requirements).includes('network-machine'))).toBe(true);
    expect(locations.find(location => location.id === 'saffron-city')?.requirements)
      .toEqual({ kind: 'all', requirements: [
        { kind: 'milestone', id: 'saffron-city' },
        { kind: 'capability', id: 'saffron-access' },
      ] });
    expect(capabilities.find(capability => capability.id === 'saffron-access')?.requirements)
      .toEqual({ kind: 'item', id: 'tea', quantity: 1, consumed: false });
    expect(locations.find(location => location.id === 'route-17')?.requirements)
      .toEqual({ kind: 'all', requirements: [{ kind: 'milestone', id: 'pokemon-flute' }, { kind: 'capability', id: 'bicycle' }] });
    expect(locations.find(location => location.id === 'four-island-icefall-cave-back')?.requirements)
      .toEqual({ kind: 'all', requirements: [{ kind: 'milestone', id: 'four-island' }, { kind: 'capability', id: 'waterfall' }] });
  });

  it('records the two Lost Cave incense pickups and their unlocked breeding paths', () => {
    expect(items.find(item => item.id === 'lax-incense')?.sources).toEqual([expect.objectContaining({
      id: 'lax-incense-lost-cave', locationId: 'five-island-lost-cave-room11', maxUses: 1,
      requirements: { kind: 'milestone', id: 'five-island' },
    })]);
    expect(items.find(item => item.id === 'sea-incense')?.sources).toEqual([expect.objectContaining({
      id: 'sea-incense-lost-cave', locationId: 'five-island-lost-cave-room12', maxUses: 1,
      requirements: { kind: 'milestone', id: 'five-island' },
    })]);
    expect(breedingRules.find(rule => rule.id === 'breed-azurill')).toMatchObject({
      parentPokemonIds: ['marill', 'azumarill'], offspringPokemonIds: ['azurill'], requiredHeldItemId: 'sea-incense',
    });
    expect(breedingRules.find(rule => rule.id === 'breed-wynaut')).toMatchObject({
      parentPokemonIds: ['wobbuffet'], offspringPokemonIds: ['wynaut'], requiredHeldItemId: 'lax-incense',
    });
    expect(exclusions.some(entry => ['azurill', 'wynaut'].includes(entry.pokemonId))).toBe(false);

    const before = solve(leafgreen, leafgreen.milestones.find(point => point.id === 'four-island')!, false);
    const after = solve(leafgreen, leafgreen.milestones.find(point => point.id === 'sapphire-returned')!, false);
    expect(before.paths.has('azurill')).toBe(false);
    expect(before.paths.has('wynaut')).toBe(false);
    expect(after.paths.get('azurill')?.some(path => path.breedingSteps.some(step => step.ruleId === 'breed-azurill') &&
      path.itemUses.some(use => use.resourceId === 'item-source:sea-incense-lost-cave'))).toBe(true);
    expect(after.paths.get('wynaut')?.some(path => path.breedingSteps.some(step => step.ruleId === 'breed-wynaut') &&
      path.itemUses.some(use => use.resourceId === 'item-source:lax-incense-lost-cave'))).toBe(true);
  }, 30000);

  it('gives every breeding outcome a repeatable Four Island source', () => {
    const breedingSources = sources.filter(source => source.details.kind === 'breeding');
    const sourceKeys = new Set(breedingSources.map(source => `${source.details.kind === 'breeding' ? source.details.ruleId : ''}:${source.pokemonId}`));
    for (const rule of breedingRules) {
      for (const pokemonId of rule.offspringPokemonIds) {
        expect(sourceKeys.has(`${rule.id}:${pokemonId}`), rule.id + ' -> ' + pokemonId).toBe(true);
      }
    }
    expect(breedingSources.every(source => source.locationId === 'four-island' && source.maxUses === null &&
      source.level.kind === 'fixed' && source.level.value === game.breeding?.hatchLevel &&
      source.details.kind === 'breeding' && source.details.capabilityId === 'day-care')).toBe(true);

    const eeveeGift = sources.find(source => source.id === 'gift-eevee-celadon')!;
    const eeveeEgg = breedingSources.find(source => source.pokemonId === 'eevee')!;
    expect(eeveeGift.maxUses).toBe(1);
    expect(eeveeEgg.maxUses).toBeNull();
    expect(eeveeEgg.requirements).toEqual({ kind: 'capability', id: 'day-care' });
    const solved = getAvailability(dataset, { gameId: 'leafgreen', milestoneId: 'four-island', respectLevelLimit: false });
    expect(solved.ok).toBe(true);
    if (solved.ok) {
      expect(solved.value.entries.eevee.futurePathIds.map(id => solved.value.paths[id]).some(path =>
        path.sourceIds.includes(eeveeEgg.id) && path.breedingSteps.some(step => step.ruleId === 'breed-eevee'))).toBe(true);
    }
  }, 30000);

  it('checks reviewed evolution and breeding rules against the game schema', () => {
    expect(evolutions).toHaveLength(181);
    expect(evolutions.every(rule => validEvolution(rule))).toBe(true);
    expect(breedingRules.length).toBeGreaterThan(0);
    expect(breedingRules.every(rule => validBreedingRule(rule))).toBe(true);
    expect(exclusions.every(rule => validExclusion(rule))).toBe(true);
    expect(evolutions.filter(rule => rule.trigger === 'use-item').every(rule =>
      items.some(item => item.id === rule.itemId))).toBe(true);
    expect(evolutions.filter(rule => rule.trigger === 'player-trade')).toHaveLength(12);
    expect(evolutions.filter(rule => rule.itemId !== null).every(rule =>
      items.some(item => item.id === rule.itemId))).toBe(true);
    expect(items.find(item => item.id === 'sun-stone')?.sources).toContainEqual(
      expect.objectContaining({ id: 'sun-stone-seven-island', locationId: 'seven-island-sevault-canyon' }),
    );
    expect(evolutions.some(rule => rule.fromPokemonId === 'eevee' &&
      ['espeon', 'umbreon'].includes(rule.toPokemonId))).toBe(false);
    expect(evolutions.some(rule => rule.fromPokemonId === 'feebas' &&
      rule.toPokemonId === 'milotic')).toBe(false);
    expect(evolutions.find(rule => rule.id === 'nincada-to-shedinja')).toMatchObject({
      toPokemonId: 'shedinja',
      coProductIds: ['ninjask'],
      conditions: [{ kind: 'party-space', freeSlots: 1 }],
    });
    expect(JSON.stringify(evolutions.find(rule => rule.id === 'nincada-to-shedinja'))).not.toContain('poke-ball');
  });

  it('gives every profile one native, trade-blocked, or reviewed exclusion outcome', () => {
    const native = new Set(sources.filter(entry => entry.details.kind !== 'breeding').map(entry => entry.pokemonId));
    const tradeBlocked = new Set(evolutions.filter(rule => rule.trigger === 'player-trade').map(rule => rule.toPokemonId));
    const excluded = new Set(exclusions.map(entry => entry.pokemonId));
    let changed = true;
    while (changed) {
      changed = false;
      for (const rule of evolutions.filter(entry => entry.trigger !== 'player-trade')) {
        if (native.has(rule.fromPokemonId)) {
          for (const id of [rule.toPokemonId, ...rule.coProductIds]) {
            if (!native.has(id)) { native.add(id); changed = true; }
          }
        }
      }
      for (const rule of breedingRules) {
        if (rule.parentPokemonIds.some(id => native.has(id))) {
          for (const id of rule.offspringPokemonIds) {
            if (!native.has(id)) { native.add(id); changed = true; }
          }
        }
      }
    }
    for (const id of [...tradeBlocked]) if (native.has(id)) tradeBlocked.delete(id);
    expect(native.size).toBe(181);
    expect(tradeBlocked.size).toBe(12);
    expect(excluded.size).toBe(193);
    expect(native.size + tradeBlocked.size + excluded.size).toBe(386);
    expect(new Set([...native, ...tradeBlocked, ...excluded]).size).toBe(386);
    expect([...excluded].every(id => profiles.some(profile => profile.pokemonId === id))).toBe(true);
    expect([...excluded].some(id => native.has(id))).toBe(false);
    const solved = solve(leafgreen, leafgreen.milestones.find(point => point.id === 'network-machine')!, false,
      new Set(['seven-island']));
    const proved = new Set(solved.paths.keys());
    expect(proved.size).toBe(181);
    expect(proved).toEqual(native);
    expect([...excluded].some(id => proved.has(id))).toBe(false);
    expect([...tradeBlocked].some(id => proved.has(id))).toBe(false);
    expect(exclusions.filter(entry => entry.reason === 'external-event').map(entry => entry.pokemonId).sort())
      .toEqual(['celebi', 'deoxys', 'ho-oh', 'jirachi', 'lugia', 'mew']);
  }, 30000);

  it('keeps all thirteen local files strict-JSON readable without a BOM', () => {
    const files = [
      'game.json', 'pokemon.json', 'type-chart.json', 'progression.json', 'bosses.json',
      'locations.json', 'capabilities.json', 'items.json', 'choices.json', 'sources.json',
      'breeding-rules.json', 'evolutions.json', 'exclusions.json',
    ];
    for (const file of files) {
      const text = readFileSync(resolve('data/games/leafgreen', file), 'utf8');
      expect(text.charCodeAt(0), file).not.toBe(0xfeff);
      expect(() => JSON.parse(text), file).not.toThrow();
    }
  });

  it('passes full dataset shape and semantic validation with parent-owned refs supplied', () => {
    const references = [...sharedReferences];
    const proposals = [
      ['leafgreen-trades', 'All nine LeafGreen NPC trades', 'src/data/ingame_trades.h and data/maps/*/scripts.inc'],
      ['leafgreen-roamers', 'LeafGreen roaming species', 'src/roamer.c and One Island network-machine event'],
    ] as const;
    for (const [id, title, locator] of proposals) {
      if (!references.some(reference => reference.id === id)) {
        references.push({
          id, title, locator,
          url: 'https://github.com/pret/pokefirered/tree/037335f4c725d7c9aecdac87066f2002b4bd7e14',
          revision: '037335f4c725d7c9aecdac87066f2002b4bd7e14',
        });
      }
    }
    const result = validateDataset({
      schemaVersion: 2, references, pokemon: sharedPokemon, games: [rawGame],
    });
    expect(result.ok, result.ok ? '' : JSON.stringify(result.error)).toBe(true);
  });

  it('keeps each roaming legendary compatible only with its matching starter', () => {
    const starters = ['bulbasaur', 'charmander', 'squirtle'];
    const roamers = ['entei', 'suicune', 'raikou'];
    const actual = rawGame as { sources: typeof sources; choices: typeof choices };
    expect(actual.sources.filter(source => source.details.kind === 'roaming').map(source =>
      [source.pokemonId, source.choice?.optionId])).toEqual([
      ['entei', 'bulbasaur'], ['suicune', 'charmander'], ['raikou', 'squirtle'],
    ]);
    const { data, game } = fixture([...starters, ...roamers]);
    game.choices.push({ id: 'starter-choice', name: 'Starter', options: starters, maximumSelections: 1, review });
    starters.forEach(id => source(game, `starter-${id}`, id, 5, none, { maxUses: 1, choice: { groupId: 'starter-choice', optionId: id } }));
    roamers.forEach((id, index) => source(game, `roamer-${id}`, id, 50, milestone('gate'), {
      maxUses: 1, details: { kind: 'roaming' }, choice: { groupId: 'starter-choice', optionId: starters[index] },
    }));
    const result = getAvailability(data, { gameId: game.game.id, milestoneId: 'gate', respectLevelLimit: false });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(checkTeam(result.value, ['bulbasaur', 'entei'], 'current-progress').feasible).toBe(true);
    expect(checkTeam(result.value, ['charmander', 'entei'], 'current-progress').feasible).toBe(false);
    expect(checkTeam(result.value, ['squirtle', 'raikou'], 'current-progress').feasible).toBe(true);
    expect(checkTeam(result.value, ['raikou', 'suicune'], 'current-progress').feasible).toBe(false);
  });

});

