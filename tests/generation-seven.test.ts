import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlannerRoot } from '../src/PlannerRoot';
import { loadGame } from '../src/data/game-loader';
import { isGameReady, isProgressReady } from '../src/data/game-catalogue';
import { pokemonBaseStats } from '../src/data/base-stats';
import { pokemonSelections, selectionId } from '../src/domain/pokemon-selection';
import { sharedData } from '../src/data/dataset';
import { damageMultiplier } from '../src/domain/team/analyze-types';
import { buildTeamExport } from '../src/features/export/export-model';
import { createInitialState } from '../src/features/planner/state';

async function game(id: string) {
  const result = await loadGame(id);
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}

describe('Generation VII planners', () => {
  it.each([
    ['sun', 802, 302], ['moon', 802, 302],
    ['ultra-sun', 807, 403], ['ultra-moon', 807, 403],
    ['lets-go-pikachu', 153, 153], ['lets-go-eevee', 153, 153],
  ] as const)('loads the supported species and regional Pokédex for %s', async (id, count, dexCount) => {
    const data = await game(id);
    const expected = sharedData.pokemon.filter(species => id.startsWith('lets-go-')
      ? species.nationalDex <= 151 || [808, 809].includes(species.nationalDex)
      : species.nationalDex <= count);
    expect(data.profiles.map(row => row.pokemonId).sort()).toEqual(expected.map(row => row.id).sort());
    expect(data.profiles.filter(row => row.regionalDex !== undefined)).toHaveLength(dexCount);
    expect(isGameReady(id)).toBe(true);
    expect(isProgressReady(id)).toBe(true);
    expect(data.game.planner?.checkpoints.length).toBeGreaterThan(0);
    const html = renderToStaticMarkup(createElement(PlannerRoot, { game: data }));
    expect(html).toContain(`<strong>${data.game.name}</strong>`);
  });

  it('keeps the original and Ultra dex numbers and forms distinct', async () => {
    const sun = await game('sun');
    const ultra = await game('ultra-sun');
    expect(sun.profiles.find(row => row.pokemonId === 'pikachu')?.regionalDex).toBe(25);
    expect(ultra.profiles.find(row => row.pokemonId === 'pikachu')?.regionalDex).toBe(32);
    expect(sun.profiles.find(row => row.pokemonId === 'lycanroc')?.forms?.map(row => row.formId))
      .toEqual(['lycanroc-midnight']);
    expect(ultra.profiles.find(row => row.pokemonId === 'lycanroc')?.forms?.map(row => row.formId))
      .toEqual(['lycanroc-midnight', 'lycanroc-dusk']);
    expect(damageMultiplier(ultra, 'ghost', 'raichu')).toBe(1);
    expect(damageMultiplier(ultra, 'ghost', 'raichu-alola')).toBe(2);
    expect(pokemonBaseStats('ultra-sun', 'lycanroc-dusk')).toEqual([75, 117, 65, 110, 55, 65]);
  });

  it.each([
    ['lets-go-pikachu', 'pikachu-partner', 'eevee-partner', [45, 80, 50, 120, 75, 60]],
    ['lets-go-eevee', 'eevee-partner', 'pikachu-partner', [65, 75, 70, 75, 65, 85]],
  ] as const)('uses the distinct partner and no breeding in %s', async (id, partner, other, stats) => {
    const data = await game(id);
    const selections = pokemonSelections(data);
    const ids = selections.map(row => selectionId(row.pokemonId, row.formId));
    expect(ids).toContain(partner);
    expect(ids).not.toContain(other);
    expect(data.game.breeding).toBeNull();
    expect(selections.every(row => row.breeding === null)).toBe(true);
    const state = createInitialState(data);
    state.team[0] = partner;
    expect(buildTeamExport(data, state, false, null).slots[0]).toMatchObject({
      baseStats: stats, spriteSrc: `/pokemon/${partner}.png`,
    });
  });
});
