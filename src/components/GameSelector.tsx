import { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { gameCatalogue, gameGroups, isGameReady } from '../data/game-catalogue';
import { GameLogo } from './GameLogo';

function fitDropdown(details: HTMLDetailsElement | null) {
  if (!details?.open) return;
  const dropdown = details.querySelector<HTMLElement>('.game-dropdown');
  if (dropdown) dropdown.style.setProperty('--game-menu-height', `${Math.max(0, window.innerHeight - dropdown.getBoundingClientRect().top - 16)}px`);
}

export function GameSelector({ gameId, onChange }: { gameId: string; onChange: (id: string) => void }) {
  const details = useRef<HTMLDetailsElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const selected = gameCatalogue.find(game => game.id === gameId)!;
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !details.current?.contains(event.target)) details.current?.removeAttribute('open');
    };
    const resize = () => fitDropdown(details.current);
    document.addEventListener('pointerdown', closeOutside);
    window.addEventListener('resize', resize);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      window.removeEventListener('resize', resize);
    };
  }, []);
  const close = () => { details.current?.removeAttribute('open'); details.current?.querySelector('summary')?.focus(); };
  return <details className="game-selector" ref={details} onToggle={event => {
    if (!event.currentTarget.open) return;
    fitDropdown(event.currentTarget);
    const group = list.current?.querySelector<HTMLElement>(`#generation-${selected.generation}`);
    if (list.current && group) {
      const padding = parseFloat(getComputedStyle(list.current).paddingBlockStart);
      list.current.scrollTop += group.getBoundingClientRect().top - list.current.getBoundingClientRect().top - padding;
    }
  }} onKeyDown={event => {
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
      <div className="game-list" ref={list}>
        {gameGroups.map(group => <section className="game-generation" key={group.generation} aria-labelledby={`generation-${group.generation}`}>
          <h2 id={`generation-${group.generation}`}>Generation {group.generation}</h2>
          <div className="game-options">{group.games.map(game => <button key={game.id} type="button" className="game-option"
            disabled={!isGameReady(game.id)} title={game.name} aria-label={game.name} aria-describedby={!isGameReady(game.id) ? `${game.id}-planned` : undefined}
            aria-pressed={game.id === gameId} onClick={() => { onChange(game.id); close(); }}>
            <GameLogo gameId={game.id} lazy />
            {!isGameReady(game.id) && <span className="game-option-note" id={`${game.id}-planned`}>Planned</span>}
          </button>)}</div>
        </section>)}
      </div>
    </div>
  </details>;
}
