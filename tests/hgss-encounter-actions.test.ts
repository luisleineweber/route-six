import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import { validateDataset } from '../src/data/validate-dataset';
import { encounterInstructions } from '../src/components/encounter-presentation';
import { progressContent } from '../src/features/export/progress-content';
import { capability, fixture, milestone, none, review, source } from './fixtures';
import type { EncounterCondition, GameData, PokemonSource, Requirement } from '../src/domain/types';
type WildMethod = Extract<PokemonSource['details'], { kind: 'wild' }>['method'];

function encounterFixture() {
  const value = fixture(['wurmple']);
  delete value.game.profiles[0].regionalDex;
  return value;
}

function anyOf(...requirements: Requirement[]): Requirement {
  return { kind: 'any', requirements };
}

function hasCapability(requirement: Requirement, id: string): boolean {
  if (requirement.kind === 'capability') return requirement.id === id;
  return (requirement.kind === 'all' || requirement.kind === 'any')
    && requirement.requirements.some(child => hasCapability(child, id));
}

function sourceWithCondition(game: GameData, id: string, method: WildMethod, condition: EncounterCondition, requirements: Requirement) {
  let sourceRequirements = requirements;
  if (method !== 'grass' && !hasCapability(sourceRequirements, method)) {
    if (!game.capabilities.some(value => value.id === method)) addCapability(game, method);
    sourceRequirements = { kind: 'all', requirements: [capability(method), sourceRequirements] };
  }
  return source(game, id, 'wurmple', 5, sourceRequirements, {
    details: { kind: 'wild', method, ratePercent: 20 },
    encounterConditions: [condition],
  });
}

function addCapability(game: GameData, id: string) {
  game.capabilities.push({ id, name: id, requirements: milestone('future'), review });
}

function availability(data: ReturnType<typeof fixture>['data'], milestoneId: string) {
  const checked = getAvailability(data, { gameId: 'emerald', milestoneId, respectLevelLimit: false });
  if (!checked.ok) throw new Error('Fixture query failed');
  return checked.value;
}

describe('HeartGold encounter actions', () => {
  it.each([
    ['hoenn', 'Wednesday', 'Hoenn Sound'],
    ['sinnoh', 'Thursday', 'Sinnoh Sound'],
  ] as const)('gates %s radio encounters and explains the correct day', (sound, day, label) => {
    const { data, game } = encounterFixture();
    const capabilityId = `${sound}-sound`;
    addCapability(game, capabilityId);
    const encounter = sourceWithCondition(game, `${sound}-sound-wurmple`, 'grass',
      { kind: 'radio', sound }, capability(capabilityId));

    expect(validateDataset(data).ok).toBe(true);
    expect(availability(data, 'gate').entries.wurmple.status).toBe('later');
    const later = availability(data, 'future');
    expect(later.entries.wurmple.status).toBe('available');
    expect(encounterInstructions(encounter).join(' ')).toContain(label);
    expect(encounterInstructions(encounter).join(' ')).toMatch(new RegExp(day, 'i'));
    expect(progressContent(game, later, 'wurmple').acquisition.join(' ')).toContain(label);
  });

  it('rejects a radio condition without its matching sound capability', () => {
    const { data, game } = encounterFixture();
    addCapability(game, 'sinnoh-sound');
    sourceWithCondition(game, 'wrong-radio-sound', 'grass', { kind: 'radio', sound: 'hoenn' }, capability('sinnoh-sound'));
    expect(validateDataset(data).ok).toBe(false);
  });

  it('rejects radio conditions on non-grass wild methods', () => {
    const { data, game } = encounterFixture();
    addCapability(game, 'hoenn-sound');
    sourceWithCondition(game, 'surf-radio-wurmple', 'surf', { kind: 'radio', sound: 'hoenn' }, capability('hoenn-sound'));
    expect(validateDataset(data).ok).toBe(false);
  });

  it('requires the radio capability in every OR alternative', () => {
    const { data, game } = encounterFixture();
    addCapability(game, 'hoenn-sound');
    sourceWithCondition(game, 'one-radio-branch', 'grass', { kind: 'radio', sound: 'hoenn' },
      anyOf(capability('hoenn-sound'), none));
    expect(validateDataset(data).ok).toBe(false);
  });

  it.each(['common', 'rare', 'secret'] as const)('supports the %s headbutt tree class', category => {
    const { data, game } = encounterFixture();
    addCapability(game, 'headbutt');
    const encounter = sourceWithCondition(game, `headbutt-${category}-wurmple`, 'headbutt',
      { kind: 'headbutt-tree', category }, capability('headbutt'));

    expect(validateDataset(data).ok).toBe(true);
    expect(encounterInstructions(encounter).join(' ').toLowerCase()).toContain(`${category} tree`);
    const checked = availability(data, 'future');
    expect(progressContent(game, checked, 'wurmple').acquisition.join(' ').toLowerCase()).toContain(`${category} tree`);
  });

  it('rejects a headbutt-tree condition on another wild method', () => {
    const { data, game } = encounterFixture();
    addCapability(game, 'headbutt');
    sourceWithCondition(game, 'grass-headbutt-tree', 'grass',
      { kind: 'headbutt-tree', category: 'common' }, capability('headbutt'));
    expect(validateDataset(data).ok).toBe(false);
  });

  it('requires the headbutt capability in every OR alternative', () => {
    const { data, game } = encounterFixture();
    addCapability(game, 'headbutt');
    sourceWithCondition(game, 'one-headbutt-branch', 'headbutt',
      { kind: 'headbutt-tree', category: 'rare' }, anyOf(capability('headbutt'), none));
    expect(validateDataset(data).ok).toBe(false);
  });

  it.each(['grass', 'surf', 'old-rod', 'good-rod', 'super-rod'] as const)(
    'gates %s Safari encounters and shows points without claiming a 250 day minimum', method => {
      const { data, game } = encounterFixture();
      addCapability(game, 'safari-blocks');
      const encounter = sourceWithCondition(game, `safari-${method}-wurmple`, method,
        { kind: 'safari-blocks', blocks: [{ type: 'plains', points: 35 }, { type: 'forest', points: 21 }] },
        capability('safari-blocks'));

      expect(validateDataset(data).ok).toBe(true);
      expect(availability(data, 'gate').entries.wurmple.status).toBe('later');
      const later = availability(data, 'future');
      expect(later.entries.wurmple.status).toBe('available');
      const instructions = encounterInstructions(encounter).join(' ');
      expect(instructions).toMatch(/plains.{0,30}35|35.{0,30}plains/i);
      expect(instructions).toMatch(/forest.{0,30}21|21.{0,30}forest/i);
      expect(instructions).toMatch(/aging/i);
      expect(instructions).toMatch(/increase/i);
      expect(instructions).toMatch(/points?/i);
      expect(instructions).not.toMatch(/250[ -]?days?/i);
      expect(progressContent(game, later, 'wurmple').acquisition.join(' ')).toMatch(/aging/i);
    },
  );

  it('rejects Safari block points that are not whole numbers', () => {
    const { data, game } = encounterFixture();
    addCapability(game, 'safari-blocks');
    sourceWithCondition(game, 'fractional-safari-points', 'grass',
      { kind: 'safari-blocks', blocks: [{ type: 'plains', points: 10.5 }] }, capability('safari-blocks'));
    expect(validateDataset(data).ok).toBe(false);
  });

  it('rejects duplicate Safari object types', () => {
    const { data, game } = encounterFixture();
    addCapability(game, 'safari-blocks');
    sourceWithCondition(game, 'duplicate-safari-blocks', 'grass',
      { kind: 'safari-blocks', blocks: [{ type: 'plains', points: 7 }, { type: 'plains', points: 14 }] },
      capability('safari-blocks'));
    expect(validateDataset(data).ok).toBe(false);
  });

  it('rejects Safari blocks that need more than thirty game objects', () => {
    const { data, game } = encounterFixture();
    addCapability(game, 'safari-blocks');
    sourceWithCondition(game, 'too-many-safari-objects', 'grass', {
      kind: 'safari-blocks', blocks: [
        { type: 'plains', points: 52 }, { type: 'forest', points: 52 },
        { type: 'peak', points: 52 }, { type: 'water', points: 52 },
      ],
    }, capability('safari-blocks'));
    expect(validateDataset(data).ok).toBe(false);
  });

  it.each(['headbutt', 'rock-smash', 'bug-contest', 'poke-radar'] as const)(
    'rejects Safari blocks on the unsupported %s method', method => {
    const { data, game } = encounterFixture();
    addCapability(game, 'safari-blocks');
    sourceWithCondition(game, `${method}-safari-blocks`, method,
      { kind: 'safari-blocks', blocks: [{ type: 'plains', points: 7 }] }, capability('safari-blocks'));
    expect(validateDataset(data).ok).toBe(false);
    },
  );

  it('rejects an empty Safari object list', () => {
    const { data, game } = encounterFixture();
    addCapability(game, 'safari-blocks');
    sourceWithCondition(game, 'empty-safari-blocks', 'grass',
      { kind: 'safari-blocks', blocks: [] }, capability('safari-blocks'));
    expect(validateDataset(data).ok).toBe(false);
  });

  it('requires the Safari block capability in every OR alternative', () => {
    const { data, game } = encounterFixture();
    addCapability(game, 'safari-blocks');
    sourceWithCondition(game, 'one-safari-branch', 'grass',
      { kind: 'safari-blocks', blocks: [{ type: 'water', points: 14 }] },
      anyOf(capability('safari-blocks'), none));
    expect(validateDataset(data).ok).toBe(false);
  });
});
