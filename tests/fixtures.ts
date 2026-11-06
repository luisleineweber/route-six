import { dataset } from './local-data';
import type { Dataset, Evolution, GameData, PokemonSource, Requirement } from '../src/domain/types';

export const none: Requirement = {kind:'all',requirements:[]};
export const review = {referenceIds:['species'],checkedOn:'2026-10-07'};
export const milestone = (id:string): Requirement => ({kind:'milestone',id});
export const capability = (id:string): Requirement => ({kind:'capability',id});

export function fixture(ids:string[]): {data:Dataset; game:GameData} {
  const game:GameData = {
    game:{id:'emerald',name:'Test Emerald',generation:3,region:'Hoenn',firstMilestoneId:'start',planner:{defaultMilestoneId:'gate',checkpoints:[{milestoneId:'gate',label:'Gate',title:'Gate',detail:'Before the next task',typeId:null}]},breeding:{hatchLevel:5},review},
    profiles: structuredClone(dataset.games[0].profiles.filter(p=>ids.includes(p.pokemonId))), typeChart:dataset.games[0].typeChart,
    milestones:[
      {id:'start',name:'Start',kind:'story',phase:'main-story',displayOrder:0,previousIds:[],locationId:null,nextBossId:'first',review},
      {id:'gate',name:'Gate',kind:'story',phase:'main-story',displayOrder:2,previousIds:['start'],locationId:null,nextBossId:'second',review},
      {id:'future',name:'Future',kind:'story',phase:'main-story',displayOrder:3,previousIds:['gate'],locationId:null,nextBossId:'third',review},
      {id:'optional',name:'Optional',kind:'area',phase:'main-story',displayOrder:1,previousIds:['future'],locationId:null,nextBossId:'third',review},
      {id:'end',name:'End',kind:'story',phase:'post-game',displayOrder:4,previousIds:['future'],locationId:null,nextBossId:null,review},
    ],
    bosses:[{id:'first',name:'First',kind:'gym',highestLevel:15,badgeNumber:1,specialtyTypeId:'rock',review},{id:'second',name:'Second',kind:'gym',highestLevel:24,badgeNumber:2,specialtyTypeId:'fighting',review},{id:'third',name:'Third',kind:'gym',highestLevel:50,badgeNumber:3,specialtyTypeId:'electric',review}],
    locations:[{id:'field',name:'Field',requirements:milestone('start'),review}],
    capabilities:[{id:'old-rod',name:'Old Rod',requirements:milestone('gate'),review},{id:'day-care',name:'Day Care',requirements:milestone('gate'),review},{id:'friendship',name:'Friendship',requirements:none,review}],
    items:[],choices:[],sources:[],breedingRules:[],evolutions:[],exclusions:[],
  };
  return {game,data:{schemaVersion:2,references:dataset.references,pokemon:dataset.pokemon.filter(p=>ids.includes(p.id)),games:[game]}};
}

export function source(game:GameData,id:string,pokemonId:string,level=5,requirements:Requirement=none,extra:Partial<PokemonSource>={}): PokemonSource {
  const value:PokemonSource={id,pokemonId,locationId:'field',requirements,level:{kind:'fixed',value:level},genders:game.profiles.find(p=>p.pokemonId===pokemonId)!.genders,maxUses:null,choice:null,details:{kind:'gift'},review,...extra};
  game.sources.push(value);return value;
}
export function evolution(game:GameData,from:string,to:string,level:number|null,extra:Partial<Evolution>={}): Evolution {
  const value:Evolution={id:from+'-to-'+to,fromPokemonId:from,toPokemonId:to,trigger:'level-up',minimumLevel:level,itemId:null,conditions:[],genderTransitions:null,requirements:none,coProductIds:[],review,...extra};
  game.evolutions.push(value);return value;
}
export function breed(game:GameData,id:string,parents:string[],offspring:string,held:string|null=null) {
  game.breedingRules.push({id,parentPokemonIds:parents,offspringPokemonIds:[offspring],requiredHeldItemId:held,review});
  source(game,id+'-egg',offspring,5,{kind:'all',requirements:[capability('day-care'),...(held?[{kind:'item' as const,id:held,quantity:1,consumed:false}]:[])]},{details:{kind:'breeding',ruleId:id,capabilityId:'day-care'}});
}
