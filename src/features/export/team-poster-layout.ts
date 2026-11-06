import type { ExportSlot } from './export-model';
import { setFont, wrap } from './canvas-tools';

export interface SpriteBounds { x: number; y: number; width: number; height: number }

export const teamCard = { minimumHeight: 268, nameY: 191, nameWidth: 138, nameLineHeight: 26 };

export function teamPosterLayout(ctx: CanvasRenderingContext2D, slot: ExportSlot) {
  setFont(ctx, 24, true);
  const name = wrap(ctx, slot.name, teamCard.nameWidth);
  const typeY = teamCard.nameY + name.length * teamCard.nameLineHeight + 7;
  return { name, typeY, height: Math.max(teamCard.minimumHeight, typeY + slot.types.length * 20 + 4) };
}

/** Fit the visible pixels, including wide wings, within the reserved sprite area. */
export function fitTeamSprite(bounds: SpriteBounds): SpriteBounds {
  const scale = Math.min(2.4, 138 / bounds.width, 140 / bounds.height);
  const width = Math.floor(bounds.width * scale), height = Math.floor(bounds.height * scale);
  return { x: 12 + Math.floor((138 - width) / 2), y: 44 + Math.floor((140 - height) / 2), width, height };
}

const boundsCache = new WeakMap<HTMLImageElement, SpriteBounds>();

export function spriteBounds(image: HTMLImageElement): SpriteBounds {
  const cached = boundsCache.get(image);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('The browser could not measure the Pokémon sprite.');
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let left = canvas.width, top = canvas.height, right = -1, bottom = -1;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (pixels[(y * canvas.width + x) * 4 + 3] === 0) continue;
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  if (right < 0) throw new Error(`The Pokémon sprite is empty: ${image.src}`);
  const bounds = { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
  boundsCache.set(image, bounds);
  return bounds;
}
