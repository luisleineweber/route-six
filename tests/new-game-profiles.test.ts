import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import commonSchema from '../docs/schema/common.schema.json';
import gameSchema from '../docs/schema/game.schema.json';
import identities from '../data/pokemon.json';
import references from '../data/references.json';
import type { PokemonProfile } from '../src/domain/types';

const games: [string, number][] = [
  ['diamond', 4], ['pearl', 4], ['platinum', 4], ['heartgold', 4], ['soulsilver', 4],
  ['black', 5], ['white', 5], ['black-2', 5], ['white-2', 5],
  ['x', 6], ['y', 6], ['omega-ruby', 6], ['alpha-sapphire', 6],
];
const referenceIds = new Set(references.map(reference => reference.id));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(commonSchema).addSchema(gameSchema);
const valid = ajv.getSchema(`${gameSchema.$id}#/$defs/profile`)!;
const profiles = (game: string): PokemonProfile[] => JSON.parse(
  readFileSync(`data/games/${game}/pokemon.json`, 'utf8'),
);

describe('Reviewed Generation IV–VI base profiles', () => {
  it.each(games)('validates every %s profile without requiring game registration', (game, generation) => {
    const rows = profiles(game);
    const supported = identities.filter(species => species.introducedGeneration <= generation);
    expect(rows.map(profile => profile.pokemonId).sort()).toEqual(supported.map(species => species.id).sort());
    const dex = new Map(supported.map(species => [species.id, species.nationalDex]));
    for (const row of rows) {
      expect(valid(row), `${game}/${row.pokemonId}: ${JSON.stringify(valid.errors)}`).toBe(true);
      expect(row.spriteSrc).toBe(`/pokemon/${dex.get(row.pokemonId)}.png`);
      if (['x', 'y'].includes(game) && row.pokemonId === 'meowstic') {
        expect(row.review.checkedOn).toBe('2026-10-21');
      } else {
        expect(['2026-10-13', '2026-10-14']).toContain(row.review.checkedOn);
      }
      for (const id of row.review.referenceIds) {
        expect(referenceIds.has(id), `${game}: missing source ${id}`).toBe(true);
        expect(id.startsWith(`${game}-`), `${game}: source belongs to another game`).toBe(true);
      }
    }
  });

  it.each(games)('keeps %s single types, Egg Groups, and genders in schema form', game => {
    const rows = profiles(game);
    expect(rows.find(row => row.pokemonId === 'charmander')?.types).toEqual(['fire']);
    expect(rows.find(row => row.pokemonId === 'caterpie')?.breeding?.eggGroupIds).toEqual(['bug']);
    expect(rows.find(row => row.pokemonId === 'nidoran-f')?.genders).toEqual(['female']);
    expect(rows.find(row => row.pokemonId === 'magnemite')?.genders).toEqual(['genderless']);
    expect(rows.find(row => row.pokemonId === 'gallade')?.genders).toEqual(['male']);
  });

  it.each(games)('uses %s types from its generation', (game, generation) => {
    const rows = profiles(game);
    expect(rows.find(row => row.pokemonId === 'togepi')?.types).toEqual([generation < 6 ? 'normal' : 'fairy']);
    expect(rows.find(row => row.pokemonId === 'clefairy')?.types).toEqual([generation < 6 ? 'normal' : 'fairy']);
    expect(rows.find(row => row.pokemonId === 'rotom')?.types).toEqual(['electric', 'ghost']);
    if (generation < 6) expect(rows.some(row => row.types.includes('fairy'))).toBe(false);
  });
});
