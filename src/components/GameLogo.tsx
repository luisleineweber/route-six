const logos: Record<string, string> = { emerald: '/games/emerald.svg' };

export function GameLogo({ gameId, size = 40 }: { gameId: string; size?: number }) {
  return <img className="game-logo" src={logos[gameId]} alt="" width={size} height={size} decoding="async" />;
}
