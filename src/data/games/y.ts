import game from '../../../data/games/y/game.json';
import profiles from '../../../data/games/y/pokemon.json';
import typeChart from '../../../data/games/y/type-chart.json';
import milestones from '../../../data/games/shared/xy/progression.json';
import bosses from '../../../data/games/y/bosses.json';
import locations from '../../../data/games/shared/xy/locations.json';
import capabilities from '../../../data/games/shared/xy/capabilities.json';
import items from '../../../data/games/y/items.json';
import choices from '../../../data/games/shared/xy/choices.json';
import sources from '../../../data/games/y/sources.json';
import breedingRules from '../../../data/games/shared/xy/breeding-rules.json';
import evolutions from '../../../data/games/shared/xy/evolutions.json';
import exclusions from '../../../data/games/y/exclusions.json';
import formChanges from '../../../data/games/shared/xy/form-changes.json';

export const rawGame: unknown = {
  game, profiles, typeChart, milestones, bosses, locations, capabilities,
  items, choices, sources, breedingRules, evolutions, exclusions, formChanges,
};
