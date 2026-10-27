const font = "'Segoe UI', system-ui, sans-serif";
export const colors = {
  background: 'oklch(0.985 0.004 160)', tile: 'oklch(0.955 0.01 160)',
  ink: 'oklch(0.25 0.025 160)', muted: 'oklch(0.47 0.022 160)',
  detail: 'oklch(0.36 0.022 160)',
  weak: 'oklch(0.5 0.15 30)', resist: 'oklch(0.45 0.11 155)',
  strongWeak: 'oklch(0.38 0.13 30)', strongResist: 'oklch(0.34 0.085 155)',
  immune: 'oklch(0.43 0.12 250)',
};

export function setFont(ctx: CanvasRenderingContext2D, size = 18, bold = false) {
  ctx.font = `${bold ? 600 : 400} ${size}px ${font}`;
}

export function wrap(ctx: CanvasRenderingContext2D, value: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of value.split(/\s+/)) {
    if (!word) continue;
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) { line = next; continue; }
    if (line) { lines.push(line); line = ''; }
    // Form names and conditions can contain a single word wider than a column.
    for (const character of word) {
      if (line && ctx.measureText(line + character).width > maxWidth) {
        lines.push(line); line = '';
      }
      line += character;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function panel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = colors.tile;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 16); ctx.fill();
}

export function pngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(blob => {
    if (blob) resolve(blob); else reject(new Error('The browser could not save the PNG.'));
  }, 'image/png'));
}
