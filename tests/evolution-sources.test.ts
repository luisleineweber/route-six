import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import { validateDataset } from '../src/data/validate-dataset';
import { evolution, fixture, milestone, none, review, source } from './fixtures';

function restrictedEvolution() {
  const { game, data } = fixture(['pikachu', 'raichu']);
  for (const profile of game.profiles) delete profile.regionalDex;
  source(game, 'starter-pikachu', 'pikachu', 5, none, { maxUses: 1, details: { kind: 'starter' } });
  source(game, 'other-pikachu', 'pikachu', 5, milestone('gate'));
  game.items.push({ id: 'thunder-stone', name: 'Thunder Stone', review,
    sources: [{ id: 'stone-shop', locationId: 'field', requirements: none, maxUses: null, choice: null, review }] });
  const rule = evolution(game, 'pikachu', 'raichu', null, {
    trigger: 'use-item', itemId: 'thunder-stone', excludedSourceIds: ['starter-pikachu'],
    requirements: { kind: 'item', id: 'thunder-stone', quantity: 1, consumed: true },
  });
  return { game, data, rule };
}

describe('Evolution source restrictions', () => {
  it('keeps the restricted starter out of evolution proofs while permitting another acquisition', () => {
    const { game, data } = restrictedEvolution();
    expect(validateDataset(data).ok).toBe(true);
    const query = (milestoneId: string) => getAvailability(data, { gameId: game.game.id, milestoneId, respectLevelLimit: false });
    const early = query('start');
    const later = query('gate');
    expect(early.ok && early.value.entries.raichu.status).toBe('later');
    expect(later.ok && later.value.entries.raichu.status).toBe('available');
    if (later.ok) for (const id of later.value.entries.raichu.currentPathIds) {
      expect(later.value.paths[id].sourceIds).toContain('other-pikachu');
      expect(later.value.paths[id].sourceIds).not.toContain('starter-pikachu');
    }
  });

  it('shows why the only native parent cannot evolve', () => {
    const { game, data } = restrictedEvolution();
    game.sources = game.sources.filter(row => row.id !== 'other-pikachu');
    const result = getAvailability(data, { gameId: game.game.id, milestoneId: 'end', respectLevelLimit: false });
    expect(result.ok && result.value.entries.raichu.status).toBe('blocked');
    if (result.ok) expect(result.value.entries.raichu.blockers).toContainEqual({
      code: 'condition', relatedId: 'pikachu-to-raichu', message: 'This evolution cannot use the available acquisition sources.',
    });
  });

  it('does not block another individual that needs the restricted source as a prerequisite', () => {
    const { game, data } = restrictedEvolution();
    game.sources.find(row => row.id === 'other-pikachu')!.requirements = { kind: 'all', requirements: [
      milestone('gate'), { kind: 'pokemon', id: 'pikachu', quantity: 1, consumed: false },
    ] };
    const result = getAvailability(data, { gameId: game.game.id, milestoneId: 'gate', respectLevelLimit: false });
    expect(result.ok && result.value.entries.raichu.status).toBe('available');
    if (result.ok) expect(result.value.entries.raichu.currentPathIds.some(id => {
      const path = result.value.paths[id];
      return path.sourceIds.includes('starter-pikachu') && path.sourceIds.includes('other-pikachu');
    })).toBe(true);
  });

  it('rejects an unknown or unrelated source in an evolution restriction', () => {
    const { game, data, rule } = restrictedEvolution();
    for (const id of ['missing-source', 'raichu-gift']) {
      if (id === 'raichu-gift') source(game, id, 'raichu');
      rule.excludedSourceIds = [id];
      const result = validateDataset(data);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.some(issue => issue.message.includes('Evolution source restriction'))).toBe(true);
    }
  });
});
