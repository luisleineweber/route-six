import type { PlanningTarget } from '../../domain/types';
import type { PlannerAction, PlannerState } from './state';
import { useGameData } from './GameContext';
import { progressCheckpoints } from './progress-checkpoints';

const targets: { id: PlanningTarget; name: string; description: string }[] = [
  { id: 'whole-game', name: 'Whole game', description: 'Show all Pokémon you can obtain in this game.' },
  { id: 'current-progress', name: 'Current progress', description: 'Check the team you can obtain now.' },
];

export function PlannerSettings({ state, dispatch }: { state: PlannerState; dispatch: React.Dispatch<PlannerAction> }) {
  const game = useGameData();
  const milestone = game.milestones.find(m => m.id === state.milestoneId)!;
  const boss = game.bosses.find(b => b.id === milestone.nextBossId);
  const target = targets.find(t => t.id === state.target)!;
  const points = progressCheckpoints(game);
  const groupOf = (id: string, kind: string) => {
    if (id === game.game.firstMilestoneId) return 'Start';
    if (id === 'league') return 'Elite Four and Champion';
    const opponent = game.bosses.find(b => `${b.id}-defeated` === id);
    return opponent?.kind === 'gym' ? 'Gyms' : kind === 'boss' ? 'Elite Four and Champion' : 'Story battles';
  };
  const sections = ['Start', 'Gyms', 'Story battles', 'Elite Four and Champion'];
  const update = (values: Partial<PlannerState>) => dispatch({ type: 'settings', values });
  return <section className="settings" aria-label="Planner settings">
      <div className="settings-fields">
        <div className="field">
          <label htmlFor="milestone">Current progress</label>
          <select id="milestone" value={state.milestoneId} onChange={e => update({ milestoneId: e.target.value })}>
            {sections.map(section => <optgroup key={section} label={section}>{points.filter(m => groupOf(m.id, m.kind) === section)
              .map(m => <option key={m.id} value={m.id}>{m.id === game.game.firstMilestoneId ? 'Start of game' : m.id === 'league' ? 'Elite Four' : m.name.replace(/^Defeat /, 'After defeating ')}</option>)}</optgroup>)}
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
          <label className="level-label" htmlFor="level-limit">Use the level limit</label>
          <label className="switch-row" htmlFor="level-limit">
            <span>{boss ? `${boss.name} · Lv. ${boss.highestLevel}` : 'League complete'}</span>
            <span className="switch-control"><span className="switch-state" aria-hidden="true">{state.respectLevelLimit ? 'On' : 'Off'}</span>
              <input id="level-limit" className="switch" type="checkbox" role="switch" aria-label="Use the level limit" checked={state.respectLevelLimit} onChange={e => update({ respectLevelLimit: e.target.checked })} /></span>
          </label>
          <p className="field-hint">{state.respectLevelLimit && boss ? 'Limit applies to access at your current progress.' : 'No level limit applies.'}</p>
        </div>
      </div>
  </section>;
}
