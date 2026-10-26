import type { GameData, PokemonFormProfile, PokemonProfile, ValidationIssue } from '../domain/types';

function sameTypes(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((type, index) => type === b[index]);
}

function eggGroups(profile: PokemonProfile | PokemonFormProfile): string {
  return JSON.stringify(profile.breeding?.eggGroupIds.slice().sort() ?? null);
}

function genders(profile: PokemonProfile | PokemonFormProfile): string {
  const allGenders = new Set(profile.genders);
  if ('forms' in profile) {
    for (const form of profile.forms ?? []) {
      for (const gender of form.genders) allGenders.add(gender);
    }
  }
  return JSON.stringify([...allGenders].sort());
}

function compare<T>(
  games: GameData[],
  label: string,
  get: (profile: PokemonProfile | PokemonFormProfile) => T,
  equal: (a: T, b: T) => boolean,
  issues: ValidationIssue[],
) {
  const baselineProfiles = new Map<string, { gameId: string; profile: PokemonProfile }>();
  const baselineForms = new Map<string, { gameId: string; form: PokemonFormProfile }>();
  const report = (id: string, gameId: string, baselineGameId: string, scope: string) => issues.push({
    recordId: id,
    fieldPath: `data/games/${gameId}/pokemon.json`,
    message: `${label} differs from ${baselineGameId} for this ${scope} in the same generation.`,
  });

  for (const game of games) {
    for (const profile of game.profiles) {
      const baseline = baselineProfiles.get(profile.pokemonId);
      if (baseline) {
        if (!equal(get(baseline.profile), get(profile))) {
          report(profile.pokemonId, game.game.id, baseline.gameId, 'species');
        }
      } else {
        baselineProfiles.set(profile.pokemonId, { gameId: game.game.id, profile });
      }
      for (const form of profile.forms ?? []) {
        const baselineForm = baselineForms.get(form.formId);
        if (baselineForm) {
          if (!equal(get(form), get(baselineForm.form))) {
            report(form.formId, game.game.id, baselineForm.gameId, 'form');
          }
        } else {
          baselineForms.set(form.formId, { gameId: game.game.id, form });
        }
      }
    }
  }
}

/** Check shared species traits only within a generation, where game rules match. */
export function validateCrossGameProfiles(games: GameData[]): ValidationIssue[] {
  const byGeneration = new Map<number, GameData[]>();
  for (const game of games) {
    const group = byGeneration.get(game.game.generation) ?? [];
    group.push(game);
    byGeneration.set(game.game.generation, group);
  }

  const issues: ValidationIssue[] = [];
  for (const sameGeneration of byGeneration.values()) {
    if (sameGeneration.length < 2) continue;
    compare(sameGeneration, 'Type order', profile => profile.types, sameTypes, issues);
    compare(sameGeneration, 'Egg Groups', eggGroups, (a, b) => a === b, issues);
    compare(sameGeneration, 'Available genders', genders, (a, b) => a === b, issues);
  }
  return issues;
}
