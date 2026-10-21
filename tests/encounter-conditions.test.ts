import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import { validateDataset } from '../src/data/validate-dataset';
import { checkTeam } from '../src/domain/team/check-team';
import { fixture, milestone, none, review, source } from './fixtures';
import { progressContent } from '../src/features/export/progress-content';

function encounterFixture() {
  const value = fixture(['wurmple']);
  delete value.game.profiles[0].regionalDex;
  return value;
}

function honeyFixture() {
  const { data, game } = encounterFixture();
  game.capabilities.push({ id: 'honey-tree', name: 'Slather a Honey Tree and wait 6–24 hours', requirements: milestone('gate'), review });
  game.items.push({ id: 'honey', name: 'Honey', sources: [{ id: 'one-honey', locationId: 'field',
    requirements: none, maxUses: 1, choice: null, review }], review });
  source(game, 'honey-wurmple', 'wurmple', 5, { kind: 'all', requirements: [
    { kind: 'capability', id: 'honey-tree' }, { kind: 'item', id: 'honey', quantity: 1, consumed: true },
  ] }, { details: { kind: 'honey-tree', rareTreeOnly: false } });
  return { data, game };
}

describe('Conditional encounter actions', () => {
  it('keeps an external player connection outside native offline access', () => {
    const { data, game } = encounterFixture();
    const explanation = 'This fixture requires another connected player. Connected play is outside this guide.';
    game.exclusions.push({pokemonId:'wurmple',reason:'external-connection',explanation,review});
    expect(validateDataset(data).ok).toBe(true);
    const checked=getAvailability(data,{gameId:game.game.id,milestoneId:'end',respectLevelLimit:false});
    if (!checked.ok) throw new Error('Fixture query failed');
    expect(checked.value.entries.wurmple.status).toBe('unavailable');
    expect(progressContent(game,checked.value,'wurmple').missingSource?.explanation).toBe(explanation);
  });
  it('checks Honey Tree access and uses one Honey for each captured animal', () => {
    const { data, game } = honeyFixture();
    const checked = validateDataset(data);
    expect(checked.ok, JSON.stringify(checked)).toBe(true);
    const early = getAvailability(data, { gameId: game.game.id, milestoneId: 'start', respectLevelLimit: true });
    const later = getAvailability(data, { gameId: game.game.id, milestoneId: 'gate', respectLevelLimit: true });
    if (!early.ok || !later.ok) throw new Error('Fixture query failed');
    expect(early.value.entries.wurmple.status).toBe('later');
    expect(checkTeam(later.value, ['wurmple'], 'current-progress').feasible).toBe(true);
    expect(checkTeam(later.value, ['wurmple', 'wurmple'], 'current-progress').feasible).toBe(false);
  });

  it('rejects a Honey Tree source without a consumed Honey requirement', () => {
    const { data, game } = honeyFixture();
    game.sources[0].requirements = { kind: 'capability', id: 'honey-tree' };
    expect(validateDataset(data).ok).toBe(false);
  });

  it('requires the reviewed swarm action for a swarm source', () => {
    const { data, game } = encounterFixture();
    const encounter = source(game, 'swarm-wurmple', 'wurmple', 5, none,
      { details: { kind: 'wild', method: 'grass', ratePercent: 20 }, encounterConditions: [{ kind: 'swarm' }] });
    expect(validateDataset(data).ok).toBe(false);
    game.capabilities.push({ id: 'swarm', name: 'Visit the route in the daily swarm report', requirements: milestone('future'), review });
    encounter.requirements = { kind: 'capability', id: 'swarm' };
    const checked = validateDataset(data);
    expect(checked.ok, JSON.stringify(checked)).toBe(true);
  });

  it('checks that a Feebas tile condition uses a fishing method', () => {
    const { data, game } = encounterFixture();
    source(game, 'tile-fixture', 'wurmple', 10, none, { details: { kind: 'wild', method: 'grass', ratePercent: 50 },
      encounterConditions: [{ kind: 'feebas-tiles', tileCount: 4, replacementPercent: 50 }] });
    expect(validateDataset(data).ok).toBe(false);
  });
});
