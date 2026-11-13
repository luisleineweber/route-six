import { describe, expect, it } from 'vitest';
import { dataset } from './local-data';
import { typeColors } from '../src/features/export/type-colors';

/** Distance in OKLab, from an oklch() colour string. */
function oklab(color: string) {
  const [lightness, chroma, hue] = color.match(/[\d.]+/g)!.map(Number);
  const angle = hue * Math.PI / 180;
  return [lightness, chroma * Math.cos(angle), chroma * Math.sin(angle)];
}

describe('PNG type colours', () => {
  it('keeps both halves of every real dual-type card visibly different', () => {
    const pairs = new Set<string>();
    for (const game of dataset.games) for (const profile of game.profiles) {
      if (profile.types.length === 2) pairs.add([...profile.types].sort().join('/'));
    }
    const close = [...pairs].filter(pair => {
      const [first, second] = pair.split('/').map(type => oklab(typeColors[type]));
      return Math.hypot(first[0] - second[0], first[1] - second[1], first[2] - second[2]) < 0.06;
    });
    expect(close).toEqual([]);
  });
});
