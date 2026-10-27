import { describe, expect, it } from 'vitest';
import { dataset, emerald, initialState } from './local-data';
import { progressCheckpointOptions, progressCheckpoints } from '../src/features/planner/progress-checkpoints';
import { plannerReducer } from '../src/features/planner/state';
import { sortPokemonByPokedex } from '../src/features/planner/pokedex-order';
import { defaultCatalogueStatus, matchesCatalogueStatus } from '../src/features/progress/catalogue-filter';
import type { AvailabilityEntry } from '../src/domain/types';

const entry = (status: AvailabilityEntry['status']): AvailabilityEntry => ({
  pokemonId: 'ralts', status, currentPathIds: status === 'available' ? ['now'] : [],
  futurePathIds: status === 'later' ? ['future'] : [], firstMilestoneIds: [], blockers: [],
});

describe('Shared planner catalogue', () => {
  it('defaults to current access at the final visible checkpoint', () => {
    expect(initialState).toMatchObject({ milestoneId: 'victory-road', target: 'current-progress' });
    expect(progressCheckpointOptions(emerald).at(-1)!.id).toBe(initialState.milestoneId);
  });
  it('shows present and future Pokémon for whole-game planning in either view', () => {
    const status = defaultCatalogueStatus('whole-game');
    expect(matchesCatalogueStatus(entry('available'), status)).toBe(true);
    expect(matchesCatalogueStatus(entry('later'), status)).toBe(true);
    expect(matchesCatalogueStatus(entry('blocked'), status)).toBe(false);
    expect(matchesCatalogueStatus(entry('unavailable'), status)).toBe(false);
  });
  it('defaults to present access for current-progress planning', () => {
    const status = defaultCatalogueStatus('current-progress');
    expect(matchesCatalogueStatus(entry('available'), status)).toBe(true);
    expect(matchesCatalogueStatus(entry('later'), status)).toBe(false);
  });
});

describe('Progress checkpoints', () => {
  it('limits each ready game to Gym 1–8 and Victory Road when present', () => {
    for (const game of dataset.games.filter(game => game.game.planner !== null)) {
      const options = progressCheckpointOptions(game);
      const isGym = (option: typeof options[number]) => /^Gym [1-8]$/.test(option.title)
        || /Badge$/.test(option.title) || /-gym$/.test(option.id);
      const gymOptions = options.filter(isGym);
      const hasVictoryRoad = game.milestones.some(milestone => milestone.id === 'victory-road');
      expect(gymOptions, game.game.id).toHaveLength(8);
      expect(options.filter(option => !isGym(option)).map(option => option.id), game.game.id)
        .toEqual(hasVictoryRoad ? ['victory-road'] : []);
      expect(options).toHaveLength(hasVictoryRoad ? 9 : 8);
      expect(options.at(-1)?.id, game.game.id).toBe(hasVictoryRoad ? 'victory-road' : gymOptions[7].id);
      expect(game.game.planner!.defaultMilestoneId, game.game.id)
        .toBe(hasVictoryRoad ? 'victory-road' : gymOptions[7].id);
    }
  });

  it('identifies all eight Gyms by badge number and type', () => {
    const options = progressCheckpointOptions(emerald);
    const gyms = emerald.bosses.filter(boss => boss.kind === 'gym');
    expect(gyms.map(gym => options.find(option => option.id === `${gym.id}-defeated`)!.label)).toEqual([
      'Gym 1 · Rock · Roxanne', 'Gym 2 · Fighting · Brawly',
      'Gym 3 · Electric · Wattson', 'Gym 4 · Fire · Flannery',
      'Gym 5 · Normal · Norman', 'Gym 6 · Flying · Winona',
      'Gym 7 · Psychic · Tate & Liza', 'Gym 8 · Water · Juan',
    ]);
  });
  it('lists only the eight Gyms, then Victory Road', () => {
    const options = progressCheckpointOptions(emerald);
    expect(options.map(option => option.id)).toEqual([
      'roxanne-defeated', 'brawly-defeated', 'wattson-defeated', 'flannery-defeated',
      'norman-defeated', 'winona-defeated', 'tate-and-liza-defeated', 'juan-defeated', 'victory-road',
    ]);
    expect(options.at(-1)!.label).toBe('Victory Road');
    const points = progressCheckpoints(emerald);
    expect(points.map(point => point.displayOrder)).toEqual([...points.map(point => point.displayOrder)].sort((a, b) => a - b));
  });
});

describe('Game selection', () => {
  it('sets game progress and clears all six slots while keeping shared settings', () => {
    const state = { ...initialState, team: ['ralts', 'treecko', null, null, null, null] };
    const next = plannerReducer(state, { type: 'game', gameId: 'ruby', milestoneId: 'start' });
    expect(next.gameId).toBe('ruby');
    expect(next.milestoneId).toBe('start');
    expect(next.team).toEqual(Array(6).fill(null));
    expect(next.target).toBe(state.target);
    expect(next.respectLevelLimit).toBe(state.respectLevelLimit);
    expect(plannerReducer(state, { type: 'game', gameId: state.gameId, milestoneId: 'start' })).toBe(state);
  });
});

describe('Pokédex ordering', () => {
  it('sorts Hoenn species first, then other species by National Dex without changing the input', () => {
    const supported = new Set(emerald.profiles.map(profile => profile.pokemonId));
    const input = dataset.pokemon.filter(pokemon => supported.has(pokemon.id)).reverse();
    const sorted = sortPokemonByPokedex(input, emerald);
    const regional = emerald.profiles.filter(profile => profile.regionalDex !== undefined)
      .sort((a, b) => a.regionalDex! - b.regionalDex!);
    expect(regional).toHaveLength(202);
    expect(sorted.slice(0, 202).map(p => p.id)).toEqual(regional.map(profile => profile.pokemonId));
    expect(sorted[0].id).toBe('treecko');
    expect(sorted[201].id).toBe('deoxys');
    expect(sorted[202].id).toBe('bulbasaur');
    expect(input[0].id).toBe('deoxys');
  });
});
