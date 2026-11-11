import type { CSSProperties } from 'react';
import { gameCatalogue } from '../data/game-catalogue';
import { GameLogo } from './GameLogo';
import { LoadingMark } from './Loading';

/** Shows the game that is loading, in the same place as the notice that follows the change. */
export function GameLoadingNotice({ gameId }: { gameId: string }) {
  const game = gameCatalogue.find(option => option.id === gameId);
  if (!game) throw new Error(`Missing game: ${gameId}`);
  return <div className="game-loading-notice" role="status" style={{ '--next-accent': game.accentColor } as CSSProperties}>
    <GameLogo gameId={gameId} />
    <p><strong>Loading {game.name}…</strong><span>Getting Pokémon, places, and progress points.</span></p>
    <LoadingMark size="sm" />
    <span className="game-loading-bar" aria-hidden="true" />
  </div>;
}
