import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { emerald } from './local-data';
import type { AcquisitionPath, AvailabilitySnapshot } from '../src/domain/types';
import { AcquisitionDetails } from '../src/components/AcquisitionDetails';
import { GameContext } from '../src/features/planner/GameContext';

function details(paths: AcquisitionPath[], status: 'available' | 'later' = 'available', firstMilestoneIds = paths[0].firstMilestoneIds) {
  const pokemonId = paths[0].pokemonId;
  const snapshot: AvailabilitySnapshot = {
    query: { gameId: 'emerald', milestoneId: 'victory-road', respectLevelLimit: false },
    levelLimit: null, choiceGroups: [], resourceLimits: {},
    entries: { [pokemonId]: {
      pokemonId, status, currentPathIds: status === 'available' ? paths.map(path => path.id) : [],
      futurePathIds: status === 'later' ? paths.map(path => path.id) : [], firstMilestoneIds, blockers: [],
    } },
    paths: Object.fromEntries(paths.map(path => [path.id, path])),
  };
  return renderToStaticMarkup(createElement(GameContext, { value: emerald },
    createElement(AcquisitionDetails, {
      id: pokemonId, snapshot, progressPage: true, canAdd: true,
      onClose: () => {}, onAdd: () => {}, onNavigate: () => {},
    })));
}

function acquisitionPaths(paths: AcquisitionPath[], status: 'available' | 'later' = 'available') {
  return details(paths, status).split('<h3>How to get this Pokémon</h3>')[1].split('<details class="progress-details">')[0];
}

const titles = (html: string) => [...html.matchAll(/<span class="path-title">([^<]+)/g)].map(match => match[1]);

const evolved: AcquisitionPath = {
  id: 'evolved', pokemonId: 'whiscash',
  sourceIds: [emerald.sources.find(source => source.pokemonId === 'barboach'
    && source.locationId === 'meteor-falls' && source.details.kind === 'wild'
    && source.details.method === 'good-rod')!.id],
  evolutionIds: ['barboach-to-whiscash'], breedingSteps: [], genders: ['female'],
  minimumLevel: 30, firstMilestoneIds: [], choices: [], claims: [], coProductIds: [],
};

describe('detail acquisition paths', () => {
  it('lists an extra evolution item in the evolution steps, like the PNG export', () => {
    const shedinja: AcquisitionPath = { ...evolved, id: 'shedinja', pokemonId: 'shedinja',
      sourceIds: [emerald.sources.find(source => source.pokemonId === 'nincada' && source.details.kind === 'wild')!.id],
      evolutionIds: ['nincada-to-shedinja'], minimumLevel: 20 };
    const steps = acquisitionPaths([shedinja]).split('<h4>Evolution steps</h4>')[1];
    expect(steps).toContain('Use Poké Ball.');
  });

  it.each(['available', 'later'] as const)('lists the current Pokémon evolution when %s', status => {
    const html = acquisitionPaths([evolved], status);
    expect(titles(html)).toEqual(['Evolve Barboach']);
    expect(html).toContain('Level up at Lv. 30+');
    expect(html).toContain('Starting source: Barboach');
  });

  it('keeps the current Pokémon catch beside evolution from the same location', () => {
    const caught = { ...evolved, id: 'caught', evolutionIds: [], sourceIds: ['wild-meteor-falls-upper-super-rod-whiscash'] };
    const html = acquisitionPaths([caught, evolved]);
    expect(titles(html)).toEqual(['Meteor Falls', 'Evolve Barboach']);
    expect(html).toContain('Super Rod');
    expect(html).toContain('/items/super-rod.png');
    expect(html).not.toContain('2 options');
  });

  it('combines predecessor locations into one evolution path with clear source options', () => {
    const other = { ...evolved, id: 'other', sourceIds: ['wild-route-111-good-rod-barboach'], minimumLevel: 31 };
    const html = acquisitionPaths([evolved, other]);
    expect(titles(html)).toEqual(['Evolve Barboach']);
    expect(html).toContain('2 options');
    expect(html).toContain('Barboach · Meteor Falls · Good Rod');
    expect(html).toContain('Barboach · Route 111 · Good Rod');
    expect(html).toContain('From Lv. 31');
  });

  it('uses the immediate predecessor of a later evolution stage', () => {
    const gardevoir = { ...evolved, pokemonId: 'gardevoir', minimumLevel: 30,
      sourceIds: ['wild-route-102-grass-ralts'], evolutionIds: ['ralts-to-kirlia', 'kirlia-to-gardevoir'] };
    const html = acquisitionPaths([gardevoir]);
    expect(titles(html)).toEqual(['Evolve Kirlia']);
    expect(html).toContain('Starting source: Ralts');
    expect(html).toContain('Level up at Lv. 30+');
  });

  it('keeps a bred predecessor inside the evolution path', () => {
    const bred: AcquisitionPath = { ...evolved, id: 'bred', sourceIds: ['breed-barboach-barboach'],
      breedingSteps: [{ sourceId: 'breed-barboach-barboach', ruleId: 'breed-barboach', parents: [
        { pokemonId: 'barboach', gender: 'female', pathId: 'female-parent' },
        { pokemonId: 'barboach', gender: 'male', pathId: 'male-parent' },
      ] }] };
    const html = acquisitionPaths([evolved, bred]);
    expect(titles(html)).toEqual(['Evolve Barboach']);
    expect(html).toContain('Barboach · Route 117 and Day Care · Breeding');
    expect(html).toContain('Parent pair');
  });
});

describe('first access labels', () => {
  it('shows a shared source and progress location once', () => {
    const ralts = { ...evolved, pokemonId: 'ralts', evolutionIds: [],
      sourceIds: ['wild-route-102-grass-ralts'], firstMilestoneIds: ['route-102'] };
    const html = details([ralts]);
    expect(html).toContain('<p>Available from Route 102.</p>');
    expect(html).not.toContain('Route 102 — at “Route 102”');
  });

  it('connects the first catch location to its progress requirement in the summary and path details', () => {
    const makuhita = { ...evolved, pokemonId: 'makuhita', evolutionIds: [], minimumLevel: 6,
      sourceIds: ['wild-granite-cave-1f-grass-makuhita'], firstMilestoneIds: ['mr-briney'] };
    const html = details([makuhita]);
    const label = 'Granite Cave — after “Sail with Mr. Briney”';
    expect(html).toContain(`<p>Available from ${label}.</p>`);
    expect(html).toContain(`<dt>Available from</dt><dd>${label}</dd>`);
  });

  it('uses the evolution path that matches first access instead of a later direct catch', () => {
    const caught = { ...evolved, id: 'caught', evolutionIds: [],
      sourceIds: ['wild-meteor-falls-upper-super-rod-whiscash'], firstMilestoneIds: ['juan-defeated'] };
    const early = { ...evolved, firstMilestoneIds: ['norman-defeated'] };
    const html = details([caught, early], 'available', ['norman-defeated']);
    expect(html).toContain('<p>Available from Evolve Barboach — after “Defeat Norman and receive Surf”.</p>');
  });

  it('ties each independent first-access point to its own source', () => {
    const route = { ...evolved, id: 'route', pokemonId: 'magikarp', evolutionIds: [],
      sourceIds: ['wild-route-123-old-rod-magikarp'], firstMilestoneIds: ['route-123'] };
    const scope = { ...route, id: 'scope', sourceIds: ['wild-safari-zone-southwest-old-rod-magikarp'], firstMilestoneIds: ['devon-scope'] };
    const html = details([scope, route], 'later', ['route-123', 'devon-scope']);
    expect(html).toContain('<p>Available from Route 123.</p>');
    expect(html).toContain('<li>Safari Zone — after “Receive the Devon Scope”</li>');
  });

  it('does not show internal resource IDs', () => {
    const limited = { ...evolved, claims: [{ resourceId: 'source:wild-route-102-grass-ralts', quantity: 1, use: 'retain' as const }] };
    const html = details([limited]);
    expect(html).not.toContain('Finite resources');
    expect(html).not.toContain('source:wild-route-102-grass-ralts');
  });

  it('shows source links without revision identifiers', () => {
    const html = details([evolved]);
    expect(html).toContain('<summary>Sources');
    expect(html).toContain('Sources for Pokémon Emerald. Last checked:');
    expect(html).not.toContain('Revision ');
  });
});
