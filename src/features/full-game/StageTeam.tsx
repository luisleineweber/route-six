import { useMemo, useState, type Dispatch } from 'react';
import { CheckCircle2, ChevronDown, Clock3, GitBranch, Plus, TriangleAlert, Users } from 'lucide-react';
import { pokemonIdentity, sharedData } from '../../data/dataset';
import { PokemonSprite, TypeIcon } from '../../components/PokemonIdentity';
import type { AvailabilitySnapshot } from '../../domain/types';
import type { FullGameStage } from '../../domain/availability/full-game-stages';
import { stageTeam, type StageMember } from '../../domain/team/stage-team';
import { checkTeam } from '../../domain/team/check-team';
import { useGameData } from '../planner/GameContext';
import type { PlannerAction, PlannerState } from '../planner/state';
import { sortPokemonByPokedex } from '../planner/pokedex-order';
import { TeamWarnings } from '../team/TeamWarnings';

export function StageTeam({ stage, snapshot, state, dispatch, onDetails }: {
  stage: FullGameStage; snapshot: AvailabilitySnapshot | undefined; state: PlannerState;
  dispatch: Dispatch<PlannerAction>; onDetails: (id: string, snapshot: AvailabilitySnapshot) => void;
}) {
  const game = useGameData();
  const [editing, setEditing] = useState(false);
  const league = stage.typeId === null;
  const members: StageMember[] | null = !snapshot ? null : league
    ? state.team.map(targetId => ({ targetId, pokemonId: targetId, kind: 'final' }))
    : stageTeam(game, snapshot, state.team, state.stageOverrides[stage.id]);
  const team = members?.flatMap(member => member.pokemonId ? [member.pokemonId] : []) ?? [];
  const full = team.length === 6;
  const check = snapshot && team.length ? checkTeam(snapshot, team, 'current-progress') : null;
  const ready = full && check?.feasible;
  const available = useMemo(() => editing && snapshot
    ? sortPokemonByPokedex(sharedData.pokemon.filter(pokemon => snapshot.entries[pokemon.id]?.currentPathIds.length), game) : [], [editing, snapshot, game]);
  return <section className="full-game-stage" aria-labelledby={`stage-${stage.id}`}>
    <div className="stage-heading">
      <div>{stage.typeId ? <TypeIcon type={stage.typeId} size={28} /> : <Users size={28} aria-hidden="true" />}<div><h3 id={`stage-${stage.id}`}>{stage.title}</h3><p>{stage.detail}</p></div></div>
      <p className="stage-limit">{state.respectLevelLimit ? `Lv. ${stage.level}${stage.typeId ? '' : ' at entry'}` : 'No level limit'}</p>
      <span className={`status-label ${ready ? 'status-available' : 'status-pending'}`}>
        {ready ? <CheckCircle2 size={16} aria-hidden="true" /> : <Clock3 size={16} aria-hidden="true" />}
        {snapshot ? ready ? 'Team ready' : `${team.length}/6 slots filled` : 'Checking access…'}
      </span>
    </div>
    <ol className="stage-members">{state.team.map((targetId, slot) => {
      const member = members?.[slot];
      const id = member?.pokemonId;
      const invalid = id && !snapshot?.entries[id]?.currentPathIds.length;
      const label = !snapshot ? 'Checking…' : member?.kind === 'replacement' && !id ? 'Left empty' : !targetId && !id ? 'Choose a final member' : invalid ? 'Unavailable here' : member?.kind === 'final' ? 'Final team member'
        : member?.kind === 'earlier' ? 'Earlier evolution' : member?.kind === 'replacement' && id ? 'Temporary member' : targetId ? 'Unavailable here' : 'Choose a final member';
      const Icon = invalid || member?.kind === 'missing' ? TriangleAlert : member?.kind === 'earlier' ? GitBranch : id ? CheckCircle2 : Plus;
      return <li key={slot} className={`stage-member ${id ? '' : 'stage-member-empty'}`}>
        <span className="stage-slot-number">{slot + 1}</span>
        {id ? <button className="stage-pokemon" type="button" onClick={() => onDetails(id, snapshot!)} aria-label={`View ${pokemonIdentity(id).name} access before ${stage.detail}`}><PokemonSprite id={id} /><strong>{pokemonIdentity(id).name}</strong></button>
          : <div className="stage-pokemon"><span className="stage-missing-sprite" aria-hidden="true">—</span><strong>{targetId ? pokemonIdentity(targetId).name : 'Empty slot'}</strong></div>}
        <span className={`status-label ${invalid || member?.kind === 'missing' ? 'status-blocked' : member?.kind === 'earlier' ? 'status-later' : id ? 'status-available' : 'status-pending'}`}><Icon size={14} aria-hidden="true" />{label}</span>
        {targetId && id && targetId !== id && <span className="stage-target">For {pokemonIdentity(targetId).name}</span>}
        {member?.kind === 'missing' && <span className="stage-reason">{snapshot?.entries[targetId!]?.blockers[0]?.message}</span>}
      </li>;
    })}</ol>
    {snapshot && !league && <details className="stage-editor" open={editing} onToggle={event => setEditing(event.currentTarget.open)}>
      <summary>Edit team for {stage.title}<ChevronDown size={16} aria-hidden="true" /></summary>
      {editing && <>
      <p className="field-hint">Choose available replacements for this stage. Your final team stays the same.</p>
      <div className="stage-fields">{members!.map((member, slot) => {
        const overridden = Object.hasOwn(state.stageOverrides[stage.id] ?? {}, slot);
        const value = overridden ? member.pokemonId ?? '' : 'automatic';
        return <label key={slot}>Slot {slot + 1}{member.targetId && <span> · {pokemonIdentity(member.targetId).name}</span>}
          <select value={value} onChange={event => {
            if (event.target.value === 'automatic') {
              dispatch({ type: 'stage-auto', stageId: stage.id, slot });
            } else dispatch({ type: 'stage-member', stageId: stage.id, slot, pokemonId: event.target.value || null });
          }}>
            <option value="automatic">Use final member or earlier evolution</option>
            <option value="">Leave empty</option>
            {member.pokemonId && !available.some(pokemon => pokemon.id === member.pokemonId) && <option value={member.pokemonId}>{pokemonIdentity(member.pokemonId).name} · unavailable here</option>}
            {available.map(pokemon => <option key={pokemon.id} value={pokemon.id}>{pokemon.name}</option>)}
          </select>
        </label>;
      })}</div>
      <button type="button" className="secondary-button" onClick={() => dispatch({ type: 'stage-reset', stageId: stage.id })}>Use final team for this stage</button>
      </>}
    </details>}
    {snapshot && check && !check.feasible && <TeamWarnings snapshot={snapshot} team={team} target="current-progress" onDetails={id => onDetails(id, snapshot)} />}
  </section>;
}
