import type { TeamExport } from './export-model';
import { colors, panel, pngBlob, setFont, wrap } from './canvas-tools';
import { renderProgressPng } from './render-progress';
import { renderTeamAnalysis, teamAnalysisHeight } from './render-team-analysis';

const width = 1200;
const margin = 40;
const gap = 20;
const cardWidth = 360;

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
    ...slot.types.map(type => `/types/${type}.svg`),
    ...(slot.progress?.stages.map(stage => stage.spriteSrc) ?? []),
    ...(slot.progress?.methodIconSrc ? [slot.progress.methodIconSrc] : []),
    ...(slot.progress?.routeOptions.flatMap(option => option.methodIconSrc ? [option.methodIconSrc] : []) ?? []),
  ]));
  model.defense.forEach(row => urls.add(`/types/${row.type}.svg`));
  const images = new Map(await Promise.all([...urls].map(async url => [url, await loadImage(url)] as const)));
  if (model.kind === 'progress') return renderProgressPng(model, images);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('The browser could not create the PNG.');
  setFont(ctx);
  const subtitle = wrap(ctx, model.subtitle, width - margin * 2);
  const top = 104 + subtitle.length * 26;
  const rowHeights = [142, 142];
  const teamBottom = top + rowHeights[0] + gap + rowHeights[1];
  const analysisHeight = teamAnalysisHeight(model);
  const noteLines = model.notes.flatMap(note => wrap(ctx, note, width - margin * 2));
  const height = teamBottom + analysisHeight + 40 + noteLines.length * 26 + margin;
  canvas.width = width * 2; canvas.height = height * 2;
  ctx.scale(2, 2);
  ctx.textBaseline = 'top';
  ctx.fillStyle = colors.background; ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = colors.ink; setFont(ctx, 32, true); ctx.fillText(model.title, margin, 36);
  setFont(ctx); ctx.fillStyle = colors.muted;
  subtitle.forEach((line, i) => ctx.fillText(line, margin, 84 + i * 26));

  model.slots.forEach((slot, index) => {
    const row = Math.floor(index / 3);
    const x = margin + index % 3 * (cardWidth + gap);
    const y = top + (row ? rowHeights[0] + gap : 0);
    panel(ctx, x, y, cardWidth, rowHeights[row]);
    setFont(ctx, 16); ctx.fillStyle = colors.muted; ctx.fillText(`Slot ${index + 1}`, x + 20, y + 16);
    if (slot.dex !== null) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(images.get(slot.spriteSrc!)!, x + 16, y + 48, 80, 80);
      ctx.imageSmoothingEnabled = true;
    }
    ctx.fillStyle = colors.ink; setFont(ctx, 24, true);
    ctx.fillText(slot.name, x + 112, y + 54);
    slot.types.forEach((type, i) => ctx.drawImage(images.get(`/types/${type}.svg`)!, x + 112 + i * 36, y + 92, 28, 28));
    ctx.textAlign = 'left'; setFont(ctx);
  });

  renderTeamAnalysis(ctx, model, images, teamBottom);
  setFont(ctx); ctx.fillStyle = colors.muted;
  noteLines.forEach((line, i) => ctx.fillText(line, margin, teamBottom + analysisHeight + 40 + i * 26));
  return pngBlob(canvas);
}

export function downloadPng(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
