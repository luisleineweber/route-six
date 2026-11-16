import { describe, expect, it } from 'vitest';
import type { ExportSlot } from '../src/features/export/export-model';
import { layoutProgressContent, layoutProgressAlternatives, layoutProgressAlternativesSection, layoutProgressRows, progressText } from '../src/features/export/progress-layout';
import { posterHeight, posterWidth } from '../src/features/export/render-poster';
import { wrap } from '../src/features/export/canvas-tools';
import { drawTextBlocks } from '../src/features/export/render-progress';

function measuringContext() {
  return {
    font: '400 18px sans-serif',
    measureText(text: string) {
      const size = Number(this.font.match(/(\d+)px/)![1]);
      return { width: Array.from(text).length * size * 0.6 };
    },
  } as CanvasRenderingContext2D;
}

const slot: ExportSlot = {
  name: 'Flygon', dex: 330, spriteSrc: '/pokemon/330.png', types: ['ground', 'dragon'],
  progress: {
    location: 'Route 111', method: 'Grass', methodIconSrc: '/methods/grass.svg',
    acquisition: ['Catch Trapinch in the desert.'], missingSource: null, availableLater: false,
    routeOptions: [{ location: 'Mirage Tower and fossil choice', sourceName: 'Trapinch', method: 'Grass', methodIconSrc: '/methods/grass.svg', evolutionNotes: [] }],
    stages: [
      { name: 'Trapinch', dex: 328, spriteSrc: '/pokemon/328.png', requirement: null, conditions: [] },
      { name: 'Vibrava', dex: 329, spriteSrc: '/pokemon/329.png', requirement: 'Lv. 35', conditions: [] },
      { name: 'Flygon', dex: 330, spriteSrc: '/pokemon/330.png', requirement: 'Lv. 45', conditions: ['Keep this condition in the export.'] },
    ],
  },
};

describe('PNG export text layout', () => {
  it('prints each joining note once and only for visible extra catches', () => {
    const option = slot.progress!.routeOptions[0];
    const note = 'Oddish → Gloom · Lv. 21';
    const withNotes = { ...slot, progress: { ...slot.progress!, routeOptions: [
      { ...option, evolutionNotes: [note] }, { ...option, evolutionNotes: [note] },
      { ...option, evolutionNotes: ['Do not show a hidden catch note.'] },
    ] } };
    const layout = layoutProgressAlternatives(measuringContext(), withNotes, 0, posterWidth - 32)!;
    const text = layout.blocks.flatMap(block => block.lines).join(' ');
    expect(text.split(note)).toHaveLength(2);
    expect(text).not.toContain('hidden catch note');
  });
  it('raises encounter icons to the first text line without shifting wrapped text', () => {
    const images: number[][] = [];
    const text: (string | number)[][] = [];
    const ctx = { drawImage: (_image: HTMLImageElement, ...box: number[]) => images.push(box),
      fillText: (...args: (string | number)[]) => text.push(args),
    } as unknown as CanvasRenderingContext2D;
    drawTextBlocks(ctx, [{ y: 30, size: 17, bold: false, color: '#000',
      lines: ['Seedot · Grass', 'A second line'], lineHeight: 24, iconSrc: '/methods/grass.svg', indent: 28 }],
    new Map([['/methods/grass.svg', {} as HTMLImageElement]]), 40, 100);
    expect(images).toEqual([[40, 127, 20, 20]]);
    expect(text).toEqual([['Seedot · Grass', 68, 130], ['A second line', 68, 154]]);
  });
  it('keeps long words inside narrow columns without losing text', () => {
    const ctx = measuringContext();
    const value = 'A VeryLongUnbrokenFormName followed by text';
    const lines = wrap(ctx, value, 90);
    expect(lines.join('').replaceAll(' ', '')).toBe(value.replaceAll(' ', ''));
    expect(lines.every(line => ctx.measureText(line).width <= 90)).toBe(true);
    expect(wrap(ctx, '', 90)).toEqual([]);
  });

  it('shrinks evolution names before it splits a name inside a word', () => {
    const ctx = measuringContext();
    const stage = (name: string, dex: number) => ({ name, dex, spriteSrc: `/pokemon/${dex}.png`, requirement: null, conditions: [] });
    const charizard = { ...slot, progress: { ...slot.progress!, routeOptions: [],
      stages: [stage('Charmander', 4), stage('Charmeleon', 5), stage('Charizard', 6)] } };
    const layout = layoutProgressContent(ctx, charizard, posterWidth - 32);
    expect(layout.names).toEqual([['Charmander'], ['Charmeleon'], ['Charizard']]);
    expect(layout.stageNameSize).toBeLessThan(progressText.stageName);
    expect(layoutProgressContent(ctx, slot, posterWidth - 32).stageNameSize).toBe(progressText.stageName);
  });

  it('keeps one left edge for method lines with and without an icon, and labels later members', () => {
    const ctx = measuringContext();
    const starter = { ...slot, progress: { ...slot.progress!, method: 'Starter', methodIconSrc: null, availableLater: true } };
    const withIcon = layoutProgressContent(ctx, slot, posterWidth - 32).blocks.find(block => block.lines[0]?.includes('· Grass'))!;
    const layout = layoutProgressContent(ctx, starter, posterWidth - 32);
    const withoutIcon = layout.blocks.find(block => block.lines[0]?.includes('· Starter'))!;
    expect(withoutIcon.indent).toBe(withIcon.indent);
    expect(withoutIcon.iconSrc).toBeNull();
    expect(layout.blocks.find(block => block.lines[0]?.startsWith('Catch Trapinch'))!.indent).toBe(withIcon.indent);
    expect(layout.blocks[0].lines).toEqual(['Available later']);
  });

  it('measures every source and evolution condition within the export column', () => {
    const ctx = measuringContext();
    const width = posterWidth - 32;
    const layout = layoutProgressContent(ctx, slot, width);
    const alternatives = layoutProgressAlternatives(ctx, slot, 0, width)!;
    expect(alternatives.blocks.flatMap(block => block.lines).join(' ')).toContain('Mirage Tower and fossil choice');
    expect(layout.conditions.join(' ')).toContain('Flygon: Keep this condition in the export.');
    for (const block of [...layout.blocks, ...layout.evolutionBlocks, ...alternatives.blocks]) {
      ctx.font = `400 ${block.size}px sans-serif`;
      expect(block.lines.every(line => ctx.measureText(line).width <= width - block.indent)).toBe(true);
    }
    expect(layout.blocks.every(block => block.y + block.lines.length * block.lineHeight <= layout.sourceHeight)).toBe(true);
    expect(layout.conditionsY).toBeGreaterThanOrEqual(layout.evolutionY + 80 + layout.nameHeight + 8 + 23);
    expect(layout.height).toBe(layout.sourceHeight + 18 + layout.conditionsY + layout.conditions.length * progressText.requirementLineHeight);
  });

  it('limits extra places and reports the rest with bounded grid height', () => {
    const short = layoutProgressAlternatives(measuringContext(), slot, 0, posterWidth - 32)!;
    const longSlot = { ...slot, progress: { ...slot.progress!, routeOptions: Array(20).fill(slot.progress!.routeOptions[0]) } };
    const long = layoutProgressAlternatives(measuringContext(), longSlot, 0, posterWidth - 32)!;
    expect(long.height).toBeGreaterThan(short.height);
    expect(long.blocks).toHaveLength(6);
    expect(long.blocks.flatMap(block => block.lines).join(' ')).toContain('18 more locations in the planner.');
    const longerSlot = { ...slot, progress: { ...slot.progress!, routeOptions: Array(200).fill(slot.progress!.routeOptions[0]) } };
    expect(layoutProgressAlternativesSection(measuringContext(), Array(6).fill(longerSlot), 160).bottom)
      .toBe(layoutProgressAlternativesSection(measuringContext(), Array(6).fill(longSlot), 160).bottom);
    expect(layoutProgressRows(measuringContext(), Array(6).fill(longSlot), 160).bottom)
      .toBe(layoutProgressRows(measuringContext(), Array(6).fill(slot), 160).bottom);
  });

  it('keeps unavailable reasons and empty slots separate from evolution', () => {
    const unavailable = { ...slot, progress: { ...slot.progress!, location: null, stages: [], routeOptions: [],
      missingSource: { title: 'Requirements not met', explanation: 'The current level limit prevents this evolution.' } } };
    const layout = layoutProgressContent(measuringContext(), unavailable, posterWidth - 32);
    expect(layout.blocks.flatMap(block => block.lines).join(' ')).toContain('The current level limit prevents this evolution.');
    expect(layout.stages).toEqual([]);
    const empty = { name: 'Empty slot', dex: null, spriteSrc: null, types: [], progress: null };
    expect(layoutProgressContent(measuringContext(), empty, posterWidth - 32).height).toBe(0);
  });

  it('grows the colored image area when a form name takes more than one line', () => {
    const ctx = measuringContext();
    expect(posterHeight(ctx, { ...slot, name: 'A very long Pokémon form name' })).toBeGreaterThan(posterHeight(ctx, slot));
  });

  it('aligns both rows and their sections with different source lengths and form names', () => {
    const shortSlot = { ...slot, progress: { ...slot.progress!, acquisition: [], stages: [slot.progress!.stages[0]] } };
    const longSlot = { ...slot, name: 'A very long Pokémon form name',
      progress: { ...slot.progress!, acquisition: ['A longer source instruction that must wrap to several lines in this column.'] } };
    const empty = { name: 'Empty slot', dex: null, spriteSrc: null, types: [], progress: null };
    const grid = layoutProgressRows(measuringContext(), [slot, shortSlot, longSlot, empty, slot, shortSlot], 160);
    expect(new Set(grid.placements.map(cell => cell.imageHeight)).size).toBe(1);
    for (const row of [grid.placements.slice(0, 3), grid.placements.slice(3)]) {
      expect(new Set(row.map(cell => cell.y)).size).toBe(1);
      expect(new Set(row.map(cell => cell.sourceY)).size).toBe(1);
      expect(new Set(row.map(cell => cell.evolutionY)).size).toBe(1);
    }
    const firstBottom = Math.max(...grid.placements.slice(0, 3).map(cell => cell.evolutionY + cell.layout.evolutionHeight));
    expect(grid.placements[3].y).toBe(firstBottom + 40);
  });

  it('keeps one section below the team and labels each group with its original slot', () => {
    const noExtras = { ...slot, progress: { ...slot.progress!, routeOptions: [] } };
    const slots = [noExtras, slot, noExtras, slot, noExtras, slot];
    const grid = layoutProgressRows(measuringContext(), slots, 160);
    const section = layoutProgressAlternativesSection(measuringContext(), slots, grid.bottom);
    expect(section.headingY).toBe(grid.bottom);
    expect(section.placements.map(cell => cell.group.blocks[0].lines.join(' ')))
      .toEqual(['Slot 2 · Flygon', 'Slot 4 · Flygon', 'Slot 6 · Flygon']);
    section.placements.forEach((cell, column) => {
      expect(cell.x).toBe(56 + column * (posterWidth + 24));
      expect(cell.y).toBe(grid.bottom + 44);
      expect(section.bottom).toBeGreaterThanOrEqual(cell.y + cell.group.height);
    });
    expect(layoutProgressAlternativesSection(measuringContext(), Array(6).fill(noExtras), grid.bottom))
      .toMatchObject({ placements: [], bottom: grid.bottom });
  });
});
