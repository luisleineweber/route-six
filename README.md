# Pokémon Playthrough Planner

Plan a team of up to six Pokémon and check what is available at a selected point
in Pokémon Emerald. Team Planner and Progress Planner use the same access rules.

The MVP is implemented in a clear field guide style (see [DESIGN.md](DESIGN.md)). The local data set has
386 species, all 34 Hoenn routes, 148 progress points, 914 acquisition sources,
184 evolution rules, and 180 breeding rules.

## Run

Use Node.js 22.12 or later and npm.

```sh
npm ci
npm run dev
```

Open the local URL that Vite shows. For a production build and preview:

```sh
npm run build
npm run preview
```

The build checks all data, checks TypeScript, builds the app, and copies the
project documents into `dist/docs`. The app needs no service or API at runtime.

## Features

- Six team slots with add, replace, and remove controls.
- Shared progress, planning target, and level settings in both planners.
- Wild and fixed encounters, gifts, eggs, fossils, game trades, and breeding.
- Evolution requirements and first access points with source references.
- Team checks for exclusive choices, finite items, and reusable parent pairs.
- Emerald type weaknesses, resistances, immunities, repeated types, and coverage.
- Search by name, type, or Dex number. Filter by status, type logo, and source.
- Status chips show how many Pokémon each status has under the other filters.
- Keyboard controls, visible status labels, and layouts for small screens.

The guide shows what you could obtain. It does not track your exact bag or game
save. Team and settings stay in memory while the app is open. A reload starts
a new plan. Player trades and external distribution events stay excluded.

## Checks

```sh
npm test
npm run data:check
npm run typecheck
```

See [implementation checks](docs/implementation-checks.md) and the complete
[Emerald coverage list](docs/emerald-coverage.md).

## Product and data contracts

- [MVP decisions](docs/mvp-decisions.md)
- [HTML MVP plan](docs/mvp-plan.html)
- [MVP plan and build order](docs/mvp-plan.md)
- [Manual data contract](docs/data-contract.md)
- [TypeScript contract](docs/data-types.md)
- [JSON Schema](docs/schema/planner-data.schema.json)
- [Domain glossary](CONTEXT.md)
- [Specification checks](docs/specification-checks.md)

Maintain all game and Pokémon data by hand. The plan has no automated data import
or runtime data API.

The first full access check runs in a worker. The interface stays usable while
it checks later progress and breeding. Later queries reuse checked rule states.

The Pokémon Emerald logo in `public/games/` is an original drawing for this
project. The type logos in `public/types/` come from
[partywhale/pokemon-type-icons](https://github.com/partywhale/pokemon-type-icons)
under the MIT licence (`public/types/LICENSE.txt`). Type artwork belongs to its
original rights holders.

Pokémon sprites are local static assets from the
[PokeAPI Emerald sprite set](https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon/versions/generation-iii/emerald).
Pokémon artwork belongs to its original rights holders. Game data references
use the [Emerald decompilation](https://github.com/pret/pokeemerald) at revision
`731ad5bfd6e6f265508d0efcca0ba42f9dcf5881`.
