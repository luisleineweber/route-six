import type { Dataset, Result, SharedData, ValidationIssue } from '../domain/types';
import { validateSemantics } from './validate-semantics';
import { checkShape, checkSharedShape } from './compiled-shapes.mjs';

function recordId(input: unknown, path: string): string | null {
  let node = input;
  let id: string | null = null;
  for (const part of path.split('/').filter(Boolean)) {
    if (typeof node !== 'object' || node === null) break;
    node = (node as Record<string, unknown>)[part];
    if (typeof node === 'object' && node !== null) {
      const record = node as Record<string, unknown>;
      if (typeof record.id === 'string') id = record.id;
      else if (typeof record.pokemonId === 'string') id = record.pokemonId;
    }
  }
  return id;
}

function sourcePath(input: unknown, path: string): string {
  const parts = path.split('/').filter(Boolean);
  if (parts[0] !== 'games') return `data/${parts.shift() ?? 'dataset'}.json/${parts.join('/')}`;
  const games = (input as { games?: { game?: { id?: string } }[] })?.games;
  const id = games?.[Number(parts[1])]?.game?.id ?? 'unknown-game';
  const files: Record<string, string> = { profiles: 'pokemon', milestones: 'progression', breedingRules: 'breeding-rules', typeChart: 'type-chart', formChanges: 'form-changes' };
  const collection = parts[2];
  return `data/games/${id}/${files[collection] ?? collection ?? 'game'}.json/${parts.slice(3).join('/')}`;
}

export function validateDataset(input: unknown): Result<Dataset, ValidationIssue[]> {
  if (!checkShape(input)) {
    return { ok: false, error: (checkShape.errors ?? []).map(error => ({
      recordId: recordId(input, error.instancePath),
      fieldPath: sourcePath(input, error.instancePath),
      message: `${error.message} (${JSON.stringify(error.params)})`,
    })) };
  }
  const issues = validateSemantics(input);
  return issues.length ? { ok: false, error: issues } : { ok: true, value: input };
}

export function validateSharedData(input: unknown): Result<SharedData, ValidationIssue[]> {
  if (!checkSharedShape(input)) return { ok: false, error: (checkSharedShape.errors ?? []).map(error => ({
    recordId: recordId(input, error.instancePath), fieldPath: sourcePath(input, error.instancePath),
    message: `${error.message} (${JSON.stringify(error.params)})`,
  })) };
  const issues = validateSemantics({ ...input, games: [] });
  return issues.length ? { ok: false, error: issues } : { ok: true, value: input };
}
