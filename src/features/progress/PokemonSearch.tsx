import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react';
import { dataset, emerald, pokemonById, profilesById } from '../../data/dataset';
import { PokemonSprite, PokemonTypes, TypeIcon, typeName } from '../../components/PokemonIdentity';
import { StatusLabel, statusIcons, statusNames } from '../../components/StatusLabel';
import type { AcquisitionPath, AvailabilityEntry, AvailabilitySnapshot, PlanningTarget, PokemonSource } from '../../domain/types';

const pageSize = 24;
const sourceKinds = ['wild', 'starter', 'gift', 'static', 'egg', 'fossil', 'game-trade', 'breeding', 'evolution'];

function summarize(entry: AvailabilityEntry, path: AcquisitionPath | null, baseSource: PokemonSource | null) {
  if (entry.status === 'unavailable') return entry.blockers.find(b => b.code === 'other-version' || b.code === 'external-event')?.message;
  if (entry.status === 'blocked') return entry.blockers[0]?.message;
  if (path?.breedingSteps.length) return 'Day Care breeding';
  if (path?.evolutionIds.length) return `Evolve ${pokemonById.get(emerald.evolutions.find(e => e.id === path.evolutionIds[0])!.fromPokemonId)!.name}`;
  return baseSource ? emerald.locations.find(l => l.id === baseSource.locationId)!.name : 'View acquisition paths';
}

export function PokemonSearch({ snapshot, target, progressPage, team, activeSlot, onAdd, onDetails, onCancel }: {
  snapshot: AvailabilitySnapshot | null; target: PlanningTarget; progressPage: boolean; team: (string|null)[];
  activeSlot: number|null; onAdd: (id:string) => void; onDetails: (id:string) => void; onCancel: () => void;
}) {
  const [query,setQuery] = useState('');
  const [type,setType] = useState('');
  const [statusChoice,setStatusChoice] = useState<string|null>(null);
  const [source,setSource] = useState('');
  const [page,setPage] = useState(0);
  // Without a choice, the Progress Planner lists only what is available now.
  const status = statusChoice ?? (progressPage ? 'available' : '');
  // Everything except the status filter, so the status chips can count what each one would show.
  const matching = useMemo(() => dataset.pokemon.filter(pokemon => {
    const profile = profilesById.get(pokemon.id)!;
    const words = query.toLowerCase().trim().split(/\s+/);
    if (!words.every(word => `${pokemon.name} ${pokemon.nationalDex} ${profile.types.join(' ')}`.toLowerCase().includes(word))) return false;
    if (type && !profile.types.includes(type)) return false;
    if (source) {
      const entry = snapshot?.entries[pokemon.id];
      const paths = entry ? [...entry.currentPathIds, ...entry.futurePathIds].map(id => snapshot!.paths[id]) : [];
      const declared = emerald.sources.filter(s => s.pokemonId === pokemon.id);
      if (source === 'evolution' ? !emerald.evolutions.some(e => e.toPokemonId === pokemon.id || e.coProductIds.includes(pokemon.id))
        : !declared.some(s => s.details.kind === source) && !paths.some(p => p.sourceIds.some(id => emerald.sources.find(s => s.id === id)?.details.kind === source))) return false;
    }
    return true;
  }), [query,type,source,snapshot]);
  const counts = useMemo(() => snapshot ? matching.reduce((tally, pokemon) => { const key = snapshot.entries[pokemon.id].status; return { ...tally, [key]: (tally[key] ?? 0) + 1 }; }, {} as Record<string, number>) : null, [matching, snapshot]);
  const visible = useMemo(() => matching.filter(pokemon => {
    const entry = snapshot?.entries[pokemon.id];
    return !(entry && status && entry.status !== status);
  }).sort((a,b) => !status ? Number(snapshot?.entries[b.id].status === 'available') - Number(snapshot?.entries[a.id].status === 'available')
    || (target==='whole-game'?Number(snapshot?.entries[b.id].status==='later')-Number(snapshot?.entries[a.id].status==='later'):0)
    || a.nationalDex-b.nationalDex : a.nationalDex-b.nationalDex), [matching,status,snapshot,target]);
  const pageCount = Math.max(1, Math.ceil(visible.length/pageSize));
  const currentPage = Math.min(page, pageCount-1);
  const update = (setter: (value:string)=>void, value:string) => { setter(value);setPage(0); };
  const canAdd = activeSlot !== null || team.includes(null);
  const clearFilters = () => { setQuery('');setType('');setStatusChoice(null);setSource('');setPage(0); };
  const statusChips = [{ id: '', name: 'All', count: matching.length, Icon: null }, ...Object.entries(statusNames).map(([id,name]) => ({ id, name, count: counts?.[id] ?? 0, Icon: statusIcons[id as keyof typeof statusIcons] }))];
  return <section className="catalogue" id="pokemon-search" aria-labelledby="catalogue-title">
    <div className="section-heading"><h2 id="catalogue-title">{progressPage ? 'Pokémon at your progress' : 'Find your next team member'}</h2><span className="count">{snapshot ? `${visible.length} Pokémon` : 'Checking access…'}</span></div>
    {!canAdd && <p className="full-team-hint">Your six slots are full. Select Replace on a team member to change it.</p>}
    {activeSlot !== null && <div className="slot-prompt" role="status"><span>Choose a Pokémon for slot {activeSlot+1}{team[activeSlot] ? ` to replace ${pokemonById.get(team[activeSlot]!)!.name}` : ''}.</span><button className="text-button" onClick={onCancel}><X size={16} aria-hidden="true" /> Cancel</button></div>}
    <div className="filters">
      <div className="filter-row">
        <div className="field"><label htmlFor="pokemon-query">Search Pokémon</label><div className="input-icon"><Search size={18} aria-hidden="true" /><input id="pokemon-query" type="search" value={query} placeholder="Name, type, or Dex number" onChange={e => update(setQuery,e.target.value)} /></div></div>
        <div className="field"><label htmlFor="source-filter">Source</label><select id="source-filter" value={source} onChange={e => update(setSource,e.target.value)}><option value="">All sources</option>{sourceKinds.map(kind => <option key={kind} value={kind}>{kind === 'game-trade' ? 'In-game trade' : typeName(kind)}</option>)}</select></div>
      </div>
      <div className="chip-row" role="group" aria-label="Filter by status">{statusChips.map(({id,name,count,Icon}) => <button key={id} className={`chip ${id ? `status-${id}` : ''}`} aria-pressed={status===id} onClick={() => update(setStatusChoice, id)}>
        {Icon && <Icon size={15} aria-hidden="true" />}{name}{counts && <span className="chip-count">{count}</span>}</button>)}</div>
      <div className="type-filter" role="group" aria-label="Filter by type">{emerald.typeChart.typeIds.map(id => <button key={id} className={`type-toggle ${type && type !== id ? 'dimmed' : ''}`} aria-pressed={type===id} aria-label={typeName(id)} title={typeName(id)} onClick={() => update(setType, type===id ? '' : id)}><TypeIcon type={id} size={32} /></button>)}</div>
    </div>

    {!snapshot ? <>
        <p className="loading-note" role="status"><span className="loading-dot" />Checking the local guide. This covers direct sources, evolutions, breeding, and future progress.</p>
        <div className="pokemon-grid" aria-hidden="true">{Array.from({length:8},(_,i) => <div className="pokemon-card skeleton" key={i} />)}</div>
      </>
      : !visible.length ? <div className="empty-results"><Search size={26} aria-hidden="true" /><h3>No Pokémon match these filters.</h3><p>Change the name, type, status, or source.</p><button className="secondary-button" onClick={clearFilters}>Clear filters</button></div>
      : <div className="pokemon-grid">{visible.slice(currentPage*pageSize,(currentPage+1)*pageSize).map(pokemon => {
        const entry = snapshot.entries[pokemon.id];
        const pathId = entry.currentPathIds[0] ?? entry.futurePathIds[0];
        const path = pathId ? snapshot.paths[pathId] : null;
        const baseSource = path ? emerald.sources.find(s => s.id === path.sourceIds[0]) ?? null : null;
        const earliest = entry.firstMilestoneIds.map(id=>emerald.milestones.find(m=>m.id===id)!.name);
        return <article className="pokemon-card" key={pokemon.id}>
          <span className="dex-number">#{String(pokemon.nationalDex).padStart(3,'0')}</span>
          <button className="icon-button add-button" aria-label={`${activeSlot!==null?'Set':'Add'} ${pokemon.name}${activeSlot!==null?` in slot ${activeSlot+1}`:' to team'}`} disabled={!canAdd} onClick={()=>onAdd(pokemon.id)}><Plus size={18} aria-hidden="true" /></button>
          <PokemonSprite id={pokemon.id} />
          <h3><button className="card-link" aria-label={`View ${pokemon.name} details`} onClick={()=>onDetails(pokemon.id)}>{pokemon.name}</button></h3>
          <PokemonTypes id={pokemon.id} compact /><StatusLabel status={entry.status} />
          <p className="source-summary">{summarize(entry, path, baseSource)}</p>
          {entry.status==='later' && <p className="source-summary">First access: {earliest[0]}{earliest.length>1?` (+${earliest.length-1} alternatives)`:''}</p>}
        </article>;
      })}</div>}
    {snapshot && visible.length>pageSize && <nav className="pagination" aria-label="Pokémon result pages"><button className="secondary-button" disabled={currentPage===0} onClick={()=>setPage(currentPage-1)}><ChevronLeft size={16} aria-hidden="true" /> Previous</button><span aria-live="polite">Page {currentPage+1} of {pageCount}</span><button className="secondary-button" disabled={currentPage===pageCount-1} onClick={()=>setPage(currentPage+1)}>Next <ChevronRight size={16} aria-hidden="true" /></button></nav>}
  </section>;
}
