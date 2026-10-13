# Pokémon Gold source review

Reviewed on 2026-10-12. The primary source is `pret/pokegold` at commit
`ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8` (the upstream `master` head at
review time). Each URL below pins that revision. The source repository is a
disassembly of the original English Pokémon Gold release.

The pinned checkout was obtained and verified locally at this exact commit.
The reviewed Bug-Catching Contest table has ten weighted rows with level
ranges. In `engine/overworld/events.asm`, `ChooseWildEncounter_BugContest`
draws a value from 0 through 99 and subtracts each row's weight. The ten
ordinary rows sum to 100, so the terminal `-1, VENOMOTH, 30, 40` row is never
selected. The same file sets the separate encounter frequency to 20 percent
in normal grass and 40 percent in super-tall grass. The `ratePercent` values
in `sources.json` record the species mix within an encounter. They do not
claim the per-step encounter frequency. The rows now appear in `sources.json`
under the `bug-contest` capability. The exact source files are
`data/wild/bug_contest_mons.asm`, `engine/overworld/events.asm`,
`engine/events/bug_contest/contest.asm`, and the contest gate scripts in
`maps/Route35NationalParkGate.asm` and `maps/Route36NationalParkGate.asm`.

The pinned regular wild tables now have reviewed Gold records. The two grass
files contain 91 map tables. Each map has morning, day, and night windows with
seven ordered slots. `data/wild/probabilities.asm` assigns those slots shares of
30, 30, 20, 10, 5, 4, and 1 percent. The source keeps each slot as a separate
fixed-level record. `data/wild/johto_water.asm` and
`data/wild/kanto_water.asm` contain 62 Surf tables with three slots each. Their
60, 30, and 10 percent values are conditional table shares. The separate
per-step encounter chance in each table is not stored as a slot share.

Fishing uses the map's `FISHGROUP_*` in `data/maps/maps.asm` and the rod tables
in `data/wild/fish.asm`. The records cover all 61 water-table maps with a fishing
group, all three rods, and the source's day/night variants. Celadon City has a
Surf table but uses `FISHGROUP_NONE`, so it has no fishing records. The
Qwilfish and Remoraid swarm-only fishing variants are not part of the reviewed
regular rod tables.

Headbutt records now cover every usable Gold tree-set map in
`data/wild/treemon_maps.asm`. Each map's common and rare rows come from its
Gold table in `data/wild/treemons.asm`; source IDs keep the table variant and
slot. Their percentages are conditional shares within that selected table.
The engine separately chooses the tree score and encounter chance, so those
shares are not overall per-step chances.

Swarm records cover the four Gold grass replacement tables and the Mount
Mortar 1F outside water table in `data/wild/swarm_grass.asm` and
`data/wild/swarm_water.asm`. Grass keeps the three time tables, and the water
table keeps its three Surf slots. Swarm reports gate all five replacement
tables. `BurnedTowerB1F.asm` releases the three beasts and sets
`EVENT_RELEASED_THE_BEASTS` before the Morty Gym event. The roaming region
records the 16 route maps in `data/wild/roammon_maps.asm`; Routes 40 and 41 are
not in that table. Each beast is a single level 40 roaming source gated by the
release event. See [Gold coverage](gold-coverage.md).

The following reference objects were reviewed and merged into
`data/references.json`. IDs are game-specific.

```json
[
  {"id":"gold-species","title":"Gold species types, gender ratios and Egg Groups","locator":"data/pokemon/base_stats.asm and data/pokemon/base_stats/*.asm","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/data/pokemon/base_stats","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"gold-dex","title":"Gold Pokédex order and species list","locator":"data/pokemon/dex_order_new.asm and constants/pokemon_constants.asm","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/data/pokemon","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"gold-type-chart","title":"Generation II type matchups","locator":"data/types/type_matchups.asm and engine/pokemon/types.asm","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/data/types","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"gold-encounters","title":"Gold wild encounters, fishing, swarms and roaming species","locator":"data/wild/johto_grass.asm, data/wild/kanto_grass.asm, data/wild/johto_water.asm, data/wild/kanto_water.asm, data/wild/fish.asm, data/wild/swarm_grass.asm, data/wild/swarm_water.asm, data/wild/roammon_maps.asm","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"gold-headbutt-contest","title":"Headbutt encounters and Bug-Catching Contest species","locator":"data/wild/treemons.asm, data/wild/treemon_maps.asm, data/wild/bug_contest_mons.asm, engine/events/treemons.asm, engine/overworld/events.asm, engine/events/bug_contest","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/data/wild","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"gold-progression","title":"Gold story, route and event scripts","locator":"maps/*.asm and data/maps/scripts.asm","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/maps","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"gold-bosses","title":"Gold Gym, Elite Four, Champion and Red teams","locator":"data/trainers/leaders.asm and data/trainers/parties.asm","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/data/trainers","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"gold-evolutions","title":"Gold evolution triggers and levels","locator":"data/pokemon/evos_attacks.asm and engine/pokemon/evolve.asm","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/data/pokemon","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"gold-breeding","title":"Gold breeding, offspring and egg levels","locator":"engine/pokemon/breeding.asm, engine/events/daycare.asm and maps/Daycare.asm","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/engine/pokemon","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"gold-items","title":"Gold item placements, marts, berry trees and key items","locator":"maps/*.asm, data/items/marts.asm, data/items/fruit_trees.asm and constants/item_constants.asm","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/data/items","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"gold-trades","title":"Gold in-game NPC trades","locator":"data/events/npc_trades.asm, constants/npc_trade_constants.asm and maps/*.asm","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/data/events/npc_trades.asm","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"gold-choices","title":"Gold starter and one-time Pokémon choices","locator":"maps/NewBarkTown.asm, maps/SilverCaveRoom1.asm and event scripts under maps/","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/maps","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"gold-time","title":"Gold time, weekday, swarm, phone and evolution conditions","locator":"home/time.asm, engine/events/checktime.asm, engine/pokemon/evolve.asm and engine/phone/phone.asm","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/engine","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"gold-hatch","title":"Gold egg hatch level and hatch handling","locator":"engine/pokemon/breeding.asm and engine/events/happiness_egg.asm","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/engine/pokemon/breeding.asm","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"gold-exclusions","title":"Gold version, trade and event acquisition limits","locator":"data/wild/*.asm, data/pokemon/evos_attacks.asm, data/events/npc_trades.asm and event scripts under maps/","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"}
]
```

## Collection source map

| Gold collection | Review references |
| --- | --- |
| `game.json` | `gold-progression`, `gold-hatch`, `gold-time` |
| `pokemon.json` (profiles) | `gold-species`, `gold-dex` |
| `type-chart.json` | `gold-type-chart` |
| `progression.json` | `gold-progression`, `gold-time` |
| `bosses.json` | `gold-bosses`, `gold-progression` |
| `locations.json` | `gold-progression`, `gold-encounters`, `gold-headbutt-contest` |
| `capabilities.json` | `gold-progression`, `gold-items`, `gold-time` |
| `items.json` | `gold-items`, `gold-progression` |
| `choices.json` | `gold-choices`, `gold-trades` |
| `sources.json` | `gold-encounters`, `gold-headbutt-contest`, `gold-progression`, `gold-trades`, `gold-choices` |
| `breeding-rules.json` | `gold-breeding`, `gold-species`, `gold-hatch` |
| `evolutions.json` | `gold-evolutions`, `gold-time`, `gold-items`, `gold-progression` |
| `exclusions.json` | `gold-exclusions`, `gold-encounters`, `gold-trades` |

The planner asks what the player can obtain by each story point. It does not
model the current clock, calendar date, or roaming position in a save file.
Use capabilities as reachable opportunities, as Emerald does for day/night,
Mirage Island, and the TV roaming choice. A time- or weekday-limited source can
be available once the story permits reaching any valid window. A random or
roaming encounter can be available when the player can eventually trigger it.
Keep its reviewed milestone gate, finite uses, and choice. Do not imply that it
is available before its story flag.

The current shared source model supports both `headbutt` and `bug-contest`
methods. The remaining issue is whether its single `ratePercent` field can
express Headbutt's tree-table weights without implying an overall chance:

- `headbutt`: a wild encounter from a Headbutt tree. It requires a `headbutt`
  capability under the existing explicit-method rule. `data/wild/treemon_maps.asm`
  maps routes and towns to tree sets. `data/wild/treemons.asm` has separate
  common and rare species tables, and `engine/events/treemons.asm` chooses the
  table and encounter chance from a hidden tree score. Preserve the map, tree
  set, and table in source IDs or labels. A table slot's percentage is not the
  overall chance to encounter that species, so do not present it as one.
- `bug-contest`: a wild encounter available in the National Park contest. It
  requires a `bug-contest` capability. The capability records the earliest
  story point when the Park/contest can be reached. The source is a possible
  capture during the contest, not a contest prize. `data/wild/bug_contest_mons.asm`
  gives species weights and level ranges. The terminal `-1, VENOMOTH, 30, 40`
  row is a special case; review its selection code before storing a numeric
  encounter rate for Venomoth.

These source tables require the matching explicit capabilities. Do not replace
them with `grass` or `static`.

Gold supports existing `time` and `stats` evolution conditions. Model morning,
day, night, weekdays, swarm reports, roaming releases, and phone opportunities
as reviewed reachable capabilities or milestones where they affect first
access. The model blockers here are data review and source display detail, not
clock-state simulation. Gold and Silver source differences still require
Gold-pinned review for each Gold record.

The starter scripts in `maps/ElmsLab.asm` and Route 32 Old Rod gift in
`maps/Route32Pokecenter1F.asm` are also confirmed at the pinned revision.
Gold-specific non-wild differences were checked in the pinned checkout:
`TinTowerRoof.asm` sets Ho-Oh to level 40, `WhirlIslandLugiaChamber.asm`
requires the Silver Wing awarded in Pewter City, and `UnionCaveB2F.asm` offers
Lapras on Fridays. `BillsHouse.asm` gives the four one-time evolution stones
after the player shows the matching species. `MountMoonSquare.asm` reopens its
Moon Stone opportunity each week. Gold base-stat records also list wild-held
King's Rock, Dragon Scale, and Metal Coat species. See [Gold coverage](gold-coverage.md).


## Static legend and wing scripts

At the pinned revision, maps/PewterCity.asm PewterCityGrampsScript checks checkver: the Gold branch gives SILVER_WING and sets EVENT_GOT_SILVER_WING (lines 24–42); the Silver branch .RainbowWing gives RAINBOW_WING and sets EVENT_GOT_RAINBOW_WING (lines 44–53). Gold records the Pewter City Silver Wing as a one-use item source after Kanto opens. maps/WhirlIslandLugiaChamber.asm WhirlIslandLugiaChamberLugiaCallback checks SILVER_WING before the Lugia sprite appears (lines 10–20). The Lugia script loads Gold Lugia at level 70 (lines 23–42). The static record requires the wing, Surf, and Whirlpool and has one use. maps/TinTower9F.asm and the Ho-Oh event scripts retain the Gold level 40 encounter and Rainbow Wing gate.
