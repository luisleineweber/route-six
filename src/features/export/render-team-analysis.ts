import type { TeamExport } from './export-model';
import { colors, panel, setFont, wrap } from './canvas-tools';
import { exportImage, sheetMargin as margin, sheetWidth } from './render-poster';

const contentWidth = sheetWidth - margin * 2;
const labelWidth = 190;
const columnWidth = (contentWidth - labelWidth) / 6;
const rowHeight = 32;
const coverageColumns = 7;
const coverageRowHeight = 38;

const defenseMarks = [
  { value: 4, label: 'Strong weakness', symbol: '▲▲', color: colors.strongWeak },
  { value: 2, label: 'Weakness', symbol: '▲', color: colors.weak },
  { value: 1, label: 'Normal damage', symbol: '●', color: null },
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
  ctx.fillStyle = mark.color ? colors.background : colors.muted;
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

function defenseHeading(ctx: CanvasRenderingContext2D, model: TeamExport) {
  setFont(ctx, 16, true);
  const names = model.slots.map(slot => wrap(ctx, slot.name, columnWidth - 12));
  return { names, height: 24 + Math.max(1, ...names.map(lines => lines.length)) * 20 };
}

/** One pass gives every section position, so the measured height always matches the drawing. */
function teamAnalysisLayout(ctx: CanvasRenderingContext2D, model: TeamExport, top: number) {
  const titleY = top + 32;
  const subtitleY = titleY + 38;
  const legendY = subtitleY + 36;
  const headingY = legendY + 60;
  const heading = defenseHeading(ctx, model);
  const rowsY = headingY + heading.height;
  const coverageTitleY = rowsY + model.defense.length * rowHeight + 32;
  let y = coverageTitleY + 44;
  const groups = coverageGroups(model).map(group => {
    const groupTitleY = y;
    const typesY = groupTitleY + 36;
    y = typesY + Math.max(1, Math.ceil(group.types.length / coverageColumns)) * coverageRowHeight + 16;
    return { ...group, titleY: groupTitleY, typesY };
  });
  return { titleY, subtitleY, legendY, headingY, heading, rowsY, coverageTitleY, groups, bottom: y };
}

export function teamAnalysisHeight(ctx: CanvasRenderingContext2D, model: TeamExport): number {
  if (!model.defense.length) return 0;
  return teamAnalysisLayout(ctx, model, 0).bottom;
}

export function renderTeamAnalysis(ctx: CanvasRenderingContext2D, model: TeamExport, images: Map<string, HTMLImageElement>, top: number) {
  if (!model.defense.length) return;
  const layout = teamAnalysisLayout(ctx, model, top);
  ctx.fillStyle = colors.ink; setFont(ctx, 24, true);
  ctx.fillText('Team defense', margin, layout.titleY);
  ctx.fillStyle = colors.muted; setFont(ctx, 16);
  ctx.fillText('Damage received · Color and symbols show each Pokémon’s defense', margin, layout.subtitleY);
  defenseMarks.forEach((mark, index) => {
    const x = margin + index % 4 * 280;
    const rowY = layout.legendY + Math.floor(index / 4) * 30;
    drawDefenseMark(ctx, mark.value, x + 22, rowY);
    ctx.fillStyle = colors.ink; setFont(ctx, 16);
    ctx.fillText(mark.label, x + 54, rowY + 3);
  });
  ctx.fillStyle = colors.ink; setFont(ctx, 16, true);
  ctx.fillText('Attack type', margin + 12, layout.headingY + 20);
  layout.heading.names.forEach((lines, index) => {
    const x = margin + labelWidth + columnWidth * (index + 0.5);
    ctx.textAlign = 'center'; setFont(ctx, 14); ctx.fillStyle = colors.muted;
    ctx.fillText(`Slot ${index + 1}`, x, layout.headingY);
    setFont(ctx, 16, true); ctx.fillStyle = colors.ink;
    lines.forEach((line, i) => ctx.fillText(line, x, layout.headingY + 20 + i * 20));
  });
  ctx.textAlign = 'left';
  model.defense.forEach((row, index) => {
    const rowY = layout.rowsY + index * rowHeight;
    if (index % 2 === 0) panel(ctx, margin, rowY, contentWidth, rowHeight);
    ctx.drawImage(exportImage(images, `/types/${row.type}.svg`), margin + 12, rowY + 4, 24, 24);
    setFont(ctx, 16, true); ctx.fillStyle = colors.ink;
    ctx.fillText(row.type[0].toUpperCase() + row.type.slice(1), margin + 46, rowY + 6);
    row.multipliers.forEach((value, slot) => {
      drawDefenseMark(ctx, value, margin + labelWidth + columnWidth * (slot + 0.5), rowY + 4);
    });
    ctx.textAlign = 'left';
  });
  ctx.fillStyle = colors.ink; setFont(ctx, 24, true);
  ctx.fillText(`Attack coverage · ${model.coverage.length} / ${model.defense.length}`, margin, layout.coverageTitleY);
  layout.groups.forEach(group => {
    ctx.fillStyle = colors.ink; setFont(ctx, 18, true);
    ctx.fillText(`${group.title} · ${group.types.length}`, margin, group.titleY);
    setFont(ctx, 16);
    if (!group.types.length) {
      ctx.fillStyle = colors.muted; ctx.fillText('None', margin, group.typesY + 4);
    }
    group.types.forEach((type, index) => {
      const x = margin + index % coverageColumns * (contentWidth / coverageColumns);
      const rowY = group.typesY + Math.floor(index / coverageColumns) * coverageRowHeight;
      ctx.drawImage(exportImage(images, `/types/${type}.svg`), x, rowY, 28, 28);
      ctx.fillStyle = colors.ink;
      ctx.fillText(type[0].toUpperCase() + type.slice(1), x + 38, rowY + 4);
    });
  });
}
