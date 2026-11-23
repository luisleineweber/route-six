import { expect, it } from 'vitest';
import { dataset } from './local-data';
import { fullGameStages } from '../src/domain/availability/full-game-stages';
import { getStageAvailability } from '../src/domain/availability';

it.each(['black', 'white'])('S1: %s League uses its own identity and level 50', gameId => {
  const game = dataset.games.find(game => game.game.id === gameId)!;
  const stages = fullGameStages(game);
  const league = stages.find(stage => stage.title === 'League')!;
  const result = getStageAvailability(dataset, { gameId, milestoneId: league.milestoneId, respectLevelLimit: true });
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.value.levelLimit?.level).toBe(50);
  expect(result.value.entries.haxorus.currentPathIds.length).toBeGreaterThan(0);
  expect(new Set(stages.map(stage => stage.id)).size).toBe(stages.length);
  expect(new Set(stages.map(stage => stage.milestoneId)).size).toBe(stages.length);
}, 120_000);

it('S2: Platinum League excludes events and catches after League entry', () => {
  const game = dataset.games.find(game => game.game.id === 'platinum')!;
  const league = fullGameStages(game).find(stage => stage.title === 'League')!;
  const result = getStageAvailability(dataset, { gameId: 'platinum', milestoneId: league.milestoneId, respectLevelLimit: true });
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  for (const id of ['shroomish', 'kangaskhan', 'exeggcute']) expect(result.value.entries[id].currentPathIds, id).toEqual([]);
  expect(league.reachedIds).toContain('victory-road');
  expect(league.reachedIds).not.toContain('national-dex-before-hall');
  expect(league.reachedIds).not.toContain('league-aaron');
  expect(league.reachedIds).not.toContain('route-224');
}, 120_000);

it.each(['black', 'white'])('S3: %s starts with Striaton and has eight Gyms plus League', gameId => {
  const stages = fullGameStages(dataset.games.find(game => game.game.id === gameId)!);
  expect(stages).toHaveLength(9);
  expect(stages[0]).toMatchObject({ title: 'Gym 1', bossId: 'striaton-gym', level: 14 });
  expect(stages[0].reachedIds).not.toContain('striaton-gym');
  expect(stages[0].detail).toMatch(/Cilan|Chili|Cress/);
});

it.each(['gold', 'silver', 'crystal'])('S4: %s has a League entry stage with Will at level 42', gameId => {
  const stages = fullGameStages(dataset.games.find(game => game.game.id === gameId)!);
  expect(stages).toHaveLength(9);
  const league = stages.at(-1)!;
  expect(league).toMatchObject({ title: 'League', milestoneId: 'league-entry', bossId: 'will', level: 42 });
  expect(league.reachedIds).toContain('clair-defeated');
  expect(league.reachedIds).not.toContain('indigo-plateau');
});
