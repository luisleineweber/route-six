import type { ExportSlot } from './export-model';
import { colors, setFont, wrap } from './canvas-tools';
import { posterGap, posterHeight, posterWidth, sheetMargin } from './render-poster';

export const progressText = {
  body: 20, bodyLineHeight: 28, stageName: 18, stageNameLineHeight: 26,
  requirement: 19, requirementLineHeight: 27,
};

export interface TextBlock {
  y: number;
  size: number;
  bold: boolean;
  color: string;
  lines: string[];
  lineHeight: number;
  iconSrc: string | null;
}

/** Measure the same text and widths that the renderer draws. Nothing is truncated. */
export function layoutProgressContent(ctx: CanvasRenderingContext2D, slot: ExportSlot, width: number) {
  const blocks: TextBlock[] = [];
  let y = 0;
  const text = (value: string, size = 18, bold = false, color = colors.ink, iconSrc: string | null = null) => {
    if (!value) return;
    setFont(ctx, size, bold);
    const lines = wrap(ctx, value, width - (iconSrc ? 28 : 0));
    const lineHeight = size + 8;
    blocks.push({ y, size, bold, color, lines, lineHeight, iconSrc });
    y += lines.length * lineHeight + 6;
  };
  const content = slot.progress;
  if (slot.dex !== null && content) {
    text(content.missingSource ? 'Availability' : 'Location', 20, true);
    text(content.location ?? content.missingSource?.title ?? '', 23, !!content.missingSource,
      content.missingSource ? colors.weak : colors.ink);
    if (content.location) {
      text(`${content.stages[0]?.name ?? slot.name} · ${content.method}`, progressText.body, false, colors.detail, content.methodIconSrc);
      content.acquisition.forEach(line => text(line, progressText.body, false, colors.detail));
    } else if (content.missingSource) {
      text(content.missingSource.explanation, progressText.body);
    }
  }
  const sourceHeight = y;
  const evolutionBlockStart = blocks.length;
  const evolutionStart = sourceHeight + 18;
  const stages = content?.location ? content.stages : [];
  const stageWidth = width / Math.max(1, stages.length);
  setFont(ctx, progressText.stageName, true);
  const names = stages.map(stage => wrap(ctx, stage.name, stageWidth - 12));
  setFont(ctx, progressText.requirement);
  const requirements = stages.map(stage => wrap(ctx, stage.requirement ?? '', stageWidth - 12));
  const nameHeight = Math.max(0, ...names.map(lines => lines.length)) * progressText.stageNameLineHeight;
  const requirementHeight = Math.max(0, ...requirements.map(lines => lines.length)) * progressText.requirementLineHeight;
  let evolutionY = y;
  let conditionsY = y;
  let conditions: string[] = [];
  if (stages.length) {
    y += 18;
    text('Evolution', 20, true);
    evolutionY = y;
    if (stages.length < 2) {
      text('No evolution needed.', progressText.body, false, colors.detail);
    } else {
      y += 80 + nameHeight + 8 + requirementHeight;
    }
    setFont(ctx, progressText.requirement);
    conditions = stages.flatMap(stage => stage.conditions.map(condition => `${stage.name}: ${condition}`))
      .flatMap(line => wrap(ctx, line, width));
    conditionsY = y + (conditions.length ? 12 : 0);
    y = conditionsY + conditions.length * progressText.requirementLineHeight;
  }
  const evolutionBlocks = blocks.splice(evolutionBlockStart).map(block => ({ ...block, y: block.y - evolutionStart }));
  return { blocks, sourceHeight, evolutionBlocks, stages, stageWidth, names, requirements, nameHeight,
    evolutionY: stages.length ? evolutionY - evolutionStart : 0, conditions,
    conditionsY: stages.length ? conditionsY - evolutionStart : 0,
    evolutionHeight: stages.length ? y - evolutionStart : 0, height: y };
}

/** Keep all six images equal, then align source and evolution sections by row. */
export function layoutProgressRows(ctx: CanvasRenderingContext2D, slots: ExportSlot[], top: number) {
  const imageHeight = Math.max(...slots.map(slot => posterHeight(ctx, slot)));
  const content = slots.map(slot => layoutProgressContent(ctx, slot, posterWidth - 32));
  const placements: {
    x: number; y: number; imageHeight: number; sourceY: number; evolutionY: number;
    layout: ReturnType<typeof layoutProgressContent>;
  }[] = [];
  let y = top;
  for (let row = 0; row < Math.ceil(slots.length / 3); row++) {
    const members = content.slice(row * 3, row * 3 + 3);
    const sourceY = y + imageHeight + 20;
    const evolutionY = sourceY + Math.max(...members.map(member => member.sourceHeight)) + 18;
    const bottom = evolutionY + Math.max(...members.map(member => member.evolutionHeight));
    members.forEach((layout, column) => placements.push({
      x: sheetMargin + column * (posterWidth + posterGap), y, imageHeight, sourceY, evolutionY, layout,
    }));
    y = bottom + 40;
  }
  return { placements, bottom: y };
}

/** Limit each member's extra locations so common catches cannot make a long list. */
export function layoutProgressAlternatives(ctx: CanvasRenderingContext2D, slot: ExportSlot, index: number, width: number) {
  if (!slot.progress?.routeOptions.length) return null;
  const blocks: TextBlock[] = [];
  setFont(ctx, 20, true);
  const title = wrap(ctx, `Slot ${index + 1} · ${slot.name}`, width);
  blocks.push({ y: 0, size: 20, bold: true, color: colors.ink, lines: title, lineHeight: 27, iconSrc: null });
  let y = title.length * 27 + 8;
  const visibleOptions = slot.progress.routeOptions.slice(0, 2);
  for (const option of visibleOptions) {
    setFont(ctx, progressText.body);
    const location = wrap(ctx, option.location, width);
    blocks.push({ y, size: progressText.body, bold: false, color: colors.ink, lines: location, lineHeight: progressText.bodyLineHeight, iconSrc: null });
    y += location.length * progressText.bodyLineHeight + 2;
    setFont(ctx, progressText.requirement);
    const method = wrap(ctx, `${option.sourceName} · ${option.method}`, width - (option.methodIconSrc ? 28 : 0));
    blocks.push({ y, size: progressText.requirement, bold: false, color: colors.detail, lines: method, lineHeight: progressText.requirementLineHeight, iconSrc: option.methodIconSrc });
    y += method.length * progressText.requirementLineHeight + 10;
  }
  setFont(ctx, progressText.requirement);
  for (const note of new Set(visibleOptions.flatMap(option => option.evolutionNotes))) {
    const lines = wrap(ctx, note, width);
    blocks.push({ y, size: progressText.requirement, bold: false, color: colors.ink, lines, lineHeight: progressText.requirementLineHeight, iconSrc: null });
    y += lines.length * progressText.requirementLineHeight + 6;
  }
  const remaining = slot.progress.routeOptions.length - 2;
  if (remaining > 0) {
    const lines = wrap(ctx, `${remaining} more ${remaining === 1 ? 'location' : 'locations'} in the planner.`, width);
    blocks.push({ y, size: progressText.requirement, bold: false, color: colors.detail, lines, lineHeight: progressText.requirementLineHeight, iconSrc: null });
    y += lines.length * progressText.requirementLineHeight + 6;
  }
  return { blocks, height: y };
}

/** Group extra locations below the team. Retain each member's original slot label. */
export function layoutProgressAlternativesSection(ctx: CanvasRenderingContext2D, slots: ExportSlot[], top: number) {
  const groups = slots.map((slot, index) => layoutProgressAlternatives(ctx, slot, index, posterWidth - 32))
    .filter(group => group !== null);
  const placements: { x: number; y: number; group: (typeof groups)[number] }[] = [];
  let bottom = top;
  if (groups.length) {
    bottom += 44;
    for (let index = 0; index < groups.length; index += 3) {
      const row = groups.slice(index, index + 3);
      row.forEach((group, column) => placements.push({
        group, x: sheetMargin + column * (posterWidth + posterGap) + 16, y: bottom,
      }));
      bottom += Math.max(...row.map(group => group.height)) + 24;
    }
  }
  return { headingY: top, placements, bottom };
}
