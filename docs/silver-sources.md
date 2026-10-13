# Pokémon Silver source review

Reviewed on 2026-10-12. The primary source is `pret/pokegold` at commit
`ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8`, the upstream `master` head at
review time. The repository builds both Gold and Silver. Review Silver-specific
conditional data in the Silver build; a Gold record does not prove a Silver
record. See the [source repository](https://github.com/pret/pokegold) and its
[pinned revision](https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8).

The following reference objects are proposed for `data/references.json`. Keep
them here until the parent agent merges them. IDs are Silver-specific.

```json
[
  {"id":"silver-species","title":"Silver species types, gender ratios and Egg Groups","locator":"data/pokemon/base_stats.asm and data/pokemon/base_stats/*.asm; review Silver conditionals","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/data/pokemon/base_stats","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"silver-dex","title":"Silver Pokédex order and species list","locator":"data/pokemon/dex_order_new.asm and constants/pokemon_constants.asm","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/data/pokemon","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"silver-type-chart","title":"Generation II type matchups in Silver","locator":"data/types/type_matchups.asm and engine/pokemon/types.asm","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/data/types","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"silver-encounters","title":"Silver land, water and fishing encounters","locator":"data/wild/johto_grass.asm, data/wild/kanto_grass.asm, data/wild/johto_water.asm, data/wild/kanto_water.asm, data/wild/fish.asm, data/wild/probabilities.asm, data/maps/maps.asm and Silver-specific conditionals","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/data/wild","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"silver-special-encounters","title":"Silver Headbutt, Bug-Catching Contest, swarm and roaming encounters","locator":"data/wild/treemons.asm, data/wild/treemon_maps.asm, data/wild/bug_contest_mons.asm, data/wild/swarm_grass.asm, data/wild/swarm_water.asm, data/wild/roammon_maps.asm, engine/events/treemons.asm, engine/overworld/wildmons.asm and their map/event handlers","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/data/wild","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"silver-progression","title":"Silver Johto and Kanto story, route and event scripts","locator":"maps/*.asm and data/maps/scripts.asm; check Silver-specific map and script conditionals","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/maps","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"silver-bosses","title":"Silver Gym, Elite Four, Champion and Red teams","locator":"data/trainers/leaders.asm and data/trainers/parties.asm; select Silver trainer parties","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/data/trainers","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"silver-evolutions","title":"Silver evolution triggers, levels and conditions","locator":"data/pokemon/evos_attacks.asm and engine/pokemon/evolve.asm","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/data/pokemon","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"silver-breeding","title":"Silver breeding, offspring, compatibility and Day Care access","locator":"engine/pokemon/breeding.asm, engine/events/daycare.asm and maps/Daycare.asm","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/engine/pokemon","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"silver-items","title":"Silver item placements, marts, fruit trees and key items","locator":"maps/*.asm, data/items/marts.asm, data/items/fruit_trees.asm and constants/item_constants.asm","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/data/items","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"silver-trades","title":"Silver in-game NPC trades","locator":"data/events/npc_trades.asm, constants/npc_trade_constants.asm and Silver trade scripts under maps/","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/data/events/npc_trades.asm","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"silver-choices","title":"Silver starter, one-time gifts and choice events","locator":"maps/NewBarkTown.asm, maps/SilverCaveRoom1.asm and one-time event scripts under maps/","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/maps","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"silver-time","title":"Silver clock, weekday, swarm, phone and timed evolution rules","locator":"home/time.asm, engine/events/checktime.asm, engine/pokemon/evolve.asm and engine/phone/phone.asm","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/engine","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"silver-hatch","title":"Silver egg hatch level and hatch handling","locator":"engine/pokemon/breeding.asm and engine/events/happiness_egg.asm","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/engine/pokemon/breeding.asm","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"},
  {"id":"silver-exclusions","title":"Silver version, player-trade and external-event acquisition limits","locator":"Silver-specific data/wild/*.asm, data/pokemon/evos_attacks.asm, data/events/npc_trades.asm and map event scripts","url":"https://github.com/pret/pokegold/tree/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8","revision":"ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8"}
]
```

## Collection source map

| Silver collection | Review references |
| --- | --- |
| `game.json` | `silver-progression`, `silver-hatch`, `silver-time` |
| `pokemon.json` (profiles) | `silver-species`, `silver-dex` |
| `type-chart.json` | `silver-type-chart` |
| `progression.json` | `silver-progression`, `silver-time` |
| `bosses.json` | `silver-bosses`, `silver-progression` |
| `locations.json` | `silver-progression`, `silver-encounters`, `silver-special-encounters` |
| `capabilities.json` | `silver-progression`, `silver-items`, `silver-time` |
| `items.json` | `silver-items`, `silver-progression` |
| `choices.json` | `silver-choices`, `silver-trades` |
| `sources.json` | `silver-encounters`, `silver-special-encounters`, `silver-progression`, `silver-trades`, `silver-choices` |
| `breeding-rules.json` | `silver-breeding`, `silver-species`, `silver-hatch` |
| `evolutions.json` | `silver-evolutions`, `silver-time`, `silver-items`, `silver-progression` |
| `exclusions.json` | `silver-exclusions`, `silver-encounters`, `silver-trades` |

The repository's `make silver` target confirms this source tree includes a
Silver build. Review version-specific branches for every Silver record.

## Reviewed records

The first reviewed layer is `pokemon.json`, `type-chart.json`, and
`bosses.json`, all checked on 2026-10-12 against the pinned commit above. The
Silver build branches in every species base-stat file were checked for the
profile fields: type, gender ratio, and Egg Groups do not vary by version. The
New Pokédex order file has no Gold/Silver branch. The type matchup table is
shared. The trainer parties and leader list are also shared between these two
builds. Silver's held-item and sprite-dimension differences do not affect these
three collections.

`game.json`, `progression.json`, `locations.json`, and `capabilities.json` were
also reviewed against Silver map scripts, including the Silver-only Radio Tower
wing outcome. The remaining source sections below record the Silver-specific acquisition paths and mechanics. This source map does not permit copying Gold acquisition rules as Silver data.

In `maps/RadioTower5F.asm`, the Silver `checkver` branch gives the Silver Wing
after the Rocket executive and sets `EVENT_CLEARED_RADIO_TOWER`. The Kanto
Pewter script gives the Rainbow Wing in Silver. `constants/misc_constants.asm`
sets `GS_VERSION` to 1 for Silver; `engine/overworld/scripting.asm` returns it
from `checkver`. The Radio Tower milestone and separate wing capabilities
record those story gates. Lugia's chamber checks for the Silver Wing, and Ho-Oh's
Tin Tower roof checks for the Rainbow Wing.


## Wild tables reviewed on 2026-10-12

The wild source layer was reviewed against the Silver build at the pinned
revision. The main tables are `data/wild/johto_grass.asm`,
`data/wild/kanto_grass.asm`, `data/wild/johto_water.asm`,
`data/wild/kanto_water.asm`, and `data/wild/fish.asm`. The source review also
uses `data/wild/probabilities.asm` for the seven grass slot weights and three
Surf slot weights, plus `data/maps/maps.asm` for each map's fishing group.

Grass rows preserve morning, day, and night table slots. Surf rows preserve all
three table slots and the map's encounter rate. Fishing records preserve Old,
Good, and Super Rod table slots. `TimeFishGroups` selects day or night species
and levels. Their source requirements use the existing `daytime` and
`nighttime` capabilities. The rate in each fishing row is the difference
between the current and prior cumulative threshold in that rod table.

Tree sources join `data/wild/treemon_maps.asm` and `RockMonMaps` to the active Silver tables
in `data/wild/treemons.asm`. The four `RockMonMaps` locations use the
`rock-smash` method and capability, not Headbutt. Forest, Canyon, and Rock have selectable tables.
The engine ignores the `None`, `Unused`, and `City` sets. It chooses common or
rare table entries using the tree score; the maintained sources keep those
separate. The rates retain each table entry's weight.

`data/wild/bug_contest_mons.asm` has ten selectable entries. Its `-1` value
ends the table. The following `VENOMOTH, 30, 40` bytes are sentinel payload and
do not create a source. The data and test include only the ten rows above that
sentinel.

`data/wild/swarm_grass.asm` and `data/wild/swarm_water.asm` are read after
selecting `DEF(_SILVER)` branches. The engine switches to these tables only for
the reported swarm map. Fish swarms use the Qwilfish and Remoraid swarm table
pointers selected by `engine/events/fish.asm`.

`engine/overworld/wildmons.asm` releases the three level-40 beasts from Burned Tower after the player triggers
`EVENT_RELEASED_THE_BEASTS`. The maintained Silver records use one regional
Johto roaming location, fixed level 40, and `maxUses: 1`. They require the
`roaming-legendaries` capability, which follows the Burned Tower B1F release event. The event is reachable after Ecruteak access and does not require Morty. They do not
pretend that an initial route is a fixed capture location or assign a wild rate.

The full type matrix in Silver `type-chart.json` equals Emerald's matrix. Both
use the same 17 ordered types and every matchup cell is equal. The source table
is shared across the Silver and Gold builds; the prior claim that it differs
from Emerald was incorrect.



## Choices, items and non-wild sources reviewed on 2026-10-12

`choices.json` records Elm's one-of-three starter selection. `items.json`
records finite evolutionary item paths confirmed in the pinned scripts: the
four stones from Bill's grandfather after showing Oddish, Staryu, Growlithe or
Vulpix, or Pichu; the Bug-Catching Contest Sun Stone; the King's Rock in
Slowpoke Well; the Dragon Scale in Mt. Mortar; and the Metal Coat on the Fast
Ship. The item requirements preserve the shown-Pokémon and field-move gates. Moon Stone paths are recorded from Mt. Moon and Tohjo Falls. The Up-Grade comes from the Silph Co. officer in Saffron.

The non-wild source layer records the three starters, Togepi egg, Bill's Eevee,
Kenya the Spearow, Kiyo's Tyrogue, Goldenrod Game Corner Abra/Sandshrew/Dratini, Porygon from Celadon Game Corner,
all six native NPC trades, and the fixed Sudowoodo, Red Gyarados, Lapras, three
Electrode, Snorlax, Lugia and Ho-Oh encounters. Locations and story gates are
kept on each record. The relevant pinned locators are `maps/ElmsLab.asm`,
`maps/VioletPokecenter1F.asm`, `maps/BillsFamilysHouse.asm`,
`maps/Route35GoldenrodGate.asm`, `maps/MountMortarB1F.asm`,
`maps/GoldenrodGameCorner.asm`, `maps/GoldenrodGameCornerPrizeRoom.asm`,
`maps/UnionCaveB2F.asm`, `maps/BurnedTowerB1F.asm`,
`maps/LakeOfRage.asm`, `maps/TeamRocketBaseB1F.asm`,
`maps/TeamRocketBaseB2F.asm`, `maps/VermilionCity.asm`,
`maps/WhirlIslandLugiaChamber.asm`, `maps/TinTowerRoof.asm`,
`data/events/npc_trades.asm`, and `maps/*` trade scripts.

Breeding, evolution and exclusion records are now maintained. The evolution table is read from the pinned Generation II `EvosAttacks` table; trade evolution edges remain outside scope. Breeding uses the Day Care at Route 34, fixed hatch level 5, and the Generation II baby-species offspring rules. Celebi is excluded because its Generation II distribution is event-only.


## Breeding, evolution, exclusion and release gate review

The pinned `data/pokemon/evos_attacks.asm` table declares level, item, trade, friendship, time-of-day and Tyrogue stat evolution methods. Silver's data records the ordinary level, item, friendship, timed friendship and Tyrogue stat outcomes. Link-trade evolution is outside acquisition scope. The no-item Moon Stone evolution uses reviewed Moon Stone acquisition paths in Mt. Moon and Tohjo Falls. `constants/battle_constants.asm` sets `EGG_LEVEL` to 5. `engine/pokemon/breeding.asm` rejects Undiscovered egg groups, permits compatible egg groups, and treats Ditto as a partner for every non-Undiscovered species. The Day Care selects the mother, applies `GetPreEvolution` twice, and hatches at level 5. Nidoran-F can produce either Nidoran species. Baby offspring also follow the Generation II lines: Pichu, Cleffa, Igglybuff, Togepi, Tyrogue, Smoochum, Elekid and Magby.

`maps/BurnedTowerB1F.asm` runs `ReleaseTheBeasts` from the B1F coordinate event. The script sets `EVENT_RELEASED_THE_BEASTS` and calls `InitRoamMons`. Its event does not check Morty's defeat. The `beasts-released` milestone follows Ecruteak access and gates the roaming capability. Each beast has one level-40 roaming source with one use.
