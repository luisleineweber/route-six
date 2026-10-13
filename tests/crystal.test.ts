import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { rawSharedData } from '../src/data/shared-data';
import { rawGame } from '../src/data/games/crystal';
import { validateDataset } from '../src/data/validate-dataset';

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T;
const profiles = readJson<Array<{
  pokemonId: string;
  types: string[];
  genders: string[];
  breeding: { eggGroupIds: string[] } | null;
  regionalDex: number;
  review: { referenceIds: string[]; checkedOn: string };
}>>('data/games/crystal/pokemon.json');
const typeChart = readJson<{ typeIds: string[]; matrix: number[][];
  review: { referenceIds: string[]; checkedOn: string } }>(
  'data/games/crystal/type-chart.json');
const bosses = readJson<Array<{
  id: string;
  kind: string;
  highestLevel: number;
  badgeNumber?: number;
  specialtyTypeId?: string | null;
  review: { referenceIds: string[]; checkedOn: string };
}>>('data/games/crystal/bosses.json');
const exclusions = readJson<Array<{ pokemonId: string; reason: string; review: { referenceIds: string[] } }>>(
  'data/games/crystal/exclusions.json');

const reviewedDexOrder = `chikorita bayleef meganium cyndaquil quilava typhlosion totodile croconaw feraligatr
pidgey pidgeotto pidgeot spearow fearow hoothoot noctowl rattata raticate sentret furret
pichu pikachu raichu caterpie metapod butterfree weedle kakuna beedrill ledyba ledian
spinarak ariados geodude graveler golem zubat golbat crobat cleffa clefairy clefable igglybuff
jigglypuff wigglytuff togepi togetic sandshrew sandslash ekans arbok dunsparce mareep flaaffy
ampharos wooper quagsire gastly haunter gengar unown onix steelix bellsprout weepinbell victreebel
hoppip skiploom jumpluff paras parasect poliwag poliwhirl poliwrath politoed magikarp gyarados
goldeen seaking slowpoke slowbro slowking oddish gloom vileplume bellossom drowzee hypno abra
kadabra alakazam ditto pineco forretress nidoran-f nidorina nidoqueen nidoran-m nidorino nidoking
yanma sunkern sunflora exeggcute exeggutor sudowoodo wobbuffet venonat venomoth scyther scizor
pinsir heracross koffing weezing grimer muk magnemite magneton voltorb electrode aipom snubbull
granbull vulpix ninetales growlithe arcanine stantler marill azumarill diglett dugtrio mankey primeape
meowth persian psyduck golduck machop machoke machamp tyrogue hitmonlee hitmonchan hitmontop
girafarig tauros miltank magby magmar smoochum jynx elekid electabuzz mr-mime smeargle farfetchd
natu xatu qwilfish tentacool tentacruel krabby kingler shuckle staryu starmie shellder cloyster corsola
remoraid octillery chinchou lanturn seel dewgong lickitung tangela eevee vaporeon jolteon flareon espeon
umbreon horsea seadra kingdra gligar delibird swinub piloswine teddiursa ursaring phanpy donphan
mantine skarmory doduo dodrio ponyta rapidash cubone marowak kangaskhan rhyhorn rhydon murkrow
houndour houndoom slugma magcargo sneasel misdreavus porygon porygon2 chansey blissey lapras omanyte
omastar kabuto kabutops aerodactyl snorlax bulbasaur ivysaur venusaur charmander charmeleon charizard
squirtle wartortle blastoise articuno zapdos moltres raikou entei suicune dratini dragonair dragonite
larvitar pupitar tyranitar lugia ho-oh mewtwo mew celebi`.split(/\s+/);

const sha256 = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

describe('Pokémon Crystal reviewed data layer', () => {
  it('validates the complete local Crystal dataset against shared species and references', () => {
    const result = validateDataset({ ...rawSharedData, games: [rawGame] });
    expect(result.ok, result.ok ? '' : JSON.stringify(result.error, null, 2)).toBe(true);
  });

  it('keeps exclusions limited to source-confirmed no-native paths', () => {
    expect(exclusions.map(record => record.pokemonId).sort()).toEqual([
      'articuno', 'bulbasaur', 'celebi', 'charmander', 'girafarig', 'kabuto', 'mankey',
      'mareep', 'mew', 'mewtwo', 'moltres', 'omanyte', 'remoraid', 'squirtle', 'vulpix', 'zapdos',
    ]);
    expect(exclusions.every(record => record.reason === 'other-version' || record.reason === 'external-event')).toBe(true);
    expect(exclusions.every(record => record.review.referenceIds.includes('crystal-exclusions'))).toBe(true);
  });

  it('matches the 251-entry source order and regional numbers', () => {
    expect(profiles.map(profile => profile.pokemonId)).toEqual(reviewedDexOrder);
    expect(profiles.map(profile => profile.regionalDex)).toEqual(
      Array.from({ length: 251 }, (_, index) => index + 1));
    expect(profiles.every(profile => profile.review.referenceIds.includes('crystal-species')
      && profile.review.checkedOn === '2026-10-12')).toBe(true);
  });

  it('matches every Crystal source type, gender category, and Egg Group', () => {
    // This digest covers the reviewed source facts for all 251 profiles in Dex order.
    const facts = profiles.map(profile => [profile.pokemonId, profile.types, profile.genders,
      profile.breeding?.eggGroupIds ?? null]);
    expect(sha256(facts)).toBe('50fe4207e41882d913fe601c9b87d1a28c7abc1a80f4e3060b066b246d151592');
    expect(profiles.find(profile => profile.pokemonId === 'magnemite')).toMatchObject({
      types: ['electric', 'steel'], genders: ['genderless'], breeding: { eggGroupIds: ['mineral'] },
    });
    expect(profiles.find(profile => profile.pokemonId === 'nidoran-f')).toMatchObject({
      genders: ['female'], breeding: { eggGroupIds: ['monster', 'field'] },
    });
    expect(profiles.find(profile => profile.pokemonId === 'nidoran-m')).toMatchObject({
      genders: ['male'], breeding: { eggGroupIds: ['monster', 'field'] },
    });
  });

  it('matches the complete 17-type Generation II matchup table', () => {
    expect(typeChart.typeIds).toEqual([
      'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground',
      'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel',
    ]);
    expect(typeChart.matrix).toHaveLength(17);
    expect(typeChart.matrix.every(row => row.length === 17)).toBe(true);
    expect(sha256([typeChart.typeIds, typeChart.matrix]))
      .toBe('29487059f0ac657eb5a04c62c147a73c054b11c18ad7f3b3a8ef466fffec1c27');
    expect(typeChart.review.referenceIds).toContain('crystal-type-chart');
    expect(typeChart.review.checkedOn).toBe('2026-10-12');
  });

  it('matches the 22 source boss kinds, badge order, and highest party levels', () => {
    expect(bosses.map(({ id, highestLevel }) => [id, highestLevel])).toEqual([
      ['falkner', 9], ['whitney', 20], ['bugsy', 16], ['morty', 25], ['pryce', 31],
      ['jasmine', 35], ['chuck', 30], ['clair', 40], ['will', 42], ['koga', 44],
      ['bruno', 46], ['karen', 47], ['lance', 50], ['brock', 44], ['misty', 47],
      ['lt-surge', 46], ['erika', 46], ['janine', 39], ['sabrina', 48], ['blaine', 50],
      ['blue', 58], ['red', 81],
    ]);
    expect(bosses.filter(boss => boss.kind === 'gym').map(boss => boss.badgeNumber)).toEqual(
      Array.from({ length: 16 }, (_, index) => index + 1));
    expect(bosses.filter(boss => boss.kind === 'gym').map(boss => [boss.id, boss.specialtyTypeId])).toEqual([
      ['falkner', 'flying'], ['whitney', 'normal'], ['bugsy', 'bug'], ['morty', 'ghost'],
      ['pryce', 'ice'], ['jasmine', 'steel'], ['chuck', 'fighting'], ['clair', 'dragon'],
      ['brock', 'rock'], ['misty', 'water'], ['lt-surge', 'electric'], ['erika', 'grass'],
      ['janine', 'poison'], ['sabrina', 'psychic'], ['blaine', 'fire'], ['blue', null],
    ]);
    expect(bosses.find(boss => boss.id === 'blue')).toMatchObject({ kind: 'gym', specialtyTypeId: null });
    expect(bosses.find(boss => boss.id === 'red')?.kind).toBe('trainer');
    expect(bosses.every(boss => boss.review.referenceIds.includes('crystal-bosses'))).toBe(true);
    expect(bosses.every(boss => boss.review.checkedOn === '2026-10-12')).toBe(true);
  });
});

describe('Pokémon Crystal progress and field access', () => {
  const game = readJson<{
    firstMilestoneId: string;
    planner: { defaultMilestoneId: string; checkpoints: Array<{ milestoneId: string }> };
  }>('data/games/crystal/game.json');
  const progression = readJson<Array<{
    id: string; previousIds: string[]; locationId: string | null; nextBossId: string | null;
    displayOrder: number;
  }>>('data/games/crystal/progression.json');
  const locations = readJson<Array<{
    id: string; requirements: { kind: string; id?: string; requirements?: Array<{ id?: string }> };
  }>>('data/games/crystal/locations.json');
  const capabilities = readJson<Array<{
    id: string; requirements: { kind: string; id: string };
  }>>('data/games/crystal/capabilities.json');

  it('keeps the story graph rooted and Kanto Gyms independently available', () => {
    const milestoneIds = new Set(progression.map(point => point.id));
    const locationIds = new Set(locations.map(location => location.id));
    const bossIds = new Set(bosses.map(boss => boss.id));
    expect(game.firstMilestoneId).toBe('new-bark-town');
    expect(game.planner.defaultMilestoneId).toBe('indigo-plateau');
    expect(game.planner.checkpoints.every(point => milestoneIds.has(point.milestoneId))).toBe(true);
    expect(progression.find(point => point.id === game.firstMilestoneId)?.previousIds).toEqual([]);
    expect(progression.every(point => point.previousIds.every(id => milestoneIds.has(id))
      && (point.locationId === null || locationIds.has(point.locationId))
      && (point.nextBossId === null || bossIds.has(point.nextBossId)))).toBe(true);
    expect(new Set(progression.map(point => point.displayOrder)).size).toBe(progression.length);
    for (const id of ['brock', 'misty', 'lt-surge', 'erika', 'janine', 'sabrina', 'blaine', 'blue']) {
      expect(progression.find(point => point.id === `${id}-defeated`)?.previousIds).toEqual(['kanto-open']);
    }
  });

  it('keeps Crystal optional gates, field actions, and the sixteen-badge Mt. Silver gate', () => {
    const milestoneIds = new Set(progression.map(point => point.id));
    const locationMap = new Map(locations.map(location => [location.id, location]));
    expect(progression.find(point => point.id === 'tin-tower-open')?.previousIds)
      .toEqual(['radio-tower-cleared']);
    expect(progression.find(point => point.id === 'route-36-suicune')?.locationId).toBe('route-36');
    expect(progression.find(point => point.id === 'eusine-defeated')?.locationId).toBe('cianwood-city');
    expect(progression.find(point => point.id === 'tin-tower-eusine')?.previousIds).toEqual(['tin-tower-suicune']);
    expect(progression.find(point => point.id === 'ruins-of-alph-open')?.previousIds).toEqual(['route-32']);
    expect(capabilities.map(capability => capability.id)).toEqual(expect.arrayContaining([
      'cut', 'surf', 'fly', 'strength', 'flash', 'whirlpool', 'waterfall', 'rock-smash',
      'headbutt', 'bug-contest', 'day-care', 'old-rod', 'good-rod', 'super-rod',
      'daytime', 'nighttime', 'weekday-window', 'swarm-report', 'roaming-legendaries',
      'silver-wing', 'rainbow-wing', 'clear-bell',
    ]));
    expect(capabilities.every(capability => milestoneIds.has(capability.requirements.id))).toBe(true);
    expect(locationMap.get('national-park')?.requirements).toMatchObject({ kind: 'capability', id: 'bug-contest' });
    const silverRequirements = locationMap.get('mt-silver')?.requirements.requirements ?? [];
    expect(silverRequirements).toHaveLength(16);
    expect(silverRequirements.map(requirement => requirement.id)).toEqual([
      'falkner-defeated', 'bugsy-defeated', 'whitney-defeated', 'morty-defeated',
      'chuck-defeated', 'jasmine-defeated', 'pryce-defeated', 'clair-defeated',
      'brock-defeated', 'misty-defeated', 'lt-surge-defeated', 'erika-defeated',
      'janine-defeated', 'sabrina-defeated', 'blaine-defeated', 'blue-defeated',
    ]);
  });
});
