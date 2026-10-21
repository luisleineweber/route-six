import { describe, expect, it } from 'vitest';
import { validateDataset } from '../src/data/validate-dataset';
import { getAvailability } from '../src/domain/availability';
import { checkTeam } from '../src/domain/team/check-team';
import { sourceMethod } from '../src/components/acquisition-presentation';
import { fixture, milestone, source } from './fixtures';

function roamingFixture() {
  const { game, data } = fixture(['raikou']);
  const encounter = source(game, 'roaming-raikou', 'raikou', 40, milestone('gate'), {
    details: { kind: 'roaming' }, maxUses: 1,
  });
  return { game, data, encounter };
}

describe('Roaming acquisition sources', () => {
  it('uses the release gate and permits only one catch of the same legend', () => {
    const { game, data, encounter } = roamingFixture();
    expect(validateDataset(data).ok).toBe(true);
    expect(sourceMethod(encounter.details)).toEqual({ name: 'Roaming encounter', rodIcon: null });
    const early = getAvailability(data, { gameId: game.game.id, milestoneId: 'start', respectLevelLimit: false });
    const later = getAvailability(data, { gameId: game.game.id, milestoneId: 'gate', respectLevelLimit: false });
    expect(early.ok && early.value.entries.raikou.status).toBe('later');
    expect(later.ok && later.value.entries.raikou.status).toBe('available');
    if (later.ok) {
      expect(checkTeam(later.value, ['raikou'], 'current-progress').feasible).toBe(true);
      expect(checkTeam(later.value, ['raikou', 'raikou'], 'current-progress').feasible).toBe(false);
    }
  });

  it('rejects repeatable or variable-level roaming sources', () => {
    const { data, encounter } = roamingFixture();
    encounter.maxUses = null;
    expect(validateDataset(data).ok).toBe(false);
    encounter.maxUses = 1;
    encounter.level = { kind: 'range', minimum: 40, maximum: 45 };
    expect(validateDataset(data).ok).toBe(false);
  });
});
