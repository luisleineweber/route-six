import game from '../../../data/games/lets-go-eevee/game.json';
import sources from '../../../data/games/lets-go-eevee/sources.json';
import exclusions from '../../../data/games/lets-go-eevee/exclusions.json';
import { letsGoProgress } from './lets-go-progress';

export const rawGame = letsGoProgress(game, 'pikachu-partner', sources, exclusions);
