import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { emerald } from '../src/data/dataset';
import type { AcquisitionPath, AvailabilitySnapshot } from '../src/domain/types';
import { AcquisitionDetails } from '../src/components/AcquisitionDetails';
import { GameContext } from '../src/features/planner/GameContext';

function acquisitionPaths(paths: AcquisitionPath[], status: 'available' | 'later' = 'available') {
  const pokemonId = paths[0].pokemonId;
  const snapshot: AvailabilitySnapshot = {
    query: { gameId: 'emerald', milestoneId: 'victory-road', respectLevelLimit: false },
    levelLimit: null, choiceGroups: [], resourceLimits: {},
    entries: { [pokemonId]: {
      pokemonId, status, currentPathIds: status === 'available' ? paths.map(path => path.id) : [],
      futurePathIds: status === 'later' ? paths.map(path => path.id) : [], firstMilestoneIds: [], blockers: [],
    } },
    paths: Object.fromEntries(paths.map(path => [path.id, path])),
  };
  const html = renderToStaticMarkup(createElement(GameContext, { value: emerald },
    createElement(AcquisitionDetails, {
      id: pokemonId, snapshot, progressPage: true, canAdd: true,
      onClose: () => {}, onAdd: () => {}, onNavigate: () => {},
    })));
  return html.split('<h3>Acquisition paths</h3>')[1].split('<details class="progress-details">')[0];
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
