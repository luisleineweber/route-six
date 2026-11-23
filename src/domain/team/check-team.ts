import type { AcquisitionPath, AvailabilitySnapshot, PlanningTarget, TeamCheck, TeamWarning } from '../types';
import { conflictEffect, findConflict, type Conflict } from './resources';

/**
 * One member's paths, without paths that have the same conflict effect as an earlier one.
 * `free` means one path can never take part in a conflict, so the member never blocks a team.
 */
interface MemberOptions { paths: AcquisitionPath[]; free: boolean }

function memberOptions(snapshot: AvailabilitySnapshot, paths: AcquisitionPath[]): MemberOptions {
  const effects = new Set<string | null>();
  const kept = paths.filter(path => {
    const effect = conflictEffect(snapshot, path);
    if (effects.has(effect)) return false;
    effects.add(effect);
    return true;
  });
  return { paths: kept, free: effects.has(null) };
}

/** Whether the members can join the prefix. Free members cannot block it, so the search leaves them out. */
function canComplete(snapshot: AvailabilitySnapshot, options: MemberOptions[], prefix: AcquisitionPath[], members: number[]): boolean {
  const constrained = members.filter(member => !options[member].free);
  const selected = [...prefix];
  function search(position: number): boolean {
    if (position === constrained.length) return true;
    for (const path of options[constrained[position]].paths) {
      selected.push(path);
      if (!findConflict(snapshot, selected) && search(position + 1)) return true;
      selected.pop();
    }
    return false;
  }
  return !findConflict(snapshot, prefix) && search(0);
}

/** The first fitting paths in member order, then path order, so preferred paths win. Null when none fit. */
function firstTeam(snapshot: AvailabilitySnapshot, options: MemberOptions[], members: number[]): AcquisitionPath[] | null {
  if (!canComplete(snapshot, options, [], members)) return null;
  const selected: AcquisitionPath[] = [];
  members.forEach((member, position) => {
    const rest = members.slice(position + 1);
    const path = options[member].paths.find(option => canComplete(snapshot, options, [...selected, option], rest));
    if (!path) throw new Error('A team that fits has no first path.');
    selected.push(path);
  });
  return selected;
}

/** Every conflict that an ordered search of the members meets. */
function teamConflicts(snapshot: AvailabilitySnapshot, options: MemberOptions[], members: number[]): Conflict[] {
  const selected: AcquisitionPath[] = [];
  const conflicts = new Map<string, Conflict>();
  function search(position: number): boolean {
    if (position === members.length) return true;
    for (const path of options[members[position]].paths) {
      const found = findConflict(snapshot, [...selected, path]);
      if (found) { conflicts.set(`${found.kind}:${found.id}`, found); continue; }
      selected.push(path);
      if (search(position + 1)) return true;
      selected.pop();
    }
    return false;
  }
  if (search(0)) throw new Error('A conflict core fits together.');
  return [...conflicts.values()];
}

/** Remove each member that the conflict does not need. Every member left is needed for the conflict. */
function conflictCore(snapshot: AvailabilitySnapshot, options: MemberOptions[], members: number[]): number[] {
  let core = members;
  for (const member of members) {
    const without = core.filter(index => index !== member);
    if (!canComplete(snapshot, options, [], without)) core = without;
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
    return memberOptions(snapshot, [...new Set(paths)].map(id => snapshot.paths[id]));
  });
  // Members without a path are already reported. The others must still fit together.
  const reachable = options.flatMap((member, index) => member.paths.length ? [index] : []);
  const paths = firstTeam(snapshot, options, reachable);
  if (paths) {
    const chosenPathIds: (string | null)[] = team.map(() => null);
    reachable.forEach((index, position) => { chosenPathIds[index] = paths[position].id; });
    return { feasible: !warnings.length, chosenPathIds, warnings };
  }
  const core = conflictCore(snapshot, options, reachable);
  warnings.push(conflictWarning(snapshot, core, teamConflicts(snapshot, options, core)));
  return { feasible: false, chosenPathIds: team.map(() => null), warnings };
}
