import { pokemonById } from '../data/dataset';
import { useGameData } from '../features/planner/GameContext';

export const typeName = (type: string) => type[0].toUpperCase() + type.slice(1);

export function TypeIcon({ type, size = 20 }: { type: string; size?: number }) {
  return <img className="type-icon" src={`/types/${type}.svg`} alt="" width={size} height={size} decoding="async" />;
}

/** The compact form shows only the logo; the name stays available to assistive technology and as a tooltip. */
export function TypeBadge({ type, compact = false }: { type: string; compact?: boolean }) {
  return <span className="type-badge" title={compact ? typeName(type) : undefined}>
    <TypeIcon type={type} size={compact ? 24 : 20} />
    <span className={compact ? 'sr-only' : undefined}>{typeName(type)}</span>
  </span>;
}

const spriteSizes = { md: 96, lg: 128 } as const;

export function PokemonSprite({ id, size = 'md' }: { id: string; size?: keyof typeof spriteSizes }) {
  const pokemon = pokemonById.get(id)!;
  const pixels = spriteSizes[size];
  return <img className="pokemon-sprite" src={`/pokemon/${pokemon.nationalDex}.png`} alt="" width={pixels} height={pixels} loading="lazy" />;
}

export function PokemonTypes({ id, compact = false }: { id: string; compact?: boolean }) {
  const game = useGameData();
  const profile = game.profiles.find(profile => profile.pokemonId === id);
  if (!profile) throw new Error(`Missing Pokémon profile in ${game.game.name}: ${id}`);
  return <div className="type-list">{profile.types.map(type => <TypeBadge key={type} type={type} compact={compact} />)}</div>;
}
