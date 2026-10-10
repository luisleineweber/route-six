import { pokemonById } from '../data/dataset';
import { useGameData } from '../features/planner/GameContext';
import type { Requirement } from '../domain/types';

export function RequirementList({ requirement }: { requirement:Requirement }) {
  const game = useGameData();
  if ('requirements' in requirement) {
    const children=requirement.requirements.filter(r=>!('requirements' in r&&r.requirements.length===0));
    if(!children.length)return null;
    return <>{requirement.kind==='any'&&<p>Meet one of these requirements:</p>}<ul>{children.map((r,i)=><li key={i}><RequirementList requirement={r} /></li>)}</ul></>;
  }
  switch(requirement.kind){
    case 'milestone': return <>{game.milestones.find(m=>m.id===requirement.id)!.name}.</>;
    case 'capability': return <>{game.capabilities.find(c=>c.id===requirement.id)!.name}.</>;
    case 'item': return <>{game.items.find(i=>i.id===requirement.id)!.name} ×{requirement.quantity} ({requirement.consumed?'consumed':'kept'}).</>;
    case 'pokemon': return <>{pokemonById.get(requirement.id)!.name} ×{requirement.quantity} ({requirement.consumed?'given away':'kept'}).</>;
  }
}
