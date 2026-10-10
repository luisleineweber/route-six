import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { emerald } from '../src/data/dataset';
import { GameContext } from '../src/features/planner/GameContext';
import { TypeAnalysis } from '../src/features/team/TypeAnalysis';

it('keeps defensive marks tied to the original slots after a member is removed', () => {
  const html = renderToStaticMarkup(createElement(GameContext, { value: emerald },
    createElement(TypeAnalysis, { team: [null, 'swampert', null, null, null, null] })));
  expect(html).toContain('Slot 1: empty. Slot 2, Swampert: 4 times damage.');
  expect(html).toContain('Slot 1: empty. Slot 2, Swampert: 0 times damage.');
  expect(html).not.toContain('Slot 1, Swampert');
});
