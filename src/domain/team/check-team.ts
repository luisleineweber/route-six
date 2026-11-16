import type { AcquisitionPath, AvailabilitySnapshot, PlanningTarget, TeamCheck, TeamWarning } from '../types';
import { findConflict, pathUsesConflict, type Conflict } from './resources';

/** Name the members that cannot avoid the conflict: every path of theirs uses it.
 * A member with a conflict-free path is left out. When no member is forced, the conflict comes only
 * from optional paths together, so the members that can take part are named instead. */
function conflictMembers(options: AcquisitionPath[][], reachable: number[], conflict: Conflict): number[] {
  const forced = reachable.filter(index => options[index].every(path => pathUsesConflict(path, conflict)));
  return forced.length ? forced : reachable.filter(index => options[index].some(path => pathUsesConflict(path, conflict)));
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
  const selected: typeof options[number] = [];
  // Keep the conflict from the shallowest failed step: it needs the fewest members, so it is the cause.
  let conflict: { found: Conflict; paths: number } | null = null;
  function search(position: number): boolean {
    if (position === reachable.length) return true;
    for (const path of options[reachable[position]]) {
      const found = findConflict(snapshot, [...selected, path]);
      if (found) {
        if (!conflict || selected.length + 1 < conflict.paths) conflict = { found, paths: selected.length + 1 };
        continue;
      }
      selected.push(path);
      if (search(position + 1)) return true;
      selected.pop();
    }
    return false;
  }
  if (search(0)) {
    const chosenPathIds: (string | null)[] = team.map(() => null);
    reachable.forEach((index, position) => { chosenPathIds[index] = selected[position].id; });
    return { feasible: !warnings.length, chosenPathIds, warnings };
  }
  const found = (conflict as { found: Conflict } | null)?.found ?? null;
  const relatedId = found?.id ?? null;
  const group = snapshot.choiceGroups.find(g => g.id === relatedId);
  const involved = found ? conflictMembers(options, reachable, found) : reachable;
  warnings.push({ code: found?.kind ?? 'finite-resource', relatedId, slotIndexes: involved,
    message: group ? `These members need incompatible choices in ${group.name}. Select another family or source.`
      : `These members need more uses of ${relatedId?.replace(/^(source|item-source):/, '') ?? 'a finite source'} than one playthrough supplies.` });
  return { feasible: false, chosenPathIds: team.map(() => null), warnings };
}
