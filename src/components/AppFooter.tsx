import { ArrowUp, ExternalLink } from 'lucide-react';
import { assetUrl } from '../data/asset-url';
import { RouteSixMark } from './RouteSixMark';

const newTab = <span className="sr-only"> (opens in a new tab)</span>;

export function AppFooter() {
  const siteUrl = import.meta.env.VITE_SITE_URL?.trim();

  return <footer className="app-footer">
    <div className="footer-inner">
      <div className="footer-top">
        <p className="footer-brand"><RouteSixMark />Route Six</p>
        <p className="footer-session">Plans reset when you reload. Export your team as a PNG to keep a copy.</p>
        <div className="footer-links">
          {siteUrl && <a className="footer-link" href={siteUrl} target="_blank" rel="noopener noreferrer">Route Six site<ExternalLink size={14} aria-hidden="true" />{newTab}</a>}
          <a className="footer-link" href="#main">Back to planner<ArrowUp size={16} aria-hidden="true" /></a>
        </div>
      </div>
      <div className="footer-meta">
        <p className="footer-credits">
          Sprites from <a href="https://github.com/PokeAPI/sprites" target="_blank" rel="noopener noreferrer">PokeAPI{newTab}</a>
          {' · '}Type icons by <a href="https://github.com/partywhale/pokemon-type-icons" target="_blank" rel="noopener noreferrer">partywhale{newTab}</a>
          {' '}(<a href={assetUrl('/types/LICENSE.txt')} target="_blank" rel="noopener noreferrer">MIT licence{newTab}</a>)
        </p>
        <p>An unofficial fan project, not affiliated with Nintendo, Game Freak, or The Pokémon Company. Pokémon names and artwork belong to their respective owners.</p>
      </div>
    </div>
  </footer>;
}
