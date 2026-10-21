import { ArrowRight } from 'lucide-react';
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
      aria-label={`View ${pokemon.name} details`} onClick={() => onSelect(id)}>
      <PokemonSprite id={id} /><span>{pokemon.name}</span>
    </button>
    {next.length > 0 && <ul className="evolution-branches">
      {next.map(evolution => <li key={evolution.id}>
        <div className="evolution-method"><ArrowRight size={18} aria-hidden="true" />
          <ul>
            {next.length > 1 && <li>From {pokemon.name}</li>}
            {evolutionLabels(game, evolution).map(label => <li key={label}>{label}</li>)}
          </ul>
        </div>
        <EvolutionStage id={selectionId(evolution.toPokemonId, evolution.toFormId)} currentId={currentId} evolutions={evolutions} game={game} onSelect={onSelect} />
      </li>)}
    </ul>}
  </div>;
}

export function PokemonEvolution({ id, onSelect }: { id: string; onSelect: (id: string) => void }) {
  const game = useGameData();
  const family = evolutionFamily(game, id);
  if (!family.evolutions.length) return null;
  return <section className="pokemon-evolution" aria-labelledby="evolution-title">
    <h3 id="evolution-title">Evolution</h3>
    <div className="evolution-family">{family.roots.map(root => <EvolutionStage key={root} id={root} currentId={id} evolutions={family.evolutions} game={game} onSelect={onSelect} />)}</div>
    {family.evolutions.some(evolution => evolution.trigger === 'player-trade') && <p className="small muted">Player trades are not supported in this guide.</p>}
  </section>;
}
