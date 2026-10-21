import { Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

class ErrorBoundary extends Component<{children:ReactNode},{error:string|null}> {
  state = {error:null as string|null};
  static getDerivedStateFromError(error:Error) {return {error:error.message};}
  componentDidCatch(error:Error) {console.error('Planner failed:',error);}
  render() {return this.state.error ? <main className="startup-error" role="alert"><h1>The planner could not start.</h1><p>{this.state.error}</p><button onClick={()=>window.location.reload()}>Reload planner</button></main> : this.props.children;}
}
const root = createRoot(document.getElementById('root')!);
root.render(<main className="startup-error" role="status"><h1>Opening the Pokémon Field Guide…</h1></main>);
Promise.all([import('./App'), import('./data/game-loader'), import('./data/game-registry')]).then(async ([{default:App}, {loadGame, gameLoadMessage}, {defaultGameId}])=>{
  const result = await loadGame(defaultGameId);
  if (!result.ok) throw new Error(gameLoadMessage(result.error));
  root.render(<ErrorBoundary><App initialGame={result.value} /></ErrorBoundary>);
}).catch(error=>{
  console.error('Planner data failed:',error);
  root.render(<main className="startup-error" role="alert"><h1>The guide could not load its data.</h1><p>{String(error)}</p><button onClick={()=>window.location.reload()}>Reload guide</button></main>);
});
