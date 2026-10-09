import { describe, expect, it } from 'vitest';
import { rawDataset } from '../src/data/load-dataset';
import { validateDataset } from '../src/data/validate-dataset';
import type { Dataset } from '../src/domain/types';

function changed(edit:(data:Dataset)=>void) {const data=structuredClone(rawDataset) as Dataset;edit(data);return validateDataset(data);}
function messages(result:ReturnType<typeof validateDataset>) {return result.ok?[]:result.error.map(e=>e.message);}
describe('Data validation',()=>{
  it('validates the complete local dataset',()=>{expect(validateDataset(rawDataset).ok).toBe(true);});
  it('rejects an invalid shape with a record and field path',()=>{
    const result=changed(d=>d.games[0].sources[0].level={kind:'fixed',value:101});expect(result.ok).toBe(false);if(!result.ok){expect(result.error.some(e=>e.recordId!==null)).toBe(true);expect(result.error.some(e=>e.fieldPath.startsWith('data/games/emerald/sources.json/'))).toBe(true);}
  });
  it('rejects duplicate IDs and Dex numbers',()=>{expect(messages(changed(d=>d.pokemon[1].nationalDex=1)).join()).toContain('Duplicate');expect(messages(changed(d=>d.games[0].sources[1].id=d.games[0].sources[0].id)).join()).toContain('Duplicate');});
  it('rejects unknown cross references and review references',()=>{expect(messages(changed(d=>d.games[0].sources[0].locationId='missing')).join()).toContain('Unknown location');expect(messages(changed(d=>d.pokemon[0].review.referenceIds=['missing'])).join()).toContain('Unknown review');});
  it('rejects milestone cycles and unrooted progress',()=>{expect(messages(changed(d=>d.games[0].milestones[0].previousIds=['route-102'])).join()).toContain('cycle');expect(messages(changed(d=>d.games[0].milestones[1].previousIds=[])).join()).toContain('rooted');});
  it('rejects missing game profiles and incomplete type charts',()=>{expect(messages(changed(d=>d.games[0].profiles.pop())).join()).toContain('Missing game profile');expect(messages(changed(d=>d.games[0].typeChart.matrix[0].pop())).join()).toContain('square and complete');});
  it('rejects reversed levels and impossible fixed genders',()=>{
    expect(messages(changed(d=>d.games[0].sources[0].level={kind:'range',minimum:20,maximum:2})).join()).toContain('reversed');expect(messages(changed(d=>d.games[0].sources.find(s=>s.pokemonId==='beldum')!.genders=['female'])).join()).toContain('Source genders');
  });
  it('checks offered species, fossil consumption, and fishing equipment',()=>{
    expect(messages(changed(d=>{const s=d.games[0].sources.find(s=>s.id==='trade-seedot')!;s.level={kind:'match-traded-pokemon',pokemonId:'abra'};})).join()).toContain('different offered');
    expect(messages(changed(d=>d.games[0].sources.find(s=>s.details.kind==='fossil')!.requirements={kind:'all',requirements:[]})).join()).toContain('consume its fossil');
    expect(messages(changed(d=>d.games[0].sources.find(s=>s.details.kind==='wild'&&s.details.method==='old-rod')!.requirements={kind:'all',requirements:[]})).join()).toContain('explicit capability');
  });
  it('checks breeding rules, held items, and the Emerald hatch level',()=>{
    expect(messages(changed(d=>d.games[0].sources.find(s=>s.details.kind==='breeding')!.level={kind:'fixed',value:1})).join()).toContain('level 5');
    expect(messages(changed(d=>d.games[0].sources.find(s=>s.id==='breed-azurill-azurill')!.requirements={kind:'capability',id:'day-care'})).join()).toContain('held item');
  });
  it('rejects missing grounded outcomes and invalid gender transitions',()=>{
    expect(messages(changed(d=>{const g=d.games[0];g.exclusions=g.exclusions.filter(e=>e.pokemonId!=='bulbasaur');})).join()).toContain('grounded');
    expect(messages(changed(d=>d.games[0].evolutions.find(e=>e.id==='azurill-to-marill')!.genderTransitions=[{from:'genderless',to:'male'}])).join()).toContain('gender transition');
  });
  it('rejects capability cycles and impossible choice limits',()=>{expect(messages(changed(d=>d.games[0].capabilities[0].requirements={kind:'capability',id:d.games[0].capabilities[0].id})).join()).toContain('cycle');expect(messages(changed(d=>d.games[0].choices[0].maximumSelections=10)).join()).toContain('Choice limit');});
});
