import { useMemo, useState } from 'react';
import { ChevronRight, Plus, Search, X } from 'lucide-react';
import { dataset, pokemonById } from '../../data/dataset';
import { useGameData } from '../planner/GameContext';
import { defaultCatalogueStatus, matchesCatalogueStatus, type CatalogueStatus } from './catalogue-filter';
import { PokemonSprite, PokemonTypes, TypeIcon, typeName } from '../../components/PokemonIdentity';
import { statusIcons, statusNames } from '../../components/StatusLabel';
import type { AcquisitionPath, AvailabilityEntry, AvailabilitySnapshot, GameData, PlanningTarget, PokemonSource } from '../../domain/types';
import { sortPokemonByPokedex } from '../planner/pokedex-order';

function summarize(game: GameData, entry: AvailabilityEntry, path: AcquisitionPath | null, baseSource: PokemonSource | null) {
  if (entry.status === 'unavailable') return entry.blockers.find(b => b.code === 'other-version' || b.code === 'external-event')?.message;
  if (entry.status === 'blocked') return entry.blockers[0]?.message;
  if (path?.breedingSteps.length) return 'Day Care breeding';
  if (path?.evolutionIds.length) return `Evolve ${pokemonById.get(game.evolutions.find(e => e.id === path.evolutionIds[0])!.fromPokemonId)!.name}`;
  return baseSource ? game.locations.find(l => l.id === baseSource.locationId)!.name : 'View acquisition paths';
}

export function PokemonSearch({ snapshot, target, progressPage, team, activeSlot, onAdd, onDetails, onCancel }: {
  snapshot: AvailabilitySnapshot | null; target: PlanningTarget; progressPage: boolean; team: (string|null)[];
  activeSlot: number|null; onAdd: (id:string) => void; onDetails: (id:string) => void; onCancel: () => void;
}) {
  const game = useGameData();
  const profiles = useMemo(() => new Map(game.profiles.map(profile => [profile.pokemonId, profile])), [game]);
  const [query,setQuery] = useState('');
  const [type,setType] = useState('');
  const [statusChoice,setStatusChoice] = useState<CatalogueStatus|null>(null);
  const status = statusChoice ?? defaultCatalogueStatus(target);
  // Everything except the status filter, so the status chips can count what each one would show.
  const matching = useMemo(() => dataset.pokemon.filter(pokemon => {
    const profile = profiles.get(pokemon.id);
    if (!profile) return false;
    const words = query.toLowerCase().trim().split(/\s+/);
    if (!words.every(word => `${pokemon.name} ${pokemon.nationalDex} ${profile.regionalDex ?? ''} ${profile.types.join(' ')}`.toLowerCase().includes(word))) return false;
    if (type && !profile.types.includes(type)) return false;
    return true;
  }), [query,type,profiles]);
  const counts = useMemo(() => progressPage && snapshot ? matching.reduce((tally, pokemon) => { const key = snapshot.entries[pokemon.id].status; return { ...tally, [key]: (tally[key] ?? 0) + 1 }; }, {} as Record<string, number>) : null, [matching, snapshot, progressPage]);
  const visible = useMemo(() => sortPokemonByPokedex(matching.filter(pokemon => {
    const entry = snapshot?.entries[pokemon.id];
    return !progressPage || !snapshot || !entry || matchesCatalogueStatus(entry, status);
  }), game), [matching,status,snapshot,progressPage,game]);
  const canAdd = activeSlot !== null || team.includes(null);
  const clearFilters = () => { setQuery('');setType('');setStatusChoice(null); };
  const statusChips = [{ id: 'obtainable' as CatalogueStatus, name: 'All in game', count: (counts?.available ?? 0) + (counts?.later ?? 0), Icon: null }, ...Object.entries(statusNames).map(([id,name]) => ({ id: id as CatalogueStatus, name, count: counts?.[id] ?? 0, Icon: statusIcons[id as keyof typeof statusIcons] }))];
  return <section className={`catalogue ${progressPage ? 'progress-catalogue' : 'team-catalogue'}`} id="pokemon-search" aria-labelledby="catalogue-title">
    <div className="section-heading"><h2 id="catalogue-title">{progressPage ? 'Pokémon at your progress' : 'All Pokémon'}</h2></div>
    {!canAdd && <p className="full-team-hint">Your six slots are full. Remove a team member to add another Pokémon.</p>}
    {activeSlot !== null && <div className="slot-prompt" role="status"><span>Choose a Pokémon for slot {activeSlot+1}.</span><button className="text-button" onClick={onCancel}><X size={16} aria-hidden="true" /> Cancel</button></div>}
    <div className="filters">
      <div className="filter-row">
        <div className="field"><label htmlFor="pokemon-query">Search Pokémon</label><div className="input-icon"><Search size={18} aria-hidden="true" /><input id="pokemon-query" type="search" value={query} placeholder="Name, type, or Dex number" onChange={e => setQuery(e.target.value)} /></div></div>
      </div>
      {progressPage && <div className="chip-row" role="group" aria-label="Filter by status">{statusChips.map(({id,name,count,Icon}) => <button key={id} className={`chip status-${id}`} aria-pressed={status===id} onClick={() => setStatusChoice(id)}>
        {Icon && <Icon size={15} aria-hidden="true" />}{name}{counts && <span className="chip-count">{count}</span>}</button>)}</div>}
      <div className="type-filter" role="group" aria-label="Filter by type">{game.typeChart.typeIds.map(id => <button key={id} className={`type-toggle ${type && type !== id ? 'dimmed' : ''}`} aria-pressed={type===id} aria-label={typeName(id)} title={typeName(id)} onClick={() => setType(type===id ? '' : id)}><TypeIcon type={id} size={32} /></button>)}</div>
    </div>

    {progressPage && !snapshot ? <>
        <p className="loading-note" role="status"><span className="loading-dot" />Checking the local guide. This covers direct sources, evolutions, breeding, and future progress.</p>
        <div className="pokemon-grid" aria-hidden="true">{Array.from({length:18},(_,i) => <div className="pokemon-card skeleton" key={i} />)}</div>
      </>
      : !visible.length ? <div className="empty-results"><Search size={26} aria-hidden="true" /><h3>No Pokémon match these filters.</h3><p>{progressPage ? 'Change the name, type, or Dex number.' : 'Change the name or type.'}</p><button className="secondary-button" onClick={clearFilters}>Clear filters</button></div>
      : <div className="pokemon-grid">{visible.map(pokemon => {
        const entry = snapshot?.entries[pokemon.id];
        const pathId = entry ? entry.currentPathIds[0] ?? entry.futurePathIds[0] : null;
        const path = pathId && snapshot ? snapshot.paths[pathId] : null;
        const baseSource = path ? game.sources.find(s => s.id === path.sourceIds[0]) ?? null : null;
        const earliest = entry?.firstMilestoneIds.map(id=>game.milestones.find(m=>m.id===id)!.name) ?? [];
        const profile = profiles.get(pokemon.id)!;
        const StatusIcon = entry ? statusIcons[entry.status] : null;
        const accessLabel = entry ? { available: 'Now', later: 'Later', blocked: 'Blocked', unavailable: 'Unavailable' }[entry.status] : '';
        return <article className="pokemon-card" key={pokemon.id}>
          <span className="dex-number" title={profile.regionalDex ? `${game.game.region} Pokédex` : 'National Pokédex'}><span className="dex-name">{profile.regionalDex ? game.game.region : 'National'} </span>#{String(profile.regionalDex ?? pokemon.nationalDex).padStart(3,'0')}</span>
          <button className="icon-button add-button" aria-label={`${activeSlot!==null?'Set':'Add'} ${pokemon.name}${activeSlot!==null?` in slot ${activeSlot+1}`:' to team'}`} disabled={!canAdd} onClick={()=>onAdd(pokemon.id)}><Plus size={18} aria-hidden="true" /></button>
          <h3 className="card-identity"><button className="card-link" title={pokemon.name} aria-label={`View ${pokemon.name} details`} onClick={()=>onDetails(pokemon.id)}><PokemonSprite id={pokemon.id} /><span className="card-name">{pokemon.name}</span>{progressPage && <span className="card-details-cue" aria-hidden="true">Details <ChevronRight size={13} /></span>}</button></h3>
          <PokemonTypes id={pokemon.id} compact />
          {progressPage && entry && <><p className={`source-summary access-summary status-label status-${entry.status}`}>{StatusIcon && <StatusIcon size={15} aria-hidden="true" />}<span>{accessLabel}: {summarize(game, entry, path, baseSource)}</span></p>
          {entry.status==='later' && <p className="source-summary">First access: {earliest[0]}{earliest.length>1?` (+${earliest.length-1} alternatives)`:''}</p>}</>}
        </article>;
      })}</div>}
  </section>;
}
