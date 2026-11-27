import { GameSelector } from './GameSelector';
import { RouteSixMark } from './RouteSixMark';
import { ThemeToggle } from './ThemeToggle';

export type PlannerPage = 'team' | 'progress' | 'full-game';

export const plannerPages = [
  { id: 'team', name: 'Team Planner' },
  { id: 'progress', name: 'Progress Planner' },
  { id: 'full-game', name: 'Full Game Planner' },
] as const;

export function AppHeader({ gameId, loadingGameId, onGameChange, page, onPageChange }: {
  gameId: string;
  loadingGameId: string | null;
  onGameChange: (id: string) => void;
  page: PlannerPage;
  onPageChange: (page: PlannerPage) => void;
}) {
  return <header className="app-header">
    <div className="header-inner">
      <p className="brand">
        <RouteSixMark />
        <span className="brand-copy"><strong>Route Six</strong><span>Pokémon playthrough planner</span></span>
      </p>
      <GameSelector gameId={gameId} loadingGameId={loadingGameId} onChange={onGameChange} />
      <nav className="planner-nav" aria-label="Planner pages">
        {plannerPages.map(({ id, name }) => <button type="button" key={id}
          className={page === id ? 'selected' : ''}
          aria-current={page === id ? 'page' : undefined}
          onClick={() => onPageChange(id)}>{name}</button>)}
      </nav>
      <ThemeToggle />
    </div>
  </header>;
}
