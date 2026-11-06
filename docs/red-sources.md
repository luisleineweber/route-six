# Pokémon Red source review

Scope: the international English Pokémon Red release, with native captures,
events, and ordinary postgame access. Player trades and externally distributed
events are outside this review.

Pinned source: [`pret/pokered`](https://github.com/pret/pokered), commit
`af519899719f0754965776faac0e836a3b906e6d` (reviewed 2026-10-12). The source
repository is a disassembly of Pokémon Red/Blue. Red-specific choices and
version differences must be checked in its scripts and wild encounter files.

The following locators define the manual review source for all thirteen game
collections. These are source locators, not data imports.

```json
[
  {"id":"red-species","title":"Pokémon Red species stats, types, and Pokédex order","locator":"data/pokemon/base_stats.asm; data/pokemon/dex_order.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/pokemon","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-game","title":"Pokémon Red version scope and game rules","locator":"README.md; constants/pokemon_constants.asm; data/maps/headers","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-type-chart","title":"Generation I type IDs and effectiveness rules","locator":"constants/type_constants.asm; data/types/type_matchups.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/types","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-progression","title":"Story events, badge flags, and map progression","locator":"data/maps/objects; data/maps/scripts; constants/event_constants.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/maps","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-bosses","title":"Gym, Elite Four, and Champion parties","locator":"data/trainers/parties.asm; data/trainers/names.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/trainers","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-locations","title":"Map identities and access scripts","locator":"data/maps/headers; data/maps/objects; data/maps/scripts; data/maps/blocks/Route2.blk; gfx/blocksets/overworld.bst; gfx/overworld.png","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/maps","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-capabilities","title":"Field moves, badges, and overworld access checks","locator":"data/maps/scripts; engine/events; data/items/use_overworld.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/engine/events","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-items","title":"Item pickups, marts, key items, and fossils","locator":"data/items; data/events/hidden_item_coords.asm; data/maps/objects","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/items","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-choices","title":"Starter, Eevee, dojo, fossil, and Game Corner choices","locator":"data/maps/scripts; data/events/prizes.asm; data/events/prize_mon_levels.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/events","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-encounters","title":"Pokémon Red encounter, gift, prize, and NPC trade sources","locator":"data/wild/grass_water.asm; data/wild/probabilities.asm; data/wild/good_rod.asm; data/wild/super_rod.asm; data/wild/maps; data/events/trades.asm; data/events/prizes.asm; data/events/prize_mon_levels.asm; data/maps/objects/PowerPlant.asm; scripts/PowerPlant.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/wild","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-breeding","title":"Breeding support check","locator":"No breeding system exists in Generation I; reviewed against the Red/Blue game source","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-evolutions","title":"Level and item evolution data","locator":"data/pokemon/evos_moves.asm; constants/item_constants.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/pokemon","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-exclusions","title":"Version exclusives and external Mew distribution","locator":"data/wild/maps; data/maps/scripts; data/pokemon/mew.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data","revision":"af519899719f0754965776faac0e836a3b906e6d"}
]
```

## Review notes

- I checked all 151 `data/pokemon/base_stats/*.asm` type records at the pinned
  revision against Red's profiles. The profile types match those records.
- I compared all 225 cells in the maintained type chart with the source's 82
  explicit effectiveness records. Every unlisted attack/defender pair is
  neutral in the source table and is explicit as `1` in the maintained matrix.
- The source uses Red and Blue conditionals. Do not treat a Blue-only encounter
  as a Red source.
- Generation I has no gender, Egg Groups, or breeding. Profiles and sources use
  the schema's `not-applicable` gender value. This says the mechanic does not
  exist in Red; it does not say a species is genderless.
- Generation I has 15 types. Dark and Steel did not exist. The type chart must
  use the 15 active types and the Generation I effectiveness rules.
- Red can obtain species through one-time gifts, fossils, dojo and starter
  choices, Game Corner prizes, and nine used NPC trades. These finite and conditional
  sources need exact one-playthrough limits.
- Abra, Machoke, Graveler, and Haunter evolve by player trade. The requested
  scope excludes player trades. Keep their species profiles and mark their
  evolution paths as blocked by the current trade rule.
- The source trade table lists ten trades, but the Butterfree-for-Beedrill entry
  is unused. The nine used trades are identified in `data/events/trades.asm`.
- Mew is supported by the game but requires an external distribution for normal
  access. Do not count glitch-based encounters as native acquisition.
- The source contains 72 evolution rows: 69 level or stone evolutions and three
  player-trade evolutions. The maintained table contains all 72 source rows.
- Red's prize table has Abra (level 9), Clefairy (8), and Nidorina (17), then
  Dratini (18), Scyther (25), and Porygon (26). The Red prize list does not
  include Pinsir. The source model records prizes as repeatable static access.
- The planner does not track coins. A Game Corner prize is available after the
  player reaches the Game Corner. This coverage does not model the coin cost.
- Red grass `ratePercent` values are combined slot weights for each
  species. `data/wild/probabilities.asm` assigns weights
  `[51,51,39,25,25,25,13,13,11,3]` over 256. Percentages round to
  one decimal place. Surf tables use 100% for the listed species. Rod
  tables use equal choices from the pinned rod group.
- The manual Red encounter review covers all 55 grass tables in
  `data/wild/maps`, the SeaRoutes and Route 21 water tables, 25 Good
  Rod opportunities, 25 Old Rod opportunities, and all 80 Super Rod
  map-group entries. Source IDs retain each grass map or floor table, so
  levels and weights remain separate.

## Proposed shared reference records

The parent agent can merge this JSON array into `data/references.json` after the
data review. This game task does not edit that shared file.

```json
[
  {"id":"red-species","title":"Pokémon Red species stats, types, and Pokédex order","locator":"data/pokemon/base_stats.asm; data/pokemon/dex_order.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/pokemon","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-game","title":"Pokémon Red version scope and game rules","locator":"README.md; constants/pokemon_constants.asm; data/maps/headers","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-type-chart","title":"Generation I type IDs and effectiveness rules","locator":"constants/type_constants.asm; data/types/type_matchups.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/types","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-progression","title":"Story events, badge flags, and map progression","locator":"data/maps/objects; data/maps/scripts; constants/event_constants.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/maps","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-bosses","title":"Gym, Elite Four, and Champion parties","locator":"data/trainers/parties.asm; data/trainers/names.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/trainers","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-locations","title":"Map identities and access scripts","locator":"data/maps/headers; data/maps/objects; data/maps/scripts; data/maps/blocks/Route2.blk; gfx/blocksets/overworld.bst; gfx/overworld.png","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/maps","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-capabilities","title":"Field moves, badges, and overworld access checks","locator":"data/maps/scripts; engine/events; data/items/use_overworld.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/engine/events","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-items","title":"Item pickups, marts, key items, and fossils","locator":"data/items; data/events/hidden_item_coords.asm; data/maps/objects","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/items","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-choices","title":"Starter, Eevee, dojo, fossil, and Game Corner choices","locator":"data/maps/scripts; data/events/prizes.asm; data/events/prize_mon_levels.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/events","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-encounters","title":"Pokémon Red encounter, gift, prize, and NPC trade sources","locator":"data/wild/grass_water.asm; data/wild/probabilities.asm; data/wild/good_rod.asm; data/wild/super_rod.asm; data/wild/maps; data/events/trades.asm; data/events/prizes.asm; data/events/prize_mon_levels.asm; data/maps/objects/PowerPlant.asm; scripts/PowerPlant.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/wild","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-breeding","title":"Breeding support check","locator":"No breeding system exists in Generation I; reviewed against the Red/Blue game source","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-evolutions","title":"Level and item evolution data","locator":"data/pokemon/evos_moves.asm; constants/item_constants.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/pokemon","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"red-exclusions","title":"Version exclusives and external Mew distribution","locator":"data/wild/maps; data/maps/scripts; data/pokemon/mew.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data","revision":"af519899719f0754965776faac0e836a3b906e6d"}
]
```

## Additional path and item checks

The pinned source also supports these reviewed details:

- `scripts/Route2Gate.asm` checks for ten caught species. Ten distinct
  species are directly catchable by the Viridian Forest visit, but the
  aide is not reachable then. `Route2.asm` places the aide gate at
  (16,35), Diglett entrance at (12,9), and forest gates at (3,11) and
  (3,43). The reviewed map blocks ordinary walking between these points
  without Cut. The optional `hm05-aide-reward` event follows the S.S.
  Anne story and the Cut path to Route 2. It records the ten-species
  reward without modeling a live Pokedex counter. Flash requires the
  Boulder Badge for field use. Rock Tunnel requires Cut for physical
  access; Flash only improves visibility.
- `scripts/VermilionOldRodHouse.asm` gives the Old Rod in Vermilion before Misty. `scripts/FuchsiaGoodRodHouse.asm` gives the Good Rod in Fuchsia. `scripts/Route12SuperRodHouse.asm` gives the Super Rod at Route 12. The modeled house access includes the northern path after Mr. Fuji and the Poké Flute and the southern path through Fuchsia. Rod encounter species use the map groups in `data/wild/super_rod.asm` and the table in `data/wild/good_rod.asm`.
- Red has five one-use Moon Stone pickups: two in Mt. Moon, one on Route 2, one in Rocket Hideout, and one in Pokémon Mansion. Each pickup has its own item source and limit.
- Route 6 and Route 9 encounter rows were checked in `data/wild/maps/Route6.asm` and `Route9.asm`. Route 6 is accessible from Cerulean before Misty. Route 9 and Rock Tunnel need Cut after the S.S. Anne and before Lt. Surge. Gym checkpoint order does not make Lt. Surge a physical Route 9 prerequisite.
- The Lickitung trade is inside the Route 18 Gate. It needs the offered Slowbro and access to Fuchsia and the Bicycle. The optional Route 18 visit milestone is not a trade gate.
