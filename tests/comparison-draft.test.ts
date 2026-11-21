import { describe, expect, it } from 'vitest';
import { comparisonReducer, type ComparisonDraft } from '../src/features/compare/comparison-draft';

const open = () => comparisonReducer(null, { type: 'open' })!;

describe('Comparison draft', () => {
  it('starts with six empty slots and closes to null', () => {
    expect(open()).toEqual({ slots: Array(6).fill(null), activeSlot: null });
    expect(comparisonReducer(open(), { type: 'close' })).toBeNull();
    expect(comparisonReducer(null, { type: 'add', pokemonId: 'pikachu', slot: 0 })).toBeNull();
  });

  it('copies forms, duplicates, and empty slots without sharing the current team', () => {
    const team = [null, 'pikachu', 'castform-sunny', null, 'pikachu', null];
    const copied = comparisonReducer(open(), { type: 'copy', team })!;
    expect(copied.slots).toEqual(team);
    const edited = comparisonReducer(copied, { type: 'add', pokemonId: 'swampert', slot: 1 })!;
    expect(edited.slots[1]).toBe('swampert');
    expect(team[1]).toBe('pikachu');
  });

  it('replaces a member in a full team through the chosen slot', () => {
    const full: ComparisonDraft = { slots: ['a', 'b', 'c', 'd', 'e', 'f'], activeSlot: null };
    const emptied = comparisonReducer(full, { type: 'remove', slot: 2 })!;
    const chosen = comparisonReducer(emptied, { type: 'choose', slot: 2 })!;
    expect(chosen.activeSlot).toBe(2);
    expect(comparisonReducer(chosen, { type: 'add', pokemonId: 'z', slot: 2 })).toEqual({ slots: ['a', 'b', 'z', 'd', 'e', 'f'], activeSlot: null });
  });

  it('clears the chosen slot when that slot is removed or the choice is cancelled', () => {
    const chosen = comparisonReducer(open(), { type: 'choose', slot: 3 })!;
    expect(comparisonReducer(chosen, { type: 'cancel' })!.activeSlot).toBeNull();
    expect(comparisonReducer(chosen, { type: 'remove', slot: 3 })!.activeSlot).toBeNull();
    expect(comparisonReducer(chosen, { type: 'remove', slot: 1 })!.activeSlot).toBe(3);
  });
});
