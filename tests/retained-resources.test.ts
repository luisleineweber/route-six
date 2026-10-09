import { expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import { validateDataset } from '../src/data/validate-dataset';
import { checkTeam } from '../src/domain/team/check-team';
import { breed, capability, evolution, fixture, none, source } from './fixtures';

it('needs distinct animals for a retained quantity of two',()=>{
  const {data,game}=fixture(['treecko','ralts']);source(game,'starter','treecko',5,none,{maxUses:1});source(game,'gift','ralts',5,{kind:'pokemon',id:'treecko',quantity:2,consumed:false});
  const result=getAvailability(data,{gameId:'emerald',milestoneId:'gate',respectLevelLimit:true});expect(result.ok&&result.value.entries.ralts.currentPathIds.length).toBe(0);
});
it('rejects a direct-source dependency cycle with no base proof',()=>{
  const {data,game}=fixture(['ralts','seedot']);source(game,'ralts','ralts',5,{kind:'pokemon',id:'seedot',quantity:1,consumed:true});source(game,'seedot','seedot',5,{kind:'pokemon',id:'ralts',quantity:1,consumed:true});
  const result=validateDataset(data);expect(result.ok).toBe(false);if(!result.ok)expect(result.error.some(e=>e.message.includes('grounded'))).toBe(true);
});
it('does not use two possible genders of one finite evolved parent as two animals',()=>{
  const {data,game}=fixture(['azurill','marill']);source(game,'egg-gift','azurill',5,none,{maxUses:1,genders:['female']});
  evolution(game,'azurill','marill',null,{requirements:capability('friendship'),conditions:[{kind:'friendship',minimum:220}],genderTransitions:[{from:'female',to:'female'},{from:'female',to:'male'}]});breed(game,'marill-eggs',['marill'],'marill');
  const result=getAvailability(data,{gameId:'emerald',milestoneId:'gate',respectLevelLimit:true});expect(result.ok).toBe(true);if(result.ok)expect(result.value.entries.marill.currentPathIds.every(id=>result.value.paths[id].breedingSteps.length===0)).toBe(true);
});
function tradeParentFixture(copies:number){
  const f=fixture(['ralts','seedot']);const {game}=f;
  game.profiles.find(p=>p.pokemonId==='seedot')!.breeding.eggGroupIds=['amorphous'];
  source(game,'gift','ralts',5,none,{maxUses:copies,genders:['female']});
  source(game,'trade','seedot',5,{kind:'pokemon',id:'ralts',quantity:1,consumed:true},{maxUses:1,genders:['male'],details:{kind:'game-trade',offeredPokemonId:'ralts'},level:{kind:'match-traded-pokemon',pokemonId:'ralts'}});
  breed(game,'ralts-eggs',['ralts'],'ralts');return f;
}
it('does not breed with a parent consumed to obtain its partner',()=>{
  const {data}=tradeParentFixture(1);const r=getAvailability(data,{gameId:'emerald',milestoneId:'gate',respectLevelLimit:true});expect(r.ok).toBe(true);if(r.ok)expect(r.value.entries.ralts.currentPathIds.every(id=>r.value.paths[id].breedingSteps.length===0)).toBe(true);
});
it('reuses one trade action for repeated eggs when another parent is available',()=>{
  const {data}=tradeParentFixture(2);const r=getAvailability(data,{gameId:'emerald',milestoneId:'gate',respectLevelLimit:true});expect(r.ok).toBe(true);if(r.ok)expect(checkTeam(r.value,['ralts','ralts','seedot'],'current-progress').feasible).toBe(true);
});
it('keeps returned proofs unchanged during team checks and later queries',()=>{
  const {data}=tradeParentFixture(2);
  const result=getAvailability(data,{gameId:'emerald',milestoneId:'gate',respectLevelLimit:true});
  expect(result.ok).toBe(true);if(!result.ok)return;
  const before=JSON.stringify(result.value);
  const freeze=(value:unknown):void=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);Object.values(value).forEach(freeze);}};
  freeze(result.value);
  expect(checkTeam(result.value,['ralts','ralts','seedot'],'current-progress').feasible).toBe(true);
  getAvailability(data,{gameId:'emerald',milestoneId:'future',respectLevelLimit:true});
  expect(JSON.stringify(result.value)).toBe(before);
});
