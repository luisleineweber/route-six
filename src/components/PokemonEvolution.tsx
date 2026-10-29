import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { pokemonIdentity } from '../data/dataset';
import { selectionId } from '../domain/pokemon-selection';
import { useGameData } from '../features/planner/GameContext';
import type { Evolution, GameData } from '../domain/types';
import { PokemonSprite } from './PokemonIdentity';
import { evolutionFamily, evolutionLabels } from './evolution-presentation';

function EvolutionStage({ id, currentId, evolutions, game, onSelect }: {
  id: string; currentId: string; evolutions: Evolution[]; game: GameData; onSelect: (id: string) => void;
}) {
  const pokemon = pokemonIdentity(id);
  const next = evolutions.filter(evolution => selectionId(evolution.fromPokemonId, evolution.fromFormId) === id);
  return <div className="evolution-stage">
    <button type="button" className="evolution-pokemon" aria-current={id === currentId ? 'true' : undefined}
      aria-label={`View ${pokemon.name} details`} title={pokemon.name} onClick={() => onSelect(id)}>
      <PokemonSprite id={id} /><span className="evolution-name"><span className="evolution-name-text">{pokemon.name}</span></span>
    </button>
    {next.length > 0 && <ul className="evolution-branches">
      {next.map(evolution => <li key={evolution.id}>
        <div className="evolution-method"><ArrowRight size={18} aria-hidden="true" />
          <ul>
            {next.length > 1 && <li>From {pokemon.name}</li>}
            {evolutionLabels(game, evolution).map(label => <li key={label}>{label.startsWith('Level up at Lv. ')
              ? <><span className="evolution-level-prefix">Level up at </span>{label.slice('Level up at '.length)}</>
              : label}</li>)}
          </ul>
        </div>
        <EvolutionStage id={selectionId(evolution.toPokemonId, evolution.toFormId)} currentId={currentId} evolutions={evolutions} game={game} onSelect={onSelect} />
      </li>)}
    </ul>}
  </div>;
}

export function PokemonEvolution({ id, onSelect }: { id: string; onSelect: (id: string) => void }) {
  const game = useGameData();
  const familyElement = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [namesPaused, setNamesPaused] = useState(false);
  useEffect(() => {
    const names = [...(familyElement.current?.querySelectorAll<HTMLElement>('.evolution-name') ?? [])];
    const measure = () => {
      let overflowing = false;
      for (const name of names) {
        const text = name.firstElementChild as HTMLElement;
        const distance = Math.max(0, text.offsetWidth - name.clientWidth);
        name.dataset.overflow = String(distance > 1);
        name.style.setProperty('--name-travel', `${-distance}px`);
        // Move at no more than five pixels per second, with a pause at each end.
        name.style.setProperty('--name-duration', `${Math.max(12, distance / 3)}s`);
        overflowing ||= distance > 1;
      }
      setHasOverflow(overflowing);
    };
    const observer = new ResizeObserver(measure);
    for (const name of names) {
      observer.observe(name);
      observer.observe(name.firstElementChild!);
    }
    measure();
    return () => observer.disconnect();
  }, [id, game]);
  const family = evolutionFamily(game, id);
  if (!family.evolutions.length) return null;
  const linear = family.roots.length === 1 && new Set(family.evolutions.map(evolution =>
    selectionId(evolution.fromPokemonId, evolution.fromFormId))).size === family.evolutions.length;
  return <section className="pokemon-evolution" aria-labelledby="evolution-title">
    <div className="section-heading evolution-heading"><h3 id="evolution-title">Evolution</h3>{hasOverflow && <button type="button" className="text-button evolution-motion-control" onClick={() => {
      if (namesPaused) {
        familyElement.current?.querySelectorAll<HTMLElement>('.evolution-name').forEach(name => {
          delete name.dataset.manualScroll;
          name.scrollLeft = 0;
        });
      }
      setNamesPaused(!namesPaused);
    }}>{namesPaused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}{namesPaused ? 'Scroll names' : 'Pause names'}</button>}</div>
    <div ref={familyElement} className={`evolution-family${linear ? ' evolution-family-linear' : ''}`} data-stages={family.evolutions.length + 1} data-names-paused={namesPaused} onKeyDown={event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const name = (event.target as HTMLElement).closest('.evolution-pokemon')?.querySelector<HTMLElement>('.evolution-name');
      if (!name || name.dataset.overflow !== 'true') return;
      event.preventDefault();
      name.dataset.manualScroll = 'true';
      setNamesPaused(true);
      name.scrollLeft += event.key === 'ArrowRight' ? 24 : -24;
    }}>{family.roots.map(root => <EvolutionStage key={root} id={root} currentId={id} evolutions={family.evolutions} game={game} onSelect={onSelect} />)}</div>
    {family.evolutions.some(evolution => evolution.trigger === 'player-trade') && <p className="small muted">Player trades are not supported in this guide.</p>}
  </section>;
}
