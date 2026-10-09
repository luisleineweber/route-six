import { useReducer, useRef, useState } from 'react';
import { Compass, Users } from 'lucide-react';
import { pokemonById } from './data/dataset';
import { PlannerSettings } from './features/planner/PlannerSettings';
import { initialState, plannerReducer } from './features/planner/state';
import { useAvailability } from './features/planner/use-availability';
import { TeamSlots } from './features/team/TeamSlots';
import { TeamWarnings } from './features/team/TeamWarnings';
import { TypeAnalysis } from './features/team/TypeAnalysis';
import { PokemonSearch } from './features/progress/PokemonSearch';
import { AcquisitionDetails } from './components/AcquisitionDetails';

const pages = [
  { id: 'team', name: 'Team Planner', title: 'Team planner', Icon: Users },
  { id: 'progress', name: 'Progress Planner', title: 'Progress planner', Icon: Compass },
] as const;

export default function App() {
  const [state,dispatch] = useReducer(plannerReducer,initialState);
  const [page,setPage] = useState<'team'|'progress'>('team');
  const [activeSlot,setActiveSlot] = useState<number|null>(null);
  const [details,setDetails] = useState<string|null>(null);
  const [announcement,setAnnouncement] = useState('');
  const main = useRef<HTMLElement>(null);
  const {snapshot,loading,error} = useAvailability(state);
  const team = state.team.filter((id):id is string=>id!==null);
  const choose = (slot:number) => {
    setActiveSlot(slot);
    document.getElementById('pokemon-search')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    document.getElementById('pokemon-query')?.focus({preventScroll:true});
  };
  const add = (id:string) => {
    const slot = activeSlot??state.team.indexOf(null);
    if (slot<0) return;
    dispatch({type:'add',pokemonId:id,slot});
    setActiveSlot(null);
    setAnnouncement(`${pokemonById.get(id)!.name} added to slot ${slot+1}.`);
  };
  return <>
    <a className="skip-link" href="#main">Skip to planner</a>
    <header className="app-header">
      <div className="header-inner">
        <p className="brand">Hoenn Field Guide</p>
        <nav className="planner-nav" aria-label="Planner pages">{pages.map(({id,name,Icon}) => <button key={id} className={page===id?'selected':''} aria-current={page===id?'page':undefined} onClick={()=>setPage(id)}><Icon size={18} aria-hidden="true" /> {name}</button>)}</nav>
      </div>
    </header>
    <div className="app-shell">
      <PlannerSettings state={state} dispatch={dispatch} />
      <main ref={main} id="main" tabIndex={-1}>
        <div className="section-heading"><h1>{pages.find(p=>p.id===page)!.title}</h1><span className="count">{team.length} of 6 team members</span></div>
        {error && <div className="error-message" role="alert"><strong>The guide could not check access.</strong><p>{error}</p><button className="secondary-button" onClick={()=>window.location.reload()}>Reload guide</button></div>}
        <section className="team-section" aria-labelledby="team-title">
          <h2 id="team-title" className="sr-only">Your team</h2>
          <TeamSlots team={state.team} snapshot={snapshot} activeSlot={activeSlot} onChoose={choose} onDetails={setDetails} onRemove={slot=>{dispatch({type:'remove',slot});setAnnouncement(`Slot ${slot+1} is now empty.`);}} />
          {snapshot ? <TeamWarnings snapshot={snapshot} team={team} target={state.target} /> : <p className="loading-note" role="status"><span className="loading-dot" />Checking team access{state.respectLevelLimit?' with the level limit':' without the level limit'}…</p>}
        </section>
        {page==='team' && <TypeAnalysis team={team} />}
        <PokemonSearch snapshot={snapshot} target={state.target} progressPage={page==='progress'} team={state.team} activeSlot={activeSlot} onAdd={add} onDetails={setDetails} onCancel={()=>setActiveSlot(null)} />
      </main>
    </div>
    <footer className="app-footer"><p>386 species · Local game data · <a href="/docs/mvp-plan.html" target="_blank" rel="noreferrer">MVP specification</a></p></footer>
    <div className="sr-only" role="status" aria-live="polite">{announcement}</div>
    <AcquisitionDetails id={details} snapshot={snapshot} onClose={()=>setDetails(null)} onAdd={add} canAdd={activeSlot!==null || state.team.includes(null)} />
    {loading && <span className="sr-only" aria-live="polite">The guide is checking the selected progress and level setting.</span>}
  </>;
}
