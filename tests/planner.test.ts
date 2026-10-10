import { describe, expect, it } from 'vitest';
import { emerald } from '../src/data/dataset';
import { progressCheckpoints } from '../src/features/planner/progress-checkpoints';
import { initialState, plannerReducer } from '../src/features/planner/state';
import { sortPokemonByPokedex } from '../src/features/planner/pokedex-order';
import { dataset } from '../src/data/dataset';
import { defaultCatalogueStatus, matchesCatalogueStatus } from '../src/features/progress/catalogue-filter';
import type { AvailabilityEntry } from '../src/domain/types';

const entry = (status: AvailabilityEntry['status']): AvailabilityEntry => ({
  pokemonId: 'ralts', status, currentPathIds: status === 'available' ? ['now'] : [],
  futurePathIds: status === 'later' ? ['future'] : [], firstMilestoneIds: [], blockers: [],
});

describe('Shared planner catalogue', () => {
  it('defaults to current access at the League checkpoint', () => {
    expect(initialState).toMatchObject({ milestoneId: 'league', target: 'current-progress' });
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
  it('keeps all Gyms and League battles, plus major story battles, in game order', () => {
    const points = progressCheckpoints(emerald);
    expect(points[0].id).toBe(emerald.game.firstMilestoneId);
    for (const boss of emerald.bosses) expect(points.some(point => point.id === `${boss.id}-defeated`)).toBe(true);
    expect(points.map(point => point.id)).toEqual(expect.arrayContaining(['maxie-chimney', 'archie', 'steven-rematch']));
    expect(points.some(point => point.id === 'route-110')).toBe(false);
    expect(points.map(point => point.displayOrder)).toEqual([...points.map(point => point.displayOrder)].sort((a, b) => a - b));
    expect(points.some(point => point.id === 'league')).toBe(true);
  });
});

describe('Game selection', () => {
  it('sets game progress and keeps valid members in their existing slots', () => {
    const state = { ...initialState, team: ['ralts', 'treecko', null, null, null, null] };
    const next = plannerReducer(state, { type: 'game', gameId: 'ruby', milestoneId: 'start', pokemonIds: ['ralts'] });
    expect(next.gameId).toBe('ruby');
    expect(next.milestoneId).toBe('start');
    expect(next.team).toEqual(['ralts', null, null, null, null, null]);
    expect(next.target).toBe(state.target);
    expect(next.respectLevelLimit).toBe(state.respectLevelLimit);
    expect(plannerReducer(state, { type: 'game', gameId: state.gameId, milestoneId: 'start', pokemonIds: [] })).toBe(state);
  });
});

describe('Pokédex ordering', () => {
  it('sorts Hoenn species first, then other species by National Dex without changing the input', () => {
    const input = [...dataset.pokemon].reverse();
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
