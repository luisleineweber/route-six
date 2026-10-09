# Pokémon Playthrough Planner: MVP plan

Status: implemented. The [eight initial choices and breeding choice](mvp-decisions.md)
are confirmed. This plan defines the product and data contract. See the
[implementation checks](implementation-checks.md) and [coverage list](emerald-coverage.md).

## Goal and scope

Help a player plan up to six Pokémon for Pokémon Emerald. Show how to obtain
each Pokémon and whether the selected progress point permits it.

Support every route and story event. Include Gyms, the Pokémon League, optional
areas, and normal post-game progress. The complete route and event list is in
[Emerald coverage](emerald-coverage.md).

Maintain all data by hand. Show Pokémon from other versions as unavailable.
Limit the initial catalogue to species that exist in Generation III. This keeps
the catalogue relevant to Emerald; later-generation species are outside this MVP.

Use types for team analysis. Label the result as type analysis. Ability effects,
held-item effects, and learned moves do not form part of this calculation.

External distribution events need a clear unavailable reason. Do not assume the
player can obtain an event item. Ordinary gifts and story events remain included.

## Current user flow

```text
Open the project
└─ Open the local field guide
   ├─ Plan a six-member team
   └─ Check Pokémon access at the selected progress point
```

## User flows

```text
Open Team Planner
├─ Select game and version
│  └─ Emerald is the only supported version
├─ Select current progress
│  └─ Search routes and events, grouped by story section
├─ Select planning target
│  ├─ Whole game
│  │  └─ Keep later Pokémon in the plan; show the current availability status
│  └─ Current progress
│     └─ Highlight Pokémon that are available now; keep other entries visible
├─ Keep the level limit on, or turn it off
│  └─ Show the next Gym or League opponent and its highest level
├─ Search Pokémon and add up to six
│  ├─ Available now: show an acquisition path
│  ├─ Available later: show the first valid progress points
│  ├─ Blocked by a condition: show the condition and required action
│  └─ Unavailable in Emerald: show the reason
└─ Read team results
   ├─ Type weaknesses, resistances, immunities, and attack coverage
   ├─ Repeated types
   └─ Availability and choice warnings

Open Progress Planner
├─ Use the same version, progress point, and level setting
├─ Read Pokémon available now
│  ├─ Wild encounters and fixed encounters
│  ├─ Starters, gifts, eggs, fossils, and game trades
│  ├─ Breeding with an accessible and compatible parent pair
│  └─ Evolutions whose conditions can be met
├─ Show blocked and unavailable entries when requested
│  └─ Read why each entry is blocked
└─ Add a Pokémon to the same planned team
```

The two planners share settings and the same team. Changing progress does not
remove team members. It updates their status and the team warnings.

## Pages and components

| Page or component | Purpose |
| --- | --- |
| Team Planner | Six team slots, Pokémon search, and team analysis. |
| Progress Planner | Available Pokémon and their acquisition paths. |
| PlannerSettings | Game, version, progress, target, and level limit. |
| MilestonePicker | Searchable route and event list with section labels. |
| PokemonSearch | Name and type search; status and source filters. |
| PokemonCard | Name, types, status, source, and earliest progress. |
| AcquisitionDetails | All valid sources, evolution steps, and requirements. |
| TeamSlots | Add, replace, and remove Pokémon; enforce six slots. |
| TeamWarnings | Explain unavailable members and incompatible choices. |
| TypeAnalysis | Counts by attack type and offensive coverage. |

Use text with status colours. Controls need visible labels, keyboard access, and
visible focus. A level limit change must update the result summary. Do not use
colour or a lock icon as the only explanation. On narrow screens, show settings,
team slots, warnings, and analysis in that order.

Use a normal selectable list for progress first. A custom map is outside this MVP.

## Progress rules

Each route or story event has a milestone ID. Separate a location from its visits:
a route can have an initial visit and a later visit after Surf becomes possible.

Milestones form a dependency graph. `previousIds` lists mandatory prior milestones.
`displayOrder` controls the list order only. It does not prove access. Selecting a
milestone includes its mandatory ancestors. It does not imply that the player
visited every optional route shown earlier in the list.

Locations have access requirements. Sources have their own requirements too.
For example, reaching a route does not by itself permit its fishing encounters.
Fishing equipment, HM access, story gates, and item access must remain explicit.

The planner answers what a player *could obtain*. It does not track their exact
bag, current Pokémon levels, missed catches, or completed optional visits.

Each milestone names its next Gym or League opponent. The stored highest level
sets the recommended limit. Before and after a battle are separate milestones.
After the final League battle, there is no next League opponent. Show that no
recommended limit applies; do not invent a replacement value.

## Shared availability module

Both planners call one pure module with validated game data and a query.
The module returns a result for every catalogue entry, including unavailable ones.

```mermaid
flowchart LR
  D[Checked manual JSON] --> A[Availability module]
  Q[Version, milestone, level setting] --> A
  A --> T[Team Planner]
  A --> P[Progress Planner]
  A --> W[Team choice checks]
  C[Game type chart] --> Y[Type analysis]
  T --> Y
```

1. Resolve the selected milestone and its mandatory ancestors.
2. Resolve accessible locations, item sources, and capabilities.
3. Seed paths from allowed Pokémon sources. Apply the level rule to source levels.
4. Follow evolution and breeding rules until no new valid paths appear.
5. Keep source IDs, parent proofs, minimum levels, choices, and resource uses in paths.
6. Check future milestones to find the first valid access points for blocked entries.
7. Return available, later, blocked, or unavailable status with clear reasons.

Use a finite set of useful witness paths. Keep alternatives when they change
choices, required resources, access points, or minimum level. Stop cycles; a
Pokémon cannot become available merely because a rule needs that same Pokémon.

A level-up evolution requires a level gain. Its minimum output level is the
greater of the rule's minimum level and the parent's minimum level plus one.
An item evolution keeps the parent's minimum level. Game trades must use their
actual level rule; do not assume every received Pokémon has a fixed level.

Evolution conditions include level, stone access, friendship, time, Beauty,
stat comparison, personality, and special Emerald conditions. Player trade
rules remain visible as blocked rules. They never make a Pokémon available.
Do not claim a condition is met unless the game data and rule evaluator prove it.

Available Pokémon remain available through evolution even when the final form
has no direct encounter. An unavailable base species does not unlock its family.
Turning the level limit off changes level checks only. It does not unlock areas,
items, game trades, player trades, or other-version Pokémon.

For each Pokémon, show the valid base source, the location, evolution steps,
requirements, and first access points. Do not show an arbitrary first encounter
if a different acquisition path is earlier or avoids a choice conflict.

## Team choice checks

Individual availability and team feasibility are different results.
Keep acquisition alternatives so the team check can find a compatible set of paths.

Check choice groups such as starter selection. Also check finite source uses and
finite items consumed by the selected paths. Try all useful path combinations for
the six slots before showing a conflict. A shared evolution ancestor alone is not
proof of a conflict. A repeatable source can supply more than one Pokémon.

Warn when no compatible path assignment exists. Explain the source, choice, or
resource that causes it. Do not erase team members. A future source can remove a
current-progress conflict; a whole-game result must therefore check future access.

Breeding parents and held items remain reusable. Combine proofs of repeated parent
use instead of counting each egg as a new use of a one-time starter. Two parents
must still be distinct Pokémon. A single finite source cannot supply both parents
when it provides only one Pokémon. Keep gender assignments and resource limits
consistent across the whole plan. A parent can breed before a later evolution or
game trade; the team check must find a valid order for those actions.

## Breeding rules

Include breeding when the Day Care, two compatible parents, and required held
items are accessible. Check actual possible genders for each acquisition path.
Do not use a species-wide gender list when a particular gift or trade fixes gender.
Keep reviewed gender transitions through evolutions and separately created products.
Parent access must be possible under the selected progress and level settings.

Use the selected game's Egg Groups and compatibility rules. Handle Ditto and
non-breeding species explicitly. The
[Emerald Day Care code](https://github.com/pret/pokeemerald/blob/master/src/daycare.c)
defines compatibility, offspring, and incense conditions.

Maintain offspring rules by hand in `breeding-rules.json`. Each rule names the
eligible family parents, possible offspring species, and required held item.
The module finds a compatible partner from accessible Pokémon profiles. Do not
enter every possible species pair. Each result must include a concrete parent
pair with valid acquisition proofs.

Keep ordinary egg gifts separate from breeding sources. For Emerald, use its
actual hatch level. Apply the level limit to both parent access and the hatched
Pokémon. Show parents, Day Care access, required items, and hatch level in details.
Inherited moves and breeding for battle stats remain outside the type-only MVP.

Breeding can permit several forms of one starter family. Each offspring keeps
the original starter choice. A breeding cycle with no accessible parents does
not unlock a species. Preserve these proofs when resolving later evolutions.

## Type analysis

Use Emerald's Pokémon type profiles and its type chart. Shared Pokémon identity
data contains names and Dex numbers; it does not impose modern types on old games.
For example, Emerald's Ralts profile is Psychic. See the
[Emerald species data](https://github.com/pret/pokeemerald/blob/master/src/data/pokemon/species_info.h).

For each attacking type, multiply its chart entries against both defending types.
Count values greater than 1 as weaknesses, values between 0 and 1 as resistances,
and 0 as immunities. Keep 2× and 4× weaknesses visible in Pokémon details.

For attack coverage, use each distinct team type as an attacking type. A defending
type is covered when at least one team type deals more than 1× damage to it.
The denominator is the selected game's active type count. It is not fixed at 18.
Show repeated types separately. Do not imply that a Pokémon has learned a move.

## Data files and checks

The [data contract](data-contract.md) specifies all files and references.
The [TypeScript contract](data-types.md) defines input and result types.
The [JSON Schema](schema/planner-data.schema.json) checks the assembled dataset.

Write and check data in story sections. Start with the route to the first Gym.
Then add each section through the League and normal post-game areas. Each complete
section must work before the next one is added. The MVP is complete only when the
agreed full route and event coverage is present.

Keep a reference and review date for each record. Check the original game and
its source data. The [Emerald decompilation](https://github.com/pret/pokeemerald)
is a reference for manual review, not an automated import. Use a recorded revision
when checking data. Correct errors in the maintained JSON files.

Validate JSON shape first. Then check IDs, graph cycles, references, type-chart
dimensions, version types, source levels, choice limits, and catalogue coverage.
Missing data is a data error. It must not silently become an unavailable Pokémon.

## Implementation anchors

These paths contain the application modules.

| Module | Small public interface | Path |
| --- | --- | --- |
| Data validation | `validateDataset(input)` | `src/data/validate-dataset.ts` |
| Availability | `getAvailability(data, query)` | `src/domain/availability/index.ts` |
| Team feasibility | `checkTeam(snapshot, team, target)` | `src/domain/team/check-team.ts` |
| Type analysis | `analyzeTypes(data, team)` | `src/domain/team/analyze-types.ts` |
| Planner state | Settings and six selected IDs | `src/features/planner/state.ts` |
| Team view | Render team and analysis | `src/App.tsx`, `src/features/team/` |
| Progress view | Render availability results | `src/features/progress/PokemonSearch.tsx` |

Keep graph traversal, requirements, and path selection inside the availability
module. Pages render results; they do not duplicate access or evolution rules.
The state layer owns user changes. Domain modules have no UI or storage effects.

The stack is React, TypeScript, and Vite. Use local state for this small
application. Use Ajv's Draft 2020-12 support with `ajv-formats` for data checks,
and Vitest for domain tests. Package versions are recorded in `package.json`
and `package-lock.json`.
See [React state guidance](https://react.dev/learn/managing-state),
[Vite setup](https://vite.dev/guide/), [Ajv schema support](https://ajv.js.org/json-schema.html#draft-2020-12),
and [format checks](https://ajv.js.org/guide/formats.html).

## Build order and completion checks

| Step | Work | Completion check |
| --- | --- | --- |
| 1 | Check the route and event inventory. | Every route and event has a named record owner and story section. |
| 2 | Set up the application and data validator. | Invalid records fail with file and record IDs. |
| 3 | Enter one complete early-game data section. | References, levels, gates, and chart entries pass review. |
| 4 | Build the availability module. | Direct sources, evolution, breeding, level limits, and exclusions pass focused tests. |
| 5 | Build Progress Planner. | The first section shows sources and blocked reasons from the shared module. |
| 6 | Build Team Planner and choice checks. | Six slots, both targets, source alternatives, and conflict warnings work. |
| 7 | Add type analysis. | Dual types, immunities, repeated types, and coverage pass known examples. |
| 8 | Enter and check all remaining Emerald sections. | Every route, story event, and catalogue entry has a reviewed outcome. |
| 9 | Check both planners together. | Settings stay shared; progress changes update warnings without losing the team. |

Core regression cases: a route unlocked before a fishing method; a multi-stage
evolution crossing the level limit; a level-up needed after a high-level capture;
an item evolution before stone access; a game trade before its offered Pokémon;
a player-trade-only form; an other-version species; an exclusive starter team;
an alternative source that removes a conflict; and a Pokémon retained from an
earlier acquisition point. Add breeding cases for Day Care access, compatible and
incompatible parents, fixed-gender gifts, Ditto pairs, required incense, repeated
eggs from one parent pair, a starter family with several forms, and a breeding
cycle with no initial parent source. Test parent and hatch levels at the limit.

## Design choices

Use one availability module, explicit results, dependency-based milestones,
version-correct type profiles, and manual data with review references.
Do not duplicate rules across pages or use badge count as the only progress value.
Do not add an import pipeline, a backend, accounts, move databases, or a world map.

The product choices, route/event list, and manual data set are implemented.
The completion checks are recorded in [implementation checks](implementation-checks.md).
