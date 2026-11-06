import game from '../../../data/games/yellow/game.json';
import profiles from '../../../data/games/yellow/pokemon.json';
import typeChart from '../../../data/games/yellow/type-chart.json';
import milestones from '../../../data/games/yellow/progression.json';
import bosses from '../../../data/games/yellow/bosses.json';
import locations from '../../../data/games/yellow/locations.json';
import capabilities from '../../../data/games/yellow/capabilities.json';
import items from '../../../data/games/yellow/items.json';
import choices from '../../../data/games/yellow/choices.json';
import sources from '../../../data/games/yellow/sources.json';
import breedingRules from '../../../data/games/yellow/breeding-rules.json';
import evolutions from '../../../data/games/yellow/evolutions.json';
import exclusions from '../../../data/games/yellow/exclusions.json';

/** Assemble maintained Yellow files without conversion or a network request. */
export const rawGame: unknown = { game, profiles, typeChart, milestones, bosses, locations,
  capabilities, items, choices, sources, breedingRules, evolutions, exclusions };
