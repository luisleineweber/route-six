import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import type { AvailabilitySnapshot } from '../src/domain/types';
import { dataset } from './local-data';

const ids = ['x', 'y'] as const;
const speciesNeedingLaterAccess = [
  'carvanha', 'sharpedo', 'pyroar', 'articuno', 'zapdos', 'moltres', 'magnemite', 'voltorb', 'politoed',
];

function baseEntries(gameId: typeof ids[number], snapshot: AvailabilitySnapshot) {
  const game = dataset.games.find(row => row.game.id === gameId)!;
  return game.profiles.map(profile => snapshot.entries[profile.pokemonId]);
}

describe.each(ids)('public X/Y availability query for %s', gameId => {
  it('keeps optional-area species in future proofs from the starter checkpoint', () => {
    const result = getAvailability(dataset, { gameId, milestoneId: 'starter', respectLevelLimit: true });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const entries = baseEntries(gameId, result.value);
    const counts = entries.reduce((summary, entry) => {
      summary[entry.status] += 1;
      return summary;
    }, { available: 0, later: 0, blocked: 0, unavailable: 0 });
    expect(counts).toEqual({ available: 3, later: 432, blocked: 15, unavailable: 271 });

    for (const pokemonId of speciesNeedingLaterAccess) {
      const entry = result.value.entries[pokemonId];
      expect(entry?.status, pokemonId).toBe('later');
      expect(entry?.futurePathIds.length, pokemonId).toBeGreaterThan(0);
    }
  }, 60_000);

  it('makes all 435 native base species available at Kiloude without a side-trip history', () => {
    const result = getAvailability(dataset, { gameId, milestoneId: 'kiloude', respectLevelLimit: true });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const available = baseEntries(gameId, result.value).filter(entry => entry.status === 'available');
    expect(available).toHaveLength(435);
  }, 60_000);
});
