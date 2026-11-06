import type { AvailabilitySnapshot, TeamWarning } from '../../domain/types';

const reasonSummaries = {
  'other-version': { title: 'Not obtainable in this game', message: null },
  'external-connection': { title: 'External connection required', message: null },
  'external-event': { title: 'External event required', message: null },
  'player-trade': { title: 'Player trade required', message: 'Player trades are excluded from this plan.' },
} as const;

interface TeamWarningGroup {
  title: string;
  message: string | null;
  pokemonIds: string[];
}

export function groupTeamWarnings(snapshot: AvailabilitySnapshot, warnings: TeamWarning[]) {
  const groups = new Map<string, TeamWarningGroup>();
  for (const warning of warnings) {
    const id = warning.code === 'unavailable' || warning.code === 'later' ? warning.relatedId : null;
    const blocker = id ? snapshot.entries[id].blockers[0] : undefined;
    let title = 'Team requirements conflict';
    let message: string | null = warning.message;
    if (warning.code === 'later') {
      title = 'Available later';
      message = 'Choose a later progress point or plan for the whole game.';
    } else if (warning.code === 'unavailable') {
      if (blocker && blocker.code in reasonSummaries) {
        ({ title, message } = reasonSummaries[blocker.code as keyof typeof reasonSummaries]);
      } else {
        title = blocker?.code === 'level-limit' ? 'Above the level limit' : 'Requirement not met';
        message = blocker?.message ?? 'No source meets the selected progress and level limit.';
      }
    } else if (warning.code === 'choice-conflict') title = 'Conflicting team choices';
    else if (warning.code === 'finite-resource') title = 'Not enough shared resources';
    else if (warning.code === 'too-many-members') title = 'Too many team members';
    const key = JSON.stringify([title, message]);
    const group = groups.get(key) ?? { title, message, pokemonIds: [] };
    if (id && !group.pokemonIds.includes(id)) group.pokemonIds.push(id);
    groups.set(key, group);
  }
  return [...groups.values()];
}
