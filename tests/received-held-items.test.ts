import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import { validateDataset } from '../src/data/validate-dataset';
import type { ItemSourceDetails, PokemonSource } from '../src/domain/types';
import { checkTeam } from '../src/domain/team/check-team';
import { itemSourceInstructions } from '../src/components/item-source-presentation';
import { progressContent } from '../src/features/export/progress-content';
import { evolution, fixture, milestone, none, review, source } from './fixtures';

function receivedDetails(pokemonSourceId: string): ItemSourceDetails {
  return { kind: 'received-held-item', pokemonSourceId };
}

function addReceivedItem(game: ReturnType<typeof fixture>['game'], id: string, pokemonSourceId: string, itemId = id) {
  game.items.push({ id: itemId, name: itemId, review, sources: [{
    id, locationId: 'field', requirements: none, maxUses: 1, choice: null,
    details: receivedDetails(pokemonSourceId), review,
  }] });
}

function snapshot(value: ReturnType<typeof fixture>, milestoneId = 'gate') {
  const result = getAvailability(value.data, { gameId: value.game.game.id, milestoneId, respectLevelLimit: false });
  if (!result.ok) throw new Error('Fixture query failed');
  return result.value;
}

describe('received Pokémon held item sources', () => {
  it('does not expose an item before its one-time holder is obtained', () => {
    const value = fixture(['zigzagoon', 'ralts', 'kirlia']);
    source(value.game, 'future-gift-holder', 'zigzagoon', 5, milestone('future'), { maxUses: 1 });
    source(value.game, 'ralts', 'ralts');
    addReceivedItem(value.game, 'gift-stone', 'future-gift-holder', 'stone');
    evolution(value.game, 'ralts', 'kirlia', null, { trigger: 'use-item', itemId: 'stone',
      requirements: { kind: 'item', id: 'stone', quantity: 1, consumed: true } });

    expect(snapshot(value).entries.kirlia.currentPathIds).toEqual([]);
    expect(snapshot(value, 'future').entries.kirlia.status).toBe('available');
  });

  it('lets the acquired NPC trade holder and its held item coexist without paying the offer twice', () => {
    const value = fixture(['treecko', 'ralts', 'seedot', 'nuzleaf']);
    source(value.game, 'treecko-offer', 'treecko', 5, none, { maxUses: 1 });
    value.game.sources.push({
      id: 'trade-ralts', pokemonId: 'ralts', locationId: 'field',
      requirements: { kind: 'pokemon', id: 'treecko', quantity: 1, consumed: true },
      level: { kind: 'match-traded-pokemon', pokemonId: 'treecko' },
      genders: value.game.profiles.find(profile => profile.pokemonId === 'ralts')!.genders,
      maxUses: 1, choice: null, details: { kind: 'game-trade', offeredPokemonId: 'treecko' }, review,
    } satisfies PokemonSource);
    source(value.game, 'seedot', 'seedot');
    addReceivedItem(value.game, 'trade-held-stone', 'trade-ralts', 'stone');
    evolution(value.game, 'seedot', 'nuzleaf', null, { trigger: 'use-item', itemId: 'stone',
      requirements: { kind: 'item', id: 'stone', quantity: 1, consumed: true } });

    const result = snapshot(value);
    expect(result.entries.nuzleaf.status).toBe('available');
    expect(checkTeam(result, ['ralts', 'nuzleaf'], 'current-progress').feasible).toBe(true);
    expect(checkTeam(result, ['treecko', 'nuzleaf'], 'current-progress').feasible).toBe(false);
  });

  it('does not let one received stone evolve two different team members', () => {
    const value = fixture(['zigzagoon', 'ralts', 'kirlia', 'seedot', 'nuzleaf']);
    for (const profile of value.game.profiles) delete profile.regionalDex;
    source(value.game, 'gift-holder', 'zigzagoon', 5, none, { maxUses: 1 });
    source(value.game, 'ralts', 'ralts');
    source(value.game, 'seedot', 'seedot');
    addReceivedItem(value.game, 'gift-stone', 'gift-holder', 'stone');
    evolution(value.game, 'ralts', 'kirlia', null, { trigger: 'use-item', itemId: 'stone',
      requirements: { kind: 'item', id: 'stone', quantity: 1, consumed: true } });
    evolution(value.game, 'seedot', 'nuzleaf', null, { trigger: 'use-item', itemId: 'stone',
      requirements: { kind: 'item', id: 'stone', quantity: 1, consumed: true } });

    const result = snapshot(value);
    expect(result.entries.kirlia.status).toBe('available');
    expect(result.entries.nuzleaf.status).toBe('available');
    expect(checkTeam(result, ['kirlia', 'nuzleaf'], 'current-progress').feasible).toBe(false);
    expect(validateDataset(value.data).ok).toBe(true);
  });

  it('keeps a received item linked to the selected starter', () => {
    const value = fixture(['treecko', 'torchic', 'seedot', 'nuzleaf']);
    value.game.choices.push({ id: 'starter-choice', name: 'Starter', options: ['treecko', 'torchic'], maximumSelections: 1, review });
    source(value.game, 'treecko-starter', 'treecko', 5, none,
      { maxUses: 1, details: { kind: 'starter' }, choice: { groupId: 'starter-choice', optionId: 'treecko' } });
    source(value.game, 'torchic-starter', 'torchic', 5, none,
      { maxUses: 1, details: { kind: 'starter' }, choice: { groupId: 'starter-choice', optionId: 'torchic' } });
    source(value.game, 'seedot', 'seedot');
    addReceivedItem(value.game, 'treecko-held-stone', 'treecko-starter', 'stone');
    evolution(value.game, 'seedot', 'nuzleaf', null, { trigger: 'use-item', itemId: 'stone',
      requirements: { kind: 'item', id: 'stone', quantity: 1, consumed: true } });

    const result = snapshot(value);
    expect(checkTeam(result, ['treecko', 'nuzleaf'], 'current-progress').feasible).toBe(true);
    expect(checkTeam(result, ['torchic', 'nuzleaf'], 'current-progress').feasible).toBe(false);
  });

  it('shares one finite received-loot budget across distinct item record IDs', () => {
    const value = fixture(['zigzagoon', 'ralts', 'kirlia', 'seedot', 'nuzleaf']);
    source(value.game, 'gift-holder', 'zigzagoon', 5, none, { maxUses: 1 });
    source(value.game, 'ralts', 'ralts');
    source(value.game, 'seedot', 'seedot');
    addReceivedItem(value.game, 'gift-item-a', 'gift-holder', 'stone-a');
    addReceivedItem(value.game, 'gift-item-b', 'gift-holder', 'stone-b');
    evolution(value.game, 'ralts', 'kirlia', null, { trigger: 'use-item', itemId: 'stone-a',
      requirements: { kind: 'item', id: 'stone-a', quantity: 1, consumed: true } });
    evolution(value.game, 'seedot', 'nuzleaf', null, { trigger: 'use-item', itemId: 'stone-b',
      requirements: { kind: 'item', id: 'stone-b', quantity: 1, consumed: true } });

    const result = snapshot(value);
    expect(checkTeam(result, ['kirlia', 'nuzleaf'], 'current-progress').feasible).toBe(false);
  });

  it('shows a guaranteed received-item action in details and progress export', () => {
    const value = fixture(['zigzagoon', 'seedot', 'nuzleaf']);
    source(value.game, 'gift-holder', 'zigzagoon', 5, none, { maxUses: 1 });
    source(value.game, 'seedot', 'seedot');
    addReceivedItem(value.game, 'gift-stone', 'gift-holder', 'stone');
    evolution(value.game, 'seedot', 'nuzleaf', null, { trigger: 'use-item', itemId: 'stone',
      requirements: { kind: 'item', id: 'stone', quantity: 1, consumed: true } });

    const result = snapshot(value);
    const path = result.paths[result.entries.nuzleaf.currentPathIds[0]];
    const instructions = itemSourceInstructions(value.game, path).join(' ');
    expect(instructions).toContain('Obtain Zigzagoon at Field, then take its stone.');
    expect(instructions).toContain('available once');
    expect(instructions).not.toContain('chance');
    expect(progressContent(value.game, result, 'nuzleaf').acquisition.join(' ')).toContain(instructions);
  });

  it.each([
    ['repeatable holder', (value: ReturnType<typeof fixture>) => source(value.game, 'holder', 'zigzagoon'),
      'Received held items require one holder and one item per playthrough.'],
    ['egg holder', (value: ReturnType<typeof fixture>) => source(value.game, 'holder', 'zigzagoon', 5, none,
      { maxUses: 1, details: { kind: 'egg' } }),
      'Received item holder must refer to a reviewed native gift, capture, or NPC trade.'],
    ['missing holder', (_value: ReturnType<typeof fixture>) => undefined,
      'Received item holder must refer to a reviewed native gift, capture, or NPC trade.'],
    ['finite wild holder', (value: ReturnType<typeof fixture>) => source(value.game, 'holder', 'zigzagoon', 5, none,
      { maxUses: 1, details: { kind: 'wild', method: 'grass', ratePercent: 20 } }),
      'Received item holder must refer to a reviewed native gift, capture, or NPC trade.'],
  ])('rejects a %s as a received held-item source', (_label, addHolder, expectedMessage) => {
    const value = fixture(['zigzagoon', 'ralts', 'kirlia']);
    addHolder(value);
    source(value.game, 'ralts', 'ralts');
    addReceivedItem(value.game, 'received-stone', 'holder', 'stone');
    evolution(value.game, 'ralts', 'kirlia', null, { trigger: 'use-item', itemId: 'stone',
      requirements: { kind: 'item', id: 'stone', quantity: 1, consumed: true } });

    const validation = validateDataset(value.data);
    expect(validation.ok).toBe(false);
    if (!validation.ok) expect(validation.error.some(issue => issue.message === expectedMessage)).toBe(true);
  });

  it('rejects a repeatable received-item source with a valid one-time holder', () => {
    const value = fixture(['zigzagoon', 'ralts', 'kirlia']);
    source(value.game, 'gift-holder', 'zigzagoon', 5, none, { maxUses: 1 });
    source(value.game, 'ralts', 'ralts');
    addReceivedItem(value.game, 'received-stone', 'gift-holder', 'stone');
    value.game.items[0].sources[0].maxUses = null;

    const validation = validateDataset(value.data);
    expect(validation.ok).toBe(false);
    if (!validation.ok) expect(validation.error.some(issue => issue.message ===
      'Received held items require one holder and one item per playthrough.')).toBe(true);
  });

  it('rejects a received item whose item location differs from the native holder source', () => {
    const value = fixture(['zigzagoon', 'ralts', 'kirlia']);
    source(value.game, 'gift-holder', 'zigzagoon', 5, none, { maxUses: 1 });
    source(value.game, 'ralts', 'ralts');
    addReceivedItem(value.game, 'received-stone', 'gift-holder', 'stone');
    value.game.items[0].sources[0].locationId = 'other-field';

    const validation = validateDataset(value.data);
    expect(validation.ok).toBe(false);
    if (!validation.ok) expect(validation.error.some(issue => issue.message ===
      'Item holder and item source must use the same location.')).toBe(true);
  });
});
