import { createContext, useContext } from 'react';
import type { GameData } from '../../domain/types';

export const GameContext = createContext<GameData | null>(null);

export function useGameData() {
  const game = useContext(GameContext);
  if (!game) throw new Error('Game data must be provided to the planner.');
  return game;
}
