# Pokémon Playthrough Planner

Build a team of up to six Pokémon in the Team Planner. Use the Progress Planner
to check access at a selected point in Pokémon Emerald. Both views share the team.

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
- Simple Team Planner with all 386 species, team slots, and type analysis.
- Progress Planner with access status, sources, team checks, and level settings.
- Progress Planner starts at Elite Four with the Current progress target.
- Team members and progress settings stay in memory when the view changes.
- Hoenn Pokédex order first, then National Dex order for the remaining species.
- Wild and fixed encounters, gifts, eggs, fossils, game trades, and breeding.
- Evolution requirements and first access points with source references.
- Team checks for exclusive choices, finite items, and reusable parent pairs.
- Emerald type weaknesses, resistances, immunities, repeated types, and coverage.
- Search by name, type, or regional or National Dex number. Filter by type logo.
- Progress Planner status chips show counts under the other filters.
- Keyboard controls, visible status labels, and layouts for small screens.

The guide shows what you could obtain. It does not track your exact bag or game
save. Team and settings stay in memory while the app is open. A reload starts
a new plan. The Progress Planner keeps player trades and external distribution
events excluded from access. The Team Planner lets you select any game profile.

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

The first full Progress Planner access check runs in a worker. The interface
stays usable while it checks later progress and breeding. Later queries reuse
checked rule states. The Team Planner needs no access check.

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
