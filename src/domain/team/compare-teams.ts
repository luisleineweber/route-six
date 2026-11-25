import type { AvailabilityEntry, AvailabilitySnapshot, GameData, PlanningTarget, TeamWarning, TypeAnalysis } from '../types';
import { analyzeTypes } from './analyze-types';
import { checkTeam } from './check-team';

interface TeamComparison {
  memberCount: number;
  types: TypeAnalysis;
  availability: {
    members: SlotAvailability[];
    feasible: boolean;
    warnings: TeamWarning[];
  } | null;
}

interface SlotAvailability {
  slotIndex: number;
  selectionId: string;
  status: AvailabilityEntry['status'];
  firstMilestoneIds: readonly string[];
  blockers: ReadonlyArray<AvailabilityEntry['blockers'][number]>;
  chosenPathId: string | null;
}

function summarizeTeam(
  game: GameData,
  slots: readonly (string | null)[],
  target: PlanningTarget,
  snapshot: AvailabilitySnapshot | null,
): TeamComparison {
  const occupied = slots.flatMap((selectionId, slotIndex) => selectionId === null ? [] : [{ selectionId, slotIndex }]);
  const selections = occupied.map(member => member.selectionId);
  const types = analyzeTypes(game, selections);
  const memberCount = occupied.length;
  if (!snapshot) return { memberCount, types, availability: null };

  const { feasible, chosenPathIds, warnings } = checkTeam(snapshot, selections, target);
  return {
    memberCount,
    types,
    availability: {
      members: occupied.map((member, index) => {
        const { status, firstMilestoneIds, blockers } = snapshot.entries[member.selectionId];
        return { ...member, status, firstMilestoneIds, blockers, chosenPathId: chosenPathIds[index] };
      }),
      feasible,
      warnings: warnings.map(warning => ({
        ...warning,
        slotIndexes: warning.slotIndexes.map(index => occupied[index].slotIndex),
      })),
    },
  };
}

/** Supply one snapshot that matches the selected game, progress point, and level limit. */
export function compareTeams(
  game: GameData,
  currentSlots: readonly (string | null)[],
  draftSlots: readonly (string | null)[],
  target: PlanningTarget,
  snapshot: AvailabilitySnapshot | null,
) {
  const current = summarizeTeam(game, currentSlots, target, snapshot);
  const draft = summarizeTeam(game, draftSlots, target, snapshot);
  const currentCoverage = new Set(current.types.coveredTypes);
  const draftCoverage = new Set(draft.types.coveredTypes);
  return {
    current,
    draft,
    currentOnlyCoverage: current.types.coveredTypes.filter(type => !draftCoverage.has(type)),
    draftOnlyCoverage: draft.types.coveredTypes.filter(type => !currentCoverage.has(type)),
  };
}
