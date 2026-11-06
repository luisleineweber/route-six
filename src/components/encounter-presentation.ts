import type { EncounterCondition, PokemonSource } from '../domain/types';

function conditionText(condition: EncounterCondition): string {
  switch (condition.kind) {
    case 'time': return `Visit during the ${condition.periods.join(' or ')}.`;
    case 'season': return `Visit during ${condition.seasons.join(' or ')}.`;
    case 'weekday': return `Visit on ${condition.day[0].toUpperCase() + condition.day.slice(1)}.`;
    case 'swarm': return 'Check the daily Pokémon report on the radio. Visit this place when the report names this Pokémon.';
    case 'funfest': return 'Start Mushrooms’ Hide-and-Seek to restore the fake-item encounters. You can play this native Funfest mission alone.';
    case 'radio': return condition.sound === 'hoenn'
      ? 'Play Hoenn Sound on the Pokégear radio on Wednesday.'
      : 'Play Sinnoh Sound on the Pokégear radio on Thursday.';
    case 'headbutt-tree': return condition.category === 'secret'
      ? 'Use Headbutt on a secret tree here. These trees can have Pokémon that other trees do not have.'
      : `Use Headbutt on a ${condition.category} tree here. Try other trees if needed. Each tree keeps the same Pokémon group in your game.`;
    case 'safari-blocks': return `Place objects in this Safari area to reach at least ${condition.blocks.map(block => `${block.points} ${block.type} points`).join(' and ')}. Aging the area can increase the points from each object. You may need to wait many days.`;
    case 'daily': return condition.system === 'great-marsh'
      ? 'This species must be in this area’s daily Great Marsh rotation.'
      : condition.system === 'trophy-garden'
      ? 'This species must be one of the current Trophy Garden daily visitors.'
      : 'This place must be the current daily Mirage spot. Soar to it before the day ends.';
    case 'feebas-tiles': return `Fish on one of the ${condition.tileCount} current Feebas tiles. After a bite, these tiles have a ${condition.replacementPercent}% Feebas check.`;
  }
}

export function encounterInstructions(source: PokemonSource): string[] {
  const instructions = (source.encounterConditions ?? []).map(conditionText);
  if (source.details.kind === 'hidden-grotto') {
    instructions.unshift(source.details.mode === 'first-visit'
      ? 'This is the one-time encounter from the Hidden Grotto introduction.'
      : source.details.mode === 'funfest'
      ? `Start ${source.details.mission === 'noisy' ? 'Noisy' : 'Quiet'} Hidden Grottoes after you complete Search Hidden Grottoes. You can play this native Funfest mission alone. Check this site while the mission is active. Ten random grottoes receive mission Pokémon.`
      : `Check this Hidden Grotto after its contents regenerate. This species has a ${source.details.ratePercent}% share of normal content rolls, including item outcomes.`);
  }
  if (source.details.kind === 'white-forest') {
    instructions.unshift(`${source.details.residentName} must be one of White Forest’s initial residents. Visit and speak to residents so they stay.`,
      `Keep enough residents for ${source.details.method === 'surf' ? 'water tiles, then use Surf' : 'grass tiles'}. This source does not use an invited resident.`);
  }
  if (source.details.kind === 'honey-tree') {
    instructions.unshift('Slather Honey on the tree. Wait 6 hours. Check the tree before 24 hours pass. Each attempt uses one Honey.');
    if (source.details.rareTreeOnly) instructions.push('This species can appear only on a rare Honey Tree. Your Trainer ID determines which trees are rare.');
  }
  if (source.details.kind === 'berry-tree') {
    instructions.unshift(`Grow a ${source.details.color} Berry tree in the Berry Fields. Check the tree when a pest appears.`);
  }
  if (source.details.kind === 'dexnav') {
    const habitat = { grass: 'grass', 'long-grass': 'long grass', cave: 'the cave', surf: 'water while surfing' }[source.details.habitat];
    instructions.unshift(`Search ${habitat} with the DexNav. This species appears only as a hidden Pokémon; its rate is not reviewed.`);
  }
  if (source.details.kind === 'wild' && source.details.method === 'poke-radar') {
    instructions.unshift('Use the Poké Radar in grass. Enter a marked patch that can give a special Radar encounter.');
  }
  return instructions;
}
