import { useMemo, useState, type Dispatch } from 'react';
import { fullGameStages } from '../../domain/availability/full-game-stages';
import type { AvailabilitySnapshot } from '../../domain/types';
import { AcquisitionDetails } from '../../components/AcquisitionDetails';
import { useGameData } from '../planner/GameContext';
import type { PlannerAction, PlannerState } from '../planner/state';
import { StageTeam } from './StageTeam';
import { useFullGame } from './use-full-game';

export function FullGamePlanner({ state, dispatch }: { state: PlannerState; dispatch: Dispatch<PlannerAction> }) {
  const game = useGameData();
  const stages = useMemo(() => fullGameStages(game), [game]);
  const hasTeam = state.team.some(Boolean) || Object.values(state.stageOverrides).some(slots => Object.values(slots).some(Boolean));
  const { snapshots, error } = useFullGame(state.gameId, state.respectLevelLimit, hasTeam);
  const [details, setDetails] = useState<{ id: string; snapshot: AvailabilitySnapshot } | null>(null);
  const checked = Object.keys(snapshots).length;
  return <section className="full-game-plan" aria-labelledby="full-game-stages-title">
    <div className="full-game-heading">
      <div><h2 id="full-game-stages-title">Your team through the game</h2><p>Start with the League team. Work back to fill each earlier team.</p></div>
      <label className="check-label"><input type="checkbox" checked={state.respectLevelLimit} onChange={event => dispatch({ type: 'settings', values: { respectLevelLimit: event.target.checked } })} />Use level limits</label>
    </div>
    <p className="field-hint">Each team is checked before its battle. The League uses the entry level limit. Optional areas count when you can reach them.</p>
    <p className="field-hint">Replacements apply to one stage. Each team is checked separately. Checks between stages will follow.</p>
    {!hasTeam ? <p className="empty-results">Add your final team above to see its earlier evolution stages and missing members.</p>
      : <>
        <p className="field-hint" role="status">{error ? 'The stage check stopped.' : checked < stages.length ? `Checking stages: ${checked} of ${stages.length} ready…` : `${stages.length} stages checked. Open “Edit team” to choose replacements.`}</p>
        {error && <div className="error-message" role="alert"><strong>The guide could not check all stages.</strong><p>{error}</p><button className="secondary-button" onClick={() => window.location.reload()}>Reload guide</button></div>}
        <div className="full-game-stages">{stages.map(stage => <StageTeam key={stage.id} stage={stage} snapshot={snapshots[stage.id]} state={state} dispatch={dispatch} onDetails={(id, snapshot) => setDetails({ id, snapshot })} />)}</div>
      </>}
    <AcquisitionDetails id={details?.id ?? null} snapshot={details?.snapshot ?? null} progressPage onClose={() => setDetails(null)} onNavigate={id => setDetails(current => current ? { ...current, id } : null)} onAdd={() => {}} canAdd={false} />
  </section>;
}
