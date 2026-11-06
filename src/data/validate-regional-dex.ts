import type { GameData, ValidationIssue } from '../domain/types';

export function validateRegionalDex(game: GameData, base: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const issue = (recordId: string, field: string, message: string) => issues.push({ recordId, fieldPath: base + field, message });
  const sections = game.game.regionalDexSections ?? [];
  const sectionIds = new Set<string>();
  for (const section of sections) {
    if (sectionIds.has(section.id)) issue(section.id, 'game.json/regionalDexSections', 'Duplicate regional Pokédex section.');
    sectionIds.add(section.id);
  }
  const numbersBySection = new Map<string, number[]>();
  for (const profile of game.profiles) {
    const sectionId = profile.regionalDexSectionId;
    if (sectionId !== undefined && (profile.regionalDex === undefined || !sectionIds.has(sectionId))) {
      issue(profile.pokemonId, 'pokemon.json/regionalDexSectionId', 'Regional section needs a regional number and a declared section.');
    }
    if (profile.regionalDex === undefined) continue;
    if (!Number.isInteger(profile.regionalDex) || profile.regionalDex < 0) {
      issue(profile.pokemonId, 'pokemon.json/regionalDex', 'Regional Pokédex numbers must be non-negative integers.');
    }
    if (sections.length && sectionId === undefined) {
      issue(profile.pokemonId, 'pokemon.json/regionalDexSectionId', 'Regional number needs a declared section.');
    }
    const key = sectionId ?? '';
    const numbers = numbersBySection.get(key) ?? [];
    numbers.push(profile.regionalDex);
    numbersBySection.set(key, numbers);
  }
  for (const [sectionId, numbers] of numbersBySection) {
    const start = numbers.includes(0) ? 0 : 1;
    if (new Set(numbers).size !== numbers.length) {
      issue(sectionId || game.game.id, 'pokemon.json/regionalDex', 'Duplicate regional Pokédex number within a section.');
    }
    if (Math.min(...numbers) !== start || Math.max(...numbers) !== numbers.length - 1 + start) {
      issue(sectionId || game.game.id, 'pokemon.json/regionalDex', 'Regional Pokédex numbers must be contiguous from 0 or 1 in each section.');
    }
  }
  return issues;
}
