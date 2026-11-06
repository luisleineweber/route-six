import { beforeAll, describe, expect, it } from 'vitest';
import type { Dataset } from '../src/domain/types';
import { getAvailability } from '../src/domain/availability';
import { checkTeam } from '../src/domain/team/check-team';
import { rawSharedData } from '../src/data/shared-data';
import { validateDataset } from '../src/data/validate-dataset';
import { rawGame } from '../src/data/games/red';

const validation = validateDataset({ ...rawSharedData, games: [rawGame] });
if (!validation.ok) throw new Error(JSON.stringify(validation.error, null, 2));
const dataset: Dataset = validation.value;
const red = dataset.games[0];
const query = (milestoneId: string) => {
  const result = getAvailability(dataset, { gameId: 'red', milestoneId, respectLevelLimit: false });
  if (!result.ok) throw new Error(`Invalid Red query: ${milestoneId}`);
  return result.value;
};

let start: ReturnType<typeof query>;
let late: ReturnType<typeof query>;
beforeAll(() => {
  start = query('pallet-town');
  late = query('cerulean-cave-open');
}, 60000);

describe('Pokémon Red reviewed data', () => {
  it('has exactly the 151 Generation I profiles in Kanto Pokédex order', () => {
    const expected = dataset.pokemon.filter(pokemon => pokemon.introducedGeneration === 1)
      .sort((a, b) => a.nationalDex - b.nationalDex).map(pokemon => pokemon.id);
    expect(red.profiles.map(profile => profile.pokemonId)).toEqual(expected);
    expect(red.profiles.map(profile => profile.regionalDex)).toEqual(Array.from({ length: 151 }, (_, i) => i + 1));
  });

  it('uses the complete 15-type Generation I chart and absent-gender rule', () => {
    expect(red.typeChart.typeIds).toHaveLength(15);
    expect(red.typeChart.typeIds).not.toContain('steel');
    expect(red.typeChart.typeIds).not.toContain('dark');
    expect(red.typeChart.matrix[red.typeChart.typeIds.indexOf('ghost')][red.typeChart.typeIds.indexOf('psychic')]).toBe(0);
    expect(red.game.breeding).toBeNull();
    expect(red.breedingRules).toEqual([]);
    expect(red.profiles.every(profile => profile.breeding === null && profile.genders.join() === 'not-applicable')).toBe(true);
  });

  it('proves starter choice, a first-route encounter, and later native access', () => {
    expect(start.entries.bulbasaur.status).toBe('available');
    expect(start.entries.pidgey.status).toBe('available');
    expect(late.entries.mewtwo.status).toBe('available');
    expect(late.entries.aerodactyl.status).toBe('available');
  });

  it('keeps finite choices, native trade paths, and explicit exclusions', () => {
    expect(checkTeam(start, ['bulbasaur', 'charmander'], 'whole-game').feasible).toBe(false);
    expect(late.entries.mew.status).toBe('unavailable');
    expect(late.entries.mew.blockers.some(blocker => blocker.code === 'external-event')).toBe(true);
    for (const id of ['sandshrew', 'vulpix', 'meowth', 'bellsprout', 'pinsir', 'magmar']) {
      expect(late.entries[id].status, id).toBe('unavailable');
    }
    for (const id of ['alakazam', 'machamp', 'golem', 'gengar']) {
      expect(late.entries[id].status, id).toBe('blocked');
      expect(late.entries[id].blockers.some(blocker => blocker.code === 'player-trade'), id).toBe(true);
    }
    expect(query('pokemon-tower-cleared').entries.lickitung.status).toBe('available');
    expect(JSON.stringify(red.sources.find(source => source.id === 'trade-lickitung')?.requirements))
      .not.toContain('fuchsia-city');
  });

  it('covers all Red prize species and the Power Plant fake-item encounters', () => {
    const prizes = red.sources.filter(source => source.id.startsWith('prize-'));
    expect(prizes.map(source => [source.pokemonId, source.level.kind === 'fixed' ? source.level.value : null])
      .sort((a, b) => String(a[0]).localeCompare(String(b[0])))).toEqual([
      ['abra',9],['clefairy',8],['dratini',18],['nidorina',17],['porygon',26],['scyther',25],
    ].sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
    expect(prizes.every(source => source.maxUses === null
      && source.requirements.kind === 'capability' && source.requirements.id === 'game-corner-prizes')).toBe(true);

    const plantEncounters = red.sources.filter(source => source.id.startsWith('static-power-plant-'));
    expect(plantEncounters).toHaveLength(8);
    expect(plantEncounters.map(source => [source.pokemonId, source.level.kind === 'fixed' ? source.level.value : null])
      .sort((a, b) => String(a[0]).localeCompare(String(b[0])) || Number(a[1]) - Number(b[1])))
      .toEqual([['voltorb',40],['voltorb',40],['voltorb',40],['voltorb',40],['voltorb',40],['voltorb',40],['electrode',43],['electrode',43]]
        .sort((a, b) => String(a[0]).localeCompare(String(b[0])) || Number(a[1]) - Number(b[1])));
    expect(plantEncounters.every(source => source.maxUses === 1 && source.details.kind === 'static'
      && source.requirements.kind === 'capability' && source.requirements.id === 'surf-outside')).toBe(true);
    const statics = red.sources.filter(source => source.id.startsWith('static-'));
    expect(statics).toHaveLength(14);
    expect(statics.map(source => source.id).filter(id => !id.startsWith('static-power-plant-')).sort()).toEqual([
      'static-articuno','static-mewtwo','static-moltres','static-snorlax-route12','static-snorlax-route16','static-zapdos',
    ]);
  });

  it('keeps the reviewed gift levels and all nine active NPC trade offers', () => {
    const gifts = red.sources.filter(source => ['gift-eevee','gift-hitmonchan','gift-hitmonlee','gift-lapras','gift-magikarp']
      .includes(source.id));
    expect(gifts.map(source => [source.id,source.pokemonId,source.level.kind === 'fixed' ? source.level.value : null])
      .sort((a,b) => String(a[0]).localeCompare(String(b[0])))).toEqual([
      ['gift-eevee','eevee',25],['gift-hitmonchan','hitmonchan',30],['gift-hitmonlee','hitmonlee',30],
      ['gift-lapras','lapras',15],['gift-magikarp','magikarp',5],
    ]);
    expect(gifts.every(source => source.maxUses === 1)).toBe(true);

    const trades = red.sources.filter(source => source.details.kind === 'game-trade');
    expect(trades.map(source => [source.pokemonId,
      source.details.kind === 'game-trade' ? source.details.offeredPokemonId : null, source.locationId])
      .sort((a,b) => String(a[0]).localeCompare(String(b[0])))).toEqual([
      ['electrode','raichu','cinnabar-island'],['farfetchd','spearow','vermilion-city'],['jynx','poliwhirl','cerulean-city'],
      ['lickitung','slowbro','route-18-gate'],['mr-mime','abra','route-2'],['nidoran-f','nidoran-m','route-5'],
      ['nidorina','nidorino','route-11'],['seel','ponyta','cinnabar-island'],['tangela','venonat','cinnabar-island'],
    ]);
  });

  it('resolves every catalogue species at postgame progress', () => {
    const unavailable = new Set(['sandshrew', 'sandslash', 'vulpix', 'ninetales', 'meowth', 'persian',
      'bellsprout', 'weepinbell', 'victreebel', 'pinsir', 'magmar', 'mew']);
    const tradeBlocked = new Set(['alakazam', 'golem', 'machamp', 'gengar']);
    expect(Object.keys(late.entries)).toHaveLength(151);
    for (const profile of red.profiles) {
      const entry = late.entries[profile.pokemonId];
      if (unavailable.has(profile.pokemonId)) expect(entry.status, profile.pokemonId).toBe('unavailable');
      else if (tradeBlocked.has(profile.pokemonId)) expect(entry.status, profile.pokemonId).toBe('blocked');
      else expect(entry.status, profile.pokemonId).toBe('available');
    }
  });

  it('keeps fossil choice, Cerulean Cave, and all nine used NPC trades in the data', () => {
    expect(red.choices.find(choice => choice.id === 'fossil-choice')?.maximumSelections).toBe(1);
    expect(checkTeam(late, ['kabuto', 'omanyte'], 'whole-game').feasible).toBe(false);
    expect(checkTeam(late, ['jolteon', 'vaporeon'], 'whole-game').feasible).toBe(false);
    expect(late.entries.mewtwo.currentPathIds.length).toBeGreaterThan(0);
    expect(red.sources.filter(source => source.details.kind === 'game-trade')).toHaveLength(9);
    expect(red.evolutions).toHaveLength(72);
  });

  it('keeps optional access gates separate from the recommended Gym order', () => {
    const beforeMisty = query('cerulean-city');
    expect(beforeMisty.entries.magikarp.status).toBe('available');
    expect(beforeMisty.entries.oddish.status).toBe('available');
    expect(beforeMisty.entries.mankey.status).toBe('available');
    expect(red.milestones.find(milestone => milestone.id === 'route-6')?.previousIds).toContain('cerulean-city');

    const beforeLtSurge = query('ss-anne-cleared');
    for (const id of ['rattata', 'spearow', 'ekans']) expect(beforeLtSurge.entries[id].status, id).toBe('available');
    expect(red.locations.find(location => location.id === 'route-9')?.requirements).toMatchObject({
      kind: 'all', requirements: expect.arrayContaining([
        { kind: 'milestone', id: 'cerulean-city' }, { kind: 'capability', id: 'cut-outside' },
      ]),
    });
    expect(red.locations.find(location => location.id === 'rock-tunnel')?.requirements).toMatchObject({
      kind: 'all', requirements: expect.arrayContaining([{ kind: 'capability', id: 'cut-outside' }]),
    });
    expect(red.locations.find(location => location.id === 'rock-tunnel')?.requirements).not.toMatchObject({
      kind: 'all', requirements: expect.arrayContaining([{ kind: 'milestone', id: 'lt-surge-defeated' }]),
    });
  });

  it('models the real optional Flash reward and the northern Super Rod path', () => {
    const byViridianForest = query('viridian-forest');
    expect(byViridianForest.entries.pikachu.status).toBe('available');
    expect(red.sources.some(source => source.id === 'wild-viridianforest-grass-pikachu'
      && source.level.kind === 'range' && source.level.minimum === 3 && source.level.maximum === 5
      && source.details.kind === 'wild' && source.details.ratePercent === 5.5)).toBe(true);
    const catchableBeforeCut = new Set(Object.values(byViridianForest.paths)
      .filter(path => path.evolutionIds.length === 0).map(path => path.pokemonId));
    expect(catchableBeforeCut.size).toBeGreaterThanOrEqual(10);
    const flash = red.items.find(item => item.id === 'hm05-flash')?.sources[0];
    expect(flash?.locationId).toBe('route-2-gate');
    expect(JSON.stringify(flash?.requirements)).toContain('hm05-aide-reward');
    expect(red.locations.find(location => location.id === 'route-2-gate')?.requirements).toMatchObject({
      kind: 'capability', id: 'cut-outside',
    });
    expect(red.milestones.find(milestone => milestone.id === 'hm05-aide-reward')?.previousIds)
      .toContain('ss-anne-cleared');
    expect(red.milestones.find(milestone => milestone.id === 'hm05-aide-reward')?.name).toContain('10 species caught');
    expect(red.capabilities.find(capability => capability.id === 'flash-outside')?.requirements).toMatchObject({
      kind: 'all', requirements: expect.arrayContaining([{ kind: 'milestone', id: 'brock-defeated' }]),
    });

    const superRod = red.items.find(item => item.id === 'super-rod')?.sources[0];
    expect(superRod?.locationId).toBe('route-12-super-rod-house');
    expect(superRod?.maxUses).toBe(1);
    expect(JSON.stringify(superRod?.requirements)).toContain('pokemon-tower-cleared');
    const tower = query('pokemon-tower-cleared');
    expect(Object.values(tower.paths).some(path => path.pokemonId === 'tentacool'
      && path.sourceIds.some(id => id.startsWith('fishing-superrod-')))).toBe(true);
  });

  it('covers every Red grass table and records the Red-weighted table rates', () => {
    const tableCounts: Record<string, number> = {
      ceruleancave1f:10,ceruleancave2f:9,ceruleancaveb1f:8,diglettscave:2,
      mtmoon1f:4,mtmoonb1f:4,mtmoonb2f:4,pokemonmansion1f:6,pokemonmansion2f:6,pokemonmansion3f:6,pokemonmansionb1f:6,
      pokemontower3f:3,pokemontower4f:3,pokemontower5f:3,pokemontower6f:3,pokemontower7f:3,powerplant:5,
      rocktunnel1f:4,rocktunnelb1f:4,route1:2,route2:3,route3:3,route4:3,route5:3,route6:3,route7:4,route8:4,
      route9:3,route10:3,route11:3,route12:4,route13:5,route14:6,route15:6,route16:4,route17:4,route18:4,
      route21:5,route22:4,route23:5,route24:5,route25:7,safarizonecenter:9,safarizoneeast:9,safarizonenorth:9,
      safarizonewest:9,seafoamislands1f:8,seafoamislandsb1f:7,seafoamislandsb2f:7,seafoamislandsb3f:6,
      seafoamislandsb4f:6,victoryroad1f:8,victoryroad2f:8,victoryroad3f:8,viridianforest:5,
    };
    const tables = Object.keys(tableCounts);
    expect(tables).toHaveLength(55);
    for (const table of tables) {
      const rows = red.sources.filter(source => source.id.startsWith(`wild-${table}-grass-`));
      expect(rows, table).toHaveLength(tableCounts[table]);
      expect(rows.reduce((sum, source) => sum + (source.details.kind === 'wild' ? source.details.ratePercent : 0), 0), table)
        .toBeCloseTo(100, 0);
    }
    const forest = red.sources.filter(source => source.id.startsWith('wild-viridianforest-grass-'));
    expect(forest.map(source => source.pokemonId).sort()).toEqual(['caterpie','kakuna','metapod','pikachu','weedle']);
    const route2Weedle = red.sources.find(source => source.id === 'wild-route2-grass-weedle');
    expect(route2Weedle?.details.kind === 'wild' && route2Weedle.details.ratePercent).toBe(15.2);
    expect(red.sources.some(source => source.id === 'wild-route25-grass-caterpie'
      && source.details.kind === 'wild' && source.details.ratePercent === 1.2)).toBe(true);
    const surf = red.sources.filter(source => source.details.kind === 'wild' && source.details.method === 'surf');
    expect(surf.map(source => source.id).sort()).toEqual([
      'wild-route21-surf-tentacool','wild-searoutes-route19-surf-tentacool','wild-searoutes-route20-surf-tentacool',
    ]);
    expect(surf.every(source => source.level.kind === 'range' && source.level.minimum === 5
      && source.level.maximum === 40 && source.details.kind === 'wild' && source.details.ratePercent === 100)).toBe(true);
    expect(red.sources.filter(source => source.details.kind === 'wild' && source.details.method === 'good-rod'))
      .toHaveLength(50);
    expect(red.sources.filter(source => source.details.kind === 'wild' && source.details.method === 'old-rod'))
      .toHaveLength(25);
    const superRod = red.sources.filter(source => source.details.kind === 'wild' && source.details.method === 'super-rod');
    expect(superRod).toHaveLength(80);
    const groupSpecies: Record<string, string> = {
      'pallet-town':'tentacool,poliwag','viridian-city':'tentacool,poliwag',
      'cerulean-city':'psyduck,goldeen,krabby','route-4':'psyduck,goldeen,krabby',
      'route-24':'psyduck,goldeen,krabby','route-25':'psyduck,goldeen,krabby',
      'vermilion-city':'krabby,shellder','route-6':'krabby,shellder','route-11':'krabby,shellder',
      'celadon-city':'poliwhirl,slowpoke','route-10':'poliwhirl,slowpoke',
      'fuchsia-city':'seaking,krabby,goldeen,magikarp',
      'cinnabar-island':'staryu,horsea,shellder,goldeen','route-19':'staryu,horsea,shellder,goldeen',
      'route-20':'staryu,horsea,shellder,goldeen','route-21':'staryu,horsea,shellder,goldeen',
      'seafoam-islands':'staryu,horsea,shellder,goldeen',
      'route-12':'tentacool,krabby,goldeen,magikarp','route-13':'tentacool,krabby,goldeen,magikarp',
      'route-17':'tentacool,krabby,goldeen,magikarp','route-18':'tentacool,krabby,goldeen,magikarp',
      'route-22':'goldeen,poliwag','route-23':'slowbro,seaking,kingler,seadra',
      'safari-zone':'dratini,krabby,psyduck,slowpoke','cerulean-cave':'slowbro,seaking,kingler,seadra',
    };
    for (const [locationId, species] of Object.entries(groupSpecies)) {
      expect(superRod.filter(source => source.locationId === locationId).map(source => source.pokemonId).sort(), locationId)
        .toEqual(species.split(',').sort());
    }
  });

  it('keeps each one-time Moon Stone and supports all four Moon Stone evolutions', () => {
    const moonStones = red.items.find(item => item.id === 'moon-stone')?.sources ?? [];
    expect(moonStones.map(source => source.id).sort()).toEqual([
      'moon-stone-mt-moon-1f', 'moon-stone-mt-moon-b2f', 'moon-stone-pokemon-mansion',
      'moon-stone-rocket-hideout', 'moon-stone-route-2',
    ]);
    expect(moonStones.every(source => source.maxUses === 1)).toBe(true);
    expect(checkTeam(late, ['nidoking', 'nidoqueen', 'clefable', 'wigglytuff'], 'whole-game').feasible).toBe(true);
  });

  it('uses unique IDs for all reviewed acquisition sources', () => {
    expect(new Set(red.sources.map(source => source.id)).size).toBe(red.sources.length);
  });
});
