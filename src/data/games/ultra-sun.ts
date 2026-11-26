import game from '../../../data/games/ultra-sun/game.json';
import profiles from '../../../data/games/shared/ultra-sun-ultra-moon/pokemon.json';
import regionalDex from '../../../data/games/shared/ultra-sun-ultra-moon/regional-dex.json';
import pairProgress from '../../../data/games/shared/ultra-sun-ultra-moon/progress.json';
import progress from '../../../data/games/ultra-sun/progress.json';
import { alolaProgress } from './alola-progress';

export const rawGame = alolaProgress(game, profiles, regionalDex, pairProgress, progress);
