import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeftRight, Check, ChevronRight, Plus } from 'lucide-react';
import { pokemonIdentity } from '../../data/dataset';
import { PokemonSprite, PokemonTypes } from '../../components/PokemonIdentity';
import { useGameData } from '../planner/GameContext';
import { regionalDexName } from '../planner/pokedex-order';

export function PokemonCatalogueCard({ selectionId, regionalDex, regionalDexSectionId, progressPage, activeSlot, canAdd, onAdd, onSwap, onDetails, children }: {
  selectionId: string; regionalDex?: number; regionalDexSectionId?: string; progressPage: boolean; activeSlot: number | null; canAdd: boolean;
  onAdd: (id: string) => void; onSwap: (id: string) => void; onDetails: (id: string) => void; children?: ReactNode;
}) {
  const game = useGameData();
  const pokemon = pokemonIdentity(selectionId);
  const hasRegionalDex = regionalDex !== undefined;
  const dexName = hasRegionalDex ? regionalDexName(game, regionalDexSectionId) : 'National';
  const [feedback, setFeedback] = useState(0);
  // The check icon joins the DOM on the first add only. The prerendered page
  // then has no hidden icon in each of its cards; @starting-style fades it in.
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(0), 1800);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  return <article className={`pokemon-card${feedback ? ' pokemon-added' : ''}`}>
    <span className="dex-number" title={`${dexName} Pokédex`}><span className="dex-name">{`${dexName} `}</span>{`#${String(regionalDex ?? pokemon.nationalDex).padStart(3, '0')}`}</span>
    {/* The add button stays during its feedback, also when that add fills the team. */}
    {canAdd || feedback > 0 ? <button className="icon-button add-button" aria-label={`${activeSlot !== null ? 'Set' : 'Add'} ${pokemon.name}${activeSlot !== null ? ` in slot ${activeSlot + 1}` : ' to team'}`} disabled={!canAdd} onClick={() => {
      onAdd(selectionId);
      setAdded(true);
      setFeedback(value => value + 1);
    }}>
      <Plus className="add-icon" size={18} aria-hidden="true" />
      {added && <Check className="added-icon" size={18} aria-hidden="true" />}
      {feedback > 0 && <span className="pokemon-add-label" aria-hidden="true">Added</span>}
    </button>
    : <button className="icon-button add-button swap-button" aria-label={`Swap ${pokemon.name} into team`} title="Swap into team" onClick={() => onSwap(selectionId)}>
      <ArrowLeftRight size={18} aria-hidden="true" />
    </button>}
    <div className="catalogue-card-identity">
      <h3 className="card-identity"><button className="card-link" title={pokemon.name} aria-label={`View ${pokemon.name} details`} onClick={() => onDetails(selectionId)}>
        <span className="card-sprite">
          <PokemonSprite id={selectionId} />
          {feedback > 0 && <span key={feedback} className="pokemon-add-flight" aria-hidden="true"><PokemonSprite id={selectionId} /></span>}
        </span>
        <span className="card-name">{pokemon.name}</span>
        {progressPage && <span className="card-details-cue" aria-hidden="true">Details <ChevronRight size={13} /></span>}
      </button></h3>
      <PokemonTypes id={selectionId} compact joined={!progressPage} />
    </div>
    {children}
  </article>;
}
