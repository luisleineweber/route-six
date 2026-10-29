import { useEffect, useRef, useState } from 'react';
import { ChevronDown, MapPin, Plus, X } from 'lucide-react';
import { sharedData, pokemonById, pokemonIdentity } from '../data/dataset';
import { gameReferences } from '../data/game-references';
import { useGameData } from '../features/planner/GameContext';
import { PokemonSprite, PokemonTypes, TypeBadge } from './PokemonIdentity';
import { StatusLabel } from './StatusLabel';
import { damageMultiplier } from '../domain/team/analyze-types';
import type { AvailabilitySnapshot } from '../domain/types';
import { AcquisitionPathGroup } from './AcquisitionPathGroup';
import { firstAccessOptions, groupAcquisitionPaths } from './acquisition-presentation';
import { PokemonEvolution } from './PokemonEvolution';
import { selectionProfile } from '../domain/pokemon-selection';
import { regionalDexName } from '../features/planner/pokedex-order';


export function AcquisitionDetails({ id, snapshot, progressPage, onClose, onAdd, onNavigate, canAdd }: { id:string|null; snapshot:AvailabilitySnapshot|null; progressPage:boolean; onClose:()=>void; onAdd:(id:string)=>void; onNavigate:(id:string)=>void; canAdd:boolean }) {
  const game = useGameData();
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [showFuture,setShowFuture] = useState(false);
  const [count,setCount] = useState(12);
  useEffect(()=>{
    setShowFuture(false); setCount(12);
    if (id && dialog.current) {
      if (!dialog.current.open) dialog.current.showModal();
      dialog.current.scrollTop = 0;
      if (content.current) content.current.scrollTop = 0;
      title.current?.focus({ preventScroll: true });
    } else dialog.current?.close();
  },[id]);
  const pokemon = id ? pokemonIdentity(id) : null;
  const entry = id ? snapshot?.entries[id] : null;
  const pathIds = entry ? showFuture ? [...entry.currentPathIds,...entry.futurePathIds] : entry.currentPathIds.length ? entry.currentPathIds : entry.futurePathIds : [];
  const groups = snapshot ? groupAcquisitionPaths(game, snapshot, pathIds) : [];
  const firstPoints = entry && snapshot ? firstAccessOptions(game, snapshot, entry) : [];
  const profile = id ? selectionProfile(game, id) : undefined;
  const forms = pokemon ? game.profiles.find(profile => profile.pokemonId === pokemon.id)!.forms ?? [] : [];
  const regionalDex = profile?.regionalDex;
  return <dialog ref={dialog} className="acquisition-dialog" aria-labelledby="details-title" onCancel={onClose} onClick={e=>{if(e.target===dialog.current)onClose();}}>
    {pokemon && <><div className="dialog-head"><PokemonSprite id={id!} size="lg" /><div className="dialog-title"><h2 ref={title} id="details-title" tabIndex={-1}>{pokemon.name}</h2><p className="dex-number">{regionalDex !== undefined && <span>{regionalDexName(game, profile?.regionalDexSectionId)} Dex #{String(regionalDex).padStart(3,'0')}</span>}<span>National Dex #{String(pokemon.nationalDex).padStart(3,'0')}</span></p><PokemonTypes id={id!} /></div><button className="icon-button" autoFocus onClick={onClose} aria-label="Close Pokémon details"><X size={20} aria-hidden="true" /></button></div>
      <div ref={content} className="dialog-content">{forms.length > 0 && <label className="form-selector">Form<select value={id!} onChange={event=>onNavigate(event.target.value)}><option value={pokemon.id}>Default form</option>{forms.map(form=><option key={form.formId} value={form.formId}>{sharedData.forms!.find(shared=>shared.id===form.formId)!.name}</option>)}</select></label>}<PokemonEvolution key={id} id={id!} onSelect={onNavigate} /><section className="pokemon-weaknesses"><h3>Type weaknesses</h3><ul className="type-counts">{game.typeChart.typeIds.filter(type=>damageMultiplier(game,type,id!)>1).map(type=><li key={type}><TypeBadge type={type} /><span className="type-count">{damageMultiplier(game,type,id!)}×</span></li>)}</ul>{!game.typeChart.typeIds.some(type=>damageMultiplier(game,type,id!)>1)&&<p>No type weaknesses in this game.</p>}</section>{progressPage ? (entry ? <>
        {firstPoints.length > 0 && <section className="first-access" aria-label="First available"><MapPin size={20} aria-hidden="true" /><p>Available from {firstPoints[0].label}.</p></section>}
        <div className="section-heading"><h3>How to get this Pokémon</h3>{entry.currentPathIds.length>0&&entry.futurePathIds.length>0&&<label className="check-label"><input type="checkbox" checked={showFuture} onChange={e=>setShowFuture(e.target.checked)} /> Show ways available later</label>}</div>
        {groups.length ? <>{groups.slice(0,count).map(group=><AcquisitionPathGroup key={group.id} group={group} snapshot={snapshot!} />)}{groups.length>count&&<button className="secondary-button" onClick={()=>setCount(count+12)}>Show more ways ({groups.length-count} left)</button>}</> : <p>The guide does not list a way to get this Pokémon at this point.</p>}
        <details className="progress-details"><summary>Availability at this point <StatusLabel status={entry.status} /><ChevronDown className="chevron" size={16} aria-hidden="true" /></summary>
          {entry.blockers.length>0 && <div className="detail-blockers"><h4>Requirements to check</h4><ul>{entry.blockers.map((b,i)=><li key={i}>{b.message.replace(/\b[a-z]+(?:-[a-z]+)*\b/g, word=>pokemonById.get(word)?.name??word)}</li>)}</ul></div>}
          {firstPoints.length > 1 && <div><h4>Other ways to get it</h4><ul>{firstPoints.slice(1).map(point=><li key={point.id}>{point.label}</li>)}</ul></div>}
          {!entry.blockers.length && <p>At {game.milestones.find(point=>point.id===snapshot!.query.milestoneId)!.name}.</p>}
        </details>
      </> : <p role="status">Checking how to get this Pokémon…</p>) : null}
      {progressPage && <details className="data-references"><summary>Sources <ChevronDown className="chevron" size={16} aria-hidden="true" /></summary><p>Sources for {game.game.name}. Last checked: {game.game.review.checkedOn}.</p><ul>{gameReferences(sharedData,game).map(r=><li key={r.id}><a href={r.url} target="_blank" rel="noreferrer">{r.title}</a></li>)}</ul></details>}</div>
      <div className="dialog-footer"><button className="primary-button" disabled={!canAdd} onClick={()=>{onAdd(id!);onClose();}}><Plus size={17} aria-hidden="true" /> Add {pokemon.name} to team</button></div>
    </>}
  </dialog>;
}
