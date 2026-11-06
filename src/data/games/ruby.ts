import game from '../../../data/games/ruby/game.json';
import profiles from '../../../data/games/ruby/pokemon.json';
import typeChart from '../../../data/games/ruby/type-chart.json';
import milestones from '../../../data/games/ruby/progression.json';
import bosses from '../../../data/games/ruby/bosses.json';
import locations from '../../../data/games/ruby/locations.json';
import capabilities from '../../../data/games/ruby/capabilities.json';
import items from '../../../data/games/ruby/items.json';
import choices from '../../../data/games/ruby/choices.json';
import sources from '../../../data/games/ruby/sources.json';
import breedingRules from '../../../data/games/ruby/breeding-rules.json';
import evolutions from '../../../data/games/ruby/evolutions.json';
import exclusions from '../../../data/games/ruby/exclusions.json';

/** Assemble maintained local files without a network request or data conversion. */
export const rawGame: unknown = { game, profiles, typeChart, milestones, bosses, locations,
  capabilities, items, choices, sources, breedingRules, evolutions, exclusions };
