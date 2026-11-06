# Game data status

Current status, 5 November 2026: all 24 enabled games support both planners.
HeartGold and SoulSilver are active. See [the HGSS review](hgss-progress-review.md).
Earlier counts and pending-game notes below are historical.


Updated on 27 October 2026. The app now supports 24 Team Planner games and
20 Progress Planner games. Black, White, Black 2 and White 2 have active
native offline data. See [Generation IV-VI status](generation-456-progress.md)
and [Generation V checks](generation-5-progress-review.md).

Earlier Generation I-III review: 13 October 2026. All eleven catalogue games from Generations I
to III are enabled. Each new game had a Luna agent for source review and
data work. Ruby passed the complete second-game checks before the group
was enabled. Emerald remains the default game.

Each game has thirteen local data files and a separate loader. Each record
keeps its source references and review date. The app has no data service or
runtime data download. Source notes give the pinned revisions and locators.

| Game | Profiles | Milestones | Sources | Evolutions | Breeding rules | Review |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Pokémon Red | 151 | 54 | 483 | 72 | 0 | [Coverage](red-coverage.md) / [Sources](red-sources.md) |
| Pokémon Blue | 151 | 51 | 654 | 72 | 0 | [Coverage](blue-coverage.md) / [Sources](blue-sources.md) |
| Pokémon Yellow | 151 | 57 | 838 | 72 | 0 | [Coverage](yellow-coverage.md) / [Sources](yellow-sources.md) |
| Pokémon Gold | 251 | 71 | 3387 | 122 | 118 | [Coverage](gold-coverage.md) / [Sources](gold-sources.md) |
| Pokémon Silver | 251 | 38 | 2608 | 120 | 118 | [Coverage](silver-coverage.md) / [Sources](silver-sources.md) |
| Pokémon Crystal | 251 | 78 | 2720 | 122 | 118 | [Coverage](crystal-coverage.md) / [Sources](crystal-sources.md) |
| Pokémon Ruby | 386 | 131 | 945 | 184 | 181 | [Coverage](ruby-coverage.md) / [Sources](ruby-sources.md) |
| Pokémon Sapphire | 386 | 132 | 1839 | 184 | 181 | [Coverage](sapphire-coverage.md) / [Sources](sapphire-sources.md) |
| Pokémon Emerald | 386 | 148 | 915 | 184 | 181 | [Coverage](emerald-coverage.md) |
| Pokémon FireRed | 386 | 35 | 2099 | 181 | 181 | [Coverage](firered-coverage.md) / [Sources](firered-sources.md) |
| Pokémon LeafGreen | 386 | 62 | 1949 | 181 | 181 | [Coverage](leafgreen-coverage.md) / [Sources](leafgreen-sources.md) |

## Source checks

- Each game uses its own supported profiles, regional Dex order, types,
  encounters, progress gates, choices, items, and exclusions.
- The reviews cover ordinary wild tables, gifts, static and roaming
  encounters, fossils, NPC trades, evolution tables, and breeding outcomes.
- Each breeding rule has a matching source for every offspring. Repeatable
  eggs retain the parent and item requirements. Ditto is a partner only.
- Gen I has no gender or breeding system. Yellow starter Pikachu cannot use
  the normal Thunder Stone evolution.
- Gold has a native level 70 Lugia after the Pewter City Silver Wing gift.
  The Burned Tower releases the Gen II roamers before Morty.
- Ruby and Sapphire retain the Lilycove blockade and westward sea currents.
  Their fossils, NPC trades, and roaming species differ from Emerald.
  Sky Pillar opens after game clear and needs the Mach Bike climb.
  The Lilycove fifth-floor shop sells dolls. Native stone sources keep
  Ruby's one Moon Stone and Sapphire's one Sun Stone limits.
- FireRed and LeafGreen retain their National Dex and Sevii story gates.
  Lost Cave supplies both incense items. The Network Machine releases the
  starter-linked roamer. The Mt. Ember summit requires Strength.
- FireRed now includes Fuji in Fuchsia access and the Icefall Cave Rocket
  event before Sapphire return. All 180 native species resolve. LeafGreen
  resolves all 181 native species after the Network Machine and the optional
  Seven Island visit. Their trade and exclusion sets are separate.

## Shared rule checks

The breeding solver keeps distinct finite resources and choices. It removes
equivalent repeatable parent proofs and repeated retained key claims. A
one-time exchange for a reusable key counts once. Separate exchanges still
need separate resources. Regression tests cover these rules.

The planner shows possible access by story progress. It does not track the
current clock, a roamer position, coin totals, friendship values, or an exact
capture count. Player trades and external distributions remain outside
native acquisition scope.

## Final integration checks

`npm test` passes 266 tests in 31 files. The 39 tests affected by the final
test type corrections also pass. `npm run build` passes registered data,
local images, TypeScript, the production build, and document copy checks.
The build retains the warning for large local data chunks.

The final production browser checks pass Ruby, Sapphire, FireRed, LeafGreen,
and Emerald at 1440px and 320px. They cover both planners, supported profile
counts, details, selected-game references, shared team slots, the shared
level setting, images, and ten valid PNG exports. Both views fit at 320px.
The checks found no broken images, page overflow, UI errors, or browser
exceptions. A Red switch check confirms 151 profiles and 15 types. Treecko
leaves slot 1, and Pikachu keeps slot 2.

The earlier Red, Blue, Yellow, Gold, Silver, and Crystal browser checks
passed both planners, details, images, two PNG exports per game, switching,
and 320px layouts. The final FireRed Progress PNG and mobile screenshot
also passed visual checks. The browser report and samples are in `output/`.

Use [adding-games.md](adding-games.md) for later additions.

## Generation IV–VI continuation

The [Generation IV–VI review](generation-456-progress.md) records the new
thirteen-game base layers, source checks, corrections, and remaining work.
All thirteen new games support Team Planner. Diamond, Pearl, Platinum, X, and Y also
support Progress Planner. Their reviewed local data covers native access,
progress, evolution, breeding, forms, and exclusions. Sixteen of the 24 games
now support both planners. The other eight games still need these
layers. The usage report retains this earlier audit and all later task results.

The 21 October Nidoran correction updates the early-game counts above.
See [the source review](nidoran-breeding-review.md). Earlier check results in
this file remain dated history. Current full checks are in
[implementation checks](implementation-checks.md).


## HGSS integration: 5 November 2026

HeartGold and SoulSilver now support Progress Planner. All 24 enabled games
support both planners. The [HGSS report](hgss-progress-review.md) records
native scope, source checks, special encounters, breeding, and remaining limits.
Earlier game-count and candidate-status entries in this history are superseded.
