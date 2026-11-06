import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Dataset, ValidationIssue } from '../src/domain/types';
import { defaultGameId } from '../src/data/game-registry';
import { gameCatalogue } from '../src/data/game-catalogue';
import { pokemonSelections, selectionId } from '../src/domain/pokemon-selection';

/** Check the local resources needed to display every registered game. */
export async function checkGameAssets(data: Dataset): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  if (!data.games.some(game => game.game.id === defaultGameId)) {
    issues.push({ recordId: defaultGameId, fieldPath: 'src/data/game-registry.ts', message: 'Default game has no registered dataset.' });
  }
  const assets: { path: string; recordId: string; fieldPath: string }[] = [];
  for (const game of data.games) {
    const base = `data/games/${game.game.id}/`;
    const option = gameCatalogue.find(option => option.id === game.game.id);
    if (!option) issues.push({ recordId: game.game.id, fieldPath: 'src/data/game-catalogue.ts', message: 'Registered game has no catalogue entry.' });
    else {
      if (option.generation !== game.game.generation) issues.push({ recordId: game.game.id, fieldPath: base+'game.json/generation', message: 'Game generation does not match its catalogue entry.' });
      assets.push({ path: option.logoSrc, recordId: game.game.id, fieldPath: 'src/data/game-catalogue.ts/logoSrc' });
    }
    for (const profile of pokemonSelections(game)) assets.push({ path: profile.spriteSrc, recordId: selectionId(profile.pokemonId, profile.formId), fieldPath: base+'pokemon.json/spriteSrc' });
    for (const type of game.typeChart.typeIds) assets.push({ path: `/types/${type}.svg`, recordId: type, fieldPath: base+'type-chart.json/typeIds' });
  }
  const checks = await Promise.all(assets.map(async asset => {
    try { await access(resolve('public', '.'+asset.path)); return null; }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      return { recordId: asset.recordId, fieldPath: asset.fieldPath, message: `Missing local image: ${asset.path}` };
    }
  }));
  return [...issues, ...checks.filter(issue => issue !== null)];
}
