import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import { validateDataset } from '../src/data/validate-dataset';
import { sourceMethod } from '../src/components/acquisition-presentation';
import { encounterInstructions } from '../src/components/encounter-presentation';
import { progressContent } from '../src/features/export/progress-content';
import { capability, fixture, milestone, none, review, source } from './fixtures';

const methods = [
  ['dark-grass', 'Dark grass'], ['grass-spots', 'Shaking grass'],
  ['cave-spots', 'Dust cloud'], ['bridge-spots', 'Bridge shadow'],
  ['surf-spots', 'Surf in rippling water'], ['super-rod-spots', 'Super Rod in rippling water'],
] as const;

describe('Unova encounter methods and seasons', () => {
  it.each(methods)('keeps the %s method and its access action', (method, label) => {
    const { data, game } = fixture(['wurmple']);
    delete game.profiles[0].regionalDex;
    game.capabilities.push({ id: method, name: label, requirements: milestone('gate'), review });
    const waterMethod = method === 'surf-spots' ? 'surf' : method === 'super-rod-spots' ? 'super-rod' : null;
    if (waterMethod) game.capabilities.push({ id: waterMethod, name: waterMethod, requirements: none, review });
    const encounter = source(game, method, 'wurmple', 5, { kind: 'all', requirements: [
      capability(method), ...(waterMethod ? [capability(waterMethod)] : []),
    ] }, { details: { kind: 'wild', method, ratePercent: 20 } });
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

  it.each(['surf-spots', 'super-rod-spots'] as const)('requires water access for %s', method => {
    const { data, game } = fixture(['wurmple']);
    delete game.profiles[0].regionalDex;
    game.capabilities.push({ id: method, name: method, requirements: none, review });
    source(game, method, 'wurmple', 5, capability(method), { details: { kind: 'wild', method, ratePercent: 20 } });
    const checked = validateDataset(data);
    expect(checked.ok).toBe(false);
    if (!checked.ok) expect(checked.error.some(issue => issue.message.includes('water access'))).toBe(true);
  });

  it('keeps seasonal instructions in details and export without using the host clock', () => {
    const { data, game } = fixture(['wurmple']);
    delete game.profiles[0].regionalDex;
    const encounter = source(game, 'seasonal', 'wurmple', 5, none, {
      details: { kind: 'wild', method: 'grass', ratePercent: 20 },
      encounterConditions: [{ kind: 'season', seasons: ['spring', 'winter'] }],
    });
    expect(validateDataset(data).ok).toBe(true);
    const checked = getAvailability(data, { gameId: game.game.id, milestoneId: 'start', respectLevelLimit: false });
    if (!checked.ok) throw new Error('Fixture query failed');
    expect(checked.value.entries.wurmple.status).toBe('available');
    expect(encounterInstructions(encounter)).toContain('Visit during spring or winter.');
    expect(progressContent(game, checked.value, 'wurmple').acquisition).toContain('Visit during spring or winter.');
    encounter.encounterConditions = [{ kind: 'season', seasons: [] }];
    expect(validateDataset(data).ok).toBe(false);
  });
});
