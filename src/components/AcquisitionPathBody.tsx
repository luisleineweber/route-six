import { pokemonById, pokemonIdentity } from '../data/dataset';
import { selectionId } from '../domain/pokemon-selection';
import { useGameData } from '../features/planner/GameContext';
import { evolutionConditionText } from './evolution-presentation';
import type { AcquisitionPath, AvailabilitySnapshot } from '../domain/types';
import { RequirementList } from './RequirementList';
import { firstAccessLabel, pathSource, sourceMethod, breedingParentName } from './acquisition-presentation';
import { encounterInstructions } from './encounter-presentation';
import { itemSourceInstructions } from './item-source-presentation';
import { fusionInstruction } from './form-change-presentation';
import { tradeInstructions } from './trade-presentation';

export function AcquisitionPathBody({ path, snapshot }: { path: AcquisitionPath; snapshot: AvailabilitySnapshot }) {
  const game = useGameData();
  const source = pathSource(game, path);
  const location = game.locations.find(l => l.id === source.locationId)!;
  const level = source.level.kind === 'range' ? `${source.level.minimum}–${source.level.maximum}` : source.level.kind === 'fixed' ? String(source.level.value) : 'matches the offered Pokémon';
  const fossilId = source.details.kind === 'fossil' ? source.details.itemId : null;
  const method = sourceMethod(source.details);
  return <div className="path-body">
    {path.evolutionIds.length > 0 && <h4>Starting source: {pokemonById.get(source.pokemonId)!.name}</h4>}
    <dl className="source-facts">
      <div><dt>Method</dt><dd className="path-method">{method.iconSrc && <img className="method-icon" src={method.iconSrc} alt="" width={24} height={24} />}<span>{method.name}</span></dd></div>
      <div><dt>Location</dt><dd>{location.name}</dd></div>
      <div><dt>Source level</dt><dd>{level}</dd></div>
      {source.details.kind === 'wild' && <div><dt>Encounter rate</dt><dd>{source.details.ratePercent}%</dd></div>}
      <div><dt>Minimum level</dt><dd>Lv. {path.minimumLevel}</dd></div>
      {path.firstMilestoneIds.length > 0 && <div><dt>Available from</dt><dd>{firstAccessLabel(game, path, path.firstMilestoneIds[0])}</dd></div>}
    </dl>
      {encounterInstructions(source).map(instruction=><p key={instruction}>{instruction}</p>)}
      {itemSourceInstructions(game,path).map(instruction=><p key={instruction}>{instruction}</p>)}
      {source.id.startsWith('feebas-six-tiles') && <p>Fish on one of the six Feebas tiles on Route 119. Each cast on these tiles has a 50% Feebas check.</p>}
      {source.id.startsWith('outbreak-') && <p>After the Hall of Fame, check the TV for outbreaks. On this route, each encounter has a 50% chance to be the reported Pokémon.</p>}
      {source.id.startsWith('wild-mirage-island') && <p>A party Pokémon’s personality must match the daily Mirage Island value. Visit when the island appears.</p>}
      {source.id.includes('shoal-cave') && <p>Visit at the correct tide. The ice room needs low tide and Strength.</p>}
      {tradeInstructions(source).map(instruction => <p key={instruction}>{instruction}</p>)}
      {fossilId && <p>Revive a {game.items.find(i=>i.id===fossilId)!.name} at {location.name}. This uses up the fossil.</p>}
      <section className="path-requirements"><h4>Requirements</h4><RequirementList requirement={{kind:'all',requirements:[location.requirements,source.requirements]}} /></section>
      {path.breedingSteps.map((step,i)=><div key={i}><h4>Parent pair</h4><ul>{step.parents.map((parent,j)=><li key={j}>{breedingParentName(parent,snapshot)} ({parent.gender}){snapshot.paths[parent.pathId] ? ` · Minimum Lv. ${snapshot.paths[parent.pathId].minimumLevel}` : ''}<span className="small">{snapshot.paths[parent.pathId]?.sourceIds.map(id=>game.sources.find(s=>s.id===id)).filter(s=>s&&s.details.kind!=='breeding').slice(0,3).map(s=>game.locations.find(l=>l.id===s!.locationId)!.name).join(', ')}</span></li>)}</ul><p>Parents remain reusable. Eggs hatch at level {game.game.breeding!.hatchLevel}. {game.breedingRules.find(r=>r.id===step.ruleId)!.requiredHeldItemId && `One parent must hold ${game.items.find(item=>item.id===game.breedingRules.find(r=>r.id===step.ruleId)!.requiredHeldItemId)!.name}. The held item is kept.`}</p></div>)}
      {!!path.formChangeIds?.length && <section><h4>Form changes</h4><ul>{path.formChangeIds.map(id=>{const change=game.formChanges!.find(change=>change.id===id)!;return <li key={id}>Change to {pokemonIdentity(selectionId(change.pokemonId,change.toFormId)).name}.{fusionInstruction(change) && <p>{fusionInstruction(change)}</p>}<RequirementList requirement={change.requirements} />{change.heldItemId && <p>Keep {game.items.find(item=>item.id===change.heldItemId)!.name} held by this Pokémon.</p>}</li>;})}</ul></section>}
      {path.evolutionIds.length>0 && <><h4>Evolution steps</h4><ol>{path.evolutionIds.map(id=>{const e=game.evolutions.find(e=>e.id===id)!;return <li key={id}>{pokemonIdentity(selectionId(e.fromPokemonId,e.fromFormId)).name} → {pokemonIdentity(selectionId(path.coProductIds.includes(e.toPokemonId)?path.pokemonId:e.toPokemonId,path.coProductIds.includes(e.toPokemonId)?null:e.toFormId)).name}: {e.trigger==='use-item'?`use ${game.items.find(i=>i.id===e.itemId)!.name}`:e.minimumLevel?`gain a level at Lv. ${e.minimumLevel} or higher`:'gain one level'}.{e.conditions.map((c,i)=><p key={i}>{evolutionConditionText(game,c)}</p>)}</li>;})}</ol></>}
      {!!path.choices.length && <><h4>Playthrough choices</h4><ul>{path.choices.map(c=><li key={c.groupId+c.optionId}>{game.choices.find(g=>g.id===c.groupId)!.name}: {pokemonById.get(c.optionId)?.name??game.items.find(i=>i.id===c.optionId)?.name??c.optionId}</li>)}</ul></>}
    </div>;
}

