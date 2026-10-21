import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import Ajv2020 from 'ajv/dist/2020';
import sharedPokemon from '../data/pokemon.json';
import game from '../data/games/firered/game.json';
import profiles from '../data/games/firered/pokemon.json';
import typeChart from '../data/games/firered/type-chart.json';
import progression from '../data/games/firered/progression.json';
import bosses from '../data/games/firered/bosses.json';
import locations from '../data/games/firered/locations.json';
import capabilities from '../data/games/firered/capabilities.json';
import sources from '../data/games/firered/sources.json';
import items from '../data/games/firered/items.json';
import choices from '../data/games/firered/choices.json';
import breedingRules from '../data/games/firered/breeding-rules.json';
import evolutions from '../data/games/firered/evolutions.json';
import exclusions from '../data/games/firered/exclusions.json';
import { rawSharedData } from '../src/data/shared-data';
import { validateDataset } from '../src/data/validate-dataset';
import { solve } from '../src/domain/availability/solve';
import commonSchema from '../docs/schema/common.schema.json';
import gameSchema from '../docs/schema/game.schema.json';
import acquisitionSchema from '../docs/schema/acquisition.schema.json';
import { rawGame as rawModule } from '../src/data/games/firered';

const ajv = new Ajv2020({ allErrors: true, strict: false });
ajv.addSchema(commonSchema).addSchema(gameSchema);
ajv.addSchema(acquisitionSchema);
const validGame = ajv.getSchema(`${gameSchema.$id}#/$defs/game`)!;
const validProfile = ajv.getSchema(`${gameSchema.$id}#/$defs/profile`)!;
const validTypeChart = ajv.getSchema(`${gameSchema.$id}#/$defs/typeChart`)!;
const validMilestone = ajv.getSchema(`${gameSchema.$id}#/$defs/milestone`)!;
const validBoss = ajv.getSchema(`${gameSchema.$id}#/$defs/boss`)!;
const validLocation = ajv.getSchema(`${gameSchema.$id}#/$defs/location`)!;
const validCapability = ajv.getSchema(`${gameSchema.$id}#/$defs/capability`)!;
const validSource = ajv.getSchema(`${acquisitionSchema.$id}#/$defs/source`)!;
const validItem = ajv.getSchema(`${gameSchema.$id}#/$defs/item`)!;
const validChoice = ajv.getSchema(`${gameSchema.$id}#/$defs/choiceGroup`)!;
const wildSources = sources.filter(source => source.id.startsWith('wild-'));
import { pinnedEvolutionTransitionIds } from './firered-evolution-inventory';
const unsupportedFireRedTransitions = new Set(['eevee-to-espeon', 'eevee-to-umbreon', 'feebas-to-milotic']);

describe('FireRed reviewed profile and access layer', () => {
  it('covers the exact 386 species profile set with complete, unique, source-reviewed values', () => {
    expect(profiles).toHaveLength(386);
    expect(profiles.map(profile => profile.pokemonId).sort())
      .toEqual(sharedPokemon.filter(pokemon => pokemon.introducedGeneration <= game.generation).map(pokemon => pokemon.id).sort());
    expect(profiles.filter(profile => profile.regionalDex !== undefined))
      .toHaveLength(151);
    expect(profiles.map(profile => profile.regionalDex).filter(Boolean).sort((a, b) => a! - b!))
      .toEqual(Array.from({ length: 151 }, (_, index) => index + 1));
    expect(profiles.every(profile => profile.review.referenceIds.includes('firered-species'))).toBe(true);
    expect(profiles.every(profile => new Set(profile.types).size === profile.types.length &&
      (!profile.breeding || new Set(profile.breeding.eggGroupIds).size === profile.breeding.eggGroupIds.length)))
      .toBe(true);

    const invalid = profiles.flatMap(profile => {
      validProfile(profile);
      return [...(validProfile.errors ?? [])].map(error => `${profile.pokemonId}${error.instancePath} ${error.message}`);
    });
    expect(invalid).toEqual([]);
    expect(profiles.every(profile => existsSync(`public${profile.spriteSrc}`))).toBe(true);
    expect(profiles.find(profile => profile.pokemonId === 'bulbasaur')).toMatchObject({
      regionalDex: 1,
      types: ['grass', 'poison'],
      genders: ['male', 'female'],
      breeding: { eggGroupIds: ['monster', 'grass'] },
    });
    expect(profiles.find(profile => profile.pokemonId === 'ditto')).toMatchObject({
      genders: ['genderless'],
      breeding: { eggGroupIds: ['ditto'] },
    });
  });

  it('matches the pinned Generation III type chart dimensions and reviewed matchups', () => {
    expect(validTypeChart(typeChart)).toBe(true);
    expect(typeChart.typeIds).toHaveLength(17);
    expect(typeChart.matrix).toHaveLength(17);
    expect(typeChart.matrix.every(row => row.length === 17)).toBe(true);
    const at = (attack: string, defense: string) =>
      typeChart.matrix[typeChart.typeIds.indexOf(attack)][typeChart.typeIds.indexOf(defense)];
    expect(at('fire', 'grass')).toBe(2);
    expect(at('ground', 'flying')).toBe(0);
    expect(at('ghost', 'normal')).toBe(0);
    expect(at('psychic', 'steel')).toBe(0.5);
    expect(at('dark', 'psychic')).toBe(2);
  });

  it('records all first-clear Gym and League level caps from the pinned trainer parties', () => {
    expect(bosses.every(boss => validBoss(boss))).toBe(true);
    expect(bosses.filter(boss => boss.kind === 'gym').map(boss => boss.badgeNumber))
      .toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(bosses.filter(boss => boss.kind === 'gym').map(boss => boss.highestLevel))
      .toEqual([14, 21, 24, 29, 43, 43, 47, 50]);
    expect(bosses.filter(boss => boss.kind === 'elite-four').map(boss => boss.highestLevel))
      .toEqual([54, 56, 58, 60]);
    expect(bosses.find(boss => boss.kind === 'champion')?.highestLevel).toBe(63);
  });

  it('validates the rooted Kanto and ordinary Sevii access graph and keeps National Dex gates explicit', () => {
    expect(validGame(game)).toBe(true);
    expect(progression.every(milestone => validMilestone(milestone))).toBe(true);
    expect(locations.every(location => validLocation(location))).toBe(true);
    expect(capabilities.every(capability => validCapability(capability))).toBe(true);
    const labels = [game.name, ...game.planner.checkpoints.flatMap(checkpoint =>
      [checkpoint.label, checkpoint.title, checkpoint.detail]), ...progression.map(milestone => milestone.name),
    ...locations.map(location => location.name)];
    expect(labels.some(label => /\\u[0-9a-f]{4}/i.test(label))).toBe(false);
    expect(labels.some(label => /[ÃÂ]/.test(label))).toBe(false);
    const milestoneIds = new Set(progression.map(milestone => milestone.id));
    const capabilityIds = new Set(capabilities.map(capability => capability.id));
    const requirementsResolve = (requirement: any) => {
      if (requirement.kind === 'milestone') return milestoneIds.has(requirement.id);
      if (requirement.kind === 'capability') return capabilityIds.has(requirement.id);
      if (requirement.kind === 'all' || requirement.kind === 'any')
        return requirement.requirements.every(requirementsResolve);
      return true;
    };
    expect(progression.flatMap(milestone => milestone.previousIds).every(id => milestoneIds.has(id))).toBe(true);
    expect(locations.every(location => requirementsResolve(location.requirements))).toBe(true);
    expect(capabilities.every(capability => requirementsResolve(capability.requirements))).toBe(true);

    const roots = progression.filter(milestone => milestone.previousIds.length === 0);
    expect(roots.map(milestone => milestone.id)).toEqual(['pallet-town']);
    const visited = new Set<string>();
    const visit = (id: string, path: Set<string>) => {
      expect(path.has(id)).toBe(false);
      if (visited.has(id)) return;
      const milestone = progression.find(entry => entry.id === id)!;
      const nextPath = new Set(path).add(id);
      milestone.previousIds.forEach(previousId => visit(previousId, nextPath));
      visited.add(id);
    };
    progression.forEach(milestone => visit(milestone.id, new Set()));
    expect(progression.find(milestone => milestone.id === 'one-island')).toMatchObject({
      phase: 'main-story',
      previousIds: ['blaine-defeated'],
    });
    expect(progression.find(milestone => milestone.id === 'national-dex')?.name)
      .toContain('60 caught');
    expect(progression.find(milestone => milestone.id === 'national-dex')?.previousIds)
      .toEqual(['one-island', 'champion-rival-defeated']);
    expect(capabilities.find(capability => capability.id === 'tri-pass-access')?.requirements)
      .toEqual({ kind: 'milestone', id: 'blaine-defeated' });
    expect(progression.find(milestone => milestone.id === 'rainbow-pass')?.previousIds)
      .toEqual(['ruby-returned']);
    expect(progression.find(milestone => milestone.id === 'sapphire-returned')?.previousIds)
      .toEqual(['sapphire-stolen', 'five-island', 'icefall-rockets-cleared']);
    expect(progression.find(milestone => milestone.id === 'icefall-rockets-cleared')).toMatchObject({
      locationId: 'four-island-icefall-cave-back', previousIds: ['four-island'],
    });
    expect(progression.find(milestone => milestone.id === 'sapphire-stolen')?.previousIds)
      .toEqual(['six-island', 'icefall-rockets-cleared']);
    expect(progression.find(milestone => milestone.id === 'network-machine')?.previousIds)
      .toEqual(['ruby-returned', 'sapphire-returned']);
    expect(game.planner.checkpoints.map(checkpoint => checkpoint.milestoneId))
      .toEqual(expect.arrayContaining(['four-island', 'icefall-rockets-cleared', 'five-island', 'seven-island', 'network-machine']));
    expect(['four-island', 'five-island', 'six-island', 'seven-island'].every(id =>
      progression.find(milestone => milestone.id === id)?.previousIds.includes('rainbow-pass'))).toBe(true);
    expect(game.planner.defaultMilestoneId).toBe('victory-road');
    expect(game.breeding?.hatchLevel).toBe(5);

    const raw = rawModule as { game: unknown; profiles: unknown[]; typeChart: unknown; milestones: unknown[];
      bosses: unknown[]; locations: unknown[]; capabilities: unknown[]; items: unknown[]; choices: unknown[];
      sources: unknown[]; breedingRules: unknown[]; evolutions: unknown[]; exclusions: unknown[] };
    expect(Object.keys(raw).sort()).toEqual([
      'bosses', 'breedingRules', 'capabilities', 'choices', 'evolutions', 'exclusions', 'game', 'items',
      'locations', 'milestones', 'profiles', 'sources', 'typeChart',
    ]);
    expect(raw.items).toHaveLength(items.length);
    expect(raw.choices).toHaveLength(choices.length);
    expect(raw.sources).toHaveLength(sources.length);
    expect(raw.breedingRules).toHaveLength(breedingRules.length);
    expect(raw.evolutions).toHaveLength(evolutions.length);
    expect(raw.exclusions).toHaveLength(exclusions.length);
  });

  it('covers the reviewed FireRed wild tables with map identity, weighted levels, and physical method gates', () => {
    expect(wildSources).toHaveLength(1881);
    expect(new Set(wildSources.map(source => source.id)).size).toBe(wildSources.length);
    const tableIds = new Set(wildSources.map(source =>
      source.id.match(/^wild-(.+)-(grass|surf|old-rod|good-rod|super-rod|rock-smash)-/)![1]));
    expect(tableIds.size).toBe(124);
    const kantoAndIslandsOneToThree = wildSources.filter(source =>
      !/^(four|five|six|seven)-island/.test(source.locationId));
    expect(new Set(kantoAndIslandsOneToThree.map(source => source.locationId)).size).toBe(83);
    expect(kantoAndIslandsOneToThree).toHaveLength(1376);
    expect(new Set(kantoAndIslandsOneToThree.map(source => source.pokemonId)).size).toBe(88);
    expect(wildSources.every(source => source.id.startsWith('wild-s') &&
      source.review.referenceIds.includes('firered-encounters') && validSource(source))).toBe(true);
    expect(wildSources.every(source => locations.some(location => location.id === source.locationId))).toBe(true);
    expect(wildSources.map(source => source.details.method).sort()).toEqual([
      ...Array(148).fill('good-rod'), ...Array(50).fill('old-rod'), ...Array(61).fill('rock-smash'),
      ...Array(1170).fill('grass'), ...Array(218).fill('surf'), ...Array(234).fill('super-rod'),
    ].sort());
    expect(wildSources.filter(source => source.locationId === 'six-island-altering-cave')
      .map(source => source.pokemonId)).toEqual(Array(12).fill('zubat'));
    expect(wildSources.find(source => source.id.includes('sroute1-grass-pidgey-lv2-2')))
      .toMatchObject({ locationId: 'route1', requirements: { kind: 'milestone', id: 'pallet-town' } });
    expect(wildSources.find(source => source.locationId === 'route3'))
      .toMatchObject({ requirements: { kind: 'milestone', id: 'brock-defeated' } });
    expect(wildSources.find(source => source.locationId === 'route5')?.requirements)
      .toMatchObject({ kind: 'all', requirements: expect.arrayContaining([
        { kind: 'milestone', id: 'brock-defeated' },
        { kind: 'item', id: 'ss-ticket', quantity: 1, consumed: false },
      ]) });
    expect(wildSources.find(source => source.locationId === 'route9')?.requirements)
      .toMatchObject({ kind: 'all', requirements: expect.arrayContaining([
        { kind: 'milestone', id: 'misty-defeated' },
        { kind: 'capability', id: 'cut-access' },
      ]) });
    expect(wildSources.find(source => source.locationId === 'route23'))
      .toMatchObject({ requirements: { kind: 'milestone', id: 'victory-road' } });
    expect(wildSources.find(source => source.locationId === 'victory-road-1f'))
      .toMatchObject({ requirements: { kind: 'all', requirements: expect.arrayContaining([
        { kind: 'milestone', id: 'victory-road' },
        { kind: 'capability', id: 'strength-access' },
      ]) } });
    expect(wildSources.find(source => source.locationId === 'route16')?.requirements)
      .toMatchObject({ kind: 'all', requirements: expect.arrayContaining([
        { kind: 'item', id: 'poke-flute', quantity: 1, consumed: false },
        { kind: 'capability', id: 'bicycle-access' },
      ]) });
    expect(wildSources.find(source => source.locationId === 'pokemon-tower-3f'))
      .toMatchObject({ requirements: { kind: 'item', id: 'silph-scope', quantity: 1, consumed: false } });
    expect(locations.find(location => location.id === 'saffron-city')?.requirements)
      .toMatchObject({ kind: 'all', requirements: expect.arrayContaining([
        { kind: 'item', id: 'tea', quantity: 1, consumed: false },
      ]) });
    expect(wildSources.find(source => source.locationId === 'three-island-berry-forest'))
      .toMatchObject({ requirements: { kind: 'milestone', id: 'one-island' } });
    expect(wildSources.find(source => source.locationId === 'four-island-icefall-cave-back')?.requirements)
      .toMatchObject({ kind: 'all', requirements: expect.arrayContaining([
        { kind: 'capability', id: 'waterfall-access' },
        { kind: 'milestone', id: 'rainbow-pass' },
      ]) });
    expect(wildSources.find(source => source.details.method === 'surf')?.requirements)
      .toMatchObject({ kind: 'all', requirements: expect.arrayContaining([
        { kind: 'capability', id: 'surf-access' },
      ]) });
    expect(wildSources.find(source => source.details.method === 'old-rod')?.requirements)
      .toMatchObject({ kind: 'all', requirements: expect.arrayContaining([
        { kind: 'capability', id: 'old-rod-access' },
      ]) });
    expect(capabilities.find(capability => capability.id === 'cut-access')?.requirements)
      .toMatchObject({ kind: 'all', requirements: expect.arrayContaining([
        { kind: 'milestone', id: 'misty-defeated' },
        { kind: 'item', id: 'hm01', quantity: 1, consumed: false },
      ]) });
    expect(capabilities.find(capability => capability.id === 'surf-access')?.requirements)
      .toMatchObject({ kind: 'all', requirements: expect.arrayContaining([
        { kind: 'milestone', id: 'koga-defeated' },
        { kind: 'item', id: 'hm03', quantity: 1, consumed: false },
      ]) });
    expect(capabilities.find(capability => capability.id === 'rock-smash-access')?.requirements)
      .toMatchObject({ kind: 'all', requirements: expect.arrayContaining([
        { kind: 'milestone', id: 'one-island' },
        { kind: 'milestone', id: 'sabrina-defeated' },
        { kind: 'item', id: 'hm06', quantity: 1, consumed: false },
      ]) });
    expect(wildSources.some(source => /alteringcave-[2-9]-firered/.test(source.id))).toBe(false);
    const tableRates = new Map<string, number>();
    for (const source of wildSources) {
      const match = source.id.match(/^wild-(.+)-(grass|surf|old-rod|good-rod|super-rod|rock-smash)-/);
      if (!match || source.details.kind !== 'wild' || typeof source.details.ratePercent !== 'number') {
        throw new Error(`Invalid wild encounter source ${source.id}`);
      }
      const key = `${match[1]}:${source.details.method}`;
      tableRates.set(key, (tableRates.get(key) ?? 0) + source.details.ratePercent);
    }
    expect([...tableRates.values()].every(rate => Math.abs(rate - 100) < 0.001)).toBe(true);
  });

  it('validates FireRed key items, alternatives, gifts, fossils, trades, and starter-linked roamers', () => {
    type ChoiceLink = { groupId: string; optionId: string } | null;
    type ItemSourceRow = { locationId: string; choice: ChoiceLink; requirements: any };
    type PokemonSourceRow = { id: string; pokemonId: string; locationId: string; choice: ChoiceLink;
      requirements: any; level: unknown; details: unknown; maxUses: number | null };
    const itemRows = items as unknown as { sources: unknown[] }[];
    const itemSourceRows = itemRows.flatMap(item => item.sources) as ItemSourceRow[];
    const pokemonSourceRows = sources as unknown as PokemonSourceRow[];
    expect(items).toHaveLength(42);
    expect(items.every(item => validItem(item) && item.review.referenceIds.includes('firered-items'))).toBe(true);
    expect(choices.every(choice => validChoice(choice) && choice.review.referenceIds.includes('firered-choices'))).toBe(true);
    expect(sources).toHaveLength(2099);
    expect(new Set(sources.map(source => source.id)).size).toBe(sources.length);
    expect(sources.every(source => validSource(source) && profiles.some(profile => profile.pokemonId === source.pokemonId) &&
      locations.some(location => location.id === source.locationId))).toBe(true);
    const breedingSources = sources.filter(source => source.details.kind === 'breeding');
    expect(breedingSources).toHaveLength(183);
    expect(breedingRules).toHaveLength(181);
    expect(breedingRules.flatMap(rule => rule.offspringPokemonIds).length).toBe(183);
    expect(breedingRules.flatMap(rule => rule.offspringPokemonIds).filter((id, index, all) => all.indexOf(id) === index))
      .toHaveLength(181);
    expect(breedingRules.every(rule => rule.offspringPokemonIds.every(id => breedingSources.some(source =>
      source.pokemonId === id && source.details.kind === 'breeding' && source.details.ruleId === rule.id)))).toBe(true);
    const itemIds = new Set(items.map(item => item.id));
    const choiceMap = new Map<string, { options: string[] }>(choices.map(choice =>
      [choice.id, choice] as [string, { options: string[] }]));
    const itemRequirementsResolve = (requirement: any): boolean => {
      if (requirement.kind === 'item') return itemIds.has(requirement.id);
      if (requirement.kind === 'all' || requirement.kind === 'any')
        return requirement.requirements.every(itemRequirementsResolve);
      return true;
    };
    expect(items.every(item => (item.sources.length > 0 || ['deep-sea-tooth', 'deep-sea-scale'].includes(item.id)) && item.sources.every(source =>
      locations.some(location => location.id === source.locationId)))).toBe(true);
    expect(items.filter(item => ['kings-rock', 'metal-coat', 'dragon-scale', 'up-grade'].includes(item.id))
      .every(item => item.sources.length === 1)).toBe(true);
    expect(pokemonSourceRows.every(source => !source.choice || choiceMap.get(source.choice.groupId)?.options.includes(source.choice.optionId))).toBe(true);
    expect(itemSourceRows.every(source => !source.choice ||
      choiceMap.get(source.choice.groupId)?.options.includes(source.choice.optionId))).toBe(true);
    expect(locations.every(location => itemRequirementsResolve(location.requirements))).toBe(true);
    expect(capabilities.every(capability => itemRequirementsResolve(capability.requirements))).toBe(true);
    expect(pokemonSourceRows.every(source => itemRequirementsResolve(source.requirements))).toBe(true);
    expect(itemSourceRows.every(source => itemRequirementsResolve(source.requirements))).toBe(true);

    const find = (id: string) => pokemonSourceRows.find(source => source.id === id)!;
    expect(['starter-bulbasaur', 'starter-charmander', 'starter-squirtle'].map(id => find(id).choice?.optionId))
      .toEqual(['bulbasaur', 'charmander', 'squirtle']);
    expect(find('gift-hitmonlee-dojo').choice?.groupId).toBe('dojo-choice');
    expect(find('gift-hitmonchan-dojo').choice?.groupId).toBe('dojo-choice');
    expect(find('gift-omanyte-fossil').details).toMatchObject({ kind: 'fossil', itemId: 'helix-fossil' });
    expect(find('gift-kabuto-fossil').details).toMatchObject({ kind: 'fossil', itemId: 'dome-fossil' });
    expect(find('gift-aerodactyl-old-amber').details).toMatchObject({ kind: 'fossil', itemId: 'old-amber' });
    expect(find('trade-mr-mime-route2')).toMatchObject({
      requirements: { kind: 'pokemon', id: 'abra', quantity: 1, consumed: true },
      level: { kind: 'match-traded-pokemon', pokemonId: 'abra' },
      details: { kind: 'game-trade', offeredPokemonId: 'abra' },
    });
    expect(['roaming-entei-after-network', 'roaming-suicune-after-network', 'roaming-raikou-after-network']
      .map(id => find(id))).toMatchObject([
        { pokemonId: 'entei', requirements: { kind: 'milestone', id: 'network-machine' }, choice: { groupId: 'starter-choice', optionId: 'bulbasaur' }, details: { kind: 'roaming' }, maxUses: 1 },
        { pokemonId: 'suicune', requirements: { kind: 'milestone', id: 'network-machine' }, choice: { groupId: 'starter-choice', optionId: 'charmander' }, details: { kind: 'roaming' }, maxUses: 1 },
        { pokemonId: 'raikou', requirements: { kind: 'milestone', id: 'network-machine' }, choice: { groupId: 'starter-choice', optionId: 'squirtle' }, details: { kind: 'roaming' }, maxUses: 1 },
      ]);
    expect(items.find(item => item.id === 'coin-case')?.sources[0].locationId).toBe('celadon-restaurant');
    expect(items.find(item => item.id === 'rainbow-pass')?.sources[0].requirements)
      .toEqual({ kind: 'milestone', id: 'ruby-returned' });
    expect(items.find(item => item.id === 'hm05')?.sources[0].requirements).toMatchObject({ kind: 'all', requirements: expect.arrayContaining([
        { kind: 'milestone', id: 'hm05-reward-opportunity' }, { kind: 'capability', id: 'cut-access' },
      ]) });
    expect(items.find(item => item.id === 'silph-scope')?.sources[0].requirements)
      .toEqual({ kind: 'milestone', id: 'rocket-hideout-cleared' });
    expect(items.find(item => item.id === 'poke-flute')?.sources[0].requirements)
      .toEqual({ kind: 'all', requirements: [
        { kind: 'item', id: 'silph-scope', quantity: 1, consumed: false },
        { kind: 'milestone', id: 'fuji-rescued' },
      ] });
    expect(find('gift-lapras-silph')).toMatchObject({
      locationId: 'silph-co-7f', requirements: { kind: 'milestone', id: 'silph-co-rescued' },
    });
    expect(progression.find(milestone => milestone.id === 'rocket-hideout-cleared')?.previousIds)
      .toEqual(['misty-defeated']);
    expect(progression.find(milestone => milestone.id === 'koga-defeated')?.previousIds)
      .toEqual(['erika-defeated', 'fuji-rescued']);
    expect(['rocket-hideout-cleared', 'fuji-rescued', 'silph-co-rescued']
      .every(id => !progression.find(milestone => milestone.id === id)?.previousIds.includes('erika-defeated'))).toBe(true);
    expect(items.find(item => item.id === 'sun-stone')?.sources[0].requirements)
      .toEqual({ kind: 'milestone', id: 'national-dex' });
    expect(find('roaming-entei-after-network').level).toEqual({ kind: 'fixed', value: 50 });
    expect(find('roaming-suicune-after-network').level).toEqual({ kind: 'fixed', value: 50 });
    expect(find('roaming-raikou-after-network').level).toEqual({ kind: 'fixed', value: 50 });
  });

  it('validates all FireRed records together and accounts for every supported species outcome', () => {
    const result = validateDataset({ ...rawSharedData, games: [rawModule] });
    expect(result.ok).toBe(true);
    if (result.ok === false) throw new Error(JSON.stringify(result.error));
    const gameData = result.value.games[0];
    const at = (id: string) => solve(gameData, gameData.milestones.find(milestone => milestone.id === id)!, false);
    const early = at('pallet-town');
    const late = at('network-machine');
    expect(early.paths.has('bulbasaur')).toBe(true);
    expect(early.paths.has('mewtwo')).toBe(false);
    expect(late.paths.has('mewtwo')).toBe(true);
    expect(late.paths.has('entei')).toBe(true);
    expect([...late.paths.keys()].some(id => exclusions.some(entry => entry.pokemonId === id))).toBe(false);
    expect(late.paths.get('entei')?.[0].choices).toContainEqual({ groupId: 'starter-choice', optionId: 'bulbasaur' });
    const native = new Set(sources.filter(source => source.details.kind !== 'breeding').map(source => source.pokemonId));
    let changed = true;
    while (changed) {
      changed = false;
      for (const evolution of evolutions) {
        if (evolution.trigger !== 'player-trade' && native.has(evolution.fromPokemonId)) {
          for (const id of [evolution.toPokemonId, ...(evolution.coProductIds ?? [])]) {
            if (!native.has(id)) { native.add(id); changed = true; }
          }
        }
      }
      for (const rule of breedingRules) {
        if (rule.parentPokemonIds.some(id => native.has(id))) for (const id of rule.offspringPokemonIds) {
          if (!native.has(id)) { native.add(id); changed = true; }
        }
      }
    }
    const tradeBlocked = new Set(evolutions.filter(evolution => evolution.trigger === 'player-trade')
      .map(evolution => evolution.toPokemonId));
    expect(evolutions.filter(evolution => evolution.trigger === 'player-trade')).toHaveLength(12);
    const excluded = new Set(exclusions.map(entry => entry.pokemonId));
    const solvedNative = new Set(late.paths.keys());
    expect(solvedNative).toEqual(native);
    const actualEvolutionIds = evolutions.map(evolution => evolution.id).sort();
    expect(pinnedEvolutionTransitionIds).toHaveLength(184);
    expect([...unsupportedFireRedTransitions].sort()).toEqual(['eevee-to-espeon', 'eevee-to-umbreon', 'feebas-to-milotic']);
    expect(actualEvolutionIds).toEqual(pinnedEvolutionTransitionIds.filter(id => !unsupportedFireRedTransitions.has(id)).sort());
    expect(evolutions).toHaveLength(181);
    const nationalDexRequired = (requirement: any): boolean => requirement.kind === 'milestone'
      ? requirement.id === 'national-dex'
      : (requirement.kind === 'all' || requirement.kind === 'any') && requirement.requirements.some(nationalDexRequired);
    for (const evolution of evolutions) {
      if (!profiles.find(profile => profile.pokemonId === evolution.toPokemonId)?.regionalDex)
        expect(nationalDexRequired(evolution.requirements), evolution.id).toBe(true);
    }
    expect(evolutions.find(evolution => evolution.id === 'nincada-to-shedinja')).toMatchObject({
      conditions: [{ kind: 'party-space', freeSlots: 1 }], requirements: { kind: 'all', requirements: expect.arrayContaining([
        { kind: 'capability', id: 'party-space' }, { kind: 'milestone', id: 'national-dex' },
      ]) }, coProductIds: ['ninjask'],
    });
    const shedinjaRequirements = evolutions.find(evolution => evolution.id === 'nincada-to-shedinja')!.requirements;
    expect(JSON.stringify(shedinjaRequirements)).not.toContain('poke-ball');
    expect(evolutions.filter(evolution => evolution.fromPokemonId === 'tyrogue').map(evolution => evolution.toPokemonId).sort())
      .toEqual(['hitmonchan', 'hitmonlee', 'hitmontop']);
    const groups = [native, tradeBlocked, excluded];
    expect(excluded.size).toBe(exclusions.length);
    expect(groups.flatMap(group => [...group])).toHaveLength(profiles.length);
    expect(new Set(groups.flatMap(group => [...group])).size).toBe(profiles.length);
    expect(new Set([...native, ...tradeBlocked, ...excluded])).toEqual(new Set(profiles.map(profile => profile.pokemonId)));
    expect(evolutions.filter(evolution => evolution.trigger === 'player-trade').length).toBeGreaterThan(0);
    expect(breedingRules.every(rule => !rule.offspringPokemonIds.includes('ditto'))).toBe(true);
    const predecessors = new Map<string, string[]>();
    for (const id of pinnedEvolutionTransitionIds) {
      const [from, to] = id.split('-to-'); predecessors.set(to, [...(predecessors.get(to) ?? []), from]);
    }
    const eggSpecies = new Set<string>();
    for (const profile of profiles) {
      const groups = profile.breeding?.eggGroupIds ?? [];
      if (!groups.length || groups.includes('ditto') || groups.includes('undiscovered')) continue;
      const seen = new Set<string>(); const pending = [profile.pokemonId];
      while (pending.length) {
        const species = pending.pop()!; if (seen.has(species)) continue; seen.add(species);
        pending.push(...(predecessors.get(species) ?? []));
      }
      for (const species of seen) if (!(predecessors.get(species)?.length)) eggSpecies.add(species);
    }
    eggSpecies.add('marill'); eggSpecies.add('wobbuffet');
    expect(new Set(breedingRules.flatMap(rule => rule.offspringPokemonIds))).toEqual(eggSpecies);
    expect(breedingRules.find(rule => rule.offspringPokemonIds.includes('wynaut'))?.requiredHeldItemId).toBe('lax-incense');
    expect(evolutions.some(evolution => evolution.id === 'nincada-to-shedinja')).toBe(true);
    expect(evolutions.some(evolution => unsupportedFireRedTransitions.has(evolution.id))).toBe(false);
    expect(progression.some(milestone => milestone.id === 'hm05-reward-opportunity')).toBe(true);
    expect(progression.some(milestone => milestone.id === 'togepi-egg-opportunity')).toBe(true);
    expect(sources.find(source => source.id === 'roaming-entei-after-network')?.requirements)
      .toEqual({ kind: 'milestone', id: 'network-machine' });
  }, 20000);

  it('uses plain UTF-8 JSON with no byte-order mark or trailing content', () => {
    for (const name of ['game.json', 'pokemon.json', 'type-chart.json', 'progression.json', 'bosses.json', 'locations.json', 'capabilities.json', 'items.json', 'choices.json', 'sources.json', 'breeding-rules.json', 'evolutions.json', 'exclusions.json']) {
      const bytes = readFileSync(`data/games/firered/${name}`);
      expect(bytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf]))).toBe(false);
      expect(() => JSON.parse(bytes.toString('utf8'))).not.toThrow();
    }
  });
});

