/** Type colors for the exported team sheet. */
export const typeColors: Record<string, string> = {
  normal: 'oklch(0.84 0.025 80)',
  fire: 'oklch(0.8 0.135 40)',
  water: 'oklch(0.8 0.105 240)',
  electric: 'oklch(0.9 0.16 94)',
  grass: 'oklch(0.82 0.13 135)',
  ice: 'oklch(0.88 0.075 200)',
  fighting: 'oklch(0.8 0.105 65)',
  poison: 'oklch(0.8 0.1 315)',
  ground: 'oklch(0.83 0.085 65)',
  flying: 'oklch(0.84 0.07 260)',
  psychic: 'oklch(0.82 0.115 355)',
  bug: 'oklch(0.86 0.135 115)',
  rock: 'oklch(0.83 0.06 90)',
  ghost: 'oklch(0.79 0.085 290)',
  dragon: 'oklch(0.79 0.105 280)',
  dark: 'oklch(0.77 0.035 320)',
  steel: 'oklch(0.85 0.04 225)',
  fairy: 'oklch(0.86 0.09 345)',
};

export function typeColor(type: string): string {
  const color = typeColors[type];
  if (!color) throw new Error(`Missing type color: ${type}`);
  return color;
}

