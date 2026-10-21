import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import { validateDataset } from '../src/data/validate-dataset';
import { checkTeam } from '../src/domain/team/check-team';
import { evolution, fixture, none, review, source } from './fixtures';
import { itemSourceInstructions } from '../src/components/item-source-presentation';
import { progressContent } from '../src/features/export/progress-content';
import { solve } from '../src/domain/availability/solve';

function pickupFixture() {
  const value = fixture(['zigzagoon', 'ralts', 'kirlia']);
  for (const profile of value.game.profiles) delete profile.regionalDex;
  source(value.game, 'pickup-holder', 'zigzagoon', 5, none,
    { details: { kind: 'wild', method: 'grass', ratePercent: 20 } });
  source(value.game, 'ralts', 'ralts');
  value.game.items.push({ id: 'stone', name: 'Stone', review, sources: [{
    id: 'pickup-stone', locationId: 'field', requirements: none, maxUses: null, choice: null, review,
    details: { kind: 'pickup', pokemonSourceId: 'pickup-holder', minimumLevel: 21, maximumLevel: 30, ratePercent: 0.1 },
  }] });
  evolution(value.game, 'ralts', 'kirlia', null, { trigger: 'use-item', itemId: 'stone',
    requirements: { kind: 'item', id: 'stone', quantity: 1, consumed: true } });
  return value;
}

function snapshot(value: ReturnType<typeof pickupFixture>, milestoneId: string, respectLevelLimit = true) {
  const result = getAvailability(value.data, { gameId: value.game.game.id, milestoneId, respectLevelLimit });
  if (!result.ok) throw new Error('Fixture query failed');
  return result.value;
}

describe('Reviewed item sources', () => {
  it('uses a free repeatable item proof without an unnecessary captured holder', () => {
    const value = pickupFixture();
    value.game.items[0].sources.push({ id: 'mined-stone', locationId: 'field', requirements: none,
      maxUses: null, choice: null, review });
    const context = solve(value.game, value.game.milestones.find(row => row.id === 'gate')!, true);
    const paths = context.paths.get('kirlia')!;
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.every(path => !path.sourceIds.includes('pickup-holder'))).toBe(true);
    expect(paths.every(path => path.itemUses.some(use => use.resourceId === 'item-source:mined-stone'))).toBe(true);
  });

  it('keeps item alternatives with distinct finite costs', () => {
    const value = pickupFixture();
    value.game.items[0].sources.push({ id: 'one-stone', locationId: 'field', requirements: none,
      maxUses: 1, choice: null, review });
    const result = snapshot(value, 'gate');
    const paths = result.entries.kirlia.currentPathIds.map(id => result.paths[id]);
    expect(paths.some(path => path.claims.some(claim => claim.resourceId === 'item-source:one-stone'))).toBe(true);
    expect(paths.some(path => path.claims.some(claim => claim.resourceId === 'item-source:pickup-stone'))).toBe(true);
    expect(checkTeam(result, ['kirlia', 'kirlia'], 'current-progress').feasible).toBe(true);
  });

  it('checks the Pickup holder level against the cap and retains the holder', () => {
    const value = pickupFixture();
    expect(snapshot(value, 'start').entries.kirlia.status).toBe('later');
    expect(snapshot(value, 'start', false).entries.kirlia.status).toBe('available');
    const later = snapshot(value, 'gate');
    expect(later.entries.kirlia.status).toBe('available');
    expect(later.entries.kirlia.currentPathIds.every(id => later.paths[id].minimumLevel === 5)).toBe(true);
    expect(checkTeam(later, ['kirlia', 'zigzagoon'], 'current-progress').feasible).toBe(true);
    expect(checkTeam(later, ['kirlia', 'kirlia'], 'current-progress').feasible).toBe(true);
    expect(validateDataset(value.data).ok).toBe(true);
  });

  it('does not use a holder caught above the Pickup level range', () => {
    const value = pickupFixture();
    value.game.sources[0].level = { kind: 'fixed', value: 31 };
    expect(snapshot(value, 'end', false).entries.kirlia.status).toBe('blocked');
  });

  it('shows the Pickup ability, level range and empty slot in details and export', () => {
    const value = pickupFixture();
    const result = snapshot(value, 'gate');
    const path = result.paths[result.entries.kirlia.currentPathIds[0]];
    const text = itemSourceInstructions(value.game, path).join(' ');
    expect(text).toContain('Zigzagoon with Pickup at Lv. 21–30');
    expect(text).toContain('held item slot empty');
    expect(text).toContain('0.1% chance to give Stone');
    expect(progressContent(value.game, result, 'kirlia').acquisition.join(' ')).toContain(text);
  });

  it('cannot use a different encounter to bypass the Pickup source gate', () => {
    const value = pickupFixture();
    value.game.sources[0].requirements = { kind: 'milestone', id: 'future' };
    source(value.game, 'earlier-holder', 'zigzagoon', 5);
    expect(snapshot(value, 'gate').entries.kirlia.status).toBe('later');
    expect(snapshot(value, 'future').entries.kirlia.status).toBe('available');
  });

  it('rejects unknown capture references and a reversed Pickup level range', () => {
    const value = pickupFixture();
    const itemSource = value.game.items[0].sources[0];
    itemSource.details = { kind: 'pickup', pokemonSourceId: 'missing', minimumLevel: 21, maximumLevel: 30, ratePercent: 0.1 };
    expect(validateDataset(value.data).ok).toBe(false);
    itemSource.details = { kind: 'pickup', pokemonSourceId: 'pickup-holder', minimumLevel: 31, maximumLevel: 30, ratePercent: 0.1 };
    expect(validateDataset(value.data).ok).toBe(false);
  });

  it('does not take two different held items from one finite wild animal', () => {
    const value = fixture(['zigzagoon', 'ralts', 'kirlia', 'seedot', 'nuzleaf']);
    for (const profile of value.game.profiles) delete profile.regionalDex;
    source(value.game, 'holder', 'zigzagoon', 5, none,
      { maxUses: 1, details: { kind: 'wild', method: 'grass', ratePercent: 20 } });
    source(value.game, 'ralts', 'ralts');
    source(value.game, 'seedot', 'seedot');
    for (const [id, from, to] of [['first-stone', 'ralts', 'kirlia'], ['second-stone', 'seedot', 'nuzleaf']]) {
      value.game.items.push({ id, name: id, review, sources: [{ id: id + '-held', locationId: 'field',
        requirements: none, maxUses: 1, choice: null, review,
        details: { kind: 'wild-held-item', pokemonSourceId: 'holder', ratePercent: 5 } }] });
      evolution(value.game, from, to, null, { trigger: 'use-item', itemId: id,
        requirements: { kind: 'item', id, quantity: 1, consumed: true } });
    }
    const result = snapshot(value, 'gate');
    expect(result.entries.kirlia.status).toBe('available');
    expect(result.entries.nuzleaf.status).toBe('available');
    expect(checkTeam(result, ['kirlia', 'zigzagoon'], 'current-progress').feasible).toBe(true);
    expect(checkTeam(result, ['kirlia', 'nuzleaf'], 'current-progress').feasible).toBe(false);
    expect(validateDataset(value.data).ok).toBe(true);
    value.game.sources[0].requirements = { kind: 'item', id: 'first-stone', quantity: 1, consumed: true };
    const invalid = validateDataset(value.data);
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) expect(invalid.error.some(issue => issue.message.includes('consumed entry resource'))).toBe(true);
  });
});
