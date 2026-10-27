import { Compass, Users } from 'lucide-react';
import { GameSelector } from './GameSelector';
import { RouteSixMark } from './RouteSixMark';

export type PlannerPage = 'team' | 'progress';

const pages = [
  { id: 'team', name: 'Team Planner', description: 'Your six Pokémon and their types', Icon: Users },
  { id: 'progress', name: 'Progress Planner', description: 'Where and when to find your team', Icon: Compass },
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
          aria-labelledby={`${id}-planner-label`}
          aria-describedby={`${id}-planner-description`}
          onClick={() => onPageChange(id)}>
          <Icon size={21} aria-hidden="true" />
          <span className="planner-nav-copy"><span id={`${id}-planner-label`}>{name}</span><span id={`${id}-planner-description`}>{description}</span></span>
        </button>)}
      </nav>
    </div>
  </header>;
}
