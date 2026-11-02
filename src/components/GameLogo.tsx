import { assetUrl } from '../data/asset-url';
import { gameCatalogue } from '../data/game-catalogue';

export function GameLogo({ gameId, lazy = false }: { gameId: string; lazy?: boolean }) {
  const game = gameCatalogue.find(game => game.id === gameId);
  if (!game) throw new Error(`Missing game logo: ${gameId}`);
  return <img className="game-logo" src={assetUrl(game.logoSrc)} alt="" width={112} height={56} decoding="async" loading={lazy ? 'lazy' : 'eager'} />;
}
