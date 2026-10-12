import { dataset } from './dataset';

export interface GameOption {
  id: string;
  name: string;
  generation: number;
  logoSrc: string;
  headerColor: string;
}

// Presentation only. A game can be selected after its local dataset is reviewed.
const game = (name: string, hue: number, chroma = 0.045) => ({
  name,
  headerColor: `oklch(0.955 ${chroma.toFixed(3)} ${hue})`,
});

const generations = [
  [game('Red', 28), game('Blue', 250), game('Yellow', 98)],
  [game('Gold', 83), game('Silver', 230, 0.008), game('Crystal', 198)],
  [game('Ruby', 25), game('Sapphire', 250), game('Emerald', 155), game('FireRed', 32), game('LeafGreen', 140)],
  [game('Diamond', 228), game('Pearl', 345), game('Platinum', 265, 0.012), game('HeartGold', 84), game('SoulSilver', 220, 0.008)],
  [game('Black', 255, 0.012), game('White', 210, 0.008), game('Black 2', 225), game('White 2', 205)],
  [game('X', 222), game('Y', 356), game('Omega Ruby', 27), game('Alpha Sapphire', 249)],
  [game('Sun', 46), game('Moon', 268), game('Ultra Sun', 41), game('Ultra Moon', 286), game('Let’s Go, Pikachu!', 95), game('Let’s Go, Eevee!', 53)],
  [game('Sword', 235), game('Shield', 355), game('Brilliant Diamond', 226), game('Shining Pearl', 342), game('Legends: Arceus', 210)],
  [game('Scarlet', 27), game('Violet', 291), game('Legends: Z-A', 194)],
];

export const gameCatalogue: GameOption[] = generations.flatMap((games, index) => games.map(({ name, headerColor }) => {
  const id = name.toLowerCase().replace(/[’!:,]/g, '').replaceAll(' ', '-');
  return { id, name: `Pokémon ${name}`, generation: index + 1, logoSrc: `/games/${id}-logo.png`, headerColor };
}));

export const gameGroups = generations.map((_, index) => ({
  generation: index + 1,
  games: gameCatalogue.filter(game => game.generation === index + 1),
}));

export function getGameData(id: string) {
  const game = dataset.games.find(game => game.game.id === id);
  if (!game) throw new Error(`Missing local game data: ${id}`);
  return game;
}

export function isGameReady(id: string) {
  return dataset.games.some(game => game.game.id === id);
}
