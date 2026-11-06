import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import { solve } from '../src/domain/availability/solve';
import { compatibleGenders } from '../src/domain/availability/breeding';
import type { Dataset } from '../src/domain/types';
import type { ProofPath } from '../src/domain/proofs';
import { breed, capability, evolution, fixture, milestone, none, review, source } from './fixtures';

function query(data:Dataset,milestoneId='start',respectLevelLimit=true) {
  const result=getAvailability(data,{gameId:'emerald',milestoneId,respectLevelLimit});
  if(!result.ok)throw Error(JSON.stringify(result.error));return result.value;
}

describe('Progress and acquisition rules',()=>{
  it('does not mark a current catch as available at an earlier optional visit made with later history',()=>{
    const {data,game}=fixture(['magikarp']);
    game.milestones.find(point=>point.id==='optional')!.previousIds=['start'];
    source(game,'gate-catch','magikarp',5,milestone('gate'));
    const result=query(data,'gate',false);
    const entry=result.entries.magikarp;
    expect(entry.firstMilestoneIds).toEqual(['gate']);
    for(const id of entry.currentPathIds) expect(result.paths[id].firstMilestoneIds).toEqual(['gate']);
  });
  it('keeps a selected optional source in later evolution proofs',()=>{
    const {data,game}=fixture(['ralts','kirlia']);
    game.milestones.find(m=>m.id==='optional')!.previousIds=['gate'];
    source(game,'optional-catch','ralts',5,milestone('optional'));
    evolution(game,'ralts','kirlia',20,{requirements:milestone('future')});
    const result=query(data,'optional');
    expect(result.entries.ralts.status).toBe('available');
    expect(result.entries.kirlia.status).toBe('later');
    expect(result.entries.kirlia.firstMilestoneIds).toContain('future');
  });
  it('does not create access to an item with no native sources',()=>{
    const {data,game}=fixture(['pikachu','raichu']);source(game,'pikachu','pikachu');
    game.items.push({id:'stone',name:'Stone',sources:[],review});
    evolution(game,'pikachu','raichu',null,{trigger:'use-item',itemId:'stone',requirements:{kind:'item',id:'stone',quantity:1,consumed:true}});
    expect(query(data,'end',false).entries.raichu.status).toBe('blocked');
  });
  it('uses mandatory ancestors, not display order or optional visits',()=>{
    const {data,game}=fixture(['ralts']);source(game,'optional-catch','ralts',4,milestone('optional'));
    expect(query(data,'gate').entries.ralts.status).toBe('later');
    expect(query(data,'gate').entries.ralts.firstMilestoneIds).toContain('optional');
    expect(query(data,'optional').entries.ralts.status).toBe('available');
  });
  it('does not unlock a fishing method when its route opens',()=>{
    const {data,game}=fixture(['magikarp']);source(game,'fish','magikarp',5,capability('old-rod'),{details:{kind:'wild',method:'old-rod',ratePercent:100}});
    expect(query(data).entries.magikarp.status).toBe('later');expect(query(data,'gate').entries.magikarp.status).toBe('available');
    expect(query(data,'start',false).entries.magikarp.status).toBe('later');
  });
  it('applies each evolution level and the extra level after a high-level capture',()=>{
    const {data,game}=fixture(['ralts','kirlia','gardevoir']);source(game,'ralts','ralts',24);evolution(game,'ralts','kirlia',20);evolution(game,'kirlia','gardevoir',30);
    const atGate=query(data,'gate');expect(atGate.entries.ralts.status).toBe('available');expect(atGate.entries.kirlia.status).toBe('later');
    const later=query(data,'future');expect(later.paths[later.entries.kirlia.currentPathIds[0]].minimumLevel).toBe(25);
    expect(later.paths[later.entries.gardevoir.currentPathIds[0]].minimumLevel).toBe(30);
  });
  it('blocks item evolution before stone access and consumes the stone',()=>{
    const {data,game}=fixture(['pikachu','raichu']);source(game,'pikachu','pikachu');
    game.items.push({id:'stone',name:'Stone',sources:[{id:'stone-source',locationId:'field',requirements:milestone('future'),maxUses:1,choice:null,review}],review});
    evolution(game,'pikachu','raichu',null,{trigger:'use-item',itemId:'stone',requirements:{kind:'item',id:'stone',quantity:1,consumed:true}});
    expect(query(data).entries.raichu.status).toBe('later');expect(query(data,'start',false).entries.raichu.status).toBe('later');
    const current=query(data,'future');expect(current.paths[current.entries.raichu.currentPathIds[0]].claims).toContainEqual({resourceId:'item-source:stone-source',quantity:1,use:'consume'});
  });
  it('matches in-game trade level and proves the offered Pokémon',()=>{
    const {data,game}=fixture(['ralts','seedot']);source(game,'ralts','ralts',8,milestone('gate'));
    source(game,'trade','seedot',5,{kind:'pokemon',id:'ralts',quantity:1,consumed:true},{details:{kind:'game-trade',offeredPokemonId:'ralts'},level:{kind:'match-traded-pokemon',pokemonId:'ralts'},maxUses:1,genders:['male']});
    expect(query(data).entries.seedot.status).toBe('later');const current=query(data,'gate');expect(current.paths[current.entries.seedot.currentPathIds[0]].minimumLevel).toBe(8);
  });
  it('never unlocks player trades or other-version families by removing the cap',()=>{
    const {data,game}=fixture(['abra','kadabra','alakazam','bulbasaur','ivysaur']);source(game,'abra','abra');evolution(game,'abra','kadabra',16);evolution(game,'kadabra','alakazam',null,{trigger:'player-trade'});
    game.exclusions.push({pokemonId:'bulbasaur',reason:'other-version',explanation:'Other version needed.',review});evolution(game,'bulbasaur','ivysaur',16);
    const result=query(data,'end',false);expect(result.entries.alakazam.status).toBe('blocked');expect(result.entries.alakazam.blockers.some(b=>b.code==='player-trade')).toBe(true);expect(result.entries.ivysaur.status).toBe('unavailable');
  });
  it('has no recommended limit after the final League opponent',()=>{
    const {data,game}=fixture(['rayquaza']);source(game,'rayquaza','rayquaza',70,milestone('future'));
    expect(query(data,'future').entries.rayquaza.status).toBe('later');const result=query(data,'end');expect(result.levelLimit).toBeNull();expect(result.entries.rayquaza.status).toBe('available');
  });
  it('keeps earlier acquired Pokémon when a later limit is lower',()=>{
    const {data,game}=fixture(['ralts']);game.bosses[0].highestLevel=30;game.bosses[1].highestLevel=15;source(game,'ralts','ralts',25);
    expect(query(data,'gate').entries.ralts.status).toBe('available');
  });
  it('returns explicit errors for unknown query inputs',()=>{
    const {data}=fixture(['ralts']);expect(getAvailability(data,{gameId:'missing',milestoneId:'start',respectLevelLimit:true})).toEqual({ok:false,error:{code:'unknown-game',gameId:'missing'}});
    expect(getAvailability(data,{gameId:'emerald',milestoneId:'missing',respectLevelLimit:true})).toEqual({ok:false,error:{code:'unknown-milestone',milestoneId:'missing'}});
  });
});

describe('Breeding proofs',()=>{
  it('evolves a new offspring back into its parent species',()=>{
    const {data,game}=fixture(['treecko','grovyle','ditto']);
    source(game,'gift','grovyle',16,none,{maxUses:1,genders:['female']});source(game,'mate','ditto');
    breed(game,'treecko-eggs',['grovyle'],'treecko');evolution(game,'treecko','grovyle',16);
    const result=query(data,'gate');
    expect(result.entries.grovyle.currentPathIds.some(id=>result.paths[id].breedingSteps.length>0)).toBe(true);
    const offspring=result.paths[result.entries.treecko.currentPathIds[0]] as ProofPath;
    expect(offspring.individuals.some(p=>p.origin===offspring.outputOrigin&&p.stages[0]===`treecko:${offspring.genders[0]}`)).toBe(true);
  });
  it('waits for Day Care and has concrete parents at the real hatch level',()=>{
    const {data,game}=fixture(['treecko','poochyena']);source(game,'treecko','treecko',5,none,{maxUses:1,genders:['female']});source(game,'mate','poochyena');
    // Treecko and Poochyena do not share Egg Groups. Use Treecko's Monster partner.
    game.profiles.find(p=>p.pokemonId==='poochyena')!.breeding!.eggGroupIds=['monster'];breed(game,'treecko-eggs',['treecko'],'treecko');
    expect(query(data).entries.treecko.currentPathIds.some(id=>query(data).paths[id].breedingSteps.length)).toBe(false);
    const current=query(data,'gate');const eggs=current.entries.treecko.currentPathIds.map(id=>current.paths[id]).filter(p=>p.breedingSteps.length);expect(eggs.length).toBeGreaterThan(0);expect(eggs[0].minimumLevel).toBe(5);expect(eggs[0].breedingSteps[0].parents.map(p=>p.gender)).toEqual(['female','male']);
  });
  it('rejects incompatible groups and two Ditto; permits a genderless parent with Ditto',()=>{
    const {game}=fixture(['treecko','poochyena','ditto','beldum']);const p=(id:string)=>game.profiles.find(p=>p.pokemonId===id)!;
    expect(compatibleGenders(p('treecko'),p('poochyena'),'female','male')).toBe(false);expect(compatibleGenders(p('ditto'),p('ditto'),'genderless','genderless')).toBe(false);expect(compatibleGenders(p('beldum'),p('ditto'),'genderless','genderless')).toBe(true);
    source(game,'beldum','beldum',5,none,{maxUses:1});source(game,'ditto','ditto');breed(game,'beldum-eggs',['beldum'],'beldum');expect(solve(game,game.milestones[1],true).paths.get('beldum')!.some(p=>p.breedingSteps.length)).toBe(true);
  });
  it('uses a fixed source gender rather than all species genders',()=>{
    const {game}=fixture(['treecko','bagon']);source(game,'gift','treecko',5,none,{genders:['male'],maxUses:1});source(game,'mate','bagon',5,none,{genders:['male']});breed(game,'eggs',['treecko'],'treecko');
    expect(solve(game,game.milestones[1],true).paths.get('treecko')!.some(p=>p.breedingSteps.length)).toBe(false);
  });
  it('requires incense, retains it, and enforces parent and hatch levels',()=>{
    const {game}=fixture(['marill','azurill','poochyena']);source(game,'marill','marill',24,none,{genders:['female']});source(game,'mate','poochyena');game.profiles.find(p=>p.pokemonId==='poochyena')!.breeding!.eggGroupIds=['water-1'];
    game.items.push({id:'incense',name:'Incense',sources:[{id:'incense-source',locationId:'field',requirements:milestone('future'),maxUses:1,choice:null,review}],review});breed(game,'azurill-eggs',['marill'],'azurill','incense');
    expect(solve(game,game.milestones[1],true).paths.has('azurill')).toBe(false);const future=solve(game,game.milestones[2],true).paths.get('azurill')![0];expect(future.claims.some(c=>c.resourceId==='item-source:incense-source'&&c.use==='retain')).toBe(true);
    game.bosses[1].highestLevel=23;expect(solve(game,game.milestones[1],true).paths.has('azurill')).toBe(false);
    game.bosses[2].highestLevel=4;expect(solve(game,game.milestones[2],true).paths.has('azurill')).toBe(false);
  });
  it('does not create access from an ungrounded breeding cycle',()=>{
    const {game}=fixture(['treecko','bagon']);breed(game,'treecko-eggs',['treecko'],'treecko');breed(game,'bagon-eggs',['bagon'],'bagon');expect(solve(game,game.milestones[1],true).paths.size).toBe(0);
  });
});
