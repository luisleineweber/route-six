import { rawSharedData } from './shared-data';
import { validateSharedData } from './validate-dataset';
import { selectionIdentity } from '../domain/pokemon-selection';

const checked = validateSharedData(rawSharedData);
if (!checked.ok) throw new Error(checked.error.map(e => `${e.fieldPath} [${e.recordId ?? 'dataset'}]: ${e.message}`).join('\n'));
export const sharedData = checked.value;
export const pokemonById = new Map(sharedData.pokemon.map(p => [p.id, p]));
export const pokemonIdentity = (id: string) => selectionIdentity(sharedData, id);
export const pokemonNames = new Map([...sharedData.pokemon.map(pokemon => [pokemon.id, pokemon.name] as const),
  ...(sharedData.forms ?? []).map(form => [form.id, pokemonIdentity(form.id).name] as const)]);
