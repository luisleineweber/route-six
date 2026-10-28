import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import { formChangePaths } from '../src/domain/availability/form-changes';
import { solve } from '../src/domain/availability/solve';
import { checkTeam } from '../src/domain/team/check-team';
import { validateDataset } from '../src/data/validate-dataset';
import { dataset } from './local-data';
import { fixture, milestone, none, review, source } from './fixtures';

function fusionFixture() {
  const { data, game } = fixture([]);
  const black2 = dataset.games.find(game => game.game.id === 'black-2')!;
  game.game.generation = 5;
  game.game.breeding = { hatchLevel: 1 };
  data.pokemon = dataset.pokemon.filter(pokemon => ['kyurem', 'zekrom'].includes(pokemon.id));
  game.profiles = structuredClone(black2.profiles.filter(profile => ['kyurem', 'zekrom'].includes(profile.pokemonId)));
  for (const profile of game.profiles) delete profile.regionalDex;
  const kyurem = game.profiles.find(profile => profile.pokemonId === 'kyurem')!;
  kyurem.forms = [{ formId: 'kyurem-black', types: ['dragon', 'ice'],
    spriteSrc: kyurem.spriteSrc, genders: kyurem.genders, breeding: kyurem.breeding, review }];
  data.forms = [{ id: 'kyurem-black', pokemonId: 'kyurem', name: 'Black Kyurem', introducedGeneration: 5, review }];
  source(game, 'kyurem-capture', 'kyurem', 70, none, { maxUses: 1 });
  source(game, 'zekrom-capture', 'zekrom', 70, milestone('future'), { maxUses: 1 });
  game.items = [{ id: 'dna-splicers', name: 'DNA Splicers', review, sources: [
    { id: 'dna-splicers-gift', locationId: 'field', requirements: milestone('gate'), maxUses: 1, choice: null, review },
  ] }];
  game.formChanges = [{ id: 'fuse', pokemonId: 'kyurem', fromFormId: null, toFormId: 'kyurem-black',
    heldItemId: null, fusionPartnerPokemonId: 'zekrom',
    requirements: { kind: 'item', id: 'dna-splicers', consumed: false, quantity: 1 }, review },
  { id: 'separate', pokemonId: 'kyurem', fromFormId: 'kyurem-black', toFormId: null,
    heldItemId: null, requirements: none, review }];
  return { data, game };
}

describe('Persistent fusion forms', () => {
  it('requires the partner and the item, then reserves that actual individual', () => {
    const { data, game } = fusionFixture();
    expect(validateDataset(data).ok).toBe(true);
    const early = getAvailability(data, { gameId: game.game.id, milestoneId: 'gate', respectLevelLimit: false });
    const late = getAvailability(data, { gameId: game.game.id, milestoneId: 'future', respectLevelLimit: false });
    if (!early.ok || !late.ok) throw new Error('Fusion fixture failed');
    expect(early.value.entries['kyurem-black'].status).toBe('later');
    expect(late.value.entries['kyurem-black'].status).toBe('available');
    expect(checkTeam(late.value, ['kyurem-black', 'zekrom'], 'current-progress').feasible).toBe(false);
    expect(checkTeam(late.value, ['kyurem', 'zekrom'], 'current-progress').feasible).toBe(true);
    expect(checkTeam(late.value, ['kyurem-black', 'kyurem'], 'current-progress').feasible).toBe(false);
    const path = late.value.paths[late.value.entries['kyurem-black'].currentPathIds[0]];
    expect(path.sourceIds).toContain('zekrom-capture');
  });

  it('permits another partner copy when its source is repeatable', () => {
    const { data, game } = fusionFixture();
    game.sources.find(source => source.id === 'zekrom-capture')!.maxUses = null;
    const result = getAvailability(data, { gameId: game.game.id, milestoneId: 'future', respectLevelLimit: false });
    if (!result.ok) throw new Error('Fusion fixture failed');
    expect(checkTeam(result.value, ['kyurem-black', 'zekrom'], 'current-progress').feasible).toBe(true);
  });

  it('releases the stored partner when separating a fusion proof', () => {
    const { game } = fusionFixture();
    const ctx = solve(game, game.milestones.find(point => point.id === 'future')!, false);
    const fused = ctx.paths.get('kyurem-black')![0];
    // Exercise separation directly. Ordinary access also retains the earlier base proof.
    ctx.paths = new Map([['kyurem-black', [{ ...fused, ancestors: [] }]]]);
    const separated = formChangePaths(ctx).find(path => path.formId === null)!;
    expect(separated).toBeDefined();
    const partner = separated.individuals.find(individual => individual.origin === 'source:zekrom-capture');
    expect(partner?.use).toBe('retain');
    expect(partner?.storedByOrigin).toBeUndefined();
  });

  it('rejects an unknown partner and a self fusion', () => {
    const { data, game } = fusionFixture();
    game.formChanges![0].fusionPartnerPokemonId = 'reshiram';
    expect(validateDataset(data).ok).toBe(false);
    game.formChanges![0].fusionPartnerPokemonId = 'kyurem';
    expect(validateDataset(data).ok).toBe(false);
  });
});
