import { describe, expect, it } from 'vitest';
import { dataset, emerald, initialState } from './local-data';
import { evolution, fixture, milestone, review, source } from './fixtures';
import { fullGameStages } from '../src/domain/availability/full-game-stages';
import { getStageAvailability } from '../src/domain/availability';
import { stageMember, stageTeam } from '../src/domain/team/stage-team';
import { checkTeam } from '../src/domain/team/check-team';
import { plannerReducer } from '../src/features/planner/state';
import type { Dataset } from '../src/domain/types';

function setup(ids = ['treecko', 'grovyle', 'sceptile', 'ralts', 'kirlia', 'gardevoir']) {
  const value = fixture(ids);
  value.game.bosses[2] = { id: 'third', name: 'League', kind: 'elite-four', highestLevel: 50, review };
  value.game.game.planner!.checkpoints = [
    { milestoneId: 'gate', label: 'Gym 1', title: 'Gym 1', detail: 'First', typeId: 'rock' },
    { milestoneId: 'future', label: 'Gym 2', title: 'Gym 2', detail: 'Second', typeId: 'fighting' },
    { milestoneId: 'optional', label: 'League', title: 'League', detail: 'League', typeId: null },
  ];
  return value;
}

function query(data: Dataset, index: number, respectLevelLimit = true) {
  const stage = fullGameStages(data.games[0])[index];
  const result = getStageAvailability(data, { gameId: data.games[0].game.id, milestoneId: stage.milestoneId, respectLevelLimit });
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}

describe('Full-game battle stages', () => {
  it('uses eight before-Gym stages and a League entry stage in Emerald', () => {
    const stages = fullGameStages(emerald);
    expect(stages).toHaveLength(9);
    expect(stages.map(stage => stage.level)).toEqual([15, 19, 24, 29, 31, 33, 42, 46, 49]);
    expect(stages[0].reachedIds).toContain('route-116');
    expect(stages[0].reachedIds).not.toContain('roxanne-defeated');
    expect(stages[1].reachedIds).toContain('granite-cave');
    expect(stages[4].reachedIds).not.toContain('norman-defeated');
    expect(stages[4].reachedIds).not.toContain('weather-institute');
    expect(stages[8].reachedIds).not.toContain('beldum-gift');
    expect(stages[8].reachedIds).not.toContain('sidney-defeated');
  });
  it('builds pre-battle stages for every game with reviewed progress data', () => {
    for (const game of dataset.games) {
      if (!game.game.planner) { expect(fullGameStages(game)).toEqual([]); continue; }
      const stages = fullGameStages(game);
      expect(stages.length, game.game.id).toBeGreaterThanOrEqual(8);
      for (const stage of stages) {
        expect(game.milestones.some(point => point.id === stage.milestoneId), game.game.id).toBe(true);
        expect(game.bosses.find(boss => boss.id === stage.bossId)?.highestLevel).toBe(stage.level);
        expect(stage.reachedIds.every(id => game.milestones.find(point => point.id === id)?.phase === 'main-story')).toBe(true);
      }
    }
  });
  it('does not grant a Gym reward or post-game source before the battle', () => {
    const { game, data } = setup(['treecko', 'ralts', 'beldum']);
    source(game, 'early', 'treecko');
    source(game, 'badge-gift', 'ralts', 5, milestone('gate'));
    source(game, 'post-game', 'beldum', 5, milestone('end'));
    expect(query(data, 0).entries.ralts.currentPathIds).toEqual([]);
    expect(query(data, 1).entries.ralts.currentPathIds.length).toBeGreaterThan(0);
    expect(Object.values(query(data, 1).paths).every(path => path.firstMilestoneIds.length === 0)).toBe(true);
    expect(query(data, 2).entries.beldum.currentPathIds).toEqual([]);
    expect(query(data, 2, false).entries.beldum.currentPathIds).toEqual([]);
  });
  it('includes optional visits while applying the current battle cap to early sources', () => {
    const { game, data } = setup();
    game.milestones.push({ id: 'side', name: 'Side area', kind: 'area', phase: 'main-story', displayOrder: 1,
      previousIds: ['start'], nextBossId: 'first', locationId: null, review });
    source(game, 'optional-ralts', 'ralts', 5, milestone('side'));
    source(game, 'starter', 'treecko');
    evolution(game, 'treecko', 'grovyle', 16);
    evolution(game, 'grovyle', 'sceptile', 36);
    expect(query(data, 0).entries.ralts.status).toBe('available');
    expect(stageMember(game, query(data, 0), 'sceptile')).toMatchObject({ pokemonId: 'treecko', kind: 'earlier' });
    expect(stageMember(game, query(data, 1), 'sceptile')).toMatchObject({ pokemonId: 'grovyle', kind: 'earlier' });
    expect(stageMember(game, query(data, 0, false), 'sceptile')).toMatchObject({ pokemonId: 'sceptile', kind: 'final' });
  });
  it('does not use a sibling evolution branch as an earlier stage', () => {
    const { game, data } = setup(['eevee', 'vaporeon', 'jolteon']);
    evolution(game, 'eevee', 'vaporeon', 10);
    evolution(game, 'eevee', 'jolteon', 10);
    source(game, 'jolteon-gift', 'jolteon');
    expect(stageMember(game, query(data, 0), 'vaporeon')).toMatchObject({ pokemonId: null, kind: 'missing' });
  });
  it('keeps earlier acquisitions when the next Gym has a lower cap', () => {
    const { game, data } = setup(['ralts']);
    game.bosses[0].highestLevel = 30;
    source(game, 'high-level-gift', 'ralts', 25);
    expect(query(data, 1).entries.ralts.status).toBe('available');
  });
  it('keeps source choice conflicts visible in a stage team', () => {
    const { game, data } = setup(['treecko', 'ralts']);
    game.choices.push({ id: 'starter', name: 'Starter', options: ['a', 'b'], maximumSelections: 1, review });
    source(game, 'one', 'treecko', 5, undefined, { choice: { groupId: 'starter', optionId: 'a' } });
    source(game, 'two', 'ralts', 5, undefined, { choice: { groupId: 'starter', optionId: 'b' } });
    expect(checkTeam(query(data, 0), ['treecko', 'ralts'], 'current-progress').warnings[0].code).toBe('choice-conflict');
  });
  it('returns explicit errors for unsupported queries', () => {
    const { game, data } = setup();
    expect(getStageAvailability(data, { gameId: 'missing', milestoneId: 'start', respectLevelLimit: true })).toMatchObject({ ok: false, error: { code: 'unknown-game' } });
    expect(getStageAvailability(data, { gameId: 'emerald', milestoneId: 'end', respectLevelLimit: true })).toMatchObject({ ok: false, error: { code: 'unknown-milestone' } });
    game.game.planner = null;
    expect(getStageAvailability(data, { gameId: 'emerald', milestoneId: 'start', respectLevelLimit: true })).toMatchObject({ ok: false, error: { code: 'progress-not-ready' } });
  });
});

describe('Stage replacements', () => {
  it('keeps six slots and preserves an explicit empty slot', () => {
    const { game, data } = setup();
    source(game, 'starter', 'treecko');
    const finalTeam = ['treecko', null, null, null, null, null];
    const members = stageTeam(game, query(data, 0), finalTeam, { 0: null, 1: 'treecko' });
    expect(members).toHaveLength(6);
    expect(members[0]).toMatchObject({ targetId: 'treecko', pokemonId: null, kind: 'replacement' });
    expect(members[1]).toMatchObject({ targetId: null, pokemonId: 'treecko' });
    expect(finalTeam[0]).toBe('treecko');
  });
  it('keeps edits separate from the shared final team and from other stages', () => {
    let state = plannerReducer(initialState, { type: 'stage-member', stageId: 'gym-1', slot: 0, pokemonId: 'ralts' });
    state = plannerReducer(state, { type: 'stage-member', stageId: 'gym-2', slot: 0, pokemonId: 'kirlia' });
    state = plannerReducer(state, { type: 'add', slot: 0, pokemonId: 'gardevoir' });
    state = plannerReducer(state, { type: 'settings', values: { respectLevelLimit: false } });
    expect(state.team[0]).toBe('gardevoir');
    expect(state.stageOverrides).toEqual({ 'gym-1': { 0: 'ralts' }, 'gym-2': { 0: 'kirlia' } });
    const auto = plannerReducer(state, { type: 'stage-auto', stageId: 'gym-1', slot: 0 });
    expect(auto.stageOverrides['gym-1']).toEqual({});
    expect(state.stageOverrides['gym-1']).toEqual({ 0: 'ralts' });
    const reset = plannerReducer(state, { type: 'stage-reset', stageId: 'gym-1' });
    expect(reset.stageOverrides['gym-1']).toBeUndefined();
    expect(reset.stageOverrides['gym-2']).toEqual({ 0: 'kirlia' });
    expect(plannerReducer(state, { type: 'game', gameId: 'ruby', milestoneId: 'start' }).stageOverrides).toEqual({});
  });
});
