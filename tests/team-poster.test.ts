import { describe, expect, it } from 'vitest';
import { fitTeamSprite, teamPosterLayout } from '../src/features/export/team-poster-layout';
import { drawStatChart, statChartColors } from '../src/features/export/render-stat-chart';
import { teamAnalysisHeight } from '../src/features/export/render-team-analysis';
import type { TeamExport } from '../src/features/export/export-model';

describe('Team PNG card layout', () => {
  it.each([[400, 20], [20, 400], [96, 96], [1, 1], [75, 82]])('keeps a %s × %s sprite clear of stat labels and the name', (width, height) => {
    const box = fitTeamSprite({ x: 0, y: 0, width, height });
    expect(box.x).toBeGreaterThanOrEqual(12);
    expect(box.x + box.width).toBeLessThanOrEqual(150);
    expect(box.y).toBeGreaterThanOrEqual(44);
    expect(box.y + box.height).toBeLessThanOrEqual(184);
  });

  it('wraps long form names before placing type icons below them', () => {
    const ctx = { measureText: (text: string) => ({ width: text.length * 14 }) } as CanvasRenderingContext2D;
    const result = teamPosterLayout(ctx, { name: 'Gourgeist (Super Size)', dex: 711, spriteSrc: '/pokemon/711.png', types: ['ghost', 'grass'], progress: null });
    expect(result.name.join(' ')).toBe('Gourgeist (Super Size)');
    expect(result.name.every(line => ctx.measureText(line).width <= 138)).toBe(true);
    expect(result.typeY).toBeGreaterThanOrEqual(191 + result.name.length * 26);
    expect(result.height).toBeGreaterThanOrEqual(result.typeY + 40);
  });

  it('prints every tied highest value in red without drawing a number badge', () => {
    const text: { value: string; color: string }[] = [];
    const points: number[][] = [];
    let badges = 0;
    const noop = () => {};
    const ctx = { fillStyle: '', beginPath: noop, closePath: noop, fill: noop, stroke: noop,
      lineTo: (...point: number[]) => points.push(point), moveTo: (...point: number[]) => points.push(point), arc: noop,
      roundRect: () => { badges++; }, fillText(this: { fillStyle: string }, value: string) { text.push({ value, color: this.fillStyle }); },
    } as unknown as CanvasRenderingContext2D;
    drawStatChart(ctx, [100, 100, 1, 1, 1, 1], 0, 0);
    expect(text.filter(item => item.color === statChartColors.highest).map(item => item.value)).toEqual(['100', '100']);
    expect(text.filter(item => /^\d+$/.test(item.value))).toHaveLength(6);
    expect(badges).toBe(0);
    expect(points.every(([x, y]) => x >= 190 && x <= 314 && y >= 73 && y <= 195)).toBe(true);
  });

  it('reserves more analysis space when a form name wraps in a column', () => {
    const ctx = { measureText: (text: string) => ({ width: text.length * 9.6 }) } as CanvasRenderingContext2D;
    const model = { slots: [{ name: 'Gourgeist' }], defense: [{ type: 'ghost' }], coverage: [] } as unknown as TeamExport;
    const normalHeight = teamAnalysisHeight(ctx, model);
    const longName = { ...model, slots: [{ ...model.slots[0], name: 'Gourgeist (Super Size)' }] };
    expect(teamAnalysisHeight(ctx, longName)).toBe(normalHeight + 20);
  });
});
