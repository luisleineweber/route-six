import { describe, expect, it } from 'vitest';
import type { TeamExport } from '../src/features/export/export-model';
import { renderTeamAnalysis } from '../src/features/export/render-team-analysis';
import { drawSheetCredit, sheetLogoSrc } from '../src/features/export/render-poster';

function recordingContext() {
  const texts: { value: string; x: number; y: number }[] = [];
  const images: { src: string; box: number[] }[] = [];
  const noop = () => {};
  const ctx = {
    font: '400 16px sans-serif', fillStyle: '', textAlign: 'left',
    beginPath: noop, roundRect: noop, fill: noop,
    measureText: (text: string) => ({ width: text.length * 9 }),
    fillText: (value: string, x: number, y: number) => texts.push({ value, x, y }),
    drawImage: (image: HTMLImageElement, ...box: number[]) => images.push({ src: image.src, box }),
  } as unknown as CanvasRenderingContext2D;
  return { ctx, texts, images };
}

const types = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground',
  'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel'];

describe('Team PNG coverage and credit', () => {
  it('shows the coverage count once and fits fifteen covered types in two rows', () => {
    const { ctx, texts } = recordingContext();
    const covered = types.filter(type => type !== 'psychic' && type !== 'ghost');
    const model = { slots: [{ name: 'Swampert' }], defense: types.map(type => ({ type, multipliers: [1] })), coverage: covered } as unknown as TeamExport;
    const images = new Map(types.map(type => [`/types/${type}.svg`, { src: type } as HTMLImageElement]));
    renderTeamAnalysis(ctx, model, images, 0);
    const values = texts.map(text => text.value);
    expect(values.filter(value => /\d+ \/ \d+/.test(value))).toEqual(['Attack coverage · 15 / 17']);
    expect(values).toContain('Hit super-effectively');
    expect(values).toContain('Not hit super-effectively');
    expect(values.some(value => /effectively · \d/.test(value))).toBe(false);
    expect(values).toContain('From each Pokémon’s own types. Abilities, items, and moves are not included.');
    const groupTop = texts.find(text => text.value === 'Hit super-effectively')!.y;
    const coveredRows = new Set(texts.filter(text => text.y > groupTop && covered.some(type => text.value.toLowerCase() === type)).map(text => text.y));
    expect(coveredRows.size).toBe(2);
  });

  it('draws the Route Six logo beside the site name', () => {
    const { ctx, texts, images } = recordingContext();
    drawSheetCredit(ctx, new Map([[sheetLogoSrc, { src: sheetLogoSrc } as HTMLImageElement]]), 100);
    const [logo] = images;
    expect(logo.src).toBe(sheetLogoSrc);
    const name = texts.find(text => text.value === 'Made with Route Six')!;
    expect(name.x).toBeGreaterThan(logo.box[0] + logo.box[2]);
    expect(name.y).toBeGreaterThanOrEqual(logo.box[1]);
    expect(name.y).toBeLessThan(logo.box[1] + logo.box[3]);
  });
});
