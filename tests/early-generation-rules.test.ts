import { describe, expect, it } from 'vitest';
import { validateDataset } from '../src/data/validate-dataset';
import { getAvailability } from '../src/domain/availability';
import { sourceMethod } from '../src/components/acquisition-presentation';
import { capability, evolution, fixture, milestone, review, source } from './fixtures';

describe('Early generation game rules', () => {
  it('accepts a Gym Leader with no type specialty', () => {
    const { game, data } = fixture(['bulbasaur']);
    const gym = game.bosses.find(boss => boss.kind === 'gym')!;
    gym.specialtyTypeId = null;
    source(game, 'gift', 'bulbasaur');
    expect(validateDataset(data).ok).toBe(true);
  });

  it('accepts a final trainer battle without calling it a championship', () => {
    const { game, data } = fixture(['bulbasaur']);
    game.bosses.push({ id: 'red', name: 'Red', kind: 'trainer', highestLevel: 81, review });
    game.milestones.find(point => point.id === 'future')!.nextBossId = 'red';
    source(game, 'gift', 'bulbasaur');
    expect(validateDataset(data).ok).toBe(true);
    const result = getAvailability(data, { gameId: game.game.id, milestoneId: 'future', respectLevelLimit: true });
    expect(result.ok && result.value.levelLimit).toEqual({ bossId: 'red', level: 81 });
  });

  it('preserves absent genders through acquisition and evolution without breeding', () => {
    const { game, data } = fixture(['bulbasaur', 'ivysaur']);
    game.game.generation = 1;
    game.game.breeding = null;
    for (const profile of game.profiles) {
      delete profile.regionalDex;
      profile.genders = ['not-applicable'];
      profile.breeding = null;
    }
    source(game, 'starter', 'bulbasaur');
    evolution(game, 'bulbasaur', 'ivysaur', 16);
    expect(validateDataset(data).ok).toBe(true);
    const result = getAvailability(data, { gameId: game.game.id, milestoneId: 'end', respectLevelLimit: false });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.entries.ivysaur.status).toBe('available');
      expect(Object.values(result.value.paths).filter(path => path.pokemonId === 'ivysaur'))
        .toEqual(expect.arrayContaining([expect.objectContaining({ genders: ['not-applicable'] })]));
    }
  });

  it('rejects an absent gender in a game with breeding', () => {
    const { game, data } = fixture(['bulbasaur']);
    game.profiles[0].genders = ['not-applicable'];
    source(game, 'gift', 'bulbasaur');
    const result = validateDataset(data);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.some(issue => issue.message.includes('absent gender'))).toBe(true);
  });

  it.each([['headbutt', 'Headbutt'], ['bug-contest', 'Bug-Catching Contest']] as const)
    ('requires the %s action before an encounter can be used', (method, label) => {
      const { game, data } = fixture(['caterpie']);
      game.capabilities.push({ id: method, name: label, requirements: milestone('gate'), review });
      const details = { kind: 'wild' as const, method, ratePercent: 30 };
      const encounter = source(game, method, 'caterpie', 5, capability(method), { details });
      expect(sourceMethod(details).name).toBe(label);
      expect(validateDataset(data).ok).toBe(true);
      const query = (milestoneId: string) => getAvailability(data, { gameId: game.game.id, milestoneId, respectLevelLimit: false });
      const early = query('start');
      const later = query('gate');
      expect(early.ok && early.value.entries.caterpie.status).toBe('later');
      expect(later.ok && later.value.entries.caterpie.status).toBe('available');
      encounter.requirements = { kind: 'all', requirements: [] };
      expect(validateDataset(data).ok).toBe(false);
    });
});
