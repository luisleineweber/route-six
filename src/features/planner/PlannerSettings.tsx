import type { PlanningTarget } from '../../domain/types';
import type { PlannerAction, PlannerState } from './state';
import { useGameData } from './GameContext';
import { progressCheckpointOptions } from './progress-checkpoints';
import { ProgressSelector } from './ProgressSelector';

const targets: { id: PlanningTarget; name: string; description: string }[] = [
  { id: 'whole-game', name: 'Whole game', description: 'Check which Pokémon you can get in this game.' },
  { id: 'current-progress', name: 'At this point', description: 'Check which Pokémon are available at the selected point.' },
];

export function PlannerSettings({ state, dispatch }: { state: PlannerState; dispatch: React.Dispatch<PlannerAction> }) {
  const game = useGameData();
  if (game.game.planner === null || state.milestoneId === null) throw new Error('Progress settings need reviewed progress data.');
  const milestone = game.milestones.find(m => m.id === state.milestoneId)!;
  const boss = game.bosses.find(b => b.id === milestone.nextBossId);
  const target = targets.find(t => t.id === state.target)!;
  const points = progressCheckpointOptions(game);
  const update = (values: Partial<PlannerState>) => dispatch({ type: 'settings', values });
  return <section className="settings" aria-label="Planner settings">
      <div className="settings-fields">
        <div className="field">
          <label id="milestone-label" htmlFor="milestone">Progress point</label>
          <ProgressSelector value={state.milestoneId} options={points} onChange={milestoneId => update({ milestoneId })} />
          <p id="milestone-hint" className="field-hint">Choose the point you want to plan for.</p>
        </div>
        <fieldset className="field segmented" aria-describedby="target-hint">
          <legend>Check team for</legend>
          <div className="segments">{targets.map(option => <label key={option.id} className="segment">
            <input type="radio" name="target" checked={state.target === option.id} onChange={() => update({ target: option.id })} />
            <span>{option.name}</span>
          </label>)}</div>
          <p id="target-hint" className="field-hint">{target.description} Search filters change the list only.</p>
        </fieldset>
        <div className="field">
          <label className="level-label" htmlFor="level-limit">Use level limits</label>
          <label className="switch-row" htmlFor="level-limit">
            <span>{boss ? `${boss.name} · Lv. ${boss.highestLevel}` : 'No active level limit'}</span>
            <span className="switch-control"><span className="switch-state" aria-hidden="true">{state.respectLevelLimit ? 'On' : 'Off'}</span>
              <input id="level-limit" className="switch" type="checkbox" role="switch" aria-label="Use level limits" aria-describedby="level-limit-hint" checked={state.respectLevelLimit} onChange={e => update({ respectLevelLimit: e.target.checked })} /></span>
          </label>
          <p id="level-limit-hint" className="field-hint">{state.respectLevelLimit
            ? boss ? "Each progress point uses its next boss's level limit." : 'No limit applies at this point. Future checks use their own limits.'
            : 'Level restrictions are off. Other access rules still apply.'}</p>
        </div>
      </div>
  </section>;
}
