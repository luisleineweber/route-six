import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import type { Dataset } from '../src/domain/types';
import { buildTeamExport } from '../src/features/export/export-model';
import { createInitialState } from '../src/features/planner/state';
import { fixture, milestone, none, review, source } from './fixtures';

function snapshot(data: Dataset) {
  const result = getAvailability(data, { gameId: 'emerald', milestoneId: 'gate', respectLevelLimit: true });
  if (!result.ok) throw new Error('Invalid test query');
  return result.value;
}

describe('PNG team status', () => {
  it('names the conflicting Pokémon in the sheet note', () => {
    const { data, game } = fixture(['treecko', 'torchic', 'poochyena']);
    game.choices.push({ id: 'starter', name: 'Starter', options: ['treecko', 'torchic'], maximumSelections: 1, review });
    for (const id of ['treecko', 'torchic']) source(game, id, id, 5, none, { maxUses: 1, choice: { groupId: 'starter', optionId: id } });
    source(game, 'wild', 'poochyena');
    const state = { ...createInitialState(game), team: ['treecko', 'poochyena', 'torchic', null, null, null] };
    const model = buildTeamExport(game, state, true, snapshot(data));
    expect(model.notes).toEqual(['Team conflict: Treecko and Torchic need incompatible choices in Starter. Select another family or source.']);
  });

  it('marks a member that only becomes available later', () => {
    const { data, game } = fixture(['treecko', 'torchic']);
    source(game, 'treecko', 'treecko');
    source(game, 'torchic', 'torchic', 5, milestone('future'));
    const state = { ...createInitialState(game), team: ['treecko', 'torchic', null, null, null, null] };
    const model = buildTeamExport(game, state, true, snapshot(data));
    expect(model.slots[0].progress!.availableLater).toBe(false);
    expect(model.slots[1].progress!.availableLater).toBe(true);
  });
});
