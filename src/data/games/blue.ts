import game from '../../../data/games/blue/game.json';
import profiles from '../../../data/games/blue/pokemon.json';
import typeChart from '../../../data/games/blue/type-chart.json';
import milestones from '../../../data/games/blue/progression.json';
import bosses from '../../../data/games/blue/bosses.json';
import locations from '../../../data/games/blue/locations.json';
import capabilities from '../../../data/games/blue/capabilities.json';
import items from '../../../data/games/blue/items.json';
import choices from '../../../data/games/blue/choices.json';
import sources from '../../../data/games/blue/sources.json';
import breedingRules from '../../../data/games/blue/breeding-rules.json';
import evolutions from '../../../data/games/blue/evolutions.json';
import exclusions from '../../../data/games/blue/exclusions.json';

/** Assemble the reviewed local Blue files. No import or network step runs here. */
export const rawGame: unknown = { game, profiles, typeChart, milestones, bosses, locations,
  capabilities, items, choices, sources, breedingRules, evolutions, exclusions };
