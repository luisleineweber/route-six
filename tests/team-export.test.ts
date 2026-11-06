import { describe, expect, it } from 'vitest';
import { emerald, initialState } from './local-data';
import type { AcquisitionPath, AvailabilitySnapshot } from '../src/domain/types';
import { buildTeamExport } from '../src/features/export/export-model';
import { progressContent } from '../src/features/export/progress-content';

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
  it('uses the selected game’s image paths for members and evolution stages', () => {
    const game = structuredClone(emerald);
    game.profiles.find(profile => profile.pokemonId === 'pikachu')!.spriteSrc = '/pokemon/alternate-pikachu.webp';
    game.profiles.find(profile => profile.pokemonId === 'raichu')!.spriteSrc = '/pokemon/alternate-raichu.webp';
    const evolution = game.evolutions.find(rule => rule.fromPokemonId === 'pikachu' && rule.toPokemonId === 'raichu')!;
    const evolved = path('evolved', 'wild-safari-zone-south-grass-pikachu', [evolution.id]);
    const result = snapshot([evolved], ['evolved']);
    const state = { ...initialState, milestoneId: result.query.milestoneId, team: ['raichu', null, null, null, null, null] };
    const model = buildTeamExport(game, state, true, result);
    expect(model.logoSrc).toBe('/games/emerald-logo.png');
    expect(model.subtitle).not.toContain(game.game.name);
    expect(model.subtitle).not.toContain('Current/Goal');
    expect(model.slots[0].spriteSrc).toBe('/pokemon/alternate-raichu.webp');
    expect(model.slots.every(slot => !Object.hasOwn(slot, 'baseStats'))).toBe(true);
    expect(model.slots[0].progress!.stages.map(stage => stage.spriteSrc)).toEqual([
      '/pokemon/alternate-pikachu.webp', '/pokemon/alternate-raichu.webp',
    ]);
  });
  it('keeps six slot positions and exact damage multipliers', () => {
    const model = buildTeamExport(emerald, { ...initialState, team: [null, 'swampert', null, null, null, null] }, false, null);
    expect(model.slots).toHaveLength(6);
    expect(model.logoSrc).toBe('/games/emerald-logo.png');
    expect(model.slots[0].dex).toBeNull();
    expect(model.slots[1].name).toBe('Swampert');
    expect(model.slots[1].baseStats).toEqual([100, 110, 90, 60, 85, 90]);
    expect(model.slots[0].baseStats).toBeUndefined();
    expect(model.defense.find(row => row.type === 'grass')!.multipliers).toEqual([null, 4, null, null, null, null]);
    expect(model.defense.find(row => row.type === 'electric')!.multipliers[1]).toBe(0);
    expect(model.coverage).toContain('fire');
    expect(model.slots[1].progress).toBeNull();
    expect(model.subtitle).not.toContain('Level');
  });

  it('selects one simple source and keeps its evolution sequence', () => {
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
    const content = progressContent(game, state, 'raichu');
    expect(content.location).toBe('Route 101');
    expect(content.stages.map(stage => stage.name)).toEqual(['Raichu']);
    expect(content.acquisition).toEqual([]);
    expect(state).toEqual(before);
  });

  it('prefers current paths and uses future paths only when needed', () => {
    const current = path('current', 'wild-safari-zone-south-grass-pikachu');
    const future = path('future', 'wild-safari-zone-southwest-grass-pikachu');
    const state = snapshot([current, future], ['current'], ['future']);
    const stone = emerald.evolutions.find(rule => rule.fromPokemonId === 'pikachu' && rule.toPokemonId === 'raichu')!;
    state.paths.future.evolutionIds = [stone.id];
    expect(progressContent(emerald, state, 'raichu').stages).toHaveLength(1);
    state.entries.raichu.currentPathIds = [];
    expect(progressContent(emerald, state, 'raichu').stages[1]).toMatchObject({ name: 'Raichu', dex: 26, requirement: 'Thunder Stone' });
  });

  it('keeps absent sources explicit without exporting warning paragraphs', () => {
    const state = snapshot([], []);
    state.entries.raichu.blockers = [{ code: 'item', relatedId: 'thunder-stone', message: 'Thunder Stone is required.' }];
    expect(progressContent(emerald, state, 'raichu')).toMatchObject({ location: null, missingSource: {
      title: 'Requirements not met', explanation: 'Thunder Stone is required.',
    } });
    const model = buildTeamExport(emerald, { ...initialState, milestoneId: state.query.milestoneId, team: ['raichu', null, null, null, null, null] }, true, state);
    expect(model.notes).toEqual([]);
    expect(model.slots[0]).not.toHaveProperty('status');
  });

  it('exports a team conflict when two members need the same finite source', () => {
    const only = path('only', 'wild-safari-zone-south-grass-pikachu');
    only.claims = [{ resourceId: 'source:test-gift', quantity: 1, use: 'consume' }];
    const state = snapshot([only], ['only']);
    state.resourceLimits['source:test-gift'] = 1;
    const model = buildTeamExport(emerald, { ...initialState, milestoneId: state.query.milestoneId,
      team: ['raichu', null, 'raichu', null, null, null] }, true, state);
    expect(model.notes).toEqual([expect.stringContaining('Team conflict:')]);
  });

  it('explains why a species from another version cannot be obtained', () => {
    const state = snapshot([], []);
    const exclusion = emerald.exclusions.find(exclusion => exclusion.pokemonId === 'surskit')!;
    state.entries.surskit = { ...state.entries.raichu, pokemonId: 'surskit', status: 'unavailable',
      blockers: [{ code: exclusion.reason, relatedId: 'surskit', message: exclusion.explanation }] };
    expect(progressContent(emerald, state, 'surskit').missingSource).toEqual({
      title: 'Not obtainable in Emerald',
      explanation: 'Requires another game version or a player trade. Player trades are excluded from this planner.',
    });
  });

  it('distinguishes external events from an unmet level limit', () => {
    const state = snapshot([], []);
    state.entries.raichu.blockers = [{ code: 'external-event', relatedId: null, message: 'External event.' }];
    expect(progressContent(emerald, state, 'raichu').missingSource!.explanation).toContain('external distribution event');
    state.entries.raichu.blockers = [{ code: 'level-limit', relatedId: null, message: 'Evolution needs level 30; the current limit is 20.' }];
    expect(progressContent(emerald, state, 'raichu').missingSource).toEqual({
      title: 'Requirements not met', explanation: 'Evolution needs level 30; the current limit is 20.',
    });
  });

  it('prefers a direct catch over a lower-level breeding alternative', () => {
    const caught = path('caught', 'wild-safari-zone-south-grass-pikachu');
    const source = emerald.sources.find(source => source.pokemonId === 'pichu' && source.details.kind === 'breeding')!;
    const bred = { ...caught, id: 'bred', sourceIds: [source.id], minimumLevel: 5,
      breedingSteps: [{ sourceId: source.id, ruleId: 'test', parents: [{ pokemonId: 'pikachu', gender: 'female', pathId: 'caught' }, { pokemonId: 'pikachu', gender: 'male', pathId: 'caught' }] }] } as AcquisitionPath;
    const state = snapshot([bred, caught], ['bred', 'caught']);
    expect(progressContent(emerald, state, 'raichu').location).toBe('Safari Zone · South');
    const model = buildTeamExport(emerald, { ...initialState, milestoneId: state.query.milestoneId,
      team: ['raichu', null, null, null, null, null] }, true, state);
    expect(model.slots[0].progress!.location).toBe('Safari Zone · South');
  });

  it('exports all three stages with short level labels and predecessor sprites', () => {
    const source = emerald.sources.find(source => source.pokemonId === 'ralts' && source.details.kind === 'wild')!;
    const rules = ['ralts', 'kirlia'].map(id => emerald.evolutions.find(rule => rule.fromPokemonId === id)!.id);
    const evolved = path('evolved', source.id, rules);
    const state = snapshot([evolved], ['evolved']);
    expect(progressContent(emerald, state, 'raichu').stages).toEqual([
      { name: 'Ralts', dex: 280, spriteSrc: '/pokemon/280.png', requirement: null, conditions: [] },
      { name: 'Kirlia', dex: 281, spriteSrc: '/pokemon/281.png', requirement: 'Lv. 20', conditions: [] },
      { name: 'Gardevoir', dex: 282, spriteSrc: '/pokemon/282.png', requirement: 'Lv. 30', conditions: [] },
    ]);
  });

  it('keeps special evolution conditions with the correct stage', () => {
    const rule = emerald.evolutions.find(rule => rule.fromPokemonId === 'feebas')!;
    const source = emerald.sources.find(source => source.pokemonId === 'feebas' && source.details.kind === 'wild')!;
    const evolved = path('evolved', source.id, [rule.id]);
    const content = progressContent(emerald, snapshot([evolved], ['evolved']), 'raichu');
    expect(content.stages[1].name).toBe('Milotic');
    expect(content.stages[1].conditions.join(' ')).toContain('Beauty');
  });

  it('rejects absent or old progress results', () => {
    expect(() => buildTeamExport(emerald, initialState, true, null)).toThrow('Wait for the current access check');
    const old = snapshot([], []);
    old.query.milestoneId = 'route-101';
    expect(() => buildTeamExport(emerald, initialState, true, old)).toThrow('Wait for the current access check');
  });
});
