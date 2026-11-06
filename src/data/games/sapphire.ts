import game from '../../../data/games/sapphire/game.json';
import profiles from '../../../data/games/sapphire/pokemon.json';
import typeChart from '../../../data/games/sapphire/type-chart.json';
import milestones from '../../../data/games/sapphire/progression.json';
import bosses from '../../../data/games/sapphire/bosses.json';
import locations from '../../../data/games/sapphire/locations.json';
import capabilities from '../../../data/games/sapphire/capabilities.json';
import items from '../../../data/games/sapphire/items.json';
import choices from '../../../data/games/sapphire/choices.json';
import sources from '../../../data/games/sapphire/sources.json';
import breedingRules from '../../../data/games/sapphire/breeding-rules.json';
import evolutions from '../../../data/games/sapphire/evolutions.json';
import exclusions from '../../../data/games/sapphire/exclusions.json';

/** Assemble maintained Sapphire files without conversion or network access. */
export const rawGame: unknown = { game, profiles, typeChart, milestones, bosses, locations,
  capabilities, items, choices, sources, breedingRules, evolutions, exclusions };
