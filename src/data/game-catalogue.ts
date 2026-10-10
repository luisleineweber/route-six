import { dataset } from './dataset';

export interface GameOption {
  id: string;
  name: string;
  generation: number;
  logoSrc: string;
}

// Presentation only. A game can be selected after its local dataset is reviewed.
const generations = [
  ['Red', 'Blue', 'Yellow'],
  ['Gold', 'Silver', 'Crystal'],
  ['Ruby', 'Sapphire', 'Emerald', 'FireRed', 'LeafGreen'],
  ['Diamond', 'Pearl', 'Platinum', 'HeartGold', 'SoulSilver'],
  ['Black', 'White', 'Black 2', 'White 2'],
  ['X', 'Y', 'Omega Ruby', 'Alpha Sapphire'],
  ['Sun', 'Moon', 'Ultra Sun', 'Ultra Moon', "Let’s Go, Pikachu!", "Let’s Go, Eevee!"],
  ['Sword', 'Shield', 'Brilliant Diamond', 'Shining Pearl', 'Legends: Arceus'],
  ['Scarlet', 'Violet', 'Legends: Z-A'],
];

export const gameCatalogue: GameOption[] = generations.flatMap((names, index) => names.map(name => {
  const id = name.toLowerCase().replace(/[’!:,]/g, '').replaceAll(' ', '-');
  return { id, name: `Pokémon ${name}`, generation: index + 1, logoSrc: `/games/${id}-logo.png` };
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
