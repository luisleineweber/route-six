import { loadRawDataset } from '../src/data/load-dataset';
import { validateDataset } from '../src/data/validate-dataset';
import { checkGameAssets } from './check-assets';
import { checkBaseStatCoverage } from '../src/data/base-stats';

const result = validateDataset(await loadRawDataset());
if (!result.ok) {
  for (const issue of result.error) console.error(`${issue.fieldPath} [${issue.recordId ?? 'dataset'}]: ${issue.message}`);
  process.exitCode = 1;
} else {
  const issues = [...await checkGameAssets(result.value), ...checkBaseStatCoverage(result.value.games)];
  if (issues.length) {
    for (const issue of issues) console.error(`${issue.fieldPath} [${issue.recordId}]: ${issue.message}`);
    process.exitCode = 1;
  } else {
    for (const game of result.value.games) {
      console.log(`${game.game.name}: ${game.profiles.length} profiles, ${game.milestones.length} milestones, ${game.sources.length} sources, ${game.evolutions.length} evolutions, ${game.breedingRules.length} breeding rules. Data and local image checks passed.`);
    }
  }
}
