import { rawDataset } from '../src/data/load-dataset';
import { validateDataset } from '../src/data/validate-dataset';

const result = validateDataset(rawDataset);
if (!result.ok) {
  for (const issue of result.error) console.error(`${issue.fieldPath} [${issue.recordId ?? 'dataset'}]: ${issue.message}`);
  process.exitCode = 1;
} else {
  for (const game of result.value.games) {
    console.log(`${game.game.name}: ${game.profiles.length} profiles, ${game.milestones.length} milestones, ${game.sources.length} sources, ${game.evolutions.length} evolutions, ${game.breedingRules.length} breeding rules. All data checks passed.`);
  }
}
