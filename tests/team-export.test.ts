import { describe, expect, it } from 'vitest';
import { emerald } from '../src/data/dataset';
import type { AcquisitionPath, AvailabilitySnapshot } from '../src/domain/types';
import { initialState } from '../src/features/planner/state';
import { buildTeamExport, progressDetails } from '../src/features/export/export-model';

function path(id: string, sourceId: string, evolutionIds: string[] = []): AcquisitionPath {
  return { id, pokemonId: 'raichu', sourceIds: [sourceId], evolutionIds, breedingSteps: [],
    genders: ['female'], minimumLevel: 25, firstMilestoneIds: ['league'], choices: [], claims: [], coProductIds: [] };
}

function snapshot(paths: AcquisitionPath[], current: string[], future: string[] = []): AvailabilitySnapshot {
  return { query: { gameId: 'emerald', milestoneId: 'league', respectLevelLimit: true }, levelLimit: null,
    entries: { raichu: { pokemonId: 'raichu', status: current.length ? 'available' : 'later', currentPathIds: current,
      futurePathIds: future, firstMilestoneIds: ['league'], blockers: [] } },
    paths: Object.fromEntries(paths.map(path => [path.id, path])), choiceGroups: [], resourceLimits: {} };
}

describe('team PNG content', () => {
  it('keeps six slot positions and exact damage multipliers', () => {
    const model = buildTeamExport(emerald, { ...initialState, team: [null, 'swampert', null, null, null, null] }, false, null);
    expect(model.slots).toHaveLength(6);
    expect(model.slots[0].dex).toBeNull();
    expect(model.slots[1].name).toBe('Swampert');
    expect(model.defense.find(row => row.type === 'grass')!.multipliers).toEqual([null, 4, null, null, null, null]);
    expect(model.defense.find(row => row.type === 'electric')!.multipliers[1]).toBe(0);
    expect(model.coverage).toContain('fire');
    expect(model.slots[1].details).toEqual([]);
    expect(model.subtitle).not.toContain('Level');
  });

  it('shows two distinct locations with evolution tied to each source', () => {
    const stone = emerald.evolutions.find(rule => rule.fromPokemonId === 'pikachu' && rule.toPokemonId === 'raichu')!;
    const south = path('south', 'wild-safari-zone-south-grass-pikachu', [stone.id]);
    const duplicate = path('duplicate', 'wild-safari-zone-southwest-grass-pikachu', [stone.id]);
    const other = { ...emerald.sources.find(source => source.id === south.sourceIds[0])!, id: 'other', locationId: 'route-101', pokemonId: 'raichu' };
    const third = { ...other, id: 'third', locationId: 'route-102' };
    const game = { ...emerald, sources: [...emerald.sources, other, third] };
    const direct = path('direct', other.id);
    const extra = path('extra', third.id);
    const state = snapshot([south, duplicate, direct, extra], ['south', 'duplicate', 'direct', 'extra']);
    const before = structuredClone(state);
    const text = progressDetails(game, state, 'raichu').join('\n');
    expect(text).toContain('1. Safari Zone');
    expect(text).toContain('Pikachu → Raichu: use Thunder Stone.');
    expect(text).toContain('2. Route 101');
    expect(text).toContain('No evolution needed.');
    expect(text).not.toContain('Route 102');
    expect(state).toEqual(before);
  });

  it('prefers current paths and uses future paths only when needed', () => {
    const current = path('current', 'wild-safari-zone-south-grass-pikachu');
    const future = path('future', 'wild-safari-zone-southwest-grass-pikachu');
    const state = snapshot([current, future], ['current'], ['future']);
    state.paths.future.minimumLevel = 40;
    expect(progressDetails(emerald, state, 'raichu').join(' ')).not.toContain('Lv. 40');
    state.entries.raichu.currentPathIds = [];
    expect(progressDetails(emerald, state, 'raichu').join(' ')).toContain('Lv. 40');
  });

  it('shows the blocked reason when there is no path', () => {
    const state = snapshot([], []);
    state.entries.raichu.blockers = [{ code: 'item', relatedId: 'thunder-stone', message: 'Thunder Stone is required.' }];
    expect(progressDetails(emerald, state, 'raichu')).toEqual(['No valid acquisition path.', 'Thunder Stone is required.']);
  });

  it('rejects absent or old progress results', () => {
    expect(() => buildTeamExport(emerald, initialState, true, null)).toThrow('Wait for the current access check');
    const old = snapshot([], []);
    old.query.milestoneId = 'route-101';
    expect(() => buildTeamExport(emerald, initialState, true, old)).toThrow('Wait for the current access check');
  });
});
