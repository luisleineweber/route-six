import { describe, expect, it } from 'vitest';
import { validateDataset } from '../src/data/validate-dataset';
import { breed, fixture, source } from './fixtures';

describe('Reviewed breeding data', () => {
  it('rejects a rule that produces Ditto as an offspring', () => {
    const { game, data } = fixture(['ditto', 'pikachu']);
    for (const profile of game.profiles) delete profile.regionalDex;
    source(game, 'wild-ditto', 'ditto');
    source(game, 'wild-pikachu', 'pikachu');
    breed(game, 'ditto-offspring', ['ditto'], 'ditto');
    const result = validateDataset(data);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.some(issue =>
      issue.recordId === 'ditto-offspring' && issue.message.includes('offspring'))).toBe(true);
  });

  it('accepts ordinary offspring data when Ditto is supported as a partner', () => {
    const { game, data } = fixture(['ditto', 'pikachu', 'pichu']);
    for (const profile of game.profiles) delete profile.regionalDex;
    source(game, 'wild-ditto', 'ditto');
    source(game, 'wild-pikachu', 'pikachu');
    breed(game, 'pichu-offspring', ['pikachu'], 'pichu');
    const result = validateDataset(data);
    expect(result.ok, result.ok ? '' : JSON.stringify(result.error)).toBe(true);
  });
});
