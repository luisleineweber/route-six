import { Component, type ReactNode } from 'react';
import App from './App';
import { gameLoadMessage, loadGame } from './data/game-loader';
import { defaultGameId } from './data/game-registry';
import type { GameData } from './domain/types';

class StartupErrorBoundary extends Component<{children:ReactNode},{error:string|null}> {
  state = {error:null as string|null};
  static getDerivedStateFromError(error:Error) {return {error:error.message};}
  componentDidCatch(error:Error) {console.error('Planner failed:',error);}
  render() {return this.state.error ? <main className="startup-error" role="alert"><h1>The planner could not start.</h1><p>{this.state.error}</p><button onClick={()=>window.location.reload()}>Reload planner</button></main> : this.props.children;}
}

/** Loads the game that the start page shows. The build and the browser use the same game. */
export async function loadStartGame(): Promise<GameData> {
  const result = await loadGame(defaultGameId);
  if (!result.ok) throw new Error(gameLoadMessage(result.error));
  return result.value;
}

/** The complete start page. The build renders it to HTML; the browser hydrates the same tree. */
export function PlannerRoot({ game }: { game: GameData }) {
  return <StartupErrorBoundary><App initialGame={game} /></StartupErrorBoundary>;
}
