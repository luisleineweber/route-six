import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import { checkTeam } from '../src/domain/team/check-team';
import { analyzeTypes, damageMultiplier } from '../src/domain/team/analyze-types';
import { emerald, initialState } from './local-data';
import { breed, evolution, fixture, milestone, none, review, source } from './fixtures';
import type { Dataset } from '../src/domain/types';
import { plannerReducer } from '../src/features/planner/state';

function snapshot(data:Dataset,point='gate') {const r=getAvailability(data,{gameId:'emerald',milestoneId:point,respectLevelLimit:true});if(!r.ok)throw Error('Invalid test query');return r.value;}

describe('Team feasibility',()=>{
  it('rejects exclusive starter families but allows repeatable catches',()=>{
    const {data,game}=fixture(['treecko','torchic','poochyena']);game.choices.push({id:'starter',name:'Starter',options:['treecko','torchic'],maximumSelections:1,review});
    for(const id of ['treecko','torchic'])source(game,id,id,5,none,{maxUses:1,choice:{groupId:'starter',optionId:id}});source(game,'wild','poochyena');
    const s=snapshot(data);expect(checkTeam(s,['treecko','torchic'],'whole-game').warnings[0].code).toBe('choice-conflict');expect(checkTeam(s,['poochyena','poochyena'],'current-progress').feasible).toBe(true);
  });
  it('still reports a conflict between reachable members when another member is unavailable',()=>{
    const {data,game}=fixture(['treecko','torchic','mudkip','poochyena']);game.choices.push({id:'starter',name:'Starter',options:['treecko','torchic'],maximumSelections:1,review});
    for(const id of ['treecko','torchic'])source(game,id,id,5,none,{maxUses:1,choice:{groupId:'starter',optionId:id}});source(game,'wild','poochyena');
    const s=snapshot(data);
    const check=checkTeam(s,['treecko','mudkip','torchic'],'whole-game');
    expect(check.warnings.map(warning=>warning.code).sort()).toEqual(['choice-conflict','unavailable']);
    expect(check.warnings.find(warning=>warning.code==='choice-conflict')!.slotIndexes).toEqual([0,2]);
    const partial=checkTeam(s,['poochyena','mudkip'],'whole-game');
    expect(partial.feasible).toBe(false);
    expect(partial.chosenPathIds[0]).toBe(s.entries.poochyena.currentPathIds[0]);
    expect(partial.chosenPathIds[1]).toBeNull();
  });
  it('names only the members that share a finite source in a resource conflict',()=>{
    const {data,game}=fixture(['treecko','poochyena']);source(game,'gift','treecko',5,none,{maxUses:1});source(game,'wild','poochyena');
    const check=checkTeam(snapshot(data),['treecko','poochyena','treecko'],'current-progress');
    expect(check.warnings).toHaveLength(1);
    expect(check.warnings[0]).toMatchObject({code:'finite-resource',slotIndexes:[0,2]});
  });
  it('tries alternative sources and future sources before showing a conflict',()=>{
    const {data,game}=fixture(['treecko','torchic']);game.choices.push({id:'starter',name:'Starter',options:['treecko','torchic'],maximumSelections:1,review});
    for(const id of ['treecko','torchic'])source(game,id,id,5,none,{maxUses:1,choice:{groupId:'starter',optionId:id}});source(game,'future-torchic','torchic',5,milestone('future'));
    const s=snapshot(data);expect(checkTeam(s,['treecko','torchic'],'current-progress').feasible).toBe(false);expect(checkTeam(s,['treecko','torchic'],'whole-game').feasible).toBe(true);
  });
  it('checks finite sources and stones for multiple team members',()=>{
    const {data,game}=fixture(['pikachu','raichu']);source(game,'pikachu','pikachu');game.items.push({id:'stone',name:'Stone',sources:[{id:'stone-source',locationId:'field',requirements:none,maxUses:1,choice:null,review}],review});
    evolution(game,'pikachu','raichu',null,{trigger:'use-item',itemId:'stone',requirements:{kind:'item',id:'stone',quantity:1,consumed:true}});
    expect(checkTeam(snapshot(data),['raichu','raichu'],'current-progress').feasible).toBe(false);
  });
  it('uses one stone for a breeding parent that later stays in the team',()=>{
    const {data,game}=fixture(['pikachu','raichu','pichu','ditto']);
    source(game,'pikachu','pikachu');source(game,'mate','ditto');
    game.items.push({id:'stone',name:'Stone',sources:[{id:'stone-source',locationId:'field',requirements:none,maxUses:1,choice:null,review}],review});
    evolution(game,'pikachu','raichu',null,{trigger:'use-item',itemId:'stone',requirements:{kind:'item',id:'stone',quantity:1,consumed:true}});
    breed(game,'pichu-eggs',['raichu'],'pichu');
    const s=snapshot(data);
    expect(checkTeam(s,['raichu','pichu','pichu'],'current-progress').feasible).toBe(true);
    expect(checkTeam(s,['raichu','raichu'],'current-progress').feasible).toBe(false);
  });
  it('uses one consumed item for simultaneous products of one evolution',()=>{
    const {data,game}=fixture(['nincada','ninjask','shedinja']);source(game,'nincada','nincada');
    game.items.push({id:'ball',name:'Ball',sources:[{id:'ball-source',locationId:'field',requirements:none,maxUses:1,choice:null,review}],review});
    evolution(game,'nincada','ninjask',20,{coProductIds:['shedinja'],requirements:{kind:'item',id:'ball',quantity:1,consumed:true}});
    const s=snapshot(data);
    expect(checkTeam(s,['ninjask','shedinja'],'current-progress').feasible).toBe(true);
    expect(checkTeam(s,['ninjask','ninjask'],'current-progress').feasible).toBe(false);
  });
  it('reuses one finite starter parent for eggs and later evolution',()=>{
    const {data,game}=fixture(['treecko','grovyle','bagon']);source(game,'starter','treecko',5,none,{maxUses:1,genders:['female']});source(game,'mate','bagon');breed(game,'eggs',['treecko','grovyle'],'treecko');evolution(game,'treecko','grovyle',16);
    const s=snapshot(data);expect(checkTeam(s,['treecko','treecko','grovyle'],'current-progress').feasible).toBe(true);
  });
  it('cannot use one finite starter as two distinct opposite-gender parents',()=>{
    const {data,game}=fixture(['treecko']);source(game,'starter','treecko',5,none,{maxUses:1});breed(game,'eggs',['treecko'],'treecko');const s=snapshot(data);expect(s.entries.treecko.currentPathIds.every(id=>s.paths[id].breedingSteps.length===0)).toBe(true);
  });
  it('permits breeding before an offered parent is consumed by an in-game trade',()=>{
    const {data,game}=fixture(['ralts','seedot','shuppet']);source(game,'ralts','ralts',5,none,{maxUses:1,genders:['female']});source(game,'mate','shuppet');breed(game,'eggs',['ralts'],'ralts');
    source(game,'trade','seedot',5,{kind:'pokemon',id:'ralts',quantity:1,consumed:true},{details:{kind:'game-trade',offeredPokemonId:'ralts'},maxUses:1,level:{kind:'match-traded-pokemon',pokemonId:'ralts'},genders:['male']});
    expect(checkTeam(snapshot(data),['ralts','seedot'],'current-progress').feasible).toBe(true);
  });
  it('counts simultaneous evolution products once',()=>{
    const {data,game}=fixture(['nincada','ninjask','shedinja']);source(game,'nincada','nincada',5,none,{maxUses:1});evolution(game,'nincada','shedinja',20,{coProductIds:['ninjask'],genderTransitions:[{from:'male',to:'genderless'},{from:'female',to:'genderless'}]});
    expect(checkTeam(snapshot(data),['ninjask','shedinja'],'current-progress').feasible).toBe(true);
  });
  it('keeps six slots and preserves the team across settings changes',()=>{
    let state=initialState;for(let slot=0;slot<6;slot++)state=plannerReducer(state,{type:'add',pokemonId:'ralts',slot});expect(plannerReducer(state,{type:'add',pokemonId:'treecko',slot:null})).toBe(state);
    const next=plannerReducer(state,{type:'settings',values:{milestoneId:'national-dex',target:'current-progress',respectLevelLimit:false}});expect(next.team).toEqual(state.team);expect(next.team).toHaveLength(6);
  });
  it('warns for too many members and current versus future access',()=>{
    const {data,game}=fixture(['ralts']);source(game,'later','ralts',5,milestone('future'));const s=snapshot(data);expect(checkTeam(s,['ralts'],'current-progress').warnings[0].code).toBe('later');expect(checkTeam(s,['ralts'],'whole-game').feasible).toBe(true);expect(checkTeam(s,Array(7).fill('ralts'),'whole-game').warnings[0].code).toBe('too-many-members');
  });
});

describe('Generation III type analysis',()=>{
  it('multiplies dual types and exposes fourfold weaknesses and immunities',()=>{
    expect(damageMultiplier(emerald,'grass','swampert')).toBe(4);expect(damageMultiplier(emerald,'electric','swampert')).toBe(0);expect(damageMultiplier(emerald,'normal','shedinja')).toBe(0);expect(damageMultiplier(emerald,'ghost','metagross')).toBe(1);
  });
  it('uses 17 Emerald types and keeps Ralts Psychic',()=>{
    const result=analyzeTypes(emerald,['ralts','gardevoir','swampert']);expect(result.totalTypes).toBe(17);expect(result.repeatedTypes.psychic).toBe(2);expect(result.immunities.electric).toBe(1);expect(result.coveredTypes).toEqual(expect.arrayContaining(['fire','rock','electric','fighting','poison']));expect(result.coveredTypes).not.toContain('dragon');
  });
});
