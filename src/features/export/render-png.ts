import type { TeamExport } from './export-model';
import { colors, pngBlob, setFont, wrap } from './canvas-tools';
import { renderProgressPng } from './render-progress';
import { renderTeamAnalysis, teamAnalysisHeight } from './render-team-analysis';
import { drawSheetCredit, drawSheetHeading, drawSheetNotes, posterGap, posterWidth,
  sheetCreditHeight, sheetHeadingHeight, sheetMargin as margin, sheetWidth as width } from './render-poster';
import { drawTeamPoster } from './render-team-poster';
import { teamPosterLayout } from './team-poster-layout';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load export image: ${src}`));
    image.src = src;
  });
}

/** Render a separate, fixed-width sheet, independent of the visible page layout. */
export async function renderTeamPng(model: TeamExport): Promise<Blob> {
  await document.fonts.ready;
  const urls = new Set(model.slots.flatMap(slot => [
    ...(slot.spriteSrc === null ? [] : [slot.spriteSrc]),
    ...slot.types.map(type => model.kind === 'progress' ? `/type-symbols/${type}.svg` : `/types/${type}.svg`),
    ...(slot.progress?.stages.map(stage => stage.spriteSrc) ?? []),
    ...(slot.progress?.methodIconSrc ? [slot.progress.methodIconSrc] : []),
    ...(slot.progress?.routeOptions.flatMap(option => option.methodIconSrc ? [option.methodIconSrc] : []) ?? []),
  ]));
  urls.add(model.logoSrc);
  model.defense.forEach(row => urls.add(`/types/${row.type}.svg`));
  const images = new Map(await Promise.all([...urls].map(async url => [url, await loadImage(url)] as const)));
  if (model.kind === 'progress') return renderProgressPng(model, images);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('The browser could not create the PNG.');
  const top = sheetHeadingHeight(ctx, model);
  const imageHeight = Math.max(...model.slots.map(slot => teamPosterLayout(ctx, slot).height));
  const teamBottom = top + imageHeight * 2 + posterGap;
  const analysisHeight = teamAnalysisHeight(ctx, model);
  setFont(ctx, 18);
  const noteLines = model.notes.flatMap(note => wrap(ctx, note, width - margin * 2));
  const creditY = teamBottom + analysisHeight + 40 + noteLines.length * 26 + 24;
  const height = creditY + sheetCreditHeight(ctx) + margin;
  canvas.width = width * 2; canvas.height = Math.ceil(height) * 2;
  ctx.scale(2, 2);
  ctx.textBaseline = 'top';
  ctx.fillStyle = colors.background; ctx.fillRect(0, 0, width, height);
  drawSheetHeading(ctx, model, images);

  model.slots.forEach((slot, index) => {
    const row = Math.floor(index / 3);
    const x = margin + index % 3 * (posterWidth + posterGap);
    const y = top + row * (imageHeight + posterGap);
    drawTeamPoster(ctx, slot, index, images, x, y, imageHeight);
  });

  renderTeamAnalysis(ctx, model, images, teamBottom);
  drawSheetNotes(ctx, noteLines, teamBottom + analysisHeight + 40);
  drawSheetCredit(ctx, creditY);
  return pngBlob(canvas);
}

export function downloadPng(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
