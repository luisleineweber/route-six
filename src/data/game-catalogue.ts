import { gameLoaders, progressGameLoaders } from './game-registry';

export interface GameOption {
  id: string;
  name: string;
  generation: number;
  logoSrc: string;
  /** OKLCH hue and chroma of the game colour. The stylesheet sets the lightness for each theme. */
  accent: { hue: number; chroma: number };
}

// Presentation only. A game can be selected after its local dataset is reviewed.
const game = (name: string, hue: number, chroma = 0.15) => ({ name, accent: { hue, chroma } });

const generations = [
  [game('Red', 28), game('Blue', 250), game('Yellow', 98, 0.09)],
  [game('Gold', 83, 0.09), game('Silver', 230, 0.012), game('Crystal', 198, 0.075)],
  [game('Ruby', 25), game('Sapphire', 250), game('Emerald', 155, 0.11), game('FireRed', 32), game('LeafGreen', 140, 0.11)],
  [game('Diamond', 228, 0.09), game('Pearl', 345), game('Platinum', 265, 0.012), game('HeartGold', 84, 0.09), game('SoulSilver', 220, 0.012)],
  [game('Black', 255, 0.012), game('White', 210, 0.008), game('Black 2', 225, 0.09), game('White 2', 205, 0.075)],
  [game('X', 222, 0.09), game('Y', 356), game('Omega Ruby', 27), game('Alpha Sapphire', 249)],
  [game('Sun', 46, 0.11), game('Moon', 268), game('Ultra Sun', 41, 0.11), game('Ultra Moon', 286), game('Let’s Go, Pikachu!', 95, 0.09), game('Let’s Go, Eevee!', 53, 0.1)],
  [game('Sword', 235, 0.1), game('Shield', 355), game('Brilliant Diamond', 226, 0.09), game('Shining Pearl', 342), game('Legends: Arceus', 210, 0.075)],
  [game('Scarlet', 27), game('Violet', 291), game('Legends: Z-A', 194, 0.075)],
];

export const gameCatalogue: GameOption[] = generations.flatMap((games, index) => games.map(({ name, accent }) => {
  const id = name.toLowerCase().replace(/[’!:,]/g, '').replaceAll(' ', '-');
  return { id, name: `Pokémon ${name}`, generation: index + 1, logoSrc: `/games/${id}-logo.png`, accent };
}));

export const gameGroups = generations.map((_, index) => ({
  generation: index + 1,
  games: gameCatalogue.filter(game => game.generation === index + 1),
}));

export function isGameReady(id: string) {
  return Object.hasOwn(gameLoaders, id);
}

export function isProgressReady(id: string) {
  return Object.hasOwn(progressGameLoaders, id);
}
