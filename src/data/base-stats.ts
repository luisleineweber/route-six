import kanto from '../../data/base-stats/kanto.json';
import johto from '../../data/base-stats/johto.json';
import hoenn from '../../data/base-stats/hoenn.json';
import sinnoh from '../../data/base-stats/sinnoh.json';
import unova from '../../data/base-stats/unova.json';
import kalos from '../../data/base-stats/kalos.json';
import forms from '../../data/base-stats/forms.json';
import references from '../../data/base-stats/references.json';
import type { BaseStats } from '../domain/base-stats';
import type { GameData, Result, ValidationIssue } from '../domain/types';

const gameTables: Readonly<Record<string, string>> = {
  red: 'rb', blue: 'rb', yellow: 'y', gold: 'gs', silver: 'gs', crystal: 'c',
  ruby: 'rs', sapphire: 'rs', emerald: 'e', firered: 'fr', leafgreen: 'lg',
  diamond: 'dp', pearl: 'dp', platinum: 'pt', heartgold: 'hgss', soulsilver: 'hgss',
  black: 'bw', white: 'bw', 'black-2': 'b2w2', 'white-2': 'b2w2',
  x: 'xy', y: 'xy', 'omega-ruby': 'ao', 'alpha-sapphire': 'ao',
};
interface StatRecord {
  id: string;
  stats: { tables: string[]; values: BaseStats }[];
  review: { referenceIds: string[]; checkedOn: string };
}

/** Validate maintained facts. Invalid data must not produce an invented chart. */
export function validateBaseStats(input: unknown): Result<Map<string, StatRecord>, ValidationIssue[]> {
  const errors: ValidationIssue[] = [];
  const records = new Map<string, StatRecord>();
  const tables = new Set(Object.values(gameTables));
  const refs = new Set(references.map(reference => reference.id));
  if (!Array.isArray(input)) return { ok: false, error: [{ fieldPath: 'base-stats', recordId: null, message: 'Expected a list of stat records.' }] };
  for (const raw of input) {
    const row = raw as Partial<StatRecord> | null;
    const id = typeof row?.id === 'string' ? row.id : null;
    const issue = (field: string, message: string) => errors.push({ fieldPath: `base-stats.${field}`, recordId: id, message });
    if (!id || records.has(id)) { issue('id', 'Expected a unique selection ID.'); continue; }
    if (!Array.isArray(row?.stats) || row.stats.length === 0) { issue('stats', 'Expected reviewed base stats.'); continue; }
    const seen = new Set<string>();
    for (const entry of row.stats) {
      if (!Array.isArray(entry?.tables) || !entry.tables.length) { issue('tables', 'Expected native stat tables.'); continue; }
      for (const table of entry.tables) {
        if (!tables.has(table) || seen.has(table)) issue('tables', `Unknown or repeated table: ${table}`);
        seen.add(table);
        const count = table === 'rb' || table === 'y' ? 5 : 6;
        if (!Array.isArray(entry.values) || entry.values.length !== count
          || entry.values.some(value => !Number.isInteger(value) || value < 1 || value > 255)) {
          issue('values', `Expected ${count} base stats from 1 to 255 for ${table}.`);
        }
      }
    }
    if (!Array.isArray(row.review?.referenceIds) || !row.review.referenceIds.length
      || row.review.referenceIds.some(reference => !refs.has(reference))
      || !/^\d{4}-\d{2}-\d{2}$/.test(row.review?.checkedOn ?? '')) issue('review', 'Expected a known reference and review date.');
    records.set(id, row as StatRecord);
  }
  return errors.length ? { ok: false, error: errors } : { ok: true, value: records };
}

export const rawBaseStats = [...kanto, ...johto, ...hoenn, ...sinnoh, ...unova, ...kalos, ...forms];
const checked = validateBaseStats(rawBaseStats);
if (!checked.ok) throw new Error(checked.error.map(issue => `${issue.fieldPath} [${issue.recordId}]: ${issue.message}`).join('\n'));
const records = checked.value;

export function pokemonBaseStats(gameId: string, selectionId: string): BaseStats {
  const table = gameTables[gameId];
  const values = records.get(selectionId)?.stats.find(entry => entry.tables.includes(table))?.values;
  if (!values) throw new Error(`Missing reviewed base stats for ${selectionId} in ${gameId}.`);
  return values;
}

export function checkBaseStatCoverage(games: GameData[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const game of games) {
    const table = gameTables[game.game.id];
    for (const profile of game.profiles) {
      for (const id of [profile.pokemonId, ...(profile.forms ?? []).map(form => form.formId)]) {
        if (!records.get(id)?.stats.some(entry => entry.tables.includes(table))) {
          issues.push({ fieldPath: 'base-stats', recordId: id, message: `Missing stats for ${game.game.id}.` });
        }
      }
    }
  }
  return issues;
}
