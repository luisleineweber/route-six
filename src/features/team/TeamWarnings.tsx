import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { pokemonNames, pokemonIdentity } from '../../data/dataset';
import { checkTeam } from '../../domain/team/check-team';
import type { AvailabilitySnapshot, PlanningTarget } from '../../domain/types';
import { groupTeamWarnings } from './team-warning-summary';

export function TeamWarnings({ snapshot, team, target, onDetails }: {
  snapshot: AvailabilitySnapshot; team: string[]; target: PlanningTarget; onDetails: (id: string) => void;
}) {
  if (!team.length) return <div className="team-access team-access-summary" role="status"><Info size={18} aria-hidden="true" /><p>Add a Pokémon to check team access.</p></div>;
  const check = checkTeam(snapshot, team, target);
  const later = team.filter(id => snapshot.entries[id].status === 'later');
  if (check.feasible) return <div className="team-access team-access-summary team-access-success" role="status">
    <CheckCircle2 size={18} aria-hidden="true" />
    <p>{later.length ? <>Team available over the whole game. <span>{later.map(id => pokemonIdentity(id).name).join(', ')} {later.length === 1 ? 'is' : 'are'} available later.</span></> : 'Team available at your selected progress.'}</p>
  </div>;
  const groups = groupTeamWarnings(snapshot, check.warnings);
  const affected = new Set(check.warnings.flatMap(warning => warning.slotIndexes)).size;
  const heading = check.warnings.every(warning => warning.code === 'later')
    ? `${affected} Pokémon available later`
    : check.warnings.every(warning => warning.code === 'unavailable' || warning.code === 'later')
      ? `${affected} Pokémon unavailable for this plan`
      : 'This team needs a change';
  const hasDetails = groups.some(group => group.pokemonIds.length > 0);
  return <div className="team-access team-access-issues">
    <div className="team-access-heading">
      <div className="team-access-status" role="status">
        <TriangleAlert size={18} aria-hidden="true" />
        <h3>{heading}</h3>
      </div>
      {hasDetails && <p className="team-access-hint">Select a Pokémon for access details.</p>}
    </div>
    <ul className="team-issue-list">{groups.map(group => <li key={JSON.stringify([group.title, group.message])}>
      <div className="team-issue-reason">
        <h4>{group.title}</h4>
        {group.message && <p>{group.message.replace(/\b[a-z]+(?:-[a-z]+)*\b/g, word => pokemonNames.get(word) ?? word)}</p>}
      </div>
      {group.pokemonIds.length > 0 && <div className="team-issue-members">{group.pokemonIds.map(id => <button key={id} type="button" className="team-issue-details" onClick={() => onDetails(id)} aria-label={`View ${pokemonIdentity(id).name} access details`} aria-haspopup="dialog">
        {pokemonIdentity(id).name}
      </button>)}</div>}
    </li>)}</ul>
  </div>;
}
