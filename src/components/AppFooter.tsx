import { ArrowUp } from 'lucide-react';
import { assetUrl } from '../data/asset-url';
import { GithubMark } from './GithubMark';
import { RouteSixMark } from './RouteSixMark';

const repositoryUrl = 'https://github.com/luisleineweber/route-six';
const newTab = <span className="sr-only"> (opens in a new tab)</span>;

export function AppFooter() {
  return <footer className="app-footer">
    <div className="footer-inner">
      <div className="footer-top">
        <p className="footer-brand"><RouteSixMark />Route Six</p>
        <p className="footer-session">Plans reset when you reload. Export a PNG to keep your team.</p>
        <div className="footer-links">
          <a className="footer-github" href={repositoryUrl} target="_blank" rel="noopener noreferrer"><GithubMark /><span className="footer-github-label">View on GitHub</span>{newTab}</a>
          <a className="footer-link" href="#main">Back to planner<ArrowUp size={16} aria-hidden="true" /></a>
        </div>
      </div>
      <div className="footer-meta">
        <p className="footer-credits">
          Sprites from <a href="https://github.com/PokeAPI/sprites" target="_blank" rel="noopener noreferrer">PokeAPI{newTab}</a>
          {' · '}Type icons by <a href="https://github.com/partywhale/pokemon-type-icons" target="_blank" rel="noopener noreferrer">partywhale{newTab}</a>
          {' '}(<a href={assetUrl('/types/LICENSE.txt')} target="_blank" rel="noopener noreferrer">MIT licence{newTab}</a>)
        </p>
        <p>Unofficial fan project, not affiliated with Nintendo, Game Freak, or The Pokémon Company.</p>
      </div>
    </div>
  </footer>;
}
