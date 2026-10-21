import { describe, expect, it } from 'vitest';
import species from '../data/pokemon.json';
import profiles from '../data/games/sapphire/pokemon.json';
import typeChart from '../data/games/sapphire/type-chart.json';
import bosses from '../data/games/sapphire/bosses.json';
import game from '../data/games/sapphire/game.json';
import milestones from '../data/games/sapphire/progression.json';
import locations from '../data/games/sapphire/locations.json';
import capabilities from '../data/games/sapphire/capabilities.json';
import sources from '../data/games/sapphire/sources.json';
import items from '../data/games/sapphire/items.json';
import choices from '../data/games/sapphire/choices.json';
import references from '../data/references.json';
import { rawGame } from '../src/data/games/sapphire';
import { validateDataset } from '../src/data/validate-dataset';
import { solve } from '../src/domain/availability/solve';
import { pokemonBlockers } from '../src/domain/availability/blockers';
import type { Dataset } from '../src/domain/types';
import evolutions from '../data/games/sapphire/evolutions.json';
import breedingRules from '../data/games/sapphire/breeding-rules.json';
import exclusions from '../data/games/sapphire/exclusions.json';

const checked = validateDataset({ schemaVersion: 2, references, pokemon: species, games: [rawGame] });
if (!checked.ok) throw new Error(JSON.stringify(checked.error));
const dataset = checked.value as Dataset;
const sapphire = dataset.games[0];
function at(milestoneId: string) {
  const milestone = sapphire.milestones.find(point => point.id === milestoneId);
  if (!milestone) throw new Error(`Missing Sapphire milestone: ${milestoneId}`);
  return solve(sapphire, milestone, false);
}

describe('Sapphire reviewed catalogue layer', () => {
  it('covers all source species and the complete 202-entry Hoenn Dex', () => {
    const genThree = species.filter(entry => entry.introducedGeneration <= 3);
    expect(genThree).toHaveLength(386);
    expect(profiles.map(profile => profile.pokemonId).sort())
      .toEqual(genThree.map(entry => entry.id).sort());
    const regional = profiles.filter(profile => profile.regionalDex != null)
      .map(profile => profile.regionalDex)
      .sort((left, right) => left - right);
    expect(regional).toEqual(Array.from({ length: 202 }, (_, index) => index + 1));
  });

  it('has the full Generation III type chart', () => {
    expect(typeChart.typeIds).toHaveLength(17);
    expect(typeChart.matrix).toHaveLength(17);
    expect(typeChart.matrix.every(row => row.length === 17
      && row.every(value => [0, 0.5, 1, 2].includes(value)))).toBe(true);
  });

  it('covers all eight Gyms, the Elite Four, and Sapphire champion Steven', () => {
    expect(bosses).toHaveLength(13);
    expect(bosses.filter(boss => boss.kind === 'gym')).toHaveLength(8);
    expect(bosses.filter(boss => boss.kind === 'elite-four')).toHaveLength(4);
    expect(bosses.at(-1)).toMatchObject({ id: 'steven', kind: 'champion', highestLevel: 58 });
  });

  it('records the pinned Sapphire review on every completed collection', () => {
    const records = [...profiles, typeChart, ...bosses];
    expect(records.every(record => record.review.checkedOn === '2026-10-12')).toBe(true);
    expect(locations.find(location => location.id === 'sky-pillar')?.review.checkedOn).toBe('2026-10-13');
    expect(profiles.every(profile => new Set(profile.review.referenceIds).size === profile.review.referenceIds.length)).toBe(true);
    expect(profiles.every(profile => profile.review.referenceIds.includes('sapphire-species')
      && profile.review.referenceIds.includes('sapphire-dex'))).toBe(true);
    expect(typeChart.review.referenceIds).toContain('sapphire-type-chart');
    expect(bosses.every(boss => boss.review.referenceIds.includes('sapphire-bosses'))).toBe(true);
  });

  it('covers each Hoenn route and keeps a valid milestone graph', () => {
    expect(milestones).toHaveLength(132);
    const milestoneIds = new Set(milestones.map(milestone => milestone.id));
    expect(milestoneIds.size).toBe(milestones.length);
    expect(new Set(milestones.map(milestone => milestone.displayOrder)).size).toBe(milestones.length);
    const routeIds = milestones.map(milestone => milestone.id)
      .filter(id => /^route-(?:10[1-9]|1[1-2][0-9]|13[0-4])$/.test(id))
      .sort((left, right) => Number(left.slice(6)) - Number(right.slice(6)));
    expect(routeIds).toEqual(Array.from({ length: 34 }, (_, index) => `route-${index + 101}`));
    for (const milestone of milestones) {
      for (const previousId of milestone.previousIds) {
        expect(milestoneIds.has(previousId), `${milestone.id} predecessor ${previousId}`).toBe(true);
        expect(milestones.find(entry => entry.id === previousId)!.displayOrder)
          .toBeLessThan(milestone.displayOrder);
      }
    }
    const bossIds = new Set(bosses.map(boss => boss.id));
    for (const milestone of milestones) {
      if (milestone.nextBossId) expect(bossIds.has(milestone.nextBossId), milestone.id).toBe(true);
    }
  });

  it('uses Sapphire progress, Wallace, the League, and the pre-League default', () => {
    const milestoneIds = new Set(milestones.map(milestone => milestone.id));
    const checkpointIds = game.planner.checkpoints.map(checkpoint => checkpoint.milestoneId);
    expect(game).toMatchObject({ id: 'sapphire', firstMilestoneId: 'littleroot' });
    expect(game.planner.defaultMilestoneId).toBe('victory-road');
    expect(checkpointIds).toHaveLength(11);
    expect(new Set(checkpointIds).size).toBe(11);
    expect(checkpointIds.every(id => milestoneIds.has(id))).toBe(true);
    expect(checkpointIds).toContain('wallace-defeated');
    expect(checkpointIds).toContain('steven-defeated');
    expect(checkpointIds).toContain('latias-roams');
    expect(bosses.filter(boss => boss.kind === 'gym').map(boss => boss.id))
      .toEqual(['roxanne','brawly','wattson','flannery','norman','winona','tate-and-liza','wallace']);
    expect(milestones.some(milestone => milestone.id === 'juan-defeated')).toBe(false);
  });

  it('documents a Day Care source for every reviewed egg outcome', () => {
    const breedingSources = sources.filter(source => source.details.kind === 'breeding');
    for (const rule of breedingRules) {
      for (const pokemonId of rule.offspringPokemonIds) {
        const matching = breedingSources.filter(source => source.pokemonId === pokemonId
          && source.details.kind === 'breeding' && source.details.ruleId === rule.id);
        expect(matching.length, `${rule.id} -> ${pokemonId}`).toBeGreaterThan(0);
        for (const source of matching) {
          expect(source.locationId).toBe('route-117');
          expect(source.level).toEqual({ kind: 'fixed', value: 5 });
          expect(source.details).toMatchObject({ kind: 'breeding', capabilityId: 'day-care' });
          expect(source.requirements).toMatchObject({ kind: 'all' });
          expect(source.review.referenceIds).toContain('sapphire-breeding');
          if (rule.requiredHeldItemId) {
            expect(JSON.stringify(source.requirements)).toContain(`"id":"${rule.requiredHeldItemId}"`);
          }
        }
      }
    }
    expect(breedingSources.some(source => source.pokemonId === 'ditto')).toBe(false);
  });

  it('keeps Sapphire story branches and its fixed Latias roamer', () => {
    const ids = new Set(milestones.map(milestone => milestone.id));
    expect(milestones.find(milestone => milestone.id === 'meteor-event')?.name)
      .toBe('Team Aqua takes the Meteorite');
    expect(ids.has('archie-chimney')).toBe(true);
    expect(ids.has('maxie-chimney')).toBe(false);
    expect(milestones.find(milestone => milestone.id === 'jagged-pass')?.previousIds)
      .toEqual(['archie-chimney']);
    expect(milestones.find(milestone => milestone.id === 'submarine'))
      .toMatchObject({ locationId: 'slateport', previousIds: ['slateport', 'blue-orb'] });
    expect(milestones.find(milestone => milestone.id === 'aqua-hideout')?.previousIds)
      .toEqual(['lilycove', 'submarine']);
    expect(locations.find(location => location.id === 'aqua-hideout')?.requirements)
      .toEqual({ kind: 'all', requirements: [
        { kind: 'milestone', id: 'lilycove' }, { kind: 'milestone', id: 'submarine' },
      ] });
    expect(milestones.find(milestone => milestone.id === 'meteor-event')?.name)
      .toBe('Team Aqua takes the Meteorite');
    expect(ids.has('archie-chimney')).toBe(true);
    expect(ids.has('maxie-chimney')).toBe(false);
    expect(milestones.find(milestone => milestone.id === 'jagged-pass')?.previousIds)
      .toEqual(['archie-chimney']);
    expect(milestones.find(milestone => milestone.id === 'submarine'))
      .toMatchObject({ locationId: 'slateport', previousIds: ['slateport', 'blue-orb'] });
    expect(ids.has('blue-orb')).toBe(true);
    expect(ids.has('aqua-hideout')).toBe(true);
    expect(ids.has('archie-seafloor')).toBe(true);
    expect(ids.has('magma-hideout')).toBe(false);
    expect(milestones.find(milestone => milestone.id === 'steven-dive'))
      .toMatchObject({ name: 'Receive Dive from Steven in Mossdeep', previousIds: ['mossdeep'] });
    expect(ids.has('space-center')).toBe(false);
    expect(locations.some(location => location.id.includes('space-center'))).toBe(false);
    expect(milestones.find(milestone => milestone.id === 'latias-roams')?.name)
      .toBe('TV report: Latias roams Hoenn');
    expect([...ids].some(id => id.includes('latios'))).toBe(false);
  });

  it('gates HMs, rods, daycare, and evolution actions on Sapphire access', () => {
    expect(capabilities).toHaveLength(27);
    const byId = new Map(capabilities.map(capability => [capability.id, capability]));
    const milestoneRequirement = (id: string, milestoneId: string) =>
      expect(byId.get(id)?.requirements).toEqual({ kind: 'milestone', id: milestoneId });
    milestoneRequirement('cut', 'roxanne-defeated');
    milestoneRequirement('flash', 'brawly-defeated');
    milestoneRequirement('rock-smash', 'wattson-defeated');
    milestoneRequirement('strength', 'flannery-defeated');
    milestoneRequirement('surf', 'norman-defeated');
    milestoneRequirement('dive', 'tate-and-liza-defeated');
    milestoneRequirement('waterfall', 'wallace-defeated');
    milestoneRequirement('old-rod', 'dewford');
    milestoneRequirement('super-rod', 'mossdeep');
    milestoneRequirement('day-care', 'mauville');
    expect(byId.get('good-rod')?.requirements.kind).toBe('all');
    expect(byId.has('friendship') && byId.has('beauty') && byId.has('stat-training')
      && byId.has('personality') && byId.has('party-space')).toBe(true);
    expect(byId.has('tv-outbreak')).toBe(false);
    expect(byId.get('regi-puzzle')?.requirements).toMatchObject({
      kind: 'all',
      requirements: expect.arrayContaining([{ kind: 'milestone', id: 'route-134' }]),
    });
  });

  it('links all reviewed location gates to this Sapphire graph', () => {
    expect(locations).toHaveLength(81);
    const milestoneIds = new Set(milestones.map(milestone => milestone.id));
    const capabilityIds = new Set(capabilities.map(capability => capability.id));
    const checkRequirement = (locationId: string, requirement: any) => {
      if (requirement.kind === 'milestone') expect(milestoneIds.has(requirement.id), locationId).toBe(true);
      if (requirement.kind === 'capability') expect(capabilityIds.has(requirement.id), locationId).toBe(true);
      for (const child of requirement.requirements ?? []) checkRequirement(locationId, child);
    };
    for (const location of locations) checkRequirement(location.id, location.requirements);
    const routeLocations = locations.map(location => location.id)
      .filter(id => /^route-(?:10[1-9]|1[1-2][0-9]|13[0-4])$/.test(id))
      .sort((left, right) => Number(left.slice(6)) - Number(right.slice(6)));
    expect(routeLocations).toEqual(Array.from({ length: 34 }, (_, index) => `route-${index + 101}`));
    expect(locations.some(location => location.id === 'magma-hideout')).toBe(false);
    expect(locations.find(location => location.id === 'mirage-island')?.requirements)
      .toEqual({ kind: 'capability', id: 'mirage-island' });
  });

  it('records reviews for the Sapphire progression layer', () => {
    const records = [game, ...milestones, ...locations, ...capabilities];
    expect(records.filter(record => record !== locations.find(location => location.id === 'sky-pillar'))
      .every(record => record.review.checkedOn === '2026-10-12')).toBe(true);
    expect(locations.find(location => location.id === 'sky-pillar')?.review.checkedOn).toBe('2026-10-13');
    expect(milestones.every(record => record.review.referenceIds.includes('sapphire-progression'))).toBe(true);
    expect(locations.every(record => record.review.referenceIds.includes('sapphire-progression'))).toBe(true);
    expect(capabilities.every(record => record.review.referenceIds.length > 0)).toBe(true);
  });

  it('covers all pinned Sapphire wild map tables and encounter slots', () => {
    const wild = sources.filter(source => source.id.startsWith('sapphire-wild-')) as Array<{
      id: string;
      details: { kind: 'wild'; method: string; ratePercent: number };
      maxUses: number | null;
      review: { referenceIds: string[] };
    }>;
    expect(new Set(sources.map(source => source.id)).size).toBe(sources.length);
    const methods = new Map<string, number>();
    const maps = new Set<string>();
    const tableRates = new Map<string, number>();
    for (const source of wild) {
      const method = source.details.method;
      methods.set(method, (methods.get(method) ?? 0) + 1);
      const match = source.id.match(/^sapphire-wild-(.+)-(grass|surf|rock-smash|old-rod|good-rod|super-rod)-[a-z0-9-]+-slot\d+$/);
      expect(match, source.id).not.toBeNull();
      const mapSlug = match?.[1];
      expect(mapSlug).toBeDefined();
      if (mapSlug) {
        maps.add(mapSlug);
        const tableKey = `${mapSlug}:${method}`;
        tableRates.set(tableKey, (tableRates.get(tableKey) ?? 0) + source.details.ratePercent);
      }
      expect(source.maxUses).toBeNull();
      expect(source.details.ratePercent).toBeGreaterThan(0);
      expect(source.details.ratePercent).toBeLessThanOrEqual(70);
      expect(source.review.referenceIds).toContain('sapphire-encounters');
    }
    expect(wild).toHaveLength(1631);
    expect(maps).toHaveLength(97);
    expect([...tableRates.values()].every(rate => rate === 100)).toBe(true);
    expect(Object.fromEntries(methods)).toEqual({
      grass: 816,
      surf: 270,
      'rock-smash': 25,
      'old-rod': 104,
      'good-rod': 156,
      'super-rod': 260,
    });
  });

  it('keeps Sapphire gifts, fossils, trades, statics, and the three rod Feebas paths', () => {
    const byId = new Map(sources.map(source => [source.id, source]));
    expect(sources).toHaveLength(1839);
    expect(sources.filter(source => source.details.kind !== 'wild')).toHaveLength(205);
    expect(byId.get('sapphire-trade-makuhita')).toMatchObject({
      pokemonId: 'makuhita', level: { kind: 'match-traded-pokemon', pokemonId: 'slakoth' },
      details: { kind: 'game-trade', offeredPokemonId: 'slakoth' }, genders: ['male'], maxUses: 1,
    });
    expect(byId.get('sapphire-trade-skitty')).toMatchObject({ pokemonId: 'skitty', genders: ['female'], maxUses: 1, details: { offeredPokemonId: 'pikachu' } });
    expect(byId.get('sapphire-trade-corsola')).toMatchObject({ pokemonId: 'corsola', genders: ['male'], maxUses: 1, details: { offeredPokemonId: 'bellossom' } });
    expect(byId.get('sapphire-revive-lileep')).toMatchObject({ pokemonId: 'lileep', locationId: 'route-111', level: { kind: 'fixed', value: 20 }, maxUses: 1 });
    expect(byId.get('sapphire-revive-anorith')).toMatchObject({ pokemonId: 'anorith', locationId: 'route-111', level: { kind: 'fixed', value: 20 }, maxUses: 1 });
    expect(byId.get('sapphire-kyogre-cave-of-origin')).toMatchObject({ pokemonId: 'kyogre', level: { kind: 'fixed', value: 45 } });
    expect(byId.get('sapphire-roaming-latias')).toMatchObject({ pokemonId: 'latias', level: { kind: 'fixed', value: 40 }, maxUses: 1 });
    expect(byId.has('sapphire-groudon-cave-of-origin')).toBe(false);
    expect(byId.has('sapphire-roaming-latios')).toBe(false);
    for (const rod of ['old-rod', 'good-rod', 'super-rod']) {
      expect(byId.get(`sapphire-feebas-route119-${rod}`)).toMatchObject({
        pokemonId: 'feebas', locationId: 'route-119',
        details: { kind: 'wild', method: rod, ratePercent: 50 },
      });
    }
    expect(byId.has('sapphire-wynaut-egg')).toBe(true);
  });

  it('reviews finite item sources and exact Sapphire choice groups', () => {
    const itemRecords = items as unknown as Array<{
      id: string;
      review: { referenceIds: string[]; checkedOn: string };
      sources: Array<{
        id: string;
        maxUses: number | null;
        review: { referenceIds: string[]; checkedOn: string };
      }>;
    }>;
    const itemSources = itemRecords.flatMap(item => item.sources);
    expect(items).toHaveLength(26);
    expect(itemSources).toHaveLength(37);
    expect(itemSources.filter(source => source.maxUses !== null)).toHaveLength(21);
    expect(itemSources.filter(source => source.id.endsWith('-lilycove-shop'))).toHaveLength(0);
    expect(itemRecords.find(item => item.id === 'moon-stone')?.sources.some(source => source.id === 'moon-lunatone')).toBe(true);
    expect(itemRecords.find(item => item.id === 'sun-stone')?.sources.map(source => source.id))
      .toEqual(['sun-space-center']);
    expect(choices).toHaveLength(3);
    expect(choices.find(choice => choice.id === 'fossil-choice')?.options)
      .toEqual(['root-fossil', 'claw-fossil']);
    expect(choices.find(choice => choice.id === 'scanner-choice')?.options)
      .toEqual(['deep-sea-tooth', 'deep-sea-scale']);
    expect(itemSources.every(source => source.review.referenceIds.includes('sapphire-items'))).toBe(true);
    expect(itemSources.every(source => source.review.checkedOn === '2026-10-12')).toBe(true);
    expect(sources.filter(source => source.details.kind !== 'breeding' && source.id !== 'sapphire-static-rayquaza')
      .every(record => record.review.checkedOn === '2026-10-12')).toBe(true);
    expect(sources.find(source => source.id === 'sapphire-static-rayquaza')?.review.checkedOn).toBe('2026-10-13');
    expect(sources.filter(source => source.details.kind === 'breeding')
      .every(record => record.review.checkedOn === (record.id === 'breed-nidoran-male-ditto-egg'
        ? '2026-10-21' : '2026-10-13'))).toBe(true);
    expect(itemRecords.every(record => record.review.checkedOn ===
      (record.id.endsWith('-stone') ? '2026-10-13' : '2026-10-12'))).toBe(true);
    expect(choices.every(record => record.review.checkedOn === '2026-10-12')).toBe(true);
    expect(itemRecords.every(item => item.review.referenceIds.includes('sapphire-items'))).toBe(true);
    expect(milestones.some(milestone => milestone.id === 'mirage-tower')).toBe(false);
    expect(locations.some(location => location.id === 'mirage-tower')).toBe(false);
  });

  it('covers every supported species with reviewed Sapphire evolution, breeding, or exclusion records', () => {
    const ids = new Set(profiles.map(profile => profile.pokemonId));
    expect(evolutions).toHaveLength(184);
    expect(breedingRules).toHaveLength(181);
    expect(new Set(exclusions.map(exclusion => exclusion.pokemonId)).size).toBe(exclusions.length);
    expect(new Set([...sources.map(source => source.pokemonId), ...evolutions.map(rule => rule.toPokemonId),
      ...breedingRules.flatMap(rule => rule.offspringPokemonIds), ...exclusions.map(exclusion => exclusion.pokemonId)])).toEqual(ids);
    expect(evolutions.every(rule => ids.has(rule.fromPokemonId) && ids.has(rule.toPokemonId)
      && rule.review.referenceIds.includes('sapphire-evolutions') && rule.review.checkedOn === '2026-10-12')).toBe(true);
    expect(breedingRules.every(rule => rule.parentPokemonIds.every(id => ids.has(id))
      && rule.offspringPokemonIds.every(id => ids.has(id))
      && rule.review.referenceIds.includes('sapphire-breeding')
      && rule.review.checkedOn === (['breed-nidoran', 'breed-nidoran-male-ditto'].includes(rule.id)
        ? '2026-10-21' : '2026-10-12'))).toBe(true);
    expect(breedingRules.find(rule => rule.id === 'breed-wynaut')).toMatchObject({
      offspringPokemonIds: ['wynaut'], requiredHeldItemId: 'lax-incense',
    });
    expect(breedingRules.find(rule => rule.id === 'breed-azurill')).toMatchObject({
      offspringPokemonIds: ['azurill'], requiredHeldItemId: 'sea-incense',
    });
    expect(breedingRules.find(rule => rule.id === 'breed-wobbuffet')?.offspringPokemonIds).toEqual(['wobbuffet']);
    expect(breedingRules.find(rule => rule.id === 'breed-marill')?.offspringPokemonIds).toEqual(['marill']);
    expect(evolutions.filter(rule => rule.trigger === 'player-trade')).toHaveLength(12);
    expect(exclusions.find(record => record.pokemonId === 'latios')?.reason).toBe('external-event');
    expect(exclusions.some(record => record.pokemonId === 'latias')).toBe(false);
    expect([...evolutions, ...exclusions].every(record => record.review.checkedOn === '2026-10-12')).toBe(true);
  });

  it('checks early and postgame access, trade blockers, and finite native resources', () => {
    const early = at('route-102');
    const late = at('latias-roams');
    const rayquazaProgress = at('rayquaza');
    const beforeChampion = at('victory-road');
    const champion = at('steven-defeated');
    expect(early.paths.has('treecko')).toBe(true);
    expect(early.paths.has('ralts')).toBe(true);
    expect(early.paths.has('latias')).toBe(false);
    expect(late.paths.has('latias')).toBe(true);
    expect(late.paths.has('latios')).toBe(false);
    expect(beforeChampion.paths.has('rayquaza')).toBe(false);
    expect(champion.paths.has('rayquaza')).toBe(true);
    expect(locations.find(location => location.id === 'sky-pillar')?.requirements)
      .toEqual({ kind: 'milestone', id: 'steven-defeated' });
    expect(sources.find(source => source.id === 'sapphire-static-rayquaza')).toMatchObject({
      level: { kind: 'fixed', value: 70 },
      requirements: { kind: 'capability', id: 'mach-bike' },
    });
    expect(rayquazaProgress.paths.has('rayquaza')).toBe(true);
    expect(late.paths.has('rayquaza')).toBe(true);
    expect(late.paths.has('azurill')).toBe(true);
    expect(late.paths.has('pichu')).toBe(true);
    expect(exclusions.filter(exclusion => late.paths.has(exclusion.pokemonId))
      .map(exclusion => exclusion.pokemonId)).toEqual([]);
    expect(pokemonBlockers(sapphire, late, 'alakazam').some(blocker => blocker.code === 'player-trade')).toBe(true);
    expect(late.resourceLimits['source:sapphire-roaming-latias']).toBe(1);
    expect(late.resourceLimits['item-source:scanner-ship']).toBe(1);
  }, 60_000);

  it('gates eastern sea encounters until the Aqua Hideout is cleared', () => {
    const before = at('norman-defeated');
    const after = at('route-128');
    const afterCurrents = at('aqua-hideout-cleared');
    expect(before.paths.has('luvdisc')).toBe(false);
    expect(after.paths.get('luvdisc')?.some(path =>
      path.sourceIds.some(sourceId => sourceId.includes('route128')))).toBe(true);
    const route133SourceIsCurrent = (context: typeof before) =>
      [...context.paths.values()].flat().some(path =>
        path.sourceIds.includes('sapphire-wild-route133-surf-pelipper-slot3'));
    expect(route133SourceIsCurrent(before)).toBe(false);
    expect(route133SourceIsCurrent(afterCurrents)).toBe(true);
    expect(locations.filter(location => ['route-132', 'route-133', 'pacifidlog'].includes(location.id))
      .every(location => location.requirements.kind === 'milestone'
        && location.requirements.id === 'aqua-hideout-cleared')).toBe(true);
    expect(locations.find(location => location.id === 'route-134')?.requirements)
      .toEqual({ kind: 'milestone', id: 'norman-defeated' });
    expect(milestones.find(milestone => milestone.id === 'route-132')?.previousIds).toContain('aqua-hideout-cleared');
    expect(milestones.find(milestone => milestone.id === 'route-133')?.previousIds).toContain('aqua-hideout-cleared');
  }, 60_000);

});
