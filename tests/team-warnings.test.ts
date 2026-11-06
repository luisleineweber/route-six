import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { AvailabilitySnapshot, Blocker } from '../src/domain/types';
import { TeamWarnings } from '../src/features/team/TeamWarnings';
import { checkTeam } from '../src/domain/team/check-team';
import { groupTeamWarnings } from '../src/features/team/team-warning-summary';
import { fixture, milestone, none, review, source } from './fixtures';
import { getAvailability } from '../src/domain/availability';

function blocked(members: [string, Blocker['code'], string][]): AvailabilitySnapshot {
  return {
    query: { gameId: 'diamond', milestoneId: 'victory-road', respectLevelLimit: true },
    levelLimit: null, paths: {}, choiceGroups: [], resourceLimits: {},
    entries: Object.fromEntries(members.map(([id, code, message]) => [id, {
      pokemonId: id, status: 'unavailable', currentPathIds: [], futurePathIds: [],
      firstMilestoneIds: [], blockers: [{ code, message, relatedId: id }],
    }])),
  };
}

function render(snapshot: AvailabilitySnapshot, team: string[], target: 'current-progress' | 'whole-game' = 'current-progress') {
  return renderToStaticMarkup(createElement(TeamWarnings, { snapshot, team, target, onDetails: () => {} }));
}

describe('team access warnings', () => {
  it('groups repeated issues with the reason before its Pokémon controls', () => {
    const snapshot = blocked([
      ['spiritomb', 'other-version', 'Long source review for Spiritomb.'],
      ['bastiodon', 'other-version', 'Long source review for Bastiodon.'],
      ['alakazam', 'player-trade', 'Evolve kadabra by trading with another player. Player trades are excluded.'],
    ]);
    const html = render(snapshot, ['spiritomb', 'bastiodon', 'alakazam']);
    expect(html).toContain('3 Pokémon unavailable for this plan');
    expect(html.match(/<li>/g)).toHaveLength(2);
    expect(html.match(/Not obtainable in this game/g)).toHaveLength(1);
    expect(html.indexOf('Not obtainable in this game')).toBeLessThan(html.indexOf('View Spiritomb access details'));
    expect(html.indexOf('Player trade required')).toBeLessThan(html.indexOf('View Alakazam access details'));
    for (const name of ['Spiritomb', 'Bastiodon', 'Alakazam']) {
      expect(html).toContain(`aria-label="View ${name} access details"`);
    }
    expect(html.match(/aria-haspopup="dialog"/g)).toHaveLength(3);
    expect(html.match(/type="button"/g)).toHaveLength(3);
    expect(html).toContain('Select a Pokémon for access details.');
    expect(html).not.toContain('Long source review');
    expect(snapshot.entries.spiritomb.blockers[0].message).toBe('Long source review for Spiritomb.');
    expect(html).toContain('Player trades are excluded from this plan.');
  });

  it('keeps external events and external connections distinct', () => {
    const snapshot = blocked([
      ['mew', 'external-event', 'Event review.'],
      ['spiritomb', 'external-connection', 'Connection review.'],
    ]);
    const team = ['mew', 'spiritomb'];
    const groups = groupTeamWarnings(snapshot, checkTeam(snapshot, team, 'current-progress').warnings);
    expect(groups).toEqual([
      { title: 'External event required', message: null, pokemonIds: ['mew'] },
      { title: 'External connection required', message: null, pokemonIds: ['spiritomb'] },
    ]);
  });

  it('keeps the six-member screenshot example in two reason groups', () => {
    const snapshot = blocked([
      ['suicune', 'other-version', 'Suicune source review.'],
      ['entei', 'other-version', 'Entei source review.'],
      ['raikou', 'other-version', 'Raikou source review.'],
      ['ho-oh', 'external-event', 'Ho-Oh event review.'],
      ['lugia', 'external-event', 'Lugia event review.'],
      ['tyranitar', 'other-version', 'Tyranitar source review.'],
    ]);
    const html = render(snapshot, ['suicune', 'entei', 'raikou', 'ho-oh', 'lugia', 'tyranitar']);
    expect(html).toContain('6 Pokémon unavailable for this plan');
    expect(html.match(/<li>/g)).toHaveLength(2);
    expect(html.match(/class="team-issue-details"/g)).toHaveLength(6);
    expect(html.indexOf('External event required')).toBeLessThan(html.indexOf('View Ho-Oh access details'));
    expect(html).not.toContain('source review');
  });

  it('counts duplicate team slots but shows a single details control per species', () => {
    const snapshot = blocked([['raichu', 'item', 'Requires Thunder Stone (consumed).']]);
    const html = render(snapshot, ['raichu', 'raichu']);
    expect(html).toContain('2 Pokémon unavailable for this plan');
    expect(html.match(/View Raichu access details/g)).toHaveLength(1);
  });

  it('keeps specific requirements and shows a readable Pokémon name', () => {
    const snapshot = blocked([['raichu', 'item', 'Requires Thunder Stone (consumed).']]);
    const html = render(snapshot, ['raichu']);
    expect(html).toContain('1 Pokémon unavailable for this plan');
    expect(html).toContain('Requirement not met');
    expect(html).toContain('Requires Thunder Stone (consumed).');
    expect(html).toContain('View Raichu access details');
  });

  it('labels level limits separately without hiding the specific blocker', () => {
    const html = render(blocked([['dragonite', 'level-limit', 'Minimum level 55 exceeds the level limit of 49.']]), ['dragonite']);
    expect(html).toContain('Above the level limit');
    expect(html).toContain('Minimum level 55 exceeds the level limit of 49.');
  });

  it('keeps team resource conflicts visible without inventing a species link', () => {
    const snapshot = blocked([]);
    const message = 'These members need incompatible choices in Starter. Select another family or source.';
    expect(groupTeamWarnings(snapshot, [{ code: 'choice-conflict', message, relatedId: 'starter', slotIndexes: [0, 1] }]))
      .toEqual([{ title: 'Conflicting team choices', message, pokemonIds: [] }]);
  });

  it('does not describe obtainable members as unavailable when their choices conflict', () => {
    const { data, game } = fixture(['treecko', 'torchic']);
    game.choices.push({ id: 'starter', name: 'Starter', options: ['treecko', 'torchic'], maximumSelections: 1, review });
    for (const id of ['treecko', 'torchic']) source(game, id, id, 5, none, { maxUses: 1, choice: { groupId: 'starter', optionId: id } });
    const result = getAvailability(data, { gameId: 'emerald', milestoneId: 'gate', respectLevelLimit: false });
    if (!result.ok) throw new Error('Fixture query failed');
    const html = render(result.value, ['treecko', 'torchic']);
    expect(html).toContain('This team needs a change');
    expect(html).toContain('Conflicting team choices');
    expect(html).not.toContain('Pokémon unavailable');
    expect(html).not.toContain('Select a Pokémon for access details.');
    expect(html).not.toContain('<button');
  });

  it('offers later planning only when the current target prevents access', () => {
    const { data, game } = fixture(['ralts']);
    source(game, 'future-ralts', 'ralts', 5, milestone('future'));
    const result = getAvailability(data, { gameId: 'emerald', milestoneId: 'gate', respectLevelLimit: false });
    if (!result.ok) throw new Error('Fixture query failed');
    const current = render(result.value, ['ralts']);
    expect(current).toContain('1 Pokémon available later');
    expect(current).toContain('Choose a later progress point or plan for the whole game.');
    const html = render(result.value, ['ralts'], 'whole-game');
    expect(html).toContain('Team available over the whole game.');
    expect(html).toContain('Ralts is available later.');
    expect(html).not.toContain('team-issue-list');
  });

  it('does not claim current team access when only a future source removes a choice conflict', () => {
    const { data, game } = fixture(['treecko', 'torchic']);
    game.choices.push({ id: 'starter', name: 'Starter', options: ['treecko', 'torchic'], maximumSelections: 1, review });
    for (const id of ['treecko', 'torchic']) {
      source(game, `starter-${id}`, id, 5, none, { maxUses: 1, choice: { groupId: 'starter', optionId: id } });
    }
    source(game, 'future-torchic', 'torchic', 5, milestone('future'));
    const result = getAvailability(data, { gameId: 'emerald', milestoneId: 'gate', respectLevelLimit: true });
    if (!result.ok) throw new Error('Fixture query failed');
    const snapshot = result.value;
    const team = ['treecko', 'torchic'];
    expect(team.map(id => snapshot.entries[id].status)).toEqual(['available', 'available']);
    expect(checkTeam(snapshot, team, 'current-progress').feasible).toBe(false);
    expect(checkTeam(snapshot, team, 'whole-game').feasible).toBe(true);
    const html = render(snapshot, team, 'whole-game');
    expect(html).toContain('Team available over the whole game.');
    expect(html).not.toContain('Team available at your selected progress.');
  });

  it('keeps empty and successful teams quiet and informative', () => {
    const empty = render(blocked([]), []);
    expect(empty).toContain('Add a Pokémon to check team access.');
    expect(empty).toContain('role="status"');
    expect(empty).not.toContain('team-issue-list');
    const { data, game } = fixture(['ralts']);
    source(game, 'wild-ralts', 'ralts');
    const result = getAvailability(data, { gameId: 'emerald', milestoneId: 'gate', respectLevelLimit: false });
    if (!result.ok) throw new Error('Fixture query failed');
    const html = render(result.value, ['ralts']);
    expect(html).toContain('Team available at this point in the game.');
    expect(html).not.toContain('team-issue-list');
  });
});
