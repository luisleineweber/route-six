import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { pokemonIdentity, pokemonNames } from '../../data/dataset';
import { LoadingNote } from '../../components/Loading';
import type { AvailabilitySnapshot, PlanningTarget } from '../../domain/types';
import { groupTeamWarnings } from '../team/team-warning-summary';
import { useGameData } from '../planner/GameContext';
import { comparedTeams, type TeamSummary, type TeamsComparison } from './ComparisonTypes';

type Access = NonNullable<TeamSummary['availability']>;

const readableMessage = (message: string) => message.replace(/\b[a-z]+(?:-[a-z]+)*\b/g, word => pokemonNames.get(word) ?? word);

function TeamAccess({ access, memberCount, snapshot, target, onDetails }: {
  access: Access; memberCount: number; snapshot: AvailabilitySnapshot; target: PlanningTarget; onDetails: (id: string) => void;
}) {
  const withPath = access.members.filter(member => member.status === 'available' || member.status === 'later');
  const noPath = access.members.filter(member => member.status === 'blocked' || member.status === 'unavailable');
  const scope = target === 'whole-game' ? 'over the whole game' : 'at this point';
  const groups = groupTeamWarnings(snapshot, access.warnings);
  return <>
    <dl className="compare-access-counts">
      <div><dt>Path now or later</dt><dd><strong>{withPath.length}</strong> of {memberCount}</dd></div>
      <div><dt>No valid path</dt><dd><strong>{noPath.length}</strong> of {memberCount}</dd></div>
    </dl>
    {noPath.length > 0 && <ul className="compare-blocked">{noPath.map(member => <li key={member.slotIndex}>
      <button type="button" className="team-issue-details" aria-haspopup="dialog" onClick={() => onDetails(member.selectionId)}
        aria-label={`View ${pokemonIdentity(member.selectionId).name} access details, slot ${member.slotIndex + 1}`}>
        {pokemonIdentity(member.selectionId).name}
      </button>
      <span>{member.blockers[0] ? readableMessage(member.blockers[0].message) : 'No source meets the selected progress and level limit.'}</span>
    </li>)}</ul>}
    {access.feasible
      ? <p className="team-access team-access-summary team-access-success"><CheckCircle2 size={18} aria-hidden="true" /><span>You can get the whole team {scope}.</span></p>
      : <div className="team-access team-access-issues">
        <div className="team-access-status"><TriangleAlert size={18} aria-hidden="true" /><h5>You cannot get the whole team {scope}.</h5></div>
        <ul className="team-issue-list">{groups.map(group => <li key={JSON.stringify([group.title, group.message])}>
          <div className="team-issue-reason">
            <h6>{group.title}</h6>
            {group.message && <p>{readableMessage(group.message)}</p>}
            {group.pokemonIds.length > 0 && <p>{group.pokemonIds.map(id => pokemonIdentity(id).name).join(', ')}</p>}
          </div>
        </li>)}</ul>
      </div>}
  </>;
}

export function ComparisonAccess({ comparison, snapshot, loading, error, target, onDetails }: {
  comparison: TeamsComparison; snapshot: AvailabilitySnapshot | null; loading: boolean; error: string | null;
  target: PlanningTarget; onDetails: (id: string) => void;
}) {
  const game = useGameData();
  const body = () => {
    if (game.game.planner === null) return <p className="team-access team-access-summary"><Info size={18} aria-hidden="true" /><span>The access check is not available for {game.game.name} yet. Its progress data is not reviewed. The type results above still apply.</span></p>;
    if (error) return <div className="error-message" role="alert"><strong>The guide could not check access.</strong><p>{error}</p><button className="secondary-button" onClick={() => window.location.reload()}>Reload guide</button></div>;
    if (loading || !snapshot) return <LoadingNote title="Checking team access…" detail="The type results stay up to date while the check runs." />;
    return <div className="compare-pair">{comparedTeams.map(({ key, name }) => {
      const summary = comparison[key];
      return <div key={key} className="compare-card">
        <h4>{name}</h4>
        {summary.memberCount === 0 || !summary.availability
          ? <p className="muted">Add a Pokémon to check access.</p>
          : <TeamAccess access={summary.availability} memberCount={summary.memberCount} snapshot={snapshot} target={target} onDetails={onDetails} />}
      </div>;
    })}</div>;
  };
  return <section className="compare-block" aria-labelledby="compare-access-title" aria-busy={loading}>
    <h3 id="compare-access-title">Obtainability</h3>
    {body()}
  </section>;
}
