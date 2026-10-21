import type { AcquisitionPath, GameData } from '../domain/types';
import { pokemonIdentity } from '../data/dataset';
import { selectionId } from '../domain/pokemon-selection';
import { encounterInstructions } from './encounter-presentation';

export function itemSourceInstructions(game: GameData, path: AcquisitionPath): string[] {
  const used = new Set(path.claims.map(claim => claim.resourceId));
  return game.items.flatMap(item => item.sources.flatMap(source => {
    const details = source.details;
    if (!details || !used.has(`item-source:${source.id}`)) return [];
    const capture = game.sources.find(value => value.id === details.pokemonSourceId);
    if (!capture) throw new Error(`Missing item holder source: ${details.pokemonSourceId}`);
    const name = pokemonIdentity(selectionId(capture.pokemonId, capture.formId)).name;
    const location = game.locations.find(value => value.id === source.locationId);
    if (!location) throw new Error(`Missing item holder location: ${source.locationId}`);
    if (details.kind === 'received-held-item') return [
      `Obtain ${name} at ${location.name}, then take its ${item.name}. Keep the Pokémon. This item is available once.`,
      ...encounterInstructions(capture),
    ];
    if (details.kind === 'pickup') return [
      `Use ${name} with Pickup at Lv. ${details.minimumLevel}–${details.maximumLevel}. Obtain it at ${location.name}. Keep its held item slot empty. Check it after battle. Each eligible battle has a ${details.ratePercent}% chance to give ${item.name}.`,
      ...encounterInstructions(capture),
    ];
    return [`Capture ${name} at ${location.name}, then take its ${item.name}. Normal held-item chance: ${details.ratePercent}%. Keep the Pokémon.`,
      ...encounterInstructions(capture)];
  }));
}
