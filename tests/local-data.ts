import { loadRawDataset } from '../src/data/load-dataset';
import { validateDataset } from '../src/data/validate-dataset';
import { createInitialState } from '../src/features/planner/state';

export const rawDataset = await loadRawDataset();
const checked = validateDataset(rawDataset);
if (!checked.ok) throw new Error(JSON.stringify(checked.error));
export const dataset = checked.value;
export const emerald = dataset.games.find(game => game.game.id === 'emerald')!;
export const initialState = createInitialState(emerald);
