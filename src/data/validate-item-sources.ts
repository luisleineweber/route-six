import type { GameData, ItemSource, Requirement, ValidationIssue } from '../domain/types';

function consumesEntryResource(game: GameData, requirement: Requirement, seen = new Set<string>()): boolean {
  if ('requirements' in requirement) return requirement.requirements.some(child => consumesEntryResource(game, child, seen));
  if (requirement.kind === 'item' || requirement.kind === 'pokemon') return requirement.consumed;
  if (requirement.kind === 'milestone') return false;
  const key = `${requirement.kind}:${requirement.id}`;
  if (seen.has(key)) return false;
  const row = requirement.kind === 'location' ? game.locations.find(value => value.id === requirement.id)
    : game.capabilities.find(value => value.id === requirement.id);
  return !!row && consumesEntryResource(game, row.requirements, new Set([...seen, key]));
}

export function validateItemSources(game: GameData, base: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  function issue(source: ItemSource, message: string) {
    issues.push({ recordId: source.id, fieldPath: base + 'items.json', message });
  }
  for (const item of game.items) for (const source of item.sources) {
    const details = source.details;
    if (!details) continue;
    const capture = game.sources.find(value => value.id === details.pokemonSourceId);
    if (details.kind === 'received-held-item') {
      if (!capture || !['starter', 'gift', 'static', 'roaming', 'game-trade', 'fossil'].includes(capture.details.kind)) {
        issue(source, 'Received item holder must refer to a reviewed native gift, capture, or NPC trade.');
        continue;
      }
      if (capture.maxUses !== 1 || source.maxUses !== 1) issue(source, 'Received held items require one holder and one item per playthrough.');
      if (source.locationId !== capture.locationId) issue(source, 'Item holder and item source must use the same location.');
      continue;
    }
    if (!capture || capture.details.kind !== 'wild') {
      issue(source, 'Item holder must refer to a reviewed wild encounter source.');
      continue;
    }
    if (source.locationId !== capture.locationId) issue(source, 'Item holder and item source must use the same encounter location.');
    if (details.kind === 'pickup') {
      if (details.minimumLevel > details.maximumLevel) issue(source, 'Pickup level range is reversed.');
      if (source.maxUses !== null) issue(source, 'Pickup is a repeatable item action.');
    } else {
      if (source.maxUses !== capture.maxUses) issue(source, 'Wild held-item quantity must match the capture source limit.');
      const location = game.locations.find(value => value.id === capture.locationId);
      if (consumesEntryResource(game, capture.requirements) || (location && consumesEntryResource(game, location.requirements))) {
        issue(source, 'Wild held-item captures cannot have a consumed entry resource.');
      }
    }
  }
  return issues;
}
