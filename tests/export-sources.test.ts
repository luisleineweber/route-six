import { describe, expect, it } from 'vitest';
import { dataset, emerald, initialState } from './local-data';
import { getAvailability } from '../src/domain/availability';
import type { AcquisitionPath, AvailabilitySnapshot } from '../src/domain/types';
import { progressContent } from '../src/features/export/progress-content';
import { buildTeamExport } from '../src/features/export/export-model';

function sourcePaths() {
  const early = emerald.sources.find(source => source.pokemonId === 'magikarp' && source.locationId === 'dewford' && source.details.kind === 'wild' && source.details.method === 'old-rod')!;
  const late = emerald.sources.find(source => source.pokemonId === 'gyarados')!;
  const evolution = emerald.evolutions.find(rule => rule.fromPokemonId === 'magikarp' && rule.toPokemonId === 'gyarados')!;
  const path = (id: string, sourceId: string, evolutionIds: string[], milestone: string): AcquisitionPath => ({
    id, pokemonId: 'gyarados', sourceIds: [sourceId], evolutionIds, breedingSteps: [], genders: ['female'],
    minimumLevel: 20, firstMilestoneIds: [milestone], choices: [], claims: [], coProductIds: [],
  });
  const earlyPoint = emerald.milestones.find(point => point.id.includes('dewford'))!;
  const latePoint = emerald.milestones.find(point => point.id.includes('sootopolis'))!;
  return [path('late', late.id, [], latePoint.id), path('early', early.id, [evolution.id], earlyPoint.id)];
}

function snapshot(paths: AcquisitionPath[]): AvailabilitySnapshot {
  return { query: { gameId: 'emerald', milestoneId: 'victory-road', respectLevelLimit: false }, levelLimit: null,
    paths: Object.fromEntries(paths.map(path => [path.id, path])), choiceGroups: [], resourceLimits: {},
    entries: { gyarados: { pokemonId: 'gyarados', status: 'available', currentPathIds: paths.map(path => path.id), futurePathIds: [], firstMilestoneIds: [], blockers: [] } } };
}

describe('PNG catch locations', () => {
  it.each([
    ['vileplume', 'gloom', 'oddish', 'Oddish → Gloom · Lv. 21'],
    ['shiftry', 'nuzleaf', 'seedot', 'Seedot → Nuzleaf · Lv. 14'],
  ])('keeps missing evolution steps for %s extra catches', (pokemonId, caughtId, extraId, expected) => {
    const caught = emerald.sources.find(source => source.pokemonId === caughtId && source.details.kind === 'wild')!;
    const extra = emerald.sources.find(source => source.pokemonId === extraId && source.details.kind === 'wild' && source.locationId !== caught.locationId)!;
    const finalRule = emerald.evolutions.find(rule => rule.fromPokemonId === caughtId && rule.toPokemonId === pokemonId)!;
    const joiningRule = emerald.evolutions.find(rule => rule.fromPokemonId === extraId && rule.toPokemonId === caughtId)!;
    const template = sourcePaths()[1];
    const main = { ...template, id: 'main', pokemonId, sourceIds: [caught.id], evolutionIds: [finalRule.id] };
    const alternative = { ...main, id: 'alternative', sourceIds: [extra.id], evolutionIds: [joiningRule.id, finalRule.id] };
    const state = snapshot([main, alternative]);
    state.entries[pokemonId] = { ...state.entries.gyarados, pokemonId, currentPathIds: ['main', 'alternative'] };
    const content = progressContent(emerald, state, pokemonId, main);
    expect(content.routeOptions[0]).toMatchObject({ evolutionNotes: [expected] });
    expect(content.stages.map(stage => stage.name)).toHaveLength(2);
  });
  it('shows the earlier Magikarp catch and evolution before a late Gyarados catch', () => {
    const state = snapshot(sourcePaths());
    const content = progressContent(emerald, state, 'gyarados');
    expect(content.location).toBe('Dewford Town');
    expect(content.method).toBe('Old Rod');
    expect(content.stages.map(stage => stage.name)).toEqual(['Magikarp', 'Gyarados']);
    const model = buildTeamExport(emerald, { ...initialState, milestoneId: 'victory-road', respectLevelLimit: false,
      team: ['gyarados', null, null, null, null, null] }, true, state);
    expect(model.slots[0].progress!.location).toBe(content.location);
  });

  it('lists each additional place once instead of repeating fishing methods', () => {
    const paths = sourcePaths();
    const magikarp = emerald.sources.filter(source => source.pokemonId === 'magikarp' && source.locationId === 'route-103');
    const extras = magikarp.map((source, i) => ({ ...paths[1], id: `extra-${i}`, sourceIds: [source.id] }));
    const content = progressContent(emerald, snapshot([...paths, ...extras]), 'gyarados', paths[1]);
    expect(content.routeOptions.filter(option => option.location === 'Route 103')).toHaveLength(1);
    expect(content.routeOptions.some(option => option.location === 'Dewford Town')).toBe(false);
    expect(content.routeOptions.find(option => option.location === 'Route 103')).toMatchObject({ evolutionNotes: [] });
  });

  it('uses an early Magikarp path from the real Victory Road query', () => {
    const result = getAvailability(dataset, { gameId: 'emerald', milestoneId: 'victory-road', respectLevelLimit: true });
    if (!result.ok) throw new Error(JSON.stringify(result.error));
    const content = progressContent(emerald, result.value, 'gyarados');
    expect(content.stages[0].name).toBe('Magikarp');
    expect(progressContent(emerald, result.value, 'mawile').location).toMatch(/Victory Road.*B1F/);
  }, 60000);
});
