import { useEffect, useReducer, useRef, useState } from 'react';
import { Compass, Map, Users } from 'lucide-react';
import { pokemonIdentity } from './data/dataset';
import { pokemonSelections, selectionId } from './domain/pokemon-selection';
import { gameCatalogue } from './data/game-catalogue';
import { gameLoadMessage, loadGame } from './data/game-loader';
import type { GameData } from './domain/types';
import { GameSelector } from './components/GameSelector';
import { GameContext } from './features/planner/GameContext';
import { PlannerSettings } from './features/planner/PlannerSettings';
import { createInitialState, plannerReducer } from './features/planner/state';
import { useAvailability } from './features/planner/use-availability';
import { TeamSlots } from './features/team/TeamSlots';
import { TeamBar } from './features/team/TeamBar';
import { TeamWarnings } from './features/team/TeamWarnings';
import { TypeAnalysis } from './features/team/TypeAnalysis';
import { PokemonSearch } from './features/progress/PokemonSearch';
import { AcquisitionDetails } from './components/AcquisitionDetails';
import { ExportTeamButton } from './features/export/ExportTeamButton';

const pages = [
  { id: 'team', name: 'Team Planner', title: 'Team planner', Icon: Users },
  { id: 'progress', name: 'Progress Planner', title: 'Progress planner', Icon: Compass },
] as const;

export default function App({ initialGame }: { initialGame: GameData }) {
  const [state,dispatch] = useReducer(plannerReducer,initialGame,createInitialState);
  const [game,setGame] = useState(initialGame);
  const [loadingGameId,setLoadingGameId] = useState<string|null>(null);
  const [gameError,setGameError] = useState<string|null>(null);
  const gameRequest = useRef(0);
  const [page,setPage] = useState<'team'|'progress'>('team');
  const [activeSlot,setActiveSlot] = useState<number|null>(null);
  const [details,setDetails] = useState<string|null>(null);
  const [announcement,setAnnouncement] = useState('');
  const main = useRef<HTMLElement>(null);
  const teamSlots = useRef<HTMLDivElement>(null);
  const progressUnavailable = page === 'progress' && game.game.planner === null;
  const progressPage = page === 'progress' && !progressUnavailable;
  const {snapshot,loading,error} = useAvailability(state, progressPage);
  const gameOption = gameCatalogue.find(option => option.id === state.gameId)!;
  useEffect(() => {
    document.title = `${game.game.name} · Pokémon Field Guide`;
    document.documentElement.style.setProperty('--accent', gameOption.accentColor);
  }, [game, gameOption]);
  const team = state.team.filter((id):id is string=>id!==null);
  const selectGame = async (id: string) => {
    const request = ++gameRequest.current;
    setGameError(null);
    if (id === state.gameId) { setLoadingGameId(null); return; }
    setLoadingGameId(id);
    const result = await loadGame(id);
    if (request !== gameRequest.current) return;
    setLoadingGameId(null);
    if (!result.ok) {
      const message = gameLoadMessage(result.error);
      console.error('Game data failed:', message); setGameError(message); return;
    }
    const next = result.value;
    setGame(next);
    dispatch({type:'game',gameId:id,milestoneId:next.game.planner?.defaultMilestoneId ?? null,pokemonIds:pokemonSelections(next).map(profile=>selectionId(profile.pokemonId,profile.formId))});
    setActiveSlot(null); setDetails(null);
  };
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
    setAnnouncement(`${pokemonIdentity(id).name} added to slot ${slot+1}.`);
  };
  const remove = (slot:number) => {
    dispatch({type:'remove',slot});
    if(activeSlot===slot)setActiveSlot(null);
    setAnnouncement(`Slot ${slot+1} is now empty.`);
  };
  return <GameContext value={game}>
    <a className="skip-link" href="#main">Skip to planner</a>
    <header className="app-header">
      <div className="header-inner">
        <div className="header-planners">
        <p className="brand"><Map size={28} aria-hidden="true" /><span>Pokémon<br />Field Guide</span></p>
        <nav className="planner-nav" aria-label="Planner pages">{pages.map(({id,name,Icon}) => <button key={id} className={page===id?'selected':''} aria-current={page===id?'page':undefined} onClick={()=>setPage(id)}><Icon size={18} aria-hidden="true" /> {name}</button>)}</nav>
        </div>
        <GameSelector gameId={state.gameId} onChange={selectGame} />
      </div>
    </header>
    {!progressUnavailable && <TeamBar team={state.team} teamRef={teamSlots} activeSlot={activeSlot} onChoose={choose} onDetails={setDetails} onRemove={remove} />}
    <div className="app-shell">
      {loadingGameId && <p role="status">Loading {gameCatalogue.find(option=>option.id===loadingGameId)!.name}…</p>}
      {gameError && <div className="error-message" role="alert"><strong>The selected game could not load.</strong><p>{gameError}</p><p>Select the game again to retry.</p></div>}
      {progressPage && <PlannerSettings state={state} dispatch={dispatch} />}
      <main ref={main} id="main" tabIndex={-1}>
        <div className="section-heading planner-heading"><h1>{pages.find(p=>p.id===page)!.title}</h1>{!progressUnavailable && <ExportTeamButton key={page} state={state} progressPage={progressPage} snapshot={snapshot} />}</div>
        {progressUnavailable ? <section className="empty-results" aria-labelledby="progress-not-ready-title"><h2 id="progress-not-ready-title">Progress data is not ready yet</h2><p>You can build a team and check its types for {game.game.name}. Access checks are still under review.</p><button className="secondary-button" onClick={()=>setPage('team')}>Open Team Planner</button></section> : <>
        {game.game.planner === null && <p className="field-hint" role="status">Team Planner is ready for {game.game.name}. Progress checks are still under review.</p>}
        {progressPage && error && <div className="error-message" role="alert"><strong>The guide could not check access.</strong><p>{error}</p><button className="secondary-button" onClick={()=>window.location.reload()}>Reload guide</button></div>}
        <section className="team-section" aria-labelledby="team-title">
          <h2 id="team-title" className="sr-only">Your team</h2>
          <div ref={teamSlots}><TeamSlots team={state.team} snapshot={progressPage ? snapshot : null} progressPage={progressPage} activeSlot={activeSlot} onChoose={choose} onDetails={setDetails} onRemove={remove} /></div>
          {progressPage && (snapshot ? <TeamWarnings snapshot={snapshot} team={team} target={state.target} /> : <p className="loading-note" role="status"><span className="loading-dot" />Checking team access{state.respectLevelLimit?' with the level limit':' without the level limit'}…</p>)}
        </section>
        {page==='team' && <TypeAnalysis team={state.team} />}
        <PokemonSearch key={`${state.gameId}:${state.target}`} snapshot={snapshot} target={state.target} progressPage={page==='progress'} team={state.team} activeSlot={activeSlot} onAdd={add} onDetails={setDetails} onCancel={()=>setActiveSlot(null)} />
        </>}
      </main>
    </div>
    <footer className="app-footer"><p>{game.profiles.length} species · Local game data · <a href="/docs/mvp-plan.html" target="_blank" rel="noreferrer">MVP specification</a></p></footer>
    <div className="sr-only" role="status" aria-live="polite">{announcement}</div>
    <AcquisitionDetails onNavigate={setDetails} id={details} snapshot={snapshot} progressPage={progressPage} onClose={()=>setDetails(null)} onAdd={add} canAdd={activeSlot!==null || state.team.includes(null)} />
    {progressPage && loading && <span className="sr-only" aria-live="polite">The guide is checking the selected progress and level setting.</span>}
  </GameContext>;
}
