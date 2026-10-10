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
| Acquisition sources | 914 |
| Evolution rules | 184 |
| Breeding rules | 180 |
| Active Emerald types | 17 |

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
target is Current progress. Its initial progress point is Elite Four, before
Sidney. Both views keep the same team and progress settings when the view changes.

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
