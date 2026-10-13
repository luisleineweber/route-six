import game from '../../../data/games/red/game.json';
import profiles from '../../../data/games/red/pokemon.json';
import typeChart from '../../../data/games/red/type-chart.json';
import milestones from '../../../data/games/red/progression.json';
import bosses from '../../../data/games/red/bosses.json';
import locations from '../../../data/games/red/locations.json';
import capabilities from '../../../data/games/red/capabilities.json';
import items from '../../../data/games/red/items.json';
import choices from '../../../data/games/red/choices.json';
import sources from '../../../data/games/red/sources.json';
import breedingRules from '../../../data/games/red/breeding-rules.json';
import evolutions from '../../../data/games/red/evolutions.json';
import exclusions from '../../../data/games/red/exclusions.json';

/** Assemble reviewed local files. This module does not fetch or convert data. */
export const rawGame: unknown = { game, profiles, typeChart, milestones, bosses, locations,
  capabilities, items, choices, sources, breedingRules, evolutions, exclusions };
