import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import { validateDataset } from '../src/data/validate-dataset';
import type { Dataset, EvolutionCondition } from '../src/domain/types';
import { evolution, fixture as baseFixture, milestone, none, review, source } from './fixtures';

function fixture(ids: string[]) {
  const result = baseFixture(ids);
  for (const profile of result.game.profiles) delete profile.regionalDex;
  return result;
}

function query(data: Dataset, milestoneId = 'start') {
  const result = getAvailability(data, { gameId: 'emerald', milestoneId, respectLevelLimit: true });
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}

function condition(value: EvolutionCondition): EvolutionCondition {
  return value;
}

describe('Reviewed evolution actions', () => {
  it('requires the evolution location and keeps its access resource', () => {
    const { data, game } = fixture(['ralts', 'kirlia']);
    source(game, 'parent', 'ralts');
    game.items.push({ id: 'key', name: 'Key', review, sources: [
      { id: 'key-gift', locationId: 'field', requirements: milestone('gate'), maxUses: 1, choice: null, review },
    ] });
    game.locations.push({ id: 'evolution-place', name: 'Evolution place', review,
      requirements: { kind: 'item', id: 'key', quantity: 1, consumed: false } });
    evolution(game, 'ralts', 'kirlia', null, {
      conditions: [condition({ kind: 'location', locationId: 'evolution-place' })],
    });
    expect(validateDataset(data).ok).toBe(true);
    expect(query(data).entries.kirlia.status).toBe('later');
    const later = query(data, 'gate');
    expect(later.entries.kirlia.status).toBe('available');
    expect(later.paths[later.entries.kirlia.currentPathIds[0]].claims).toContainEqual({
      resourceId: 'item-source:key-gift', quantity: 1, use: 'retain',
    });
  });

  it('consumes an evolution held item after a level gain', () => {
    const { data, game } = fixture(['ralts', 'kirlia']);
    source(game, 'parent', 'ralts', 10);
    game.items.push({ id: 'held-item', name: 'Held item', review, sources: [
      { id: 'held-gift', locationId: 'field', requirements: milestone('gate'), maxUses: 1, choice: null, review },
    ] });
    evolution(game, 'ralts', 'kirlia', null, {
      conditions: [condition({ kind: 'held-item', itemId: 'held-item' })],
    });
    expect(validateDataset(data).ok).toBe(true);
    expect(query(data).entries.kirlia.status).toBe('later');
    const later = query(data, 'gate');
    const path = later.paths[later.entries.kirlia.currentPathIds[0]];
    expect(path.minimumLevel).toBe(11);
    expect(path.claims).toContainEqual({ resourceId: 'item-source:held-gift', quantity: 1, use: 'consume' });
  });

  it('keeps the required party Pokémon alive', () => {
    const { data, game } = fixture(['ralts', 'kirlia', 'magikarp']);
    source(game, 'parent', 'ralts');
    source(game, 'party-member', 'magikarp', 5, milestone('gate'), { maxUses: 1 });
    evolution(game, 'ralts', 'kirlia', null, {
      conditions: [condition({ kind: 'party-pokemon', pokemonId: 'magikarp' })],
    });
    expect(validateDataset(data).ok).toBe(true);
    expect(query(data).entries.kirlia.status).toBe('later');
    const later = query(data, 'gate');
    expect(later.paths[later.entries.kirlia.currentPathIds[0]].claims).toContainEqual({
      resourceId: 'source:party-member', quantity: 1, use: 'retain',
    });
  });

  it('learns an evolution move at its reviewed level and respects the cap', () => {
    const { data, game } = fixture(['ralts', 'kirlia']);
    source(game, 'parent', 'ralts', 5);
    evolution(game, 'ralts', 'kirlia', null, {
      conditions: [condition({ kind: 'known-move', moveId: 'mimic', moveName: 'Mimic',
        learning: [{ kind: 'level-up', level: 18 }] })],
    });
    expect(validateDataset(data).ok).toBe(true);
    expect(query(data).entries.kirlia.status).toBe('later');
    const later = query(data, 'gate');
    expect(later.paths[later.entries.kirlia.currentPathIds[0]].minimumLevel).toBe(18);
  });

  it('does not invent a missed move for a high-level capture', () => {
    const { data, game } = fixture(['ralts', 'kirlia']);
    source(game, 'parent', 'ralts', 30);
    evolution(game, 'ralts', 'kirlia', null, {
      conditions: [condition({ kind: 'known-move', moveId: 'mimic', moveName: 'Mimic',
        learning: [{ kind: 'level-up', level: 18 }] })],
    });
    expect(query(data, 'end').entries.kirlia.status).toBe('blocked');
  });

  it('uses a move already known by the captured individual', () => {
    const { data, game } = fixture(['ralts', 'kirlia']);
    source(game, 'parent', 'ralts', 18, none, { knownMoveIds: ['mimic'] });
    evolution(game, 'ralts', 'kirlia', null, {
      conditions: [condition({ kind: 'known-move', moveId: 'mimic', moveName: 'Mimic',
        learning: [{ kind: 'level-up', level: 18 }] })],
    });
    expect(validateDataset(data).ok).toBe(true);
    const later = query(data, 'gate');
    expect(later.paths[later.entries.kirlia.currentPathIds[0]].minimumLevel).toBe(19);
  });

  it('proves move teaching access and consumes its finite item', () => {
    const { data, game } = fixture(['ralts', 'kirlia']);
    source(game, 'parent', 'ralts', 20);
    game.capabilities.push({ id: 'move-reminder', name: 'Move Reminder', requirements: milestone('future'), review });
    game.items.push({ id: 'heart-scale', name: 'Heart Scale', review, sources: [
      { id: 'scale', locationId: 'field', requirements: none, maxUses: 1, choice: null, review },
    ] });
    evolution(game, 'ralts', 'kirlia', null, {
      conditions: [condition({ kind: 'known-move', moveId: 'mimic', moveName: 'Mimic', learning: [
        { kind: 'level-up', level: 18 },
        { kind: 'teach', minimumLevel: 18, requirements: { kind: 'all', requirements: [
          { kind: 'capability', id: 'move-reminder' },
          { kind: 'item', id: 'heart-scale', quantity: 1, consumed: true },
        ] } },
      ] })],
    });
    expect(validateDataset(data).ok).toBe(true);
    expect(query(data, 'gate').entries.kirlia.status).toBe('later');
    const later = query(data, 'future');
    const path = later.paths[later.entries.kirlia.currentPathIds[0]];
    expect(path.minimumLevel).toBe(21);
    expect(path.claims).toContainEqual({ resourceId: 'item-source:scale', quantity: 1, use: 'consume' });
  });

  it('rejects an unknown evolution location', () => {
    const { data, game } = fixture(['ralts', 'kirlia']);
    source(game, 'parent', 'ralts');
    evolution(game, 'ralts', 'kirlia', null, {
      conditions: [condition({ kind: 'location', locationId: 'missing' })],
    });
    const checked = validateDataset(data);
    expect(checked.ok).toBe(false);
    if (!checked.ok) expect(checked.error.some(issue => issue.message.includes('Unknown location'))).toBe(true);
  });

  it('cannot teach a future level-up move below its eligible level', () => {
    const { data, game } = fixture(['ralts', 'kirlia']);
    source(game, 'parent', 'ralts', 5);
    game.capabilities.push({ id: 'move-reminder', name: 'Move Reminder', requirements: none, review });
    evolution(game, 'ralts', 'kirlia', null, {
      conditions: [{ kind: 'known-move', moveId: 'mimic', moveName: 'Mimic', learning: [
        { kind: 'teach', minimumLevel: 18, requirements: { kind: 'capability', id: 'move-reminder' } },
      ] }],
    });
    expect(validateDataset(data).ok).toBe(true);
    expect(query(data).entries.kirlia.status).toBe('later');
    const later = query(data, 'gate');
    expect(later.paths[later.entries.kirlia.currentPathIds[0]].minimumLevel).toBe(19);
  });
});
