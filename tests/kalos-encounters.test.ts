import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import { validateDataset } from '../src/data/validate-dataset';
import { sourceMethod } from '../src/components/acquisition-presentation';
import { encounterInstructions } from '../src/components/encounter-presentation';
import { progressContent } from '../src/features/export/progress-content';
import type { SourceDetails } from '../src/domain/types';
import { capability, fixture, milestone, none, review, source } from './fixtures';

const methods = [
  ['horde', 'Horde'],
  ['rough-terrain', 'Rough terrain'],
  ['yellow-flowers', 'Yellow flowers'],
  ['red-flowers', 'Red flowers'],
  ['purple-flowers', 'Purple flowers'],
  ['ceiling-ambush', 'Ceiling ambush'],
  ['ground-ambush', 'Ground ambush'],
  ['rustling-bush-ambush', 'Rustling bush'],
  ['sky-ambush', 'Sky ambush'],
  ['trash-can-ambush', 'Shaking trash can'],
] as const;

describe('Kalos encounter methods', () => {
  it.each(methods)('keeps %s distinct and gates its action', (method, label) => {
    const { data, game } = fixture(['wurmple']);
    delete game.profiles[0].regionalDex;
    game.capabilities.push({ id: method, name: label, requirements: milestone('gate'), review });
    const encounter = source(game, `kalos-${method}`, 'wurmple', 5, capability(method), {
      details: { kind: 'wild', method, ratePercent: 20 },
    });

    expect(validateDataset(data).ok).toBe(true);
    expect(sourceMethod(encounter.details).name).toBe(label);
    const early = getAvailability(data, { gameId: game.game.id, milestoneId: 'start', respectLevelLimit: false });
    const later = getAvailability(data, { gameId: game.game.id, milestoneId: 'gate', respectLevelLimit: false });
    expect(early.ok && early.value.entries.wurmple.status).toBe('later');
    expect(later.ok && later.value.entries.wurmple.status).toBe('available');
    if (later.ok) expect(progressContent(game, later.value, 'wurmple').method).toBe(label);

    encounter.requirements = none;
    expect(validateDataset(data).ok).toBe(false);
  });
});

describe('Kalos berry-tree sources', () => {
  function berryFixture(color: Extract<SourceDetails, { kind: 'berry-tree' }>['color']) {
    const { data, game } = fixture(['wurmple']);
    delete game.profiles[0].regionalDex;
    game.capabilities.push({ id: 'berry-tree', name: 'Berry tree access', requirements: milestone('gate'), review });
    const encounter = source(game, 'kalos-berry-tree', 'wurmple', 5, capability('berry-tree'), {
      details: { kind: 'berry-tree', color },
    });
    return { data, game, encounter };
  }

  it('requires the berry-tree action and keeps the color instruction in details and export', () => {
    const { data, game, encounter } = berryFixture('red');
    expect(validateDataset(data).ok).toBe(true);
    expect(encounter.maxUses).toBeNull();
    expect('ratePercent' in encounter.details).toBe(false);
    expect(encounterInstructions(encounter).join(' ')).toContain('red');
    const later = getAvailability(data, { gameId: game.game.id, milestoneId: 'gate', respectLevelLimit: false });
    if (!later.ok) throw new Error('Fixture query failed');
    expect(progressContent(game, later.value, 'wurmple').acquisition.join(' ')).toContain('red');

    encounter.requirements = none;
    expect(validateDataset(data).ok).toBe(false);
  });

  it('rejects an unknown berry-tree color', () => {
    const { data, encounter } = berryFixture('red');
    Object.assign(encounter.details, { color: 'orange' });
    expect(validateDataset(data).ok).toBe(false);
  });

  it('rejects berry-tree records with finite uses', () => {
    const { data, encounter } = berryFixture('blue');
    encounter.maxUses = 3;
    expect(validateDataset(data).ok).toBe(false);
  });

  it('rejects berry-tree records without the action capability', () => {
    const { data, game } = berryFixture('purple');
    game.capabilities = game.capabilities.filter(item => item.id !== 'berry-tree');
    expect(validateDataset(data).ok).toBe(false);
  });

  it('rejects an ungated alternative that bypasses the berry-tree action', () => {
    const { data, encounter } = berryFixture('green');
    encounter.requirements = { kind: 'any', requirements: [capability('berry-tree'), none] };
    expect(validateDataset(data).ok).toBe(false);
  });
});
