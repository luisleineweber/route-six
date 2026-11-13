import type { ExportSlot } from './export-model';
import type { ExportImages } from './render-poster';
import { exportImage, posterWidth } from './render-poster';
import { colors, setFont } from './canvas-tools';
import { drawStatChart, statChartColors } from './render-stat-chart';
import { fitTeamSprite, spriteBounds, teamCard, teamPosterLayout } from './team-poster-layout';

/** Team export only. Progress exports retain drawPokemonPoster and type backgrounds. */
export function drawTeamPoster(ctx: CanvasRenderingContext2D, slot: ExportSlot, index: number,
  images: ExportImages, x: number, y: number, height: number) {
  const layout = teamPosterLayout(ctx, slot);
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, posterWidth, height, 12); ctx.clip();
  ctx.fillStyle = 'oklch(0.995 0 0)'; ctx.fillRect(x, y, posterWidth, height);
  ctx.fillStyle = 'oklch(0.86 0 0 / 0.45)';
  for (let yy = 10; yy < height; yy += 14) {
    for (let xx = 10; xx < posterWidth; xx += 14) {
      ctx.beginPath(); ctx.arc(x + xx, y + yy, 0.6, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.fillStyle = statChartColors.ink; setFont(ctx, 14, true); ctx.fillText(`Slot ${index + 1}`, x + 16, y + 16);
  if (slot.dex !== null) {
    ctx.textAlign = 'right'; setFont(ctx, 14);
    ctx.fillText(`#${String(slot.dex).padStart(3, '0')}`, x + posterWidth - 16, y + 16); ctx.textAlign = 'left';
    const image = exportImage(images, slot.spriteSrc);
    const bounds = spriteBounds(image), box = fitTeamSprite(bounds);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, bounds.x, bounds.y, bounds.width, bounds.height, x + box.x, y + box.y, box.width, box.height);
    ctx.imageSmoothingEnabled = true;
    if (!slot.baseStats) throw new Error(`Missing base stats for ${slot.name}.`);
    drawStatChart(ctx, slot.baseStats, x, y);
  } else {
    ctx.textAlign = 'center'; ctx.fillStyle = colors.muted; setFont(ctx, 96, true);
    ctx.fillText('?', x + 81, y + 65); ctx.textAlign = 'left';
  }
  ctx.fillStyle = statChartColors.ink; setFont(ctx, 24, true);
  layout.name.forEach((line, i) => ctx.fillText(line, x + 16, y + teamCard.nameY + i * teamCard.nameLineHeight));
  slot.types.forEach((type, i) => {
    const yy = y + layout.typeY + i * 20;
    ctx.drawImage(exportImage(images, `/types/${type}.svg`), x + 16, yy, 18, 18);
    setFont(ctx, 13); ctx.fillText(type[0].toUpperCase() + type.slice(1), x + 41, yy + 1);
  });
  ctx.restore();
}
