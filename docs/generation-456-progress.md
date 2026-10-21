# Generation IV–VI data review

Updated on 21 October 2026. All thirteen games load in Team Planner.
Diamond, Pearl, Platinum, X, and Y also load in Progress Planner. Their selector
state is **Ready**. The other eight games remain **Team ready** while their
access review continues.

The task manifest records the child tasks. These include native access proposals,
wild table evidence, regional lists, source checks, and parallel regression tests.
The parent checks written records before integration. A completed research
task does not mean that the game's Progress Planner is complete.

## Completed base data

| Generation | Game | Base profiles | First Gym and League caps | Types | Regional numbers reviewed |
| --- | --- | ---: | ---: | ---: | --- |
| IV | Diamond | 493 | 13 | 17 | Sinnoh 1–151 |
| IV | Pearl | 493 | 13 | 17 | Sinnoh 1–151 |
| IV | Platinum | 493 | 13 | 17 | Sinnoh 1–210 |
| IV | HeartGold | 493 | 13 | 17 | Johto 1–256 |
| IV | SoulSilver | 493 | 13 | 17 | Johto 1–256 |
| V | Black | 649 | 14 | 17 | Unova 000–155 |
| V | White | 649 | 14 | 17 | Unova 000–155 |
| V | Black 2 | 649 | 14 | 17 | Unova 000–300 |
| V | White 2 | 649 | 14 | 17 | Unova 000–300 |
| VI | X | 721 | 14 | 18 | Central 1–153, Coastal 1–153, Mountain 1–151 |
| VI | Y | 721 | 14 | 18 | Central 1–153, Coastal 1–153, Mountain 1–151 |
| VI | Omega Ruby | 721 | 13 | 18 | Hoenn 1–211 |
| VI | Alpha Sapphire | 721 | 13 | 18 | Hoenn 1–211 |

The 7,945 base profiles have game-specific review references. All types,
gender categories, and Egg Groups match the pinned PKHeX personal tables.
Diamond and Pearl also have reviewed plain-text personal sources. Profiles
do not prove native acquisition. The boss files contain initial battle caps.
Some games also have a final story trainer. Kanto bosses, rematches, and
other story fights still need review.

Shared identities now reach National Dex 721. The 335 added species have
pinned English names and National Dex order. All base species have local
PNG images. Fairy uses the existing type icon source and license.

Regional number 000 now works in validation, catalogue labels, and sorting.
Black, White, Black 2 and White 2 use that number for Victini. Kalos now has
named sections. Each section has its own number sequence. All regional maps
match pinned PokeAPI revision `81d20919845b6a445969b9265aab5cec6b04cece`.
The Diamond, Platinum and HeartGold proposals also use pinned native game
lists. The parent checked every proposal pair against the pinned CSV.
A regional list followed by National Dex order supports Sinnoh and Johto.

## Source checks and corrections

The parent found 20 wrong Generation VI type-chart cells. These included
reversed Fairy interactions and old Steel resistances. All four corrected
charts match all 324 interactions in the pinned battle chart source. All five
Generation IV charts match the 289 interactions in two pinned battle sources.

The parent also corrected 1,190 profile fields. Platinum repeated some types
and Egg Groups. Generation V and Pearl had scalar gender values. Pearl used
null breeding data for Undiscovered species and Ditto. Undiscovered is an Egg
Group; null means the game has no breeding system. The source comparison and
schema checks now pass for every base profile.

The X agent's fifth round returned a Y check. The parent used that verified
shared X/Y table check to complete X, with X references, then ran a separate
comparison against all 721 source rows. The report retains each agent result
and records the later corrections.

## Remaining work

Platinum's active layer has 84 milestones, 201 locations, 2,213 sources,
251 evolution edges, 234 breeding rules, eight form changes, and 97 exclusions.
The solver reaches 382 species and seven alternate forms. Fourteen species
need player trade. See [the Platinum review](platinum-progress-review.md).

Diamond and Pearl each have 84 milestones, 180 locations, 251 evolution edges,
234 breeding rules, six form changes, and 117 exclusions. Diamond has 1,903
sources. Pearl has 1,901. Each resolves 363 native species and six alternate
forms. Thirteen further species require player trade. See
[the Diamond and Pearl review](diamond-pearl-progress-review.md).

X and Y each have 76 milestones, 62 locations, 364 evolution rules, 324
breeding rules, 18 form changes, and 271 exclusions. X has 1,092 sources.
Y has 1,091. Each resolves 435 native species and 13 alternate forms.
Fifteen further species require player trade. See
[the X and Y review](xy-progress-review.md).

The eight other games still need reviewed routes, story dependencies, capabilities,
item sources, choices, native encounters, evolution rules, breeding rules,
and native-scope exclusions. `game.planner` and `game.firstMilestoneId` are
explicitly null for those eight games. Empty progress arrays mean that
this review is pending. They are not proof that a game has no such records.

The Diamond and Pearl native encounter, evolution, breeding, gift, fossil,
trade, and story reviews are now integrated. The remaining checked proposals
include 36 White static and gift templates. X and Y now use the later detailed
wild and fixed reviews. Their old raw proposals include zero-species resource
rows. Those rows are not encounters. The Black raw proposal still needs its
complete progress joins. These proposals are stored under
`output/game-proposals/`; they are not active acquisition data.

The shared model now has explicit form references. Nineteen reviewed
forms have local images. Profiles, access paths, evolution rules, team slots,
type checks, and exports use the selected form under one species identity.
Form changes retain the captured animal and check separate held item copies.
Form-only breeding rules name their exact parent forms. Mega and Primal battle
states still need separate treatment from permanent evolution.

Known moves, held items at level gain, party species, and evolution locations
now have explicit domain rules and regression checks. The shared encounter
model now covers Honey Trees, Radar, time, weekday, swarms, daily rotations,
and Feebas tiles. These rules still need each game's reviewed records.
Party type, affection, natural rain, and device orientation now have shared
rules, validation, details, export text, and regression tests. The rules retain
real party species and their resource costs. Affection remains separate from
friendship. Each game still needs its reviewed records for those actions.
See [the Generation VI evolution review](generation-6-evolution-review.md).
Hordes and Kalos ambush methods now have active records and checks.
Safari block conditions now have shared validation and instructions. Their
HGSS access joins, Hidden Grottoes, and DexNav remain open where needed.

Guaranteed held items from one-time gifts, starters, static captures, and NPC
trades now keep the holder's actual acquisition proof. Item records for the
same holder share one loot limit. A trade holder and its item can share the
original offer cost. They cannot provide two copies of that item. This does
not add any unreviewed HeartGold or SoulSilver acquisition records.

The scope stays native and offline. Player trades, transfers, external
distributions, connected-service rewards, and Pokéwalker transfers are outside
the scope. Record actual exclusions after reviewing each game. Do not use
exclusions to hide missing native data.

## Checks and report

The focused draft checks cover all thirteen base profile, boss, and chart
collections. They do not skip games with pending progress. The registered-game suite
and production build pass. The latest full test counts and browser scope are
in [implementation checks](implementation-checks.md). Run these checks again
after each data or domain change.
`npm run data:check` now checks all 24 registered games. Team data checks still
validate profiles, references, type charts, boss records and regional order.
The domain returns `progress-not-ready` for a game without progress coverage.

Production browser checks pass all thirteen games. They cover catalogue
counts, shared team slots, types, PNG export, and the pending progress message.
Kalos details, Escape, the 320-pixel layout, and accessibility checks pass.
The team bar leaves the page with the team panel when progress is pending.
The focused browser check for that lifecycle now passes.

The [usage report](../output/game-usage-report.html) contains all game findings,
all recorded child tasks, separate parent use, measured tokens, API estimates,
source revisions, checks, corrections, data sizes, filters, and CSV export.
It preserves the earlier Generation I–III audit. Its saved time marks the last
measured request. Later work requires a new snapshot.
The report keeps previous native session IDs when the server restarts. It
combines those sessions in one parent row. A focused check confirms that the
previous token total remains included and each thread appears once.

The source comparison results and task manifest are under `output/`.
Each game has source, coverage, and form notes under `docs/`. Add one complete
game's acquisition and form layers next. Enable its progress data only after
the access coverage and planner checks pass.

## Diamond and Pearl source correction, 18 October 2026

The native script loader reads relative 32-bit entry offsets. The old reader
used absolute offsets and an incorrect size field. Its 277 accepted-bank count
is superseded. The reviewed Pearl gift paths now use the correct entry lookup,
variable tracing and event joins.

The corrected reader now checks all 446 distinct map-selected script tables
from 559 map bindings. It finds 1,798 entry offsets. This checks the table
format, not every command or story path. Exact event traces prove Pearl's Old
Rod and Good Rod gifts. Diamond's Lost Tower 5F script proves its HM04 gift.
Platinum's different HM04 source must not replace this Diamond record.

Pearl's native wild layout is now decoded from all 183 members. The native
build selector and map headers join 154 members to 154 maps. The review keeps
2,052 nonzero grass rows and 1,060 nonzero water rows. Twelve members have
ordinary species differences from Diamond. These are source rows, including
runtime pool placeholders. They need special-pool and story joins before use.

The Generation V detailed comparison checks 12,748 wild rows. Black and
White each have 2,654 rows in 80 areas and 214 species. Each sequel has 3,720
rows in 108 areas and 238 species. All native location IDs, species, method
groups and level ranges match the reviewed version's legality resource.
Further legality rows include swarms, White Forest and Hidden Grottoes.
The shared model now keeps the detailed methods and seasonal conditions.
Story gates, special mechanism conditions and fixed sources remain open.

Nine focused tests check those methods, separate Surf and Super Rod access,
season validation, progress results, labels and export instructions.
The Platinum integration fixtures now build in their setup phase. Their
assertions no longer include the cost of creating the full data fixture.

HeartGold and SoulSilver each have reviewed wild rows for 244 species. The Safari review
now distinguishes raw age levels from elapsed days. The maximum block
contribution starts at 250 days. Fixed gifts and other non-wild sources
still need separate records and access checks.

The current HGSS packet has 11,664 rows per version, with separate time and
special-pool conditions. Native swarm rows use only the 20 map and method
pairs that the game can select. The rule candidates have 247 evolution records
and 234 breeding rules per version. Four unusable location evolutions are
excluded from those candidates. See [the HGSS work record](hgss-progress-review.md)
for the source limits and remaining joins. Neither game is Progress ready yet.
