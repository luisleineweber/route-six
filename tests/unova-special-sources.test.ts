import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import { validateDataset } from '../src/data/validate-dataset';
import { encounterInstructions } from '../src/components/encounter-presentation';
import { sourceMethod } from '../src/components/acquisition-presentation';
import { capability, fixture, milestone, none, review, source } from './fixtures';

describe('Unova special sources', () => {
  it('keeps a regenerating grotto behind its action and states its content rate', () => {
    const { data, game } = fixture(['wurmple']);
    delete game.profiles[0].regionalDex;
    game.capabilities.push({ id: 'hidden-grotto', name: 'Visit a Hidden Grotto', requirements: milestone('gate'), review });
    const encounter = source(game, 'grotto', 'wurmple', 5, capability('hidden-grotto'), {
      details: { kind: 'hidden-grotto', mode: 'regeneration', ratePercent: 1 },
    });
    expect(validateDataset(data).ok).toBe(true);
    const early = getAvailability(data, { gameId: 'emerald', milestoneId: 'start', respectLevelLimit: false });
    const late = getAvailability(data, { gameId: 'emerald', milestoneId: 'gate', respectLevelLimit: false });
    expect(early.ok && early.value.entries.wurmple.status).toBe('later');
    expect(late.ok && late.value.entries.wurmple.status).toBe('available');
    expect(sourceMethod(encounter.details).name).toBe('Hidden Grotto');
    expect(encounterInstructions(encounter).join(' ')).toContain('1% share of normal content rolls');
    encounter.requirements = { kind: 'any', requirements: [capability('hidden-grotto'), none] };
    expect(validateDataset(data).ok).toBe(false);
  });

  it('keeps the one-time tutorial separate from regenerating contents', () => {
    const { data, game } = fixture(['wurmple']);
    delete game.profiles[0].regionalDex;
    game.capabilities.push({ id: 'hidden-grotto', name: 'Visit a Hidden Grotto', requirements: none, review });
    const encounter = source(game, 'tutorial', 'wurmple', 5, capability('hidden-grotto'), {
      details: { kind: 'hidden-grotto', mode: 'first-visit' }, maxUses: 1,
    });
    expect(validateDataset(data).ok).toBe(true);
    encounter.maxUses = null;
    expect(validateDataset(data).ok).toBe(false);
  });

  it('requires the native resident choice and Surf for a White Forest water source', () => {
    const { data, game } = fixture(['wurmple']);
    delete game.profiles[0].regionalDex;
    game.capabilities.push({ id: 'white-forest', name: 'Visit White Forest', requirements: milestone('future'), review },
      { id: 'surf', name: 'Use Surf', requirements: milestone('gate'), review });
    game.choices = [{ id: 'residents', name: 'Initial residents', options: ['resident-one', 'resident-two'], maximumSelections: 2, review }];
    const encounter = source(game, 'forest', 'wurmple', 5, { kind: 'all', requirements: [capability('white-forest'), capability('surf')] }, {
      details: { kind: 'white-forest', method: 'surf', residentId: 'resident-one', residentName: 'Resident One' },
      choice: { groupId: 'residents', optionId: 'resident-one' },
    });
    expect(validateDataset(data).ok).toBe(true);
    expect(encounterInstructions(encounter).join(' ')).toContain('initial residents');
    expect(encounterInstructions(encounter).join(' ')).toContain('water tiles');
    encounter.requirements = capability('white-forest');
    expect(validateDataset(data).ok).toBe(false);
    encounter.requirements = { kind: 'all', requirements: [capability('white-forest'), capability('surf')] };
    encounter.choice = { groupId: 'residents', optionId: 'resident-two' };
    expect(validateDataset(data).ok).toBe(false);
  });
});
