import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { Undo2 } from 'lucide-react';
import { pokemonIdentity } from './data/dataset';
import { gameCatalogue } from './data/game-catalogue';
import { gameLoadMessage, loadGame } from './data/game-loader';
import type { GameData } from './domain/types';
import { AppHeader, type PlannerPage } from './components/AppHeader';
import { AppFooter } from './components/AppFooter';
import { GameContext } from './features/planner/GameContext';
import { PlannerSettings } from './features/planner/PlannerSettings';
import { createInitialState, plannerReducer } from './features/planner/state';
import { createGameSelection } from './features/planner/game-selection';
import { useAvailability } from './features/planner/use-availability';
import { TeamSlots } from './features/team/TeamSlots';
import { TeamBar } from './features/team/TeamBar';
import { TeamWarnings } from './features/team/TeamWarnings';
import { TypeAnalysis } from './features/team/TypeAnalysis';
import { PokemonSearch } from './features/progress/PokemonSearch';
import { AcquisitionDetails } from './components/AcquisitionDetails';
import { ExportTeamButton } from './features/export/ExportTeamButton';
import { FullGamePlanner } from './features/full-game/FullGamePlanner';

export default function App({ initialGame }: { initialGame: GameData }) {
  const [state,dispatch] = useReducer(plannerReducer,initialGame,createInitialState);
  const [game,setGame] = useState(initialGame);
  const [loadingGameId,setLoadingGameId] = useState<string|null>(null);
  const [gameError,setGameError] = useState<string|null>(null);
  const currentState = useRef(state);
  const currentGame = useRef(game);
  useLayoutEffect(() => { currentState.current = state; currentGame.current = game; }, [state, game]);
  const [canUndoGame,setCanUndoGame] = useState(false);
  const undoButton = useRef<HTMLButtonElement>(null);
  const [page,setPage] = useState<PlannerPage>('team');
  const [activeSlot,setActiveSlot] = useState<number|null>(null);
  const [details,setDetails] = useState<string|null>(null);
  const [announcement,setAnnouncement] = useState('');
  const main = useRef<HTMLElement>(null);
  const teamSlots = useRef<HTMLDivElement>(null);
  const progressUnavailable = page !== 'team' && game.game.planner === null;
  const progressPage = page === 'progress' && !progressUnavailable;
  const {snapshot,loading,error} = useAvailability(state, progressPage);
  const gameOption = gameCatalogue.find(option => option.id === state.gameId)!;
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', gameOption.accentColor);
  }, [game, gameOption]);
  const team = state.team.filter((id):id is string=>id!==null);
  const [gameSelection] = useState(() => createGameSelection({
    getState: () => currentState.current,
    getGame: () => currentGame.current,
    loadGame,
    onLoading: setLoadingGameId,
    onError: error => {
      if (!error) { setGameError(null); return; }
      const message = gameLoadMessage(error);
      console.error('Game data failed:', message); setGameError(message);
    },
    onChange: (next, nextState) => {
      currentGame.current = next; currentState.current = nextState;
      setGame(next);
      dispatch({type:'restore',state:nextState});
      setActiveSlot(null); setDetails(null);
      setAnnouncement(`Switched to ${next.game.name}.`);
    },
    onUndoAvailable: available => {
      if (!available && undoButton.current === document.activeElement) document.querySelector<HTMLElement>('.game-selector > summary')?.focus();
      setCanUndoGame(available);
      if (available) setAnnouncement(`Switched to ${currentGame.current.game.name}. Undo is available for five seconds.`);
    },
  }));
  useEffect(() => () => gameSelection.dispose(), [gameSelection]);
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
    <AppHeader gameId={state.gameId} onGameChange={gameSelection.select} page={page} onPageChange={setPage} />
    {canUndoGame && <div className="game-change-notice" role="group" aria-label="Game change">
      <p>Switched to <strong>{game.game.name}</strong>.</p>
      <button ref={undoButton} type="button" className="secondary-button" onClick={() => gameSelection.undo()}><Undo2 size={17} aria-hidden="true" />Undo</button>
    </div>}
    {!progressUnavailable && page !== 'full-game' && <TeamBar team={state.team} teamRef={teamSlots} activeSlot={activeSlot} onChoose={choose} onDetails={setDetails} onRemove={remove} />}
    <div className="app-shell">
      {loadingGameId && <p role="status">Loading {gameCatalogue.find(option=>option.id===loadingGameId)!.name}…</p>}
      {gameError && <div className="error-message" role="alert"><strong>The selected game could not load.</strong><p>{gameError}</p><p>Select the game again to retry.</p></div>}
      {progressPage && <PlannerSettings state={state} dispatch={dispatch} />}
      <main ref={main} id="main" tabIndex={-1}>
        <div className="section-heading planner-heading"><h1>{page === 'team' ? 'Team planner' : page === 'full-game' ? 'Full game planner' : 'Progress planner'}</h1>{!progressUnavailable && page !== 'full-game' && <ExportTeamButton key={page} state={state} progressPage={progressPage} snapshot={snapshot} />}</div>
        {progressUnavailable ? <section className="empty-results" aria-labelledby="progress-not-ready-title"><h2 id="progress-not-ready-title">{page === 'full-game' ? 'Full Game' : 'Progress Planner'} is not available for {game.game.name} yet.</h2><p>You can still build a team and check its types.</p><button className="secondary-button" onClick={()=>{setPage('team');main.current?.focus();}}>Open Team Planner</button></section> : <>
        {game.game.planner === null && <p className="field-hint" role="status">You can still use the Team Planner for {game.game.name}. Progress planning is not available yet.</p>}
        {progressPage && error && <div className="error-message" role="alert"><strong>The guide could not check access.</strong><p>{error}</p><button className="secondary-button" onClick={()=>window.location.reload()}>Reload guide</button></div>}
        <section className="team-section" aria-labelledby="team-title">
          <h2 id="team-title" className={page === 'full-game' ? '' : 'sr-only'}>{page === 'full-game' ? 'Your final team' : 'Your team'}</h2>
          {page === 'full-game' && <p className="final-team-hint">Choose six Pokémon for the Elite Four and Champion. This team is shared with the other planners.</p>}
          <div ref={teamSlots}><TeamSlots team={state.team} snapshot={progressPage ? snapshot : null} progressPage={progressPage} activeSlot={activeSlot} onChoose={choose} onDetails={setDetails} onRemove={remove} /></div>
          {progressPage && (snapshot ? <TeamWarnings snapshot={snapshot} team={team} target={state.target} onDetails={setDetails} /> : <p className="loading-note" role="status"><span className="loading-dot" />Checking team access{state.respectLevelLimit?' with the level limit':' without the level limit'}…</p>)}
        </section>
        {page==='team' && <TypeAnalysis team={state.team} />}
        {page === 'full-game' && <FullGamePlanner key={`full-game-${state.gameId}`} state={state} dispatch={dispatch} />}
        <PokemonSearch key={state.gameId} snapshot={snapshot} target={state.target} progressPage={page==='progress'} team={state.team} activeSlot={activeSlot} onAdd={add} onDetails={setDetails} onCancel={()=>setActiveSlot(null)} />
        </>}
      </main>
    </div>
    <AppFooter />
    <div className="sr-only" role="status" aria-live="polite">{announcement}</div>
    <AcquisitionDetails onNavigate={setDetails} id={details} snapshot={snapshot} progressPage={progressPage} onClose={()=>setDetails(null)} onAdd={add} canAdd={activeSlot!==null || state.team.includes(null)} />
    {progressPage && loading && <span className="sr-only" aria-live="polite">Checking Pokémon availability.</span>}
  </GameContext>;
}
