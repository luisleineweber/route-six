import type { Blocker, Exclusion } from '../types';

export function isExclusionBlocker(blocker: Blocker): blocker is Blocker & { code: Exclusion['reason'] } {
  return blocker.code === 'other-version' || blocker.code === 'external-event' || blocker.code === 'external-connection';
}

export function excludesSelection(exclusion: Exclusion, selection: { pokemonId: string; formId?: string | null }): boolean {
  return exclusion.pokemonId === selection.pokemonId
    && (exclusion.formId === undefined || exclusion.formId === (selection.formId ?? null));
}
