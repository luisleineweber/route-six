import { createRoot, hydrateRoot } from 'react-dom/client';
import './styles.css';

const container = document.getElementById('root')!;
// The production build prerenders the start page into #root (scripts/prerender.ts).
// The development server serves the empty template, so it renders on the client.
const devRoot = import.meta.env.DEV ? createRoot(container) : null;
devRoot?.render(<main className="startup-error" role="status"><h1>Opening Route Six…</h1></main>);
import('./PlannerRoot').then(async ({ loadStartGame, PlannerRoot }) => {
  const page = <PlannerRoot game={await loadStartGame()} />;
  if (devRoot) devRoot.render(page);
  else hydrateRoot(container, page);
}).catch(error => {
  console.error('Planner data failed:', error);
  devRoot?.unmount();
  container.replaceChildren();
  createRoot(container).render(<main className="startup-error" role="alert"><h1>The guide could not load its data.</h1><p>{String(error)}</p><button onClick={()=>window.location.reload()}>Reload guide</button></main>);
});
