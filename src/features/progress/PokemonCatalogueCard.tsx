import { useEffect, useState, type ReactNode } from 'react';
import { Check, ChevronRight, Plus } from 'lucide-react';
import { pokemonById } from '../../data/dataset';
import { PokemonSprite, PokemonTypes } from '../../components/PokemonIdentity';
import { useGameData } from '../planner/GameContext';

export function PokemonCatalogueCard({ pokemonId, regionalDex, progressPage, activeSlot, canAdd, onAdd, onDetails, children }: {
  pokemonId: string; regionalDex?: number; progressPage: boolean; activeSlot: number | null; canAdd: boolean;
  onAdd: (id: string) => void; onDetails: (id: string) => void; children?: ReactNode;
}) {
  const game = useGameData();
  const pokemon = pokemonById.get(pokemonId)!;
  const [feedback, setFeedback] = useState(0);
  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(0), 1800);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  return <article className={`pokemon-card${feedback ? ' pokemon-added' : ''}`}>
    <span className="dex-number" title={regionalDex ? `${game.game.region} Pokédex` : 'National Pokédex'}><span className="dex-name">{regionalDex ? game.game.region : 'National'} </span>#{String(regionalDex ?? pokemon.nationalDex).padStart(3, '0')}</span>
    <button className="icon-button add-button" aria-label={`${activeSlot !== null ? 'Set' : 'Add'} ${pokemon.name}${activeSlot !== null ? ` in slot ${activeSlot + 1}` : ' to team'}`} disabled={!canAdd} onClick={() => {
      onAdd(pokemonId);
      setFeedback(value => value + 1);
    }}>
      <Plus className="add-icon" size={18} aria-hidden="true" />
      <Check className="added-icon" size={18} aria-hidden="true" />
      {feedback > 0 && <span className="pokemon-add-label" aria-hidden="true">Added</span>}
    </button>
    <h3 className="card-identity"><button className="card-link" title={pokemon.name} aria-label={`View ${pokemon.name} details`} onClick={() => onDetails(pokemonId)}>
      <span className="card-sprite">
        <PokemonSprite id={pokemonId} />
        {feedback > 0 && <span key={feedback} className="pokemon-add-flight" aria-hidden="true"><PokemonSprite id={pokemonId} /></span>}
      </span>
      <span className="card-name">{pokemon.name}</span>
      {progressPage && <span className="card-details-cue" aria-hidden="true">Details <ChevronRight size={13} /></span>}
    </button></h3>
    <PokemonTypes id={pokemonId} compact joined={!progressPage} />
    {children}
  </article>;
}
