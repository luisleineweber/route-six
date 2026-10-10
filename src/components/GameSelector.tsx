import { useEffect, useRef } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { gameCatalogue, gameGroups, isGameReady } from '../data/game-catalogue';
import { GameLogo } from './GameLogo';

export function GameSelector({ gameId, onChange }: { gameId: string; onChange: (id: string) => void }) {
  const details = useRef<HTMLDetailsElement>(null);
  const selected = gameCatalogue.find(game => game.id === gameId)!;
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !details.current?.contains(event.target)) details.current?.removeAttribute('open');
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);
  const close = () => { details.current?.removeAttribute('open'); details.current?.querySelector('summary')?.focus(); };
  return <details className="game-selector" ref={details} onKeyDown={event => {
    if (event.key === 'Escape' && details.current?.open) { event.preventDefault(); event.stopPropagation(); close(); }
  }} onBlur={event => {
    if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) details.current?.removeAttribute('open');
  }}>
    <summary>
      <GameLogo gameId={gameId} />
      <span className="selected-game"><strong>{selected.name}</strong><span>Generation {selected.generation}</span></span>
      <ChevronDown size={18} className="chevron" aria-hidden="true" />
    </summary>
    <div className="game-dropdown" role="region" aria-label="Choose a game">
      <p className="game-menu-note">Emerald is ready. More games are planned.</p>
      {gameGroups.map(group => <section className="game-generation" key={group.generation} aria-labelledby={`generation-${group.generation}`}>
        <h2 id={`generation-${group.generation}`}>Generation {group.generation}</h2>
        <div className="game-options">{group.games.map(game => <button key={game.id} type="button" className="game-option"
          disabled={!isGameReady(game.id)} aria-pressed={game.id === gameId} onClick={() => { onChange(game.id); close(); }}>
          <GameLogo gameId={game.id} lazy />
          <span>{game.name}</span>
          <span className="game-option-status">{isGameReady(game.id) ? <><Check size={14} aria-hidden="true" /> Ready</> : 'Planned'}</span>
        </button>)}</div>
      </section>)}
    </div>
  </details>;
}
