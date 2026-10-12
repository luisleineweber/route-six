import { pokemonById } from '../data/dataset';
import { useGameData } from '../features/planner/GameContext';
import { conditionText } from '../domain/availability/solve';
import type { AcquisitionPath, AvailabilitySnapshot } from '../domain/types';
import { RequirementList } from './RequirementList';
import { firstAccessPoints, pathSource, sourceMethod } from './acquisition-presentation';

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
      <div><dt>Method</dt><dd className="path-method">{method.rodIcon && <img className="rod-icon" src={method.rodIcon} alt="" width={24} height={24} />}<span>{method.name}</span></dd></div>
      <div><dt>Location</dt><dd>{location.name}</dd></div>
      <div><dt>Source level</dt><dd>{level}</dd></div>
      {source.details.kind === 'wild' && <div><dt>Encounter rate</dt><dd>{source.details.ratePercent}%</dd></div>}
      <div><dt>Minimum level</dt><dd>Lv. {path.minimumLevel}</dd></div>
      {path.firstMilestoneIds.length > 0 && <div><dt>First access</dt><dd>{firstAccessPoints(game, path.firstMilestoneIds)[0].name}</dd></div>}
    </dl>
      {source.id.startsWith('feebas-six-tiles') && <p>Fish on one of the six Feebas tiles on Route 119. Each cast on these tiles has a 50% Feebas check.</p>}
      {source.id.startsWith('outbreak-') && <p>This source needs its TV outbreak report after the Hall of Fame. The outbreak adds a 50% species check on this route. It is separate from the ordinary encounter table.</p>}
      {source.id.startsWith('wild-mirage-island') && <p>A party Pokémon’s personality must match the daily Mirage Island value. Visit when the island appears.</p>}
      {source.id.includes('shoal-cave') && <p>Visit at the correct tide. The ice room needs low tide and Strength.</p>}
      {source.details.kind==='game-trade' && <p>Give {pokemonById.get(source.details.offeredPokemonId)!.name} to the game character. You receive a {source.genders.join('/')} {pokemonById.get(source.pokemonId)!.name} at the offered Pokémon’s level.</p>}
      {fossilId && <p>Give a {game.items.find(i=>i.id===fossilId)!.name} to the Devon researcher for revival. This consumes the fossil.</p>}
      <section className="path-requirements"><h4>Requirements</h4><RequirementList requirement={{kind:'all',requirements:[location.requirements,source.requirements]}} /></section>
      {path.breedingSteps.map((step,i)=><div key={i}><h4>Parent pair</h4><ul>{step.parents.map((parent,j)=><li key={j}>{pokemonById.get(parent.pokemonId)!.name} ({parent.gender}){snapshot.paths[parent.pathId] ? ` · Minimum Lv. ${snapshot.paths[parent.pathId].minimumLevel}` : ''}<span className="small">{snapshot.paths[parent.pathId]?.sourceIds.map(id=>game.sources.find(s=>s.id===id)).filter(s=>s&&s.details.kind!=='breeding').slice(0,3).map(s=>game.locations.find(l=>l.id===s!.locationId)!.name).join(', ')}</span></li>)}</ul><p>Parents remain reusable. Eggs hatch at level 5. {game.breedingRules.find(r=>r.id===step.ruleId)!.requiredHeldItemId && `One parent must hold ${game.items.find(item=>item.id===game.breedingRules.find(r=>r.id===step.ruleId)!.requiredHeldItemId)!.name}. The held item is kept.`}</p></div>)}
      {path.evolutionIds.length>0 && <><h4>Evolution steps</h4><ol>{path.evolutionIds.map(id=>{const e=game.evolutions.find(e=>e.id===id)!;return <li key={id}>{pokemonById.get(e.fromPokemonId)!.name} → {pokemonById.get(path.coProductIds.includes(e.toPokemonId)?path.pokemonId:e.toPokemonId)!.name}: {e.trigger==='use-item'?`use ${game.items.find(i=>i.id===e.itemId)!.name}`:e.minimumLevel?`gain a level at Lv. ${e.minimumLevel} or higher`:'gain one level'}.{e.conditions.map((c,i)=><p key={i}>{conditionText(c)}</p>)}</li>;})}</ol></>}
      {!!path.choices.length && <><h4>Playthrough choices</h4><ul>{path.choices.map(c=><li key={c.groupId+c.optionId}>{game.choices.find(g=>g.id===c.groupId)!.name}: {pokemonById.get(c.optionId)?.name??game.items.find(i=>i.id===c.optionId)?.name??c.optionId}</li>)}</ul></>}
      {path.claims.some(c=>snapshot.resourceLimits[c.resourceId]!==null) && <p className="small">Finite resources: {path.claims.filter(c=>snapshot.resourceLimits[c.resourceId]!==null).map(c=>`${c.resourceId.replace(/^(source|item-source):/,'')} ×${c.quantity}`).join(', ')}.</p>}
    </div>;
}

