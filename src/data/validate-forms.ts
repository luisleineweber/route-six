import type { Dataset, GameData, ValidationIssue } from '../domain/types';

export function validateForms(data: Dataset, game?: GameData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const issue = (id: string, fieldPath: string, message: string) => issues.push({ recordId: id, fieldPath, message });
  const species = new Map(data.pokemon.map(pokemon => [pokemon.id, pokemon]));
  const references = new Set(data.references.map(reference => reference.id));
  const forms = new Map(data.forms?.map(form => [form.id, form]));
  if (!game) {
    const seen = new Set<string>();
    for (const form of data.forms ?? []) {
      const parent = species.get(form.pokemonId);
      if (seen.has(form.id) || species.has(form.id)) issue(form.id, 'data/forms.json', 'Form IDs must be unique and distinct from species IDs.');
      seen.add(form.id);
      if (!parent || form.introducedGeneration < parent.introducedGeneration) issue(form.id, 'data/forms.json', 'Form needs an existing species from this generation or earlier.');
      for (const ref of form.review.referenceIds) if (!references.has(ref)) issue(form.id, 'data/forms.json', `Unknown review reference: ${ref}`);
    }
    return issues;
  }
  const path = `data/games/${game.game.id}/pokemon.json`;
  const seen = new Set<string>();
  for (const profile of game.profiles) for (const form of profile.forms ?? []) {
    const shared = forms.get(form.formId);
    if (seen.has(form.formId)) issue(form.formId, path, 'Duplicate game form.');
    seen.add(form.formId);
    if (!shared || shared.pokemonId !== profile.pokemonId || shared.introducedGeneration > game.game.generation) {
      issue(form.formId, path, 'Form must match its species and exist in this game generation.');
    }
    for (const type of form.types) if (!game.typeChart.typeIds.includes(type)) issue(form.formId, path, `Unknown game type: ${type}`);
    if ((form.breeding !== null) !== (game.game.breeding !== null)) issue(form.formId, path, 'Breeding profile must match the game breeding setting.');
    if (form.genders.includes('not-applicable') && (game.game.breeding !== null || form.genders.length !== 1)) issue(form.formId, path, 'An absent gender must stand alone in a game without breeding.');
    for (const ref of form.review.referenceIds) if (!references.has(ref)) issue(form.formId, path, `Unknown review reference: ${ref}`);
  }
  return issues;
}
