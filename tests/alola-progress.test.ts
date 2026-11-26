import { describe, expect, it } from 'vitest';
import { loadGame } from '../src/data/game-loader';
import { sharedData } from '../src/data/dataset';
import { getAvailability } from '../src/domain/availability';
import { excludesSelection } from '../src/domain/availability/exclusions';
import { solve } from '../src/domain/availability/solve';
import { checkTeam } from '../src/domain/team/check-team';
import type { GameData } from '../src/domain/types';

async function game(id: string) {
  const result = await loadGame(id);
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}

function progress(data: GameData, milestoneId: string) {
  const milestone = data.milestones.find(row => row.id === milestoneId);
  if (!milestone) throw new Error(`Missing milestone ${milestoneId}`);
  return solve(data, milestone, true);
}

function availability(data: GameData, milestoneId: string) {
  const result = getAvailability({ ...sharedData, games: [data] }, {
    gameId: data.game.id, milestoneId, respectLevelLimit: true,
  });
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}

describe('Generation VII Alola Progress Planner', () => {
  it.each(['ultra-sun', 'ultra-moon'])('%s keeps native breeding paths free of external exclusions', async id => {
    const data = await game(id);
    const { entries, paths } = availability(data, 'alola-start');
    expect(entries.bounsweet.futurePathIds.some(pathId => paths[pathId].breedingSteps.length > 0)).toBe(true);
    const contradictions = Object.values(paths).filter(path => data.exclusions.some(exclusion => excludesSelection(exclusion, path)));
    expect([...new Set(contradictions.map(path => path.formId ?? path.pokemonId))]).toEqual([]);
  }, 120_000);

  it.each(['ultra-sun', 'ultra-moon'])('%s opens the base of Mount Lanakila before Acerola', async id => {
    const data = await game(id);
    const beforeTapu = progress(data, 'trial-sophocles');
    const beforeAcerola = progress(data, 'trial-acerola');
    const snorunt = data.sources.find(source => source.locationId === 'mount-lanakila-area-1' && source.pokemonId === 'snorunt')!;
    expect(beforeTapu.paths.has('crabominable')).toBe(false);
    expect(beforeAcerola.paths.has('crabominable')).toBe(true);
    expect(beforeAcerola.paths.get('snorunt')?.some(path => path.sourceIds.includes(snorunt.id))).toBe(true);
    expect(beforeAcerola.paths.has('glaceon')).toBe(false);
    expect(progress(data, 'pokemon-league').paths.has('glaceon')).toBe(true);
  }, 120_000);

  it.each([
    ['sun', 'buzzwole', 'after-ultra-beast-missions', 2, 65],
    ['moon', 'pheromosa', 'after-ultra-beast-missions', 4, 60],
    ['ultra-sun', 'blacephalon', 'champion', 2, 60],
    ['ultra-moon', 'stakataka', 'champion', 2, 60],
  ] as const)('%s applies the catch limit and level for %s', async (id, species, milestoneId, limit, level) => {
    const data = await game(id);
    const snapshot = availability(data, milestoneId);
    const team = Array<string>(limit).fill(species);
    expect(checkTeam(snapshot, team, 'current-progress').feasible).toBe(true);
    expect(checkTeam(snapshot, [...team, species], 'current-progress').feasible).toBe(false);
    expect(snapshot.entries[species].currentPathIds.map(pathId => snapshot.paths[pathId].minimumLevel))
      .toEqual(Array<number>(snapshot.entries[species].currentPathIds.length).fill(level));
    if (id === 'sun' || id === 'moon') {
      const nihilego = snapshot.entries.nihilego.currentPathIds.map(pathId => snapshot.paths[pathId]);
      expect(new Set(nihilego.map(path => path.sourceIds[0])).size).toBe(2);
      expect(checkTeam(snapshot, ['nihilego', 'nihilego'], 'current-progress').feasible).toBe(false);
    }
  }, 120_000);

  it.each([
    ['sun', 'Gumshoos', 'Wishiwashi', 'Salazzle', 'Vikavolt', 15, 12],
    ['moon', 'Alolan Raticate', 'Wishiwashi', 'Salazzle', 'Vikavolt', 15, 12],
    ['ultra-sun', 'Gumshoos', 'Araquanid', 'Alolan Marowak', 'Togedemaru', 16, 13],
    ['ultra-moon', 'Alolan Raticate', 'Araquanid', 'Alolan Marowak', 'Togedemaru', 16, 13],
  ] as const)('loads distinct story bosses for %s', async (id, ilima, lana, kiawe, sophocles, halaLevel, count) => {
    const data = await game(id);
    const bosses = new Map(data.bosses.map(boss => [boss.id, boss]));
    expect(bosses.get('trial-ilima')?.name).toBe(ilima);
    expect(bosses.get('trial-lana')?.name).toBe(lana);
    expect(bosses.get('trial-kiawe')?.name).toBe(kiawe);
    expect(bosses.get('trial-sophocles')?.name).toBe(sophocles);
    expect(bosses.get('grand-trial-hala')).toMatchObject({ kind: 'grand-trial', highestLevel: halaLevel });
    expect(data.bosses).toHaveLength(count);
    const checkpoints = data.game.planner!.checkpoints.map(row => row.milestoneId);
    expect(checkpoints.indexOf('grand-trial-hapu') < checkpoints.indexOf('trial-poni')).toBe(!id.startsWith('ultra-'));
  });

  it('preserves starter choices, native forms and SOS gates', async () => {
    const data = await game('sun');
    const early = progress(data, 'trial-ilima');
    expect(early.limit).toBe(12);
    expect(early.paths.get('rowlet')?.[0].choices).toEqual([{ groupId: 'alola-starter', optionId: 'rowlet' }]);
    expect(early.paths.has('rattata-alola')).toBe(true);
    expect(early.paths.has('rattata')).toBe(false);
    const sosIds = new Set(data.sources.filter(source => source.details.kind === 'wild'
      && source.details.method === 'sos').map(source => source.id));
    expect(early.paths.get('pikachu')?.some(path => path.sourceIds.some(id => sosIds.has(id)))).toBe(false);
    const after = progress(data, 'grand-trial-hala');
    expect(after.paths.get('pikachu')?.some(path => path.sourceIds.some(id => sosIds.has(id)))).toBe(true);
    expect(after.paths.has('oricorio-pom-pom')).toBe(true);
    expect(after.paths.has('oricorio')).toBe(false);
    expect(after.paths.has('rockruff')).toBe(false);
    expect(data.sources.some(source => source.pokemonId === 'pikachu'
      && source.encounterConditions?.some(condition => condition.kind === 'sos'
        && condition.callerIds.includes('pichu')))).toBe(true);
  });

  it('keeps the Fishing Rod behind Lana and preserves direct game-trade evolutions', async () => {
    const sun = await game('sun');
    const ultra = await game('ultra-moon');
    const before = progress(sun, 'trial-lana');
    expect(before.paths.has('feebas')).toBe(false);
    expect(progress(sun, 'trial-kiawe').paths.has('feebas')).toBe(true);
    const golem = sun.sources.find(row => row.formId === 'golem-alola');
    const trevenant = ultra.sources.find(row => row.pokemonId === 'trevenant' && row.details.kind === 'game-trade');
    expect(golem?.details).toMatchObject({ kind: 'game-trade', offeredPokemonId: 'haunter' });
    expect(trevenant?.details).toMatchObject({ kind: 'game-trade', offeredPokemonId: 'phantump' });
  }, 30000);

  it('retains edition-specific fossil and magnetic field requirements', async () => {
    const sun = await game('sun');
    const moon = await game('moon');
    const ultra = await game('ultra-sun');
    expect(sun.items.some(item => item.id === 'skull-fossil')).toBe(true);
    expect(moon.items.some(item => item.id === 'skull-fossil')).toBe(false);
    expect(ultra.items.find(item => item.id === 'armor-fossil')?.sources.map(row => row.locationId))
      .toEqual(['poke-pelago']);
    expect(sun.evolutions.filter(row => row.toPokemonId === 'vikavolt').map(row => row.conditions[0]))
      .toEqual([{ kind: 'location', locationId: 'vast-poni-canyon' }]);
    expect(ultra.evolutions.filter(row => row.toPokemonId === 'vikavolt').map(row => row.conditions[0]))
      .toContainEqual({ kind: 'location', locationId: 'blush-mountain' });
    expect(sun.evolutions.some(row => row.toPokemonId === 'raichu' && row.toFormId === null)).toBe(false);
    expect(ultra.evolutions.find(row => row.toPokemonId === 'raichu' && row.toFormId === null))
      .toMatchObject({
        requirements: {
          kind: 'all',
          requirements: [
            { kind: 'capability', id: 'ultra-warp-ride' },
            { kind: 'item', id: 'thunder-stone', consumed: true },
          ],
        },
      });
  });
});
