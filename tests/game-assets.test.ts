import { describe, expect, it } from 'vitest';
import { checkGameAssets } from '../scripts/check-assets';
import { dataset } from './local-data';

describe('Registered game assets', () => {
  it('rejects a registered game without matching catalogue data', async () => {
    const data = structuredClone({ ...dataset, games: [dataset.games[0]] });
    data.games[0].game.generation = 4;
    expect((await checkGameAssets(data)).some(issue => issue.message.includes('generation'))).toBe(true);
    data.games[0].game.id = 'unlisted';
    const issues = await checkGameAssets(data);
    expect(issues.some(issue => issue.message.includes('catalogue entry'))).toBe(true);
    expect(issues.some(issue => issue.message.includes('Default game'))).toBe(true);
  });

  it('finds missing sprites and type icons before a game can be built', async () => {
    const data = structuredClone({ ...dataset, games: [dataset.games[0]] });
    data.games[0].profiles[0].spriteSrc = '/pokemon/missing-image.png';
    data.games[0].typeChart.typeIds.push('missing-type');
    const issues = await checkGameAssets(data);
    expect(issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ recordId: 'bulbasaur', fieldPath: 'data/games/emerald/pokemon.json/spriteSrc', message: 'Missing local image: /pokemon/missing-image.png' }),
      expect.objectContaining({ recordId: 'missing-type', message: 'Missing local image: /types/missing-type.svg' }),
    ]));
  });
});
