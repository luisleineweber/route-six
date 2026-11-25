/** The second team in the comparison view. It stays separate from the planner team. */
export interface ComparisonDraft {
  slots: (string | null)[];
  activeSlot: number | null;
}

export type ComparisonAction =
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'copy'; team: readonly (string | null)[] }
  | { type: 'choose'; slot: number }
  | { type: 'cancel' }
  | { type: 'add'; pokemonId: string; slot: number }
  | { type: 'remove'; slot: number };

/** `null` means that the comparison view is closed. */
export function comparisonReducer(draft: ComparisonDraft | null, action: ComparisonAction): ComparisonDraft | null {
  if (action.type === 'open') return { slots: Array(6).fill(null), activeSlot: null };
  if (action.type === 'close' || draft === null) return null;
  if (action.type === 'copy') return { slots: [...action.team], activeSlot: null };
  if (action.type === 'choose') return { ...draft, activeSlot: action.slot };
  if (action.type === 'cancel') return { ...draft, activeSlot: null };
  const slots = [...draft.slots];
  if (action.type === 'remove') {
    slots[action.slot] = null;
    return { slots, activeSlot: draft.activeSlot === action.slot ? null : draft.activeSlot };
  }
  if (action.slot < 0 || action.slot > 5) return draft;
  slots[action.slot] = action.pokemonId;
  return { slots, activeSlot: null };
}
