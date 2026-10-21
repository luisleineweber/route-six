import { describe, expect, it } from 'vitest';
import profiles from '../data/games/gold/pokemon.json';
import typeChart from '../data/games/gold/type-chart.json';
import bosses from '../data/games/gold/bosses.json';
import game from '../data/games/gold/game.json';
import milestones from '../data/games/gold/progression.json';
import locations from '../data/games/gold/locations.json';
import choices from '../data/games/gold/choices.json';
import sources from '../data/games/gold/sources.json';
import evolutions from '../data/games/gold/evolutions.json';
import capabilities from '../data/games/gold/capabilities.json';
import items from '../data/games/gold/items.json';
import exclusions from '../data/games/gold/exclusions.json';
import breedingRules from '../data/games/gold/breeding-rules.json';
import { rawGame } from '../src/data/games/gold';
import { rawSharedData } from '../src/data/shared-data';
import { validateDataset } from '../src/data/validate-dataset';

describe('Pokémon Gold reviewed data', () => {
  it('covers the 251 regional Pokédex entries in order with a complete 17-type chart', () => {
    expect(profiles).toHaveLength(251);
    expect(profiles.map((profile) => profile.regionalDex)).toEqual(
      Array.from({ length: 251 }, (_, index) => index + 1),
    );
    expect(typeChart.typeIds).toHaveLength(17);
    expect(typeChart.matrix).toHaveLength(17);
    expect(typeChart.matrix.every((row) => row.length === 17)).toBe(true);
  });

  it('records the three one-time starter choices and their reviewed level evolutions', () => {
    const starterIds = ['chikorita', 'cyndaquil', 'totodile'];
    const starterChoice = choices.find((choice) => choice.id === 'starter-choice');
    expect(starterChoice?.options).toEqual(starterIds);
    expect(starterChoice?.maximumSelections).toBe(1);
    expect(sources.filter((source) => source.details.kind === 'starter')).toHaveLength(3);
    expect(sources.filter((source) => source.details.kind === 'starter')
      .every((source) => source.maxUses === 1 && source.choice?.groupId === 'starter-choice')).toBe(true);
    const starterLineOrder = ['chikorita', 'bayleef', 'cyndaquil', 'quilava', 'totodile', 'croconaw'];
    expect(evolutions.filter((evolution) => starterLineOrder.includes(evolution.fromPokemonId))
      .sort((a, b) => starterLineOrder.indexOf(a.fromPokemonId) - starterLineOrder.indexOf(b.fromPokemonId))
      .map((evolution) => [evolution.fromPokemonId, evolution.toPokemonId, evolution.minimumLevel]))
      .toEqual([
        ['chikorita', 'bayleef', 16], ['bayleef', 'meganium', 32],
        ['cyndaquil', 'quilava', 14], ['quilava', 'typhlosion', 36],
        ['totodile', 'croconaw', 18], ['croconaw', 'feraligatr', 30],
      ]);
  });

  it('assembles all thirteen local Gold collections', () => {
    expect(Object.keys(rawGame as Record<string, unknown>).sort()).toEqual([
      'bosses', 'breedingRules', 'capabilities', 'choices', 'evolutions', 'exclusions',
      'game', 'items', 'locations', 'milestones', 'profiles', 'sources', 'typeChart',
    ]);
  });

  it('covers Gold evolution, breeding, finite items, gifts, statics, and NPC trades', () => {
    expect(evolutions).toHaveLength(122);
    expect(evolutions.every((evolution) => evolution.review.referenceIds.includes('gold-evolutions'))).toBe(true);
    expect(breedingRules).toHaveLength(118);
    expect(breedingRules.every((rule) => rule.review.referenceIds.includes('gold-breeding'))).toBe(true);
    expect(items.map((item) => item.id)).toEqual([
      'leaf-stone', 'water-stone', 'fire-stone', 'thunder-stone', 'sun-stone',
      'kings-rock', 'dragon-scale', 'metal-coat', 'moon-stone', 'up-grade', 'rainbow-wing', 'silver-wing',
    ]);
    expect(items.find((item) => item.id === 'sun-stone')?.sources[0].maxUses).toBeNull();
    expect(items.find((item) => item.id === 'moon-stone')?.sources.map((source) => source.maxUses))
      .toEqual([null, 1]);
    expect(items.find((item) => item.id === 'leaf-stone')?.sources[0].maxUses).toBe(1);
    expect(items.find((item) => item.id === 'kings-rock')?.sources
      .filter((source) => source.id.includes('-held-')).map((source) => source.id)).toEqual([
      'kings-rock-held-poliwhirl', 'kings-rock-held-slowbro', 'kings-rock-held-slowpoke',
    ]);
    expect(sources.filter((source) => source.details.kind === 'game-trade')).toHaveLength(6);
    expect(sources.filter((source) => source.details.kind === 'static')).toHaveLength(9);
    expect(sources.find((source) => source.id === 'static-ho-oh')?.level).toEqual({ kind: 'fixed', value: 40 });
    expect(sources.find((source) => source.id === 'static-lugia')).toMatchObject({
      pokemonId: 'lugia', level: { kind: 'fixed', value: 70 }, maxUses: 1,
      requirements: { kind: 'all', requirements: expect.arrayContaining([
        { kind: 'milestone', id: 'kanto-open' }, { kind: 'capability', id: 'surf' },
        { kind: 'capability', id: 'whirlpool' },
        { kind: 'item', id: 'silver-wing', quantity: 1, consumed: false },
      ]) },
    });
    expect(exclusions.some((exclusion) => exclusion.pokemonId === 'lugia')).toBe(false);
    expect(sources.filter((source) => source.details.kind === 'breeding')).toHaveLength(119);
    expect(breedingRules.some(rule => rule.offspringPokemonIds.includes('ditto'))).toBe(false);
    expect(exclusions).toHaveLength(42);
    const covered = new Set(sources.filter((source) => source.details.kind !== 'breeding')
      .map((source) => source.pokemonId));
    let changed = true;
    while (changed) {
      changed = false;
      for (const evolution of evolutions) {
        if (evolution.trigger !== 'player-trade' && covered.has(evolution.fromPokemonId)
          && !covered.has(evolution.toPokemonId)) {
          covered.add(evolution.toPokemonId);
          changed = true;
        }
      }
      for (const rule of breedingRules) {
        if (rule.parentPokemonIds.some((parent) => covered.has(parent))) {
          for (const offspring of rule.offspringPokemonIds) {
            if (!covered.has(offspring)) {
              covered.add(offspring);
              changed = true;
            }
          }
        }
      }
    }
    expect(new Set([...covered, ...exclusions.map((exclusion) => exclusion.pokemonId)])).toEqual(
      new Set(profiles.map((profile) => profile.pokemonId)),
    );
    expect(exclusions.every((exclusion) => !covered.has(exclusion.pokemonId))).toBe(true);
    expect(['alakazam', 'gengar', 'golem', 'machamp', 'porygon2', 'politoed',
      'slowking', 'steelix', 'scizor', 'kingdra'].every((id) =>
      exclusions.some((exclusion) => exclusion.pokemonId === id))).toBe(true);
    expect(exclusions.every((exclusion) => !sources.some((source) =>
      source.pokemonId === exclusion.pokemonId && source.details.kind !== 'breeding'))).toBe(true);
    expect(exclusions.every((exclusion) => ['other-version', 'external-event'].includes(exclusion.reason)
      && exclusion.review.referenceIds.includes('gold-exclusions'))).toBe(true);
  });

  it('keeps the early Johto start and late postgame milestones linked to real records', () => {
    const milestoneById = new Map(milestones.map((milestone) => [milestone.id, milestone]));
    const locationIds = new Set(locations.map((location) => location.id));
    const bossIds = new Set(bosses.map((boss) => boss.id));
    expect(game.firstMilestoneId).toBe('new-bark-town');
    expect(game.planner.defaultMilestoneId).toBe('indigo-plateau');
    expect(milestoneById.get('route-29')?.previousIds).toContain('new-bark-town');
    expect(milestoneById.get('kanto-open')?.previousIds).toContain('indigo-plateau');
    expect(milestoneById.get('red-defeated')?.previousIds).toContain('blue-defeated');
    expect(milestones.every((milestone) => !milestone.locationId || locationIds.has(milestone.locationId))).toBe(true);
    expect(milestones.every((milestone) => !milestone.nextBossId || bossIds.has(milestone.nextBossId))).toBe(true);
  });

  it('fully validates Gold and covers every profile with an acquisition or reviewed exclusion', () => {
    const checked = validateDataset({ ...rawSharedData, games: [rawGame] });
    expect(checked.ok).toBe(true);
    const covered = new Set(sources.filter((source) => source.details.kind !== 'breeding')
      .map((source) => source.pokemonId));
    let changed = true;
    while (changed) {
      changed = false;
      for (const evolution of evolutions) {
        if (evolution.trigger !== 'player-trade' && covered.has(evolution.fromPokemonId)
          && !covered.has(evolution.toPokemonId)) {
          covered.add(evolution.toPokemonId);
          changed = true;
        }
      }
      for (const rule of breedingRules) {
        if (rule.parentPokemonIds.some((parent) => covered.has(parent))) {
          for (const offspring of rule.offspringPokemonIds) {
            if (!covered.has(offspring)) {
              covered.add(offspring);
              changed = true;
            }
          }
        }
      }
    }
    expect(new Set([...covered, ...exclusions.map((entry) => entry.pokemonId)])).toEqual(
      new Set(profiles.map((profile) => profile.pokemonId)),
    );
    expect(exclusions.every((entry) => !covered.has(entry.pokemonId))).toBe(true);
  });

  it('records the ten weighted Bug-Catching Contest encounters and omits the sentinel row', () => {
    const contestSources = sources.filter((source) => source.id.startsWith('bug-contest-'));
    const contestCapability = capabilities.find((capability) => capability.id === 'bug-contest');
    expect(contestSources.map((source) => source.pokemonId).sort()).toEqual([
      'caterpie', 'weedle', 'metapod', 'kakuna', 'butterfree', 'beedrill',
      'venonat', 'paras', 'scyther', 'pinsir',
    ].sort());
    expect(contestSources.map((source) => source.details.kind === 'wild' ? source.details.ratePercent : 0)
      .reduce<number>((total, rate) => total + (rate ?? 0), 0)).toBe(100);
    expect(contestSources.every((source) =>
      source.details.kind === 'wild' && source.details.method === 'bug-contest' &&
      source.locationId === 'national-park' && source.requirements.kind === 'capability' &&
      source.requirements.id === 'bug-contest' && source.review.referenceIds.includes('gold-headbutt-contest'))
    ).toBe(true);
    const contestOrder = ['caterpie', 'weedle', 'metapod', 'kakuna', 'butterfree', 'beedrill',
      'venonat', 'paras', 'scyther', 'pinsir'];
    expect(contestOrder.map((id) => contestSources.find((source) => source.pokemonId === id)?.level)).toEqual([
      { kind: 'range', minimum: 7, maximum: 18 }, { kind: 'range', minimum: 7, maximum: 18 },
      { kind: 'range', minimum: 9, maximum: 18 }, { kind: 'range', minimum: 9, maximum: 18 },
      { kind: 'range', minimum: 12, maximum: 15 }, { kind: 'range', minimum: 12, maximum: 15 },
      { kind: 'range', minimum: 10, maximum: 16 }, { kind: 'range', minimum: 10, maximum: 17 },
      { kind: 'range', minimum: 13, maximum: 14 }, { kind: 'range', minimum: 13, maximum: 14 },
    ]);
    expect(contestCapability?.requirements).toEqual({ kind: 'milestone', id: 'route-35' });
    expect(contestSources.some((source) => source.pokemonId === 'venomoth')).toBe(false);
  });
});
