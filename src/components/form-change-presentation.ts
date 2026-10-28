import type { FormChange } from '../domain/types';
import { pokemonIdentity } from '../data/dataset';

export function fusionInstruction(change: FormChange): string | null {
  if (!change.fusionPartnerPokemonId) return null;
  const partner = pokemonIdentity(change.fusionPartnerPokemonId).name;
  return `Fuse with ${partner}. It stays inside the fusion and cannot be a separate team member until you separate them.`;
}
