import game from '../../../data/games/moon/game.json';
import profiles from '../../../data/games/shared/sun-moon/pokemon.json';
import regionalDex from '../../../data/games/shared/sun-moon/regional-dex.json';
import pairProgress from '../../../data/games/shared/sun-moon/progress.json';
import progress from '../../../data/games/moon/progress.json';
import { alolaProgress } from './alola-progress';

export const rawGame = alolaProgress(game, profiles, regionalDex, pairProgress, progress);
