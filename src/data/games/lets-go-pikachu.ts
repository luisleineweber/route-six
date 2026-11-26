import game from '../../../data/games/lets-go-pikachu/game.json';
import sources from '../../../data/games/lets-go-pikachu/sources.json';
import exclusions from '../../../data/games/lets-go-pikachu/exclusions.json';
import { letsGoProgress } from './lets-go-progress';

export const rawGame = letsGoProgress(game, 'eevee-partner', sources, exclusions);
