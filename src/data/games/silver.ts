import game from '../../../data/games/silver/game.json';
import profiles from '../../../data/games/silver/pokemon.json';
import typeChart from '../../../data/games/silver/type-chart.json';
import milestones from '../../../data/games/silver/progression.json';
import bosses from '../../../data/games/silver/bosses.json';
import locations from '../../../data/games/silver/locations.json';
import capabilities from '../../../data/games/silver/capabilities.json';
import items from '../../../data/games/silver/items.json';
import choices from '../../../data/games/silver/choices.json';
import sources from '../../../data/games/silver/sources.json';
import breedingRules from '../../../data/games/silver/breeding-rules.json';
import evolutions from '../../../data/games/silver/evolutions.json';
import exclusions from '../../../data/games/silver/exclusions.json';

/** Assemble maintained local files without a network request or data conversion. */
export const rawGame: unknown = { game, profiles, typeChart, milestones, bosses, locations,
  capabilities, items, choices, sources, breedingRules, evolutions, exclusions };
