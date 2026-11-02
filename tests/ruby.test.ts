import { describe, expect, it } from 'vitest';
import references from '../data/references.json';
import pokemon from '../data/pokemon.json';
import { rawGame } from '../src/data/games/ruby';
import { validateDataset } from '../src/data/validate-dataset';
import { checkTeam } from '../src/domain/team/check-team';
import { solve } from '../src/domain/availability/solve';
import type { AvailabilitySnapshot, Dataset, GameData } from '../src/domain/types';

const checked = validateDataset({ schemaVersion: 2, references, pokemon, games: [rawGame] });
if (!checked.ok) throw new Error(JSON.stringify(checked.error));
const dataset = checked.value as Dataset;
const ruby = dataset.games.find(game => game.game.id === 'ruby') as GameData;
const hasRequirement = (node: unknown, kind: string, id: string): boolean => {
  if (!node || typeof node !== 'object') return false;
  const requirement = node as { kind?: string; id?: string; requirements?: unknown[] };
  return (requirement.kind === kind && requirement.id === id)
    || (requirement.requirements?.some(child => hasRequirement(child, kind, id)) ?? false);
};
describe('Pokémon Ruby reviewed data', () => {
  it('covers all 386 species and the exact 202-entry Hoenn order', () => {
    expect(dataset.pokemon.filter(pokemon=>pokemon.introducedGeneration<=ruby.game.generation)).toHaveLength(386);
    expect(ruby.profiles).toHaveLength(386);
    expect(ruby.profiles.filter(profile => profile.regionalDex !== undefined)).toHaveLength(202);
    expect(ruby.profiles.map(profile => profile.regionalDex).filter(Boolean).sort((a,b) => a! - b!))
      .toEqual(Array.from({ length: 202 }, (_, index) => index + 1));
  });
  it('keeps Ruby progress checkpoints to its eight Gyms and Victory Road', () => {
    expect(ruby.bosses.map(boss => boss.id)).toEqual([
      'roxanne','brawly','wattson','flannery','norman','winona','tate-and-liza','wallace',
      'sidney','phoebe','glacia','drake','steven',
    ]);
    expect(ruby.game.planner!.checkpoints.map(checkpoint => checkpoint.milestoneId)).toEqual([
      'roxanne-defeated', 'brawly-defeated', 'wattson-defeated', 'flannery-defeated',
      'norman-defeated', 'winona-defeated', 'tate-and-liza-defeated', 'wallace-defeated', 'victory-road',
    ]);
    expect(ruby.game.planner!.defaultMilestoneId).toBe('victory-road');
    expect(ruby.milestones).toHaveLength(131);
    expect(ruby.milestones.some(milestone => /mirage tower/i.test(milestone.name))).toBe(false);
  });
  it('records the starter choice and Ruby-native paths in the source data', () => {
    expect(ruby.choices.find(choice => choice.id === 'starter-choice')?.options)
      .toEqual(['treecko', 'torchic', 'mudkip']);
    for (const species of ['treecko', 'torchic', 'mudkip']) {
      expect(ruby.sources.find(source => source.id === `birch-${species}`)).toMatchObject({
        pokemonId: species, choice: { groupId: 'starter-choice', optionId: species },
        requirements: { kind: 'milestone', id: 'starter' },
      });
    }
    expect(ruby.sources.some(source => source.pokemonId === 'ralts'
      && source.details.kind === 'wild' && source.locationId === 'route-102')).toBe(true);
    expect(ruby.capabilities.find(capability => capability.id === 'mirage-island')?.requirements).toEqual({
      kind: 'all', requirements: [{ kind: 'milestone', id: 'norman-defeated' }, { kind: 'capability', id: 'surf' }],
    });
    expect(ruby.sources.some(source => source.id === 'ruby-wild-route130-grass-wynaut'
      && source.locationId === 'mirage-island')).toBe(true);
  });
  it('solves early Ruby access and blocks a team that takes two starters', () => {
    const milestone = ruby.milestones.find(candidate => candidate.id === 'route-102')!;
    const context = solve(ruby, milestone, false);
    expect(context.paths.has('treecko')).toBe(true);
    expect(context.paths.has('torchic')).toBe(true);
    expect(context.paths.has('mudkip')).toBe(true);
    expect(context.paths.has('ralts')).toBe(true);

    const paths = Object.fromEntries([...context.paths.values()].flat().map(path => [path.id, path]));
    const entries = Object.fromEntries(['treecko', 'torchic'].map(pokemonId => {
      const currentPathIds = (context.paths.get(pokemonId) ?? []).map(path => path.id);
      return [pokemonId, { pokemonId, status: 'available' as const, currentPathIds,
        futurePathIds: [], firstMilestoneIds: [], blockers: [] }];
    }));
    const snapshot = { query: { gameId: 'ruby', milestoneId: milestone.id, respectLevelLimit: false },
      levelLimit: null, entries, paths, choiceGroups: ruby.choices, resourceLimits: context.resourceLimits } as AvailabilitySnapshot;
    expect(checkTeam(snapshot, ['treecko', 'torchic'], 'whole-game')).toMatchObject({
      feasible: false, warnings: [{ code: 'choice-conflict', relatedId: 'starter-choice' }],
    });
  });
  it('does not expose Ruby-absent Emerald species or event species', () => {
    expect(ruby.sources.find(source => source.id === 'roaming-latios')).toMatchObject({
      locationId: 'hoenn-roaming-routes', maxUses: 1, details: { kind: 'roaming' },
      pokemonId: 'latios', level: { kind: 'fixed', value: 40 },
      requirements: { kind: 'milestone', id: 'latios-roams' },
    });
    expect(ruby.exclusions.find(exclusion => exclusion.pokemonId === 'latias')?.reason).toBe('external-event');
    expect(ruby.sources.find(source => source.id === 'static-rayquaza')).toMatchObject({
      pokemonId: 'rayquaza', level: { kind: 'fixed', value: 70 },
      requirements: { kind: 'capability', id: 'mach-bike' },
    });
    expect(ruby.milestones.find(milestone => milestone.id === 'rayquaza')?.phase).toBe('post-game');
    expect(ruby.exclusions.find(exclusion => exclusion.pokemonId === 'ho-oh')).toBeDefined();
    expect(ruby.exclusions.find(exclusion => exclusion.pokemonId === 'deoxys')).toBeDefined();
  });
  it('gates Sky Pillar on game clear and the Mach Bike climb', () => {
    const champion = ruby.milestones.find(milestone => milestone.id === 'steven-defeated')!;
    expect(ruby.locations.find(location => location.id === 'sky-pillar')?.requirements)
      .toEqual({ kind: 'milestone', id: 'steven-defeated' });
    expect(ruby.sources.find(source => source.id === 'static-rayquaza')).toMatchObject({
      level: { kind: 'fixed', value: 70 },
      requirements: { kind: 'capability', id: 'mach-bike' },
    });
    expect(solve(ruby, ruby.milestones.find(milestone => milestone.id === 'victory-road')!, false)
      .paths.has('rayquaza')).toBe(false);
    expect(solve(ruby, champion, false).paths.has('rayquaza')).toBe(true);
    const withoutBike = { ...ruby,
      capabilities: ruby.capabilities.map(capability => capability.id === 'mach-bike'
        ? { ...capability, requirements: { kind: 'milestone' as const, id: 'rayquaza' } }
        : capability) };
    expect(solve(withoutBike, champion, false).paths.has('rayquaza')).toBe(false);
  }, 60000);
  it("uses Ruby villain events and places the Dive gift at Steven house", () => {
    expect(ruby.milestones.some(milestone => milestone.id === 'magma-emblem')).toBe(false);
    expect(ruby.milestones.find(milestone => milestone.id === 'red-orb')).toMatchObject({
      name: 'Mt. Pyre: receive the Red Orb', locationId: 'mt-pyre', previousIds: ['mt-pyre'],
    });
    expect(ruby.milestones.some(milestone => milestone.id === 'aqua-hideout')).toBe(false);
    expect(ruby.milestones.find(milestone => milestone.id === 'submarine')).toMatchObject({
      name: 'Team Magma steals the submarine', locationId: 'slateport',
      previousIds: ['red-orb', 'lilycove'],
    });
    expect(ruby.milestones.find(milestone => milestone.id === 'magma-hideout')?.previousIds)
      .toContain('submarine');
    expect(ruby.milestones.find(milestone => milestone.id === 'magma-hideout')?.name)
      .toContain('submarine escapes');
    expect(ruby.locations.find(location => location.id === 'magma-hideout')?.requirements)
      .toMatchObject({ kind: 'all', requirements: expect.arrayContaining([
        { kind: 'milestone', id: 'submarine' },
      ]) });
    expect(ruby.milestones.find(milestone => milestone.id === 'dive-gift')).toMatchObject({
      name: 'Receive Dive from Steven after Tate & Liza', locationId: 'stevens-house',
      previousIds: ['tate-and-liza-defeated'],
    });
    expect(ruby.capabilities.find(capability => capability.id === 'dive')?.requirements)
      .toEqual({ kind: 'milestone', id: 'dive-gift' });
    expect(ruby.capabilities.find(capability => capability.id === 'super-rod')?.requirements)
      .toEqual({ kind: 'milestone', id: 'mossdeep' });
    expect(ruby.sources.find(source => source.id === 'groudon-cave-of-origin')).toMatchObject({
      pokemonId: 'groudon', locationId: 'cave-of-origin',
      requirements: { kind: 'milestone', id: 'maxie-seafloor' },
    });
    expect(ruby.sources.find(source => source.id === 'static-rayquaza')).toMatchObject({
      pokemonId: 'rayquaza', locationId: 'sky-pillar', level: { kind: 'fixed', value: 70 },
      requirements: { kind: 'capability', id: 'mach-bike' },
    });
    expect(ruby.milestones.find(milestone => milestone.id === 'rayquaza')?.phase).toBe('post-game');
  });
  it('uses Ruby NPC trades, not the Emerald trade table', () => {
    const expected = [
      { id: 'trade-makuhita', pokemonId: 'makuhita', offered: 'slakoth', locationId: 'rustboro', gender: 'male' },
      { id: 'trade-skitty', pokemonId: 'skitty', offered: 'pikachu', locationId: 'fortree', gender: 'female' },
      { id: 'trade-corsola', pokemonId: 'corsola', offered: 'bellossom', locationId: 'pacifidlog', gender: 'male' },
    ];
    for (const trade of expected) {
      expect(ruby.sources.find(source => source.id === trade.id)).toMatchObject({
        pokemonId: trade.pokemonId,
        locationId: trade.locationId,
        level: { kind: 'match-traded-pokemon', pokemonId: trade.offered },
        genders: [trade.gender],
        maxUses: 1,
        requirements: { kind: 'pokemon', id: trade.offered, quantity: 1, consumed: true },
        details: { kind: 'game-trade', offeredPokemonId: trade.offered },
      });
    }
    expect(ruby.sources.some(source => ['trade-seedot', 'trade-plusle', 'trade-horsea'].includes(source.id))).toBe(false);
  });
  it('places the one-time fossil choice in the Route 111 desert', () => {
    expect(ruby.choices.find(choice => choice.id === 'fossil-choice')).toMatchObject({
      name: 'Route 111 desert fossil', options: ['root-fossil', 'claw-fossil'], maximumSelections: 1,
    });
    expect(ruby.locations.find(location => location.id === 'route-111-desert')?.requirements)
      .toEqual({ kind: 'milestone', id: 'route-111-desert' });
    for (const [id, pokemonId] of [['revive-lileep', 'lileep'], ['revive-anorith', 'anorith']] as const) {
      expect(ruby.sources.find(source => source.id === id)).toMatchObject({
        pokemonId, locationId: 'route-111-desert', details: { kind: 'fossil' },
      });
    }
    expect(ruby.items.find(item => item.id === 'root-fossil')?.sources[0]).toMatchObject({
      id: 'root-fossil-desert', locationId: 'route-111-desert', maxUses: 1,
    });
    expect(ruby.items.find(item => item.id === 'claw-fossil')?.sources[0]).toMatchObject({
      id: 'claw-fossil-desert', locationId: 'route-111-desert', maxUses: 1,
    });
  });
  it('gates the Beldum gift behind the Ruby Hall of Fame and excludes Lunatone-held items', () => {
    expect(ruby.sources.find(source => source.id === 'beldum-gift')).toMatchObject({
      locationId: 'stevens-house', requirements: { kind: 'milestone', id: 'steven-defeated' },
    });
    expect(ruby.items.find(item => item.id === 'moon-stone')?.sources.some(source => source.id === 'moon-lunatone')).toBe(false);
    expect(ruby.items.find(item => item.id === 'sun-stone')?.sources.some(source => source.id === 'sun-solrock')).toBe(true);
  });
  it('matches Ruby evolution branches and Day Care incense rules', () => {
    expect(ruby.evolutions).toHaveLength(184);
    expect(ruby.breedingRules).toHaveLength(181);
    expect(ruby.evolutions.find(rule => rule.id === 'eevee-to-espeon')?.conditions)
      .toEqual([{ kind: 'friendship', minimum: 220 }, { kind: 'time', period: 'day' }]);
    expect(ruby.evolutions.find(rule => rule.id === 'eevee-to-umbreon')?.conditions)
      .toEqual([{ kind: 'friendship', minimum: 220 }, { kind: 'time', period: 'night' }]);
    expect(ruby.evolutions.find(rule => rule.id === 'wurmple-to-silcoon')?.conditions)
      .toEqual([{ kind: 'personality', modulus: 10, minimum: 0, maximum: 4 }]);
    expect(ruby.evolutions.find(rule => rule.id === 'wurmple-to-cascoon')?.conditions)
      .toEqual([{ kind: 'personality', modulus: 10, minimum: 5, maximum: 9 }]);
    expect(ruby.evolutions.find(rule => rule.id === 'nincada-to-shedinja')).toMatchObject({
      trigger: 'level-up', minimumLevel: 20, conditions: [{ kind: 'party-space', freeSlots: 1 }],
      requirements: { kind: 'capability', id: 'party-space' }, coProductIds: ['ninjask'],
    });
    expect(ruby.evolutions.find(rule => rule.id === 'nincada-to-shedinja')?.requirements)
      .not.toMatchObject({ kind: 'item', id: 'poke-ball' });
    expect(ruby.evolutions.find(rule => rule.id === 'clamperl-to-huntail')?.trigger).toBe('player-trade');
    expect(ruby.evolutions.find(rule => rule.id === 'clamperl-to-gorebyss')?.trigger).toBe('player-trade');
    expect(ruby.items.some(item => item.id === 'upgrade')).toBe(true);
    expect(ruby.breedingRules.find(rule => rule.id === 'breed-azurill')).toMatchObject({
      offspringPokemonIds: ['azurill'], requiredHeldItemId: 'sea-incense',
    });
    expect(ruby.breedingRules.find(rule => rule.id === 'breed-wynaut')).toMatchObject({
      offspringPokemonIds: ['wynaut'], requiredHeldItemId: 'lax-incense',
    });
    for (const speciesId of ['pichu', 'igglybuff', 'azurill']) {
      expect(ruby.exclusions.some(exclusion => exclusion.pokemonId === speciesId)).toBe(false);
      expect(ruby.sources.some(source => source.pokemonId === speciesId
        && source.details.kind === 'breeding')).toBe(true);
    }
    expect(ruby.sources.some(source => source.pokemonId === 'pikachu' && source.details.kind === 'wild')).toBe(true);
    expect(ruby.sources.some(source => source.pokemonId === 'jigglypuff' && source.details.kind === 'wild')).toBe(true);
  });
  it('records Ruby item sources without treating the decoration shop as an item shop', () => {
    for (const itemId of ['moon-stone', 'sun-stone', 'fire-stone', 'thunder-stone', 'water-stone', 'leaf-stone']) {
      expect(ruby.items.find(item => item.id === itemId)?.sources
        .some(source => source.id.endsWith('-lilycove-shop'))).toBe(false);
    }
    expect(ruby.items.find(item => item.id === 'pokeblock-case')?.sources[0]).toMatchObject({
      id: 'case-contest-hall', locationId: 'slateport', maxUses: 1,
    });
    expect(ruby.items.find(item => item.id === 'scanner')?.sources[0]).toMatchObject({
      id: 'scanner-ship', locationId: 'abandoned-ship', maxUses: 1,
    });
    expect(ruby.items.find(item => item.id === 'deep-sea-tooth')?.sources[0]).toMatchObject({
      maxUses: 1, choice: { groupId: 'scanner-choice', optionId: 'deep-sea-tooth' },
    });
    expect(ruby.items.find(item => item.id === 'deep-sea-scale')?.sources[0]).toMatchObject({
      maxUses: 1, choice: { groupId: 'scanner-choice', optionId: 'deep-sea-scale' },
    });
    expect(ruby.exclusions.some(exclusion => exclusion.explanation.includes('Emerald'))).toBe(false);
  });
  it('does not use Ruby one-time Moon Stone for two team members', () => {
    const milestone = ruby.milestones.find(point => point.id === 'steven-defeated')!;
    const context = solve(ruby, milestone, false);
    const paths = Object.fromEntries([...context.paths.values()].flat().map(path => [path.id, path]));
    const team = ['delcatty', 'wigglytuff'];
    const entries = Object.fromEntries(team.map(pokemonId => {
      const currentPathIds = (context.paths.get(pokemonId) ?? []).map(path => path.id);
      expect(currentPathIds.length, pokemonId).toBeGreaterThan(0);
      return [pokemonId, { pokemonId, status: 'available' as const, currentPathIds,
        futurePathIds: [], firstMilestoneIds: [], blockers: [] }];
    }));
    const snapshot = { query: { gameId: 'ruby', milestoneId: milestone.id, respectLevelLimit: false },
      levelLimit: null, entries, paths, choiceGroups: ruby.choices, resourceLimits: context.resourceLimits } as AvailabilitySnapshot;
    expect(checkTeam(snapshot, team, 'current-progress')).toMatchObject({
      feasible: false, warnings: [{ code: 'finite-resource', relatedId: 'item-source:moon-meteor' }],
    });
  }, 60000);
  it('uses Ruby sea-route, New Mauville, Safari Zone, and Mirage Island gates', () => {
    const seaLocations = ruby.locations.filter(location =>
      /^route-12[4-9]$|^route-13[0-4]$/.test(location.id)
      || ['mossdeep', 'pacifidlog'].includes(location.id));
    expect(seaLocations.length).toBeGreaterThan(10);
    expect(seaLocations.every(location => hasRequirement(location.requirements, 'capability', 'surf'))).toBe(true);
    const lilycoveSide = seaLocations.filter(location =>
      /^route-12[4-9]$|^route-13[0-3]$/.test(location.id) || ['mossdeep', 'pacifidlog'].includes(location.id));
    expect(lilycoveSide.every(location =>
      hasRequirement(location.requirements, 'milestone', 'magma-hideout'))).toBe(true);
    expect(ruby.locations.find(location => location.id === 'route-134')?.requirements)
      .toEqual({ kind: 'capability', id: 'surf' });
    expect(ruby.locations.find(location => location.id === 'route-132')?.requirements)
      .toMatchObject({ kind: 'all', requirements: expect.arrayContaining([
        { kind: 'capability', id: 'surf' },
        { kind: 'milestone', id: 'magma-hideout' },
      ]) });

    const beforeHideout = solve(ruby, ruby.milestones.find(milestone => milestone.id === 'norman-defeated')!, false);
    const afterHideout = solve(ruby, ruby.milestones.find(milestone => milestone.id === 'magma-hideout')!, false);
    expect([...beforeHideout.paths.values()].flat().some(path => path.sourceIds.includes('ruby-wild-route124-surf-tentacool')))
      .toBe(false);
    expect([...afterHideout.paths.values()].flat().some(path => path.sourceIds.includes('ruby-wild-route124-surf-tentacool')))
      .toBe(true);
    expect([...beforeHideout.paths.values()].flat().some(path => path.sourceIds.includes('ruby-wild-route133-surf-tentacool')))
      .toBe(false);
    expect([...afterHideout.paths.values()].flat().some(path => path.sourceIds.includes('ruby-wild-route133-surf-tentacool')))
      .toBe(true);

    expect(ruby.items.find(item => item.id === 'basement-key')?.sources[0]).toMatchObject({
      id: 'basement-key-wattson', maxUses: 1,
      requirements: { kind: 'milestone', id: 'wattson-defeated' },
    });
    expect(ruby.locations.find(location => location.id === 'new-mauville')?.requirements)
      .toMatchObject({ kind: 'all', requirements: expect.arrayContaining([
        { kind: 'capability', id: 'surf' },
        { kind: 'item', id: 'basement-key', quantity: 1, consumed: false },
      ]) });
    expect(ruby.locations.find(location => location.id === 'safari-zone')?.requirements)
      .toMatchObject({ kind: 'all', requirements: expect.arrayContaining([
        { kind: 'milestone', id: 'devon-scope' },
        { kind: 'item', id: 'pokeblock-case', quantity: 1, consumed: false },
      ]) });
    expect(ruby.sources.filter(source => source.locationId === 'shoal-cave')
      .every(source => hasRequirement(source.requirements, 'capability', 'low-tide'))).toBe(true);
    expect(ruby.sources.find(source => source.id === 'ruby-wild-route130-grass-wynaut')).toMatchObject({
      locationId: 'mirage-island', requirements: { kind: 'capability', id: 'mirage-island' },
      level: { kind: 'range', minimum: 5, maximum: 50 },
    });
  }, 60000);
  it('keeps the Route 119 Feebas encounter on all three fishing rods', () => {
    const sources = ruby.sources.filter(source => source.pokemonId === 'feebas' && source.id.startsWith('feebas-route-119-'));
    expect(sources).toHaveLength(3);
    expect(sources.map(source => source.details.kind === 'wild' ? source.details.method : null).sort())
      .toEqual(['good-rod', 'old-rod', 'super-rod']);
    expect(sources.every(source => source.details.kind === 'wild' && source.details.ratePercent === 50
      && source.level.kind === 'range' && source.level.minimum === 20 && source.level.maximum === 25)).toBe(true);
    for (const method of ['old-rod', 'good-rod', 'super-rod']) {
      expect(sources.some(source => source.requirements.kind === 'all'
        && source.requirements.requirements.some(requirement => requirement.kind === 'capability' && requirement.id === method))).toBe(true);
    }
  });
});





