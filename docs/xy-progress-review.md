# X and Y Progress Planner review

Reviewed on 21 October 2026. Both games now load in Progress Planner.
All data stays in local JSON. The app makes no data request at runtime.

| Collection | X | Y |
| --- | ---: | ---: |
| Base profiles | 721 | 721 |
| Milestones | 76 | 76 |
| Locations | 62 | 62 |
| Capabilities | 41 | 41 |
| Items | 59 | 59 |
| Sources | 1,092 | 1,091 |
| Evolution rules | 364 | 364 |
| Breeding rules | 324 | 324 |
| Egg sources | 326 | 326 |
| Choices | 3 | 3 |
| Alternate form profiles | 19 | 19 |
| Form changes | 18 | 18 |
| Exclusions | 271 | 271 |

The complete game check resolves 435 native species and 13 alternate forms.
Fifteen more species need player trade. They have trade blockers, not false
exclusions. Friend Safari needs another player's registration. Its species
remain outside the offline scope unless another native source exists.

## Source evidence

The review uses PKHeX revision
`641c26ba100225f3605e5a44b61b3b16e15a3774` and PokeAPI revision
`81d20919845b6a445969b9265aab5cec6b04cece`. Personal records, evolution
tuples, fixed templates, wild pools, detailed methods, levels, and forms have
separate comparisons. PKHeX gives legality evidence. It is not a complete
native script source. The story and item reviews also use the references
stored in `data/references.json`.

The full exclusion review compares the unavailable list, version lists,
194 Friend Safari rows, and evolution and breeding paths. X has 136 connection,
16 event, and 119 other-game exclusions. Y has 129, 16, and 126. No exclusion
has an unresolved category. The species rows and source hashes stay in
`output/game-proposals/xy-exclusion-inventory-check.json`.

## Story and resources

Route 22 opens before Viola. Route 10 opens before Grant. Route 13 opens
before Ramos. Route 21 opens before Wulfric. Field actions keep their badge
and item requirements. Zygarde has a separate post-credits chamber gate.
The ordinary Terminus Cave floors open earlier.

Side-area checkpoints are visit bookmarks. Area entry rules use the required
story unlock. The area stays reachable at later checkpoints. The Super Rod
needs Route 15 access and Strength for the Route 16 visit. A separate Route 16
bookmark is not a permanent receipt lock.

Kalos starters, Kanto starters, and the story fossils have separate choices.
Shauna's gift and the roaming bird retain the original Kalos starter choice.
One save can have two Kalos starters through Shauna. It cannot have all three.
The hotel and Steelix NPC trades keep their one-animal limits. An NPC that
accepts any Pokemon uses a real consumed Bunnelby as one valid offer.

The six berry-tree colors need native seed berries. Repeatable daily gifts
do not use a permanent save choice. Wild held items require an actual native
capture path. Secret Super Training needs a fully trained Pokemon and the
training stages. Early access and repeated reward attempts are an inference
from the official unlock description and the checked training flow.
See [the decision record](../output/game-proposals/xy-integration-decisions.md).

## Forms and source limits

Meowstic's base selection is male. Its female selection has its own profile
and image. Rotom appliances have the Generation VI types. All four Pumpkaboo
sizes have native paths. Each Gourgeist size remains blocked by player trade.
Form-only eggs name exact parent forms. Cosmetic colors, fish stripes, and
Vivillon patterns use one species profile. Mega and stance changes remain
battle states, not permanent evolution rules.

The 12 new local form images use pinned sprite revision
`ba403973fdf9d0ac59175813861e6a1f8ed5020c`. The seven existing form images
keep their earlier review records. Origin Giratina has a supported profile
and Orb rule, but no native starting animal.

Each wild source keeps its area and method pool separate. Repeated cave
floors do not add encounter rates. Some identical pools use the containing
cave name because the exact floor join remains uncertain. Those pools have
the same species, minimum levels, and access gates.

The Y Frost Cavern area 744 rare row is Haunter in both pinned resources.
One guide gives Cryogonal there. Other Y floors have Cryogonal at the same
level. The review keeps the Y row and records the conflict. Three Y Horde
levels use the detailed dataset and checked gameplay tables, with the PKHeX
disagreement retained in the review report.

## Checks

Progress PNG exports select compatible paths for the whole team. Two starters
use the original choice and Shauna's later trade. Two Snorlax use the static
capture and a separate egg. Exports keep choice and finite-source conflicts
visible. Empty slots keep their position. Direct catches remain preferred
when they fit the team.

Evolution branches name their source when a species has more than one
outcome. Gender-specific rules show the required source gender. Both Meowstic
forms therefore show a separate path from Espurr on narrow screens.

The candidate schema checks and complete game access checks pass for both
versions. Tests use the active data for early routes, field moves, gender
forms, party-type evolution, rain evolution, postgame gates, starter choices,
fossil choices, finite trades, and repeatable Rotom forms. The full test,
build, and browser results are recorded in
[implementation checks](implementation-checks.md).
