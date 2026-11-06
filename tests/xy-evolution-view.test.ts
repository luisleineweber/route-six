import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { dataset } from './local-data';
import { GameContext } from '../src/features/planner/GameContext';
import { PokemonEvolution } from '../src/components/PokemonEvolution';
import { evolutionLabels } from '../src/components/evolution-presentation';

describe.each(['x', 'y'])('%s evolution branch display', id => {
  const game = dataset.games.find(row => row.game.id === id)!;

  it('shows the required Espurr gender for each Meowstic form', () => {
    const branches = game.evolutions.filter(row => row.fromPokemonId === 'espurr');
    expect(branches).toHaveLength(2);
    const male = branches.find(row => !row.toFormId)!;
    const female = branches.find(row => row.toFormId === 'meowstic-female')!;
    expect(evolutionLabels(game, male)).toContain('Male only');
    expect(evolutionLabels(game, female)).toContain('Female only');
    const pikachu = game.evolutions.find(row => row.fromPokemonId === 'pikachu')!;
    expect(evolutionLabels(game, pikachu)).not.toContain('Male only');
    expect(evolutionLabels(game, pikachu)).not.toContain('Female only');
  });

  it('names Espurr as the source of both displayed branches', () => {
    const html = renderToStaticMarkup(createElement(GameContext.Provider, { value: game },
      createElement(PokemonEvolution, { id: 'meowstic-female', onSelect: () => {} })));
    expect(html.match(/From Espurr/g) ?? []).toHaveLength(2);
  });
});
