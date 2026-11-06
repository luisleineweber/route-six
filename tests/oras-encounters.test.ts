import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import { validateDataset } from '../src/data/validate-dataset';
import { sourceMethod } from '../src/components/acquisition-presentation';
import { encounterInstructions } from '../src/components/encounter-presentation';
import { progressContent } from '../src/features/export/progress-content';
import { capability, fixture, milestone, none, review, source } from './fixtures';

const methods = [
  ['long-grass', 'Long grass'],
  ['dive', 'Dive in seaweed'],
] as const;

function query(data: ReturnType<typeof fixture>['data'], gameId: string, milestoneId: string) {
  const result = getAvailability(data, { gameId, milestoneId, respectLevelLimit: false });
  if (!result.ok) throw new Error('Fixture query failed');
  return result.value;
}

describe('Hoenn remake encounter methods', () => {
  it.each(methods)('keeps %s distinct and gates its action', (method, label) => {
    const { data, game } = fixture(['wurmple']);
    delete game.profiles[0].regionalDex;
    game.capabilities.push({ id: method, name: label, requirements: milestone('gate'), review });
    const encounter = source(game, `oras-${method}`, 'wurmple', 5, capability(method), {
      details: { kind: 'wild', method, ratePercent: 20 },
    });

    expect(validateDataset(data).ok).toBe(true);
    expect(sourceMethod(encounter.details).name).toBe(label);
    expect(query(data, game.game.id, 'start').entries.wurmple.status).toBe('later');
    const later = query(data, game.game.id, 'gate');
    expect(later.entries.wurmple.status).toBe('available');
    expect(progressContent(game, later, 'wurmple').method).toBe(label);

    encounter.requirements = none;
    expect(validateDataset(data).ok).toBe(false);
  });
});

describe('DexNav hidden Pokémon', () => {
  function dexNavFixture() {
    const { data, game } = fixture(['wurmple']);
    delete game.profiles[0].regionalDex;
    game.capabilities.push({ id: 'dexnav', name: 'Search with the DexNav', requirements: milestone('gate'), review });
    const encounter = source(game, 'oras-dexnav', 'wurmple', 5, capability('dexnav'), {
      details: { kind: 'dexnav', habitat: 'grass' },
    });
    return { data, game, encounter };
  }

  it('needs the DexNav action, has no rate, and explains the search', () => {
    const { data, game, encounter } = dexNavFixture();
    expect(validateDataset(data).ok).toBe(true);
    expect('ratePercent' in encounter.details).toBe(false);
    expect(sourceMethod(encounter.details).name).toBe('DexNav hidden Pokémon');
    expect(encounterInstructions(encounter).join(' ')).toContain('DexNav');
    expect(query(data, game.game.id, 'start').entries.wurmple.status).toBe('later');
    const later = query(data, game.game.id, 'gate');
    expect(later.entries.wurmple.status).toBe('available');
    expect(progressContent(game, later, 'wurmple').acquisition.join(' ')).toContain('DexNav');
  });

  it('rejects a DexNav source without the action in every alternative', () => {
    const { data, encounter } = dexNavFixture();
    encounter.requirements = { kind: 'any', requirements: [capability('dexnav'), none] };
    expect(validateDataset(data).ok).toBe(false);
  });

  it('rejects finite DexNav sources and unknown habitats', () => {
    const finite = dexNavFixture();
    finite.encounter.maxUses = 1;
    expect(validateDataset(finite.data).ok).toBe(false);
    const habitat = dexNavFixture();
    Object.assign(habitat.encounter.details, { habitat: 'sky' });
    expect(validateDataset(habitat.data).ok).toBe(false);
  });
});

describe('Mirage spot daily condition', () => {
  function mirageFixture() {
    const { data, game } = fixture(['wurmple']);
    delete game.profiles[0].regionalDex;
    game.capabilities.push({ id: 'mirage-spot-daily', name: 'Soar to the daily Mirage spot', requirements: milestone('gate'), review });
    const encounter = source(game, 'oras-mirage', 'wurmple', 5, capability('mirage-spot-daily'), {
      details: { kind: 'wild', method: 'grass', ratePercent: 30 },
      encounterConditions: [{ kind: 'daily', system: 'mirage-spot' }],
    });
    return { data, game, encounter };
  }

  it('needs the Mirage spot action and states the daily condition', () => {
    const { data, game, encounter } = mirageFixture();
    expect(validateDataset(data).ok).toBe(true);
    expect(encounterInstructions(encounter).join(' ')).toContain('Mirage spot');
    expect(query(data, game.game.id, 'gate').entries.wurmple.status).toBe('available');
  });

  it('rejects the condition without its action', () => {
    const { data, encounter } = mirageFixture();
    encounter.requirements = none;
    expect(validateDataset(data).ok).toBe(false);
  });
});
