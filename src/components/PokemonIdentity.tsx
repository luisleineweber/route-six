import { useGameData } from '../features/planner/GameContext';
import { selectionProfile } from '../domain/pokemon-selection';

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
  const game = useGameData();
  const profile = selectionProfile(game, id);
  const pixels = spriteSizes[size];
  return <img className="pokemon-sprite" src={profile.spriteSrc} alt="" width={pixels} height={pixels} loading="lazy" />;
}

export function PokemonTypes({ id, compact = false, joined = false }: { id: string; compact?: boolean; joined?: boolean }) {
  const game = useGameData();
  const profile = selectionProfile(game, id);
  const joinPair = joined && profile.types.length === 2;
  return <div className={`type-list${joinPair ? ' joined-types' : ''}`} title={joinPair ? profile.types.map(typeName).join(' / ') : undefined}>
    {profile.types.map(type => <TypeBadge key={type} type={type} compact={compact} />)}
  </div>;
}
