import profiles from '../../../data/games/shared/lets-go/pokemon.json';
import regionalDex from '../../../data/games/shared/lets-go/regional-dex.json';
import typeChart from '../../../data/games/shared/generation-seven/type-chart.json';
import milestones from '../../../data/games/shared/lets-go/progression.json';
import bosses from '../../../data/games/shared/lets-go/bosses.json';
import locations from '../../../data/games/shared/lets-go/locations.json';
import capabilities from '../../../data/games/shared/lets-go/capabilities.json';
import items from '../../../data/games/shared/lets-go/items.json';
import choices from '../../../data/games/shared/lets-go/choices.json';
import commonSources from '../../../data/games/shared/lets-go/sources.json';
import evolutions from '../../../data/games/shared/lets-go/evolutions.json';
import { withRegionalDex } from './generation-seven-team';
import { letsGoProfiles } from './lets-go-profiles';

export function letsGoProgress(game: unknown, otherPartner: string, versionSources: readonly unknown[], exclusions: readonly unknown[]): unknown {
  return {
    game,
    profiles: withRegionalDex(letsGoProfiles(profiles, otherPartner), regionalDex),
    typeChart, milestones, bosses, locations, capabilities, items, choices, evolutions, exclusions,
    sources: [...commonSources, ...versionSources],
    breedingRules: [],
  };
}
