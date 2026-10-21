import { describe, expect, it } from 'vitest';
import { getAvailability } from '../src/domain/availability';
import { validateDataset } from '../src/data/validate-dataset';
import { findConflict } from '../src/domain/team/resources';
import { progressContent } from '../src/features/export/progress-content';
import { evolutionLabels } from '../src/components/evolution-presentation';
import type { Dataset, EvolutionCondition, GameData } from '../src/domain/types';
import type { ProofPath } from '../src/domain/proofs';
import { evolution, fixture, milestone, none, review, source } from './fixtures';

function gen6(ids: string[]) {
  const result = fixture(ids);
  result.game.game.generation = 6;
  result.game.typeChart = structuredClone(result.game.typeChart);
  for (const profile of result.game.profiles) delete profile.regionalDex;
  return result;
}

function query(data: Dataset, milestoneId = 'start') {
  const result = getAvailability(data, { gameId: 'emerald', milestoneId, respectLevelLimit: false });
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}

function setType(game: GameData, pokemonId: string, typeId: string) {
  game.profiles.find(profile => profile.pokemonId === pokemonId)!.types = [typeId];
}

function pathFor(data: Dataset, pokemonId: string, at = 'start') {
  const snapshot = query(data, at);
  const entry = snapshot.entries[pokemonId];
  return { snapshot, path: snapshot.paths[entry.currentPathIds[0] ?? entry.futurePathIds[0]] };
}

describe('Generation VI evolution actions', () => {
  it('requires an accessible retained species of the requested party type', () => {
    const { data, game } = gen6(['ralts', 'kirlia', 'magikarp']);
    setType(game, 'ralts', 'fighting');
    setType(game, 'magikarp', 'dark');
    source(game, 'parent', 'ralts', 5, none, { maxUses: 1 });
    game.exclusions.push({ pokemonId: 'magikarp', reason: 'other-version', explanation: 'The Dark partner is unavailable.', review });
    game.capabilities.push({ id: 'dark-party', name: 'Dark Pokémon in party', requirements: none, review });
    evolution(game, 'ralts', 'kirlia', null, { conditions: [{ kind: 'party-type', typeId: 'dark' }] });
    const checked = validateDataset(data);
    expect(checked.ok, JSON.stringify(checked)).toBe(true);
    const early = query(data);
    expect(early.entries.kirlia.status).toBe('blocked');
    expect(early.entries.kirlia.blockers.some(blocker => blocker.code === 'condition')).toBe(true);
  });

  it('waits for a future compatible partner and retains its real source', () => {
    const { data, game } = gen6(['ralts', 'kirlia', 'magikarp']);
    setType(game, 'ralts', 'fighting');
    setType(game, 'magikarp', 'dark');
    source(game, 'parent', 'ralts');
    source(game, 'dark-partner', 'magikarp', 5, milestone('future'), { maxUses: 1 });
    evolution(game, 'ralts', 'kirlia', null, { conditions: [{ kind: 'party-type', typeId: 'dark' }] });
    expect(query(data).entries.kirlia.status).toBe('later');
    const later = query(data, 'future');
    expect(later.entries.kirlia.status).toBe('available');
    const result = pathFor(data, 'kirlia', 'future');
    expect(result.path.sourceIds).toContain('dark-partner');
    expect(result.path.claims).toContainEqual({ resourceId: 'source:dark-partner', quantity: 1, use: 'retain' });
  });

  it('matches the selected form type and excludes the evolving species itself', () => {
    const { data, game } = gen6(['ralts', 'kirlia', 'magikarp', 'pikachu']);
    setType(game, 'ralts', 'dark');
    setType(game, 'pikachu', 'dark');
    game.exclusions.push({ pokemonId: 'pikachu', reason: 'other-version', explanation: 'No Dark partner is available.', review });
    const partner = game.profiles.find(profile => profile.pokemonId === 'magikarp')!;
    partner.types = ['water'];
    data.forms = [{ id: 'dark-form', pokemonId: 'magikarp', name: 'Dark Form', introducedGeneration: 6, review }];
    partner.forms = [{ formId: 'dark-form', types: ['dark'], spriteSrc: partner.spriteSrc,
      genders: partner.genders, breeding: partner.breeding, review }];
    source(game, 'parent', 'ralts');
    source(game, 'base-magikarp', 'magikarp');
    source(game, 'dark-form-source', 'magikarp', 5, none, { formId: 'dark-form' });
    evolution(game, 'ralts', 'kirlia', null, { conditions: [{ kind: 'party-type', typeId: 'dark' }] });
    const checked = validateDataset(data);
    expect(checked.ok, JSON.stringify(checked)).toBe(true);
    const snapshot = query(data);
    expect(snapshot.entries.kirlia.status).toBe('available');
    const result = pathFor(data, 'kirlia');
    expect(result.path.sourceIds).toContain('dark-form-source');
    expect(result.path.claims).toContainEqual({ resourceId: 'source:dark-form-source', quantity: 1, use: 'retain' });
  });

  it('keeps resource and choice conflicts in team checks', () => {
    const { data, game } = gen6(['ralts', 'kirlia', 'magikarp', 'pikachu']);
    setType(game, 'ralts', 'fighting');
    setType(game, 'magikarp', 'dark');
    setType(game, 'pikachu', 'normal');
    source(game, 'parent', 'ralts', 5, none, { maxUses: 1 });
    source(game, 'dark-partner', 'magikarp', 5, none, { maxUses: 1 });
    source(game, 'third-member', 'pikachu', 5, none, { choice: { groupId: 'version-choice', optionId: 'other-version' } });
    game.choices.push({ id: 'version-choice', name: 'Version choice', options: ['dark-partner', 'other-version'], maximumSelections: 1, review });
    game.sources.find(row => row.id === 'dark-partner')!.choice = { groupId: 'version-choice', optionId: 'dark-partner' };
    evolution(game, 'ralts', 'kirlia', null, { conditions: [{ kind: 'party-type', typeId: 'dark' }] });
    const snapshot = query(data);
    const evolutionPath = snapshot.paths[snapshot.entries.kirlia.currentPathIds[0]];
    const parentPath = snapshot.paths[snapshot.entries.ralts.currentPathIds[0]];
    const partnerPath = snapshot.paths[snapshot.entries.magikarp.currentPathIds.find(id => snapshot.paths[id].sourceIds.includes('dark-partner'))!];
    const thirdPath = snapshot.paths[snapshot.entries.pikachu.currentPathIds[0]];
    expect(evolutionPath.claims).toContainEqual({ resourceId: 'source:dark-partner', quantity: 1, use: 'retain' });
    expect(findConflict(snapshot, [evolutionPath, partnerPath])).toBeNull();
    expect(findConflict(snapshot, [evolutionPath, parentPath])).toEqual({ kind: 'finite-resource', id: 'source:parent' });
    expect(findConflict(snapshot, [evolutionPath, thirdPath])).toEqual({ kind: 'choice-conflict', id: 'version-choice' });
  });

  it('keeps affection separate from friendship and records Fairy move learning', () => {
    const { data, game } = gen6(['ralts', 'kirlia']);
    game.typeChart.typeIds = [...game.typeChart.typeIds, 'fairy'];
    for (const row of game.typeChart.matrix) row.push(1);
    game.typeChart.matrix.push(game.typeChart.typeIds.map(() => 1));
    setType(game, 'ralts', 'fairy');
    source(game, 'parent', 'ralts', 5);
    game.capabilities.push({ id: 'affection', name: 'Pokémon-Amie affection', requirements: milestone('future'), review });
    evolution(game, 'ralts', 'kirlia', null, { requirements: { kind: 'capability', id: 'affection' }, conditions: [
      { kind: 'affection', minimum: 50 },
      { kind: 'known-move', moveId: 'fairy-move', moveName: 'Fairy Wind', learning: [{ kind: 'level-up', level: 18 }] },
    ] });
    expect(validateDataset(data).ok).toBe(true);
    expect(query(data).entries.kirlia.status).toBe('later');
    const later = query(data, 'future');
    const path = later.paths[later.entries.kirlia.currentPathIds[0]] as ProofPath;
    expect(path.conditions).toContain('At least two hearts in Pokémon-Amie, then gain a level.');
    expect(path.minimumLevel).toBe(18);
    expect(path.conditions).not.toContain('Raise friendship to 50, then gain a level.');
    const exportDetails = progressContent(game, later, 'kirlia');
    expect(exportDetails.stages.flatMap(stage => stage.conditions).join(' ')).toContain('Pokémon-Amie');
    expect(exportDetails.stages.flatMap(stage => stage.conditions).join(' ')).toContain('Fairy Wind');
  });

  it.each([
    [{ kind: 'weather', weather: 'rain' }, 'rain'],
    [{ kind: 'device-orientation', orientation: 'upside-down' }, 'upside-down'],
  ] as const)('uses an explicit capability and readable detail for %j', (condition, capabilityId) => {
    const { data, game } = gen6(['ralts', 'kirlia']);
    source(game, 'parent', 'ralts');
    game.capabilities.push({ id: capabilityId, name: capabilityId, requirements: milestone('gate'), review });
    evolution(game, 'ralts', 'kirlia', null, { requirements: { kind: 'capability', id: capabilityId }, conditions: [condition as EvolutionCondition] });
    expect(validateDataset(data).ok).toBe(true);
    expect(query(data).entries.kirlia.status).toBe('later');
    const later = query(data, 'gate');
    const path = later.paths[later.entries.kirlia.currentPathIds[0]] as ProofPath;
    expect(path.conditions.join(' ')).toMatch(capabilityId === 'rain' ? /rain/i : /upside-down/i);
    const details = progressContent(game, later, 'kirlia');
    expect(details.stages.flatMap(stage => stage.conditions).join(' ')).toMatch(capabilityId === 'rain' ? /rain/i : /upside-down/i);
    expect(evolutionLabels(game, game.evolutions[0]).join(' ')).toMatch(capabilityId === 'rain' ? /rain/i : /upside-down/i);
  });

  it('rejects friendship as an affection substitute and unrequired action capabilities', () => {
    const affection = gen6(['ralts', 'kirlia']);
    source(affection.game, 'parent', 'ralts');
    evolution(affection.game, 'ralts', 'kirlia', null, { requirements: { kind: 'capability', id: 'friendship' },
      conditions: [{ kind: 'affection', minimum: 50 }] });
    expect(validateDataset(affection.data).ok).toBe(false);

    for (const [condition, capabilityId] of [
      [{ kind: 'weather', weather: 'rain' }, 'rain'],
      [{ kind: 'device-orientation', orientation: 'upside-down' }, 'upside-down'],
    ] as const) {
      const result = gen6(['ralts', 'kirlia']);
      source(result.game, 'parent', 'ralts');
      result.game.capabilities.push({ id: capabilityId, name: capabilityId, requirements: none, review });
      evolution(result.game, 'ralts', 'kirlia', null, { conditions: [condition as EvolutionCondition] });
      expect(validateDataset(result.data).ok).toBe(false);
    }
  });

  it('rejects a self-parent witness and cannot gain a level above level 100', () => {
    const self = gen6(['ralts', 'kirlia']);
    setType(self.game, 'ralts', 'dark');
    source(self.game, 'parent', 'ralts');
    evolution(self.game, 'ralts', 'kirlia', null, { conditions: [{ kind: 'party-type', typeId: 'dark' }] });
    expect(validateDataset(self.data).ok).toBe(false);
    const capped = gen6(['ralts', 'kirlia']);
    source(capped.game, 'parent', 'ralts', 100);
    capped.game.capabilities.push({ id: 'affection', name: 'Pokémon-Amie affection', requirements: none, review });
    evolution(capped.game, 'ralts', 'kirlia', null, { requirements: { kind: 'capability', id: 'affection' }, conditions: [{ kind: 'affection', minimum: 50 }] });
    expect(query(capped.data, 'end').entries.kirlia.status).toBe('blocked');
  });

  it('rejects unknown party types and party-type conditions without a level-up action', () => {
    const unknownType = gen6(['ralts', 'kirlia']);
    source(unknownType.game, 'parent', 'ralts');
    evolution(unknownType.game, 'ralts', 'kirlia', null, { conditions: [{ kind: 'party-type', typeId: 'unknown-type' }] });
    const unknownResult = validateDataset(unknownType.data);
    expect(unknownResult.ok).toBe(false);
    if (!unknownResult.ok) expect(unknownResult.error.some(issue => issue.message.includes('Unknown party type'))).toBe(true);

    const wrongTrigger = gen6(['ralts', 'kirlia', 'magikarp']);
    setType(wrongTrigger.game, 'magikarp', 'dark');
    source(wrongTrigger.game, 'parent', 'ralts');
    source(wrongTrigger.game, 'magikarp-source', 'magikarp');
    evolution(wrongTrigger.game, 'ralts', 'kirlia', null, { trigger: 'player-trade', conditions: [{ kind: 'party-type', typeId: 'dark' }] });
    const triggerResult = validateDataset(wrongTrigger.data);
    expect(triggerResult.ok).toBe(false);
    if (!triggerResult.ok) expect(triggerResult.error.some(issue => issue.message.includes('requires a level gain'))).toBe(true);
  });

  it('requires the action capability in every requirement alternative', () => {
    for (const [condition, capabilityId] of [
      [{ kind: 'affection', minimum: 50 }, 'affection'],
      [{ kind: 'weather', weather: 'rain' }, 'rain'],
      [{ kind: 'device-orientation', orientation: 'upside-down' }, 'upside-down'],
    ] as const) {
      const result = gen6(['ralts', 'kirlia']);
      source(result.game, 'parent', 'ralts');
      result.game.capabilities.push({ id: capabilityId, name: capabilityId, requirements: none, review });
      evolution(result.game, 'ralts', 'kirlia', null, { requirements: { kind: 'any', requirements: [
        { kind: 'capability', id: capabilityId }, none,
      ] }, conditions: [condition as EvolutionCondition] });
      const checked = validateDataset(result.data);
      expect(checked.ok).toBe(false);
      if (!checked.ok) expect(checked.error.some(issue => issue.message.includes('in every alternative'))).toBe(true);
    }
  });
});
