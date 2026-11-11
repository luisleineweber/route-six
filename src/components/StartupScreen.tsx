import { LoadingMark } from './Loading';

/** The first view while the planner code and the default game load. */
export function StartupScreen() {
  return <main className="startup-screen" role="status">
    <LoadingMark size="lg" />
    <h1>Route Six</h1>
    <p>Opening the planner…</p>
    <span className="startup-bar" aria-hidden="true" />
  </main>;
}
