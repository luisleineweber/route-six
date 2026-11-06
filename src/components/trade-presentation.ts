import type { PokemonSource } from '../domain/types';
import { pokemonById } from '../data/dataset';

export function tradeInstructions(source: PokemonSource): string[] {
  if (source.details.kind !== 'game-trade') return [];
  const details = source.details;
  const offer = details.offeredPokemonId === null ? 'any hatched, unfused Pokémon'
    : pokemonById.get(details.offeredPokemonId)!.name;
  const level = source.level.kind === 'fixed' ? `at level ${source.level.value}`
    : source.level.kind === 'range' ? `at level ${source.level.minimum}–${source.level.maximum}`
    : 'at the offered Pokémon’s level';
  const instructions = [`Give ${offer} to ${details.traderName ?? 'the game character'}. Receive ${pokemonById.get(source.pokemonId)!.name} ${level}.`];
  if (details.cyclePosition) instructions.push(`Trade ${details.cyclePosition} of 12. You can trade once per day. After trade 12, the cycle starts again.`);
  return instructions;
}
