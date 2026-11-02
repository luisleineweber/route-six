import { describe, expect, it } from 'vitest';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import profiles from '../data/games/yellow/pokemon.json';
import species from '../data/pokemon.json';
import typeChart from '../data/games/yellow/type-chart.json';
import bosses from '../data/games/yellow/bosses.json';
import game from '../data/games/yellow/game.json';
import milestones from '../data/games/yellow/progression.json';
import locations from '../data/games/yellow/locations.json';
import capabilities from '../data/games/yellow/capabilities.json';
import sources from '../data/games/yellow/sources.json';
import items from '../data/games/yellow/items.json';
import choices from '../data/games/yellow/choices.json';
import evolutions from '../data/games/yellow/evolutions.json';
import exclusions from '../data/games/yellow/exclusions.json';
import breedingRules from '../data/games/yellow/breeding-rules.json';
import { rawSharedData } from '../src/data/shared-data';
import { validateDataset } from '../src/data/validate-dataset';
import commonSchema from '../docs/schema/common.schema.json';
import gameSchema from '../docs/schema/game.schema.json';
import acquisitionSchema from '../docs/schema/acquisition.schema.json';

const schemaAjv = new Ajv2020({ allErrors: true, strict: false });
addFormats(schemaAjv);
schemaAjv.addSchema(commonSchema).addSchema(gameSchema).addSchema(acquisitionSchema);
const validProfile = schemaAjv.getSchema(`${gameSchema.$id}#/$defs/profile`)!;
const validSource = schemaAjv.getSchema(`${acquisitionSchema.$id}#/$defs/source`)!;
const validLocation = schemaAjv.getSchema(`${gameSchema.$id}#/$defs/location`)!;
const validMilestone = schemaAjv.getSchema(`${gameSchema.$id}#/$defs/milestone`)!;
const validItem = schemaAjv.getSchema(`${gameSchema.$id}#/$defs/item`)!;
const validChoice = schemaAjv.getSchema(`${gameSchema.$id}#/$defs/choiceGroup`)!;
const validEvolution = schemaAjv.getSchema(`${acquisitionSchema.$id}#/$defs/evolution`)!;
const validExclusion = schemaAjv.getSchema(`${acquisitionSchema.$id}#/$defs/exclusion`)!;

describe('Yellow reviewed core data', () => {
  it('passes full dataset validation with the shared species and references', () => {
    const result = validateDataset({ ...rawSharedData, games: [{
      game, profiles, typeChart, milestones, bosses, locations, capabilities, items,
      choices, sources, breedingRules, evolutions, exclusions,
    }] });
    expect(result.ok, result.ok ? '' : JSON.stringify(result.error)).toBe(true);
  });
  it('covers the 151 species and their Yellow Pokédex order', () => {
    expect(profiles).toHaveLength(151);
    expect(profiles.map(profile => profile.regionalDex)).toEqual(Array.from({ length: 151 }, (_, i) => i + 1));
    const expected = species.filter(pokemon => pokemon.introducedGeneration === 1).sort((a, b) => a.nationalDex - b.nationalDex);
    expect(profiles.map(profile => profile.pokemonId)).toEqual(expected.map(pokemon => pokemon.id));
    expect(profiles.map(profile => profile.regionalDex)).toEqual(expected.map(pokemon => pokemon.nationalDex));
    expect(profiles.every(profile => profile.spriteSrc === `/pokemon/${profile.regionalDex}.png`)).toBe(true);
    expect(profiles.every(profile => profile.types.every(type => typeChart.typeIds.includes(type)))).toBe(true);
    expect(profiles.every(profile => profile.genders.length === 1 && profile.genders[0] === 'not-applicable')).toBe(true);
    expect(profiles.every(profile => profile.breeding === null)).toBe(true);
    expect(profiles.filter(profile => profile.types.length === 1)).toHaveLength(89);
    expect(profiles.every(profile => new Set(profile.types).size === profile.types.length)).toBe(true);
    for (const profile of profiles) expect(validProfile(profile), JSON.stringify(validProfile.errors)).toBe(true);
  });


  it('reviews every Yellow grass, Surf, and rod table with schema-valid sources', () => {
    expect(sources).toHaveLength(838);
    expect(new Set(sources.map(source => source.id)).size).toBe(sources.length);
    const methodCount = (method: string) => sources.filter(source => source.details.kind === 'wild' && source.details.method === method).length;
    expect(methodCount('grass')).toBe(542);
    expect(methodCount('surf')).toBe(42);
    expect(methodCount('old-rod')).toBe(31);
    expect(methodCount('good-rod')).toBe(62);
    expect(methodCount('super-rod')).toBe(123);
    const superRodTables = new Set(sources.flatMap(source => {
      if (source.details.kind !== 'wild' || source.details.method !== 'super-rod') return [];
      return [source.id.match(/^yellow-(.+)-super-rod-/)![1]];
    }));
    expect(superRodTables).toEqual(new Set([
      'celadon-city', 'cerulean-cave-1f', 'cerulean-cave-b1f', 'cerulean-city',
      'cinnabar-island', 'fuchsia-city', 'pallet-town', 'route-4', 'route-6',
      'route-10', 'route-11', 'route-12', 'route-13', 'route-17', 'route-18',
      'route-19', 'route-20', 'route-21', 'route-22', 'route-23', 'route-24',
      'route-25', 'safari-zone-center', 'safari-zone-east', 'safari-zone-north',
      'safari-zone-west', 'seafoam-islands-b3f', 'seafoam-islands-b4f',
      'vermilion-city', 'vermilion-dock', 'viridian-city',
    ]));
    expect(sources.filter(source => source.pokemonId === 'pikachu').map(source => source.id))
      .toEqual(['yellow-starter-pikachu']);
    for (const source of sources) expect(validSource(source), JSON.stringify(validSource.errors)).toBe(true);

    const mapMethods = new Set(sources.flatMap(source => {
      if (source.details.kind !== 'wild'
        || (source.details.method !== 'grass' && source.details.method !== 'surf')) return [];
      const match = source.id.match(/^yellow-(.+)-(grass|surf)-/);
      return match ? [`${match[1]}:${match[2]}`] : [];
    }));
    expect(mapMethods).toEqual(new Set([
      'cerulean-cave-1f:grass', 'cerulean-cave-2f:grass', 'cerulean-cave-b1f:grass',
      'digletts-cave:grass', 'mt-moon-1f:grass', 'mt-moon-b1f:grass', 'mt-moon-b2f:grass',
      'pokemon-mansion-1f:grass', 'pokemon-mansion-2f:grass', 'pokemon-mansion-3f:grass',
      'pokemon-mansion-b1f:grass', 'pokemon-tower-3f:grass', 'pokemon-tower-4f:grass',
      'pokemon-tower-5f:grass', 'pokemon-tower-6f:grass', 'pokemon-tower-7f:grass',
      'power-plant:grass', 'rock-tunnel-1f:grass', 'rock-tunnel-b1f:grass',
      'route-1:grass', 'route-2:grass', 'route-3:grass', 'route-4:grass', 'route-5:grass',
      'route-6:grass', 'route-6:surf', 'route-7:grass', 'route-8:grass', 'route-9:grass',
      'route-10:grass', 'route-11:grass', 'route-12:grass', 'route-12:surf',
      'route-13:grass', 'route-13:surf', 'route-14:grass', 'route-15:grass',
      'route-16:grass', 'route-17:grass', 'route-18:grass', 'route-19:surf',
      'route-20:surf', 'route-21:grass', 'route-21:surf', 'route-22:grass',
      'route-23:grass', 'route-24:grass', 'route-25:grass',
      'safari-zone-center:grass', 'safari-zone-east:grass', 'safari-zone-north:grass',
      'safari-zone-west:grass', 'seafoam-islands-1f:grass', 'seafoam-islands-b1f:grass',
      'seafoam-islands-b2f:grass', 'seafoam-islands-b3f:grass', 'seafoam-islands-b3f:surf',
      'seafoam-islands-b4f:grass', 'seafoam-islands-b4f:surf', 'victory-road-1f:grass',
      'victory-road-2f:grass', 'victory-road-3f:grass', 'viridian-forest:grass',
    ]));
  });

  it('groups encounter slots by species and level before rounding table shares', () => {
    const source = (id: string) => sources.find(entry => entry.id === id)!;
    expect(source('yellow-route-1-grass-pidgey-3').details).toMatchObject({ kind: 'wild', method: 'grass', ratePercent: 29.69 });
    expect(source('yellow-route-1-grass-rattata-2').details).toMatchObject({ kind: 'wild', method: 'grass', ratePercent: 15.23 });
    expect(source('yellow-cerulean-city-super-rod-seaking-30').details).toMatchObject({ kind: 'wild', method: 'super-rod', ratePercent: 19.92 });
    expect(source('yellow-pallet-town-old-rod-magikarp-5').details).toMatchObject({ kind: 'wild', method: 'old-rod', ratePercent: 100 });
    expect(source('yellow-pallet-town-good-rod-goldeen-10').details).toMatchObject({ kind: 'wild', method: 'good-rod', ratePercent: 50 });
  });

  it('records Yellow gifts, Dojo choices, and all six Game Corner prize species', () => {
    const ids = new Set(sources.map(source => source.id));
    expect(['yellow-gift-bulbasaur', 'yellow-gift-charmander', 'yellow-gift-squirtle',
      'yellow-gift-eevee', 'yellow-gift-lapras', 'yellow-dojo-hitmonlee',
      'yellow-dojo-hitmonchan', 'yellow-game-corner-abra', 'yellow-game-corner-vulpix',
      'yellow-game-corner-wigglytuff', 'yellow-game-corner-scyther',
      'yellow-game-corner-pinsir', 'yellow-game-corner-porygon'].every(id => ids.has(id))).toBe(true);
    expect(['yellow-trade-dugtrio', 'yellow-trade-mr-mime', 'yellow-trade-muk',
      'yellow-trade-parasect', 'yellow-trade-rhydon', 'yellow-trade-dewgong',
      'yellow-trade-machoke', 'yellow-revive-omanyte', 'yellow-revive-kabuto',
      'yellow-revive-aerodactyl', 'yellow-snorlax-route-12', 'yellow-snorlax-route-16',
      'yellow-power-plant-voltorb-1', 'yellow-power-plant-voltorb-2',
      'yellow-power-plant-voltorb-3', 'yellow-power-plant-voltorb-4',
      'yellow-power-plant-voltorb-5', 'yellow-power-plant-voltorb-6',
      'yellow-power-plant-electrode-1', 'yellow-power-plant-electrode-2',
      'yellow-power-plant-zapdos'].every(id => ids.has(id))).toBe(true);
    expect(sources.find(source => source.id === 'yellow-dojo-hitmonlee')?.choice)
      .toEqual({ groupId: 'dojo-choice', optionId: 'hitmonlee' });
    expect(sources.find(source => source.id === 'yellow-dojo-hitmonchan')?.choice)
      .toEqual({ groupId: 'dojo-choice', optionId: 'hitmonchan' });
  });

  it('records Yellow item sources, starter Pikachu restriction, and exact native coverage', () => {
    const moonStone = items.find(item => item.id === 'moon-stone')!;
    expect(moonStone.sources.map(source => source.id)).toEqual([
      'yellow-moon-stone-mt-moon', 'yellow-moon-stone-route-2',
      'yellow-moon-stone-rocket-hideout', 'yellow-moon-stone-mt-moon-b2f-hidden',
      'yellow-moon-stone-pokemon-mansion-1f-hidden',
    ]);
    expect(moonStone.sources.every(source => source.maxUses === 1)).toBe(true);
    expect(choices.map(choice => choice.id)).toEqual(['dojo-choice', 'fossil-choice']);
    expect(evolutions).toHaveLength(72);
    expect(exclusions.find(entry => entry.pokemonId === 'mew')?.reason).toBe('external-event');
    const obtainable = new Set(sources.map(source => source.pokemonId));
    let changed = true;
    while (changed) {
      changed = false;
      for (const rule of evolutions) if (obtainable.has(rule.fromPokemonId) && !obtainable.has(rule.toPokemonId)
        && !(rule.excludedSourceIds ?? []).includes('yellow-starter-pikachu')) {
        obtainable.add(rule.toPokemonId); changed = true;
      }
    }
    const excludedIds = new Set(exclusions.map(exclusion => exclusion.pokemonId));
    expect(profiles.filter(profile => !obtainable.has(profile.pokemonId)).map(profile => profile.pokemonId))
      .toEqual(['weedle','kakuna','beedrill','ekans','arbok','raichu','meowth','persian','koffing','weezing','jynx','electabuzz','magmar','mew']);
    expect(excludedIds).toEqual(new Set(['weedle','kakuna','beedrill','ekans','arbok','raichu','meowth','persian','koffing','weezing','jynx','electabuzz','magmar','mew']));
    expect(evolutions.find(rule => rule.id === 'pikachu-raichu')?.excludedSourceIds)
      .toEqual(['yellow-starter-pikachu']);
    expect(sources.find(source => source.id === 'yellow-starter-pikachu')?.details)
      .toEqual({ kind: 'starter' });
    for (const item of items) expect(validItem(item), JSON.stringify(validItem.errors)).toBe(true);
    for (const choice of choices) expect(validChoice(choice), JSON.stringify(validChoice.errors)).toBe(true);
    for (const rule of evolutions) expect(validEvolution(rule), JSON.stringify(validEvolution.errors)).toBe(true);
    for (const exclusion of exclusions) expect(validExclusion(exclusion), JSON.stringify(validExclusion.errors)).toBe(true);
  });

  it('has the full Generation I type chart with the source-specific zero matchups', () => {
    expect(typeChart.typeIds).toHaveLength(15);
    expect(typeChart.matrix).toHaveLength(15);
    expect(typeChart.matrix.every(row => row.length === 15)).toBe(true);
    const i = (type: string) => typeChart.typeIds.indexOf(type);
    expect(typeChart.matrix[i('ghost')][i('psychic')]).toBe(0);
    expect(typeChart.matrix[i('normal')][i('ghost')]).toBe(0);
    expect(typeChart.matrix[i('ground')][i('flying')]).toBe(0);
    expect(typeChart.matrix[i('electric')][i('ground')]).toBe(0);
  });

  it('records Yellow trainer teams and its initial progress default', () => {
    expect(bosses).toHaveLength(13);
    expect(bosses.find(boss => boss.id === 'brock')?.highestLevel).toBe(12);
    expect(bosses.find(boss => boss.id === 'lt-surge')?.highestLevel).toBe(28);
    expect(bosses.find(boss => boss.id === 'champion')?.highestLevel).toBe(65);
    expect(bosses.filter(boss => boss.kind === 'gym').map(boss => boss.badgeNumber))
      .toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(game.firstMilestoneId).toBe('pallet-town');
    expect(game.planner.defaultMilestoneId).toBe('victory-road');
  });

  it('covers the Yellow story, locations, and field access gates', () => {
    for (const location of locations) expect(validLocation(location), JSON.stringify(validLocation.errors)).toBe(true);
    for (const milestone of milestones) expect(validMilestone(milestone), JSON.stringify(validMilestone.errors)).toBe(true);
    const milestoneIds = new Set(milestones.map(milestone => milestone.id));
    const locationIds = new Set(locations.map(location => location.id));
    const capabilityIds = new Set(capabilities.map(capability => capability.id));
    const bossIds = new Set(bosses.map(boss => boss.id));

    expect(milestones).toHaveLength(57);
    expect(locations).toHaveLength(83);
    expect(capabilities).toHaveLength(15);
    expect(capabilityIds).toContain('saffron-guard-drink');
    expect(milestones.every(milestone =>
      milestone.previousIds.every(id => milestoneIds.has(id)) &&
      (milestone.locationId === null || locationIds.has(milestone.locationId)) &&
      (milestone.nextBossId === null || bossIds.has(milestone.nextBossId))
    )).toBe(true);
    expect(game.planner.checkpoints.every(checkpoint => milestoneIds.has(checkpoint.milestoneId))).toBe(true);
    expect(Array.from({ length: 25 }, (_, index) => `route-${index + 1}`)
      .every(id => locationIds.has(id))).toBe(true);
    expect(milestones.filter(milestone => milestone.kind === 'route').map(milestone => milestone.locationId).sort())
      .toEqual(Array.from({ length: 25 }, (_, index) => `route-${index + 1}`).sort());

    const capability = (id: string) => capabilities.find(entry => entry.id === id)!;
    expect(capability('cut').requirements).toMatchObject({ kind: 'all', requirements: [
      { kind: 'item', id: 'hm01-cut' }, { kind: 'milestone', id: 'misty-defeated' },
    ] });
    expect(capability('surf').requirements).toMatchObject({ kind: 'all', requirements: [
      { kind: 'item', id: 'hm03-surf' }, { kind: 'milestone', id: 'koga-defeated' },
    ] });
    expect(locations.find(location => location.id === 'saffron-city')?.requirements)
      .toMatchObject({ kind: 'all', requirements: [
        { kind: 'milestone', id: 'celadon-city' }, { kind: 'capability', id: 'saffron-guard-drink' },
      ] });
    expect(capability('saffron-guard-drink').requirements).toMatchObject({ kind: 'any', requirements: [
      { kind: 'item', id: 'fresh-water', consumed: true },
      { kind: 'item', id: 'soda-pop', consumed: true },
      { kind: 'item', id: 'lemonade', consumed: true },
    ] });
    expect(locations.find(location => location.id === 'cerulean-cave')?.requirements)
      .toMatchObject({ kind: 'all', requirements: expect.arrayContaining([{ kind: 'milestone', id: 'champion-defeated' }]) });
    expect(milestones.find(milestone => milestone.id === 'route-1')?.previousIds).toEqual(['pallet-town']);
    expect(milestones.find(milestone => milestone.id === 'route-19')?.previousIds).toEqual(['koga-defeated']);
    expect(milestones.find(milestone => milestone.id === 'route-23')?.previousIds).toEqual(['giovanni-defeated']);
    expect(capabilities.filter(entry => ['cut','fly','surf','strength','flash'].includes(entry.id))
      .map(entry => entry.requirements.requirements?.[0].id)).toEqual(['hm01-cut','hm02-fly','hm03-surf','hm04-strength','hm05-flash']);
    expect(new Set(sources.map(entry => entry.pokemonId)).size).toBeGreaterThan(100);
    expect(exclusions.every(entry => !sources.some(source => source.pokemonId === entry.pokemonId))).toBe(true);
    expect(items.find(entry => entry.id === 'moon-stone')?.sources).toHaveLength(5);
    expect(items.find(entry => entry.id === 'moon-stone')?.sources.every(source => source.maxUses === 1)).toBe(true);
    expect(milestones.find(milestone => milestone.id === 'bill-helped')?.previousIds).toEqual(['cerulean-city']);
    expect(milestones.find(milestone => milestone.id === 'vermilion-city')?.previousIds).toEqual(['cerulean-city']);
    expect(milestones.find(milestone => milestone.id === 'rocket-hideout-cleared')?.previousIds).toEqual(['celadon-city']);
    expect(locations.find(location => location.id === 'route-12')?.requirements)
      .toMatchObject({ kind: 'all', requirements: [{ kind: 'milestone', id: 'lavender-town' }] });
    expect(locations.find(location => location.id === 'route-12-super-rod-house')?.requirements)
      .toMatchObject({ kind: 'all', requirements: [{ kind: 'milestone', id: 'lavender-town' }, { kind: 'capability', id: 'poke-flute' }] });
    expect(locations.find(location => location.id === 'route-16')?.requirements)
      .toMatchObject({ kind: 'all', requirements: expect.arrayContaining([{ kind: 'capability', id: 'poke-flute' }]) });
    expect(locations.find(location => location.id === 'rock-tunnel')?.requirements)
      .not.toMatchObject({ requirements: expect.arrayContaining([{ kind: 'capability', id: 'flash' }]) });
    const routeOneSource = sources.find(source => source.id === 'yellow-route-1-grass-pidgey-3')!;
    expect(routeOneSource.requirements).toEqual({ kind: 'all', requirements: [] });
    expect(locations.find(location => location.id === 'route-1')?.requirements).toMatchObject({ kind: 'all', requirements: [] });
    const oldRodSource = sources.find(source => source.id === 'yellow-vermilion-city-old-rod-magikarp-5')!;
    expect(oldRodSource.requirements).toEqual({ kind: 'capability', id: 'old-rod' });
    expect(locations.find(location => location.id === 'vermilion-city')?.requirements)
      .not.toMatchObject({ requirements: expect.arrayContaining([{ kind: 'milestone', id: 'misty-defeated' }]) });
    const caveSource = sources.find(source => source.id.startsWith('yellow-cerulean-cave-b1f-grass-'))!;
    expect(locations.find(location => location.id === caveSource.locationId)?.requirements)
      .toMatchObject({ kind: 'all', requirements: expect.arrayContaining([{ kind: 'milestone', id: 'champion-defeated' }]) });
  });
});
