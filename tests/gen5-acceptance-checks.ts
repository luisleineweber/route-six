import assert from 'node:assert/strict';
import type { AvailabilitySnapshot, GameData } from '../src/domain/types';
import { solve } from '../src/domain/availability/solve';
import { checkTeam } from '../src/domain/team/check-team';
import type { AccessContext } from '../src/domain/availability/context';
import { leaves } from '../src/domain/requirements';

export function checkGen5Game(game: GameData) {
  const id = game.game.id;
  const sequel = id.endsWith('-2');
  const black = id.startsWith('black');
  const cache = new Map<string, AccessContext>();
  const at = (point: string, capped = true) => {
    const key = `${point}:${capped}`;
    if (!cache.has(key)) cache.set(key, solve(game, game.milestones.find(m => m.id === point)!, capped));
    return cache.get(key)!;
  };
  const has = (point: string, pokemon: string, capped = true) => at(point, capped).paths.has(pokemon);
  const snapshot = (point: string): AvailabilitySnapshot => {
    const ctx = at(point);
    const result: AvailabilitySnapshot = { query: { gameId: id, milestoneId: point, respectLevelLimit: true },
      levelLimit: null, entries: {}, paths: {}, choiceGroups: game.choices, resourceLimits: ctx.resourceLimits };
    for (const [selection, paths] of ctx.paths) {
      for (const path of paths) result.paths[path.id] = path;
      result.entries[selection] = { pokemonId: paths[0].pokemonId, status: 'available',
        currentPathIds: paths.map(p => p.id), futurePathIds: [], firstMilestoneIds: [], blockers: [] };
    }
    return result;
  };
  const team = (point: string, slots: string[]) => checkTeam(snapshot(point), slots, 'current-progress').feasible;
  const points = game.game.planner!.checkpoints;
  const expectedCaps = sequel ? [13, 18, 24, 30, 33, 39, 48, 51, 58] : [14, 20, 23, 27, 31, 35, 39, 43, 50];
  assert.equal(points.length, 9);
  assert.equal(game.profiles.length, 649);
  assert.equal(game.profiles.filter(p => p.regionalDex !== undefined).length, sequel ? 301 : 156);
  const checkpoints = points.map((point, index) => {
    const ctx = at(point.milestoneId);
    assert.equal(ctx.limit, expectedCaps[index], `${id} ${point.milestoneId} cap`);
    assert(ctx.paths.has('snivy'), `${id} starter at ${point.milestoneId}`);
    assert(!ctx.paths.has('mew'), `${id} external Mew at ${point.milestoneId}`);
    assert(!ctx.paths.has('conkeldurr'), `${id} blocked player trade at ${point.milestoneId}`);
    assert(!ctx.paths.has('landorus'), `${id} external Landorus at ${point.milestoneId}`);
    assert(!ctx.paths.has('regigigas'), `${id} external party member at ${point.milestoneId}`);
    return { milestone: point.milestoneId, cap: ctx.limit, available: ctx.paths.size };
  });
  for (const [parent, move, level] of [['lickitung', 'rollout', 33], ['tangela', 'ancient-power', sequel ? 40 : 36],
    ['aipom', 'double-hit', 32], ['yanma', 'ancient-power', 33], ['piloswine', 'ancient-power', 1],
    ['bonsly', 'mimic', sequel ? 33 : 17], ['mime-jr', 'mimic', sequel ? 15 : 18]] as const) {
    const condition = game.evolutions.find(e => e.fromPokemonId === parent)!.conditions.find(c => c.kind === 'known-move');
    assert(condition?.kind === 'known-move');
    assert.equal(condition.moveId, move);
    assert.deepEqual(condition.learning.find(route => route.kind === 'level-up'), { kind: 'level-up', level });
  }
  assert(!game.evolutions.some(e => e.conditions.some(c => c.kind === 'beauty')));
  assert(game.evolutions.find(e => e.fromPokemonId === 'azurill')!.genderTransitions?.some(t => t.from === 'female' && t.to === 'male'));
  assert(game.evolutions.some(e => e.fromPokemonId === 'feebas' && e.trigger === 'player-trade' && e.itemId === 'prism-scale'));
  if (!sequel) {
    assert(has('striaton', 'patrat'));
    assert(!has('striaton', 'munna', false));
    assert(has('nacrene', 'munna'));
    assert(has('nacrene', 'tympole'));
    assert(!has('nacrene', 'sewaddle', false));
    assert(has('castelia-plasma', 'sewaddle'));
    assert(has('castelia-plasma', 'darumaka'));
    assert(!has('castelia-plasma', 'yamask', false));
    assert(has('nimbasa', 'yamask'));
    assert(has('nimbasa', 'tirtouga') && has('nimbasa', 'archen'));
    assert(!team('nimbasa', ['tirtouga', 'archen']));
    assert(has('cold-storage-clear', 'deerling'));
    assert(!has('cold-storage-clear', 'joltik', false));
    assert(has('celestial-bell', 'joltik'));
    assert(!has('celestial-bell', 'frillish', false));
    assert(has('icirrus', 'frillish'));
    assert(!has('icirrus', 'golett', false));
    assert(has('opelucid', 'golett'));
    assert(has('opelucid', 'cobalion'));
    const darkDreamyard = new Set(game.sources.filter(s => s.locationId === 'area-579'
      && s.details.kind === 'wild' && s.details.method === 'dark-grass').map(s => s.id));
    assert(![...at('victory-road', false).paths.values()].flat().some(p => p.sourceIds.some(id => darkDreamyard.has(id))));
    const basculin = black ? 'basculin' : 'basculin-blue-striped';
    assert(!team('cold-storage-clear', [basculin, basculin]));
    assert(team('icirrus', [basculin, basculin]));
    assert(!team('castelia-plasma', ['snivy', 'snivy']));
    assert(team('nimbasa', ['snivy', 'snivy']));
    assert(!has('national-dex', 'zorua'));
    assert.equal(has('national-dex', 'ralts'), !black);
    assert.equal(game.sources.some(s => s.details.kind === 'white-forest'), !black);
    if (!black) {
      const residents = game.choices.find(c => c.id === 'white-forest-residents')!;
      assert.equal(residents.maximumSelections, 10);
      assert.equal(residents.options.length, 30);
      assert(has('national-dex', 'wooper'));
    }
  } else {
    assert(has('aspertia-gym', 'riolu'));
    assert(has('virbank', black ? 'magby' : 'elekid'));
    assert(!has('virbank', black ? 'elekid' : 'magby', false));
    assert(has('sewers-clear', 'zubat') && has('sewers-clear', 'eevee'));
    assert(has('nimbasa', black ? 'mandibuzz' : 'braviary'));
    const tutorial = game.sources.find(s => s.details.kind === 'hidden-grotto' && s.details.mode === 'first-visit')!;
    assert.deepEqual(tutorial.genders, ['male']);
    assert(at('nimbasa').paths.get('minccino')!.some(p => p.sourceIds.includes(tutorial.id)));
    assert(has('driftveil', 'magnezone'));
    assert(has('driftveil', 'zorua') && has('driftveil', 'zoroark'));
    assert(!team('driftveil', ['zorua', 'zoroark']));
    assert(has('driftveil', 'nosepass') && has('driftveil', 'probopass'));
    const lowerCave = new Set(game.sources.filter(s => ['area-591', 'area-592'].includes(s.locationId)).map(s => s.id));
    assert(![...at('driftveil', false).paths.values()].flat().some(p => p.sourceIds.some(id => lowerCave.has(id))));
    assert(!has('driftveil', 'volcarona', false));
    assert(has('mistralton', 'volcarona') && has('mistralton', 'nosepass'));
    assert(has('opelucid', 'cobalion') && has('opelucid', 'virizion'));
    assert(!has('humilau', 'terrakion', false));
    assert(has('victory-road', 'terrakion'));
    assert(!team('victory-road', ['snivy', 'snivy']));
    assert(team('national-dex', ['snivy', 'snivy']));
    const route15 = new Set(game.sources.filter(s => s.locationId === 'unova-route-15'
      || leaves(game.locations.find(l => l.id === s.locationId)!.requirements)
        .some(r => r.kind === 'location' && r.id === 'unova-route-15')).map(s => s.id));
    assert(route15.size > 0);
    assert(![...at('victory-road', false).paths.values()].flat().some(p => p.sourceIds.some(id => route15.has(id))));
    assert(!has('victory-road', 'meowth', false));
    const full = at('national-dex');
    assert(full.paths.has('meowth') && full.paths.has('mankey'));
    assert(full.paths.has(black ? 'registeel' : 'regice'));
    assert(!full.paths.has(black ? 'regice' : 'registeel'));
    const fusion = black ? 'kyurem-black' : 'kyurem-white';
    const partner = black ? 'zekrom' : 'reshiram';
    assert(full.paths.has(fusion));
    assert(!full.paths.has(black ? 'kyurem-white' : 'kyurem-black'));
    assert(!team('national-dex', [fusion, partner]));
    assert(team('national-dex', ['kyurem', partner]));
    assert(!team('national-dex', ['meowth', 'mankey']));
    assert(team('national-dex', ['meowth', 'meowth']));
    const mienfoo = game.sources.find(s => s.pokemonId === 'mienfoo' && s.details.kind === 'hidden-grotto')!;
    assert.deepEqual(mienfoo.level, { kind: 'range', minimum: 40, maximum: 44 });
    const phone = game.sources.filter(s => s.details.kind === 'game-trade' && s.details.offeredPokemonId === null);
    assert.equal(phone.length, 24);
    assert(phone.every(s => s.maxUses === null));
    assert.equal(game.sources.filter(s => s.details.kind === 'hidden-grotto' && s.details.mode === 'funfest').length, 20);
    assert(game.sources.filter(s => s.encounterConditions?.some(c => c.kind === 'funfest'))
      .every(s => s.maxUses === null));
  }
  const full = at('national-dex');
  assert(game.exclusions.every(e => !full.paths.has(e.pokemonId)));
  const conditional = sequel ? 'regigigas' : 'landorus';
  assert.deepEqual(game.profiles.filter(p => !full.paths.has(p.pokemonId)
    && !game.exclusions.some(e => e.pokemonId === p.pokemonId)).map(p => p.pokemonId), [conditional]);
  return { game: id, checkpoints, finalAvailable: full.paths.size };
}
