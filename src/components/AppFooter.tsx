import { ArrowUp, BookOpen, ChevronDown, ExternalLink } from 'lucide-react';
import { RouteSixMark } from './RouteSixMark';
import { useGameData } from '../features/planner/GameContext';

export function AppFooter() {
  const { game, profiles } = useGameData();
  const siteUrl = import.meta.env.VITE_SITE_URL?.trim();

  return <footer className="app-footer">
    <div className="footer-inner">
      <div className="footer-main">
        <section className="footer-about" aria-labelledby="footer-brand">
          <h2 id="footer-brand" className="footer-brand"><RouteSixMark />Route Six</h2>
          <p>Team planning and encounter guidance for your next playthrough.</p>
          <p className="footer-session">Plans reset when you reload. Export your team to keep a copy.</p>
        </section>

        <section className="footer-guide" aria-labelledby="footer-game">
          <h2 id="footer-game">{game.name}</h2>
          <dl className="footer-facts">
            <div><dt>Region</dt><dd>{game.region}</dd></div>
            <div><dt>Generation</dt><dd>{game.generation}</dd></div>
            <div><dt>Catalogue</dt><dd>{profiles.length} species</dd></div>
            <div><dt>Planner support</dt><dd>{game.planner ? 'Team & Progress' : 'Team Planner'}</dd></div>
          </dl>
          {!game.planner && <p className="footer-review-note">Progress planning is not available for this game yet.</p>}
        </section>

        <section className="footer-project" aria-labelledby="footer-project-title">
          <h2 id="footer-project-title">Follow Route Six</h2>
          <p className="footer-project-promo">More playthrough guides are on the way.</p>
          {siteUrl ? <a className="footer-project-link" href={siteUrl} target="_blank" rel="noopener noreferrer">
            <span>Visit the Route Six site</span>
            <ExternalLink size={15} aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a> : <p className="footer-project-coming-soon">Project link coming soon.</p>}
          <details className="footer-credits">
            <summary><BookOpen size={16} aria-hidden="true" />Sources & credits<ChevronDown size={16} className="footer-credits-chevron" aria-hidden="true" /></summary>
            <div className="footer-credits-content">
              <p>These links show the sources used for game details.</p>
              <ul>
                <li><a href="https://github.com/PokeAPI/sprites" target="_blank" rel="noopener noreferrer">Pokémon sprites from PokeAPI<span className="sr-only"> (opens in a new tab)</span></a></li>
                <li><a href="https://github.com/partywhale/pokemon-type-icons" target="_blank" rel="noopener noreferrer">Type icons by partywhale<span className="sr-only"> (opens in a new tab)</span></a> (<a href="/types/LICENSE.txt" target="_blank" rel="noopener noreferrer">MIT licence<span className="sr-only"> (opens in a new tab)</span></a>)</li>
              </ul>
            </div>
          </details>
        </section>
      </div>

      <div className="footer-bottom">
        <p>An unofficial fan project, not affiliated with Nintendo, Game Freak, or The Pokémon Company. Pokémon names and artwork belong to their respective owners.</p>
        <a className="footer-back" href="#main">Back to planner<ArrowUp size={16} aria-hidden="true" /></a>
      </div>
    </div>
  </footer>;
}
