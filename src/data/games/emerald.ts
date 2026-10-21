import game from '../../../data/games/emerald/game.json';
import profiles from '../../../data/games/emerald/pokemon.json';
import typeChart from '../../../data/games/emerald/type-chart.json';
import milestones from '../../../data/games/emerald/progression.json';
import bosses from '../../../data/games/emerald/bosses.json';
import locations from '../../../data/games/emerald/locations.json';
import capabilities from '../../../data/games/emerald/capabilities.json';
import items from '../../../data/games/emerald/items.json';
import choices from '../../../data/games/emerald/choices.json';
import sources from '../../../data/games/emerald/sources.json';
import breedingRules from '../../../data/games/emerald/breeding-rules.json';
import evolutions from '../../../data/games/emerald/evolutions.json';
import exclusions from '../../../data/games/emerald/exclusions.json';

/** Assemble maintained local files without a network request or data conversion. */
export const rawGame: unknown = { game, profiles, typeChart, milestones, bosses, locations,
  capabilities, items, choices, sources, breedingRules, evolutions, exclusions };
