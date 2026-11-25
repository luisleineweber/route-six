import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { ArrowLeft, Copy } from 'lucide-react';
import { compareTeams } from '../../domain/team/compare-teams';
import { PlannerSettings, type PlannerSettingsChange } from '../planner/PlannerSettings';
import type { PlannerState } from '../planner/state';
import type { useAvailability } from '../planner/use-availability';
import { useGameData } from '../planner/GameContext';
import { TeamSlots } from '../team/TeamSlots';
import type { ComparisonDraft } from './comparison-draft';
import { ComparisonAccess } from './ComparisonAccess';
import { CoverageComparison, DefenseComparison } from './ComparisonTypes';

export function TeamComparison({ state, onSettingsChange, draft, draftRef, availability, onBack, onCopy, onChoose, onRemove, onDetails }: {
  state: PlannerState; onSettingsChange: PlannerSettingsChange; draft: ComparisonDraft; draftRef: RefObject<HTMLDivElement | null>;
  availability: ReturnType<typeof useAvailability>;
  onBack: () => void; onCopy: () => void; onChoose: (slot: number) => void; onRemove: (slot: number) => void; onDetails: (id: string) => void;
}) {
  const game = useGameData();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const hasAccess = game.game.planner !== null;
  const { snapshot } = availability;
  const comparison = useMemo(() => compareTeams(game, state.team, draft.slots, state.target, snapshot),
    [game, state.team, draft.slots, state.target, snapshot]);
  const draftEmpty = draft.slots.every(id => id === null);
  return <>
    <div className="section-heading planner-heading compare-heading">
      <h1 ref={heading} tabIndex={-1}>Compare teams</h1>
      <button type="button" className="secondary-button" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" />Back to Team Planner</button>
    </div>
    {hasAccess && <PlannerSettings state={state} onChange={onSettingsChange} />}
    <div className="compare-teams">
      <section className="team-section compare-team" aria-labelledby="compare-current-title">
        <div className="compare-team-heading">
          <h2 id="compare-current-title">Current team</h2>
          <p className="compare-count">Read only</p>
        </div>
        <TeamSlots team={state.team} snapshot={snapshot} progressPage={hasAccess && !availability.error} onDetails={onDetails} readOnly />
      </section>
      <section className="team-section compare-team" aria-labelledby="compare-draft-title">
        <div className="compare-team-heading">
          <h2 id="compare-draft-title">Second team</h2>
          <button type="button" className="text-button" onClick={onCopy} disabled={draftEmpty && state.team.every(id => id === null)}>
            <Copy size={16} aria-hidden="true" />Copy current team
          </button>
        </div>
        <div ref={draftRef}><TeamSlots team={draft.slots} snapshot={snapshot} progressPage={hasAccess && !availability.error} activeSlot={draft.activeSlot} onChoose={onChoose} onRemove={onRemove} onDetails={onDetails} /></div>
        {draftEmpty && <p className="field-hint">Add Pokémon from the search below.</p>}
      </section>
    </div>
    <section className="compare-results" aria-labelledby="compare-results-title">
      <h2 id="compare-results-title">Comparison</h2>
      <CoverageComparison comparison={comparison} />
      <DefenseComparison comparison={comparison} />
      <ComparisonAccess comparison={comparison} {...availability} target={state.target} onDetails={onDetails} />
    </section>
  </>;
}
