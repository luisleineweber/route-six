import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import { compareTeams } from '../src/domain/team/compare-teams';
import { fixture, milestone, none, review, source } from './fixtures';
import { emerald } from './local-data';

describe('Team comparison', () => {
  it('shows coverage and defense differences even without an availability snapshot', () => {
    const result = compareTeams(emerald, ['swampert'], ['pikachu'], 'current-progress', null);

    expect(result.currentOnlyCoverage).toEqual(['fire', 'electric', 'poison', 'ground', 'rock', 'steel']);
    expect(result.draftOnlyCoverage).toEqual(['water', 'flying']);
    expect(result.current.types.immunities.electric).toBe(1);
    expect(result.draft.types.weaknesses.ground).toBe(1);
    expect(result.current.availability).toBeNull();
    expect(result.draft.availability).toBeNull();
  });

  it('gives identical teams the same results and leaves both slot lists intact', () => {
    const slots = Object.freeze([null, 'pikachu', null, 'pikachu', null, null]);
    const result = compareTeams(emerald, slots, [...slots], 'current-progress', null);

    expect(result.current).toEqual(result.draft);
    expect(result.current.memberCount).toBe(2);
    expect(result.currentOnlyCoverage).toEqual([]);
    expect(result.draftOnlyCoverage).toEqual([]);
    expect(slots).toEqual([null, 'pikachu', null, 'pikachu', null, null]);
  });

  it('keeps the reference results when the draft is empty', () => {
    const result = compareTeams(emerald, ['pikachu'], Array(6).fill(null), 'current-progress', null);

    expect(result.draft.memberCount).toBe(0);
    expect(result.draft.types.coveredTypes).toEqual([]);
    expect(result.currentOnlyCoverage).toEqual(result.current.types.coveredTypes);
  });

  it('checks finite resources independently and preserves original slot indexes', () => {
    const { data, game } = fixture(['treecko', 'poochyena']);
    source(game, 'gift', 'treecko', 5, none, { maxUses: 1 });
    source(game, 'wild', 'poochyena');
    const availability = getAvailability(data, { gameId: 'emerald', milestoneId: 'gate', respectLevelLimit: true });
    if (!availability.ok) throw new Error('Invalid test query');

    const current = [null, 'treecko'];
    const draft = [null, null, 'treecko', 'poochyena', null, 'treecko'];
    const separate = compareTeams(game, current, current, 'current-progress', availability.value);
    expect(separate.current.availability?.feasible).toBe(true);
    expect(separate.draft.availability?.feasible).toBe(true);

    const conflict = compareTeams(game, current, draft, 'current-progress', availability.value);
    expect(conflict.current.availability?.feasible).toBe(true);
    expect(conflict.draft.availability?.members.map(member => member.slotIndex)).toEqual([2, 3, 5]);
    expect(conflict.draft.availability?.feasible).toBe(false);
    expect(conflict.draft.availability?.warnings).toMatchObject([{ code: 'finite-resource', slotIndexes: [2, 5] }]);
  });

  it('uses the selected target when future paths can resolve a choice conflict', () => {
    const { data, game } = fixture(['treecko', 'torchic', 'ralts']);
    game.choices.push({ id: 'starter', name: 'Starter', options: ['treecko', 'torchic'], maximumSelections: 1, review });
    for (const id of ['treecko', 'torchic']) {
      source(game, id, id, 5, none, { maxUses: 1, choice: { groupId: 'starter', optionId: id } });
    }
    source(game, 'future-torchic', 'torchic', 5, milestone('future'));
    source(game, 'future-ralts', 'ralts', 5, milestone('future'));
    const availability = getAvailability(data, { gameId: 'emerald', milestoneId: 'gate', respectLevelLimit: true });
    if (!availability.ok) throw new Error('Invalid test query');

    const team = [null, 'treecko', null, 'torchic', 'ralts', null];
    const now = compareTeams(game, team, [], 'current-progress', availability.value).current.availability;
    const full = compareTeams(game, team, [], 'whole-game', availability.value).current.availability;

    expect(now?.feasible).toBe(false);
    expect(now?.warnings).toMatchObject([
      { code: 'later', slotIndexes: [4] },
      { code: 'choice-conflict', slotIndexes: [1, 3] },
    ]);
    expect(full?.feasible).toBe(true);
    expect(full?.warnings).toEqual([]);
    const torchicPathId = full?.members[1].chosenPathId;
    expect(torchicPathId).toBeTruthy();
    expect(availability.value.paths[torchicPathId!].sourceIds).toContain('future-torchic');
    expect(full?.members[2]).toMatchObject({
      slotIndex: 4,
      status: 'later',
      firstMilestoneIds: ['future'],
      chosenPathId: availability.value.entries.ralts.futurePathIds[0],
    });
  });
});
