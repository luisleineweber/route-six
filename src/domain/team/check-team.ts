import type { AvailabilitySnapshot, PlanningTarget, TeamCheck, TeamWarning } from '../types';
import { findConflict, type Conflict } from './resources';

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
  if (warnings.length) return { feasible: false, chosenPathIds: [], warnings };
  const selected: typeof options[number] = [];
  let conflict: Conflict | null = null;
  function search(slot: number): boolean {
    if (slot === options.length) return true;
    for (const path of options[slot]) {
      const found = findConflict(snapshot, [...selected, path]);
      if (found) { conflict = found; continue; }
      selected.push(path);
      if (search(slot + 1)) return true;
      selected.pop();
    }
    return false;
  }
  if (search(0)) return { feasible: true, chosenPathIds: selected.map(p => p.id), warnings: [] };
  const found = conflict as Conflict | null;
  const relatedId = found?.id ?? null;
  const group = snapshot.choiceGroups.find(g => g.id === relatedId);
  warnings.push({ code: found?.kind ?? 'finite-resource', relatedId, slotIndexes: team.map((_, i) => i),
    message: group ? `These members need incompatible choices in ${group.name}. Select another family or source.`
      : `These members need more uses of ${relatedId?.replace(/^(source|item-source):/, '') ?? 'a finite source'} than one playthrough supplies.` });
  return { feasible: false, chosenPathIds: [], warnings };
}
