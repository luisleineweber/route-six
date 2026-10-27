import type { TeamExport } from './export-model';
import { colors, pngBlob, setFont, wrap } from './canvas-tools';
import { layoutProgressRows, layoutProgressAlternativesSection, progressText, type TextBlock } from './progress-layout';
import { drawPokemonPoster, drawSheetHeading, drawSheetNotes, posterWidth,
  sheetHeadingHeight, sheetMargin, sheetWidth, type ExportImages } from './render-poster';

export function drawTextBlocks(ctx: CanvasRenderingContext2D, blocks: TextBlock[], images: ExportImages, x: number, y: number) {
  for (const block of blocks) {
    setFont(ctx, block.size, block.bold); ctx.fillStyle = block.color;
    const textX = x + (block.iconSrc ? 28 : 0);
    if (block.iconSrc) ctx.drawImage(images.get(block.iconSrc)!, x, y + block.y + block.size - 20, 20, 20);
    block.lines.forEach((line, i) => ctx.fillText(line, textX, y + block.y + i * block.lineHeight));
  }
}

/** Keep the team in two aligned rows. Extra locations share one section below it. */
export function renderProgressPng(model: TeamExport, images: ExportImages): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('The browser could not create the PNG.');
  const top = sheetHeadingHeight(ctx, model);
  const grid = layoutProgressRows(ctx, model.slots, top);
  const alternatives = layoutProgressAlternativesSection(ctx, model.slots, grid.bottom);
  const bottom = alternatives.bottom;
  setFont(ctx, 18);
  const notes = model.notes.flatMap(note => wrap(ctx, note, sheetWidth - sheetMargin * 2));
  const height = bottom + notes.length * 26 + sheetMargin;
  canvas.width = sheetWidth * 2; canvas.height = Math.ceil(height) * 2;
  ctx.scale(2, 2); ctx.textBaseline = 'top';
  ctx.fillStyle = colors.background; ctx.fillRect(0, 0, sheetWidth, height);
  drawSheetHeading(ctx, model, images);

  model.slots.forEach((slot, index) => {
    const { x, y, imageHeight, sourceY, evolutionY: sectionY, layout } = grid.placements[index];
    drawPokemonPoster(ctx, slot, index, images, x, y, posterWidth, imageHeight);
    const bodyX = x + 16;
    drawTextBlocks(ctx, layout.blocks, images, bodyX, sourceY);
    drawTextBlocks(ctx, layout.evolutionBlocks, images, bodyX, sectionY);
    if (layout.stages.length > 1) {
      layout.stages.forEach((stage, i) => {
        const center = bodyX + (i + 0.5) * layout.stageWidth;
        const evolutionY = sectionY + layout.evolutionY;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(images.get(stage.spriteSrc)!, center - 36, evolutionY, 72, 72);
        ctx.imageSmoothingEnabled = true;
        ctx.textAlign = 'center'; setFont(ctx, progressText.stageName, true); ctx.fillStyle = colors.ink;
        layout.names[i].forEach((line, j) => ctx.fillText(line, center, evolutionY + 80 + j * progressText.stageNameLineHeight));
        setFont(ctx, progressText.requirement); ctx.fillStyle = colors.detail;
        layout.requirements[i].forEach((line, j) => ctx.fillText(line, center, evolutionY + 88 + layout.nameHeight + j * progressText.requirementLineHeight));
        if (i < layout.stages.length - 1) {
          setFont(ctx, 22); ctx.fillText('→', center + layout.stageWidth / 2, evolutionY + 24);
        }
        ctx.textAlign = 'left';
      });
    }
    setFont(ctx, progressText.requirement); ctx.fillStyle = colors.detail;
    layout.conditions.forEach((line, i) => ctx.fillText(line, bodyX, sectionY + layout.conditionsY + i * progressText.requirementLineHeight));
  });
  if (alternatives.placements.length) {
    setFont(ctx, 24, true); ctx.fillStyle = colors.ink;
    ctx.fillText('Other encounter options', sheetMargin, alternatives.headingY);
    alternatives.placements.forEach(({ group, x, y }) => drawTextBlocks(ctx, group.blocks, images, x, y));
  }
  drawSheetNotes(ctx, notes, bottom, colors.weak);
  return pngBlob(canvas);
}
