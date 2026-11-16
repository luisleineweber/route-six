import type { AcquisitionPath, AvailabilitySnapshot, PlanningTarget, TeamCheck, TeamWarning } from '../types';
import { findConflict, type Conflict } from './resources';

type TeamSearch = { paths: AcquisitionPath[]; conflicts: [] } | { paths: null; conflicts: Conflict[] };

/** Find one path per member that fits together. On failure, return every conflict the search met. */
function searchTeam(snapshot: AvailabilitySnapshot, options: AcquisitionPath[][], members: number[]): TeamSearch {
  const selected: AcquisitionPath[] = [];
  const conflicts = new Map<string, Conflict>();
  function search(position: number): boolean {
    if (position === members.length) return true;
    for (const path of options[members[position]]) {
      const found = findConflict(snapshot, [...selected, path]);
      if (found) { conflicts.set(`${found.kind}:${found.id}`, found); continue; }
      selected.push(path);
      if (search(position + 1)) return true;
      selected.pop();
    }
    return false;
  }
  return search(0) ? { paths: selected, conflicts: [] } : { paths: null, conflicts: [...conflicts.values()] };
}

/** Remove each member that the conflict does not need. Every member left is needed for the conflict. */
function conflictCore(snapshot: AvailabilitySnapshot, options: AcquisitionPath[][], members: number[]): number[] {
  let core = members;
  for (const member of members) {
    const without = core.filter(index => index !== member);
    if (!searchTeam(snapshot, options, without).paths) core = without;
  }
  return core;
}

function conflictWarning(snapshot: AvailabilitySnapshot, slotIndexes: number[], conflicts: Conflict[]): TeamWarning {
  if (conflicts.length !== 1) {
    // Several choices or resources block the members together, so no single one can be named.
    const code = conflicts.every(conflict => conflict.kind === 'choice-conflict') ? 'choice-conflict' : 'finite-resource';
    return { code, relatedId: null, slotIndexes,
      message: 'These members cannot all be obtained in one playthrough. Select another family or source.' };
  }
  const [conflict] = conflicts;
  const group = snapshot.choiceGroups.find(g => g.id === conflict.id);
  return { code: conflict.kind, relatedId: conflict.id, slotIndexes,
    message: group ? `These members need incompatible choices in ${group.name}. Select another family or source.`
      : `These members need more uses of ${conflict.id.replace(/^(source|item-source):/, '')} than one playthrough supplies.` };
}

export function checkTeam(snapshot: AvailabilitySnapshot, team: string[], target: PlanningTarget): TeamCheck {
  const warnings: TeamWarning[] = [];
  if (team.length > 6) warnings.push({ code: 'too-many-members', slotIndexes: team.map((_, i) => i), relatedId: null, message: 'A team can have at most six Pokémon.' });
  const options = team.map((id, index) => {
    const entry = snapshot.entries[id];
    if (!entry) throw new Error(`Unknown team Pokémon: ${id}`);
    const paths = target === 'whole-game' ? [...entry.currentPathIds, ...entry.futurePathIds] : entry.currentPathIds;
    if (!paths.length) warnings.push({ code: entry.status === 'later' ? 'later' : 'unavailable', slotIndexes: [index], relatedId: id,
      message: entry.status === 'later' ? `${id} becomes available later.` : `${id}: ${entry.blockers[0]?.message ?? 'No valid acquisition path.'}` });
    return [...new Set(paths)].map(id => snapshot.paths[id]);
  });
  // Members without a path are already reported. The others must still fit together.
  const reachable = options.flatMap((paths, index) => paths.length ? [index] : []);
  const result = searchTeam(snapshot, options, reachable);
  if (result.paths) {
    const chosenPathIds: (string | null)[] = team.map(() => null);
    reachable.forEach((index, position) => { chosenPathIds[index] = result.paths[position].id; });
    return { feasible: !warnings.length, chosenPathIds, warnings };
  }
  const core = conflictCore(snapshot, options, reachable);
  warnings.push(conflictWarning(snapshot, core, searchTeam(snapshot, options, core).conflicts));
  return { feasible: false, chosenPathIds: team.map(() => null), warnings };
}
