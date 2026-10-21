import { describe, expect, it } from 'vitest';
import { emerald } from './local-data';
import type { AcquisitionPath, AvailabilitySnapshot } from '../src/domain/types';
import { distinctPathOptions, firstAccessPoints, groupAcquisitionPaths, pathOptionName } from '../src/components/acquisition-presentation';

const path = (id: string, sourceId: string): AcquisitionPath => ({
  id, pokemonId: 'pikachu', sourceIds: [sourceId], evolutionIds: [], breedingSteps: [],
  genders: ['female'], minimumLevel: 25, firstMilestoneIds: ['devon-scope'],
  choices: [], claims: [], coProductIds: [],
});
const snapshot = (paths: AcquisitionPath[]): AvailabilitySnapshot => ({
  query: { gameId: 'emerald', milestoneId: 'league', respectLevelLimit: false },
  levelLimit: null, entries: {}, paths: Object.fromEntries(paths.map(path => [path.id, path])),
  choiceGroups: [], resourceLimits: {},
});

describe('acquisition presentation', () => {
  it('groups Safari areas once and retains both source paths', () => {
    const south = path('south', 'wild-safari-zone-south-grass-pikachu');
    const southwest = path('southwest', 'wild-safari-zone-southwest-grass-pikachu');
    const groups = groupAcquisitionPaths(emerald, snapshot([south, southwest]), ['south', 'southwest', 'south']);
    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBe('Safari Zone');
    expect(groups[0].paths).toEqual([south, southwest]);
    expect(pathOptionName(emerald, south)).toBe('South');
    expect(pathOptionName(emerald, southwest)).toBe('Southwest');
  });

  it('keeps direct sources and evolution paths separate without changing the proofs', () => {
    const first = path('first', 'wild-safari-zone-south-grass-pikachu');
    const evolved = { ...first, id: 'evolved', pokemonId: 'raichu', minimumLevel: 30, evolutionIds: ['pikachu-to-raichu'] };
    const state = snapshot([first, evolved]);
    const before = structuredClone(state);
    const groups = groupAcquisitionPaths(emerald, state, ['first', 'evolved']);
    expect(groups.map(group => group.title)).toEqual(['Safari Zone', 'Evolve Pikachu']);
    expect(groups[0].paths).toEqual([first]);
    expect(groups[1].paths).toEqual([evolved]);
    expect(groups[1].method).toBe('Use Thunder Stone');
    expect(state).toEqual(before);
  });

  it('keeps different encounter methods in separate groups', () => {
    const grass = path('grass', 'wild-safari-zone-south-grass-pikachu');
    const rodSource = emerald.sources.find(source => source.locationId === 'safari-zone' && source.details.kind === 'wild' && source.details.method === 'old-rod')!;
    const rod = path('rod', rodSource.id);
    expect(groupAcquisitionPaths(emerald, snapshot([grass, rod]), ['grass', 'rod'])).toHaveLength(2);
  });

  it('keeps the solver order for independent first-access points', () => {
    const ids = ['route-123', 'devon-scope', 'route-123'];
    const points = firstAccessPoints(emerald, ids);
    expect(points.map(point => point.id)).toEqual(['route-123', 'devon-scope']);
    expect(ids).toEqual(['route-123', 'devon-scope', 'route-123']);
  });

  it('merges identical visible gender variants without changing the proofs', () => {
    const female = path('female', 'wild-safari-zone-south-grass-pikachu');
    const male = { ...female, id: 'male', genders: ['male'] as AcquisitionPath['genders'] };
    const otherArea = path('other', 'wild-safari-zone-southwest-grass-pikachu');
    const state = snapshot([female, male, otherArea]);
    expect(distinctPathOptions([female, male, otherArea], state)).toEqual([female, otherArea]);
    expect(Object.keys(state.paths)).toHaveLength(3);
  });
});
