import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { dataset, emerald, pokemonById } from '../data/dataset';
import { PokemonSprite, PokemonTypes, TypeBadge } from './PokemonIdentity';
import { StatusLabel } from './StatusLabel';
import { damageMultiplier } from '../domain/team/analyze-types';
import { conditionText } from '../domain/availability/solve';
import type { AcquisitionPath, AvailabilitySnapshot } from '../domain/types';
import { RequirementList } from './RequirementList';

function PathDetails({ path, snapshot }: { path: AcquisitionPath; snapshot: AvailabilitySnapshot }) {
  const source = emerald.sources.find(s => s.id === (path.breedingSteps.length ? path.breedingSteps[0].sourceId : path.sourceIds[0]))!;
  const location = emerald.locations.find(l => l.id === source.locationId)!;
  const level = source.level.kind === 'range' ? `${source.level.minimum}–${source.level.maximum}` : source.level.kind === 'fixed' ? String(source.level.value) : 'matches the offered Pokémon';
  const fossilId = source.details.kind === 'fossil' ? source.details.itemId : null;
  return <details className="path-details"><summary><span className="path-title">{source.details.kind==='breeding'?'Day Care breeding':location.name}</span><span className="path-meta">Minimum Lv. {path.minimumLevel}</span><ChevronDown className="chevron" size={18} aria-hidden="true" /></summary>
    <div className="path-body"><p><strong>{source.details.kind === 'wild' ? `${source.details.method.replaceAll('-',' ')} encounter` : source.details.kind.replaceAll('-',' ')}</strong> at {location.name}. {source.details.kind==='wild' && `${source.details.ratePercent}% encounter slot rate.`} Source level: {level}.</p>
      {source.id.startsWith('feebas-six-tiles') && <p>Fish on one of the six Feebas tiles on Route 119. Each cast on these tiles has a 50% Feebas check.</p>}
      {source.id.startsWith('outbreak-') && <p>This source needs its TV outbreak report after the Hall of Fame. The outbreak adds a 50% species check on this route. It is separate from the ordinary encounter table.</p>}
      {source.id.startsWith('wild-mirage-island') && <p>A party Pokémon’s personality must match the daily Mirage Island value. Visit when the island appears.</p>}
      {source.id.includes('shoal-cave') && <p>Visit at the correct tide. The ice room needs low tide and Strength.</p>}
      {source.details.kind==='game-trade' && <p>Give {pokemonById.get(source.details.offeredPokemonId)!.name} to the game character. You receive a {source.genders.join('/')} {pokemonById.get(source.pokemonId)!.name} at the offered Pokémon’s level.</p>}
      {fossilId && <p>Give a {emerald.items.find(i=>i.id===fossilId)!.name} to the Devon researcher for revival. This consumes the fossil.</p>}
      <h4>Source requirements</h4><RequirementList requirement={{kind:'all',requirements:[location.requirements,source.requirements]}} />
      <p className="small">First access for this path: {path.firstMilestoneIds.map(id=>emerald.milestones.find(m=>m.id===id)!.name).join('; ')}.</p>
      {path.breedingSteps.map((step,i)=><div key={i}><h4>Parent pair</h4><ul>{step.parents.map((parent,j)=><li key={j}>{pokemonById.get(parent.pokemonId)!.name} ({parent.gender}){snapshot.paths[parent.pathId] ? ` · Minimum Lv. ${snapshot.paths[parent.pathId].minimumLevel}` : ''}<span className="small">{snapshot.paths[parent.pathId]?.sourceIds.map(id=>emerald.sources.find(s=>s.id===id)).filter(s=>s&&s.details.kind!=='breeding').slice(0,3).map(s=>emerald.locations.find(l=>l.id===s!.locationId)!.name).join(', ')}</span></li>)}</ul><p>Parents remain reusable. Eggs hatch at level 5. {emerald.breedingRules.find(r=>r.id===step.ruleId)!.requiredHeldItemId && `One parent must hold ${emerald.items.find(item=>item.id===emerald.breedingRules.find(r=>r.id===step.ruleId)!.requiredHeldItemId)!.name}. The held item is kept.`}</p></div>)}
      {path.evolutionIds.length>0 && <><h4>Evolution steps</h4><ol>{path.evolutionIds.map(id=>{const e=emerald.evolutions.find(e=>e.id===id)!;return <li key={id}>{pokemonById.get(e.fromPokemonId)!.name} → {pokemonById.get(path.coProductIds.includes(e.toPokemonId)?path.pokemonId:e.toPokemonId)!.name}: {e.trigger==='use-item'?`use ${emerald.items.find(i=>i.id===e.itemId)!.name}`:e.minimumLevel?`gain a level at Lv. ${e.minimumLevel} or higher`:'gain one level'}.{e.conditions.map((c,i)=><p key={i}>{conditionText(c)}</p>)}</li>;})}</ol></>}
      {!!path.choices.length && <><h4>Playthrough choices</h4><ul>{path.choices.map(c=><li key={c.groupId+c.optionId}>{emerald.choices.find(g=>g.id===c.groupId)!.name}: {pokemonById.get(c.optionId)?.name??emerald.items.find(i=>i.id===c.optionId)?.name??c.optionId}</li>)}</ul></>}
      {path.claims.some(c=>snapshot.resourceLimits[c.resourceId]!==null) && <p className="small">Finite resources: {path.claims.filter(c=>snapshot.resourceLimits[c.resourceId]!==null).map(c=>`${c.resourceId.replace(/^(source|item-source):/,'')} ×${c.quantity}`).join(', ')}.</p>}
    </div></details>;
}

export function AcquisitionDetails({ id, snapshot, onClose, onAdd, canAdd }: { id:string|null; snapshot:AvailabilitySnapshot|null; onClose:()=>void; onAdd:(id:string)=>void; canAdd:boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [showFuture,setShowFuture] = useState(false);
  const [count,setCount] = useState(12);
  useEffect(()=>{setShowFuture(false);setCount(12);if(id)dialog.current?.showModal();else dialog.current?.close();},[id]);
  const pokemon = id ? pokemonById.get(id)! : null;
  const entry = id ? snapshot?.entries[id] : null;
  const pathIds = entry ? showFuture ? [...entry.currentPathIds,...entry.futurePathIds] : entry.currentPathIds.length ? entry.currentPathIds : entry.futurePathIds : [];
  const paths = [...new Map(pathIds.map(pathId=>snapshot!.paths[pathId]).map(p=>[JSON.stringify([p.sourceIds,p.evolutionIds,p.choices,p.minimumLevel,p.breedingSteps]),p])).values()];
  return <dialog ref={dialog} className="acquisition-dialog" aria-labelledby="details-title" onCancel={onClose} onClick={e=>{if(e.target===dialog.current)onClose();}}>
    {pokemon && <><div className="dialog-head"><PokemonSprite id={pokemon.id} size="lg" /><div className="dialog-title"><h2 id="details-title">{pokemon.name}</h2><p className="dex-number">National Dex #{String(pokemon.nationalDex).padStart(3,'0')}</p><PokemonTypes id={pokemon.id} /></div><button className="icon-button" autoFocus onClick={onClose} aria-label="Close Pokémon details"><X size={20} aria-hidden="true" /></button></div>
      <div className="dialog-content">{entry ? <><div><StatusLabel status={entry.status} /></div>
        {entry.blockers.length>0 && <div className="detail-blockers"><h3>Requirements to check</h3><ul>{entry.blockers.map((b,i)=><li key={i}>{b.message.replace(/\b[a-z]+(?:-[a-z]+)*\b/g, word=>pokemonById.get(word)?.name??word)}</li>)}</ul></div>}
        {!!entry.firstMilestoneIds.length && <p className="first-access"><strong>First access:</strong> {entry.firstMilestoneIds.map(id=>emerald.milestones.find(m=>m.id===id)!.name).join('; ')}</p>}
        <div className="section-heading"><h3>Acquisition paths</h3>{entry.currentPathIds.length>0&&entry.futurePathIds.length>0&&<label className="check-label"><input type="checkbox" checked={showFuture} onChange={e=>setShowFuture(e.target.checked)} /> Include future sources</label>}</div>
        {paths.length ? <>{paths.slice(0,count).map(p=><PathDetails key={p.id} path={p} snapshot={snapshot!} />)}{paths.length>count&&<button className="secondary-button" onClick={()=>setCount(count+12)}>Show more paths ({paths.length-count} remaining)</button>}</> : <p>No valid acquisition path meets this query.</p>}
      </> : <p role="status">Checking the acquisition paths…</p>}
      <h3>Type weaknesses</h3><ul className="type-counts">{emerald.typeChart.typeIds.filter(type=>damageMultiplier(emerald,type,pokemon.id)>1).map(type=><li key={type}><TypeBadge type={type} /><span className="type-count">{damageMultiplier(emerald,type,pokemon.id)}×</span></li>)}</ul>{!emerald.typeChart.typeIds.some(type=>damageMultiplier(emerald,type,pokemon.id)>1)&&<p>No type weaknesses in Generation III.</p>}
      <details className="data-references"><summary>Game data references <ChevronDown className="chevron" size={16} aria-hidden="true" /></summary><p>Local manual data. Reviewed on 7 October 2026 against Emerald source revision {dataset.references[0].revision?.slice(0,7)}.</p><ul>{dataset.references.map(r=><li key={r.id}><a href={r.url} target="_blank" rel="noreferrer">{r.title}</a></li>)}</ul></details></div>
      <div className="dialog-footer"><button className="secondary-button" onClick={onClose}>Close details</button><button className="primary-button" disabled={!canAdd} onClick={()=>{onAdd(pokemon.id);onClose();}}><Plus size={17} aria-hidden="true" /> Add {pokemon.name} to team</button></div>
    </>}
  </dialog>;
}
