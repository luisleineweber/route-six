import { Plus, X } from 'lucide-react';
import { pokemonById } from '../../data/dataset';
import { PokemonSprite, PokemonTypes } from '../../components/PokemonIdentity';
import { StatusLabel } from '../../components/StatusLabel';
import type { AvailabilitySnapshot } from '../../domain/types';

export function TeamSlots({ team, snapshot, progressPage, activeSlot, onChoose, onRemove, onDetails }: {
  team: (string | null)[]; snapshot: AvailabilitySnapshot | null; progressPage: boolean; activeSlot: number | null;
  onChoose: (slot: number) => void; onRemove: (slot: number) => void; onDetails: (id: string) => void;
}) {
  return <div className="team-slots">{team.map((id, index) => {
    const name = id ? pokemonById.get(id)!.name : null;
    return <article key={index} className={`team-slot ${id ? 'filled' : 'empty'} ${activeSlot === index ? 'active-slot' : ''}`} aria-label={`Team slot ${index + 1}${name ? ': ' + name : ': empty'}`}>
      <span className="slot-number" aria-hidden="true">{index + 1}</span>
      {id ? <>
        <button className="icon-button remove-button" aria-label={`Remove ${name} from slot ${index + 1}`} onClick={() => onRemove(index)}><X size={16} aria-hidden="true" /></button>
        <PokemonSprite id={id} />
        <h3><button className="card-link" aria-label={`View ${name} details`} onClick={() => onDetails(id)}>{name}</button></h3>
        <PokemonTypes id={id} compact />
        {progressPage && (snapshot ? <StatusLabel status={snapshot.entries[id].status} /> : <span className="status-label status-pending">Checking access…</span>)}
      </> : <button className="empty-slot-button" onClick={() => onChoose(index)}><span className="empty-plus"><Plus size={22} aria-hidden="true" /></span>Add Pokémon<span className="sr-only"> to slot {index + 1}</span></button>}
    </article>;
  })}</div>;
}
