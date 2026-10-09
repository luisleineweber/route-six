import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { pokemonById } from '../../data/dataset';
import { checkTeam } from '../../domain/team/check-team';
import type { AvailabilitySnapshot, PlanningTarget } from '../../domain/types';

export function TeamWarnings({ snapshot, team, target }: { snapshot: AvailabilitySnapshot; team: string[]; target: PlanningTarget }) {
  if (!team.length) return <div className="notice notice-info"><Info size={20} aria-hidden="true" /><p>Add your first Pokémon to check team choices and access.</p></div>;
  const check = checkTeam(snapshot, team, target);
  const later = team.filter(id => snapshot.entries[id].status === 'later');
  const Icon = check.feasible ? CheckCircle2 : TriangleAlert;
  return <div className={`notice ${check.feasible ? 'notice-success' : 'notice-warning'}`} role="status">
    <Icon size={20} aria-hidden="true" />
    <div><strong>{check.feasible ? (later.length ? 'This team works for the whole game.' : 'This team can be obtained now.') : 'Your team needs a change.'}</strong>
      {check.warnings.map((w, i) => <p key={i}>{w.message.replace(/\b[a-z]+(?:-[a-z]+)*\b/g, word => pokemonById.get(word)?.name ?? word)}</p>)}
      {check.feasible && later.length > 0 && <p>{later.map(id => pokemonById.get(id)!.name).join(', ')} {later.length === 1 ? 'is' : 'are'} available later. Your team stays in the plan.</p>}
    </div>
  </div>;
}
