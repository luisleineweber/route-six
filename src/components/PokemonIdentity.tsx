import { useGameData } from '../features/planner/GameContext';
import { selectionProfile } from '../domain/pokemon-selection';
import { assetUrl } from '../data/asset-url';
import type { CSSProperties } from 'react';
import type { GameData } from '../domain/types';
import { typeColor } from '../features/export/type-colors';

export const typeName = (type: string) => type[0].toUpperCase() + type.slice(1);

export function TypeIcon({ type, size = 20 }: { type: string; size?: number }) {
  return <img className="type-icon" src={assetUrl(`/types/${type}.svg`)} alt="" width={size} height={size} decoding="async" />;
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
  return <img className="pokemon-sprite" src={assetUrl(profile.spriteSrc)} alt="" width={pixels} height={pixels} loading="lazy" />;
}

export function PokemonTypes({ id, compact = false, joined = false }: { id: string; compact?: boolean; joined?: boolean }) {
  const game = useGameData();
  const profile = selectionProfile(game, id);
  const joinPair = joined && profile.types.length === 2;
  return <div className={`type-list${joinPair ? ' joined-types' : ''}`} title={joinPair ? profile.types.map(typeName).join(' / ') : undefined}>
    {profile.types.map(type => <TypeBadge key={type} type={type} compact={compact} />)}
  </div>;
}

/** Soft type colours behind a sprite. A single type uses its colour twice. */
export function typeTint(game: GameData, id: string): CSSProperties {
  const [first, second = first] = selectionProfile(game, id).types;
  return { '--tint-a': typeColor(first), '--tint-b': typeColor(second) } as CSSProperties;
}
