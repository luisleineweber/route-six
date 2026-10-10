import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { dataset, pokemonById } from '../data/dataset';
import { useGameData } from '../features/planner/GameContext';
import { PokemonSprite, PokemonTypes, TypeBadge } from './PokemonIdentity';
import { StatusLabel } from './StatusLabel';
import { damageMultiplier } from '../domain/team/analyze-types';
import type { AvailabilitySnapshot } from '../domain/types';
import { AcquisitionPathGroup } from './AcquisitionPathGroup';
import { firstAccessPoints, groupAcquisitionPaths } from './acquisition-presentation';


export function AcquisitionDetails({ id, snapshot, progressPage, onClose, onAdd, canAdd }: { id:string|null; snapshot:AvailabilitySnapshot|null; progressPage:boolean; onClose:()=>void; onAdd:(id:string)=>void; canAdd:boolean }) {
  const game = useGameData();
  const dialog = useRef<HTMLDialogElement>(null);
  const [showFuture,setShowFuture] = useState(false);
  const [count,setCount] = useState(12);
  useEffect(()=>{setShowFuture(false);setCount(12);if(id)dialog.current?.showModal();else dialog.current?.close();},[id]);
  const pokemon = id ? pokemonById.get(id)! : null;
  const entry = id ? snapshot?.entries[id] : null;
  const pathIds = entry ? showFuture ? [...entry.currentPathIds,...entry.futurePathIds] : entry.currentPathIds.length ? entry.currentPathIds : entry.futurePathIds : [];
  const groups = snapshot ? groupAcquisitionPaths(game, snapshot, pathIds) : [];
  const firstPoints = firstAccessPoints(game, entry?.firstMilestoneIds ?? []);
  const regionalDex = pokemon ? game.profiles.find(profile => profile.pokemonId === pokemon.id)?.regionalDex : undefined;
  return <dialog ref={dialog} className="acquisition-dialog" aria-labelledby="details-title" onCancel={onClose} onClick={e=>{if(e.target===dialog.current)onClose();}}>
    {pokemon && <><div className="dialog-head"><PokemonSprite id={pokemon.id} size="lg" /><div className="dialog-title"><h2 id="details-title">{pokemon.name}</h2><p className="dex-number">{regionalDex !== undefined && <span>{game.game.region} Dex #{String(regionalDex).padStart(3,'0')}</span>}<span>National Dex #{String(pokemon.nationalDex).padStart(3,'0')}</span></p><PokemonTypes id={pokemon.id} /></div><button className="icon-button" autoFocus onClick={onClose} aria-label="Close Pokémon details"><X size={20} aria-hidden="true" /></button></div>
      <div className="dialog-content"><section className="pokemon-weaknesses"><h3>Type weaknesses</h3><ul className="type-counts">{game.typeChart.typeIds.filter(type=>damageMultiplier(game,type,pokemon.id)>1).map(type=><li key={type}><TypeBadge type={type} /><span className="type-count">{damageMultiplier(game,type,pokemon.id)}×</span></li>)}</ul>{!game.typeChart.typeIds.some(type=>damageMultiplier(game,type,pokemon.id)>1)&&<p>No type weaknesses in this game.</p>}</section>{progressPage ? (entry ? <>
        {firstPoints.length > 0 && <div className="first-access"><strong>First access</strong><p>{firstPoints[0].name}</p></div>}
        <div className="section-heading"><h3>Acquisition paths</h3>{entry.currentPathIds.length>0&&entry.futurePathIds.length>0&&<label className="check-label"><input type="checkbox" checked={showFuture} onChange={e=>setShowFuture(e.target.checked)} /> Include future sources</label>}</div>
        {groups.length ? <>{groups.slice(0,count).map(group=><AcquisitionPathGroup key={group.id} group={group} snapshot={snapshot!} />)}{groups.length>count&&<button className="secondary-button" onClick={()=>setCount(count+12)}>Show more sources ({groups.length-count} remaining)</button>}</> : <p>No valid acquisition path meets this query.</p>}
        <details className="progress-details"><summary>At your selected progress <StatusLabel status={entry.status} /><ChevronDown className="chevron" size={16} aria-hidden="true" /></summary>
          {entry.blockers.length>0 && <div className="detail-blockers"><h4>Requirements to check</h4><ul>{entry.blockers.map((b,i)=><li key={i}>{b.message.replace(/\b[a-z]+(?:-[a-z]+)*\b/g, word=>pokemonById.get(word)?.name??word)}</li>)}</ul></div>}
          {firstPoints.length > 1 && <div><h4>Other first-access points</h4><p className="small muted">Each point is an alternative.</p><ul>{firstPoints.slice(1).map(point=><li key={point.id}>{point.name}</li>)}</ul></div>}
          {!entry.blockers.length && <p>At {game.milestones.find(point=>point.id===snapshot!.query.milestoneId)!.name}.</p>}
        </details>
      </> : <p role="status">Checking the acquisition paths…</p>) : null}
      {progressPage && <details className="data-references"><summary>Game data references <ChevronDown className="chevron" size={16} aria-hidden="true" /></summary><p>Local manual data. Reviewed on 7 October 2026 against Emerald source revision {dataset.references[0].revision?.slice(0,7)}.</p><ul>{dataset.references.map(r=><li key={r.id}><a href={r.url} target="_blank" rel="noreferrer">{r.title}</a></li>)}</ul></details>}</div>
      <div className="dialog-footer"><button className="secondary-button" onClick={onClose}>Close details</button><button className="primary-button" disabled={!canAdd} onClick={()=>{onAdd(pokemon.id);onClose();}}><Plus size={17} aria-hidden="true" /> Add {pokemon.name} to team</button></div>
    </>}
  </dialog>;
}
