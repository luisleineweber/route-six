import { statAxes, type BaseStats } from '../../domain/base-stats';
import { colors, setFont } from './canvas-tools';

export const statChartColors = { ink: 'oklch(0.24 0.035 160)', line: 'oklch(0.34 0.105 160)', highest: 'oklch(0.44 0.16 25)' };

/** The same native 0–255 range applies to every member. No scale values are printed. */
export function drawStatChart(ctx: CanvasRenderingContext2D, stats: BaseStats, x: number, y: number) {
  const axes = statAxes(stats), maximum = Math.max(...stats);
  const point = (i: number, fraction = 1): [number, number] => [
    x + 252 + Math.sin(i * Math.PI * 2 / axes.length) * 61 * fraction,
    y + 134 - Math.cos(i * Math.PI * 2 / axes.length) * 61 * fraction,
  ];
  const polygon = (fractions: number[]) => {
    ctx.beginPath();
    fractions.forEach((fraction, i) => { const p = point(i, fraction); if (i) ctx.lineTo(...p); else ctx.moveTo(...p); });
    ctx.closePath();
  };
  polygon(axes.map(() => 1)); ctx.fillStyle = 'oklch(1 0 0 / 0.1)'; ctx.fill();
  ctx.lineWidth = 0.9;
  for (const fraction of [1 / 3, 2 / 3, 1]) {
    polygon(axes.map(() => fraction)); ctx.strokeStyle = 'oklch(0.24 0.035 160 / 0.2)'; ctx.stroke();
  }
  axes.forEach((_, i) => {
    ctx.beginPath(); ctx.moveTo(x + 252, y + 134); ctx.lineTo(...point(i));
    ctx.strokeStyle = 'oklch(0.24 0.035 160 / 0.14)'; ctx.stroke();
  });
  polygon(axes.map(axis => axis.value / 255));
  ctx.fillStyle = 'oklch(0.4 0.11 160 / 0.2)'; ctx.fill();
  ctx.strokeStyle = statChartColors.line; ctx.lineWidth = 2.4; ctx.lineJoin = 'round'; ctx.stroke();
  axes.forEach((axis, i) => {
    const p = point(i, axis.value / 255), highest = axis.value === maximum;
    if (highest) { ctx.beginPath(); ctx.arc(...p, 5, 0, 2 * Math.PI); ctx.fillStyle = 'oklch(1 0 0 / 0.9)'; ctx.fill(); }
    ctx.beginPath(); ctx.arc(...p, highest ? 3.4 : 2.5, 0, 2 * Math.PI);
    ctx.fillStyle = highest ? statChartColors.highest : statChartColors.line; ctx.fill();
  });
  const anchors = axes.length === 5
    ? [[252, 28], [329, 95], [301, 205], [203, 205], [175, 95]]
    : [[252, 28], [329, 70], [329, 159], [252, 213], [175, 159], [175, 70]];
  ctx.textAlign = 'center';
  axes.forEach((axis, i) => {
    const [lx, ly] = anchors[i];
    setFont(ctx, 13); ctx.fillStyle = 'oklch(0.29 0.025 160 / 0.86)'; ctx.fillText(axis.label, x + lx, y + ly);
    setFont(ctx, 19, true); ctx.fillStyle = axis.value === maximum ? statChartColors.highest : statChartColors.ink;
    ctx.fillText(String(axis.value), x + lx, y + ly + 17);
  });
  ctx.textAlign = 'left'; ctx.fillStyle = colors.ink;
}
