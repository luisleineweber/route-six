import { Fragment, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { dataset, pokemonById } from '../../data/dataset';
import { useGameData } from '../planner/GameContext';
import { defaultCatalogueStatus, matchesCatalogueStatus, type CatalogueStatus } from './catalogue-filter';
import { TypeIcon, typeName } from '../../components/PokemonIdentity';
import { PokemonCatalogueCard } from './PokemonCatalogueCard';
import { statusIcons, statusNames } from '../../components/StatusLabel';
import type { AcquisitionPath, AvailabilityEntry, AvailabilitySnapshot, GameData, PlanningTarget } from '../../domain/types';
import { sortPokemonByPokedex } from '../planner/pokedex-order';
import { firstAccessOptions, pathSource } from '../../components/acquisition-presentation';

function summarize(game: GameData, entry: AvailabilityEntry, path: AcquisitionPath | null) {
  if (entry.status === 'unavailable') return entry.blockers.find(b => b.code === 'other-version' || b.code === 'external-event')?.message;
  if (entry.status === 'blocked') return entry.blockers[0]?.message;
  if (!path) return 'View acquisition paths';
  if (path.evolutionIds.length) {
    const first = game.evolutions.find(rule => rule.id === path.evolutionIds[0])!;
    const last = game.evolutions.find(rule => rule.id === path.evolutionIds.at(-1))!;
    const details = [`Evolve ${pokemonById.get(first.fromPokemonId)!.name}`];
    if (last.minimumLevel !== null) details.push(`Lv. ${last.minimumLevel}`);
    if (last.itemId) details.push(game.items.find(item => item.id === last.itemId)!.name);
    return details.join(' · ');
  }
  const source = pathSource(game, path);
  const details = [game.locations.find(location => location.id === source.locationId)!.name];
  if (path.breedingSteps.length) details.push('Breeding');
  return details.join(' · ');
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
  const regionalVisible = visible.filter(pokemon => profiles.get(pokemon.id)?.regionalDex !== undefined);
  const nationalVisible = visible.filter(pokemon => profiles.get(pokemon.id)?.regionalDex === undefined);
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
      : <div className="pokemon-grid">{visible.map((pokemon, index) => {
        const entry = snapshot?.entries[pokemon.id];
        const earliest = entry?.status === 'later' && snapshot ? firstAccessOptions(game, snapshot, entry) : [];
        // Keep the source location and first-access point on the same future path.
        const pathId = entry ? entry.currentPathIds[0]
          ?? earliest[0]?.path.id
          ?? entry.futurePathIds[0] : null;
        const path = pathId && snapshot ? snapshot.paths[pathId] : null;
        const profile = profiles.get(pokemon.id)!;
        const isNational = profile.regionalDex === undefined;
        const startsRegionalGroup = !isNational && index === 0;
        const startsNationalGroup = isNational && (index === 0 || profiles.get(visible[index - 1].id)?.regionalDex !== undefined);
        const StatusIcon = entry ? statusIcons[entry.status] : null;
        const accessLabel = entry ? { available: 'Now', later: 'Later', blocked: 'Blocked', unavailable: 'Unavailable' }[entry.status] : '';
        return <Fragment key={pokemon.id}>
          {startsRegionalGroup && <div className="dex-grid-heading"><h3>{game.game.region} Pokédex</h3><span className="dex-group-count">{regionalVisible.length} Pokémon</span></div>}
          {startsNationalGroup && <>
            <div className="dex-grid-heading national-dex-heading"><h3>National Pokédex</h3><span className="dex-group-count">{nationalVisible.length} Pokémon</span></div>
            {game.game.id === 'emerald' && <p className="dex-grid-note">The National Pokédex unlocks after the Hall of Fame. Some species are available earlier.</p>}
          </>}
          <PokemonCatalogueCard pokemonId={pokemon.id} regionalDex={profile.regionalDex} progressPage={progressPage} activeSlot={activeSlot} canAdd={canAdd} onAdd={onAdd} onDetails={onDetails}>
          {progressPage && entry && <><p className={`source-summary access-summary status-label status-${entry.status}`}>{StatusIcon && <StatusIcon size={15} aria-hidden="true" />}<span>{accessLabel}: {summarize(game, entry, path)}</span></p>
          {entry.status==='later' && earliest.length > 0 && <p className="source-summary">First access: {earliest[0].label}{earliest.length>1?` (+${earliest.length-1} alternatives)`:''}</p>}</>}
          </PokemonCatalogueCard>
        </Fragment>;
      })}</div>}
  </section>;
}
