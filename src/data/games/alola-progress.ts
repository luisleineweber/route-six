import typeChart from '../../../data/games/shared/generation-seven/type-chart.json';
import commonProgress from '../../../data/games/shared/alola/progress.json';
import commonProfiles from '../../../data/games/shared/alola/pokemon.json';
import { withRegionalDex } from './generation-seven-team';

type ProgressPart = { [Key in keyof typeof commonProgress]: readonly unknown[] };

export function alolaProgress(
  game: unknown,
  profiles: readonly { pokemonId: string }[],
  regionalDex: readonly string[],
  pair: ProgressPart,
  edition: ProgressPart,
): unknown {
  const keys = Object.keys(commonProgress) as (keyof ProgressPart)[];
  const sections = keys.map(key => [key, [...commonProgress[key], ...pair[key], ...edition[key]]]);
  return {
    game,
    typeChart,
    profiles: withRegionalDex([...commonProfiles, ...profiles], regionalDex),
    ...Object.fromEntries(sections),
  };
}
