import { beforeAll, describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Dataset } from '../src/domain/types';
import { getAvailability } from '../src/domain/availability';
import { checkTeam } from '../src/domain/team/check-team';
import { rawSharedData } from '../src/data/shared-data';
import { validateDataset } from '../src/data/validate-dataset';
import { rawGame } from '../src/data/games/blue';

const blueReferences = [
  ['blue-species', 'Pokémon Blue species, types, and Pokédex order', 'data/pokemon/base_stats.asm; data/pokemon/dex_order.asm; constants/pokemon_constants.asm'],
  ['blue-game', 'Pokémon Blue version scope and game rules', 'README.md; constants/pokemon_constants.asm; constants/type_constants.asm; data/maps/headers'],
  ['blue-type-chart', 'Generation I type IDs and effectiveness rules', 'constants/type_constants.asm; data/types/type_matchups.asm; engine/battle/core.asm'],
  ['blue-progression', 'Kanto story events, badges, and map progression', 'scripts; data/maps/objects; constants/event_constants.asm; constants/map_constants.asm'],
  ['blue-bosses', 'Blue Gym, Elite Four, and Champion parties', 'data/trainers/parties.asm; data/trainers/names.asm; data/trainers/special_moves.asm'],
  ['blue-locations', 'Kanto map identities and access scripts', 'data/maps/headers; data/maps/objects; scripts; data/maps/dungeon_maps.asm; data/maps/force_bike_surf.asm'],
  ['blue-capabilities', 'Field moves, badges, and overworld access checks', 'scripts; data/maps/badge_maps.asm; data/maps/force_bike_surf.asm; data/items/use_overworld.asm; constants/event_constants.asm'],
  ['blue-items', 'Blue item pickups, marts, key items, and fossils', 'data/items; data/events/hidden_item_coords.asm; data/maps/objects; constants/item_constants.asm'],
  ['blue-choices', 'Starter, Eevee, dojo, fossil, and Game Corner choices', 'scripts; data/events/prizes.asm; data/events/prize_mon_levels.asm; constants/event_constants.asm'],
  ['blue-encounters', 'Pokémon Blue wild encounter tables and methods', 'data/wild/probabilities.asm; data/wild/grass_water.asm; data/wild/good_rod.asm; data/wild/super_rod.asm; data/wild/maps; Blue/Red version conditionals in encounter files'],
  ['blue-breeding', 'Pokémon Blue breeding support check', 'Generation I has no breeding system'],
  ['blue-evolutions', 'Blue level, stone, and trade evolution data', 'data/pokemon/evos_moves.asm; constants/item_constants.asm; scripts'],
  ['blue-exclusions', 'Blue version exclusives and external Mew distribution', 'data/wild/maps; scripts; data/pokemon/mew.asm; Blue/Red version conditionals'],
].map(([id, title, locator]) => ({ id, title, locator, url: 'https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d', revision: 'af519899719f0754965776faac0e836a3b906e6d' }));
const existingReferenceIds = new Set(rawSharedData.references.map(reference => reference.id));
const validation = validateDataset({ ...rawSharedData,
  references: [...rawSharedData.references, ...blueReferences.filter(reference => !existingReferenceIds.has(reference.id))],
  games: [rawGame] });
if (!validation.ok) throw new Error(JSON.stringify(validation.error, null, 2));
const dataset: Dataset = validation.value;
const blue = dataset.games[0];
const query = (milestoneId: string) => {
  const result = getAvailability(dataset, { gameId: 'blue', milestoneId, respectLevelLimit: false });
  if (!result.ok) throw new Error(`Invalid Blue query: ${milestoneId}`);
  return result.value;
};
let early: ReturnType<typeof query>;
let late: ReturnType<typeof query>;
beforeAll(() => { early = query('route-1'); late = query('cerulean-cave-open'); }, 60000);

describe('Pokémon Blue reviewed data', () => {
  it('has exactly all 151 National Dex species in Kanto Dex order and local artwork', () => {
    expect(blue.profiles.map(profile => profile.pokemonId)).toEqual(dataset.pokemon.filter(p => p.introducedGeneration === 1).map(p => p.id));
    expect(blue.profiles.map(profile => profile.regionalDex)).toEqual(Array.from({ length: 151 }, (_, i) => i + 1));
    expect(blue.profiles.every(profile => profile.spriteSrc.startsWith('/pokemon/') && existsSync(resolve('public', profile.spriteSrc.slice(1))))).toBe(true);
  });
  it('uses the reviewed 15-type chart and no-gender or breeding rule', () => {
    expect(blue.typeChart.typeIds).toHaveLength(15);
    expect(blue.typeChart.typeIds).not.toContain('dark');
    expect(blue.typeChart.typeIds).not.toContain('steel');
    const at = (attack: string, defend: string) => blue.typeChart.matrix[blue.typeChart.typeIds.indexOf(attack)][blue.typeChart.typeIds.indexOf(defend)];
    expect(at('ghost', 'psychic')).toBe(0);
    expect(at('bug', 'poison')).toBe(2);
    expect(at('poison', 'bug')).toBe(2);
    expect(blue.game.breeding).toBeNull();
    expect(blue.breedingRules).toEqual([]);
    expect(blue.profiles.every(profile => profile.breeding === null && profile.genders.join() === 'not-applicable')).toBe(true);
  });
  it('covers each grass and water table with exact weighted slot rates', () => {
    const tableSources = blue.sources.filter(source => source.details.kind === 'wild'
      && (source.details.method === 'grass' || source.details.method === 'surf'));
    expect(tableSources).toHaveLength(460);
    const tableWeights = new Map<string, number>();
    for (const source of tableSources) {
      if (source.details.kind !== 'wild') continue;
      const marker = `-${source.pokemonId}-level`;
      const speciesIndex = source.id.indexOf(marker);
      expect(speciesIndex).toBeGreaterThan('wild-'.length);
      const tableId = `${source.id.slice('wild-'.length, speciesIndex)}-${source.details.method}`;
      tableWeights.set(tableId, (tableWeights.get(tableId) ?? 0) + source.details.ratePercent);
    }
    expect(tableWeights.size).toBe(58);
    expect([...tableWeights.values()].every(weight => Math.abs(weight - 100) < 0.000001)).toBe(true);

    const forestPikachu = tableSources.filter(source => source.id.startsWith('wild-viridian-forest-grass-pikachu-'));
    expect(forestPikachu.map(source => source.details.kind === 'wild' ? source.details.ratePercent : 0)).toEqual([4.296875, 1.171875]);
    expect(forestPikachu.reduce((total, source) => total + (source.details.kind === 'wild' ? source.details.ratePercent : 0), 0)).toBe(5.46875);
    expect(tableSources.some(source => source.id.startsWith('wild-sea-routes-route-19-surf-tentacool-'))).toBe(true);
    expect(tableSources.filter(source => source.id.startsWith('wild-sea-routes-route-19-surf-tentacool-'))).toHaveLength(7);
  });
  it('keeps the Route 2 eastern cave behind Cut and Flash behind its badge gate', () => {
    expect(blue.locations.find(location => location.id === 'digletts-cave')?.requirements)
      .toEqual({ kind: 'capability', id: 'cut-outside' });
    const flashItem = blue.items.find(item => item.id === 'hm05-flash')!.sources[0];
    expect(flashItem.locationId).toBe('route-2');
    expect(flashItem.requirements).toMatchObject({ kind: 'milestone', id: 'pewter-city' });
    expect(blue.capabilities.find(capability => capability.id === 'flash-outside')?.requirements)
      .toMatchObject({ kind: 'all', requirements: expect.arrayContaining([
        { kind: 'milestone', id: 'brock-defeated' },
      ]) });
  });
  it('proves early access through the Vermilion side paths before Misty', () => {
    const preMistyByRoute6 = query('route-6');
    expect(preMistyByRoute6.entries.magikarp.status).toBe('available');
    expect(preMistyByRoute6.entries.magikarp.currentPathIds.some(id => preMistyByRoute6.paths[id].sourceIds.includes('blue-old-rod-vermilion-city-magikarp'))).toBe(true);
    expect(preMistyByRoute6.entries.magikarp.currentPathIds.some(id => preMistyByRoute6.paths[id].sourceIds.includes('blue-super-rod-route-12-magikarp'))).toBe(false);
  });
  it('allows Route 9 and Rock Tunnel before Lt. Surge, and gets the Super Rod before Fuchsia', () => {
    const preSurge = query('route-9');
    expect(preSurge.entries.onix.status).toBe('available');
    expect(preSurge.entries.onix.currentPathIds.some(id => preSurge.paths[id].sourceIds.some(sourceId => sourceId.startsWith('wild-rock-tunnel-1f-grass-onix-')))).toBe(true);
    const flySource = blue.items.find(item => item.id === 'hm02-fly')!.sources[0];
    const flyHouse = blue.locations.find(location => location.id === 'route-16-fly-house')!;
    expect(flySource.locationId).toBe('route-16-fly-house');
    expect(flyHouse.requirements).toEqual({ kind: 'all', requirements: [
      { kind: 'milestone', id: 'celadon-city' }, { kind: 'capability', id: 'cut-outside' },
    ] });
    expect(flySource.requirements).toEqual({ kind: 'all', requirements: [] });
    const flyCapability = blue.capabilities.find(capability => capability.id === 'fly-outside')!;
    expect(flyCapability.requirements).toMatchObject({ kind: 'all', requirements: expect.arrayContaining([
      { kind: 'milestone', id: 'lt-surge-defeated' },
    ]) });
    const preFuchsia = query('pokemon-tower-cleared');
    expect(preFuchsia.entries.magikarp.status).toBe('available');
    expect(preFuchsia.entries.magikarp.currentPathIds.some(id => preFuchsia.paths[id].sourceIds.includes('blue-super-rod-route-12-magikarp'))).toBe(true);
    expect(preFuchsia.entries.lickitung.status).toBe('available');
    expect(preFuchsia.entries.lickitung.currentPathIds.some(id => preFuchsia.paths[id].sourceIds.includes('blue-trade-lickitung'))).toBe(true);
  });
  it('checks every Blue Game Corner Pokémon prize and scripted Power Plant capture', () => {
    expect(blue.sources).toHaveLength(654);
    expect(blue.sources.filter(source => source.details.kind === 'wild')).toHaveLength(615);
    expect(blue.sources.filter(source => source.details.kind === 'static')).toHaveLength(14);
    const prizeLevels = Object.fromEntries(blue.sources
      .filter(source => source.id.startsWith('blue-game-corner-'))
      .map(source => [source.pokemonId, source.level.kind === 'fixed' ? source.level.value : null]));
    expect(prizeLevels).toEqual({ abra: 6, clefairy: 12, nidorino: 17, dratini: 24, pinsir: 20, porygon: 18 });
    expect(blue.sources.filter(source => source.id.startsWith('blue-game-corner-')).every(source => source.maxUses === null)).toBe(true);

    const scriptedCaptures = blue.sources.filter(source => source.id.startsWith('blue-power-plant-'));
    expect(scriptedCaptures).toHaveLength(8);
    expect(scriptedCaptures.filter(source => source.pokemonId === 'voltorb')).toHaveLength(6);
    expect(scriptedCaptures.filter(source => source.pokemonId === 'electrode')).toHaveLength(2);
    expect(scriptedCaptures.every(source => source.locationId === 'power-plant'
      && source.requirements.kind === 'all' && source.requirements.requirements.length === 0
      && source.level.kind === 'fixed' && source.maxUses === 1)).toBe(true);
    expect(scriptedCaptures.filter(source => source.pokemonId === 'voltorb').every(source => source.level.kind === 'fixed' && source.level.value === 40)).toBe(true);
    expect(scriptedCaptures.filter(source => source.pokemonId === 'electrode').every(source => source.level.kind === 'fixed' && source.level.value === 43)).toBe(true);
    expect(blue.locations.find(location => location.id === 'power-plant')?.requirements).toEqual({ kind: 'capability', id: 'surf-outside' });
  });
  it('proves an early starter and route encounter, Blue access, and postgame access', () => {
    expect(early.entries.bulbasaur.status).toBe('available');
    expect(early.entries.pidgey.status).toBe('available');
    expect(late.entries.sandshrew.status).toBe('available');
    expect(late.entries['mr-mime'].status).toBe('available');
    expect(late.entries.mewtwo.status).toBe('available');
  });
  it('checks the Surf and Strength badge gates independently', () => {
    const preKoga = query('fuchsia-city');
    const postKoga = query('koga-defeated');
    expect(preKoga.entries.tangela.status).toBe('later');
    expect(preKoga.entries.tangela.blockers.some(blocker => blocker.relatedId === 'koga-defeated')).toBe(true);
    expect(postKoga.entries.tangela.status).toBe('available');
    const preRainbowBadge = query('giovanni-defeated');
    const postRainbowBadge = query('victory-road');
    expect(preRainbowBadge.entries.moltres.status).toBe('later');
    expect(preRainbowBadge.entries.moltres.blockers.some(blocker => blocker.relatedId === 'erika-defeated')).toBe(true);
    expect(postRainbowBadge.entries.moltres.status).toBe('available');
    const strength = blue.capabilities.find(capability => capability.id === 'strength-outside')!;
    const surf = blue.capabilities.find(capability => capability.id === 'surf-outside')!;
    const milestoneIds = (rule: typeof strength.requirements) => rule.kind === 'all' ? rule.requirements.flatMap(item => item.kind === 'milestone' ? [item.id] : []) : [];
    expect(milestoneIds(strength.requirements)).toContain('erika-defeated');
    expect(milestoneIds(strength.requirements)).not.toContain('koga-defeated');
    expect(milestoneIds(surf.requirements)).toContain('koga-defeated');
    expect(milestoneIds(surf.requirements)).not.toContain('erika-defeated');
  }, 20000);
  it('enforces starter, fossil, NPC trade, version exclusion, and Mew rules', () => {
    expect(checkTeam(early, ['bulbasaur', 'charmander'], 'whole-game').feasible).toBe(false);
    expect(checkTeam(late, ['omanyte', 'kabuto'], 'whole-game').feasible).toBe(false);
    expect(checkTeam(late, ['hitmonlee', 'hitmonchan'], 'whole-game').feasible).toBe(false);
    expect(checkTeam(late, ['nidoking','nidoqueen','clefable','wigglytuff'], 'whole-game').feasible).toBe(true);
    expect(late.entries.ekans.status).toBe('unavailable');
    expect(late.entries.mew.status).toBe('unavailable');
    expect(late.entries.mew.blockers.some(blocker => blocker.code === 'external-event')).toBe(true);
    expect(late.entries.alakazam.status).toBe('blocked');
  });
  it('resolves all 151 supported species at postgame progress', () => {
    const excluded = new Set(['ekans','arbok','oddish','gloom','vileplume','mankey','primeape','growlithe','arcanine','scyther','electabuzz','mew']);
    const tradeBlocked = new Set(['alakazam','golem','machamp','gengar']);
    expect(Object.keys(late.entries)).toHaveLength(151);
    for (const profile of blue.profiles) {
      const entry = late.entries[profile.pokemonId];
      if (excluded.has(profile.pokemonId)) expect(entry.status, profile.pokemonId).toBe('unavailable');
      else if (tradeBlocked.has(profile.pokemonId)) expect(entry.status, profile.pokemonId).toBe('blocked');
      else expect(entry.status, profile.pokemonId).toBe('available');
    }
  });
  it('keeps the 13 boss records, postgame checkpoint, and nine native trades', () => {
    expect(blue.bosses).toHaveLength(13);
    expect(blue.game.planner.defaultMilestoneId).toBe('champion-defeated');
    const trades = blue.sources.filter(source => source.details.kind === 'game-trade');
    expect(trades).toHaveLength(9);
    expect(trades.map(source => [source.details.kind === 'game-trade' ? source.details.offeredPokemonId : '', source.pokemonId]).sort()).toEqual([
      ['abra','mr-mime'],['nidoran-m','nidoran-f'],['nidorino','nidorina'],
      ['poliwhirl','jynx'],['ponyta','seel'],['raichu','electrode'],['slowbro','lickitung'],['spearow','farfetchd'],['venonat','tangela'],
    ].sort());
    expect(trades.every(source => {
      if (source.details.kind !== 'game-trade') return false;
      const offeredId = source.details.offeredPokemonId;
      return source.requirements.kind === 'all' && source.requirements.requirements.some(requirement => requirement.kind === 'pokemon' && requirement.id === offeredId && requirement.consumed)
        && source.level.kind === 'match-traded-pokemon' && source.level.pokemonId === offeredId;
    })).toBe(true);
    const lickitungTrade = trades.find(source => source.pokemonId === 'lickitung')!;
    expect(lickitungTrade.locationId).toBe('route-18-gate');
    expect(blue.locations.find(location => location.id === 'route-18-gate')?.requirements.kind).toBe('all');
    const moonStones = blue.items.find(item => item.id === 'moon-stone')!.sources;
    expect(moonStones.map(source => [source.id, source.maxUses])).toEqual([['moon-stone-mt-moon',2],['moon-stone-route-2',1],['moon-stone-rocket-hideout',1],['moon-stone-pokemon-mansion',1]]);
    expect(blue.items.filter(item => ['fire-stone','water-stone','thunder-stone','leaf-stone'].includes(item.id)).every(item => item.sources.every(source => source.maxUses === null))).toBe(true);
    expect(blue.items.find(item => item.id === 'super-rod')?.sources[0]).toMatchObject({locationId:'route-12-super-rod-house',requirements:{kind:'all'}});
    expect(blue.items.find(item => item.id === 'good-rod')?.sources[0]?.locationId).toBe('fuchsia-city');
    const blueLabels = [
      blue.game.name,
      ...blue.locations.map(location => location.name),
      ...blue.items.map(item => item.name),
      ...blue.capabilities.map(capability => capability.name),
      ...blue.choices.map(choice => choice.name),
      ...blue.milestones.map(milestone => milestone.name),
    ];
    expect(blueLabels.every(label => !/[\u00c3\u00c2\ufffd]/.test(label))).toBe(true);
    expect(blue.game.name).toBe('Pokémon Blue');
    expect(blue.items.find(item => item.id === 'poke-flute')?.name).toBe('Poké Flute');
  });
});
