# Route Six

Route Six is the working name for the Pokémon Playthrough Planner.

Build a team of up to six Pokémon in the Team Planner. Use the Progress Planner
to check access at a selected point in the selected game. Both views share the team.

The app uses a clear field guide style (see [DESIGN.md](DESIGN.md)). The shared
catalogue has 721 species. Each game has its own supported profiles, type chart,
encounters, progress gates, items, choices, evolutions, and breeding rules.

Both planners support Red, Blue, Yellow, Gold, Silver, Crystal, Ruby, Sapphire,
Emerald, FireRed, LeafGreen, Diamond, Pearl, Platinum, Black, White, Black 2,
White 2, X, and Y.
Emerald remains the default game. See
[game data status](docs/game-data-progress.md) for coverage and checks.

HeartGold, SoulSilver, Omega Ruby, and Alpha Sapphire support Team Planner.
Their Progress Planner data remains
under review. The app shows this limit when you open that view.
See [Generation IV–VI status](docs/generation-456-progress.md) for the open work.

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
- Simple Team Planner with the selected game's supported species and type analysis.
- Progress Planner with access status, sources, team checks, and level settings.
- Emerald starts at Victory Road with the Current progress target.
- Team members and progress settings stay in memory when the view changes.
- Regional Pokédex order first, then National Dex order for the remaining species.
- Wild and fixed encounters, gifts, eggs, fossils, game trades, and breeding.
- Evolution requirements and first access points with source references.
- Team checks for exclusive choices, finite items, and reusable parent pairs.
- Game-specific type weaknesses, resistances, immunities, repeated types, and coverage.
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

See [implementation checks](docs/implementation-checks.md),
[game data status](docs/game-data-progress.md), and each game's coverage notes.

## Product and data contracts

- [MVP decisions](docs/mvp-decisions.md)
- [HTML MVP plan](docs/mvp-plan.html)
- [MVP plan and build order](docs/mvp-plan.md)
- [Manual data contract](docs/data-contract.md)
- [Adding reviewed games](docs/adding-games.md)
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
The new Generation IV–VI identities use local sprites from
[PokeAPI revision `0dc105d5`](https://github.com/PokeAPI/sprites/tree/0dc105d5b12416932f29b594078282ab4be045f5/sprites/pokemon).
National Dex 387–493 uses the Platinum set. National Dex 494–649 uses the
Black/White set. National Dex 650–721 uses the main static sprite set.
Pokémon artwork belongs to its original rights holders. Each game's source
notes identify the pinned pret source revision, source locations, and review
findings. The records retain their source references and review dates.
