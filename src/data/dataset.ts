import { rawDataset } from './load-dataset';
import { validateDataset } from './validate-dataset';

const checked = validateDataset(rawDataset);
if (!checked.ok) throw new Error(checked.error.map(e => `${e.fieldPath} [${e.recordId ?? 'dataset'}]: ${e.message}`).join('\n'));
export const dataset = checked.value;
export const emerald = dataset.games[0];
export const pokemonById = new Map(dataset.pokemon.map(p => [p.id, p]));
