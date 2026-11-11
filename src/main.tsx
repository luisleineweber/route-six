import { Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { StartupScreen } from './components/StartupScreen';
import './styles.css';

class ErrorBoundary extends Component<{children:ReactNode},{error:string|null}> {
  state = {error:null as string|null};
  static getDerivedStateFromError(error:Error) {return {error:error.message};}
  componentDidCatch(error:Error) {console.error('Planner failed:',error);}
  render() {return this.state.error ? <main className="startup-error" role="alert"><h1>The planner could not start.</h1><p>{this.state.error}</p><button onClick={()=>window.location.reload()}>Reload planner</button></main> : this.props.children;}
}
const root = createRoot(document.getElementById('root')!);
root.render(<StartupScreen />);
const initialGame = Promise.all([import('./data/game-loader'), import('./data/game-registry')]).then(async ([{loadGame, gameLoadMessage}, {defaultGameId}]) => {
  const result = await loadGame(defaultGameId);
  if (!result.ok) throw new Error(gameLoadMessage(result.error));
  return result.value;
});
Promise.all([import('./App'), initialGame]).then(([{default:App}, game])=>{
  root.render(<ErrorBoundary><App initialGame={game} /></ErrorBoundary>);
}).catch(error=>{
  console.error('Planner data failed:',error);
  root.render(<main className="startup-error" role="alert"><h1>The guide could not load its data.</h1><p>{String(error)}</p><button onClick={()=>window.location.reload()}>Reload guide</button></main>);
});
