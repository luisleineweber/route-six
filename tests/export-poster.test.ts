import { describe, expect, it } from 'vitest';
import { drawPokemonPoster, posterWidth } from '../src/features/export/render-poster';

describe('PNG type backgrounds', () => {
  it('splits dual types diagonally into equal areas without repeated type circles', () => {
    const polygons: number[][][] = [];
    const lines: number[][][] = [];
    const imagesDrawn: { src: string; box: number[] }[] = [];
    const noop = () => {};
    let points: number[][] = [];
    const ctx = { save: noop, restore: noop, roundRect: noop, clip: noop,
      beginPath: () => { points = []; }, moveTo: (...point: number[]) => points.push(point),
      lineTo: (...point: number[]) => points.push(point), closePath: noop,
      fill: () => polygons.push(points), stroke: () => lines.push(points), fillText: noop, fillRect: noop,
      measureText: (text: string) => ({ width: text.length * 10 }),
      drawImage: (image: HTMLImageElement, ...box: number[]) => imagesDrawn.push({ src: image.src, box }),
    } as unknown as CanvasRenderingContext2D;
    const images = new Map(['/pokemon/260.png', '/type-symbols/water.svg', '/type-symbols/ground.svg']
      .map(src => [src, { src } as HTMLImageElement]));
    drawPokemonPoster(ctx, { name: 'Swampert', dex: 260, spriteSrc: '/pokemon/260.png', types: ['water', 'ground'], progress: null }, 0, images, 0, 0);
    expect(polygons).toHaveLength(2);
    const height = Math.max(...polygons.flat().map(point => point[1]));
    expect(polygons).toEqual([
      [[0, 0], [posterWidth, 0], [0, height]],
      [[posterWidth, 0], [posterWidth, height], [0, height]],
    ]);
    expect(lines).toEqual([[[posterWidth, 0], [0, height]]]);
    const symbols = imagesDrawn.filter(image => image.src.includes('type-symbols'));
    expect(symbols).toHaveLength(2);
    symbols.forEach(({ box: [x, y, width, symbolHeight] }, index) => {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x + width).toBeLessThanOrEqual(posterWidth);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y + symbolHeight).toBeLessThanOrEqual(218);
      if (index === 0) expect((x + width) / posterWidth + (y + symbolHeight) / height).toBeLessThanOrEqual(1);
      else expect(x / posterWidth + y / height).toBeGreaterThanOrEqual(1);
    });
    expect(imagesDrawn.some(image => image.src.startsWith('/types/'))).toBe(false);
  });
});
