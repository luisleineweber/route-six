import type { GameData, PokemonSource, Requirement, ValidationIssue } from '../domain/types';

function requiresAction(requirement: Requirement, id: string): boolean {
  if (requirement.kind === 'all') return requirement.requirements.some(child => requiresAction(child, id));
  if (requirement.kind === 'any') return requirement.requirements.every(child => requiresAction(child, id));
  return requirement.kind === 'capability' && requirement.id === id;
}

export function validateUnovaSource(game: GameData, source: PokemonSource, base: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const issue = (message: string) => issues.push({ recordId: source.id, fieldPath: base + 'sources.json', message });
  if (['black-2', 'white-2'].includes(game.game.id) && source.details.kind === 'game-trade'
    && source.details.offeredPokemonId === null) {
    const { traderName, cyclePosition } = source.details;
    const sex = traderName === 'Yancy' ? 'male' : traderName === 'Curtis' ? 'female' : null;
    if (!sex || !cyclePosition || source.choice?.groupId !== 'player-character' || source.choice.optionId !== sex
      || source.maxUses !== null || !requiresAction(source.requirements, 'phone-trades')) {
      issue('Phone trades need their daily cycle position, character branch, and phone quest action.');
    }
  }
  if (source.encounterConditions?.some(condition => condition.kind === 'funfest')) {
    if (source.details.kind !== 'static' || !['foongus', 'amoonguss'].includes(source.pokemonId)
      || source.maxUses !== null || !requiresAction(source.requirements, 'mushroom-funfest')) {
      issue('The native mushroom mission needs a repeatable fake-item encounter and its Funfest action.');
    }
  }
  if (source.details.kind === 'hidden-grotto') {
    if (!requiresAction(source.requirements, 'hidden-grotto')) issue('Hidden Grotto access must be required in every alternative.');
    const expectedUses = source.details.mode === 'first-visit' ? 1 : null;
    if (source.maxUses !== expectedUses) issue('Grotto regeneration is repeatable; a first-visit source has one use.');
    if (source.details.mode === 'funfest') {
      if (!requiresAction(source.requirements, 'grotto-funfest')) issue('Mission encounters require the native Funfest action.');
      const expected = source.details.mission === 'noisy' ? 'stunky' : 'glameow';
      if (source.pokemonId !== expected) issue('The native grotto mission does not give this species.');
      if ((game.game.id === 'black-2' && source.details.mission !== 'noisy')
        || (game.game.id === 'white-2' && source.details.mission !== 'quiet')) issue('The mission requires the other version.');
    }
  }
  if (source.details.kind === 'white-forest') {
    if (!requiresAction(source.requirements, 'white-forest')) issue('White Forest access must be required in every alternative.');
    if (source.details.method === 'surf' && !requiresAction(source.requirements, 'surf')) issue('White Forest water encounters require Surf.');
    if (source.maxUses !== null) issue('White Forest encounters must be repeatable.');
    const group = game.choices.find(group => group.id === source.choice?.groupId);
    if (!group || group.maximumSelections > 10 || source.choice?.optionId !== source.details.residentId) {
      issue('White Forest encounters need their native resident choice, with at most ten initial residents.');
    }
  }
  return issues;
}
