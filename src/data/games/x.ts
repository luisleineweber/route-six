import game from '../../../data/games/x/game.json';
import profiles from '../../../data/games/x/pokemon.json';
import typeChart from '../../../data/games/x/type-chart.json';
import milestones from '../../../data/games/shared/xy/progression.json';
import bosses from '../../../data/games/x/bosses.json';
import locations from '../../../data/games/shared/xy/locations.json';
import capabilities from '../../../data/games/shared/xy/capabilities.json';
import items from '../../../data/games/x/items.json';
import choices from '../../../data/games/shared/xy/choices.json';
import sources from '../../../data/games/x/sources.json';
import breedingRules from '../../../data/games/shared/xy/breeding-rules.json';
import evolutions from '../../../data/games/shared/xy/evolutions.json';
import exclusions from '../../../data/games/x/exclusions.json';
import formChanges from '../../../data/games/shared/xy/form-changes.json';

export const rawGame: unknown = {
  game, profiles, typeChart, milestones, bosses, locations, capabilities,
  items, choices, sources, breedingRules, evolutions, exclusions, formChanges,
};
