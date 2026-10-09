import { beforeAll, describe, expect, it } from 'vitest';
import { dataset, emerald } from '../src/data/dataset';
import { getAvailability } from '../src/domain/availability';
import { checkTeam } from '../src/domain/team/check-team';
import type { AvailabilitySnapshot } from '../src/domain/types';

let early:AvailabilitySnapshot;
let late:AvailabilitySnapshot;
const query=(milestoneId:string,respectLevelLimit=true)=>{const r=getAvailability(dataset,{gameId:'emerald',milestoneId,respectLevelLimit});if(!r.ok)throw Error('Invalid Emerald query');return r.value;};
beforeAll(()=>{early=query('route-102');late=query('national-dex');},60000);

describe('Complete Emerald integration',()=>{
  it('covers the National Dex, all 34 routes and every League opponent',()=>{
    expect(dataset.pokemon.map(p=>p.nationalDex)).toEqual(Array.from({length:386},(_,i)=>i+1));expect(Object.keys(early.entries)).toHaveLength(386);
    for(let n=101;n<=134;n++)expect(emerald.milestones.some(m=>m.locationId===`route-${n}`&&m.kind==='route')).toBe(true);expect(emerald.bosses).toHaveLength(13);
  });
  it('has correct early sources and locked evolutions',()=>{
    expect(early.entries.ralts.status).toBe('available');expect(early.entries.treecko.status).toBe('available');expect(early.entries.sceptile.status).toBe('later');expect(early.entries.magikarp.status).toBe('later');expect(early.entries.nosepass.status).toBe('later');expect(early.entries.bulbasaur.status).toBe('unavailable');expect(early.entries.mew.status).toBe('unavailable');
  });
  it('enforces starter choices and permits bred copies in one family',()=>{
    expect(checkTeam(early,['treecko','torchic'],'whole-game').feasible).toBe(false);
    const current=query('mauville');expect(checkTeam(current,['treecko','grovyle','treecko'],'current-progress').feasible).toBe(true);
  });
  it('permits both fossils after the League but not at current early progress',()=>{
    const now=query('flannery-defeated');expect(checkTeam(now,['lileep','anorith'],'current-progress').feasible).toBe(false);expect(checkTeam(now,['lileep','anorith'],'whole-game').feasible).toBe(true);expect(checkTeam(late,['lileep','anorith'],'current-progress').feasible).toBe(true);
  });
  it('keeps player trades blocked and Johto starters gated by the Hoenn Dex',()=>{
    expect(late.entries.alakazam.status).toBe('blocked');expect(late.entries.chikorita.status).toBe('blocked');expect(late.entries.chikorita.blockers.some(b=>b.relatedId==='hoenn-dex')).toBe(true);expect(late.entries.meowth.status).toBe('available');expect(late.levelLimit).toBeNull();
  });
  it('has grounded, resolvable breeding witnesses',()=>{
    for(const path of Object.values(late.paths))for(const step of path.breedingSteps)for(const parent of step.parents){expect(late.paths[parent.pathId],parent.pathId).toBeDefined();expect(late.paths[parent.pathId].pokemonId).toBe(parent.pokemonId);}
  });
  it('limits the chosen roaming legendary and makes normal postgame areas accessible',()=>{
    expect(checkTeam(late,['latias','latios'],'current-progress').feasible).toBe(false);for(const id of ['kyogre','groudon','rayquaza','beldum','ditto','smeargle','shuckle','houndour'])expect(late.entries[id].status,id).toBe('available');
  });
});
