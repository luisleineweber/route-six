import game from '../../../data/games/gold/game.json';
import profiles from '../../../data/games/gold/pokemon.json';
import typeChart from '../../../data/games/gold/type-chart.json';
import milestones from '../../../data/games/gold/progression.json';
import bosses from '../../../data/games/gold/bosses.json';
import locations from '../../../data/games/gold/locations.json';
import capabilities from '../../../data/games/gold/capabilities.json';
import choices from '../../../data/games/gold/choices.json';
import sources from '../../../data/games/gold/sources.json';
import breedingRules from '../../../data/games/gold/breeding-rules.json';
import evolutions from '../../../data/games/gold/evolutions.json';
import items from '../../../data/games/gold/items.json';
import exclusions from '../../../data/games/gold/exclusions.json';

/** Assemble the manually reviewed Gold data files. */
export const rawGame: unknown = {
  game,
  profiles,
  typeChart,
  milestones,
  bosses,
  locations,
  capabilities,
  choices,
  sources,
  items,
  exclusions,
  breedingRules,
  evolutions,
};
