import type { TeamExport } from './export-model';
import { colors, panel, setFont } from './canvas-tools';

const margin = 40;
const contentWidth = 1120;
const labelWidth = 190;
const columnWidth = (contentWidth - labelWidth) / 6;
const rowHeight = 32;
const coverageColumns = 7;

const defenseMarks = [
  { value: 4, label: 'Strong weakness', symbol: '▲▲', color: colors.strongWeak },
  { value: 2, label: 'Weakness', symbol: '▲', color: colors.weak },
  { value: 1, label: 'Normal damage', symbol: '●', color: colors.tile },
  { value: 0.5, label: 'Resistance', symbol: '▼', color: colors.resist },
  { value: 0.25, label: 'Strong resistance', symbol: '▼▼', color: colors.strongResist },
  { value: 0, label: 'Immunity', symbol: '◆', color: colors.immune },
  { value: null, label: 'Empty slot', symbol: '—', color: null },
];

function drawDefenseMark(ctx: CanvasRenderingContext2D, value: number | null, x: number, y: number) {
  const mark = defenseMarks.find(mark => mark.value === value);
  if (!mark) throw new Error(`Unknown damage multiplier: ${value}`);
  if (mark.color) {
    ctx.fillStyle = mark.color;
    ctx.beginPath(); ctx.roundRect(x - 22, y, 44, 24, 6); ctx.fill();
  }
  ctx.fillStyle = mark.color && value !== 1 ? colors.background : colors.muted;
  ctx.textAlign = 'center'; setFont(ctx, 14, true);
  ctx.fillText(mark.symbol, x, y + 3);
  ctx.textAlign = 'left';
}

function coverageGroups(model: TeamExport) {
  return [
    { title: 'Super-effective coverage', types: model.coverage },
    { title: 'No super-effective coverage', types: model.defense.map(row => row.type).filter(type => !model.coverage.includes(type)) },
  ];
}

export function teamAnalysisHeight(model: TeamExport): number {
  if (!model.defense.length) return 0;
  return 210 + model.defense.length * rowHeight + 76
    + coverageGroups(model).reduce((height, group) => height + 36 + Math.max(1, Math.ceil(group.types.length / coverageColumns)) * 38 + 16, 0);
}

export function renderTeamAnalysis(ctx: CanvasRenderingContext2D, model: TeamExport, images: Map<string, HTMLImageElement>, top: number) {
  if (!model.defense.length) return;
  let y = top + 32;
  ctx.fillStyle = colors.ink; setFont(ctx, 24, true);
  ctx.fillText('Team defense', margin, y);
  y += 38;
  ctx.fillStyle = colors.muted; setFont(ctx, 16);
  ctx.fillText('Damage received · Colour and symbols show each Pokémon’s defense', margin, y);
  y += 36;
  defenseMarks.forEach((mark, index) => {
    const x = margin + index % 4 * 280;
    const rowY = y + Math.floor(index / 4) * 30;
    drawDefenseMark(ctx, mark.value, x + 22, rowY);
    ctx.fillStyle = colors.ink; setFont(ctx, 16);
    ctx.fillText(mark.label, x + 54, rowY + 3);
  });
  y += 60;
  ctx.fillStyle = colors.ink; setFont(ctx, 16, true);
  ctx.fillText('Attack type', margin + 12, y + 20);
  model.slots.forEach((slot, index) => {
    const x = margin + labelWidth + columnWidth * (index + 0.5);
    ctx.textAlign = 'center'; setFont(ctx, 14); ctx.fillStyle = colors.muted;
    ctx.fillText(`Slot ${index + 1}`, x, y);
    setFont(ctx, 16, true); ctx.fillStyle = colors.ink;
    ctx.fillText(slot.name, x, y + 20);
  });
  ctx.textAlign = 'left';
  y += 44;
  model.defense.forEach((row, index) => {
    const rowY = y + index * rowHeight;
    if (index % 2 === 0) panel(ctx, margin, rowY, contentWidth, rowHeight);
    ctx.drawImage(images.get(`/types/${row.type}.svg`)!, margin + 12, rowY + 4, 24, 24);
    setFont(ctx, 16, true); ctx.fillStyle = colors.ink;
    ctx.fillText(row.type[0].toUpperCase() + row.type.slice(1), margin + 46, rowY + 6);
    row.multipliers.forEach((value, slot) => {
      drawDefenseMark(ctx, value, margin + labelWidth + columnWidth * (slot + 0.5), rowY + 4);
    });
    ctx.textAlign = 'left';
  });
  y += model.defense.length * rowHeight + 32;
  ctx.fillStyle = colors.ink; setFont(ctx, 24, true);
  ctx.fillText(`Attack coverage · ${model.coverage.length} / ${model.defense.length}`, margin, y);
  y += 44;
  coverageGroups(model).forEach(group => {
    ctx.fillStyle = colors.ink; setFont(ctx, 18, true);
    ctx.fillText(`${group.title} · ${group.types.length}`, margin, y);
    y += 36;
    setFont(ctx, 16);
    if (!group.types.length) {
      ctx.fillStyle = colors.muted; ctx.fillText('None', margin, y + 4);
    }
    group.types.forEach((type, index) => {
      const x = margin + index % coverageColumns * (contentWidth / coverageColumns);
      const rowY = y + Math.floor(index / coverageColumns) * 38;
      ctx.drawImage(images.get(`/types/${type}.svg`)!, x, rowY, 28, 28);
      ctx.fillStyle = colors.ink;
      ctx.fillText(type[0].toUpperCase() + type.slice(1), x + 38, rowY + 4);
    });
    y += Math.max(1, Math.ceil(group.types.length / coverageColumns)) * 38 + 16;
  });
}
