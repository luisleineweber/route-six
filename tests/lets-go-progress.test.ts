import { describe, expect, it } from 'vitest';
import { rawGame as pikachu } from '../src/data/games/lets-go-pikachu';
import { rawGame as eevee } from '../src/data/games/lets-go-eevee';
import { rawSharedData } from '../src/data/shared-data';
import { validateDataset } from '../src/data/validate-dataset';
import { getAvailability } from '../src/domain/availability';
import { checkTeam } from '../src/domain/team/check-team';

const checked = validateDataset({ ...rawSharedData, games: [pikachu, eevee] });
if (!checked.ok) throw new Error(JSON.stringify(checked.error));
const dataset = checked.value;

function at(gameId: string, milestoneId: string, respectLevelLimit = true) {
  const result = getAvailability(dataset, { gameId, milestoneId, respectLevelLimit });
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}

describe('Let’s Go Progress Planner', () => {
  it.each(dataset.games.map(game => [game.game.id, game] as const))('%s uses its first-battle Gym levels and native progress data', (gameId, game) => {
    const checkpoints = game.game.planner!.checkpoints;
    expect(checkpoints.map(point => {
      const milestone = game.milestones.find(row => row.id === point.milestoneId);
      return game.bosses.find(row => row.id === milestone?.nextBossId)?.highestLevel;
    })).toEqual([12, 19, 26, 34, 44, 44, 48, 50, 52]);
    expect(game.sources).toHaveLength(699);
    expect(game.evolutions).toHaveLength(80);
    expect(game.breedingRules).toEqual([]);

    const starter = gameId === 'lets-go-pikachu' ? 'pikachu-partner' : 'eevee-partner';
    const beforeBrock = at(gameId, 'before-brock');
    expect(beforeBrock.entries[starter].status).toBe('available');
    expect(beforeBrock.entries[gameId === 'lets-go-pikachu' ? 'oddish' : 'bellsprout'].status).toBe('available');
    expect(beforeBrock.entries[gameId === 'lets-go-pikachu' ? 'bellsprout' : 'oddish'].status).toBe('unavailable');
    expect(game.evolutions.some(row => row.fromFormId === starter)).toBe(false);

    const afterLeague = at(gameId, 'cerulean-cave');
    const statuses = Object.values(afterLeague.entries).map(entry => entry.status);
    expect(statuses.filter(status => status === 'available')).toHaveLength(149);
    expect(statuses.filter(status => status === 'unavailable')).toHaveLength(18);
    expect(statuses.filter(status => status === 'blocked')).toHaveLength(5);
  }, 120_000);

  it('keeps the water and air actions separate and retains the story gates', () => {
    const gameId = 'lets-go-pikachu';
    const game = dataset.games.find(row => row.game.id === gameId)!;
    const beforeErika = at(gameId, 'before-erika', false);
    const beforeKoga = at(gameId, 'before-koga', false);
    expect(beforeErika.entries.gastly.status).toBe('later');
    expect(beforeErika.entries.lapras.status).toBe('later');
    expect(beforeErika.entries.zapdos.status).toBe('later');
    expect(beforeKoga.entries.gastly.status).toBe('available');
    expect(beforeKoga.entries.lapras.status).toBe('available');
    expect(beforeKoga.entries.snorlax.status).toBe('available');
    expect(beforeKoga.entries.zapdos.status).toBe('available');
    expect(at(gameId, 'before-koga').entries.zapdos.status).toBe('later');

    const routeOneAir = game.sources.find(row => row.id === 'spawn-route-1-air-pidgeotto')!;
    expect(routeOneAir.details).toEqual({ kind: 'overworld', habitat: 'air', rare: false });
    for (const [milestone, expected] of [['indigo-plateau', false], ['champion-defeated', true]] as const) {
      const snapshot = at(gameId, milestone);
      expect(snapshot.entries.pidgeotto.currentPathIds.some(id => snapshot.paths[id].sourceIds.includes(routeOneAir.id))).toBe(expected);
    }
  }, 120_000);

  it('consumes trade offers and preserves the native form, fossil, and Dojo constraints', () => {
    const pika = at('lets-go-pikachu', 'indigo-plateau');
    const eve = at('lets-go-eevee', 'indigo-plateau');
    expect(pika.entries.persian.status).toBe('available');
    expect(pika.entries['persian-alola'].blockers[0].code).toBe('other-version');
    expect(eve.entries['persian-alola'].status).toBe('available');
    expect(pika.entries['golem-alola'].blockers[0].code).toBe('player-trade');
    expect(pika.entries['mewtwo'].status).toBe('later');
    expect(pika.entries['raichu-alola'].currentPathIds.map(id => pika.paths[id])).toEqual(expect.arrayContaining([
      expect.objectContaining({ sourceIds: expect.arrayContaining(['trade-raichu-alola', 'spawn-viridian-forest-land-pikachu']) }),
    ]));
    const game = dataset.games.find(row => row.game.id === 'lets-go-pikachu')!;
    expect(game.sources.find(row => row.id === 'trade-raichu-alola')?.requirements)
      .toEqual({ kind: 'pokemon', id: 'raichu', quantity: 1, consumed: true });
    expect(checkTeam(pika, ['omanyte', 'kabuto'], 'current-progress').feasible).toBe(false);
    expect(checkTeam(at('lets-go-pikachu', 'cerulean-cave'), ['omanyte', 'kabuto'], 'current-progress').feasible).toBe(true);
    const beforeSabrina = at('lets-go-pikachu', 'before-sabrina');
    expect(beforeSabrina.entries.hitmonlee.status).toBe('available');
    expect(beforeSabrina.entries.hitmonchan.status).toBe('available');
    expect(checkTeam(beforeSabrina, ['hitmonlee', 'hitmonchan'], 'current-progress').feasible).toBe(false);
  }, 120_000);
});
