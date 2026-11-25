import type { PokemonSource } from '../domain/types';
import { pokemonIdentity } from '../data/dataset';
import { selectionId } from '../domain/pokemon-selection';

export function tradeInstructions(source: PokemonSource): string[] {
  if (source.details.kind !== 'game-trade') return [];
  const details = source.details;
  const offer = details.offeredPokemonId === null ? 'any hatched, unfused Pokémon'
    : pokemonIdentity(details.offeredPokemonId).name;
  const level = source.level.kind === 'fixed' ? `at level ${source.level.value}`
    : source.level.kind === 'range' ? `at level ${source.level.minimum}–${source.level.maximum}`
    : 'at the offered Pokémon’s level';
  const received = pokemonIdentity(selectionId(source.pokemonId, source.formId)).name;
  const instructions = [`Give ${offer} to ${details.traderName ?? 'the game character'}. Receive ${received} ${level}.`];
  if (details.cyclePosition) instructions.push(`Trade ${details.cyclePosition} of 12. You can trade once per day. After trade 12, the cycle starts again.`);
  return instructions;
}
