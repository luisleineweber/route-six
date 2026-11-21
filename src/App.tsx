import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { GitCompareArrows, Undo2 } from 'lucide-react';
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
import { GameLoadingNotice } from './components/GameLoadingNotice';
import { LoadingNote } from './components/Loading';
import { comparisonReducer } from './features/compare/comparison-draft';
import { TeamComparison } from './features/compare/TeamComparison';

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
  const [comparison,dispatchComparison] = useReducer(comparisonReducer,null);
  const compareButton = useRef<HTMLButtonElement>(null);
  const returnToCompareButton = useRef(false);
  const progressUnavailable = page === 'progress' && game.game.planner === null;
  const progressPage = page === 'progress' && !progressUnavailable;
  // The comparison checks access with the same shared settings and one snapshot for both teams.
  const comparisonAccess = comparison !== null && game.game.planner !== null;
  const {snapshot,loading,error} = useAvailability(state, progressPage || comparisonAccess);
  const detailsWithAccess = progressPage || comparisonAccess;
  // Every add and remove action goes to the second team while the comparison is open.
  const editedTeam = comparison ? comparison.slots : state.team;
  const editedSlot = comparison ? comparison.activeSlot : activeSlot;
  const teamName = comparison ? 'second team' : 'team';
  useEffect(() => {
    if (comparison !== null || !returnToCompareButton.current) return;
    returnToCompareButton.current = false;
    compareButton.current?.focus();
  }, [comparison]);
  const gameOption = gameCatalogue.find(option => option.id === state.gameId)!;
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--game-hue', String(gameOption.accent.hue));
    root.setProperty('--game-chroma', String(gameOption.accent.chroma));
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
      dispatchComparison({type:'close'});
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
    if (comparison) dispatchComparison({type:'choose',slot}); else setActiveSlot(slot);
    document.getElementById('pokemon-search')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    document.getElementById('pokemon-query')?.focus({preventScroll:true});
  };
  const add = (id:string) => {
    const slot = editedSlot??editedTeam.indexOf(null);
    if (slot<0) return;
    if (comparison) dispatchComparison({type:'add',pokemonId:id,slot});
    else { dispatch({type:'add',pokemonId:id,slot}); setActiveSlot(null); }
    setAnnouncement(`${pokemonIdentity(id).name} added to ${comparison ? 'second team ' : ''}slot ${slot+1}.`);
  };
  const remove = (slot:number) => {
    if (comparison) dispatchComparison({type:'remove',slot});
    else { dispatch({type:'remove',slot}); if(activeSlot===slot)setActiveSlot(null); }
    setAnnouncement(`${comparison ? 'Second team s' : 'S'}lot ${slot+1} is now empty.`);
  };
  const cancelChoice = () => comparison ? dispatchComparison({type:'cancel'}) : setActiveSlot(null);
  const openComparison = () => { setActiveSlot(null); dispatchComparison({type:'open'}); };
  const closeComparison = () => { returnToCompareButton.current = true; dispatchComparison({type:'close'}); };
  const copyCurrentTeam = () => { dispatchComparison({type:'copy',team:state.team}); setAnnouncement('Current team copied to the second team.'); };
  const changePage = (next:PlannerPage) => { dispatchComparison({type:'close'}); setPage(next); };
  return <GameContext value={game}>
    <a className="skip-link" href="#main">Skip to planner</a>
    <AppHeader gameId={state.gameId} loadingGameId={loadingGameId} onGameChange={gameSelection.select} page={page} onPageChange={changePage} />
    {loadingGameId ? <GameLoadingNotice gameId={loadingGameId} /> : canUndoGame && <div className="game-change-notice" role="group" aria-label="Game change">
      <p>Switched to <strong>{game.game.name}</strong>.</p>
      <button ref={undoButton} type="button" className="secondary-button" onClick={() => gameSelection.undo()}><Undo2 size={17} aria-hidden="true" />Undo</button>
    </div>}
    {!progressUnavailable && <TeamBar key={comparison ? 'second-team' : 'team'} label={comparison ? 'Second team overview' : 'Team overview'} team={editedTeam} teamRef={teamSlots} activeSlot={editedSlot} onChoose={choose} onDetails={setDetails} onRemove={remove} />}
    <div className="app-shell" aria-busy={loadingGameId !== null}>
      {gameError && <div className="error-message" role="alert"><strong>The selected game could not load.</strong><p>{gameError}</p><p>Select the game again to retry.</p></div>}
      <main ref={main} id="main" tabIndex={-1}>
        {comparison ? <TeamComparison state={state} dispatch={dispatch} draft={comparison} draftRef={teamSlots} availability={{snapshot,loading,error}}
          onBack={closeComparison} onCopy={copyCurrentTeam} onChoose={choose} onRemove={remove} onDetails={setDetails} /> : <>
        <div className="section-heading planner-heading"><h1>{page === 'team' ? 'Team Planner' : 'Progress Planner'}</h1>{!progressUnavailable && <div className="planner-actions">
          {page === 'team' && <button ref={compareButton} type="button" className="secondary-button compare-button" onClick={openComparison}><GitCompareArrows size={18} aria-hidden="true" /><span className="compare-label-long">Compare teams</span><span className="compare-label-short">Compare</span></button>}
          <ExportTeamButton key={page} state={state} progressPage={progressPage} snapshot={snapshot} />
        </div>}</div>
        {progressPage && <PlannerSettings state={state} dispatch={dispatch} />}
        {progressUnavailable ? <section className="empty-results" aria-labelledby="progress-not-ready-title"><h2 id="progress-not-ready-title">Progress Planner is not available for {game.game.name} yet.</h2><p>You can still build a team and check its types.</p><button className="secondary-button" onClick={()=>{setPage('team');main.current?.focus();}}>Open Team Planner</button></section> : <>
        {game.game.planner === null && <p className="field-hint" role="status">You can still use the Team Planner for {game.game.name}. Progress planning is not available yet.</p>}
        {progressPage && error && <div className="error-message" role="alert"><strong>The guide could not check access.</strong><p>{error}</p><button className="secondary-button" onClick={()=>window.location.reload()}>Reload guide</button></div>}
        <section className="team-section" aria-labelledby="team-title">
          <h2 id="team-title" className="sr-only">Your team</h2>
          <div ref={teamSlots}><TeamSlots team={state.team} snapshot={progressPage ? snapshot : null} progressPage={progressPage} activeSlot={activeSlot} onChoose={choose} onDetails={setDetails} onRemove={remove} /></div>
          {progressPage && (snapshot ? <TeamWarnings snapshot={snapshot} team={team} target={state.target} onDetails={setDetails} /> : <LoadingNote title="Checking team access…" detail={state.respectLevelLimit ? 'Using the level limit for each team member.' : 'Checking without the level limit.'} />)}
        </section>
        {page==='team' && <TypeAnalysis team={state.team} />}
        </>}
        </>}
        {!progressUnavailable && <PokemonSearch key={state.gameId} snapshot={snapshot} target={state.target} progressPage={page==='progress' && !comparison} team={editedTeam} activeSlot={editedSlot} onAdd={add} onDetails={setDetails} onCancel={cancelChoice} teamName={teamName} />}
      </main>
    </div>
    <AppFooter />
    <div className="sr-only" role="status" aria-live="polite">{announcement}</div>
    <AcquisitionDetails onNavigate={setDetails} id={details} snapshot={snapshot} progressPage={detailsWithAccess} onClose={()=>setDetails(null)} onAdd={add} canAdd={editedSlot!==null || editedTeam.includes(null)} teamName={teamName} />
    {detailsWithAccess && loading && <span className="sr-only" aria-live="polite">Checking Pokémon availability.</span>}
  </GameContext>;
}
