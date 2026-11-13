import type { AvailabilitySnapshot, PlanningTarget, TeamCheck, TeamWarning } from '../types';
import { findConflict, pathUsesConflict, type Conflict } from './resources';

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
  let conflict: Conflict | null = null;
  function search(position: number): boolean {
    if (position === reachable.length) return true;
    for (const path of options[reachable[position]]) {
      const found = findConflict(snapshot, [...selected, path]);
      if (found) { conflict = found; continue; }
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
  const found = conflict as Conflict | null;
  const relatedId = found?.id ?? null;
  const group = snapshot.choiceGroups.find(g => g.id === relatedId);
  // Name only the members that can take part in the conflict, not every reachable member.
  const involved = found ? reachable.filter(index => options[index].some(path => pathUsesConflict(path, found))) : reachable;
  warnings.push({ code: found?.kind ?? 'finite-resource', relatedId, slotIndexes: involved,
    message: group ? `These members need incompatible choices in ${group.name}. Select another family or source.`
      : `These members need more uses of ${relatedId?.replace(/^(source|item-source):/, '') ?? 'a finite source'} than one playthrough supplies.` });
  return { feasible: false, chosenPathIds: team.map(() => null), warnings };
}
