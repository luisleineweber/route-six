import game from '../../../data/games/leafgreen/game.json';
import profiles from '../../../data/games/leafgreen/pokemon.json';
import typeChart from '../../../data/games/leafgreen/type-chart.json';
import milestones from '../../../data/games/leafgreen/progression.json';
import bosses from '../../../data/games/leafgreen/bosses.json';
import locations from '../../../data/games/leafgreen/locations.json';
import capabilities from '../../../data/games/leafgreen/capabilities.json';
import items from '../../../data/games/leafgreen/items.json';
import choices from '../../../data/games/leafgreen/choices.json';
import sources from '../../../data/games/leafgreen/sources.json';
import breedingRules from '../../../data/games/leafgreen/breeding-rules.json';
import evolutions from '../../../data/games/leafgreen/evolutions.json';
import exclusions from '../../../data/games/leafgreen/exclusions.json';

// LeafGreen remains unregistered until parent integration adds its shared references.
export const rawGame: unknown = {
  game, profiles, typeChart, milestones, bosses, locations, capabilities,
  items, choices, sources, breedingRules, evolutions, exclusions,
};
