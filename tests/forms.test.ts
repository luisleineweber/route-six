import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getAvailability } from '../src/domain/availability';
import { analyzeTypes } from '../src/domain/team/analyze-types';
import { checkTeam } from '../src/domain/team/check-team';
import { validateDataset } from '../src/data/validate-dataset';
import { dataset } from './local-data';
import type { PokemonProfile } from '../src/domain/types';
import { evolution, fixture, milestone, none, review, source } from './fixtures';
import { buildTeamExport } from '../src/features/export/export-model';
import { createInitialState } from '../src/features/planner/state';
import { TeamSlots } from '../src/features/team/TeamSlots';
import { TypeAnalysis } from '../src/features/team/TypeAnalysis';
import { GameContext } from '../src/features/planner/GameContext';
import { AcquisitionPathBody } from '../src/components/AcquisitionPathBody';
import { progressContent } from '../src/features/export/progress-content';
import { solve } from '../src/domain/availability/solve';

function formFixture() {
  const { data, game } = fixture([]);
  const platinum = dataset.games.find(game => game.game.id === 'platinum')!;
  data.pokemon = dataset.pokemon.filter(pokemon => ['burmy', 'wormadam'].includes(pokemon.id));
  game.game.generation = 4;
  game.profiles = structuredClone(platinum.profiles.filter(profile => ['burmy', 'wormadam'].includes(profile.pokemonId)));
  for (const profile of game.profiles) delete profile.regionalDex;
  data.forms = [
    { id: 'burmy-trash', pokemonId: 'burmy', name: 'Trash Cloak', introducedGeneration: 4, review },
    { id: 'wormadam-trash', pokemonId: 'wormadam', name: 'Trash Cloak', introducedGeneration: 4, review },
  ];
  const form = (profile: PokemonProfile, formId: string) => ({ formId, types: profile.types,
    spriteSrc: profile.spriteSrc, genders: profile.genders, breeding: profile.breeding, review });
  game.profiles[0].forms = [form(game.profiles[0], 'burmy-trash')];
  game.profiles[1].forms = [{ ...form(game.profiles[1], 'wormadam-trash'), types: ['bug', 'steel'] }];
  source(game, 'burmy-tree', 'burmy', 5, none, { genders: ['female'], maxUses: 1 });
  game.formChanges = [{ id: 'burmy-trash-cloak', pokemonId: 'burmy', fromFormId: null,
    toFormId: 'burmy-trash', heldItemId: null, requirements: milestone('gate'), review }];
  evolution(game, 'burmy', 'wormadam', 20, { genderTransitions: [{ from: 'female', to: 'female' }] });
  evolution(game, 'burmy', 'wormadam', 20, { id: 'burmy-trash-to-wormadam-trash', fromFormId: 'burmy-trash',
    toFormId: 'wormadam-trash', genderTransitions: [{ from: 'female', to: 'female' }] });
  return { data, game };
}

function query(milestoneId: string) {
  const { data, game } = formFixture();
  const checked = getAvailability(data, { gameId: game.game.id, milestoneId, respectLevelLimit: true });
  if (!checked.ok) throw new Error(JSON.stringify(checked.error));
  return { ...checked.value, game };
}

describe('Species forms', () => {
  it('keeps East Sea Shellos form when it evolves in the actual Platinum data', () => {
    const full = dataset.games.find(game => game.game.id === 'platinum')!;
    const east = full.sources.find(source => source.pokemonId === 'shellos'
      && source.formId === 'shellos-east' && source.details.kind === 'wild'
      && source.details.method === 'grass')!;
    const game = { ...full, sources: [east], items: [], breedingRules: [], formChanges: [],
      evolutions: full.evolutions.filter(edge => edge.fromPokemonId === 'shellos') };
    const context = solve(game, game.milestones.find(row => row.id === 'hall-of-fame')!, false,
      new Set(game.milestones.map(row => row.id)));
    expect(context.paths.has('shellos-east')).toBe(true);
    expect(context.paths.has('gastrodon-east')).toBe(true);
    expect(context.paths.has('gastrodon')).toBe(false);
    expect(context.paths.get('gastrodon-east')!.every(path => path.minimumLevel >= 30)).toBe(true);
  });
  it('uses the selected form image, name, and types in the team and export', () => {
    const game = dataset.games.find(game=>game.game.id==='platinum')!;
    const state = createInitialState(game);
    state.team[0] = 'wormadam-trash';
    const output = buildTeamExport(game, state, false, null);
    expect(output.slots[0]).toMatchObject({ name: 'Wormadam (Trash Cloak)', dex: 413,
      spriteSrc: '/pokemon/wormadam-trash.png', types: ['bug', 'steel'] });
    const html = renderToStaticMarkup(createElement(GameContext, {value:game}, createElement(TeamSlots, {
      team:state.team,snapshot:null,progressPage:false,activeSlot:null,onChoose:()=>{},onRemove:()=>{},onDetails:()=>{},
    })));
    expect(html).toContain('Wormadam (Trash Cloak)');
    expect(html).toContain('/pokemon/wormadam-trash.png');
    expect(html).toContain('/types/steel.svg');
    const analysis = renderToStaticMarkup(createElement(GameContext, {value:game},
      createElement(TypeAnalysis, {team:state.team})));
    expect(analysis).toContain('Wormadam (Trash Cloak)');
  });
  it('keeps one species identity and checks each form reference', () => {
    const { data } = formFixture();
    expect(data.pokemon.filter(pokemon => pokemon.nationalDex === 413)).toHaveLength(1);
    expect(validateDataset(data).ok).toBe(true);
    data.forms![1].pokemonId = 'burmy';
    const result = validateDataset(data);
    expect(result.ok).toBe(false);
  });

  it('keeps a form change behind its own story gate', () => {
    const early = query('start');
    expect(early.entries.burmy.status).toBe('available');
    expect(early.entries['burmy-trash'].status).toBe('later');
    const later = query('gate');
    const path = later.paths[later.entries['burmy-trash'].currentPathIds[0]];
    expect(path.pokemonId).toBe('burmy');
    expect(path.formId).toBe('burmy-trash');
    expect(path.minimumLevel).toBe(5);
    expect(path.formChangeIds).toEqual(['burmy-trash-cloak']);
  });

  it('uses the selected form for evolution and type analysis', () => {
    const later = query('gate');
    const path = later.paths[later.entries['wormadam-trash'].currentPathIds[0]];
    expect(path.pokemonId).toBe('wormadam');
    expect(path.formId).toBe('wormadam-trash');
    expect(path.minimumLevel).toBe(20);
    const plant = analyzeTypes(later.game, ['wormadam']);
    const trash = analyzeTypes(later.game, ['wormadam-trash']);
    expect(plant.weaknesses.poison).toBe(1);
    expect(trash.immunities.poison).toBe(1);
    const html = renderToStaticMarkup(createElement(GameContext, {value:later.game},
      createElement(AcquisitionPathBody, {path,snapshot:later})));
    expect(html).toContain('Burmy (Trash Cloak)');
    expect(html).toContain('Wormadam (Trash Cloak)');
    expect(progressContent(later.game,later,'wormadam-trash').stages.at(-1)?.name).toBe('Wormadam (Trash Cloak)');
  });

  it('does not use one finite animal for two team forms', () => {
    const later = query('gate');
    expect(checkTeam(later, ['wormadam', 'wormadam-trash'], 'current-progress').feasible).toBe(false);
  });

  it('needs a separate held item for each active team form', () => {
    const { data, game } = formFixture();
    game.sources[0].maxUses = null;
    game.items.push({ id: 'form-item', name: 'Form item', review,
      sources: [{ id: 'form-item-gift', locationId: 'field', requirements: none, maxUses: 1, choice: null, review }] });
    game.formChanges![0].heldItemId = 'form-item';
    const checked = getAvailability(data, { gameId: game.game.id, milestoneId: 'gate', respectLevelLimit: true });
    if (!checked.ok) throw new Error(JSON.stringify(checked.error));
    expect(checkTeam(checked.value, ['burmy-trash'], 'current-progress').feasible).toBe(true);
    expect(checkTeam(checked.value, ['burmy-trash', 'burmy-trash'], 'current-progress').feasible).toBe(false);
  });

  it('rejects a form assigned to the wrong source species', () => {
    const { data, game } = formFixture();
    game.sources[0].formId = 'wormadam-trash';
    expect(validateDataset(data).ok).toBe(false);
  });

  it('uses only the listed parent forms for a form-specific Egg source', () => {
    const { data, game } = formFixture();
    game.formChanges![0].requirements = milestone('future');
    source(game, 'burmy-male', 'burmy', 5, none, { genders: ['male'] });
    game.breedingRules.push({ id: 'trash-egg-rule', parentPokemonIds: [], parentFormIds: ['burmy-trash'],
      offspringPokemonIds: ['burmy'], requiredHeldItemId: null, review });
    source(game, 'trash-egg', 'burmy', 5, {kind:'capability',id:'day-care'}, {
      formId:'burmy-trash', details:{kind:'breeding',ruleId:'trash-egg-rule',capabilityId:'day-care'},
    });
    expect(validateDataset(data).ok).toBe(true);
    const early = getAvailability(data, {gameId:game.game.id,milestoneId:'gate',respectLevelLimit:true});
    const late = getAvailability(data, {gameId:game.game.id,milestoneId:'future',respectLevelLimit:true});
    if (!early.ok || !late.ok) throw new Error('Fixture query failed');
    expect(early.value.entries['burmy-trash'].currentPathIds).toHaveLength(0);
    const bred = late.value.entries['burmy-trash'].currentPathIds.map(id=>late.value.paths[id])
      .find(path=>path.breedingSteps[0]?.sourceId==='trash-egg');
    expect(bred).toBeDefined();
    late.value.entries['burmy-trash'].currentPathIds = [bred!.id];
    expect(progressContent(game,late.value,'burmy-trash').acquisition.join(' ')).toContain('Burmy (Trash Cloak)');
  });
});
