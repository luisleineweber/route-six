import type { ExportSlot, TeamExport } from './export-model';
import { colors, panel, pngBlob, setFont, wrap } from './canvas-tools';

const width = 1200;
const margin = 40;
const gap = 24;
const cardWidth = (width - 2 * margin - gap) / 2;
const inset = 28;
const lineHeight = 28;

interface MethodRow {
  prefix: string;
  method: string;
  iconSrc: string | null;
}

function layoutMethodRow(ctx: CanvasRenderingContext2D, row: MethodRow, width: number) {
  setFont(ctx, 18);
  if (!row.iconSrc) {
    return { ...row, prefixLines: wrap(ctx, `${row.prefix} ${row.method}`.trim(), width), iconSize: 0, gap: 0 };
  }
  const iconSize = 20;
  const gap = 6;
  const methodWidth = ctx.measureText(row.method).width;
  const prefixWidth = Math.max(1, width - iconSize - gap * 2 - methodWidth);
  return { ...row, prefixLines: row.prefix ? wrap(ctx, row.prefix, prefixWidth) : [''], iconSize, gap };
}

function drawMethodRow(ctx: CanvasRenderingContext2D, row: ReturnType<typeof layoutMethodRow>, images: Map<string, HTMLImageElement>, x: number, y: number) {
  setFont(ctx, 18); ctx.fillStyle = colors.muted;
  if (!row.iconSrc) {
    row.prefixLines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
    return;
  }
  row.prefixLines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  const lastPrefix = row.prefixLines.at(-1) ?? '';
  const methodX = x + ctx.measureText(lastPrefix).width + row.gap + row.iconSize + row.gap;
  const icon = images.get(row.iconSrc);
  if (icon) ctx.drawImage(icon, methodX - row.iconSize - row.gap, y + (row.prefixLines.length - 1) * lineHeight + 2, row.iconSize, row.iconSize);
  ctx.fillText(row.method, methodX, y + (row.prefixLines.length - 1) * lineHeight);
}

function layoutContent(ctx: CanvasRenderingContext2D, slot: ExportSlot) {
  const content = slot.progress;
  const availableWidth = cardWidth - 2 * inset;
  setFont(ctx, 22);
  const missingSource = content?.missingSource;
  setFont(ctx, 22, !!missingSource);
  const location = wrap(ctx, content?.location ?? missingSource?.title ?? '', availableWidth);
  setFont(ctx, 18);
  const primaryMethod = content?.location ? layoutMethodRow(ctx, {
    prefix: `${content.stages[0]?.name ?? slot.name} ·`, method: content.method, iconSrc: content.methodIconSrc,
  }, availableWidth) : null;
  const acquisition = content?.location ? content.acquisition.flatMap(text => wrap(ctx, text, availableWidth))
    : missingSource ? wrap(ctx, missingSource.explanation, availableWidth) : [];
  const routeOptions = (content?.routeOptions ?? []).map(option => layoutMethodRow(ctx, {
    prefix: `${option.location} · ${option.sourceName} ·`, method: option.method, iconSrc: option.methodIconSrc,
  }, availableWidth));
  const optionLines = routeOptions.reduce((sum, option) => sum + option.prefixLines.length, 0);
  const routeHeading = routeOptions.length > 0 ? 1 : 0;
  const methodLines = primaryMethod?.prefixLines.length ?? 0;
  const evolutionY = 176 + location.length * lineHeight + methodLines * lineHeight + acquisition.length * lineHeight
    + (optionLines + routeHeading) * lineHeight + 24;
  const stages = content?.stages ?? [];
  const stageWidth = availableWidth / Math.max(1, stages.length);
  const requirements = stages.map(stage => wrap(ctx, stage.requirement ?? '', stageWidth - 16));
  const conditions = stages.flatMap(stage => stage.conditions.map(text => `${stage.name}: ${text}`))
    .flatMap(text => wrap(ctx, text, availableWidth));
  const requirementHeight = Math.max(0, ...requirements.map(lines => lines.length)) * lineHeight;
  const chainHeight = stages.length > 1 ? 152 + requirementHeight : 56;
  return { location, primaryMethod, acquisition, routeOptions, evolutionY, stages, stageWidth, requirements, conditions,
    height: slot.dex === null ? 240 : evolutionY + chainHeight + conditions.length * lineHeight + inset };
}

export function renderProgressPng(model: TeamExport, images: Map<string, HTMLImageElement>): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('The browser could not create the PNG.');
  setFont(ctx, 20);
  const subtitle = wrap(ctx, model.subtitle, width - margin * 2);
  const notes = model.notes.flatMap(note => wrap(ctx, note, width - margin * 2));
  const top = 108 + (subtitle.length + notes.length) * lineHeight;
  const layouts = model.slots.map(slot => layoutContent(ctx, slot));
  const rowHeights = [0, 1, 2].map(row => Math.max(...layouts.slice(row * 2, row * 2 + 2).map(layout => layout.height)));
  const height = top + rowHeights.reduce((sum, height) => sum + height, 0) + gap * 2 + margin;
  canvas.width = width * 2; canvas.height = height * 2;
  ctx.scale(2, 2); ctx.textBaseline = 'top';
  ctx.fillStyle = colors.background; ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = colors.ink; setFont(ctx, 32, true); ctx.fillText(model.title, margin, 36);
  setFont(ctx, 20); ctx.fillStyle = colors.muted;
  subtitle.forEach((line, i) => ctx.fillText(line, margin, 84 + i * lineHeight));
  ctx.fillStyle = colors.weak;
  notes.forEach((line, i) => ctx.fillText(line, margin, 84 + (subtitle.length + i) * lineHeight));

  model.slots.forEach((slot, index) => {
    const row = Math.floor(index / 2);
    const x = margin + index % 2 * (cardWidth + gap);
    const y = top + rowHeights.slice(0, row).reduce((sum, height) => sum + height + gap, 0);
    const layout = layouts[index];
    panel(ctx, x, y, cardWidth, rowHeights[row]);
    setFont(ctx, 16); ctx.fillStyle = colors.muted;
    ctx.fillText(`Slot ${index + 1}`, x + inset, y + 18);
    if (slot.dex === null) {
      setFont(ctx, 26, true); ctx.fillStyle = colors.ink; ctx.fillText('Empty slot', x + inset, y + 72);
      return;
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(images.get(slot.spriteSrc!)!, x + inset, y + 40, 88, 88);
    ctx.imageSmoothingEnabled = true;
    setFont(ctx, 28, true); ctx.fillStyle = colors.ink;
    ctx.fillText(slot.name, x + inset + 112, y + 52);
    slot.types.forEach((type, i) => ctx.drawImage(images.get(`/types/${type}.svg`)!, x + inset + 112 + i * 36, y + 94, 28, 28));

    setFont(ctx, 20, true); ctx.fillStyle = colors.ink;
    ctx.fillText(slot.progress?.missingSource ? 'Availability' : 'Location', x + inset, y + 142);
    const missingSource = slot.progress?.missingSource;
    setFont(ctx, 22, !!missingSource); ctx.fillStyle = missingSource ? colors.weak : colors.ink;
    layout.location.forEach((line, i) => ctx.fillText(line, x + inset, y + 176 + i * lineHeight));
    let bodyY = y + 176 + layout.location.length * lineHeight;
    if (layout.primaryMethod) {
      drawMethodRow(ctx, layout.primaryMethod, images, x + inset, bodyY);
      bodyY += layout.primaryMethod.prefixLines.length * lineHeight;
    }
    setFont(ctx, 18); ctx.fillStyle = missingSource ? colors.ink : colors.muted;
    layout.acquisition.forEach((line, i) => ctx.fillText(line, x + inset, bodyY + i * lineHeight));
    bodyY += layout.acquisition.length * lineHeight;
    if (layout.routeOptions.length) {
      bodyY += 4;
      setFont(ctx, 16, true); ctx.fillStyle = colors.ink;
      ctx.fillText('Other encounter options', x + inset, bodyY);
      bodyY += lineHeight;
      for (const option of layout.routeOptions) {
        drawMethodRow(ctx, option, images, x + inset, bodyY);
        bodyY += option.prefixLines.length * lineHeight;
      }
    }
    if (!slot.progress?.location) return;

    const evolutionY = y + layout.evolutionY;
    setFont(ctx, 20, true); ctx.fillStyle = colors.ink;
    ctx.fillText('Evolution', x + inset, evolutionY);
    if (layout.stages.length < 2) {
      setFont(ctx, 20); ctx.fillStyle = colors.muted;
      ctx.fillText('No evolution needed.', x + inset, evolutionY + 32);
      return;
    }
    layout.stages.forEach((stage, i) => {
      const center = x + inset + (i + 0.5) * layout.stageWidth;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(images.get(stage.spriteSrc)!, center - 36, evolutionY + 36, 72, 72);
      ctx.imageSmoothingEnabled = true;
      ctx.textAlign = 'center'; setFont(ctx, 18, true); ctx.fillStyle = colors.ink;
      ctx.fillText(stage.name, center, evolutionY + 114);
      setFont(ctx, 18); ctx.fillStyle = colors.muted;
      layout.requirements[i].forEach((line, j) => ctx.fillText(line, center, evolutionY + 142 + j * lineHeight));
      if (i < layout.stages.length - 1) {
        setFont(ctx, 26); ctx.fillText('→', center + layout.stageWidth / 2, evolutionY + 64);
      }
      ctx.textAlign = 'left';
    });
    setFont(ctx, 18); ctx.fillStyle = colors.muted;
    const conditionsY = evolutionY + 152 + Math.max(0, ...layout.requirements.map(lines => lines.length)) * lineHeight;
    layout.conditions.forEach((line, i) => ctx.fillText(line, x + inset, conditionsY + i * lineHeight));
  });
  return pngBlob(canvas);
}
