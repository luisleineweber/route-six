import { describe, expect, it } from 'vitest';
import { validateDataset } from '../src/data/validate-dataset';
import { getAvailability } from '../src/domain/availability';
import { analyzeTypes } from '../src/domain/team/analyze-types';
import { createInitialState } from '../src/features/planner/state';
import { fixture } from './fixtures';

function teamOnly() {
  const { data, game } = fixture(['bulbasaur']);
  Object.assign(game.game, { firstMilestoneId: null, planner: null });
  game.milestones = [];
  game.locations = [];
  game.capabilities = [];
  return { data, game };
}

describe('Reviewed team data without progress coverage', () => {
  it('accepts explicit team-only data without inventing a first progress point', () => {
    const { data, game } = teamOnly();
    const checked = validateDataset(data);
    expect(checked.ok, checked.ok ? '' : JSON.stringify(checked.error)).toBe(true);
    expect(createInitialState(game).milestoneId).toBeNull();
    expect(analyzeTypes(game, ['bulbasaur']).totalTypes).toBe(17);
  });

  it('returns a specific expected result when progress data is not ready', () => {
    const { data } = teamOnly();
    expect(getAvailability(data, { gameId: 'emerald', milestoneId: 'start', respectLevelLimit: true }))
      .toEqual({ ok: false, error: { code: 'progress-not-ready', gameId: 'emerald' } });
  });

  it('rejects a progress record hidden in a team-only dataset', () => {
    const { data, game } = teamOnly();
    game.locations.push({ id: 'field', name: 'Field', requirements: { kind: 'all', requirements: [] }, review: game.game.review });
    const checked = validateDataset(data);
    expect(checked.ok).toBe(false);
  });

  it('still checks regional numbering and types for a team-only game', () => {
    const { data, game } = teamOnly();
    game.profiles[0].regionalDex = 2;
    game.profiles[0].types = ['missing-type'];
    const checked = validateDataset(data);
    expect(checked.ok).toBe(false);
    if (!checked.ok) {
      expect(checked.error.map(issue => issue.message).join()).toContain('Unknown game type');
      expect(checked.error.map(issue => issue.message).join()).toContain('contiguous');
    }
  });

  it('rejects a ready planner without its first progress point', () => {
    const { data, game } = fixture(['bulbasaur']);
    game.milestones = [];
    expect(validateDataset(data).ok).toBe(false);
  });
});
