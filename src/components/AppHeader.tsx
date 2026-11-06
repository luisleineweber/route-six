import { Compass, Route, Users } from 'lucide-react';
import { GameSelector } from './GameSelector';
import { RouteSixMark } from './RouteSixMark';

export type PlannerPage = 'team' | 'progress' | 'full-game';

const pages = [
  { id: 'team', name: 'Team Planner', description: 'Your six Pokémon and their types', Icon: Users },
  { id: 'progress', name: 'Progress Planner', description: 'Where and when to find your team', Icon: Compass },
  { id: 'full-game', name: 'Full Game', description: 'Build each team toward the League', Icon: Route },
] as const;

export function AppHeader({ gameId, onGameChange, page, onPageChange }: {
  gameId: string;
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
      <GameSelector gameId={gameId} onChange={onGameChange} />
      <nav className="planner-nav" aria-label="Planner pages">
        {pages.map(({ id, name, description, Icon }) => <button type="button" key={id}
          className={page === id ? 'selected' : ''}
          aria-current={page === id ? 'page' : undefined}
          onClick={() => onPageChange(id)}>
          <Icon size={21} aria-hidden="true" />
          <span className="planner-nav-copy"><span>{name}</span><span>{description}</span></span>
        </button>)}
      </nav>
    </div>
  </header>;
}
