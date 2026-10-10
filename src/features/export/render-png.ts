import type { TeamExport } from './export-model';

const width = 1200;
const margin = 40;
const gap = 20;
const cardWidth = 360;
const font = "'Segoe UI', system-ui, sans-serif";
const colors = {
  background: 'oklch(0.985 0.004 160)', tile: 'oklch(0.955 0.01 160)',
  ink: 'oklch(0.25 0.025 160)', muted: 'oklch(0.47 0.022 160)',
  weak: 'oklch(0.5 0.15 30)', resist: 'oklch(0.45 0.11 155)',
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load export image: ${src}`));
    image.src = src;
  });
}

function setFont(ctx: CanvasRenderingContext2D, size = 18, bold = false) {
  ctx.font = `${bold ? 600 : 400} ${size}px ${font}`;
}

function wrap(ctx: CanvasRenderingContext2D, value: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of value.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function panel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = colors.tile;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 16); ctx.fill();
}

/** Render a separate, fixed-width sheet, independent of the visible page layout. */
export async function renderTeamPng(model: TeamExport): Promise<Blob> {
  await document.fonts.ready;
  const urls = new Set(model.slots.flatMap(slot => [
    ...(slot.dex === null ? [] : [`/pokemon/${slot.dex}.png`]),
    ...slot.types.map(type => `/types/${type}.svg`),
  ]));
  model.defense.forEach(row => urls.add(`/types/${row.type}.svg`));
  const images = new Map(await Promise.all([...urls].map(async url => [url, await loadImage(url)] as const)));
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('The browser could not create the PNG.');
  setFont(ctx);
  const subtitle = wrap(ctx, model.subtitle, width - margin * 2);
  const top = 104 + subtitle.length * 26;
  const slotLines = model.slots.map(slot => slot.details.flatMap(detail => wrap(ctx, detail, cardWidth - 40)));
  const rowHeights = [0, 1].map(row => Math.max(...model.slots.slice(row * 3, row * 3 + 3).map((slot, i) =>
    (slot.status ? 252 : 206) + slotLines[row * 3 + i].length * 26)));
  const teamBottom = top + rowHeights[0] + gap + rowHeights[1];
  const analysisHeight = model.defense.length ? 520 : 0;
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
      ctx.drawImage(images.get(`/pokemon/${slot.dex}.png`)!, x + 128, y + 20, 104, 104);
      ctx.imageSmoothingEnabled = true;
    }
    ctx.textAlign = 'center'; ctx.fillStyle = colors.ink; setFont(ctx, 24, true);
    ctx.fillText(slot.name, x + cardWidth / 2, y + 124);
    slot.types.forEach((type, i) => ctx.drawImage(images.get(`/types/${type}.svg`)!, x + cardWidth / 2 - slot.types.length * 18 + i * 36, y + 158, 28, 28));
    ctx.textAlign = 'left'; setFont(ctx);
    if (slot.status) { ctx.fillStyle = colors.muted; ctx.fillText(slot.status, x + 20, y + 198); }
    ctx.fillStyle = colors.ink;
    slotLines[index].forEach((line, i) => ctx.fillText(line, x + 20, y + 232 + i * 26));
  });

  if (model.defense.length) {
    let y = teamBottom + 32;
    ctx.fillStyle = colors.ink; setFont(ctx, 24, true); ctx.fillText('Team defense', margin, y);
    y += 40;
    setFont(ctx, 16); ctx.fillStyle = colors.muted;
    ctx.fillText('Damage received · Team slots 1–6, left to right · — Empty slot', margin, y);
    y += 34;
    model.defense.forEach((row, i) => {
      const x = margin + (i % 3) * (cardWidth + gap);
      const rowY = y + Math.floor(i / 3) * 46;
      ctx.drawImage(images.get(`/types/${row.type}.svg`)!, x, rowY, 28, 28);
      setFont(ctx, 16, true); ctx.fillStyle = colors.ink;
      ctx.fillText(row.type[0].toUpperCase() + row.type.slice(1), x + 38, rowY + 5);
      row.multipliers.forEach((value, index) => {
        ctx.fillStyle = value !== null && value > 1 ? colors.weak : value !== null && value < 1 ? colors.resist : colors.muted;
        ctx.fillText(value === null ? '—' : `${value}×`, x + 126 + index * 38, rowY + 5);
      });
    });
    y += Math.ceil(model.defense.length / 3) * 46 + 20;
    setFont(ctx, 24, true); ctx.fillStyle = colors.ink;
    ctx.fillText(`Attack coverage · ${model.coverage.length} / ${model.defense.length}`, margin, y);
    y += 40;
    model.defense.forEach((row, index) => {
      ctx.globalAlpha = model.coverage.includes(row.type) ? 1 : 0.25;
      ctx.drawImage(images.get(`/types/${row.type}.svg`)!, margin + index * 54, y, 36, 36);
    });
    ctx.globalAlpha = 1; setFont(ctx, 16); ctx.fillStyle = colors.muted;
    ctx.fillText('Full colour: super-effective attack coverage · Faded: no coverage', margin, y + 48);
  }
  setFont(ctx); ctx.fillStyle = colors.muted;
  noteLines.forEach((line, i) => ctx.fillText(line, margin, teamBottom + analysisHeight + 40 + i * 26));
  return new Promise((resolve, reject) => canvas.toBlob(blob => {
    if (blob) resolve(blob); else reject(new Error('The browser could not save the PNG.'));
  }, 'image/png'));
}

export function downloadPng(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
