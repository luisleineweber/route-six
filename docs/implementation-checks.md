# MVP implementation checks

Checked on 7 October 2026. The application implements the confirmed MVP plan.
The interface uses the clear field guide style confirmed by the user.

## Data

| Collection | Records |
| --- | ---: |
| Generation III species and Emerald profiles | 386 |
| Progress points | 148 |
| Routes 101–134 | 34 |
| Gym and League opponents | 13 |
| Acquisition sources | 915 |
| Evolution rules | 184 |
| Breeding rules | 181 |
| Active Emerald types | 17 |

Current Emerald counts checked on 26 October 2026.

Data checks compare same-generation profiles across games. They check type
order, Egg Groups, and available genders, including genders recorded in forms.
Generation changes remain game-specific.
Identical X/Y and Diamond/Pearl data files use shared files under
`data/games/shared/` to prevent version copies from drifting.

The [coverage list](emerald-coverage.md) names every progress point and its
section. All data is maintained in local JSON. Each record has a review date and
a reference ID. References use Emerald revision
`731ad5bfd6e6f265508d0efcca0ba42f9dcf5881`.

Species types and Egg Groups were checked against the pinned species records.
Evolution edges were checked against the pinned evolution table. Encounter
methods, levels, rates, fixed genders, gifts, fossils, trades, and story gates
were checked against encounter tables and event scripts. TV outbreaks and fixed
New Mauville and Kecleon encounters have separate source records.

The data keeps player trades blocked. Other-version species and external
distribution events have explicit reasons. The Hoenn Dex reward needs the full
Hoenn Dex; unavailable species keep that reward blocked in this scope.

## Domain checks

`npm test` passes 54 tests in five files.

- Progress uses mandatory dependencies. List order does not grant access.
- Selected optional access remains in later evolution proofs.
- Rods, HMs, story gates, and item access stay explicit.
- Level-up evolution requires a level gain. Item evolution keeps its source level.
- Level limits use the next boss. No limit applies after the final League battle.
- Earlier acquisitions remain available if a later level limit is lower.
- Game trades consume the offered species and use its level and fixed gender.
- Breeding proves two compatible, distinct parents and a level-5 offspring.
- A new offspring has its own proof and can evolve into its parent's species.
- Ditto, incense, gender transitions, parent reuse, and trade order have coverage.
- Ungrounded acquisition cycles cannot create access.
- Team checks try source alternatives and enforce choices and finite resources.
- Shared breeding parents and simultaneous products count an evolution item once.
  Separate evolved animals still need separate items.
- Returned proofs remain unchanged during later queries and team checks.
- Type checks cover dual types, 4× weaknesses, immunities, and the 17-type chart.
- Invalid data reports its file, record ID, and field. The app shows load errors.

## Browser checks

The shared preview and a local Chromium browser were used for checks.

- Add six members, reject a seventh, replace a member, and remove a member.
- Change pages, progress, and level settings without losing the team.
- Read blocked reasons and source requirements in the details dialog.
- Close details with Escape and return focus to the opening control.
- Check desktop layout at 1440 pixels and phone layout at 390 and 320 pixels.
- Check no horizontal page overflow at phone width.
- Run axe WCAG A/AA checks on desktop, in the dialog, and at 320 pixels.
  The checks report zero violations.
- Check the browser console. It reports no app errors or warnings.

Screenshots from the local check are in `output/playwright/`.

## Build

`npm run build` passes the data check, TypeScript check, and Vite build. It copies
the product documents into `dist/docs`. `npm install --package-lock-only`
reports zero dependency vulnerabilities.

The first full query checks future sources and breeding in a worker. It can
take several seconds. The interface shows a checking state and stays usable.
The local data produces large bundle chunks. Vite reports a size warning.

The guide models what a player could obtain. It uses memory for the current
team and settings. It does not track a game save, bag, learned moves, abilities,
missed catches, or completed optional visits.

## Planner modes: 10 October 2026

The Team Planner shows all 386 species without an access check. It keeps the
six team slots, type analysis, search, type filters, and simple Pokémon details.
It shows no progress settings, level limit, access status, or source text.

The Progress Planner keeps access checks and source details. Its initial
target is Current progress. Its initial progress point is Victory Road.
Both views keep the same team and progress settings when the view changes.

Both catalogues sort the 202 Hoenn Pokédex species first. The remaining species
follow in National Dex order. Each Hoenn number was checked against
`include/constants/pokedex.h` at the pinned Emerald revision. Data records keep
the source reference and review date. Validation rejects duplicate regional
numbers and gaps in their sequence.

The shared browser checks covered these results:

- Team view shows 386 results without a worker loading state or access labels.
- Progress view starts at Elite Four with Current progress and the level limit on.
- Team members, selected progress, and the level setting survive view changes.
- The catalogue boundary is Deoxys, Hoenn #202, then Bulbasaur, National #001.
- Six filled slots disable further adds. Replace works with pointer and keyboard
  input. Removing a member enables adds again.
- Team details show identity and type weaknesses. Escape closes the dialog and
  returns focus to its opening control.
- Both views fit at 320 and 1440 pixels without horizontal page scrolling.
- National Dex labels do not cover the Add control at 320 pixels.
- Axe WCAG A/AA checks report zero violations in both views and Team details.

The current test suite passes 67 tests in eight files. The tests cover the
Elite Four default, regional Pokédex order, and invalid regional Dex data.
`npm run build` passes the data check, TypeScript check, and production build.
The existing warning for large local data bundles remains.

## Fixed team bar: 10 October 2026

Both planners show a full-width team bar after the full team scrolls above the
viewport. The bar centers six small cards. Each card uses a 4:3 shape with a
60/40 sprite and type area, then the name below. Narrow screens use two rows of
three cards. Empty slots keep their card, question mark, and Add control.

The browser checks covered these results:

- Add from the bar fills the selected slot in the full team view.
- Remove appears on hover and keyboard focus. Touch screens keep it visible
  with a 44-pixel target. Remove returns focus to the empty slot.
- Details close with Escape and return focus to the card.
- A direct scroll jump shows the bar in both planners.
- Search focus stays below the bar when a slot opens the catalogue.
- Card names and types fit at 320, 390, 671, 672, 768, and 1440 pixels.
- The team bar keeps its names inside the viewport at 200% text size.
- Axe WCAG A/AA checks report zero violations on desktop and touch screens.
- The browser reports no errors. The page has no horizontal overflow at the
  checked widths with normal text size.

The test suite passes 93 tests in 11 files. `npm run build` passes the data
check, TypeScript check, and production build. The existing bundle size warning
remains. Browser check files and screenshots are in `output/shots/`.

## Preparations for more games: 12 October 2026

The dataset now uses schema version 2. Each game declares its supported species
through its profiles, its visible progress checkpoints, its default progress
point, and its hatch level or absence of breeding. Genders are separate from
breeding data. Each profile has an explicit local image path. Both the
interface and exports use that path. Emerald's original game facts and profile
review records remain unchanged.

The registry loads game modules on request. Runtime validation checks shared
records first and each requested game separately. Invalid game data does not
prevent another valid game from loading. Valid loads are cached. Concurrent
requests share a load. Failed loads can be retried. The availability worker
loads the queried game through the same registry.

`npm test` passes 121 tests in 14 files. New checks cover supported species
subsets, progress without Gym IDs, regional Dex numbers above 202, games without
breeding, game-specific hatch levels, local image paths, missing images, registry
errors, failed loads, retries, and separate access rules for games that reuse
species and source IDs. Existing Emerald integration tests pass.

`npm run build` passes data, local image, TypeScript, and production checks.
The worker uses ES modules for separate game chunks. The existing warning for
the large Emerald data chunks remains. No dependency was added.

Production browser checks covered both planners at 1280 and 320 pixels, the
nine Emerald checkpoints, a progress change to Roxanne, shared team slots,
Pokémon details, image loading, and Escape close. No horizontal page overflow
occurred. Emerald remains the only enabled game; the other 37 entries remain
planned. The Team PNG rendered as a valid 2400 by 3176 pixel image. Progress
export model tests pass. The shared browser disconnected before the final
Progress PNG rendering check could finish.

See [Adding reviewed game data](adding-games.md) for the next-game steps and
the separate future work for species forms and visual maps. No second game,
form collection, or visual map dataset was added by these preparations.

## Generation I to III game data: 13 October 2026

All eleven catalogue games from Generations I to III are enabled. Each of the
ten new games had a Luna agent for primary source review and its thirteen data
files. Ruby passed the complete second-game checks before the group was added.
Each game has a separate loader, coverage notes, source locators, review dates,
and tests. See [game data status](game-data-progress.md) for the final counts.

The final data review corrected Ruby and Sapphire story branches, Sky Pillar
access, evolution stone sources, complete breeding source coverage, and Sevii
Island gates. The solver now reuses retained keys and repeatable breeding
parents without repeated resource claims. A one-time exchange for a reusable
key counts once. Separate exchanges still need separate resources.

`npm test` passes 266 tests in 31 files. The 39 tests affected by the final test
type corrections also pass. `npm run build` passes data, local images,
TypeScript, production, and document copy checks. The large data chunk warning
remains. All 130 new JSON files pass UTF-8, JSON, and no-BOM checks.

The final shared production browser checks cover Ruby, Sapphire, FireRed,
LeafGreen, and Emerald. Both planners show the selected game's profiles,
details, references, and type chart. Team slots and the level setting persist
across game changes. Both planners fit at 1440 and 320 pixels. All ten PNG
exports have valid PNG signatures and a width of 2400 pixels. The FireRed
Progress PNG and mobile screenshot also pass visual checks. No broken image,
page overflow, UI error, or browser exception occurred.

A Red switch check confirms 151 profiles and 15 types. Treecko leaves slot 1;
Pikachu keeps slot 2. Earlier browser checks cover both planners, details,
images, exports, switching, and 320px layouts for Red, Blue, Yellow, Gold,
Silver, and Crystal. The final browser report and samples are in `output/`.
## Generation IV–VI base-layer checks, 13 October 2026

The full suite passes 342 tests in 35 files. The production build passes.
All thirteen new base profile files pass the schema and source-reference
checks. All 7,945 base profiles match the pinned personal tables. The new
games were unregistered at that check; native access and form rules were
still incomplete. The 14 October checks below give the current status.

Independent checks found and corrected 20 Generation VI chart cells and
1,190 profile shape errors. All five Generation IV charts match 289 pairs
in two pinned battle tables. All four Generation VI charts match 324 source
pairs. Six focused checks cover regional number 000.

The usage report includes 49 completed Luna rounds and all their saved
results. Game and agent views, filters, token sorting, Standard/Fast estimates,
and CSV export pass browser checks. The page has no horizontal overflow at
320 or 1440 pixels. Long source revisions now wrap within the report.
The offline report check confirms that the earlier audit totals remain stable.

The production browser still shows 386 Emerald team profiles and eleven
ready games. New Generation IV–VI identities do not enter the Emerald list.
The Progress Planner still loads the selected Emerald progress and level cap.
See [generation-456-progress.md](generation-456-progress.md) for the remaining
game-data and domain layers.

## Generation IV–VI Team Planner checks, 14 October 2026

All thirteen new games now support Team Planner. The selector marks them
**Team ready**. All 24 registered games pass the data checks. The new games
keep Progress Planner pending until their native access and form data pass
review. Empty progress collections do not mean that no native sources exist.

The full suite passes 370 tests in 37 files with one worker. The production
build passes data, local images, TypeScript, Vite, and document copy checks.
The existing large data chunk warning remains.

The production browser checks pass all thirteen games. They cover catalogue
counts, game selection, team slots, type analysis, PNG export, and the pending
progress message. Kalos has separate Central, Coastal, and Mountain lists.
Details, Escape, the 320-pixel layout, and accessibility checks pass.

A focused browser check found a team bar that read a removed team panel when
Progress Planner was pending. The bar now leaves the page with that panel.
Its observers keep their own element references. The same check now passes.

The report contains all 24 games and all 62 Luna rounds. Game and agent
filters, findings, price selection, CSV export, empty results, and the
320-pixel layout pass browser checks. The earlier audit remains unchanged.
See [generation-456-progress.md](generation-456-progress.md) for the remaining
native access and form work.

## Platinum Progress Planner checks, 18 October 2026

Platinum now supports both planners. All 24 datasets pass the schema, semantic,
reference, local image, and type checks. The full suite passes 412 tests in
43 files. The focused item-source check passes eight tests after its public
claim assertions were corrected. The production build passes. It retains the
large local data chunk warning.

The Platinum integration tests check 382 native species, seven alternate forms,
97 exclusions, and 14 player-trade species. They check starter choices, fossil
parity, one Giratina across both sites, early eggs and caves, all eight badges,
League stages, Origin Forme after Hall of Fame, and Friday Drifloon.

The production browser checks pass starter conflicts, the native catalogue,
Spiritomb's external connection condition, Eterna cave access, the Fantina level
limit, Origin Forme, and pinned references. The 2,400-pixel PNG export passes file
and visual checks. The page fits at 320 pixels and passes axe WCAG A/AA checks.
The mobile screenshot passes visual review. No page or console errors occurred.

Cold progress requests took 44–57 seconds during these browser checks. The
worker keeps the page responsive while it checks future progress. Later queries
reuse compatible contexts. This load time remains a known performance limit.

See [the Platinum review](platinum-progress-review.md) for the active data and
source scope. The other twelve Generation IV–VI games remain in access review.
# Generation V encounter methods, 18 October 2026

The full suite passes 421 tests in 44 files. Nine new cases cover dark grass,
shaking grass, dust clouds, bridge shadows, rippling water, water access and
seasonal instructions in details and export. The build passes all 24 local
dataset and image checks, TypeScript, Vite and document copy.

An initial full run passed 420 cases and exceeded the five-second test limit
while one Platinum test built a large fixture. That fixture now builds in
the existing integration setup phase. The next full run passes all cases.

## Generation IV and VI shared rules, 18 October 2026

The full suite passes 444 tests in 46 files. It has no failed or skipped tests.
Luna test agents first reproduced the missing party conditions and the duplicate
received-item fault. They then tested the root's production changes.

The eleven new evolution cases cover actual party species and forms, retained
partners, finite resources, choices, affection, known moves, rain, device
orientation, level gain, invalid data, details, and export. Affection remains
separate from friendship. Every requirement alternative must prove its action.

The twelve received-item cases cover one-time holders, NPC trade offer costs,
starter choices, shared loot limits, invalid sources, details, and export.
The eight existing wild-held-item and Pickup cases also pass.

The focused TypeScript check and all 24 data and local image checks pass.
Generation VI source comparisons keep PKHeX legality metadata separate from
native runtime rules. The review keeps Sylveon's Generation VI affection rule
separate from the later default friendship rule.

These changes provide shared rules. They do not complete the missing access
records for Diamond, Pearl, HeartGold, SoulSilver, or the four Generation VI
games. Platinum remains the only Generation IV–VI game active in both planners.

The full production build passes. Refreshed browser checks pass all 24 Team
Planner catalogues and all twelve pending progress states. Platinum checks
cover shared slots, first-checkpoint access, starter conflicts, details,
pinned references, keyboard close, and the 320-pixel layout. Team and Progress
PNG files pass file and visual checks. The final app tab has no console errors.
The report filters, price control, 22-row agent CSV, and mobile fit also pass.
See `output/gen46-browser-checks.json` for the exact scope and browser tool limits.

## Diamond, Pearl, X, Y, and shared encounter checks, 21 October 2026

Diamond, Pearl, Platinum, X, and Y now support both planners. This brings the
Progress Planner total to 16 of the 24 registered games. HeartGold, SoulSilver,
Black, White, Black 2, White 2, Omega Ruby, and Alpha Sapphire remain Team ready.
Their empty progress data does not establish native acquisition coverage.

The complete current suite passes **613 tests in 56 files** in 401.22 seconds.
It has no failed, pending, or skipped tests. The production build passes all
24 data and local image checks, TypeScript, Vite, and document copy. The large
local data chunk warning remains. No dependency was added.

The native Generation II–IV Nidoran corrections and genderless breeding rules
have actual-data regressions. Diamond and Pearl each reach 363 native species
and six alternate forms. Platinum reaches 382 and seven. X and Y each reach
435 native species and 13 alternate forms. Their separate player-trade blockers
and reviewed exclusions remain explicit.

The public X/Y query tests found nine species lost from later access because
optional visit bookmarks were used as permanent locks. The corrected locations
use their required story unlocks. Both versions show three species now and 432
later at the starter checkpoint, then all 435 at Kiloude without side-visit
history. First-access text keeps the real rod, field action, and story gates.

Progress exports now choose compatible team paths. They retain direct-source
priority and slot positions. Tests cover all starter pairs, two Snorlax,
empty slots, choice conflicts, and finite-source conflicts. A full-suite failure
also found an unnecessary source-profile read in unrestricted evolution labels.
That read now occurs only for a gender-specific label. The catalogue tests pass.

Fresh production browser checks pass X and Y progress, starter conflicts,
duplicate Snorlax, Heat Rotom, shared slots, the 320-pixel form dialog,
keyboard close and focus return, and axe WCAG A/AA checks. Both mobile
Meowstic views clearly name Espurr and the required gender on each branch.
Five new PNG exports pass integrity and complete visual review. No final
browser errors occurred. A separate Luna check passes all 24 Team catalogues.
The accepted report is `output/xy-final-browser.json`. Earlier failed visual
and browser setup checks remain recorded in `output/xy-browser-checks.json`.

The shared HGSS layer adds radio sounds, Headbutt tree classes, and Safari block
points. Its 24 focused cases pass. Validation checks every access alternative,
valid methods, whole point values, unique object types, and the 30-object limit.
These extensions do not enable either HGSS Progress Planner. Their source rows,
evolution candidates, item gates, and remaining access work are documented in
[the HGSS work record](hgss-progress-review.md).

The final complete test report is `output/oct21-complete-tests.json`. The build
log is `output/xy-hgss-production-build.log`. The active data and source limits
are in [the Diamond and Pearl review](diamond-pearl-progress-review.md) and
[the X and Y review](xy-progress-review.md).
