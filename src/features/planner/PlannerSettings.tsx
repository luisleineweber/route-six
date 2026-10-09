import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { GameLogo } from '../../components/GameLogo';
import { emerald } from '../../data/dataset';
import type { Milestone, PlanningTarget } from '../../domain/types';
import type { PlannerAction, PlannerState } from './state';
import { useMediaQuery, wideLayout } from './use-media-query';

const targets: { id: PlanningTarget; name: string; description: string }[] = [
  { id: 'whole-game', name: 'Whole game', description: 'Keep future team members in your plan.' },
  { id: 'current-progress', name: 'Current progress', description: 'Check the team you can obtain now.' },
];

const bossName = (id: string) => emerald.bosses.find(b => b.id === id)!.name;
const sectionOf = (m: Milestone) => m.phase === 'post-game' ? 'Post-game' : m.nextBossId ? `Before ${bossName(m.nextBossId)}` : 'Hall of Fame';

export function PlannerSettings({ state, dispatch }: { state: PlannerState; dispatch: React.Dispatch<PlannerAction> }) {
  const [search, setSearch] = useState('');
  const wide = useMediaQuery(wideLayout);
  const { game } = emerald;
  const milestone = emerald.milestones.find(m => m.id === state.milestoneId)!;
  const boss = emerald.bosses.find(b => b.id === milestone.nextBossId);
  const target = targets.find(t => t.id === state.target)!;
  const query = search.toLowerCase();
  const matchCount = emerald.milestones.filter(m => m.name.toLowerCase().includes(query)).length;
  const options = emerald.milestones.filter(m => m.name.toLowerCase().includes(query) || m.id === state.milestoneId);
  const sections = [...new Set(options.map(sectionOf))];
  const update = (values: Partial<PlannerState>) => dispatch({ type: 'settings', values });
  return <aside className="settings" aria-label="Planner settings">
    <details open={wide}>
      <summary className="settings-summary">
        <GameLogo gameId={state.gameId} size={36} />
        <span className="summary-text"><strong>{game.name}</strong><span>{milestone.name} · {target.name}</span></span>
        <ChevronDown className="chevron" size={18} aria-hidden="true" />
      </summary>
      <div className="game-tile">
        <GameLogo gameId={state.gameId} size={48} />
        <div><p className="game-name">{game.name}</p><p className="game-meta">{game.region} · Generation {game.generation}</p></div>
      </div>
      <div className="settings-fields">
        <div className="field">
          <label htmlFor="milestone-search">Find a route or event</label>
          <input id="milestone-search" type="search" placeholder="For example, Route 110" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <p className="field-hint" role="status">{matchCount ? `${matchCount} matching progress ${matchCount === 1 ? 'point' : 'points'}.` : 'No match. Your current progress stays selected.'}</p>}
        </div>
        <div className="field">
          <label htmlFor="milestone">Current progress</label>
          <select id="milestone" value={state.milestoneId} onChange={e => update({ milestoneId: e.target.value })}>
            {sections.map(section => <optgroup key={section} label={section}>{options.filter(m => sectionOf(m) === section)
              .map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>)}
          </select>
        </div>
        <fieldset className="field segmented">
          <legend>Planning target</legend>
          <div className="segments">{targets.map(option => <label key={option.id} className="segment">
            <input type="radio" name="target" checked={state.target === option.id} onChange={() => update({ target: option.id })} />
            <span>{option.name}</span>
          </label>)}</div>
          <p className="field-hint">{target.description}</p>
        </fieldset>
        <div className="field">
          <label className="switch-row">
            <span>Use the level limit</span>
            <span className="switch-control"><span className="switch-state" aria-hidden="true">{state.respectLevelLimit ? 'On' : 'Off'}</span>
              <input className="switch" type="checkbox" role="switch" checked={state.respectLevelLimit} onChange={e => update({ respectLevelLimit: e.target.checked })} /></span>
          </label>
          <p className="field-hint">{boss ? <>Next opponent: <strong>{boss.name}</strong>. Highest level: {boss.highestLevel}.</> : 'League complete. No level limit applies.'}</p>
        </div>
        <details className="settings-help"><summary>How access works <ChevronDown className="chevron" size={16} aria-hidden="true" /></summary>
          <p>The guide checks what you could obtain. It does not track your bag, current levels, or missed catches. Turning the limit off changes level checks only. Optional visits stay separate.</p></details>
      </div>
    </details>
  </aside>;
}
