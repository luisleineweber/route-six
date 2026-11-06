import type { ExportSlot, TeamExport } from './export-model';
import { colors, setFont, wrap } from './canvas-tools';
import { typeColor } from './type-colors';

export const sheetWidth = 1200;
export const sheetMargin = 40;
export const posterGap = 24;
export const posterWidth = (sheetWidth - sheetMargin * 2 - posterGap * 2) / 3;
export type ExportImages = Map<string, HTMLImageElement>;
const headingTextX = sheetMargin + 264;
const headingTitleSize = 52;
const headingTitleLineHeight = 60;

function sheetHeadingLayout(ctx: CanvasRenderingContext2D, model: TeamExport) {
  const textWidth = sheetWidth - headingTextX - sheetMargin;
  setFont(ctx, headingTitleSize, true);
  const title = wrap(ctx, model.title, textWidth);
  setFont(ctx, 19);
  const subtitle = wrap(ctx, model.subtitle, textWidth);
  const subtitleY = 26 + title.length * headingTitleLineHeight + 10;
  return { title, subtitle, subtitleY, height: Math.max(152, subtitleY + subtitle.length * 26 + 24) };
}

export function sheetHeadingHeight(ctx: CanvasRenderingContext2D, model: TeamExport) {
  return sheetHeadingLayout(ctx, model).height;
}

export function drawSheetHeading(ctx: CanvasRenderingContext2D, model: TeamExport, images: ExportImages) {
  const layout = sheetHeadingLayout(ctx, model);
  const logo = images.get(model.logoSrc)!;
  const scale = Math.min(232 / logo.naturalWidth, 100 / logo.naturalHeight);
  const width = logo.naturalWidth * scale;
  const height = logo.naturalHeight * scale;
  ctx.drawImage(logo, sheetMargin + (232 - width) / 2, 24 + (100 - height) / 2, width, height);
  ctx.fillStyle = colors.ink; setFont(ctx, headingTitleSize, true);
  layout.title.forEach((line, index) => ctx.fillText(line, headingTextX, 26 + index * headingTitleLineHeight));
  setFont(ctx, 19); ctx.fillStyle = colors.muted;
  layout.subtitle.forEach((line, index) => ctx.fillText(line, headingTextX, layout.subtitleY + index * 26));
}

export function posterHeight(ctx: CanvasRenderingContext2D, slot: ExportSlot, width = posterWidth) {
  setFont(ctx, 28, true);
  return 234 + wrap(ctx, slot.name, width - 40).length * 34;
}

export function drawPokemonPoster(ctx: CanvasRenderingContext2D, slot: ExportSlot, index: number, images: ExportImages, x: number, y: number, width = posterWidth, height = posterHeight(ctx, slot, width)) {
  ctx.save();
  ctx.beginPath(); ctx.roundRect(x, y, width, height, 12); ctx.clip();
  if (!slot.types.length) { ctx.fillStyle = colors.tile; ctx.fillRect(x, y, width, height); }
  slot.types.forEach((type, i) => {
    ctx.fillStyle = typeColor(type);
    if (slot.types.length === 1) ctx.fillRect(x, y, width, height);
    else {
      ctx.beginPath(); ctx.moveTo(x + (i ? width : 0), y);
      ctx.lineTo(x + width, y + (i ? height : 0));
      ctx.lineTo(x, y + height); ctx.closePath(); ctx.fill();
    }
  });
  slot.types.forEach((type, i) => {
    ctx.globalAlpha = 0.4;
    const size = 88;
    const iconX = i ? x + width - size - 12 : x + 12;
    const iconY = i ? height * 0.39 : 44;
    ctx.drawImage(images.get(`/type-symbols/${type}.svg`)!, iconX, y + iconY, size, size);
    ctx.globalAlpha = 1;
  });
  ctx.globalAlpha = 1;
  ctx.fillStyle = colors.ink; setFont(ctx, 16, true);
  ctx.fillText(`Slot ${index + 1}`, x + 20, y + 18);
  if (slot.dex !== null) {
    ctx.textAlign = 'right'; setFont(ctx, 16);
    ctx.fillText(`Dex #${String(slot.dex).padStart(3, '0')}`, x + width - 20, y + 18);
    ctx.textAlign = 'left';
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(images.get(slot.spriteSrc!)!, x + (width - 152) / 2, y + 34, 152, 152);
    ctx.imageSmoothingEnabled = true;
  } else {
    ctx.textAlign = 'center'; setFont(ctx, 96, true); ctx.fillStyle = colors.muted;
    ctx.fillText('?', x + width / 2, y + 66); ctx.textAlign = 'left';
  }
  ctx.fillStyle = colors.ink; setFont(ctx, 28, true);
  const names = wrap(ctx, slot.name, width - 40);
  names.forEach((line, i) => ctx.fillText(line, x + 20, y + height - 68 - (names.length - 1 - i) * 34));
  const typeY = y + height - 32;
  setFont(ctx, 16);
  ctx.fillText(slot.types.map(type => type[0].toUpperCase() + type.slice(1)).join(' · '), x + 20, typeY);
  ctx.restore();
}

export function drawSheetNotes(ctx: CanvasRenderingContext2D, lines: string[], y: number, color = colors.muted) {
  setFont(ctx, 18); ctx.fillStyle = color;
  lines.forEach((line, index) => ctx.fillText(line, sheetMargin, y + index * 26));
}

function sheetSiteLines(ctx: CanvasRenderingContext2D) {
  const siteUrl = import.meta.env.VITE_SITE_URL?.trim();
  setFont(ctx, 18);
  return wrap(ctx, siteUrl?.replace(/^https?:\/\//, '').replace(/\/$/, '') ?? '', sheetWidth - sheetMargin * 2);
}

export function sheetCreditHeight(ctx: CanvasRenderingContext2D) {
  return 44 + sheetSiteLines(ctx).length * 24;
}

export function drawSheetCredit(ctx: CanvasRenderingContext2D, y: number) {
  const siteLines = sheetSiteLines(ctx);
  ctx.fillStyle = colors.ink; setFont(ctx, 20, true);
  ctx.fillText('Made with Route Six', sheetMargin, y);
  ctx.fillStyle = colors.muted; setFont(ctx, 18);
  siteLines.forEach((line, index) => ctx.fillText(line, sheetMargin, y + 28 + index * 24));
}
