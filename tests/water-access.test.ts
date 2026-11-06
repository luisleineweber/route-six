import { describe, expect, it } from 'vitest';
import type { GameData, Requirement } from '../src/domain/types';
import { dataset } from './local-data';

// Each game names these capabilities slightly differently, for example `surf-access` or an `old-rod` item.
const accessPattern: Record<string, RegExp> = {
  surf: /surf|hm03/, 'surf-spots': /surf|hm03/,
  'old-rod': /old-rod/, 'good-rod': /good-rod/, 'super-rod': /super-rod/, 'super-rod-spots': /super-rod/,
};

function requires(game: GameData, req: Requirement | undefined, pattern: RegExp, seen = new Set<string>()): boolean {
  if (!req) return false;
  if (req.kind === 'all') return req.requirements.some(child => requires(game, child, pattern, seen));
  if (req.kind === 'any') return req.requirements.length > 0 && req.requirements.every(child => requires(game, child, pattern, seen));
  if (req.kind === 'item') return pattern.test(req.id);
  if (req.kind !== 'capability' && req.kind !== 'location') return false;
  if (req.kind === 'capability' && pattern.test(req.id)) return true;
  const key = `${req.kind}:${req.id}`;
  if (seen.has(key)) return false;
  seen.add(key);
  const next = req.kind === 'capability'
    ? game.capabilities.find(capability => capability.id === req.id)?.requirements
    : game.locations.find(location => location.id === req.id)?.requirements;
  return requires(game, next, pattern, seen);
}

describe('water access', () => {
  it('gates every Surf and fishing source behind its field move or rod', () => {
    const missing = dataset.games.flatMap(game => {
      const locations = new Map(game.locations.map(location => [location.id, location]));
      return game.sources.flatMap(source => {
        const pattern = source.details.kind === 'wild' ? accessPattern[source.details.method] : undefined;
        if (!pattern) return [];
        const access: Requirement = { kind: 'all', requirements: [source.requirements, locations.get(source.locationId)!.requirements] };
        return requires(game, access, pattern) ? [] : [`${game.game.id}:${source.id}`];
      });
    });
    expect(missing).toEqual([]);
  });
});
