import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import commonSchema from '../docs/schema/common.schema.json';
import gameSchema from '../docs/schema/game.schema.json';
import emeraldChart from '../data/games/emerald/type-chart.json';
import type { Boss, TypeChart } from '../src/domain/types';

const games = ['diamond', 'pearl', 'platinum', 'heartgold', 'soulsilver', 'black', 'white', 'black-2', 'white-2', 'x', 'y', 'omega-ruby', 'alpha-sapphire'];
const genSix = new Set(['x', 'y', 'omega-ruby', 'alpha-sapphire']);
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(commonSchema).addSchema(gameSchema);
const validBoss = ajv.getSchema(`${gameSchema.$id}#/$defs/boss`)!;
const validChart = ajv.getSchema(`${gameSchema.$id}#/$defs/typeChart`)!;
function read(game: string, file: string): unknown {
  return JSON.parse(readFileSync(`data/games/${game}/${file}.json`, 'utf8'));
}

describe('Reviewed first game layers', () => {
  it.each(games)('checks all authored %s boss records against the schema and badge sequence', game => {
    const bosses = read(game, 'bosses') as Boss[];
    for (const boss of bosses) expect(validBoss(boss), `${game}/${boss.id}: ${JSON.stringify(validBoss.errors)}`).toBe(true);
    expect(new Set(bosses.map(boss => boss.id)).size).toBe(bosses.length);
    expect(bosses.filter(boss => boss.kind === 'gym').map(boss => boss.badgeNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it.each(games)('checks every authored %s type chart against the game generation', game => {
    const chart = read(game, 'type-chart') as TypeChart;
    expect(validChart(chart), JSON.stringify(validChart.errors)).toBe(true);
    const count = genSix.has(game) ? 18 : 17;
    expect(chart.typeIds).toHaveLength(count);
    expect(chart.matrix).toHaveLength(count);
    expect(chart.matrix.every(row => row.length === count)).toBe(true);
    const at = (attack: string, defense: string) => chart.matrix[chart.typeIds.indexOf(attack)][chart.typeIds.indexOf(defense)];
    for (const attack of emeraldChart.typeIds) for (const defense of emeraldChart.typeIds) {
      const genSixSteelChange = genSix.has(game) && defense === 'steel' && ['ghost', 'dark'].includes(attack);
      const previous = emeraldChart.matrix[emeraldChart.typeIds.indexOf(attack)][emeraldChart.typeIds.indexOf(defense)];
      expect(at(attack, defense), `${game}: ${attack} -> ${defense}`).toBe(genSixSteelChange ? 1 : previous);
    }
    if (genSix.has(game)) {
      const attack: Record<string, number> = { fighting: 2, dragon: 2, dark: 2, fire: .5, poison: .5, steel: .5 };
      const defense: Record<string, number> = { fighting: .5, bug: .5, dark: .5, dragon: 0, poison: 2, steel: 2 };
      const order = [...emeraldChart.typeIds, 'fairy'];
      order.forEach(type => {
        expect(at('fairy', type), `${game}: fairy -> ${type}`).toBe(attack[type] ?? 1);
        expect(at(type, 'fairy'), `${game}: ${type} -> fairy`).toBe(defense[type] ?? 1);
      });
    } else expect(chart.typeIds).not.toContain('fairy');
  });
});
